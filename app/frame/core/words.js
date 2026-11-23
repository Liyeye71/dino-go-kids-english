/* ============================================================
   词汇池与关卡规则：词性池、随机复习词、主题筛选与进度计算
   ============================================================ */

/* 没有精确 emoji 的词，用单词首字母大写代替，避免出现统一的问号占位 */
function wordGlyph(word) {
  const ch = String(word || "").trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}
function wordArt(w) {
  return w.art || (() => emojiArt(w.emoji || wordGlyph(w.word)));
}
/* 单词池：所有 isPool:true 的词性文件里的原子词（带 type 标注），仅供每日随机记单词使用 */
const POS_POOL = (window.DINO_WORD_SETS || [])
  .filter((s) => s.isPool)
  .flatMap((s) => (s.words || []).map((w) => ({ ...w, pos: s.id })))
  .map((w) => ({ ...w, art: wordArt(w) }));
/* 随机记单词只取名词与动词短语 */
const REVIEW_WORDS = POS_POOL.filter(
  (w) => w.pos === "noun" || (w.pos === "verb" && w.type === "phrase")
);
/* 闯关单词分类中文名（词汇页签展示用） */
const CATEGORY_ZH = { noun: "名词", verb: "动词", part: "身体部位", adj: "形容词" };
function categoryZh(w) {
  return (w && CATEGORY_ZH[w.category]) || "";
}
/* 关卡主题：每个主题自带独立词表，不再从词库按类型筛选；多场景主题每个场景一套词 */
function themeWordList(list) {
  return (list || []).map((w) => ({ ...w, art: wordArt(w) }));
}
const WORD_SETS = (window.DINO_WORD_SETS || [])
  .filter((s) => s.isTheme)
  .map((set) => ({
    ...set,
    words: themeWordList(set.words),
    scenes: (set.scenes || []).map((scene) => ({ ...scene, words: themeWordList(scene.words) })),
  }));
/* 普通主题 10 关，动物乐园按场景各 50 关；普通关 3 题、BOSS 关 5 题；只有每 5 关的考核关产出 1~3 星 */
const LEVELS_PER_THEME = 10;
/* 主题按 id 建索引，避免每次渲染都线性查找 */
const THEME_BY_ID = new Map(WORD_SETS.map((set) => [set.id, set]));
/* ---------------- 单元制导航 ----------------
   闯关页顶层按单元组织：basic 已开放，advance 锁定待后续迭代
   themes 为单元内主题地图的展示顺序（唯一来源），后续给 advance 加地图时在此追加 id */
const UNITS = [
  { id: "basic", name: "基础乐园", en: "Basic", emoji: "🌱", locked: false, themes: ["animal", "travel", "school"] },
  { id: "advance", name: "进阶岛", en: "Advance", emoji: "🏝️", locked: true, themes: [] },
];
const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));
function currentUnit() {
  return UNIT_BY_ID.get(state && state.unit) || UNITS[0];
}
function themesOfUnit(unit) {
  const u = typeof unit === "string" ? UNIT_BY_ID.get(unit) : unit;
  return ((u && u.themes) || []).map((id) => THEME_BY_ID.get(id)).filter(Boolean);
}
/* 默认主题：第一个开放单元的第一个主题地图 */
function defaultTheme() {
  return themesOfUnit(UNITS[0])[0] || WORD_SETS[0];
}
/* 主题是否有可玩内容：有词表且未标记 playable:false（占位主题只渲染筹备中卡片） */
function themeHasContent(t) {
  if (!t || t.playable === false) return false;
  const scenes = t.scenes || [];
  const words = scenes.length
    ? scenes.reduce((n, s) => n + (s.playable !== false ? (s.words || []).length : 0), 0)
    : (t.words || []).length;
  return words > 0;
}
function currentTheme() {
  return THEME_BY_ID.get(state.theme) || defaultTheme();
}
/* 多场景主题取当前场景词表，单场景主题取主题词表 */
function sceneOf(theme, sceneId) {
  const scenes = (theme && theme.scenes) || [];
  if (!scenes.length) return null;
  return scenes.find((s) => s.id === sceneId) || scenes[0];
}
function sceneWords(theme, sceneId) {
  const scene = sceneOf(theme, sceneId);
  if (scene && scene.words && scene.words.length) return scene.words;
  return (theme && theme.words) || [];
}
function themeWords() {
  return sceneWords(currentTheme(), state && state.scene);
}

/* ---------------- 单词解锁 ----------------
   答对题目后把当前主题 / 场景的单词写入存档，词汇页只展示已解锁的词 */
function unlockWordKey(themeId, sceneId, word) {
  return `${themeId || ""}:${sceneId || ""}:${word || ""}`;
}
function isWordUnlocked(word, themeId, sceneId) {
  const key = unlockWordKey(
    themeId || (state && state.theme),
    sceneId == null ? (state && state.scene) : sceneId,
    word
  );
  return Boolean(state && Array.isArray(state.unlocked) && state.unlocked.includes(key));
}
/* 答对后解锁：返回 true 表示首次解锁；只接受当前主题 / 场景词表里的词 */
function unlockWord(word) {
  if (!word || !state) return false;
  const theme = currentTheme();
  const sceneId = state.scene || "";
  if (!sceneWords(theme, sceneId).some((w) => w.word === word)) return false;
  const key = unlockWordKey(theme.id, sceneId, word);
  if (!Array.isArray(state.unlocked)) state.unlocked = [];
  if (state.unlocked.includes(key)) return false;
  state.unlocked.push(key);
  /* 已学单词数始终与解锁列表保持一致 */
  state.words = state.unlocked.length;
  save();
  return true;
}
/* 当前场景已解锁的单词集合，供 BOSS 关优先出题 */
function unlockedWordSet(themeId, sceneId) {
  const theme = THEME_BY_ID.get(themeId || (state && state.theme)) || currentTheme();
  const sid = sceneId == null ? ((state && state.scene) || "") : sceneId;
  const prefix = `${theme.id}:${sid}:`;
  return new Set(
    ((state && Array.isArray(state.unlocked)) ? state.unlocked : [])
      .filter((key) => key.indexOf(prefix) === 0)
      .map((key) => key.slice(prefix.length))
  );
}
/* 全部主题 / 场景单词，词汇页按 A–Z 展示（未解锁的灰化占位） */
function allThemeWords() {
  const out = [];
  const seen = new Set();
  WORD_SETS.forEach((set) => {
    /* 筹备中的占位主题不进入单词本，避免出现永远无法解锁的词条 */
    if (set.isTheme && set.playable === false) return;
    const groups = set.scenes && set.scenes.length
      ? set.scenes.map((sc) => ({ sceneId: sc.id, words: sc.words }))
      : [{ sceneId: "", words: set.words }];
    groups.forEach(({ sceneId, words }) => {
      (words || []).forEach((w) => {
        const key = unlockWordKey(set.id, sceneId, w.word);
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ ...w, themeId: set.id, themeName: set.name, sceneId, unlockKey: key });
      });
    });
  });
  return out;
}
/* 当前主题（多场景主题为当前场景）的关卡总数：动物乐园 50 关，其余主题 10 关 */
function levelsPerTheme(id) {
  const theme = THEME_BY_ID.get(id) || currentTheme();
  const scene = sceneOf(theme, state && state.scene);
  return (scene && scene.levelCount) || (theme && theme.levelCount) || LEVELS_PER_THEME;
}
/* 多场景主题（如动物乐园）：每个场景拥有独立的关卡进度，存档键为「主题:场景」 */
function sceneProgress(themeId, sceneId) {
  if (!state.progress) state.progress = {};
  const key = `${themeId}:${sceneId}`;
  if (!state.progress[key]) state.progress[key] = { level: 1, stars: {} };
  return state.progress[key];
}
function activeProgressKey(themeId) {
  const id = themeId || (state && state.theme) || defaultTheme().id;
  const theme = THEME_BY_ID.get(id);
  const scenes = theme && theme.scenes;
  if (scenes && scenes.length) {
    const scene = scenes.find((s) => s.id === (state && state.scene)) || scenes[0];
    return `${id}:${scene.id}`;
  }
  return id;
}
/* 每个主题（多场景主题为当前场景）独立关卡进度：{ level, stars, cleared }，互不影响 */
function themeProgress(id) {
  const key = activeProgressKey(id);
  if (!state.progress) state.progress = {};
  if (!state.progress[key]) state.progress[key] = { level: 1, stars: {} };
  if (!state.progress[key].cleared) state.progress[key].cleared = {};
  return state.progress[key];
}
/* 旅程/宝箱进度只统计考核关（第 5/10/15… 关）的星星；启蒙模式普通关的星星只计入可消费余额 */
function themeStars(p) {
  return Object.entries(p.stars || {}).reduce(
    (a, [lv, v]) => (Number(lv) % 5 === 0 ? a + (Number(v) || 0) : a),
    0
  );
}
function totalLevelsDone() {
  return Object.values(state.progress || {}).reduce(
    (n, p) => n + Math.max(0, (Number(p.level) || 1) - 1),
    0
  );
}
