/* ============================================================
   DinoGo · 恐龙英语 — 上学了（占位主题）
   主题名称 + 基础占位配置，具体内容后续开放设计
   ============================================================ */
defineDinoTheme({
  id: "school",
  name: "上学了",
  chip: "学科单词",
  unit: "Unit 4 · 上学了",
  emoji: "🎒",
  dialog: { q: "What's this?", a: "It's a {word}." },
  playable: false,
  words: [],
  scenes: [],
  map: {
    title: "敬请期待",
    intro: "「上学了」主题正在筹备中…",
    sceneSelector: false,
    render() {
      return `<div style="text-align:center;padding:2rem 1rem;color:#8C6B3D">
        <div style="font-size:3rem;margin-bottom:0.75rem">🎒</div>
        <h3 style="margin:0 0 0.25rem;color:#5C411D">上学了 · 主题筹备中</h3>
        <p style="font-size:0.8125rem;margin:0;color:#8C6B3D">后续将开放学科单词、课程表与校园场景</p>
      </div>`;
    },
  },
});
