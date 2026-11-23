/* ============================================================
   DinoGo · 恐龙英语 — 去旅行（占位主题）
   主题名称 + 交通词表；闯关地图与场景后续开放
   ============================================================ */
/* 交通词表：插画位于 images/words/transport/，文件名由单词生成 */
const TRAVEL_WORDS = [
  ["car", "小汽车", "/kɑː(r)/", "We go to the park by car.", "🚗"],
  ["school bus", "校车", "/skuːl bʌs/", "I take the school bus.", "🚌"],
  ["police car", "警车", "/pəˈliːs kɑː(r)/", "The police car is fast.", "🚓"],
  ["fire truck", "消防车", "/ˈfaɪə trʌk/", "The fire truck has a ladder.", "🚒"],
  ["ambulance", "救护车", "/ˈæmbjələns/", "The ambulance helps sick people.", "🚑"],
  ["taxi", "出租车", "/ˈtæksi/", "We take a taxi to the station.", "🚕"],
  ["dump truck", "自卸卡车", "/dʌmp trʌk/", "The dump truck carries sand.", "🚛"],
  ["van", "面包车", "/væn/", "The van is white.", "🚐"],
  ["box truck", "厢式货车", "/bɒks trʌk/", "A box truck carries boxes.", "🚚"],
  ["motorcycle", "摩托车", "/ˈməʊtəsaɪkl/", "He rides a motorcycle.", "🏍️"],
  ["bicycle", "自行车", "/ˈbaɪsɪkl/", "I ride my bicycle.", "🚲"],
  ["train", "火车", "/treɪn/", "The train is long.", "🚂"],
  ["airplane", "飞机", "/ˈeəpleɪn/", "The airplane flies high.", "✈️"],
  ["rocket", "火箭", "/ˈrɒkɪt/", "The rocket goes to space.", "🚀"],
  ["cement mixer", "水泥搅拌车", "/sɪˈment ˈmɪksə(r)/", "The cement mixer is big.", "🏗️"],
  ["tractor", "拖拉机", "/ˈtræktə(r)/", "The tractor works on the farm.", "🚜"],
  ["excavator", "挖掘机", "/ˈekskəveɪtə(r)/", "The excavator digs holes.", "🚧"],
  ["bullet train", "高铁", "/ˈbʊlɪt treɪn/", "The bullet train is very fast.", "🚄"],
  ["garbage truck", "垃圾车", "/ˈɡɑːbɪdʒ trʌk/", "The garbage truck comes on Monday.", "🚮"],
].map(([word, zh, phon, example, emoji]) => ({
  word,
  zh,
  phon,
  example,
  emoji,
  category: "noun",
  img: `images/words/transport/${word.replace(/ /g, "-")}.webp`,
}));

definePlaceholderTheme({
  id: "travel",
  name: "去旅行",
  chip: "旅行单词",
  emoji: "🗺️",
  dialog: { q: "Where are we going?", a: "We are going to {word}." },
  mapIntro: "「去旅行」主题正在筹备中…",
  plan: "后续将开放世界地标、旅行场景与航线地图",
  color: "#4A6E8A",
  accent: "#3A6E8A",
  words: TRAVEL_WORDS,
});
