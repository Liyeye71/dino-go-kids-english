import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(root, "app");
const distDir = path.join(root, "dist");
const iconsDir = path.join(appDir, "data", "images", "icons");
const themeDir = path.join(appDir, "data", "theme");

// index.html 是资源清单的唯一事实源：样式与脚本顺序都从页面标签解析，避免两处维护
const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");
const CSS_FILES = [...html.matchAll(/<link rel="stylesheet" href="css\/([\w./-]+)\.css">/g)].map((m) => m[1]);
const JS_FILES = [...html.matchAll(/<script src="([\w./-]+\.js)(?:\?v=\d+)?"><\/script>/g)].map((m) => m[1]);
// 主题目录中存在但未在 index.html 引用的脚本直接报错，避免新增主题被静默漏打包
for (const file of fs.readdirSync(themeDir).filter((f) => f.endsWith(".js") && f !== "index.js")) {
  if (!JS_FILES.includes(`data/theme/${file}`)) {
    throw new Error(`build.mjs: index.html 中找不到 <script src="data/theme/${file}"> 标签`);
  }
}
const css = CSS_FILES.map((name) => fs.readFileSync(path.join(appDir, "css", `${name}.css`), "utf8")).join("\n");
let inlined = html.replace(/\n\s*<link rel="stylesheet" href="css\/(?:[\w.-]+\/)*[\w.-]+\.css">/g, "");
inlined = inlined.replace("</head>", () => `  <style>\n${css}\n  </style>\n</head>`);
for (const file of JS_FILES) {
  const src = fs.readFileSync(path.join(appDir, file), "utf8").replace(/<\/script>/gi, "<\\/script>");
  /* 兼容开发版 index.html 的缓存版本参数（?v=N）：内联时一并替换 */
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = new RegExp(`<script src="${escaped}(\\?v=\\d+)?"></script>`);
  if (!tag.test(inlined)) throw new Error(`build.mjs: index.html 中找不到 <script src="${file}"> 标签`);
  inlined = inlined.replace(tag, () => `<script>\n${src}\n</script>`);
}

// ---- PWA build (dist/ only, GitHub Actions 自动部署到 Pages) -------
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
// 清理 dist 旧产物（保留 .git）
for (const e of fs.readdirSync(distDir)) {
  if (e === ".git") continue;
  fs.rmSync(path.join(distDir, e), { recursive: true, force: true });
}
fs.mkdirSync(path.join(distDir, "data", "icons"), { recursive: true });
fs.writeFileSync(path.join(distDir, "index.html"), inlined);
for (const file of ["manifest.webmanifest", "sw.js"]) {
  fs.copyFileSync(path.join(appDir, file), path.join(distDir, file));
}
for (const file of fs.readdirSync(iconsDir)) {
  fs.copyFileSync(path.join(iconsDir, file), path.join(distDir, "data", "icons", file));
}
/* 动作猜猜拟声音效：仅在点击喇叭时播放 */
const actionSoundDir = path.join(appDir, "data", "sounds", "action");
if (fs.existsSync(actionSoundDir)) {
  const outDir = path.join(distDir, "data", "sounds", "action");
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(actionSoundDir).filter((f) => /\.wav$/i.test(f))) {
    fs.copyFileSync(path.join(actionSoundDir, file), path.join(outDir, file));
  }
}
/* 恐龙素材：源文件放在 app/data/images/material/dino/（.webp 供页面使用） */
const dinoDir = path.join(appDir, "data", "images", "material", "dino");
if (fs.existsSync(dinoDir)) {
  fs.mkdirSync(path.join(distDir, "images", "dino"), { recursive: true });
  for (const file of fs.readdirSync(dinoDir).filter((f) => f.endsWith(".webp"))) {
    fs.copyFileSync(path.join(dinoDir, file), path.join(distDir, "images", "dino", file));
  }
}
/* 场景背景：源文件放在 app/data/images/material/background/ */
const bgDir = path.join(appDir, "data", "images", "material", "background");
if (fs.existsSync(bgDir)) {
  fs.mkdirSync(path.join(distDir, "images", "background"), { recursive: true });
  for (const file of fs.readdirSync(bgDir).filter((f) => f.endsWith(".webp"))) {
    fs.copyFileSync(path.join(bgDir, file), path.join(distDir, "images", "background", file));
  }
}
/* 单词插画：源文件放在 app/data/images/material/words/，支持 png / webp，缺图回退 emoji */
const wordImgDir = path.join(appDir, "data", "images", "material", "words");
if (fs.existsSync(wordImgDir)) {
  fs.mkdirSync(path.join(distDir, "images", "words"), { recursive: true });
  for (const file of fs.readdirSync(wordImgDir).filter((f) => /\.(png|webp)$/i.test(f))) {
    fs.copyFileSync(path.join(wordImgDir, file), path.join(distDir, "images", "words", file));
  }
}
/* 分类单词插画：按目录分组复制到 dist 对应子目录 */
for (const group of ["animal", "food", "action", "transport", "tool"]) {
  const srcDir = path.join(wordImgDir, group);
  if (!fs.existsSync(srcDir)) continue;
  const outDir = path.join(distDir, "images", "words", group);
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir).filter((f) => /\.(png|webp)$/i.test(f))) {
    fs.copyFileSync(path.join(srcDir, file), path.join(outDir, file));
  }
}
/* 字体资源：app/font/ 下的 ttf/otf 统一复制到 dist/font/ */
const fontDir = path.join(appDir, "font");
if (fs.existsSync(fontDir)) {
  const out = path.join(distDir, "font");
  fs.mkdirSync(out, { recursive: true });
  for (const file of fs.readdirSync(fontDir).filter((f) => /\.(ttf|otf|woff2?|eot)$/i.test(f))) {
    fs.copyFileSync(path.join(fontDir, file), path.join(out, file));
  }
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";
console.log("dist/index.html   " + kb(fs.statSync(path.join(distDir, "index.html")).size));
