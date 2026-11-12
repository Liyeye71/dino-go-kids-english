/* ============================================================
   DinoGo · 恐龙英语 — 主题关卡筛选器：水果大冒险
   words 为空，按 attrs 从 pos 文件中自动匹配对应单词
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "fruit",
  name: "水果大冒险",
  chip: "水果单词",
  unit: "Unit 1 · 水果乐园",
  emoji: "🍎",
  attrs: ["fruit"],
  isTheme: true,
  dialog: { q: "What's this?", a: "It's a {word}." },
  words: []
});
