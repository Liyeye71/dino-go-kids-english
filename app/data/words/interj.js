/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：感叹词
   attrs: basic / advance / pro（难度）；type: 主分类
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "interj",
  name: "感叹词集",
  chip: "感叹词单词",
  unit: "Unit · 感叹词集",
  emoji: "❗",
  isPool: true,
  dialog: { q: "How do you feel?", a: "{word}! It is great!" },
  words: [
    { word: "wow", zh: "哇", phon: "/waʊ/", example: "Wow! The rainbow is beautiful.", attrs: ["basic"], type: "surprise" },
    { word: "oh", zh: "哦", phon: "/əʊ/", example: "Oh! I see.", attrs: ["basic"], type: "surprise" },
    { word: "hey", zh: "嘿", phon: "/heɪ/", example: "Hey! Look at this.", attrs: ["basic"], type: "attention" },
    { word: "hello", zh: "你好", phon: "/həˈləʊ/", example: "Hello! Nice to meet you.", attrs: ["basic"], type: "greeting" },
    { word: "oops", zh: "哎呀", phon: "/ʊps/", example: "Oops! I dropped my pen.", attrs: ["advance"], type: "mistake" },
    { word: "hooray", zh: "好耶", phon: "/huˈreɪ/", example: "Hooray! We win.", attrs: ["advance"], type: "celebration" },
    { word: "ouch", zh: "哎哟", phon: "/aʊtʃ/", example: "Ouch! My arm hurts.", attrs: ["advance"], type: "pain" },
    { word: "well", zh: "嗯；好吧", phon: "/wel/", example: "Well, let us try again.", attrs: ["advance"], type: "discourse" },
  ]
});


