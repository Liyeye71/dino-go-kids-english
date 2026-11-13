/* ============================================================
   词汇池与关卡规则：词性池、随机复习词、主题筛选与进度计算
   ============================================================ */

/* 单词池：所有 isPool:true 的词性文件里的原子词（带 type 标注），合并去重 */
const POS_POOL = (window.DINO_WORD_SETS || [])
  .filter((s) => s.isPool)
  .flatMap((s) => (s.words || []).map((w) => ({ ...w, pos: s.id })))
  .map((w) => ({ ...w, art: w.art || (() => emojiArt(w.emoji || "❓")) }));
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
/* 关卡主题：所有 isTheme:true 的主题筛选器，words 为空则按 type 从 POS_POOL 匹配 */
const WORD_SETS = (window.DINO_WORD_SETS || [])
  .filter((s) => s.isTheme)
  .map((set) => {
    const own = (set.words || []).map((w) => ({ ...w, art: w.art || (() => emojiArt(w.emoji || "❓")) }));
    let words = own;
    if (words.length === 0 && typeof set.type === "string") {
      words = POS_POOL.filter((w) => w.type === set.type);
    }
    return { ...set, words };
  });
/* 每个主题 10 关；每关 5 题：答对 3 题 1 星、4 题 2 星、5 题 3 星，≥2 星才解锁下一关 */
const LEVELS_PER_THEME = 10;
const PASS_STARS = 2;
/* 主题按 id 建索引，避免每次渲染都线性查找 */
const THEME_BY_ID = new Map(WORD_SETS.map((set) => [set.id, set]));
function currentTheme() {
  return THEME_BY_ID.get(state.theme) || WORD_SETS[0];
}
function themeWords() {
  return currentTheme().words;
}
/* 每个主题独立关卡进度：{ level, stars }，互不影响 */
function themeProgress(id) {
  const key = id || (state && state.theme) || "fruit";
  if (!state.progress) state.progress = {};
  if (!state.progress[key]) state.progress[key] = { level: 1, stars: {} };
  return state.progress[key];
}
function themeStars(p) {
  return Object.values(p.stars).reduce((a, b) => a + b, 0);
}
function totalLevelsDone() {
  return WORD_SETS.reduce((n, t) => n + (state.progress && state.progress[t.id] ? state.progress[t.id].level - 1 : 0), 0);
}
