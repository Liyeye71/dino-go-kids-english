import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/* ============================================================
   DinoGo · 生成「去旅行交通岛」20 关自定义路线底图（1505×1045 webp）
   节点坐标与 app/data/theme/travel.js 的 TRAVEL_JOURNEY_NODES 一一对应
   ============================================================ */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "app", "data", "images", "material", "background", "travel-journey-map.webp");

const W = 1505;
const H = 1045;

/* 20 关 S 形海陆空旅行探索路线（百分比坐标） */
export const TRAVEL_JOURNEY_NODES = [
  /* 第 1 阶段：小镇公路（1~5，左下 → 右下） */
  { x: 14, y: 85 }, /* 1 */
  { x: 29, y: 87 }, /* 2 */
  { x: 45, y: 83 }, /* 3 */
  { x: 61, y: 86 }, /* 4 */
  { x: 77, y: 82 }, /* 5 BOSS */
  /* 第 2 阶段：海湾港口的跨海公路（6~10，右中 → 左中） */
  { x: 85, y: 67 }, /* 6 */
  { x: 71, y: 60 }, /* 7 */
  { x: 54, y: 63 }, /* 8 */
  { x: 38, y: 59 }, /* 9 */
  { x: 22, y: 61 }, /* 10 BOSS */
  /* 第 3 阶段：山谷铁道（11~15，左中 → 右上中） */
  { x: 15, y: 45 }, /* 11 */
  { x: 28, y: 37 }, /* 12 */
  { x: 45, y: 40 }, /* 13 */
  { x: 62, y: 36 }, /* 14 */
  { x: 78, y: 39 }, /* 15 BOSS */
  /* 第 4 阶段：云端机场与火箭发射台（16~20，右上 → 左上终点） */
  { x: 85, y: 24 }, /* 16 */
  { x: 70, y: 17 }, /* 17 */
  { x: 53, y: 19 }, /* 18 */
  { x: 36, y: 16 }, /* 19 */
  { x: 20, y: 18 }, /* 20 总 BOSS */
];

const pts = TRAVEL_JOURNEY_NODES.map((n, i) => ({
  level: i + 1,
  cx: +(n.x / 100 * W).toFixed(1),
  cy: +(n.y / 100 * H).toFixed(1),
  boss: (i + 1) % 5 === 0,
}));

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

const clouds = [
  [120, 90, 0.9], [460, 82, 0.75], [960, 95, 0.85], [1345, 115, 0.95],
].map(([x, y, s]) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="0.88">
    <ellipse cx="0" cy="14" rx="46" ry="18" fill="#FFFFFF"/>
    <circle cx="-18" cy="4" r="20" fill="#FFFFFF"/>
    <circle cx="10" cy="-2" r="24" fill="#FFFFFF"/>
    <circle cx="30" cy="8" r="16" fill="#FFFFFF"/>
  </g>`).join("");

const pines = [
  [92, 745, 0.95], [1395, 835, 1.05], [1365, 520, 0.9], [110, 310, 0.9],
  [975, 735, 0.85], [475, 740, 0.8], [1355, 345, 0.85], [125, 950, 0.8],
].map(([x, y, s]) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="36" rx="22" ry="7" fill="#7CA870" opacity="0.4"/>
    <rect x="-6" y="14" width="12" height="22" rx="4" fill="#9A6B44" stroke="#684528" stroke-width="2.5"/>
    <polygon points="0,-34 -26,18 26,18" fill="#6BB36B" stroke="#457D49" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="0,-46 -20,-4 20,-4" fill="#82C979" stroke="#457D49" stroke-width="3" stroke-linejoin="round"/>
  </g>`).join("");

const nodeCircles = pts.map((p) => {
  const r = p.boss ? 40 : 33;
  return `
  <g transform="translate(${p.cx} ${p.cy})">
    ${p.boss ? `<circle cx="0" cy="0" r="${r + 12}" fill="#FFE484" opacity="0.58"/>` : ""}
    <ellipse cx="0" cy="${r * 0.72}" rx="${r * 0.92}" ry="${r * 0.38}" fill="#6F8EA3" opacity="0.28"/>
    <circle cx="0" cy="0" r="${r}" fill="#FFFDF7" stroke="${p.boss ? "#D99326" : "#6D8DA6"}" stroke-width="${p.boss ? 6 : 5}"/>
    <text x="0" y="9" text-anchor="middle" font-family="Arial, sans-serif" font-size="${p.boss ? 28 : 24}" font-weight="800" fill="${p.boss ? "#B86B14" : "#43627A"}">${p.level}</text>
  </g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="skyLand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#CBEBFA"/>
      <stop offset="32%" stop-color="#DCEFD2"/>
      <stop offset="68%" stop-color="#C9E6BA"/>
      <stop offset="100%" stop-color="#BCE0A8"/>
    </linearGradient>
    <linearGradient id="bay" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9BD9F2"/>
      <stop offset="100%" stop-color="#76C2E4"/>
    </linearGradient>
  </defs>

  <!-- 海陆空柔和渐变背景 -->
  <rect width="${W}" height="${H}" fill="url(#skyLand)"/>

  <!-- 远山剪影 -->
  <path d="M 0 330 Q 210 210 430 315 T 920 300 T 1505 290 L 1505 420 L 0 420 Z" fill="#B9DDA8" opacity="0.65"/>

  <!-- 右侧海湾 -->
  <ellipse cx="1175" cy="545" rx="220" ry="96" fill="url(#bay)" stroke="#62B0D4" stroke-width="5" opacity="0.92"/>
  <path d="M 1060 535 Q 1095 522 1130 535 T 1200 535" fill="none" stroke="#E4F7FF" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
  <path d="M 1140 570 Q 1175 558 1210 570 T 1280 570" fill="none" stroke="#E4F7FF" stroke-width="4" stroke-linecap="round" opacity="0.65"/>

  <!-- 云朵 -->
  ${clouds}

  <!-- 1. 左下起点：交通信号灯 / 路标 -->
  <g transform="translate(86 905)">
    <rect x="18" y="28" width="12" height="58" rx="5" fill="#7D8C96" stroke="#4A5C68" stroke-width="3"/>
    <rect x="0" y="-26" width="48" height="62" rx="12" fill="#5D6F7D" stroke="#3B4B57" stroke-width="3.5"/>
    <circle cx="24" cy="-9" r="7" fill="#F26B5E"/>
    <circle cx="24" cy="6" r="7" fill="#FFD35A"/>
    <circle cx="24" cy="21" r="7" fill="#63C76A"/>
  </g>

  <!-- 2. 海湾小帆船 -->
  <g transform="translate(1215 510)">
    <path d="M -32 18 L 32 18 L 22 34 L -22 34 Z" fill="#F28C5B" stroke="#7A4A2E" stroke-width="3.5" stroke-linejoin="round"/>
    <line x1="0" y1="18" x2="0" y2="-28" stroke="#7A4A2E" stroke-width="4" stroke-linecap="round"/>
    <polygon points="3,-26 30,12 3,12" fill="#FFFDF6" stroke="#7A4A2E" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="-3,-18 -22,12 -3,12" fill="#FFE082" stroke="#7A4A2E" stroke-width="3" stroke-linejoin="round"/>
  </g>

  <!-- 3. 左上终点：星耀热气球 -->
  <g transform="translate(135 160)">
    <line x1="-10" y1="30" x2="-7" y2="46" stroke="#7A532A" stroke-width="3"/>
    <line x1="10" y1="30" x2="7" y2="46" stroke="#7A532A" stroke-width="3"/>
    <ellipse cx="0" cy="-2" rx="34" ry="38" fill="#FF9259" stroke="#7A4B2A" stroke-width="3.5"/>
    <ellipse cx="0" cy="-2" rx="15" ry="37" fill="#FFD86B" stroke="#7A4B2A" stroke-width="2.5"/>
    <rect x="-12" y="45" width="24" height="16" rx="4" fill="#C9965B" stroke="#7A4B2A" stroke-width="3"/>
  </g>

  <!-- 绿松树点缀 -->
  ${pines}

  <!-- 蜿蜒旅行公路 -->
  <path d="${roadD}" fill="none" stroke="#85A58A" stroke-width="58" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" transform="translate(0 7)"/>
  <path d="${roadD}" fill="none" stroke="#7A95AA" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${roadD}" fill="none" stroke="#F7F4EB" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${roadD}" fill="none" stroke="#B7CAD8" stroke-width="5" stroke-dasharray="16 16" stroke-linecap="round"/>

  <!-- 20 个精准对齐的关卡石阶 -->
  ${nodeCircles}
</svg>`;

await sharp(Buffer.from(svg))
  .webp({ quality: 90 })
  .toFile(outPath);

const stat = fs.statSync(outPath);
console.log(`已生成 ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);
