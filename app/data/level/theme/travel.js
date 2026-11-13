/* ============================================================
   DinoGo · 恐龙英语 — 环球旅行：词库、地图与玩法配置
   words 为空，按 type 从 pos 文件中自动匹配对应单词
   ============================================================ */
defineDinoTheme({
  id: "travel",
  name: "环球旅行",
  chip: "旅行单词",
  unit: "Unit 2 · 环球旅行",
  emoji: "✈️",
  type: "vehicle",
  dialog: { q: "Where shall we go?", a: "Let's visit {word}." },
  words: [],
  map: {
    title: "世界航线",
    bg: "linear-gradient(180deg,#A8D4F0 0%,#C5E4F5 28%,#EAF6FD 55%,#FDF5E3 82%,#FFF8E7 100%)",
    border: "#7FB8DE",
    pts: [[175, 54], [88, 110], [236, 158], [104, 214], [248, 262], [118, 304], [214, 350]],
    route: {
      under: { stroke: "#B0C4D4", width: 2, dash: "0" },
      base: { stroke: "#4A6E8A", width: 2.4, dash: "10 6" },
      done: { stroke: "#FF6F61", width: 2.4, dash: "10 6" },
    },
    scenery: `
      <svg class="deco" viewBox="0 0 80 80" style="left:3%;top:2%;width:12%;opacity:.9"><circle cx="40" cy="40" r="22" fill="#FFE7A8"/><circle cx="40" cy="40" r="16" fill="#FFD25E"/><g stroke="#FFD25E" stroke-width="2.2" stroke-linecap="round"><path d="M40 5v8M40 67v8M5 40h8M67 40h8M14 14l5.5 5.5M60 60l5.5 5.5M66 14l-5.5 5.5M20 60l-5.5 5.5"/></g></svg>
      <svg class="deco" viewBox="0 0 100 44" style="right:2%;top:5%;width:22%;opacity:.85"><ellipse cx="28" cy="28" rx="24" ry="14" fill="#fff" opacity=".9"/><ellipse cx="55" cy="22" rx="20" ry="12" fill="#fff" opacity=".9"/><ellipse cx="75" cy="30" rx="18" ry="10" fill="#fff" opacity=".85"/></svg>
      <svg class="deco" viewBox="0 0 90 44" style="left:1%;top:20%;width:17%;opacity:.65"><ellipse cx="28" cy="28" rx="22" ry="12" fill="#fff"/><ellipse cx="55" cy="24" rx="18" ry="10" fill="#fff"/></svg>
      <svg class="deco" viewBox="0 0 400 80" preserveAspectRatio="none" style="left:0;top:36%;width:100%;height:18%"><defs><linearGradient id="oceanGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#5FBCDA"/><stop offset="100%" stop-color="#3A9AB7"/></linearGradient></defs><rect x="0" y="12" width="400" height="68" rx="0" fill="url(#oceanGrad)"/><path d="M0 20 Q50 12 100 20 T200 20 T300 20 T400 20" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 5" opacity=".6"/><path d="M0 34 Q50 26 100 34 T200 34 T300 34 T400 34" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="3 4" opacity=".5"/><path d="M0 50 Q50 42 100 50 T200 50 T300 50 T400 50" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 4" opacity=".4"/></svg>
      <svg class="deco" viewBox="0 0 120 70" style="left:3%;top:52%;width:22%;opacity:.95"><path d="M0 70 L20 30 L40 45 L60 15 L80 35 L100 20 L120 40 L120 70 Z" fill="#7DB968"/><path d="M0 70 L15 55 L35 60 L55 42 L75 55 L95 48 L120 58 L120 70 Z" fill="#5E9E52"/></svg>
      <svg class="deco" viewBox="0 0 140 60" style="right:2%;top:56%;width:24%;opacity:.9"><path d="M10 60 L25 35 L45 48 L65 28 L85 42 L105 32 L130 50 L130 60 Z" fill="#88C275"/><path d="M10 60 L22 48 L42 52 L62 38 L82 48 L102 42 L130 55 L130 60 Z" fill="#6FAE5E"/></svg>
      <svg class="deco" viewBox="0 0 50 80" style="left:3%;bottom:4%;width:9%"><path d="M25 76 L6 44 L18 44 L18 20 L32 20 L32 44 L44 44 Z" fill="#FF8A4C"/><rect x="21" y="48" width="8" height="28" fill="#E4C99C"/></svg>
      <svg class="deco" viewBox="0 0 60 80" style="right:4%;bottom:3%;width:10%"><circle cx="30" cy="24" r="18" fill="#EAF4FC"/><path d="M12 50 Q30 42 48 50 L48 76 L12 76 Z" fill="#3A6E8A"/><circle cx="30" cy="24" r="4" fill="#5FBCDA"/></svg>`,
    render({ prog, cfg, level, LEVELS_PER_THEME }) {
      /* -------- 旅行主题专属：虚线航线 + 地标节点 + 行李箱 -------- */
      const VB_W = 350, VB_H = 402;
      const mapPoint = (p) => ({
        left: ((p[0] / VB_W) * 100).toFixed(2),
        top: ((p[1] / VB_H) * 100).toFixed(2),
      });
      /* 航线：CATmull-Rom 贝塞尔 + 方向箭头装饰 */
      const travelPath = (pts, from, to) => {
        const d = [`M${pts[from][0]},${pts[from][1]}`];
        const t = 0.28;
        for (let i = from; i < to; i++) {
          const p0 = pts[i - 1] || pts[i];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[i + 2] || p2;
          d.push(`C${(p1[0]+(p2[0]-p0[0])*t).toFixed(1)},${(p1[1]+(p2[1]-p0[1])*t).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])*t).toFixed(1)},${(p2[1]-(p3[1]-p1[1])*t).toFixed(1)} ${p2[0]},${p2[1]}`);
        }
        return d.join(" ");
      };

      /* 飞机沿着航线飞过的位置：每段中点 */
      const planeMarkers = (pts, from, to) => {
        const arr = [];
        for (let i = from; i < to; i++) {
          const mx = (pts[i][0] + pts[i + 1][0]) / 2;
          const my = (pts[i][1] + pts[i + 1][1]) / 2;
          const ang = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180 / Math.PI;
          arr.push({ x: mx, y: my, ang });
        }
        return arr;
      };

      const LANDMARKS = ["🗼","🏰","🗽","🗻","🏝️","🏛️","🗿"];
      const start = Math.max(1, level - 4);
      const levels = Array.from({ length: 6 }, (_, i) => start + i).filter((lvl) => lvl <= LEVELS_PER_THEME);
      const shown = levels.length;
      const pts = cfg.pts.slice(6 - shown);
      const route = travelPath(pts, 0, shown);
      const routeDone = level > start ? travelPath(pts, 0, level - start) : "";
      const planes = planeMarkers(pts, 0, shown);
      const nodes = levels.map((lvl, i) => {
        const pos = mapPoint(pts[i]);
        const done = lvl < level;
        const cur = lvl === level;
        const mark = LANDMARKS[(lvl - 1) % LANDMARKS.length];
        if (cur) {
          const goRight = Number(pos.top) < 26 ? " go-right" : "";
          return `<div class="mnode now${goRight}" style="left:${pos.left}%;top:${pos.top}%" data-action="start-quiz" data-level="${lvl}">
            <div class="ring"></div>
            <span class="num">${lvl}</span>
            <div class="disc">${mark}</div>
            <div class="go">GO!</div></div>`;
        }
        if (done) {
          return `<div class="mnode done" style="left:${pos.left}%;top:${pos.top}%" data-action="review-level" data-level="${lvl}">
            <span class="num">${lvl}</span>
            <div class="disc">${mark}</div>
            <span class="state">✓</span></div>`;
        }
        return `<div class="mnode locked" style="left:${pos.left}%;top:${pos.top}%" data-action="locked-level">
          <span class="num">${lvl}</span>
          <div class="disc">${mark}</div></div>`;
      }).join("");
      const chestPos = mapPoint(pts[shown]);
      const chestTop = Math.min(Number(chestPos.top), 76);
      const planeIcons = planes.map((p) => `<g transform="translate(${p.x},${p.y}) rotate(${p.ang})"><path d="M-9 0 L5 -3 L9 -1 L5 0 L9 3 L5 1 Z" fill="#FF6F61" stroke="#fff" stroke-width="1.2"/></g>`).join("");
      return `${cfg.scenery}
        <svg class="route" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="none">
          ${cfg.route.under ? `<path d="${route}" fill="none" stroke="${cfg.route.under.stroke}" stroke-width="${cfg.route.under.width}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
          <path d="${route}" fill="none" stroke="${cfg.route.base.stroke}" stroke-width="${cfg.route.base.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${cfg.route.base.dash}"/>
          ${routeDone ? `<path d="${routeDone}" fill="none" stroke="${cfg.route.done.stroke}" stroke-width="${cfg.route.done.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${cfg.route.done.dash}"/>` : ""}
          <g>${planeIcons}</g>
        </svg>
        ${nodes}
        <div class="mnode chest" style="left:${chestPos.left}%;top:${chestTop}%">
          <div class="disc">🧳</div></div>`;
    },
  },
});
