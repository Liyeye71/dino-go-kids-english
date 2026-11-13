import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(root, "app");
const distDir = path.join(root, "dist");
const iconsDir = path.join(appDir, "data", "images", "icons");
const themeDir = path.join(appDir, "data", "level", "theme");

// 主题加载顺序：新增主题放入该目录后重新构建即可自动加入。
const themeOrder = ["travel.js", "animal.js", "food.js"];
const themeFiles = fs.readdirSync(themeDir)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .sort((a, b) => {
    const ai = themeOrder.indexOf(a), bi = themeOrder.indexOf(b);
    return (ai < 0 ? themeOrder.length : ai) - (bi < 0 ? themeOrder.length : bi) || a.localeCompare(b);
  });

// 依次内联拆分后的样式，顺序必须与 index.html 一致（responsive 放最后）
const CSS_FILES = ["base", "home", "map", "game", "dex", "shop", "overlays", "responsive"];
const css = CSS_FILES.map((name) => fs.readFileSync(path.join(appDir, "css", `${name}.css`), "utf8")).join("\n");
const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");

// 依次内联主题词汇 + 声音模块 + core + 四个 Tab 文件，顺序必须与 index.html 一致
const JS_FILES = [
  "data/words/noun.js", "data/words/verb.js", "data/words/adj.js", "data/words/adv.js",
  "data/words/pron.js", "data/words/prep.js", "data/words/conj.js", "data/words/interj.js", "data/words/num.js",
  "data/words/rule/basic.js", "data/words/rule/advance.js", "data/words/rule/pro.js",
  "data/level/_shared.js",
  ...themeFiles.map((f) => `data/level/theme/${f}`),
  "data/sounds/sfx.js", "data/sounds/bgm.js",
  "frame/core/utils.js", "frame/core/visual.js", "frame/core/data.js", "frame/core/words.js",
  "frame/core/state.js", "frame/core/ui.js", "frame/core/events.js", "frame/core/boot.js",
  "data/level/game.js",
  "frame/home.js", "frame/map.js", "frame/dex.js", "frame/shop.js",
];
let inlined = html.replace(/\n\s*<link rel="stylesheet" href="css\/[\w.-]+\.css">/g, "");
inlined = inlined.replace("</head>", () => `  <style>\n${css}\n  </style>\n</head>`);
for (const file of JS_FILES) {
  const src = fs.readFileSync(path.join(appDir, file), "utf8").replace(/<\/script>/gi, "<\\/script>");
  inlined = inlined.replace(`<script src="${file}"></script>`, () => `<script>\n${src}\n</script>`);
}

// ---- PWA build (dist/ + 根目录，供 GitHub Pages branch root 使用) -------
const KEEP_AT_ROOT = new Set([
  ".git", ".github", ".screenshots", ".trae-html-share-packages", "app", "dist", "node_modules", "preview", "picture", "temp",
  ".gitignore", "README.md", "build.mjs", "serve.mjs", "package.json",
]);
for (const target of [distDir, root]) {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  const keep = target === distDir ? [".git"] : [...KEEP_AT_ROOT];
  for (const e of fs.readdirSync(target)) {
    if (keep.includes(e)) continue;
    fs.rmSync(path.join(target, e), { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(target, "images", "icons"), { recursive: true });
  fs.writeFileSync(path.join(target, "index.html"), inlined);
  for (const file of ["manifest.webmanifest", "sw.js"]) {
    fs.copyFileSync(path.join(appDir, file), path.join(target, file));
  }
  for (const file of ["icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"]) {
    fs.copyFileSync(path.join(iconsDir, file), path.join(target, "images", "icons", file));
  }
  const pictureDir = path.join(root, "picture");
  if (target !== root && fs.existsSync(pictureDir)) {
    fs.cpSync(pictureDir, path.join(target, "picture"), { recursive: true });
  }
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";
console.log("dist/index.html   " + kb(fs.statSync(path.join(distDir, "index.html")).size));
