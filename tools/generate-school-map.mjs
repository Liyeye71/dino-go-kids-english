import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/* ============================================================
   DinoGo · 生成「上学文具岛」20 关自定义路线底图（1505×1045 webp）
   节点坐标与 app/data/theme/school.js 的 SCHOOL_CAMPUS_NODES 一一对应
   ============================================================ */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "app", "data", "images", "material", "background", "school-campus-map.webp");

const W = 1505;
const H = 1045;

/* 20 关 S 形校园探索路线（百分比坐标） */
export const SCHOOL_CAMPUS_NODES = [
  /* 第 1 阶段：校门与教室区（1~5，左下 → 右下） */
  { x: 14, y: 86 }, /* 1 */
  { x: 28, y: 84 }, /* 2 */
  { x: 43, y: 87 }, /* 3 */
  { x: 59, y: 84 }, /* 4 */
  { x: 75, y: 81 }, /* 5 BOSS */
  /* 第 2 阶段：美工画室区（6~10，右中 → 左中） */
  { x: 84, y: 68 }, /* 6 */
  { x: 72, y: 59 }, /* 7 */
  { x: 56, y: 62 }, /* 8 */
  { x: 40, y: 58 }, /* 9 */
  { x: 24, y: 60 }, /* 10 BOSS */
  /* 第 3 阶段：绘本图书馆区（11~15，左中 → 右上中） */
  { x: 15, y: 45 }, /* 11 */
  { x: 27, y: 36 }, /* 12 */
  { x: 44, y: 39 }, /* 13 */
  { x: 61, y: 35 }, /* 14 */
  { x: 77, y: 38 }, /* 15 BOSS */
  /* 第 4 阶段：科学操场区（16~20，右上折返冲向终点） */
  { x: 86, y: 24 }, /* 16 */
  { x: 72, y: 17 }, /* 17 */
  { x: 55, y: 19 }, /* 18 */
  { x: 38, y: 16 }, /* 19 */
  { x: 22, y: 18 }, /* 20 总 BOSS */
];

const pts = SCHOOL_CAMPUS_NODES.map((n, i) => ({
  level: i + 1,
  cx: +(n.x / 100 * W).toFixed(1),
  cy: +(n.y / 100 * H).toFixed(1),
  boss: (i + 1) % 5 === 0,
}));

/* 用 Catmull-Rom 转三次贝塞尔，生成丝滑蜿蜒的校园小路 */
function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].cx} ${points[0].cy}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.cx + (p2.cx - p0.cx) / 6;
    const cp1y = p1.cy + (p2.cy - p0.cy) / 6;
    const cp2x = p2.cx - (p3.cx - p1.cx) / 6;
    const cp2y = p2.cy - (p3.cy - p1.cy) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.cx} ${p2.cy}`;
  }
  return d;
}

const roadD = smoothPath(pts);

/* 可爱小树装饰 */
const trees = [
  [85, 760, 1.05], [1395, 860, 1.15], [1370, 520, 0.95], [115, 290, 0.9],
  [1020, 740, 0.85], [470, 730, 0.8], [940, 260, 0.85], [1405, 110, 1.0],
  [80, 105, 0.95], [1230, 955, 0.9], [665, 955, 0.8], [1365, 360, 0.85],
].map(([x, y, s]) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="36" rx="28" ry="9" fill="#8BB96B" opacity="0.45"/>
    <rect x="-7" y="6" width="14" height="30" rx="6" fill="#A67449" stroke="#6B4828" stroke-width="3"/>
    <circle cx="-18" cy="-4" r="24" fill="#7AC15C" stroke="#4D873A" stroke-width="3"/>
    <circle cx="18" cy="-2" r="22" fill="#6BB54E" stroke="#4D873A" stroke-width="3"/>
    <circle cx="0" cy="-22" r="27" fill="#8CD16D" stroke="#4D873A" stroke-width="3"/>
  </g>`).join("");

/* 节点石阶：白色圆圈 + 编号，BOSS 关加柔和金色外环 */
const nodeCircles = pts.map((p) => {
  const r = p.boss ? 40 : 33;
  return `
  <g transform="translate(${p.cx} ${p.cy})">
    ${p.boss ? `<circle cx="0" cy="0" r="${r + 12}" fill="#FFE484" opacity="0.55"/>` : ""}
    <ellipse cx="0" cy="${r * 0.72}" rx="${r * 0.92}" ry="${r * 0.38}" fill="#7A9A58" opacity="0.32"/>
    <circle cx="0" cy="0" r="${r}" fill="#FFFDF7" stroke="${p.boss ? "#D99326" : "#A9895B"}" stroke-width="${p.boss ? 6 : 5}"/>
    <text x="0" y="9" text-anchor="middle" font-family="Arial, sans-serif" font-size="${p.boss ? 28 : 24}" font-weight="800" fill="${p.boss ? "#B86B14" : "#6E5230"}">${p.level}</text>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#DDF1C6"/>
      <stop offset="50%" stop-color="#CBE8AF"/>
      <stop offset="100%" stop-color="#B8DD96"/>
    </linearGradient>
    <linearGradient id="pond" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#BDE8F7"/>
      <stop offset="100%" stop-color="#96D6EE"/>
    </linearGradient>
  </defs>

  <!-- 校园柔和草地背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="260" cy="230" rx="340" ry="170" fill="#E6F5D2" opacity="0.55"/>
  <ellipse cx="1220" cy="760" rx="360" ry="180" fill="#E6F5D2" opacity="0.5"/>
  <ellipse cx="770" cy="495" rx="440" ry="150" fill="#D5EDBA" opacity="0.55"/>

  <!-- 校园小池塘与草地纹理 -->
  <ellipse cx="1095" cy="515" rx="115" ry="52" fill="url(#pond)" stroke="#75BBD6" stroke-width="5" opacity="0.9"/>
  <ellipse cx="1065" cy="503" rx="34" ry="11" fill="#E4F7FD" opacity="0.65"/>

  <!-- 四个校园主题区域小地标（纯几何矢量，无外链字体依赖） -->
  <!-- 1. 左下角：校园拱门 / 红顶教学楼 -->
  <g transform="translate(86 920)">
    <rect x="0" y="0" width="96" height="62" rx="10" fill="#FFF2D6" stroke="#8C6232" stroke-width="4"/>
    <polygon points="-10,4 48,-36 106,4" fill="#F28C66" stroke="#8C6232" stroke-width="4" stroke-linejoin="round"/>
    <rect x="34" y="24" width="28" height="38" rx="6" fill="#D69E5C" stroke="#8C6232" stroke-width="3"/>
    <circle cx="48" cy="-10" r="8" fill="#FFE285" stroke="#8C6232" stroke-width="2.5"/>
  </g>

  <!-- 2. 右侧中部：彩色铅笔与调色盘（美工区） -->
  <g transform="translate(1335 710) rotate(-14)">
    <ellipse cx="0" cy="0" rx="46" ry="34" fill="#F9E3B4" stroke="#8C6232" stroke-width="4"/>
    <circle cx="-18" cy="-8" r="7" fill="#F06A5E"/>
    <circle cx="2" cy="-14" r="7" fill="#F7C948"/>
    <circle cx="20" cy="-4" r="7" fill="#59B568"/>
    <circle cx="8" cy="12" r="7" fill="#5AA8E8"/>
    <circle cx="-14" cy="12" r="6" fill="#CBE8AF" stroke="#8C6232" stroke-width="2.5"/>
  </g>

  <!-- 3. 左上中：堆叠绘本书本（图书馆区） -->
  <g transform="translate(95 495)">
    <rect x="0" y="24" width="84" height="22" rx="6" fill="#6AB8E6" stroke="#4F6B88" stroke-width="3.5"/>
    <rect x="8" y="4" width="76" height="22" rx="6" fill="#F7B354" stroke="#8C6232" stroke-width="3.5"/>
    <rect x="16" y="-14" width="66" height="20" rx="6" fill="#82C96E" stroke="#4D7E42" stroke-width="3.5"/>
  </g>

  <!-- 4. 左上终点：星耀终点小旗帜 -->
  <g transform="translate(225 96)">
    <line x1="0" y1="0" x2="0" y2="76" stroke="#7A532A" stroke-width="6" stroke-linecap="round"/>
    <path d="M 3 4 L 68 20 L 3 40 Z" fill="#FFB84D" stroke="#7A532A" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="25" cy="21" r="6" fill="#FFFDF5"/>
  </g>

  <!-- 绿树点缀 -->
  ${trees}

  <!-- 蜿蜒奶油石板路线 -->
  <path d="${roadD}" fill="none" stroke="#99B87A" stroke-width="58" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" transform="translate(0 7)"/>
  <path d="${roadD}" fill="none" stroke="#C9A878" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${roadD}" fill="none" stroke="#FAF1DC" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${roadD}" fill="none" stroke="#DEC59B" stroke-width="5" stroke-dasharray="14 16" stroke-linecap="round"/>

  <!-- 20 个精准对齐的关卡石阶 -->
  ${nodeCircles}
</svg>`;

await sharp(Buffer.from(svg))
  .webp({ quality: 90 })
  .toFile(outPath);

const stat = fs.statSync(outPath);
console.log(`已生成 ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);
