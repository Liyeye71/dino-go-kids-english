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
    /* v5 → v6：宝箱改为 20%~100% 五档里程碑并更换奖励池，清空旧的领取记录 */
    if (prevVersion < 6 && parsed.chests && parsed.chests.claimed) {
      parsed.chests.claimed = {};
    }
    /* v6 → v7：星星只由每 5 关的考核关产出，旧存档清算：清空全部关卡星级、星星余额与宝箱领取记录 */
    if (prevVersion < 7) {
      Object.keys(progress).forEach((key) => {
        if (progress[key] && progress[key].stars) progress[key].stars = {};
      });
      parsed.stars = 0;
      if (parsed.chests) parsed.chests.claimed = {};
    }
    /* v7 → v8：校验星星数据，只保留考核关（第 5/10/15… 关）的 1~3 星，清理旧门槛版遗留的异常值 */
    if (prevVersion < 8) {
      let earned = 0;
      Object.keys(progress).forEach((key) => {
        const p = progress[key];
        if (!p || !p.stars) return;
        const clean = {};
        Object.keys(p.stars).forEach((lv) => {
          const levelNo = Number(lv);
          const n = Math.max(0, Math.min(3, Math.floor(Number(p.stars[lv]) || 0)));
          if (levelNo > 0 && levelNo % 5 === 0 && n > 0) clean[lv] = n;
        });
        p.stars = clean;
        earned += Object.values(clean).reduce((a, b) => a + b, 0);
      });
      /* 余额不能超过关卡累计星数，避免旧存档虚高 */
      parsed.stars = Math.min(Number(parsed.stars) || 0, earned);
    }
    /* v8 → v9：单词改为「答对解锁」，旧存档只有计数无法映射到具体单词，从零重新解锁 */
    if (prevVersion < 9) {
      parsed.unlocked = [];
      parsed.words = 0;
    }
    /* v9 → v10：进化止步完全体，究极体改为星星兑换；旧存档已解锁的究极体直接保留 */
    if (prevVersion < 10) {
      const owned = Array.isArray(parsed.ultraOwned) ? parsed.ultraOwned.slice() : [];
      const hadUltra = parsed.stage === "ultra" || (Array.isArray(parsed.dex) && parsed.dex.includes("ultra"));
      if (hadUltra && !owned.includes(1)) owned.push(1);
      /* 上一版可能已切换到究极体图鉴里的形象，直接保留为已兑换 */
      const prevSkin = Number(parsed.ultraSkin) || 1;
      if (hadUltra && prevSkin > 4 && !owned.includes(prevSkin)) owned.push(prevSkin);
      parsed.ultraOwned = owned;
    }
    const unlocked = Array.isArray(parsed.unlocked) ? parsed.unlocked : [];
    const next = {
      ...initialState(),
      ...parsed,
      v: DEFAULT_STATE.v,
      stars: legacy ? Math.floor((Number(parsed.stars) || 0) / 5) : (Number(parsed.stars) || 0),
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
/* 每日随机挑战：全主题共享 2 次/天，按自然日重置 */
const DAILY_CHALLENGE_LIMIT = 2;
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
