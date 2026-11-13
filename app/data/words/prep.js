/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：介词集
   attrs: basic / advance / pro（难度）；type: 主分类
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "prep",
  name: "介词集",
  chip: "介词单词",
  unit: "Prepositions · 介词集",
  isPool: true,
  dialog: { q: "Where is it?", a: "It's {word} the box." },
  words: [
    { word: "in",        zh: "在…里面", phon: "/ɪn/",        example: "It is in the box.", attrs: ["basic"], type: "other" },
    { word: "on",        zh: "在…上面", phon: "/ɒn/",       example: "The book is on the desk.", attrs: ["basic"], type: "other" },
    { word: "under",     zh: "在…下面", phon: "/ˈʌndə(r)/", example: "The cat is under the table.", attrs: ["basic"], type: "other" },
    { word: "near",      zh: "靠近",   phon: "/nɪə(r)/",   example: "I live near the school.", attrs: ["basic"], type: "other" },
    { word: "behind",    zh: "在…后面", phon: "/bɪˈhaɪnd/", example: "Who is behind me?", attrs: ["advance"], type: "other" },
    { word: "over",      zh: "在…上方", phon: "/ˈəʊvə(r)/", example: "The plane flies over the mountain.", attrs: ["advance"], type: "other" },
    { word: "in front of", zh: "在…前面", phon: "/ɪn frʌnt ɒv/", example: "I sit in front of her.", attrs: ["advance"], type: "other" },
    { word: "between",   zh: "在…之间", phon: "/bɪˈtwiːn/", example: "It is between A and B.", attrs: ["advance"], type: "other" },
    { word: "next to",   zh: "紧挨着", phon: "/nekst tuː/", example: "Sit next to me.", attrs: ["advance"], type: "other" },
    { word: "at",        zh: "在…",   phon: "/æt/",       example: "Look at me.", attrs: ["basic"], type: "other" },
    { word: "to",        zh: "到",     phon: "/tuː/",      example: "Go to school.", attrs: ["basic"], type: "other" },
    { word: "from",      zh: "从",     phon: "/frɒm/",     example: "I'm from China.", attrs: ["basic"], type: "other" },
    { word: "with",      zh: "和",     phon: "/wɪð/",      example: "I play with friends.", attrs: ["basic"], type: "other" },
    { word: "for",       zh: "为了",   phon: "/fɔː(r)/",   example: "This is for you.", attrs: ["basic"], type: "other" },
  ]
});
