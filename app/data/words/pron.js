/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：代词集
   attrs: subject（主格）/ object（宾格）/ possessive（形容词性物主代词）/ interrogative（疑问词）
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "pron",
  name: "代词集",
  chip: "代词单词",
  unit: "Pronouns · 代词集",
  isPool: true,
  dialog: { q: "Who is it?", a: "It's {word}." },
  words: [
    { word: "I",    zh: "我",   phon: "/aɪ/",    example: "I am a student.", attrs: ["subject"] },
    { word: "you",  zh: "你",   phon: "/juː/",   example: "You are my friend.", attrs: ["subject"] },
    { word: "he",   zh: "他",   phon: "/hiː/",   example: "He is tall.", attrs: ["subject"] },
    { word: "she",  zh: "她",   phon: "/ʃiː/",   example: "She is kind.", attrs: ["subject"] },
    { word: "it",   zh: "它",   phon: "/ɪt/",    example: "It is a cat.", attrs: ["subject"] },
    { word: "we",   zh: "我们", phon: "/wiː/",   example: "We like apples.", attrs: ["subject"] },
    { word: "they", zh: "他们", phon: "/ðeɪ/",   example: "They are happy.", attrs: ["subject"] },
    { word: "me",   zh: "我(宾)", phon: "/miː/", example: "Help me, please.", attrs: ["object"] },
    { word: "him",  zh: "他(宾)", phon: "/hɪm/", example: "I like him.", attrs: ["object"] },
    { word: "her",  zh: "她(宾)", phon: "/hɜː(r)/", example: "Help her.", attrs: ["object"] },
    { word: "us",   zh: "我们(宾)", phon: "/ʌs/", example: "Let us go.", attrs: ["object"] },
    { word: "them", zh: "他们(宾)", phon: "/ðem/", example: "Help them.", attrs: ["object"] },
    { word: "my",   zh: "我的", phon: "/maɪ/",   example: "This is my book.", attrs: ["possessive"] },
    { word: "your", zh: "你的", phon: "/jɔː(r)/", example: "Is this your pen?", attrs: ["possessive"] },
    { word: "his",  zh: "他的", phon: "/hɪz/",   example: "This is his bag.", attrs: ["possessive"] },
    { word: "her",  zh: "她的", phon: "/hɜː(r)/", example: "This is her toy.", attrs: ["possessive"] },
    { word: "our",  zh: "我们的", phon: "/ˈaʊə(r)/", example: "This is our room.", attrs: ["possessive"] },
    { word: "their", zh: "他们的", phon: "/ðeə(r)/", example: "This is their car.", attrs: ["possessive"] },
    // ---- 疑问词 interrogative ----
    { word: "what",        zh: "什么",       phon: "/wɒt/",                 example: "What is this?",            attrs: ["interrogative"] },
    { word: "what colour", zh: "什么颜色",   phon: "/wɒt ˈkʌlə(r)/",        example: "What colour is the sky?",   attrs: ["interrogative", "phrase"] },
    { word: "what time",   zh: "几点",       phon: "/wɒt taɪm/",            example: "What time is it now?",      attrs: ["interrogative", "phrase"] },
    { word: "what day",    zh: "星期几",     phon: "/wɒt deɪ/",             example: "What day is it today?",     attrs: ["interrogative", "phrase"] },
    { word: "who",         zh: "谁",         phon: "/huː/",                 example: "Who is that girl?",         attrs: ["interrogative"] },
    { word: "whom",        zh: "谁(宾格)",   phon: "/huːm/",                example: "Whom do you like?",         attrs: ["interrogative"] },
    { word: "whose",       zh: "谁的",       phon: "/huːz/",                example: "Whose book is this?",       attrs: ["interrogative"] },
    { word: "which",       zh: "哪一个",     phon: "/wɪtʃ/",                example: "Which one is yours?",       attrs: ["interrogative"] },
  ]
});
