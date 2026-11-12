/* ============================================================
   DinoGo · 恐龙英语 — 主题关卡筛选器：汽车派对
   words 为空，按 attrs 从 pos 文件中自动匹配对应单词
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "cars",
  name: "汽车派对",
  chip: "交通单词",
  unit: "Unit 2 · 汽车派对",
  emoji: "🚗",
  attrs: ["vehicle"],
  isTheme: true,
  dialog: { q: "How do we get there?", a: "Let's take a {word}." },
  words: []
});
