/* ============================================================
   DinoGo · 恐龙英语 — 上学了（未开放主题）
   15 件文具词表已就绪，仅供每日随机挑战混抽；闯关暂不开放
   ============================================================ */
/* 文具词表：插画位于 images/words/tool/，文件名由单词生成 */
const SCHOOL_WORDS = [
  ["pencil", "铅笔", "/ˈpensl/", "I draw with a pencil.", "✏️"],
  ["crayon", "蜡笔", "/ˈkreɪən/", "The crayon is red.", "🖍️"],
  ["pen", "钢笔", "/pen/", "This pen is blue.", "🖊️"],
  ["marker", "马克笔", "/ˈmɑːkə(r)/", "I write with a marker.", "🖊️"],
  ["scissors", "剪刀", "/ˈsɪzəz/", "Cut the paper with scissors.", "✂️"],
  ["glue", "胶水", "/ɡluː/", "I use glue to stick the paper.", "🧴"],
  ["notebook", "笔记本", "/ˈnəʊtbʊk/", "Write it in your notebook.", "📓"],
  ["book", "书", "/bʊk/", "This book is fun.", "📘"],
  ["textbook", "课本", "/ˈtekstbʊk/", "Open your textbook.", "📕"],
  ["notepad", "便签本", "/ˈnəʊtpæd/", "I draw on the notepad.", "📝"],
  ["eraser", "橡皮", "/ɪˈreɪzə(r)/", "The eraser is small.", "🧽"],
  ["ruler", "尺子", "/ˈruːlə(r)/", "The ruler is long.", "📏"],
  ["backpack", "书包", "/ˈbækpæk/", "My backpack is heavy.", "🎒"],
  ["paint palette", "调色盘", "/peɪnt ˈpælət/", "Mix the colors on the paint palette.", "🎨"],
  ["globe", "地球仪", "/ɡləʊb/", "The globe shows the world.", "🌍"],
].map(([word, zh, phon, example, emoji]) => ({
  word,
  zh,
  phon,
  example,
  emoji,
  category: "noun",
  assetKey: word,
  img: `images/words/tool/${word.replace(/ /g, "-")}.webp`,
  /* 情景对话：把例句中的目标词挖空 */
  dialogueClue: example.replace(
    new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}\\b`, "i"),
    "___"
  ),
}));

/* 未开放：词表先接入每日随机挑战，闯关入口保持「敬请期待」 */
definePlaceholderTheme({
  id: "school",
  name: "上学了",
  chip: "文具单词",
  emoji: "🎒",
  dialog: { q: "What's this?", a: "It's a {word}." },
  color: "#8C6B3D",
  accent: "#5C411D",
  tip: "#A08560",
  plan: "铅笔、尺子、书包装进书包，闯关地图正在筹备中",
  mapIntro: "「上学了」词表已就绪，闯关地图正在筹备中…",
  picHint: "猜猜这是什么文具",
  picPrompt: "What is this?",
  words: SCHOOL_WORDS,
});
