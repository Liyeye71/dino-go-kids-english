/* ============================================================
   DinoGo · 恐龙英语 — 主题词汇：水果大冒险
   新增主题只需在同目录添加一个文件，并在 index.html / build.mjs 里登记
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "fruit",
  name: "水果大冒险",
  chip: "水果单词",
  unit: "Unit 1 · 水果乐园",
  emoji: "🍎",
  dialog: { q: "What's this?", a: "It's a {word}." },
  words: [
    { word: "apple",      zh: "苹果", phon: "/ˈæpəl/",         example: "I eat an apple every day.",   art: () => appleSVG() },
    { word: "banana",     zh: "香蕉", phon: "/bəˈnɑːnə/",      example: "The monkey likes bananas.",   art: () => bananaSVG() },
    { word: "orange",     zh: "橙子", phon: "/ˈɒrɪndʒ/",       example: "This orange is sweet.",       art: () => orangeSVG() },
    { word: "grape",      zh: "葡萄", phon: "/ɡreɪp/",         example: "Grapes grow on a vine.",      art: () => grapeSVG() },
    { word: "strawberry", zh: "草莓", phon: "/ˈstrɔːbəri/",    example: "I want a strawberry.",        art: () => strawberrySVG() },
    { word: "pear",       zh: "梨",   phon: "/peə(r)/",        example: "This pear is juicy.",         emoji: "🍐" },
    { word: "peach",      zh: "桃子", phon: "/piːtʃ/",         example: "The peach is soft and sweet.", emoji: "🍑" },
    { word: "lemon",      zh: "柠檬", phon: "/ˈlemən/",        example: "The lemon tastes sour.",      emoji: "🍋" },
    { word: "watermelon", zh: "西瓜", phon: "/ˈwɔːtərmelən/",  example: "We eat watermelon in summer.", emoji: "🍉" },
    { word: "cherry",     zh: "樱桃", phon: "/ˈtʃeri/",        example: "She has two cherries.",       emoji: "🍒" },
  ],
});
