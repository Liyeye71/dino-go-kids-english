/* ============================================================
   DinoGo · 恐龙英语 — 主题关卡筛选器：美食餐厅
   words 为空，按 attrs 从 pos 文件中自动匹配对应单词
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "food",
  name: "美食餐厅",
  chip: "食物单词",
  unit: "Unit 4 · 美食餐厅",
  emoji: "🍔",
  attrs: ["food"],
  isTheme: true,
  dialog: { q: "What would you like?", a: "I want some {word}." },
  words: []
});
