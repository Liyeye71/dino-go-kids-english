/* ============================================================
   应用状态：存档读写、学习记录、计时器与路由
   ============================================================ */

/* ------------------------------------------------ state */
const STORE_KEY = "dinogo";
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
    /* v1 起统一为干净的新存档结构；STORE_KEY 已重置，旧版本迁移链不再保留 */
    const prevVersion = Number(parsed.v) || 0;
    const progress = { ...(parsed.progress || {}) };
    /* 动物乐园改为「主题:场景」两套独立进度，脏数据统一迁入神奇动物园 */
    if (progress.animal) {
      if (!progress["animal:zoo"]) progress["animal:zoo"] = progress.animal;
      delete progress.animal;
    }
    const unlocked = Array.isArray(parsed.unlocked) ? parsed.unlocked : [];
    const next = {
      ...initialState(),
      ...parsed,
      v: DEFAULT_STATE.v,
      stars: Number(parsed.stars) || 0,
      tasks: { ...DEFAULT_STATE.tasks, ...(parsed.tasks || {}) },
      scene: parsed.scene || DEFAULT_STATE.scene,
      progress,
      log: parsed.log || {},
      unlocked,
      /* 已学单词数始终与解锁列表保持一致 */
      words: unlocked.length,
      bgOwned: Array.isArray(parsed.bgOwned) ? parsed.bgOwned : [...DEFAULT_STATE.bgOwned],
      ultraSkin: Math.min(ULTRA_ART.length, Math.max(1, Number(parsed.ultraSkin) || 1)),
      ultraOwned: Array.isArray(parsed.ultraOwned) ? [...new Set(parsed.ultraOwned.map(Number).filter((n) => n > 0))] : [],
      dex: Array.isArray(parsed.dex) ? parsed.dex : [...DEFAULT_STATE.dex],
    };
    /* 单元制后主题 tab 已移除：旧存档当前主题若已无可玩内容（如占位主题/脏值），回落到第一个可玩主题 */
    if (!themeHasContent(THEME_BY_ID.get(next.theme))) next.theme = defaultTheme().id;
    /* 迁移后的数据立即落盘，避免旧存档每次启动都重复迁移 */
    if (prevVersion > 0 && prevVersion < DEFAULT_STATE.v) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e2) { /* 忽略写入失败 */ }
    }
    return next;
  } catch (e) {
    return initialState();
  }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
}
function resetState() {
  state = initialState();
  setUltraSkin(state.ultraSkin);
  if (window.WrongBank) WrongBank.clear();
  lastResult = null;
  evolutionInfo = null;
  quiz = null;
  save();
}

/* ------------------------------------------------ stars */
/* 可消费的星星余额：闯关考核获得，购买背景时扣减 */
function starBalance() {
  return Math.max(0, Math.floor(Number(state.stars) || 0));
}

/* ------------------------------------------------ daily challenge */
/* 每日随机挑战：全主题共享 1 次/天，完成结算才计次，按自然日重置 */
const DAILY_CHALLENGE_LIMIT = 1;
function dailyChallengeLeft() {
  if (state.dailyDay !== dateKey()) return DAILY_CHALLENGE_LIMIT;
  return Math.max(0, DAILY_CHALLENGE_LIMIT - (Number(state.dailyCount) || 0));
}
function takeDailyChallenge() {
  if (state.dailyDay !== dateKey()) {
    state.dailyDay = dateKey();
    state.dailyCount = 0;
  }
  state.dailyCount = (Number(state.dailyCount) || 0) + 1;
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
function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
  stopActionSound();
}

/* 全新存档：零星星、零成长、零记录，所有主题从第 1 关开始 */
function initialState() {
  return {
    ...DEFAULT_STATE,
    tasks: { ...DEFAULT_STATE.tasks },
    progress: {},
    log: {},
    unlocked: [],
    bgOwned: [...DEFAULT_STATE.bgOwned],
    ultraOwned: [...DEFAULT_STATE.ultraOwned],
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
