/* ============================================================
   应用状态：存档读写、学习记录、计时器与路由
   ============================================================ */

/* ------------------------------------------------ state */
const STORE_KEY = "dinogo.v3";
try {
  if (new URLSearchParams(location.search).get("fresh") === "1") localStorage.removeItem(STORE_KEY);
} catch (e) { /* private mode */ }

let state = loadState();
let current = "home";
let quiz = null;
let lastResult = null;
let evolutionInfo = null;
let timers = [];

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    /* v3 及以前每关发 5/10/15 星星，v4 起统一按关卡星级 1–3，旧余额同步除以 5 */
    const legacy = (Number(parsed.v) || 0) < 4;
    return {
      ...initialState(),
      ...parsed,
      v: DEFAULT_STATE.v,
      stars: legacy ? Math.floor((Number(parsed.stars) || 0) / 5) : (Number(parsed.stars) || 0),
      tasks: { ...DEFAULT_STATE.tasks, ...(parsed.tasks || {}) },
      equipped: { ...DEFAULT_STATE.equipped, ...(parsed.equipped || {}) },
      progress: parsed.progress || {},
      log: parsed.log || {},
      bgOwned: Array.isArray(parsed.bgOwned) ? parsed.bgOwned : [...DEFAULT_STATE.bgOwned],
      dex: Array.isArray(parsed.dex) ? parsed.dex : [...DEFAULT_STATE.dex],
      owned: Array.isArray(parsed.owned) ? parsed.owned : [],
    };
  } catch (e) {
    return initialState();
  }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
}
function resetState() {
  state = initialState();
  lastResult = null;
  evolutionInfo = null;
  quiz = null;
  save();
}

/* ------------------------------------------------ stars */
/* 已获得的星星 = 所有主题关卡历史最高星级之和（与地图统计一致） */
function earnedStars() {
  let total = 0;
  WORD_SETS.forEach((t) => {
    const p = state.progress[t.id];
    if (!p || !p.stars) return;
    Object.values(p.stars).forEach((n) => { total += Number(n) || 0; });
  });
  return total;
}

/* ------------------------------------------------ study log */
function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function recordLevel(stars) {
  const k = dateKey();
  const rec = state.log[k] || { levels: 0, stars: 0 };
  state.log[k] = { levels: rec.levels + 1, stars: rec.stars + stars };
}

/* ------------------------------------------------ timers */
function setTimer(fn, ms) {
  const id = setTimeout(() => { timers = timers.filter((t) => t !== id); fn(); }, ms);
  timers.push(id);
  return id;
}
function clearTimers() { timers.forEach((t) => clearTimeout(t)); timers = []; }

/* 全新存档：零星星、零成长、零记录，所有主题从第 1 关开始 */
function initialState() {
  return {
    ...DEFAULT_STATE,
    tasks: { ...DEFAULT_STATE.tasks },
    equipped: { ...DEFAULT_STATE.equipped },
    progress: {},
    log: {},
    bgOwned: [...DEFAULT_STATE.bgOwned],
    dex: [...DEFAULT_STATE.dex],
    owned: [],
  };
}

/* ------------------------------------------------ router */
function screenContextValid(name) {
  if (name === "quiz") return !!quiz;
  if (name === "result") return !!lastResult;
  if (name === "evolution") return !!evolutionInfo;
  return true;
}
function go(name, opts = {}) {
  if (name === current && !opts.replace && !opts.force) { render(); return; }
  clearTimers();
  current = name;
  try {
    if (opts.replace) history.replaceState({ screen: name }, "");
    else history.pushState({ screen: name }, "");
  } catch (e) { /* local file / restricted history */ }
  render();
  requestAnimationFrame(() => {
    const sc = $(".scroll");
    if (sc) sc.scrollTop = 0;
  });
}
