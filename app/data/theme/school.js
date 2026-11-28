/* ============================================================
   DinoGo · 恐龙英语 — 上学了（未开放主题）
   26 件文具/教室词表已就绪，仅供每日随机挑战混抽；闯关暂不开放
   ============================================================ */
/* 文具词表：插画位于 images/words/tool/，文件名由单词生成 */
const SCHOOL_WORDS = buildThemeWordList([
  ["pencil", "铅笔", "/ˈpensl/", "I draw with a pencil.", "✏️"],
  ["crayon", "蜡笔", "/ˈkreɪən/", "The crayon is red.", "🖍️"],
  ["pen", "钢笔", "/pen/", "This pen is blue.", "🖊️"],
  ["marker", "马克笔", "/ˈmɑːkə(r)/", "I write with a marker.", "🖊️"],
  ["scissors", "剪刀", "/ˈsɪzəz/", "Cut the paper with scissors.", "✂️"],
  ["glue", "胶水", "/ɡluː/", "I use glue to stick the paper.", "🧴"],
  ["notebook", "笔记本", "/ˈnəʊtbʊk/", "Write it in your notebook.", "📓"],
  ["book", "书", "/bʊk/", "This book is fun.", "📘"],
  ["eraser", "橡皮", "/ɪˈreɪzə(r)/", "The eraser is small.", "🧽"],
  ["ruler", "尺子", "/ˈruːlə(r)/", "The ruler is long.", "📏"],
  ["backpack", "书包", "/ˈbækpæk/", "My backpack is heavy.", "🎒"],
  ["paint palette", "调色盘", "/peɪnt ˈpælət/", "Mix the colors on the paint palette.", "🎨"],
  ["globe", "地球仪", "/ɡləʊb/", "The globe shows the world.", "🌍"],
  ["pencil case", "铅笔盒", "/ˈpensl keɪs/", "My pencil case is blue.", "✏️"],
  ["water bottle", "水壶", "/ˈwɔːtə ˈbɒtl/", "I drink water from my water bottle.", "🥤"],
  ["alarm clock", "闹钟", "/əˈlɑːm klɒk/", "The alarm clock rings in the morning.", "⏰"],
  ["bell", "铃铛", "/bel/", "The school bell rings.", "🔔"],
  ["blackboard", "黑板", "/ˈblækbɔːd/", "The teacher writes on the blackboard.", "📋"],
  ["desk", "书桌", "/desk/", "My desk is clean.", "🪑"],
  ["chair", "椅子", "/tʃeə(r)/", "Sit on the chair.", "💺"],
  ["lamp", "台灯", "/læmp/", "Turn on the lamp.", "💡"],
  ["glasses", "眼镜", "/ˈɡlɑːsɪz/", "I wear glasses to read.", "👓"],
], "tool");

/* 校园动作动词 6 个：开启「动作猜猜」题型，插画位于 images/words/action/school-<word>.webp */
const SCHOOL_ACTION_WORDS = [
  { word: "read", actor: "🦖", motion: "sit", zh: "读", phon: "/riːd/", example: "I read a picture book.", emoji: "📖" },
  { word: "write", actor: "🦖", motion: "sit", zh: "写", phon: "/raɪt/", example: "I write in my notebook.", emoji: "✍️" },
  { word: "draw", actor: "🦖", motion: "dance", zh: "画画", phon: "/drɔː/", example: "I draw a rainbow with crayons.", emoji: "🎨" },
  { word: "cut", actor: "🦖", motion: "sit", zh: "剪", phon: "/kʌt/", example: "I cut the paper with scissors.", emoji: "✂️" },
  { word: "study", actor: "🦖", motion: "sit", zh: "学习", phon: "/ˈstʌdi/", example: "I study hard at school.", emoji: "💡" },
  { word: "count", actor: "🦖", motion: "stand", zh: "数数", phon: "/kaʊnt/", example: "Let's count the wooden blocks.", emoji: "🔢" },
].map((w) => ({
  ...w,
  category: "verb",
  assetKey: `school-${w.word}`,
  img: `images/words/action/school-${w.word}.webp`,
}));

const SCHOOL_ALL_WORDS = [...SCHOOL_WORDS, ...SCHOOL_ACTION_WORDS];

/* 路线坐标：school-campus-map.webp 上 1~20 号圆形石阶中心（百分比，与 tools/generate-school-map.mjs 同步） */
const SCHOOL_CAMPUS_NODES = [
  { x: 14, y: 86 }, /* 1 */
  { x: 28, y: 84 }, /* 2 */
  { x: 43, y: 87 }, /* 3 */
  { x: 59, y: 84 }, /* 4 */
  { x: 75, y: 81 }, /* 5 BOSS */
  { x: 84, y: 68 }, /* 6 */
  { x: 72, y: 59 }, /* 7 */
  { x: 56, y: 62 }, /* 8 */
  { x: 40, y: 58 }, /* 9 */
  { x: 24, y: 60 }, /* 10 BOSS */
  { x: 15, y: 45 }, /* 11 */
  { x: 27, y: 36 }, /* 12 */
  { x: 44, y: 39 }, /* 13 */
  { x: 61, y: 35 }, /* 14 */
  { x: 77, y: 38 }, /* 15 BOSS */
  { x: 86, y: 24 }, /* 16 */
  { x: 72, y: 17 }, /* 17 */
  { x: 55, y: 19 }, /* 18 */
  { x: 38, y: 16 }, /* 19 */
  { x: 22, y: 18 }, /* 20 总 BOSS */
];

const SCHOOL_CAMPUS_LEVELS = SCHOOL_CAMPUS_NODES.map((node, i) => ({
  level: i + 1,
  x: node.x,
  y: node.y,
}));

const SCHOOL_SCENES = [
  {
    id: "campus",
    name: "上学文具岛",
    emoji: "🎒",
    mapImage: "./images/background/school-campus-map.webp",
    mapRatio: "1505/1045",
    sheetClass: "zoo-route-sheet",
    mapClass: "zoo",
    levelCount: SCHOOL_CAMPUS_LEVELS.length,
    levels: SCHOOL_CAMPUS_LEVELS,
    words: SCHOOL_ALL_WORDS,
  },
];

/* 已开放：26 个文具/教室词 + 20 关自定义校园路线图 */
defineDinoTheme({
  id: "school",
  name: "上学了",
  islandName: "上学文具岛",
  chip: "文具单词",
  emoji: "🎒",
  cover: "./images/background/theme-school.webp",
  wordImgDir: "tool",
  useWrongBank: true,
  dialog: { q: "What's this?", a: "It's a {word}." },
  picHint: "猜猜这是什么文具",
  picPrompt: "What is this?",
  scenes: SCHOOL_SCENES,
});
