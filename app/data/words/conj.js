/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：连词
   attrs: basic / advance / pro（难度）；type: 主分类
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "conj",
  name: "连词集",
  chip: "连词单词",
  unit: "Unit · 连词集",
  emoji: "🔀",
  isPool: true,
  dialog: { q: "Which one?", a: "This {word} that." },
  words: [
    // ---- 并列连词 coordinating ----
    { word: "and", zh: "和；并且", phon: "/ænd/", example: "I like apples and bananas.", attrs: ["basic"], type: "coordinating" },
    { word: "but", zh: "但是", phon: "/bʌt/", example: "It is small but strong.", attrs: ["basic"], type: "coordinating" },
    { word: "or", zh: "或者；否则", phon: "/ɔː(r)/", example: "Do you want tea or juice?", attrs: ["basic"], type: "coordinating" },
    { word: "so", zh: "所以", phon: "/səʊ/", example: "It is late, so I go home.", attrs: ["basic"], type: "coordinating" },
    // ---- 从属连词 subordinating ----
    { word: "because", zh: "因为", phon: "/bɪˈkɒz/", example: "I am happy because it is sunny.", attrs: ["basic"], type: "reason" },
    { word: "if", zh: "如果", phon: "/ɪf/", example: "If it rains, I stay at home.", attrs: ["advance"], type: "condition" },
    { word: "when", zh: "当……时", phon: "/wen/", example: "I read when I have time.", attrs: ["basic"], type: "time" },
    { word: "before", zh: "在……之前", phon: "/bɪˈfɔː(r)/", example: "Wash your hands before you eat.", attrs: ["advance"], type: "time" },
    { word: "after", zh: "在……之后", phon: "/ˈɑːftə(r)/", example: "I play after I finish my homework.", attrs: ["advance"], type: "time" },
    { word: "although", zh: "尽管", phon: "/ɔːlˈðəʊ/", example: "Although it is cold, we play outside.", attrs: ["pro"], type: "concession" },
    { word: "though", zh: "虽然", phon: "/ðəʊ/", example: "Though it is small, it is strong.", attrs: ["pro"], type: "concession" },
    { word: "that", zh: "引导从句", phon: "/ðæt/", example: "I think that you are right.", attrs: ["advance"], type: "clause" },
  ]
});


