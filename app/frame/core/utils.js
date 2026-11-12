/* ============================================================
   通用工具：DOM 查询、转义、阶段计算、格式化与背景映射
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function stageIndex(key) { return Math.max(0, STAGES.findIndex((s) => s.key === key)); }
function stageMeta(key) { return STAGES[stageIndex(key)] || STAGES[0]; }
function nextStage(key) { return STAGES[stageIndex(key) + 1] || null; }
function stageForGrowth(growth) {
  let out = STAGES[0];
  for (const s of STAGES) if (growth >= s.min) out = s;
  return out;
}
function fmt(n) { return Number(n).toLocaleString("en-US"); }
function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function bgClass(bg) { return bg === "sunset" ? "bg-sunset" : bg === "night" ? "bg-night" : "bg-jungle"; }
function bgMeta(id) { return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0]; }
