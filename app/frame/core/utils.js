/* ============================================================
   通用工具：DOM 查询、转义、阶段计算、格式化与背景映射
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isStandaloneMode() {
  return window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

let _stageIndexMap = null;
function stageIndex(key) {
  if (!_stageIndexMap) _stageIndexMap = new Map(STAGES.map((s, i) => [s.key, i]));
  return _stageIndexMap.has(key) ? _stageIndexMap.get(key) : 0;
}
function stageMeta(key) { return STAGES[stageIndex(key)] || STAGES[0]; }
/* 自动进化只到完全体；究极体改为成长值达标后用星星兑换 */
function nextStage(key) {
  if (key === "super" || key === "ultra") return null;
  return STAGES[stageIndex(key) + 1] || null;
}
function stageForGrowth(growth) {
  let out = STAGES[0];
  for (const s of STAGES) {
    if (s.key === "ultra") break;
    if (growth >= s.min) out = s;
  }
  return out;
}
function ultraBaseOwned() {
  return (state.ultraOwned || []).includes(1) || state.dex.includes("ultra");
}
function ultraSkinOwned(id) {
  const n = Number(id);
  if (n <= 4) return ultraBaseOwned();
  return (state.ultraOwned || []).includes(n);
}
function ultraExchangeOpen() { return state.growth >= ULTRA_MIN; }
function ultraFormMeta(id) {
  const n = Number(id);
  if (n <= 4) return { id: n, name: "超级霸王龙", sub: (ULTRA_SKINS[n - 1] || ULTRA_SKINS[0]).sub };
  return ULTRA_DINOS.find((d) => d.id === n) || ULTRA_DINOS[0];
}
function fmt(n) { return Number(n).toLocaleString("en-US"); }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function bgClass(bg) { return bg === "sunset" ? "bg-sunset" : bg === "night" ? "bg-night" : "bg-jungle"; }
let _bgMetaMap = null;
function bgMeta(id) {
  if (!_bgMetaMap) _bgMetaMap = new Map(BACKGROUNDS.map((b) => [b.id, b]));
  return _bgMetaMap.get(id) || BACKGROUNDS[0];
}
