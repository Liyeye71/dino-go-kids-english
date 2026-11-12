/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：副词
   attrs: interrogative（疑问词）；words 数组后续按需补充
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "adv",
  name: "副词集",
  chip: "副词单词",
  unit: "Unit · 副词集",
  emoji: "⚡",
  isPool: true,
  dialog: { q: "How do you do it?", a: "Do it {word}." },
  words: [
    // { word: "", zh: "", phon: "", example: "", emoji: "" },
    // ---- 疑问词 interrogative ----
    { word: "how",      zh: "怎样",         phon: "/haʊ/",          example: "How are you?",               attrs: ["interrogative"] },
    { word: "when",     zh: "什么时候",     phon: "/wen/",          example: "When do you get up?",        attrs: ["interrogative"] },
    { word: "where",    zh: "在哪里",       phon: "/weə(r)/",       example: "Where is my bag?",           attrs: ["interrogative"] },
    { word: "why",      zh: "为什么",       phon: "/waɪ/",          example: "Why are you sad?",           attrs: ["interrogative"] },
    { word: "how old",  zh: "年龄多大、几岁", phon: "/haʊ əʊld/",   example: "How old are you?",           attrs: ["interrogative", "phrase"] },
    { word: "how many", zh: "多少",         phon: "/haʊ ˈmeni/",    example: "How many books do you have?", attrs: ["interrogative", "phrase"] },
    { word: "how much", zh: "多少钱",       phon: "/haʊ mʌtʃ/",     example: "How much is the cake?",      attrs: ["interrogative", "phrase"] },
    { word: "how tall", zh: "多高",         phon: "/haʊ tɔːl/",     example: "How tall is the tree?",      attrs: ["interrogative", "phrase"] },
    { word: "how heavy", zh: "多重",        phon: "/haʊ ˈhevi/",    example: "How heavy is the box?",      attrs: ["interrogative", "phrase"] },
    { word: "how long", zh: "多长",         phon: "/haʊ lɒŋ/",      example: "How long is the river?",     attrs: ["interrogative", "phrase"] },
    { word: "how big",  zh: "多大",         phon: "/haʊ bɪɡ/",      example: "How big is your school?",    attrs: ["interrogative", "phrase"] },
    { word: "how wide", zh: "多宽",         phon: "/haʊ waɪd/",     example: "How wide is the road?",      attrs: ["interrogative", "phrase"] },
    { word: "how large", zh: "面积多大",    phon: "/haʊ lɑːdʒ/",    example: "How large is the park?",     attrs: ["interrogative", "phrase"] },
  ]
});


