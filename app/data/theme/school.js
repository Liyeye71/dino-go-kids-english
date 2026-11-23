/* ============================================================
   DinoGo · 恐龙英语 — 上学了（占位主题）
   主题名称 + 文具词表；闯关地图与场景后续开放
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
  img: `images/words/tool/${word.replace(/ /g, "-")}.webp`,
}));

definePlaceholderTheme({
  id: "school",
  name: "上学了",
  chip: "学科单词",
  emoji: "🎒",
  dialog: { q: "What's this?", a: "It's a {word}." },
  mapIntro: "「上学了」主题正在筹备中…",
  plan: "后续将开放学科单词、课程表与校园场景",
  color: "#8C6B3D",
  accent: "#5C411D",
  words: SCHOOL_WORDS,
});
