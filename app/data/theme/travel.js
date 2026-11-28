 /* ============================================================
   DinoGo · 恐龙英语 — 去旅行（未开放主题）
   19 个交通词表已就绪，仅供每日随机挑战混抽；闯关暂不开放
   ============================================================ */
/* 交通词表：插画位于 images/words/transport/，文件名由单词生成 */
const TRAVEL_TRANSPORT_WORDS = buildThemeWordList([
  ["car", "小汽车", "/kɑː(r)/", "We go to the park by car.", "🚗"],
  ["bus", "公交车", "/bʌs/", "I take the bus to town.", "🚌"],
  ["school bus", "校车", "/skuːl bʌs/", "I take the school bus.", "🚌"],
  ["police car", "警车", "/pəˈliːs kɑː(r)/", "The police car is fast.", "🚓"],
  ["fire truck", "消防车", "/ˈfaɪə trʌk/", "The fire truck has a ladder.", "🚒"],
  ["ambulance", "救护车", "/ˈæmbjələns/", "The ambulance helps sick people.", "🚑"],
  ["taxi", "出租车", "/ˈtæksi/", "We take a taxi to the station.", "🚕"],
  ["jeep", "吉普车", "/dʒiːp/", "The jeep drives up the hill.", "🚙"],
  ["van", "面包车", "/væn/", "The van is white.", "🚐"],
  ["motorcycle", "摩托车", "/ˈməʊtəsaɪkl/", "He rides a motorcycle.", "🏍️"],
  ["scooter", "滑板车", "/ˈskuːtə(r)/", "I ride my scooter in the park.", "🛴"],
  ["bicycle", "自行车", "/ˈbaɪsɪkl/", "I ride my bicycle.", "🚲"],
  ["train", "火车", "/treɪn/", "The train is long.", "🚂"],
  ["bullet train", "高铁", "/ˈbʊlɪt treɪn/", "The bullet train is very fast.", "🚄"],
  ["airplane", "飞机", "/ˈeəpleɪn/", "The airplane flies high.", "✈️"],
  ["helicopter", "直升机", "/ˈhelɪkɒptə(r)/", "The helicopter flies in the sky.", "🚁"],
  ["rocket", "火箭", "/ˈrɒkɪt/", "The rocket goes to space.", "🚀"],
  ["boat", "小船", "/bəʊt/", "The boat floats on the lake.", "⛵"],
  ["tractor", "拖拉机", "/ˈtræktə(r)/", "The tractor works on the farm.", "🚜"],
  ["excavator", "挖掘机", "/ˈekskəveɪtə(r)/", "The excavator digs holes.", "🚧"],
  ["garbage truck", "垃圾车", "/ˈɡɑːbɪdʒ trʌk/", "The garbage truck comes on Monday.", "🚮"],
], "transport");

/* 旅行装备词表：复用 images/words/tool/ 下的现成插画 */
const TRAVEL_GEAR_WORDS = buildThemeWordList([
  ["suitcase", "行李箱", "/ˈsuːtkeɪs/", "Pack your clothes in the suitcase.", "🧳"],
  ["map", "地图", "/mæp/", "Look at the map to find the way.", "🗺️"],
  ["camera", "相机", "/ˈkæmrə/", "Take a photo with the camera.", "📷"],
  ["hat", "帽子", "/hæt/", "Wear a hat in the sun.", "👒"],
  ["sunglasses", "太阳镜", "/ˈsʌnɡlɑːsɪz/", "I wear sunglasses at the beach.", "🕶️"],
], "tool");

/* 旅行动作动词 6 个：开启「动作猜猜」题型，插画位于 images/words/action/travel-<word>.webp */
const TRAVEL_ACTION_WORDS = [
  { word: "drive", actor: "🦖", motion: "run", zh: "开车", phon: "/draɪv/", example: "I drive a little red car.", emoji: "🚗" },
  { word: "ride", actor: "🦖", motion: "run", zh: "骑车", phon: "/raɪd/", example: "I ride my blue bicycle.", emoji: "🚲" },
  { word: "pack", actor: "🦖", motion: "sit", zh: "打包", phon: "/pæk/", example: "I pack my yellow suitcase.", emoji: "🧳" },
  { word: "sail", actor: "🦖", motion: "swim", zh: "航行", phon: "/seɪl/", example: "We sail a boat on the sea.", emoji: "⛵" },
  { word: "camp", actor: "🦖", motion: "sit", zh: "露营", phon: "/kæmp/", example: "We camp beside the campfire.", emoji: "⛺" },
  { word: "hike", actor: "🦖", motion: "walk", zh: "徒步", phon: "/haɪk/", example: "I hike up the green hill.", emoji: "🥾" },
].map((w) => ({
  ...w,
  category: "verb",
  assetKey: `travel-${w.word}`,
  img: `images/words/action/travel-${w.word}.webp`,
}));

const TRAVEL_WORDS = [...TRAVEL_TRANSPORT_WORDS, ...TRAVEL_GEAR_WORDS, ...TRAVEL_ACTION_WORDS];

/* 路线坐标：travel-journey-map.webp 上 1~20 号圆形石阶中心（百分比，与 tools/generate-travel-map.mjs 同步） */
const TRAVEL_JOURNEY_NODES = [
  { x: 14, y: 85 }, /* 1 */
  { x: 29, y: 87 }, /* 2 */
  { x: 45, y: 83 }, /* 3 */
  { x: 61, y: 86 }, /* 4 */
  { x: 77, y: 82 }, /* 5 BOSS */
  { x: 85, y: 67 }, /* 6 */
  { x: 71, y: 60 }, /* 7 */
  { x: 54, y: 63 }, /* 8 */
  { x: 38, y: 59 }, /* 9 */
  { x: 22, y: 61 }, /* 10 BOSS */
  { x: 15, y: 45 }, /* 11 */
  { x: 28, y: 37 }, /* 12 */
  { x: 45, y: 40 }, /* 13 */
  { x: 62, y: 36 }, /* 14 */
  { x: 78, y: 39 }, /* 15 BOSS */
  { x: 85, y: 24 }, /* 16 */
  { x: 70, y: 17 }, /* 17 */
  { x: 53, y: 19 }, /* 18 */
  { x: 36, y: 16 }, /* 19 */
  { x: 20, y: 18 }, /* 20 总 BOSS */
];

const TRAVEL_JOURNEY_LEVELS = TRAVEL_JOURNEY_NODES.map((node, i) => ({
  level: i + 1,
  x: node.x,
  y: node.y,
}));

const TRAVEL_SCENES = [
  {
    id: "journey",
    name: "去旅行",
    emoji: "✈️",
    mapImage: "./images/background/travel-journey-map.webp",
    mapRatio: "1505/1045",
    sheetClass: "zoo-route-sheet",
    mapClass: "zoo",
    levelCount: TRAVEL_JOURNEY_LEVELS.length,
    levels: TRAVEL_JOURNEY_LEVELS,
    words: TRAVEL_WORDS,
  },
];

/* 已开放：19 个交通工具词 + 20 关自定义旅行路线图 */
defineDinoTheme({
  id: "travel",
  name: "去旅行",
  islandName: "去旅行",
  chip: "交通单词",
  emoji: "✈️",
  cover: "./images/background/theme-travel.webp",
  wordImgDir: "transport",
  useWrongBank: true,
  dialog: { q: "Where are we going?", a: "We are going by {word}." },
  picHint: "猜猜这是什么交通工具",
  picPrompt: "What is this?",
  scenes: TRAVEL_SCENES,
});
