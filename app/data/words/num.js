/* ============================================================
   DinoGo · 恐龙英语 — 词性词汇：数词集
   attrs: basic / advance / pro（难度）；type: 主分类
   ============================================================ */
window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
window.DINO_WORD_SETS.push({
  id: "num",
  name: "数词集",
  chip: "数词单词",
  unit: "Numbers · 数词集",
  isPool: true,
  dialog: { q: "How many?", a: "{word}." },
  words: [
    // ---- 基数词 cardinal ----
    { word: "one",    zh: "一",    phon: "/wʌn/",     example: "One apple.", attrs: ["basic"], type: "cardinal" },
    { word: "two",    zh: "二",    phon: "/tuː/",     example: "Two cats.", attrs: ["basic"], type: "cardinal" },
    { word: "three",  zh: "三",    phon: "/θriː/",    example: "Three little pigs.", attrs: ["basic"], type: "cardinal" },
    { word: "four",   zh: "四",    phon: "/fɔː(r)/",  example: "Four seasons.", attrs: ["basic"], type: "cardinal" },
    { word: "five",   zh: "五",    phon: "/faɪv/",    example: "Five days.", attrs: ["basic"], type: "cardinal" },
    { word: "six",    zh: "六",    phon: "/sɪks/",    example: "Six apples.", attrs: ["basic"], type: "cardinal" },
    { word: "seven",  zh: "七",    phon: "/ˈsevn/",   example: "Seven days a week.", attrs: ["basic"], type: "cardinal" },
    { word: "eight",  zh: "八",    phon: "/eɪt/",     example: "Eight elephants.", attrs: ["basic"], type: "cardinal" },
    { word: "nine",   zh: "九",    phon: "/naɪn/",    example: "Nine children.", attrs: ["basic"], type: "cardinal" },
    { word: "ten",    zh: "十",    phon: "/ten/",     example: "Ten fingers.", attrs: ["basic"], type: "cardinal" },
    { word: "eleven", zh: "十一",  phon: "/ɪˈlevn/",  example: "Eleven balls.", attrs: ["basic"], type: "cardinal" },
    { word: "twelve", zh: "十二",  phon: "/twelv/",   example: "Twelve months.", attrs: ["basic"], type: "cardinal" },
    { word: "thirteen", zh: "十三", phon: "/ˌθɜːˈtiːn/", example: "Thirteen kites.", attrs: ["advance"], type: "cardinal" },
    { word: "fourteen", zh: "十四", phon: "/ˌfɔːˈtiːn/", example: "Fourteen ducks.", attrs: ["advance"], type: "cardinal" },
    { word: "fifteen", zh: "十五",  phon: "/ˌfɪfˈtiːn/", example: "Fifteen stars.", attrs: ["advance"], type: "cardinal" },
    { word: "twenty", zh: "二十", phon: "/ˈtwenti/",    example: "Twenty books.", attrs: ["advance"], type: "cardinal" },
    { word: "thirty", zh: "三十", phon: "/ˈθɜːti/",     example: "Thirty flowers.", attrs: ["advance"], type: "cardinal" },
    { word: "forty",  zh: "四十", phon: "/ˈfɔːti/",     example: "Forty apples.", attrs: ["advance"], type: "cardinal" },
    { word: "fifty",  zh: "五十", phon: "/ˈfɪfti/",     example: "Fifty children.", attrs: ["advance"], type: "cardinal" },
    { word: "sixty",  zh: "六十", phon: "/ˈsɪksti/",    example: "Sixty days.", attrs: ["advance"], type: "cardinal" },
    { word: "seventy", zh: "七十", phon: "/ˈsevnti/",   example: "Seventy years.", attrs: ["advance"], type: "cardinal" },
    { word: "eighty", zh: "八十", phon: "/ˈeɪti/",      example: "Eighty cakes.", attrs: ["advance"], type: "cardinal" },
    { word: "ninety", zh: "九十", phon: "/ˈnaɪnti/",    example: "Ninety trees.", attrs: ["advance"], type: "cardinal" },
    { word: "one hundred", zh: "一百", phon: "/wʌn ˈhʌndrəd/", example: "One hundred students.", attrs: ["advance"], type: "cardinal" },
    // ---- 序数词 ordinal ----
    { word: "first",  zh: "第一", phon: "/fɜːst/",       example: "January is the first month.", attrs: ["basic"], type: "ordinal" },
    { word: "second", zh: "第二", phon: "/ˈsekənd/",    example: "You are the second.", attrs: ["basic"], type: "ordinal" },
    { word: "third",  zh: "第三", phon: "/θɜːd/",        example: "He is the third.", attrs: ["basic"], type: "ordinal" },
    { word: "fourth", zh: "第四", phon: "/fɔːθ/",        example: "April is the fourth month.", attrs: ["advance"], type: "ordinal" },
    { word: "fifth",  zh: "第五", phon: "/fɪfθ/",        example: "He is the fifth.", attrs: ["advance"], type: "ordinal" },
    { word: "sixth",  zh: "第六", phon: "/sɪksθ/",       example: "June is the sixth month.", attrs: ["advance"], type: "ordinal" },
    { word: "seventh", zh: "第七", phon: "/ˈsevnθ/",     example: "Saturday is the seventh day.", attrs: ["advance"], type: "ordinal" },
    { word: "eighth", zh: "第八", phon: "/eɪtθ/",        example: "He is the eighth.", attrs: ["pro"], type: "ordinal" },
    { word: "ninth",  zh: "第九", phon: "/naɪnθ/",       example: "September is the ninth month.", attrs: ["advance"], type: "ordinal" },
    { word: "tenth",  zh: "第十", phon: "/tenθ/",        example: "He is the tenth.", attrs: ["advance"], type: "ordinal" },
    { word: "eleventh", zh: "第十一", phon: "/ɪˈlevnθ/",  example: "He is the eleventh.", attrs: ["advance"], type: "ordinal" },
    { word: "twelfth", zh: "第十二", phon: "/twelfθ/",   example: "December is the twelfth.", attrs: ["pro"], type: "ordinal" },
  ]
});
