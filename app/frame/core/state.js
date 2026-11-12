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
let installDismissed = false;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return {
      ...initialState(),
      ...parsed,
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
function back() {
  clearTimers();
  if (quiz && current === "quiz") { quiz = null; go("map", { replace: true }); return; }
  if (history.length > 1) history.back();
  else go("home", { replace: true });
}
