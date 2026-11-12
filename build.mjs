import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(root, "app");
const distDir = path.join(root, "dist");
const iconsDir = path.join(appDir, "images", "icons");

// 依次内联拆分后的样式，顺序必须与 index.html 一致（responsive 放最后）
const CSS_FILES = ["base", "home", "map", "dex", "shop", "overlays", "responsive"];
const css = CSS_FILES.map((name) => fs.readFileSync(path.join(appDir, "css", `${name}.css`), "utf8")).join("\n");
const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");

// 依次内联主题词汇 + 声音模块 + core + 四个 Tab 文件，顺序必须与 index.html 一致
const JS_FILES = [
  "words/fruits.js", "words/cars.js", "words/zoo.js", "words/food.js",
  "sounds/sfx.js", "sounds/bgm.js",
  "js/core.js", "js/home.js", "js/map.js", "js/dex.js", "js/shop.js",
];
let inlined = html.replace(/(?:\n\s*<link rel="stylesheet" href="css\/[\w.-]+\.css">)+/, () => `\n  <style>\n${css}\n  </style>`);
for (const file of JS_FILES) {
  const src = fs.readFileSync(path.join(appDir, file), "utf8").replace(/<\/script>/gi, "<\\/script>");
  inlined = inlined.replace(`<script src="${file}"></script>`, () => `<script>\n${src}\n</script>`);
}

// ---- PWA build (dist/ + 根目录，供 GitHub Pages branch root 使用) -------
const KEEP_AT_ROOT = new Set([
  ".git", ".github", "app", "dist", "node_modules", "preview",
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
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";
console.log("dist/index.html   " + kb(fs.statSync(path.join(distDir, "index.html")).size));
