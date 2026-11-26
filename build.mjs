import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* ============================================================
   PWA 构建：app/ → dist/
   1. 解析 index.html 得到 CSS / JS 加载顺序（唯一事实源）
   2. 把 CSS / JS 内联进单文件 index.html
   3. 汇总全部待产出文件（页面、图标、音效、素材、字体）
   4. 增量写入：内容未变则跳过，并按清单清理 dist 中的旧文件
   不再整目录删除 dist，避免编辑器与预览服务的文件监听报错
   ============================================================ */

const root = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(root, "app");
const distDir = path.join(root, "dist");
const themeDir = path.join(appDir, "data", "theme");

/* ---------------- 1. 页面清单 ---------------- */
function readPageManifest() {
  const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");
  const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="css\/([\w./-]+)\.css">/g)]
    .map((m) => m[1]);
  const jsFiles = [...html.matchAll(/<script src="([\w./-]+\.js)(?:\?v=\d+)?"><\/script>/g)]
    .map((m) => m[1]);
  if (!cssFiles.length) throw new Error("build.mjs: index.html 中没有找到任何样式引用");
  if (!jsFiles.length) throw new Error("build.mjs: index.html 中没有找到任何脚本引用");

  /* 主题目录中存在但未在 index.html 引用的脚本直接报错，避免新增主题被静默漏打包 */
  for (const file of fs.readdirSync(themeDir).filter((f) => f.endsWith(".js") && f !== "index.js")) {
    if (!jsFiles.includes(`data/theme/${file}`)) {
      throw new Error(`build.mjs: index.html 中找不到 <script src="data/theme/${file}"> 标签`);
    }
  }
  return { html, cssFiles, jsFiles };
}

/* ---------------- 2. 内联 CSS / JS ---------------- */
function inlineAssets({ html, cssFiles, jsFiles }) {
  const css = cssFiles
    .map((name) => fs.readFileSync(path.join(appDir, "css", `${name}.css`), "utf8"))
    .join("\n");
  let inlined = html.replace(/\n\s*<link rel="stylesheet" href="css\/(?:[\w.-]+\/)*[\w.-]+\.css">/g, "");
  inlined = inlined.replace("</head>", () => `  <style>\n${css}\n  </style>\n</head>`);

  for (const file of jsFiles) {
    const src = fs.readFileSync(path.join(appDir, file), "utf8").replace(/<\/script>/gi, "<\\/script>");
    /* 兼容开发版 index.html 的缓存版本参数（?v=N）：内联时一并替换 */
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tag = new RegExp(`<script src="${escaped}(\\?v=\\d+)?"></script>`);
    if (!tag.test(inlined)) throw new Error(`build.mjs: index.html 中找不到 <script src="${file}"> 标签`);
    inlined = inlined.replace(tag, () => `<script>\n${src}\n</script>`);
  }
  return inlined;
}

/* ---------------- 3. 产物清单 ---------------- */
/* outputs: Map<dist 相对路径, { file: 源文件绝对路径 } | { text: 直接写入的文本 }> */
function collectFiles(outputs, srcDir, destDir, accept) {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isFile() || !accept(entry.name)) continue;
    outputs.set(`${destDir}/${entry.name}`, { file: path.join(srcDir, entry.name) });
  }
}

function collectOutputs(inlinedHtml) {
  const outputs = new Map();
  outputs.set("index.html", { text: inlinedHtml });
  for (const file of ["manifest.webmanifest", "sw.js"]) {
    outputs.set(file, { file: path.join(appDir, file) });
  }

  const materialDir = path.join(appDir, "data", "images", "material");
  /* 图标：目录内文件全部保留 */
  collectFiles(outputs, path.join(appDir, "data", "images", "icons"), "data/icons", () => true);
  /* 动作猜猜拟声音效：仅在点击喇叭时播放 */
  collectFiles(outputs, path.join(appDir, "data", "sounds", "action"), "data/sounds/action", (f) => /\.wav$/i.test(f));
  /* 恐龙素材、场景背景：仅拷贝 webp */
  collectFiles(outputs, path.join(materialDir, "dino"), "images/dino", (f) => f.endsWith(".webp"));
  collectFiles(outputs, path.join(materialDir, "background"), "images/background", (f) => f.endsWith(".webp"));

  /* 单词插画：根目录 + 各分类子目录，支持 png / webp，缺图回退 emoji
     子目录自动发现，新增素材分类无需再改构建脚本 */
  const wordImgDir = path.join(materialDir, "words");
  const isImage = (f) => /\.(png|webp)$/i.test(f);
  collectFiles(outputs, wordImgDir, "images/words", isImage);
  if (fs.existsSync(wordImgDir)) {
    for (const entry of fs.readdirSync(wordImgDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      collectFiles(outputs, path.join(wordImgDir, entry.name), `images/words/${entry.name}`, isImage);
    }
  }

  /* 字体资源：app/font/ 下的字体统一复制到 dist/font/ */
  collectFiles(outputs, path.join(appDir, "font"), "font", (f) => /\.(ttf|otf|woff2?|eot)$/i.test(f));
  return outputs;
}

/* ---------------- 4. 增量写入 ---------------- */
/* 源文件与产物大小一致且产物不旧于源文件时视为未变化 */
function isUpToDate(srcFile, destFile) {
  try {
    const src = fs.statSync(srcFile);
    const dest = fs.statSync(destFile);
    return src.size === dest.size && dest.mtimeMs >= src.mtimeMs;
  } catch (e) {
    return false;
  }
}

function writeOutputs(outputs) {
  let written = 0;
  let skipped = 0;
  for (const [rel, item] of outputs) {
    const destFile = path.join(distDir, rel);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    if (item.text !== undefined) {
      const prev = fs.existsSync(destFile) ? fs.readFileSync(destFile, "utf8") : null;
      if (prev === item.text) { skipped += 1; continue; }
      fs.writeFileSync(destFile, item.text);
      written += 1;
      continue;
    }
    if (isUpToDate(item.file, destFile)) { skipped += 1; continue; }
    fs.copyFileSync(item.file, destFile);
    written += 1;
  }
  return { written, skipped };
}

/* ---------------- 5. 清理旧产物 ---------------- */
/* 只删除不在本次清单中的文件，并回收空目录；dist 本身与 .git 不处理 */
function pruneStale(outputs) {
  if (!fs.existsSync(distDir)) return [];
  const keep = new Set(outputs.keys());
  const removed = [];

  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!prefix && entry.name === ".git") continue;
      const abs = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(abs, rel);
        if (!fs.readdirSync(abs).length) {
          fs.rmdirSync(abs);
          removed.push(`${rel}/`);
        }
      } else if (!keep.has(rel)) {
        fs.unlinkSync(abs);
        removed.push(rel);
      }
    }
  };
  walk(distDir, "");
  return removed;
}

/* ---------------- 执行 ---------------- */
const inlined = inlineAssets(readPageManifest());
const outputs = collectOutputs(inlined);
fs.mkdirSync(distDir, { recursive: true });
const { written, skipped } = writeOutputs(outputs);
const removed = pruneStale(outputs);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const indexSize = fs.statSync(path.join(distDir, "index.html")).size;
console.log(`dist/index.html   ${kb(indexSize)}`);
console.log(`文件 ${outputs.size} 个：更新 ${written}，未变 ${skipped}，清理 ${removed.length}`);
for (const rel of removed) console.log(`  - ${rel}`);
