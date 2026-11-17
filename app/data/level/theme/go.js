/* ============================================================
   DinoGo · 恐龙英语 — 去旅行（占位主题）
   主题名称 + 基础占位配置，具体内容后续开放设计
   ============================================================ */
defineDinoTheme({
  id: "go",
  name: "去旅行",
  chip: "旅行单词",
  unit: "Unit 3 · 去旅行",
  emoji: "🗺️",
  dialog: { q: "Where are we going?", a: "We are going to {word}." },
  playable: false,
  words: [],
  scenes: [],
  map: {
    title: "敬请期待",
    intro: "「去旅行」主题正在筹备中…",
    sceneSelector: false,
    render() {
      return `<div style="text-align:center;padding:2rem 1rem;color:#4A6E8A">
        <div style="font-size:3rem;margin-bottom:0.75rem">🗺️</div>
        <h3 style="margin:0 0 0.25rem;color:#3A6E8A">去旅行 · 主题筹备中</h3>
        <p style="font-size:0.8125rem;margin:0;color:#7FB8DE">后续将开放世界地标、旅行场景与航线地图</p>
      </div>`;
    },
  },
});
