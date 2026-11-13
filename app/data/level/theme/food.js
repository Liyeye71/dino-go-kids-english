/* ============================================================
   DinoGo · 恐龙英语 — 美食节：词库、地图与玩法配置
   涵盖水果 + 所有食物词汇（noun.js 已统一 type: "food"）
   ============================================================ */
defineDinoTheme({
  id: "food",
  name: "美食节",
  chip: "食物单词",
  unit: "Unit 4 · 美食节",
  emoji: "🍽️",
  type: "food",
  dialog: { q: "What do you want?", a: "I want some {word}." },
  words: [],
  map: {
    title: "美食嘉年华",
    bg: "linear-gradient(180deg,#FFF4E0 0%,#FFE5BF 35%,#FFCF8A 70%,#FFB266 100%)",
    border: "#FFB06B",
    pts: [[175, 54], [86, 96], [182, 144], [272, 196], [178, 246], [86, 296], [186, 348]],
    route: {
      under: { stroke: "#C96B2C", width: 14 },
      base: { stroke: "#FFF8E7", width: 3, dash: "8 10" },
      done: { stroke: "#E63946", width: 3.2, dash: "8 10" },
    },
    scenery: `
      <svg class="deco" viewBox="0 0 80 80" style="left:4%;top:2%;width:14%;opacity:.95">
        <circle cx="40" cy="40" r="22" fill="#FFE26A"/>
        <circle cx="40" cy="40" r="14" fill="#FFB266"/>
        <path d="M40 28 C50 28 52 48 40 48 C28 48 30 28 40 28" fill="#E63946" opacity=".7"/>
      </svg>
      <svg class="deco" viewBox="0 0 90 60" style="right:3%;top:5%;width:24%;opacity:.92">
        <ellipse cx="45" cy="20" rx="22" ry="10" fill="#FF6B35"/>
        <rect x="23" y="25" width="44" height="30" rx="4" fill="#FFF8E7"/>
        <path d="M30 50 Q45 56 60 50 L60 55 L30 55 Z" fill="#FF8A4C"/>
        <rect x="34" y="30" width="8" height="8" rx="2" fill="#F2C14E"/>
        <rect x="48" y="30" width="8" height="8" rx="2" fill="#F2C14E"/>
      </svg>
      <svg class="deco" viewBox="0 0 360 40" preserveAspectRatio="none" style="left:0;top:14%;width:100%;height:10%">
        <path d="M0 20 Q60 0 120 20 T240 20 T360 20" fill="none" stroke="#E63946" stroke-width="2"/>
        <g fill="#E63946"><polygon points="10,10 16,18 4,18"/><polygon points="70,24 76,32 64,32"/><polygon points="130,8 136,16 124,16"/><polygon points="190,22 196,30 184,30"/><polygon points="250,10 256,18 244,18"/><polygon points="310,24 316,32 304,32"/></g>
      </svg>
      <svg class="deco" viewBox="0 0 100 80" style="left:2%;top:36%;width:18%;opacity:.92">
        <path d="M10 70 Q25 40 50 30 Q75 40 90 70 Z" fill="#D94E2B"/>
        <path d="M20 60 Q35 45 50 42 Q65 45 80 60" fill="none" stroke="#FFF8E7" stroke-width="2"/>
        <circle cx="50" cy="42" r="6" fill="#FFD24D"/>
      </svg>
      <svg class="deco" viewBox="0 0 80 90" style="right:3%;top:38%;width:14%;opacity:.9">
        <path d="M40 5 L65 25 L55 25 L55 85 L25 85 L25 25 L15 25 Z" fill="#F2C14E"/>
        <path d="M40 20 L55 30 L50 30 L50 80 L30 80 L30 30 L25 30 Z" fill="#E63946"/>
        <circle cx="40" cy="55" r="8" fill="#FFF8E7"/>
        <circle cx="40" cy="55" r="4" fill="#E63946"/>
      </svg>
      <svg class="deco" viewBox="0 0 120 50" style="left:1%;top:58%;width:22%;opacity:.9">
        <path d="M10 24 Q20 6 32 24" stroke="#7DB968" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M32 24 Q42 6 54 24" stroke="#7DB968" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M54 24 Q64 6 76 24" stroke="#7DB968" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M76 24 Q86 6 98 24" stroke="#7DB968" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g fill="#D94E2B"><circle cx="20" cy="18" r="5"/><circle cx="42" cy="18" r="5"/><circle cx="64" cy="18" r="5"/><circle cx="86" cy="18" r="5"/></g>
        <rect x="6" y="24" width="108" height="22" rx="4" fill="#FFF8E7" stroke="#E63946" stroke-width="1.2"/>
        <text x="60" y="40" text-anchor="middle" font-size="8" font-weight="900" fill="#E63946" font-family="Arial">SUSHI BAR</text>
      </svg>
      <svg class="deco" viewBox="0 0 80 50" style="right:2%;top:58%;width:14%;opacity:.9">
        <rect x="28" y="24" width="24" height="24" rx="3" fill="#FFF8E7" stroke="#C96B2C" stroke-width="1.5"/>
        <path d="M34 18 L34 30" stroke="#5B3A12" stroke-width="3" stroke-linecap="round"/>
        <circle cx="34" cy="16" r="4" fill="#D94E2B"/>
        <circle cx="34" cy="16" r="1.5" fill="#FFE26A"/>
        <rect x="30" y="28" width="16" height="4" rx="1.5" fill="#5B3A12"/>
      </svg>
      <svg class="deco" viewBox="0 0 120 70" style="left:2%;bottom:42%;width:22%;opacity:.88">
        <path d="M6 54 Q28 36 54 36 Q80 36 100 54 L100 66 L6 66 Z" fill="#FFF8E7" stroke="#C96B2C" stroke-width="1.2"/>
        <circle cx="28" cy="26" r="10" fill="#F7A3B5" stroke="#B73E5E" stroke-width="1.2"/>
        <circle cx="58" cy="22" r="12" fill="#FCE9A5" stroke="#C28F1D" stroke-width="1.2"/>
        <circle cx="86" cy="28" r="11" fill="#A8D8E8" stroke="#3D6C8C" stroke-width="1.2"/>
        <circle cx="32" cy="24" r="1.8" fill="#E63946"/>
        <circle cx="62" cy="20" r="2" fill="#C28F1D"/>
        <circle cx="90" cy="26" r="1.8" fill="#3D6C8C"/>
      </svg>
      <svg class="deco" viewBox="0 0 100 90" style="right:5%;bottom:38%;width:18%;opacity:.88">
        <rect x="8" y="40" width="84" height="45" rx="6" fill="#FFF8E7"/>
        <rect x="8" y="35" width="84" height="10" rx="4" fill="#E63946"/>
        <path d="M14 35 L22 20 L30 35 Z" fill="#E63946"/>
        <path d="M42 35 L50 22 L58 35 Z" fill="#E63946"/>
        <path d="M70 35 L78 20 L86 35 Z" fill="#E63946"/>
        <rect x="30" y="55" width="40" height="14" rx="3" fill="#FFB266"/>
        <text x="50" y="66" text-anchor="middle" font-size="10" font-weight="900" fill="#FFF8E7" font-family="Arial">YUMMY</text>
      </svg>
      <svg class="deco" viewBox="0 0 60 100" style="left:3%;bottom:22%;width:11%;opacity:.92">
        <path d="M30 95 L14 78 L46 78 Z" fill="#FFF8E7" stroke="#C96B2C" stroke-width="1.2"/>
        <path d="M18 78 Q30 30 42 78" fill="#FFB266"/>
        <ellipse cx="30" cy="32" rx="10" ry="7" fill="#E63946"/>
        <circle cx="26" cy="30" r="1.5" fill="#FFF8E7"/>
        <circle cx="34" cy="30" r="1.5" fill="#FFF8E7"/>
        <circle cx="30" cy="28" r="1.5" fill="#FFF8E7"/>
      </svg>
      <svg class="deco" viewBox="0 0 100 80" style="right:3%;bottom:22%;width:18%;opacity:.9">
        <ellipse cx="50" cy="62" rx="42" ry="10" fill="#E0DDD6"/>
        <path d="M22 62 Q50 32 78 62 Z" fill="#E63946"/>
        <path d="M28 56 Q50 42 72 56" fill="none" stroke="#FFF8E7" stroke-width="1.8"/>
        <circle cx="40" cy="54" r="3" fill="#FFF8E7"/>
        <circle cx="56" cy="50" r="3" fill="#FFF8E7"/>
        <circle cx="62" cy="56" r="3" fill="#FFF8E7"/>
      </svg>
      <svg class="deco" viewBox="0 0 80 80" style="left:1%;bottom:3%;width:16%;opacity:.9">
        <ellipse cx="40" cy="55" rx="32" ry="18" fill="#F2C14E"/>
        <path d="M8 55 Q40 10 72 55" fill="#FF6B35"/>
        <ellipse cx="40" cy="25" rx="20" ry="10" fill="#FFF8E7"/>
      </svg>
      <svg class="deco" viewBox="0 0 100 90" style="right:4%;bottom:3%;width:18%;opacity:.9">
        <path d="M50 12 Q66 24 50 36 Q34 24 50 12" fill="#FFF8E7" stroke="#D94E2B" stroke-width="1.5"/>
        <path d="M50 36 L26 82 L74 82 Z" fill="#F2C14E"/>
        <path d="M38 54 L62 54" stroke="#D94E2B" stroke-width="1.8"/>
        <path d="M34 64 L66 64" stroke="#D94E2B" stroke-width="1.8"/>
        <path d="M40 74 L60 74" stroke="#D94E2B" stroke-width="1.8"/>
        <circle cx="50" cy="24" r="2" fill="#E63946"/>
      </svg>
      <svg class="deco" viewBox="0 0 120 40" style="left:0;bottom:18%;width:100%;height:10%;opacity:.8">
        <path d="M0 20 Q30 0 60 20 T120 20" fill="none" stroke="#E63946" stroke-width="2"/>
        <g fill="#F2C14E"><polygon points="15,8 20,14 10,14"/><polygon points="45,22 50,28 40,28"/><polygon points="75,6 80,12 70,12"/><polygon points="105,22 110,28 100,28"/></g>
      </svg>`,
    render({ prog, cfg, level, LEVELS_PER_THEME }) {
      /* -------- 美食节专属：彩带波浪 + 餐盘节点 + 蛋糕宝箱 -------- */
      const VB_W = 350, VB_H = 402;
      const mapPoint = (p) => ({
        left: ((p[0] / VB_W) * 100).toFixed(2),
        top: ((p[1] / VB_H) * 100).toFixed(2),
      });
      /* 彩带波浪，像节日彩带飘动 */
      const carnivalPath = (pts, from, to) => {
        const d = [`M${pts[from][0]},${pts[from][1]}`];
        for (let i = from; i < to; i++) {
          const p1 = pts[i], p2 = pts[i + 1];
          const midX = (p1[0] + p2[0]) / 2;
          const delta = (p2[1] - p1[1]);
          const amp = Math.max(18, Math.abs(delta) * 0.65);
          const dir = (i % 2 === 0) ? 1 : -1;
          d.push(`Q${midX},${((p1[1]+p2[1])/2) - amp*dir} ${p2[0]},${p2[1]}`);
        }
        return d.join(" ");
      };

      /* 综合水果+食物节点图标 */
      const FEST_ICONS = ["🍎","🍔","🍕","🍰","🍜","🥗","🍰","🍗","🥟","🥪"];
      const start = Math.max(1, level - 4);
      const levels = Array.from({ length: 6 }, (_, i) => start + i).filter((lvl) => lvl <= LEVELS_PER_THEME);
      const shown = levels.length;
      const pts = cfg.pts.slice(6 - shown);
      const route = carnivalPath(pts, 0, shown);
      const routeDone = level > start ? carnivalPath(pts, 0, level - start) : "";
      const nodes = levels.map((lvl, i) => {
        const pos = mapPoint(pts[i]);
        const done = lvl < level;
        const cur = lvl === level;
        const icon = FEST_ICONS[(lvl - 1) % FEST_ICONS.length];
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
          <div class="disc">🎂</div></div>`;
    },
  },
});
