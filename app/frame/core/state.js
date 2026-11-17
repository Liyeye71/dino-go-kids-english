/* ============================================================
   应用状态：存档读写、学习记录、计时器与路由
   ============================================================ */

/* ------------------------------------------------ state */
const STORE_KEY = "dinogo.v3";
try {
  if (new URLSearchParams(location.search).get("fresh") === "1") localStorage.removeItem(STORE_KEY);
} catch (e) { /* private mode */ }

let state = loadState();
setUltraSkin(state.ultraSkin);
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
    /* 装扮系统已移除，旧存档里的道具与穿戴字段一并丢弃 */
    delete parsed.owned;
    delete parsed.equipped;
    /* v3 及以前每关发 5/10/15 星星，v4 起统一按关卡星级 1–3，旧余额同步除以 5 */
    const prevVersion = Number(parsed.v) || 0;
    const legacy = prevVersion < 4;
    const progress = { ...(parsed.progress || {}) };
    /* 动物乐园改为「主题:场景」两套独立进度，旧存档统一迁入陆地动物园 */
    if (progress.animal) {
      if (!progress["animal:zoo"]) progress["animal:zoo"] = progress.animal;
      delete progress.animal;
    }
    /* v4 → v5：陆地动物园由 10 关扩展为 50 关，重置该场景关卡进度与宝箱里程碑 */
    if (prevVersion < 5) {
      delete progress["animal:zoo"];
      if (parsed.chests && parsed.chests.claimed) delete parsed.chests.claimed["animal:zoo"];
      parsed.allCleared = false;
    }
    return {
      ...initialState(),
      ...parsed,
      v: DEFAULT_STATE.v,
      stars: legacy ? Math.floor((Number(parsed.stars) || 0) / 5) : (Number(parsed.stars) || 0),
      tasks: { ...DEFAULT_STATE.tasks, ...(parsed.tasks || {}) },
      scene: parsed.scene || DEFAULT_STATE.scene,
      progress,
      log: parsed.log || {},
      bgOwned: Array.isArray(parsed.bgOwned) ? parsed.bgOwned : [...DEFAULT_STATE.bgOwned],
      ultraSkin: Math.min(4, Math.max(1, Number(parsed.ultraSkin) || 1)),
      dex: Array.isArray(parsed.dex) ? parsed.dex : [...DEFAULT_STATE.dex],
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
/* 已获得的星星 = 所有关卡历史最高星级之和（多场景主题按场景分别累计） */
function earnedStars() {
  let total = 0;
  Object.values(state.progress || {}).forEach((p) => {
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
    progress: {},
    log: {},
    bgOwned: [...DEFAULT_STATE.bgOwned],
    dex: [...DEFAULT_STATE.dex],
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
