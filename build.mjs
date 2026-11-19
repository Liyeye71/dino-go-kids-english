import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(root, "app");
const distDir = path.join(root, "dist");
const iconsDir = path.join(appDir, "data", "images", "icons");
const themeDir = path.join(appDir, "data", "theme");

// 主题加载顺序：新增主题放入该目录后重新构建即可自动加入。
const themeOrder = ["go.js", "animal.js", "school.js"];
const themeFiles = fs.readdirSync(themeDir)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .sort((a, b) => {
    const ai = themeOrder.indexOf(a), bi = themeOrder.indexOf(b);
    return (ai < 0 ? themeOrder.length : ai) - (bi < 0 ? themeOrder.length : bi) || a.localeCompare(b);
  });

// 依次内联拆分后的样式，顺序必须与 index.html 一致（responsive 放最后）
const CSS_FILES = ["base", "home", "map", "quiz", "result", "quiz-types", "game", "dex", "collect", "overlays", "responsive"];
const css = CSS_FILES.map((name) => fs.readFileSync(path.join(appDir, "css", `${name}.css`), "utf8")).join("\n");
const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");

// 依次内联主题词汇 + 声音模块 + core + 四个 Tab 文件，顺序必须与 index.html 一致
const JS_FILES = [
  "data/words/noun.js", "data/words/verb.js", "data/words/adj.js", "data/words/adv.js",
  "data/words/pron.js", "data/words/prep.js", "data/words/conj.js", "data/words/interj.js", "data/words/num.js",
  "data/words/rule/basic.js", "data/words/rule/advance.js", "data/words/rule/pro.js",
  "data/game/shared.js", "data/game/dynamic-engine.js",
  ...themeFiles.map((f) => `data/theme/${f}`),
  "data/sounds/sfx.js",
  "frame/core/utils.js", "frame/core/visual.js", "frame/core/data.js", "frame/core/words.js",
  "frame/core/state.js", "frame/core/ui.js", "frame/core/events.js", "frame/core/boot.js",
  "data/game/wrongbank.js", "data/game/chest.js", "data/game/result.js",
  "data/game/main.js", "data/game/quiz-view.js",
  "frame/home.js", "frame/map.js", "frame/dex.js", "frame/collect.js",
];
let inlined = html.replace(/\n\s*<link rel="stylesheet" href="css\/[\w.-]+\.css">/g, "");
inlined = inlined.replace("</head>", () => `  <style>\n${css}\n  </style>\n</head>`);
for (const file of JS_FILES) {
  const src = fs.readFileSync(path.join(appDir, file), "utf8").replace(/<\/script>/gi, "<\\/script>");
  inlined = inlined.replace(`<script src="${file}"></script>`, () => `<script>\n${src}\n</script>`);
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
/* 分类单词插画：动物素材放在 words/animal/ 下 */
const animalWordDir = path.join(wordImgDir, "animal");
if (fs.existsSync(animalWordDir)) {
  fs.mkdirSync(path.join(distDir, "images", "words", "animal"), { recursive: true });
  for (const file of fs.readdirSync(animalWordDir).filter((f) => f.endsWith(".webp"))) {
    fs.copyFileSync(path.join(animalWordDir, file), path.join(distDir, "images", "words", "animal", file));
  }
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";
console.log("dist/index.html   " + kb(fs.statSync(path.join(distDir, "index.html")).size));
