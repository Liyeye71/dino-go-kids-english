/* ============================================================
   DinoGo · 恐龙英语 — 去旅行（未开放主题）
   19 个交通词表已就绪，仅供每日随机挑战混抽；闯关暂不开放
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
  assetKey: word,
  img: `images/words/transport/${word.replace(/ /g, "-")}.webp`,
  /* 情景对话：把例句中的目标词挖空 */
  dialogueClue: example.replace(
    new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}\\b`, "i"),
    "___"
  ),
}));

/* 未开放：词表先接入每日随机挑战，闯关入口保持「敬请期待」 */
definePlaceholderTheme({
  id: "travel",
  name: "去旅行",
  chip: "交通单词",
  emoji: "🗺️",
  dialog: { q: "Where are we going?", a: "We are going by {word}." },
  color: "#4A6E8A",
  accent: "#3A6E8A",
  tip: "#6B8CA6",
  plan: "汽车、火车、飞机排好队，闯关地图正在筹备中",
  mapIntro: "「去旅行」词表已就绪，闯关地图正在筹备中…",
  picHint: "猜猜这是什么交通工具",
  picPrompt: "What is this?",
  words: TRAVEL_WORDS,
});
