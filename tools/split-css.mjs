// 从下载的 HTML 模板中按注释切割 CSS，写入 app/css/*.css
// 运行：node tools/split-css.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const TEMPLATE = "C:\\Users\\TangHao\\Downloads\\DinoGo_index_v4_carousel (1).html";
const CSS_DIR = path.join(root, "app", "css");

if (!fs.existsSync(TEMPLATE)) {
  console.error("模板不存在:", TEMPLATE);
  process.exit(1);
}

const html = fs.readFileSync(TEMPLATE, "utf8");
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = styleMatch[1];

// 找所有分节注释的起止位置
const sepRe = /\/\* ={10,}[\s\S]*?\*\//g;
const headers = [];
let m;
while ((m = sepRe.exec(css)) !== null) {
  headers.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
}

// 组装 sections: { headerText, bodyText }
const sections = [];
for (let i = 0; i < headers.length; i++) {
  const h = headers[i];
  const bodyStart = h.end;
  const bodyEnd = i + 1 < headers.length ? headers[i + 1].start : css.length;
  sections.push({
    header: h.text.trim(),
    body: css.slice(bodyStart, bodyEnd).trim(),
  });
}
// 第一个 header 之前的残留（@font-face 等）塞到第一段 body 前
if (headers.length && headers[0].start > 0) {
  const pre = css.slice(0, headers[0].start).trim();
  if (pre) sections[0].body = pre + "\n\n" + sections[0].body;
}

// 从 header 里取第一行有意义的文字（跳过 === 线、/* ===、=== */）
function getTitle(header) {
  const lines = header.split("\n").map((l) => l.trim());
  for (const l of lines) {
    // 去掉包裹的 /* 和 */
    const clean = l.replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "");
    // 跳过全是 === 的行
    if (clean && !/^=+$/.test(clean)) return clean;
  }
  return "(untitled)";
}

// ==== 映射表 ====
const fileMap = [
  { file: "base.css",   keys: ["interactive iOS / iPad app"] },
  { file: "home.css",   keys: ["home："] },
  { file: "map.css",    keys: ["map：", "Zoo 场景入口", "Zoo 路线弹框", "旅程进度条上的宝箱", "浮空岛视觉"] },
  { file: "quiz.css",   keys: ["答题页："] },
  { file: "result.css", keys: ["闯关结算与恐龙进化", "🎲 每日随机挑战结算"] },
  { file: "quiz-types.css", keys: ["扩展题型", "参考题型", "🔥 BOSS 关专属样式"] },
  { file: "game.css",   keys: ["喇叭按钮"] },
  { file: "dex.css",    keys: ["dex："] },
  { file: "collect.css", keys: ["collect："] },
  { file: "overlays.css", keys: ["overlays：", "★ Dingo 恐龙转盘"] },
  { file: "theme/zoo.css", keys: ["zoo 主题："] },
  { file: "responsive.css", keys: ["responsive：", "答题页统一版式", "动物园答题页主题", "Logo：", "词汇拼图：提示框", "启蒙模式", "动物园答题页：石子路", "UI 整站重构"] },
];

function assignFile(title) {
  for (const f of fileMap) {
    for (const k of f.keys) if (title.includes(k)) return f.file;
  }
  return "game.css";
}

// 打印所有节标题，先确认映射对不对
console.log("======== 全部 CSS 分节标题 ========\n");
sections.forEach((s, i) => {
  const title = getTitle(s.header);
  const target = assignFile(title);
  console.log(`${String(i + 1).padStart(2)}. [→ ${target.padEnd(15)}] ${title}`);
});

// 收集并写入
console.log("\n======== 写入文件 ========\n");
const buckets = {};
for (const f of fileMap) buckets[f.file] = [];
buckets["game.css"] = buckets["game.css"] || [];

for (const sec of sections) {
  const title = getTitle(sec.header);
  const target = assignFile(title);
  buckets[target].push({ title, text: sec.header + "\n\n" + sec.body });
}

let ok = 0, empty = 0;
for (const f of fileMap) {
  const list = buckets[f.file];
  if (!list || !list.length) {
    console.log(`⚠️  ${f.file}: 0 节 (保持原样)`);
    empty++;
    continue;
  }
  const content = list.map((s) => s.text.trim()).join("\n\n");
  const outPath = path.join(CSS_DIR, f.file);
  fs.writeFileSync(outPath, content + "\n", "utf8");
  const lines = content.split("\n").length;
  console.log(`✅ ${f.file}: ${list.length} 节 / ${lines} 行`);
  list.forEach((s) => console.log(`    └─ ${s.title}`));
  ok++;
}

// game.css 兜底
if (buckets["game.css"] && buckets["game.css"].length) {
  // 已在上面写入
} else if (empty > 0) {
  // 什么都没进 game.css，再看看有没有节被 map 漏掉
}

console.log(`\n完成：${ok} 个文件写入，${empty} 个文件无匹配节`);
console.log("下一步: node build.mjs 验证打包");
