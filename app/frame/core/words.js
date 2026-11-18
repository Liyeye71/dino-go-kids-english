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
/* 单词池：所有 isPool:true 的词性文件里的原子词（带 type 标注），仅供每日随机记单词与单词本使用 */
const POS_POOL = (window.DINO_WORD_SETS || [])
  .filter((s) => s.isPool)
  .flatMap((s) => (s.words || []).map((w) => ({ ...w, pos: s.id })))
  .map((w) => ({ ...w, art: wordArt(w) }));
/* 随机记单词只取名词与动词短语 */
const REVIEW_WORDS = POS_POOL.filter(
  (w) => w.pos === "noun" || (w.pos === "verb" && w.type === "phrase")
);
/* 词性中文名（单词本页签展示用） */
const POS_ZH = { noun: "名词", verb: "动词", adj: "形容词", adv: "副词", pron: "代词", prep: "介词", conj: "连词", interj: "感叹词", num: "数词" };
function posZh(w) {
  if (!w || !w.pos) return "";
  if (w.pos === "verb" && w.type === "phrase") return "动词短语";
  return POS_ZH[w.pos] || "";
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
/* 每个主题 10 关；普通关 3 题、BOSS 关 5 题；动物园每阶段第 5 关需前 4 关累计 8 星 */
const LEVELS_PER_THEME = 10;
const PASS_STARS = 1;
/* 主题按 id 建索引，避免每次渲染都线性查找 */
const THEME_BY_ID = new Map(WORD_SETS.map((set) => [set.id, set]));
function currentTheme() {
  return THEME_BY_ID.get(state.theme) || WORD_SETS[0];
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
/* 当前主题（多场景主题为当前场景）的关卡总数：动物乐园 50 关，其余主题 10 关 */
function levelsPerTheme(id) {
  const theme = THEME_BY_ID.get(id) || currentTheme();
  const scene = sceneOf(theme, state && state.scene);
  return (scene && scene.levelCount) || (theme && theme.levelCount) || LEVELS_PER_THEME;
}
/* 多场景主题（如动物乐园）：每个场景拥有独立 10 关进度，存档键为「主题:场景」 */
function sceneProgress(themeId, sceneId) {
  if (!state.progress) state.progress = {};
  const key = `${themeId}:${sceneId}`;
  if (!state.progress[key]) state.progress[key] = { level: 1, stars: {} };
  return state.progress[key];
}
function activeProgressKey(themeId) {
  const id = themeId || (state && state.theme) || WORD_SETS[0].id;
  const theme = THEME_BY_ID.get(id);
  const scenes = theme && theme.scenes;
  if (scenes && scenes.length) {
    const scene = scenes.find((s) => s.id === (state && state.scene)) || scenes[0];
    return `${id}:${scene.id}`;
  }
  return id;
}
/* 每个主题（多场景主题为当前场景）独立关卡进度：{ level, stars }，互不影响 */
function themeProgress(id) {
  const key = activeProgressKey(id);
  if (!state.progress) state.progress = {};
  if (!state.progress[key]) state.progress[key] = { level: 1, stars: {} };
  return state.progress[key];
}
function themeStars(p) {
  return Object.values(p.stars).reduce((a, b) => a + b, 0);
}
function totalLevelsDone() {
  return Object.values(state.progress || {}).reduce(
    (n, p) => n + Math.max(0, (Number(p.level) || 1) - 1),
    0
  );
}
