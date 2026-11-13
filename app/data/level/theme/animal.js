/* ============================================================
   DinoGo · 恐龙英语 — 动物乐园：词库、地图与玩法配置
   words 为空，按 type 从 pos 文件中自动匹配对应单词
   ============================================================ */
defineDinoTheme({
  id: "animal",
  name: "动物乐园",
  chip: "动物单词",
  unit: "Unit 3 · 动物乐园",
  emoji: "🦁",
  type: "animal",
  dialog: { q: "What animal is this?", a: "It's a {word}." },
  words: [],
  map: {
    title: "草原探险",
    bg: "linear-gradient(180deg,#E4F3C8 0%,#E9F4CF 26%,#F7E9C8 33%,#F2DCA9 52%,#F6E6BF 60%,#BFE6F0 64%,#8FD3EA 100%)",
    border: "#D6E5C4",
    pts: [[70, 56], [196, 92], [92, 150], [226, 196], [112, 244], [236, 290], [126, 344]],
    route: {
      base: { stroke: "#EADFC2", width: 10, dash: "2 12" },
      done: { stroke: "#D8A05C", width: 5, dash: "1 10" },
    },
    scenery: `
      <svg class="deco" viewBox="0 0 80 80" style="right:4%;top:2%;width:14%;opacity:.95"><circle cx="40" cy="40" r="19" fill="#FFD86B"/><g stroke="#FFD86B" stroke-width="3" stroke-linecap="round"><path d="M40 5v9M40 66v9M5 40h9M66 40h9M15 15l6 6M59 59l6 6M65 15l-6 6M21 59l-6 6"/></g></svg>
      <svg class="deco" viewBox="0 0 100 110" style="left:-3%;top:24%;width:18%;opacity:.95"><rect x="46" y="52" width="8" height="52" rx="4" fill="#B98A58"/><ellipse cx="50" cy="40" rx="40" ry="18" fill="#7DB968"/><ellipse cx="26" cy="48" rx="20" ry="11" fill="#6FAE5E"/><ellipse cx="74" cy="46" rx="22" ry="12" fill="#88C275"/></svg>
      <svg class="deco" viewBox="0 0 90 130" style="right:2%;top:19%;width:14%"><path d="M44 128c-2-34 0-62 6-84" stroke="#C79A63" stroke-width="8" fill="none" stroke-linecap="round"/><g fill="#7DB968"><path d="M50 40C34 34 22 24 18 10c16 2 28 10 32 22z"/><path d="M50 40c16-6 28-16 32-30-16 2-28 10-32 22z"/><path d="M50 40C38 48 26 56 12 54c10-14 24-20 38-20z"/><path d="M50 40c12 8 24 16 38 14-10-14-24-20-38-20z"/></g><circle cx="48" cy="42" r="5" fill="#B98A58"/></svg>
      <svg class="deco" viewBox="0 0 360 60" preserveAspectRatio="none" style="left:0;top:29%;width:100%;height:13%;opacity:.9"><path d="M0 44c56-26 112-26 168-6s124 18 192-8v34H0z" fill="#EFD3A0"/></svg>
      <svg class="deco" viewBox="0 0 60 100" style="right:3%;top:40%;width:10%"><rect x="24" y="18" width="14" height="82" rx="7" fill="#6FAE5E"/><path d="M24 50H14a8 8 0 0 1-8-8V32" stroke="#6FAE5E" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M38 60h10a8 8 0 0 0 8-8V40" stroke="#6FAE5E" stroke-width="10" fill="none" stroke-linecap="round"/></svg>
      <svg class="deco" viewBox="0 0 70 50" style="left:3%;top:52%;width:12%;opacity:.95"><path d="M6 46c0-12 6-22 16-26 10 4 14 14 13 26z" fill="#C9A77A"/><path d="M24 46c0-8 4-14 10-17 8 3 11 9 11 17z" fill="#B98A58"/></svg>
      <svg class="deco" viewBox="0 0 360 150" preserveAspectRatio="none" style="left:0;bottom:0;width:100%;height:37%"><path d="M0 34c30-14 60-14 90 0s60 14 90 0 60-14 90 0 60 14 90 0v116H0z" fill="#9FDCEF"/><path d="M0 56c30-12 60-12 90 0s60 12 90 0 60-12 90 0 60 12 90 0v94H0z" fill="#79CBE4" opacity=".9"/><path d="M0 82c30-10 60-10 90 0s60 10 90 0 60-10 90 0 60 10 90 0v68H0z" fill="#5FBCDA" opacity=".75"/></svg>
      <svg class="deco" viewBox="0 0 60 36" style="left:12%;bottom:8%;width:12%"><path d="M8 18c8-11 26-11 34 0-8 11-26 11-34 0z" fill="#FFB35C"/><path d="M42 18l12-8v16z" fill="#FFB35C"/><circle cx="16" cy="16" r="2.2" fill="#5A3A12"/></svg>
      <svg class="deco" viewBox="0 0 50 50" style="right:18%;bottom:4%;width:9%"><path d="M25 3l6 14 15 1-12 10 4 15-13-8-13 8 4-15L4 18l15-1z" fill="#FF9E7A"/></svg>
      <svg class="deco" viewBox="0 0 44 40" style="left:4%;bottom:3%;width:8%"><path d="M6 34c0-12 6-22 16-26 10 4 16 14 16 26z" fill="#FFD2B8"/><path d="M14 26c2-4 6-6 8-6s6 2 8 6" stroke="#E8A98E" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    render({ prog, cfg, level, LEVELS_PER_THEME }) {
      /* -------- 动物主题专属：之字形兽径 + 爪印节点 -------- */
      const VB_W = 350, VB_H = 402;
      const mapPoint = (p) => ({
        left: ((p[0] / VB_W) * 100).toFixed(2),
        top: ((p[1] / VB_H) * 100).toFixed(2),
      });
      /* 之字形折线，像兽径踩过的脚印 */
      const animalPath = (pts, from, to) => {
        const d = [`M${pts[from][0]},${pts[from][1]}`];
        for (let i = from + 1; i <= to; i++) {
          d.push(`L${pts[i][0]},${pts[i][1]}`);
        }
        return d.join(" ");
      };

      const ANIMAL_ICONS = ["🐯","🦁","🐘","🦒","🐼","🦊","🐻"];
      const start = Math.max(1, level - 4);
      const levels = Array.from({ length: 6 }, (_, i) => start + i).filter((lvl) => lvl <= LEVELS_PER_THEME);
      const shown = levels.length;
      const pts = cfg.pts.slice(6 - shown);
      const route = animalPath(pts, 0, shown);
      const routeDone = level > start ? animalPath(pts, 0, level - start) : "";
      const nodes = levels.map((lvl, i) => {
        const pos = mapPoint(pts[i]);
        const done = lvl < level;
        const cur = lvl === level;
        const icon = ANIMAL_ICONS[(lvl - 1) % ANIMAL_ICONS.length];
        if (cur) {
          const goRight = Number(pos.top) < 26 ? " go-right" : "";
          return `<div class="mnode now${goRight}" style="left:${pos.left}%;top:${pos.top}%" data-action="start-quiz" data-level="${lvl}">
            <div class="ring"></div>
            <span class="num">${lvl}</span>
            <div class="disc">${icon}</div>
            <div class="go">GO!</div></div>`;
        }
        if (done) {
          return `<div class="mnode done" style="left:${pos.left}%;top:${pos.top}%" data-action="review-level" data-level="${lvl}">
            <span class="num">${lvl}</span>
            <div class="disc">${icon}</div>
            <span class="state">✓</span></div>`;
        }
        return `<div class="mnode locked" style="left:${pos.left}%;top:${pos.top}%" data-action="locked-level">
          <span class="num">${lvl}</span>
          <div class="disc">${icon}</div></div>`;
      }).join("");
      const chestPos = mapPoint(pts[shown]);
      const chestTop = Math.min(Number(chestPos.top), 76);
      return `${cfg.scenery}
        <svg class="route" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="none">
          ${cfg.route.under ? `<path d="${route}" fill="none" stroke="${cfg.route.under.stroke}" stroke-width="${cfg.route.under.width}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
          <path d="${route}" fill="none" stroke="${cfg.route.base.stroke}" stroke-width="${cfg.route.base.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${cfg.route.base.dash}"/>
          ${routeDone ? `<path d="${routeDone}" fill="none" stroke="${cfg.route.done.stroke}" stroke-width="${cfg.route.done.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${cfg.route.done.dash}"/>` : ""}
        </svg>
        ${nodes}
        <div class="mnode chest" style="left:${chestPos.left}%;top:${chestTop}%">
          <div class="disc">🪣</div></div>`;
    },
  },
});
