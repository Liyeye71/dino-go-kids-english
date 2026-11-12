/* ============================================================
   DinoGo · 恐龙英语 — 主题关卡筛选器：动物王国
   words 为空，按 attrs 从 pos 文件中自动匹配对应单词
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "zoo",
  name: "动物王国",
  chip: "动物单词",
  unit: "Unit 3 · 动物王国",
  emoji: "🦁",
  attrs: ["animal"],
  isTheme: true,
  dialog: { q: "What animal is this?", a: "It's a {word}." },
  words: []
});
