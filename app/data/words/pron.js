/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：代词集
   attrs: basic / advance / pro（难度）；type: 主分类
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
    { word: "I",    zh: "我",   phon: "/aɪ/",    example: "I am a student.", attrs: ["basic"], type: "subject" },
    { word: "you",  zh: "你",   phon: "/juː/",   example: "You are my friend.", attrs: ["basic"], type: "subject" },
    { word: "he",   zh: "他",   phon: "/hiː/",   example: "He is tall.", attrs: ["basic"], type: "subject" },
    { word: "she",  zh: "她",   phon: "/ʃiː/",   example: "She is kind.", attrs: ["basic"], type: "subject" },
    { word: "it",   zh: "它",   phon: "/ɪt/",    example: "It is a cat.", attrs: ["basic"], type: "subject" },
    { word: "we",   zh: "我们", phon: "/wiː/",   example: "We like apples.", attrs: ["basic"], type: "subject" },
    { word: "they", zh: "他们", phon: "/ðeɪ/",   example: "They are happy.", attrs: ["basic"], type: "subject" },
    { word: "me",   zh: "我(宾)", phon: "/miː/", example: "Help me, please.", attrs: ["basic"], type: "object" },
    { word: "him",  zh: "他(宾)", phon: "/hɪm/", example: "I like him.", attrs: ["basic"], type: "object" },
    { word: "her",  zh: "她(宾)", phon: "/hɜː(r)/", example: "Help her.", attrs: ["basic"], type: "object" },
    { word: "us",   zh: "我们(宾)", phon: "/ʌs/", example: "Let us go.", attrs: ["basic"], type: "object" },
    { word: "them", zh: "他们(宾)", phon: "/ðem/", example: "Help them.", attrs: ["basic"], type: "object" },
    { word: "my",   zh: "我的", phon: "/maɪ/",   example: "This is my book.", attrs: ["basic"], type: "possessive" },
    { word: "your", zh: "你的", phon: "/jɔː(r)/", example: "Is this your pen?", attrs: ["basic"], type: "possessive" },
    { word: "his",  zh: "他的", phon: "/hɪz/",   example: "This is his bag.", attrs: ["basic"], type: "possessive" },
    { word: "her",  zh: "她的", phon: "/hɜː(r)/", example: "This is her toy.", attrs: ["basic"], type: "possessive" },
    { word: "our",  zh: "我们的", phon: "/ˈaʊə(r)/", example: "This is our room.", attrs: ["basic"], type: "possessive" },
    { word: "their", zh: "他们的", phon: "/ðeə(r)/", example: "This is their car.", attrs: ["basic"], type: "possessive" },
    // ---- 疑问词 interrogative ----
    { word: "what",        zh: "什么",       phon: "/wɒt/",                 example: "What is this?",            attrs: ["basic"], type: "interrogative" },
    { word: "what colour", zh: "什么颜色",   phon: "/wɒt ˈkʌlə(r)/",        example: "What colour is the sky?",   attrs: ["advance"], type: "interrogative" },
    { word: "what time",   zh: "几点",       phon: "/wɒt taɪm/",            example: "What time is it now?",      attrs: ["advance"], type: "interrogative" },
    { word: "what day",    zh: "星期几",     phon: "/wɒt deɪ/",             example: "What day is it today?",     attrs: ["advance"], type: "interrogative" },
    { word: "who",         zh: "谁",         phon: "/huː/",                 example: "Who is that girl?",         attrs: ["basic"], type: "interrogative" },
    { word: "whom",        zh: "谁(宾格)",   phon: "/huːm/",                example: "Whom do you like?",         attrs: ["pro"], type: "interrogative" },
    { word: "whose",       zh: "谁的",       phon: "/huːz/",                example: "Whose book is this?",       attrs: ["advance"], type: "interrogative" },
    { word: "which",       zh: "哪一个",     phon: "/wɪtʃ/",                example: "Which one is yours?",       attrs: ["basic"], type: "interrogative" },
  ]
});
