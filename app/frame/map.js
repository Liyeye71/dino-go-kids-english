/* ============================================================
   DinoGo · 恐龙英语 — 闯关（map）
   底部 Tab 2：关卡地图 + 答题 + 结算 + 进化
   ============================================================ */

/* ------------------------------------------------ map */

/* 每个主题一张专属地图：点位（viewBox 350×402）、路线配色与场景装饰 */
const MAP_THEMES = {
  /* 水果大冒险：森林 · 乡间小路 */
  fruit: {
    title: "词汇森林",
    bg: "linear-gradient(180deg,#E9F6D6 0%,#F3F7DA 60%,#FBF2D8 100%)",
    border: "#DCE9C6",
    pts: [[58, 62], [150, 48], [242, 80], [278, 162], [200, 224], [104, 282], [206, 344]],
    route: {
      base: { stroke: "#D6E6B8", width: 9, dash: "2 13" },
      done: { stroke: "#8CC46C", width: 5, dash: "1 11" },
    },
    scenery: `
      <svg class="deco" viewBox="0 0 80 80" style="right:3%;top:2%;width:14%;opacity:.95"><circle cx="40" cy="40" r="19" fill="#FFD86B"/><g stroke="#FFD86B" stroke-width="3" stroke-linecap="round"><path d="M40 5v9M40 66v9M5 40h9M66 40h9M15 15l6 6M59 59l6 6M65 15l-6 6M21 59l-6 6"/></g></svg>
      <svg class="deco" viewBox="0 0 90 44" style="left:1%;top:21%;width:20%;opacity:.9"><ellipse cx="28" cy="30" rx="22" ry="12" fill="#fff"/><ellipse cx="50" cy="23" rx="20" ry="14" fill="#fff"/><ellipse cx="69" cy="30" rx="16" ry="10" fill="#fff"/></svg>
      <svg class="deco" viewBox="0 0 90 44" style="right:0;top:46%;width:18%;opacity:.7"><ellipse cx="28" cy="30" rx="22" ry="12" fill="#fff"/><ellipse cx="50" cy="23" rx="20" ry="14" fill="#fff"/><ellipse cx="69" cy="30" rx="16" ry="10" fill="#fff"/></svg>
      <svg class="deco" viewBox="0 0 100 120" style="right:0;bottom:5%;width:25%;opacity:.95"><rect x="45" y="70" width="10" height="40" rx="4" fill="#B98A58"/><circle cx="50" cy="46" r="30" fill="#7DB968"/><circle cx="28" cy="58" r="20" fill="#6FAE5E"/><circle cx="72" cy="56" r="22" fill="#88C275"/></svg>
      <svg class="deco" viewBox="0 0 70 100" style="left:4%;top:34%;width:15%;opacity:.85"><rect x="31" y="56" width="8" height="38" rx="3" fill="#B98A58"/><path d="M35 4l26 46H9z" fill="#77B563"/><path d="M35 30l22 36H13z" fill="#8CC478"/></svg>
      <svg class="deco" viewBox="0 0 100 50" style="left:0;bottom:25%;width:20%;opacity:.9"><ellipse cx="30" cy="36" rx="28" ry="16" fill="#8CC478"/><ellipse cx="62" cy="34" rx="24" ry="18" fill="#7DB968"/><ellipse cx="82" cy="42" rx="16" ry="10" fill="#9BD485"/></svg>
      <svg class="deco" viewBox="0 0 50 50" style="right:9%;top:59%;width:10%"><rect x="20" y="24" width="10" height="20" rx="4" fill="#F7E7C8"/><path d="M4 26C4 12 14 4 25 4s21 8 21 22z" fill="#F08A72"/><circle cx="16" cy="16" r="3.5" fill="#FFE7D2"/><circle cx="32" cy="19" r="2.6" fill="#FFE7D2"/></svg>
      <svg class="deco" viewBox="0 0 40 30" style="left:22%;top:26%;width:7%;opacity:.85"><path d="M20 15C12 4 2 6 4 14c2 8 12 7 16 1z" fill="#FFC94A"/><path d="M20 15c8-11 18-9 16-1-2 8-12 7-16 1z" fill="#FFB0A0"/><path d="M20 9v12" stroke="#B98A58" stroke-width="1.6" stroke-linecap="round"/></svg>
      <svg class="deco" viewBox="0 0 90 60" style="left:2%;bottom:2%;width:20%;opacity:.9"><path d="M12 58c0-16 4-27 11-36M30 58c0-10 2-18 7-25M50 58c0-8 2-13 5-18" stroke="#86BD72" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="23" cy="18" r="3.4" fill="#FFC94A"/><circle cx="23" cy="10" r="3.4" fill="#FFC94A"/><circle cx="16" cy="14" r="3.4" fill="#FFC94A"/><circle cx="30" cy="14" r="3.4" fill="#FFC94A"/><circle cx="23" cy="14" r="2.2" fill="#F08A72"/><circle cx="59" cy="30" r="2.8" fill="#FF9E9E"/><circle cx="59" cy="23" r="2.8" fill="#FF9E9E"/><circle cx="53" cy="27" r="2.8" fill="#FF9E9E"/><circle cx="65" cy="27" r="2.8" fill="#FF9E9E"/></svg>
      <svg class="deco" viewBox="0 0 120 50" style="left:24%;bottom:3%;width:20%;opacity:.9"><rect x="6" y="10" width="9" height="38" rx="4" fill="#E4C99C"/><rect x="36" y="10" width="9" height="38" rx="4" fill="#E4C99C"/><rect x="66" y="10" width="9" height="38" rx="4" fill="#E4C99C"/><rect x="96" y="10" width="9" height="38" rx="4" fill="#E4C99C"/><rect x="0" y="18" width="118" height="7" rx="3" fill="#F0DCB8"/><rect x="0" y="34" width="118" height="7" rx="3" fill="#F0DCB8"/></svg>`,
  },
  /* 汽车派对：城市 · 环城公路 */
  cars: {
    title: "汽车大道",
    bg: "linear-gradient(180deg,#DCF0FA 0%,#EAF6FD 42%,#F4FAFE 100%)",
    border: "#CBE3F1",
    pts: [[175, 54], [88, 110], [236, 158], [104, 214], [248, 262], [118, 304], [214, 350]],
    route: {
      under: { stroke: "#A9B4BF", width: 26 },
      base: { stroke: "#F6F9FB", width: 3, dash: "9 12" },
      done: { stroke: "#FFC24B", width: 3, dash: "9 12" },
    },
    scenery: `
      <svg class="deco" viewBox="0 0 80 80" style="left:4%;top:3%;width:13%;opacity:.95"><circle cx="40" cy="40" r="19" fill="#FFD86B"/><g stroke="#FFD86B" stroke-width="3" stroke-linecap="round"><path d="M40 5v9M40 66v9M5 40h9M66 40h9M15 15l6 6M59 59l6 6M65 15l-6 6M21 59l-6 6"/></g></svg>
      <svg class="deco" viewBox="0 0 90 44" style="right:2%;top:3%;width:20%;opacity:.9"><ellipse cx="28" cy="30" rx="22" ry="12" fill="#fff"/><ellipse cx="50" cy="23" rx="20" ry="14" fill="#fff"/><ellipse cx="69" cy="30" rx="16" ry="10" fill="#fff"/></svg>
      <svg class="deco" viewBox="0 0 90 44" style="left:0;top:17%;width:17%;opacity:.7"><ellipse cx="28" cy="30" rx="22" ry="12" fill="#fff"/><ellipse cx="50" cy="23" rx="20" ry="14" fill="#fff"/><ellipse cx="69" cy="30" rx="16" ry="10" fill="#fff"/></svg>
      <svg class="deco" viewBox="0 0 90 30" style="right:17%;top:8%;width:15%;opacity:.65"><g stroke="#8B98A6" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M4 14c4-5 8-5 12 0M24 8c4-5 8-5 12 0M50 18c4-5 8-5 12 0"/></g></svg>
      <svg class="deco" viewBox="0 0 360 130" preserveAspectRatio="none" style="left:0;bottom:0;width:100%;height:30%;opacity:.45"><defs><pattern id="mapWin" width="16" height="18" patternUnits="userSpaceOnUse"><rect x="2.5" y="2.5" width="8" height="10" rx="1.5" fill="#EAF4FC"/></pattern></defs><g fill="#A9C0D4"><rect x="0" y="46" width="56" height="84" rx="5"/><rect x="62" y="66" width="40" height="64" rx="5"/><rect x="108" y="30" width="36" height="100" rx="5"/><rect x="150" y="58" width="50" height="72" rx="5"/><rect x="206" y="26" width="38" height="104" rx="5"/><rect x="250" y="52" width="46" height="78" rx="5"/><rect x="302" y="70" width="58" height="60" rx="5"/></g><g fill="url(#mapWin)"><rect x="6" y="52" width="44" height="72"/><rect x="66" y="72" width="32" height="52"/><rect x="113" y="36" width="26" height="88"/><rect x="155" y="64" width="40" height="60"/><rect x="211" y="32" width="28" height="92"/><rect x="255" y="58" width="36" height="66"/><rect x="307" y="76" width="48" height="48"/></g></svg>
      <svg class="deco" viewBox="0 0 40 110" style="left:3%;top:42%;width:9%"><rect x="17" y="22" width="6" height="88" rx="3" fill="#93A0AD"/><path d="M20 24c0-9 7-13 14-13" stroke="#93A0AD" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="26" y="6" width="13" height="9" rx="4" fill="#FFD86B"/></svg>
      <svg class="deco" viewBox="0 0 34 92" style="right:4%;top:58%;width:8%"><rect x="15" y="4" width="5" height="86" rx="2.5" fill="#93A0AD"/><rect x="4" y="8" width="26" height="54" rx="10" fill="#3D4854"/><circle cx="17" cy="20" r="6" fill="#FF6F61"/><circle cx="17" cy="34" r="6" fill="#FFC94A"/><circle cx="17" cy="48" r="6" fill="#5BC178"/></svg>
      <svg class="deco" viewBox="0 0 60 92" style="right:6%;top:17%;width:12%"><rect x="27" y="38" width="6" height="52" rx="3" fill="#93A0AD"/><rect x="4" y="6" width="52" height="36" rx="9" fill="#2E8B57"/><rect x="8" y="10" width="44" height="28" rx="6" fill="#fff" opacity=".18"/><text x="30" y="31" text-anchor="middle" font-size="17" font-weight="900" fill="#fff" font-family="Arial, Helvetica, sans-serif">GO</text></svg>
      <svg class="deco" viewBox="0 0 100 60" style="left:6%;bottom:2%;width:16%"><rect x="6" y="26" width="88" height="20" rx="10" fill="#FF8A4C"/><path d="M24 26l10-14h32l10 14z" fill="#FFB27A"/><rect x="36" y="15" width="12" height="10" rx="3" fill="#EAF4FC"/><rect x="52" y="15" width="12" height="10" rx="3" fill="#EAF4FC"/><circle cx="28" cy="48" r="8" fill="#3D4854"/><circle cx="72" cy="48" r="8" fill="#3D4854"/><circle cx="28" cy="48" r="3.2" fill="#CBD5DE"/><circle cx="72" cy="48" r="3.2" fill="#CBD5DE"/></svg>`,
  },
  /* 动物园奇遇：森林 · 沙漠 · 海洋 */
  zoo: {
    title: "动物探险",
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
  },
  /* 美食街：夜市 · 小吃长街 */
  food: {
    title: "美食长街",
    bg: "linear-gradient(180deg,#FFF3DC 0%,#FFE9C9 45%,#FBDDB6 100%)",
    border: "#F3DEBB",
    pts: [[175, 54], [86, 96], [182, 144], [272, 196], [178, 246], [86, 296], [186, 348]],
    route: {
      under: { stroke: "#EED6B4", width: 20 },
      base: { stroke: "#FFFBF2", width: 3, dash: "7 11" },
      done: { stroke: "#FFAE55", width: 3, dash: "7 11" },
    },
    scenery: `
      <svg class="deco" viewBox="0 0 360 60" preserveAspectRatio="none" style="left:0;top:0;width:100%;height:9%"><path d="M0 6C90 40 270 40 360 6" stroke="#C9A272" stroke-width="2" fill="none"/><g fill="#FFD86B"><circle cx="45" cy="22" r="4"/><circle cx="90" cy="30" r="4"/><circle cx="135" cy="34" r="4"/><circle cx="180" cy="35" r="4"/><circle cx="225" cy="34" r="4"/><circle cx="270" cy="30" r="4"/><circle cx="315" cy="22" r="4"/></g></svg>
      <svg class="deco" viewBox="0 0 110 120" style="left:0;top:30%;width:26%"><rect x="10" y="44" width="92" height="10" rx="5" fill="#D9A05B"/><rect x="16" y="54" width="80" height="62" rx="8" fill="#FBEFD9"/><rect x="16" y="54" width="80" height="12" rx="6" fill="#EFD7B2"/><rect x="6" y="20" width="98" height="24" rx="9" fill="#F08A72"/><g fill="#FFF1DE"><rect x="16" y="24" width="12" height="20"/><rect x="40" y="24" width="12" height="20"/><rect x="64" y="24" width="12" height="20"/><rect x="88" y="24" width="12" height="20"/></g><circle cx="40" cy="88" r="9" fill="#FFC94A"/><circle cx="66" cy="88" r="9" fill="#FF9E7A"/></svg>
      <svg class="deco" viewBox="0 0 110 120" style="right:0;top:56%;width:24%;transform:scaleX(-1)"><rect x="10" y="44" width="92" height="10" rx="5" fill="#D9A05B"/><rect x="16" y="54" width="80" height="62" rx="8" fill="#FBEFD9"/><rect x="16" y="54" width="80" height="12" rx="6" fill="#EFD7B2"/><rect x="6" y="20" width="98" height="24" rx="9" fill="#FFC06B"/><g fill="#FFF1DE"><rect x="16" y="24" width="12" height="20"/><rect x="40" y="24" width="12" height="20"/><rect x="64" y="24" width="12" height="20"/><rect x="88" y="24" width="12" height="20"/></g><circle cx="40" cy="88" r="9" fill="#FF9E7A"/><circle cx="66" cy="88" r="9" fill="#FFC94A"/></svg>
      <svg class="deco" viewBox="0 0 60 120" style="left:2%;top:5%;width:9%"><path d="M30 74c-2 14-1 24 4 38" stroke="#C9A272" stroke-width="2" fill="none"/><ellipse cx="30" cy="46" rx="17" ry="21" fill="#FF8A4C"/><ellipse cx="24" cy="37" rx="5" ry="7" fill="#FFD2B8" opacity=".7"/><path d="M27 67h6l-3 8z" fill="#FF8A4C"/></svg>
      <svg class="deco" viewBox="0 0 60 120" style="right:3%;top:40%;width:8%"><path d="M30 74c-2 14-1 24 4 38" stroke="#C9A272" stroke-width="2" fill="none"/><ellipse cx="30" cy="46" rx="17" ry="21" fill="#FF9E9E"/><ellipse cx="24" cy="37" rx="5" ry="7" fill="#FFD2B8" opacity=".7"/><path d="M27 67h6l-3 8z" fill="#FF9E9E"/></svg>
      <svg class="deco" viewBox="0 0 100 90" style="left:1%;bottom:3%;width:19%"><rect x="8" y="30" width="84" height="32" rx="8" fill="#FFF3DA"/><path d="M2 30V24c0-6 5-11 11-11h74c6 0 11 5 11 11v6z" fill="#7DB968"/><g fill="#FFF1DE"><rect x="14" y="13" width="12" height="17"/><rect x="38" y="13" width="12" height="17"/><rect x="62" y="13" width="12" height="17"/><rect x="84" y="13" width="10" height="17"/></g><rect x="8" y="58" width="84" height="6" rx="3" fill="#D9A05B"/><circle cx="26" cy="72" r="9" fill="#8B98A6"/><circle cx="74" cy="72" r="9" fill="#8B98A6"/><circle cx="26" cy="72" r="3.5" fill="#E4EAF0"/><circle cx="74" cy="72" r="3.5" fill="#E4EAF0"/></svg>`,
  },
};

/* 当前主题对应的地图配置，缺省回落到水果森林 */
function mapTheme() {
  const t = MAP_THEMES[currentTheme().id];
  return t || MAP_THEMES.fruit;
}
/* 平滑路线：Catmull-Rom 转三次贝塞尔，节点与路线始终贴合 */
function routePath(pts, from = 0, to = pts.length - 1) {
  const d = [`M${pts[from][0]},${pts[from][1]}`];
  const t = 0.18;
  for (let i = from; i < to; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = (p1[0] + (p2[0] - p0[0]) * t).toFixed(1);
    const c1y = (p1[1] + (p2[1] - p0[1]) * t).toFixed(1);
    const c2x = (p2[0] - (p3[0] - p1[0]) * t).toFixed(1);
    const c2y = (p2[1] - (p3[1] - p1[1]) * t).toFixed(1);
    d.push(`C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`);
  }
  return d.join(" ");
}
/* viewBox 350×402 → 百分比定位 */
function mapPoint(p) {
  return { left: ((p[0] / 350) * 100).toFixed(2), top: ((p[1] / 402) * 100).toFixed(2) };
}

function screenMap() {
  const prog = themeProgress();
  const level = prog.level;
  const start = Math.max(1, level - 4);
  const levels = Array.from({ length: 6 }, (_, i) => start + i).filter((lvl) => lvl <= LEVELS_PER_THEME);
  const starTotal = themeStars(prog);
  const theme = currentTheme();
  const cfg = mapTheme();
  /* 关卡少于 6 个时整体下移，宝箱始终落在最后一个点位上 */
  const shown = levels.length;
  const pts = cfg.pts.slice(6 - shown);
  const nodes = levels.map((lvl, i) => {
    const pos = mapPoint(pts[i]);
    const done = lvl < level;
    const cur = lvl === level;
    const s = prog.stars[lvl] || (cur ? 0 : 3);
    let inner;
    if (cur) {
      inner = `<div class="mnode now" style="left:${pos.left}%;top:${pos.top}%" data-action="start-quiz">
        <div class="ring"></div><div class="disc">${dino(state.stage, { equipped: state.equipped })}</div><div class="go">GO</div>
        <div class="mlabel">${String(lvl).padStart(2, "0")} · 当前</div></div>`;
    } else if (done) {
      inner = `<div class="mnode done ${s === 2 ? "half" : ""}" style="left:${pos.left}%;top:${pos.top}%" data-action="review-level" data-level="${lvl}">
        <div class="mstars">${star(9)}<span>${s}</span></div>
        <div class="disc"><span class="num" style="font-size:14px;font-weight:900">${String(lvl).padStart(2, "0")}</span></div>
        <div class="mlabel">第 ${String(lvl).padStart(2, "0")} 关 · 复习</div></div>`;
    } else {
      inner = `<div class="mnode locked" style="left:${pos.left}%;top:${pos.top}%" data-action="locked-level">
        <div class="disc">${I.lock(20, "#B7B09C")}</div><div class="mlabel">${String(lvl).padStart(2, "0")} · 未解锁</div></div>`;
    }
    return inner;
  }).join("");
  const chest = `<div class="mnode chest" style="left:${mapPoint(pts[shown]).left}%;top:${mapPoint(pts[shown]).top}%">
    <div class="disc">${I.gift(24, "#7A4E08")}</div><div class="mlabel">宝箱</div></div>`;
  return `<section class="screen has-tab" data-screen="map">
    <div class="scroll">
      <div class="topbar">
        <button class="circle-btn" data-action="tab" data-screen="home" aria-label="返回乐园">${I.back(18)}</button>
        <div class="t"><h1>${cfg.title}</h1><p>${theme.unit} · 第 ${level} / ${LEVELS_PER_THEME} 关</p></div>
        ${starPill()}
      </div>

      <div class="theme-tabs">
        ${WORD_SETS.map((t) => `<button class="tt ${t.id === theme.id ? "on" : ""}" data-action="theme" data-theme="${t.id}">
          <b>${t.emoji}</b>${t.name}
        </button>`).join("")}
      </div>

      <section class="card unit-card">
        <div class="uc-head">
          <div class="uc-lb">UNIT PROGRESS<b>本单元进度</b></div>
          <div class="uc-star">${star(12)}<b class="num">${starTotal}</b><i>/ ${LEVELS_PER_THEME * 3}</i></div>
        </div>
        <div class="uc-bar"><i style="width:${Math.round(((level - 1) / LEVELS_PER_THEME) * 100)}%"></i></div>
        <div class="uc-row"><span>已通关</span><span><b class="num">${level - 1}</b> / ${LEVELS_PER_THEME} 关</span></div>
      </section>

      <section class="card next-card">
        <div class="uc-nl">
          <div class="uc-kicker">UP NEXT ${I.chevron(8)} 第 ${level} 关</div>
          <h3>${theme.name}</h3>
          <div class="uc-meta"><span>${theme.words.length} 个词 · 5 道题 · ★×${PASS_STARS} 解锁下一关</span><span class="uc-st">${star(9)}${star(9)}${star(9)}</span></div>
        </div>
        <button class="uc-btn" data-action="start-quiz">开始闯关</button>
      </section>

      <div class="map-canvas" style="background:${cfg.bg};border-color:${cfg.border}">
        ${cfg.scenery}
        <svg class="route" viewBox="0 0 350 402" preserveAspectRatio="none">
          ${cfg.route.under ? `<path d="${routePath(pts, 0, shown)}" fill="none" stroke="${cfg.route.under.stroke}" stroke-width="${cfg.route.under.width}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
          <path d="${routePath(pts, 0, shown)}" fill="none" stroke="${cfg.route.base.stroke}" stroke-width="${cfg.route.base.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${cfg.route.base.dash}"/>
          ${level > start ? `<path d="${routePath(pts, 0, level - start)}" fill="none" stroke="${cfg.route.done.stroke}" stroke-width="${cfg.route.done.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${cfg.route.done.dash}"/>` : ""}
        </svg>
        ${nodes}${chest}
      </div>
    </div>
    ${tabbar("map")}
  </section>`;
}

/* ------------------------------------------------ quiz */
/* 关卡难度递进：1-2 关简单单词，3-4 关加入连线，5-6 关加入跟读，7 关起加入情景对话 */
const TASK_LABEL = { pic: "看图选词", listen: "听音选图", match: "单词连线", repeat: "跟读练习", dialog: "情景对话" };
const TASK_TITLE = {
  pic: "看图，选出正确的单词",
  listen: "听单词，选出正确的图片",
  match: "把单词和图片连起来",
  repeat: "听发音，大声跟读这个单词",
  dialog: "读对话，选出正确的单词",
};
function levelPlan(level) {
  if (level <= 2) return ["pic", "listen", "pic", "listen", "pic"];
  if (level === 3) return ["pic", "listen", "match", "pic", "listen"];
  if (level === 4) return ["listen", "pic", "match", "listen", "pic"];
  if (level === 5) return ["pic", "match", "repeat", "listen", "pic"];
  if (level === 6) return ["listen", "repeat", "match", "pic", "listen"];
  if (level === 7) return ["pic", "match", "repeat", "dialog", "listen"];
  if (level === 8) return ["listen", "dialog", "match", "repeat", "pic"];
  if (level === 9) return ["dialog", "match", "listen", "dialog", "repeat"];
  return ["dialog", "listen", "dialog", "match", "repeat"];
}
const UNKNOWN_ART = () => emojiArt("❓");
let artMap = null;
/* 当前主题的「单词 → 插图」索引，避免每个选项都线性查找 */
function artOf(word) {
  const theme = currentTheme();
  if (!artMap || artMap.id !== theme.id) {
    artMap = { id: theme.id, map: new Map(theme.words.map((w) => [w.word, w.art])) };
  }
  return artMap.map.get(word) || UNKNOWN_ART;
}
function buildTasks(level) {
  const theme = currentTheme();
  const pool = theme.words;
  const picks = shuffle(pool);
  const dlg = theme.dialog || { q: "What's this?", a: "It's a {word}." };
  return levelPlan(level).map((type, i) => {
    const w = picks[i % picks.length];
    const task = { type, word: w.word, art: w.art, phon: w.phon, dlgQ: dlg.q, dlgA: dlg.a };
    if (type === "match") {
      const trio = shuffle(pool).slice(0, 3);
      task.pairs = trio.map((x) => ({ word: x.word, art: x.art }));
      task.words = shuffle(trio.map((x) => x.word));
      task.arts = shuffle(trio.map((x) => ({ word: x.word, art: x.art })));
    } else if (type !== "repeat") {
      const n = type === "dialog" ? 3 : 4;
      task.options = shuffle([w.word, ...shuffle(pool.filter((x) => x.word !== w.word)).slice(0, n - 1).map((x) => x.word)]);
    }
    return task;
  });
}
function startQuiz(level) {
  const lvl = Math.min(LEVELS_PER_THEME, Math.max(1, Number(level) || themeProgress().level));
  quiz = {
    level: lvl,
    index: 0,
    correct: 0,
    hearts: 3,
    combo: 0,
    selected: null,
    revealed: false,
    choiceCorrect: null,
    matched: [],
    pickWord: null,
    matchWrong: 0,
    startedAt: Date.now(),
    words: [],
    order: buildTasks(lvl),
  };
  lastResult = null;
  levelCue(currentTheme().id);
  go("quiz");
  speakTask();
}

function screenQuiz() {
  if (!quiz) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const total = quiz.order.length;
  const q = quiz.order[quiz.index];
  const selected = quiz.selected;
  const revealed = quiz.revealed;
  const hearts = [0, 1, 2].map((i) => I.heart(16, "#FF6F61", i < quiz.hearts ? 1 : 0.22)).join("");
  const letters = ["A", "B", "C", "D"];
  const options = (list) => list.map((opt, i) => {
    let cls = "option";
    if (revealed) {
      if (opt === q.word) cls += " correct";
      else if (opt === selected) cls += " wrong";
      else cls += " dim";
    } else if (opt === selected) cls += " sel";
    const mark = revealed && opt === q.word ? `<span class="mark">${I.check(11)}</span>`
      : !revealed && opt === selected ? `<span class="mark radio"><i></i></span>` : "";
    return `<button class="${cls}" data-action="select" data-word="${opt}">
      <span class="key">${letters[i]}</span><span class="word">${opt}</span>${mark}
    </button>`;
  }).join("");
  let body;
  let btn;
  if (q.type === "match") {
    const solved = quiz.matched;
    const wordCol = q.words.map((w) => `<button class="mcard word ${solved.includes(w) ? "ok" : ""} ${quiz.pickWord === w ? "sel" : ""}"
        data-action="match-word" data-word="${w}">${w}</button>`).join("");
    const artCol = q.arts.map((p) => `<button class="mcard art ${solved.includes(p.word) ? "ok" : ""}"
        data-action="match-art" data-word="${p.word}">${p.art()}</button>`).join("");
    body = `<div class="match-grid"><div class="match-col">${wordCol}</div><div class="match-col">${artCol}</div></div>`;
    btn = `<button class="btn" disabled>连对 3 组即可过关 ${I.arrow(18)}</button>`;
  } else if (q.type === "repeat") {
    body = `<div class="quiz-art">
        <div class="blob"></div>
        <div class="art-tag">READ IT OUT</div>
        ${q.art()}
        <button class="listen" data-action="speak-word" data-word="${q.word}">${I.speaker(14)} 点我听发音</button>
      </div>
      <div class="repeat-word"><b>${q.word}</b><span>${q.phon || ""}</span><i>大声读三遍，点下面完成</i></div>`;
    btn = revealed ? `<button class="btn" data-action="next">${quiz.index >= total - 1 || quiz.hearts <= 0 ? "查看成绩" : "下一题"} ${I.arrow(18)}</button>`
      : `<button class="btn" data-action="repeat-done">我读好了 ${I.arrow(18)}</button>`;
  } else if (q.type === "listen") {
    body = `<div class="quiz-art listen-art">
        <div class="blob"></div>
        <div class="art-tag">LISTEN &amp; CHOOSE</div>
        <button class="big-speaker" data-action="speak-word" data-word="${q.word}" aria-label="再听一遍">${I.speaker(46)}</button>
        <div class="listen-tip">听发音，选出对应的图片</div>
      </div>
      <div class="options pic-grid">${q.options.map((opt, i) => {
        let cls = "option pic";
        if (revealed) {
          if (opt === q.word) cls += " correct";
          else if (opt === selected) cls += " wrong";
          else cls += " dim";
        } else if (opt === selected) cls += " sel";
        const label = revealed && opt === q.word ? `<b class="pic-word">${opt}</b>` : "";
        return `<button class="${cls}" data-action="select" data-word="${opt}">
          <span class="key">${letters[i]}</span><span class="pic">${artOf(opt)()}</span>${label}
        </button>`;
      }).join("")}</div>`;
    btn = !selected ? `<button class="btn" disabled>选一张图片 ${I.arrow(18)}</button>`
      : !revealed ? `<button class="btn" data-action="check">检查答案 ${I.arrow(18)}</button>`
        : `<button class="btn" data-action="next">${quiz.index >= total - 1 || quiz.hearts <= 0 ? "查看成绩" : "下一题"} ${I.arrow(18)}</button>`;
  } else if (q.type === "dialog") {
    body = `<div class="dialog-card">
        <div class="dlg"><span class="who">A</span><p>${q.dlgQ}</p><span class="dlg-pic">${q.art()}</span></div>
        <div class="dlg me"><span class="who">B</span><p>${q.dlgA.replace("{word}", `<b class="blank">${revealed ? q.word : "＿＿"}</b>`)}</p></div>
      </div>
      <div class="options one-col">${options(q.options)}</div>`;
    btn = !selected ? `<button class="btn" disabled>选一个单词 ${I.arrow(18)}</button>`
      : !revealed ? `<button class="btn" data-action="check">检查答案 ${I.arrow(18)}</button>`
        : `<button class="btn" data-action="next">${quiz.index >= total - 1 || quiz.hearts <= 0 ? "查看成绩" : "下一题"} ${I.arrow(18)}</button>`;
  } else {
    body = `<div class="quiz-art">
        <div class="blob"></div>
        <div class="art-tag">WHAT IS IT?</div>
        <span class="art-spark s1">${spark(15, "#E8C377")}</span>
        <span class="art-spark s2">${spark(11, "#E8C377")}</span>
        <span class="art-spark s3">${spark(8, "#E8C377")}</span>
        ${q.art()}
        ${revealed ? `<button class="listen" data-action="speak-word" data-word="${q.word}">${I.speaker(14)} ${q.word}</button>` : `<div class="listen" style="pointer-events:none">${I.speaker(14)} 答完听发音</div>`}
      </div>
      <div class="options">${options(q.options)}</div>`;
    btn = !selected ? `<button class="btn" disabled>选一个答案 ${I.arrow(18)}</button>`
      : !revealed ? `<button class="btn" data-action="check">检查答案 ${I.arrow(18)}</button>`
        : `<button class="btn" data-action="next">${quiz.index >= total - 1 || quiz.hearts <= 0 ? "查看成绩" : "下一题"} ${I.arrow(18)}</button>`;
  }
  let combo;
  if (revealed) {
    combo = quiz.choiceCorrect
      ? `太棒了！连对 <b>${quiz.combo}</b> 题${quiz.combo >= 2 ? ` · 结算星星 <b>x${(1 + state.starBonus).toFixed(1)}</b>` : ""}`
      : `答错啦，正确答案是 <b>${q.word}</b>`;
  } else if (quiz.combo >= 2) {
    combo = `连对 <b>${quiz.combo}</b> 题 · 保持节奏！`;
  } else {
    combo = `连续答对 3 题，结算星星有加成`;
  }
  return `<section class="screen quiz-page" data-screen="quiz">
    <div class="quiz-top">
      <button class="circle-btn" data-action="close-quiz" aria-label="退出闯关">${I.close(16)}</button>
      <div class="bar qbar"><i style="width:${Math.round((quiz.index / total) * 100)}%"></i></div>
      <div class="qcount num">${quiz.index + 1} <em>/ ${total}</em></div>
      <div class="hearts">${hearts}</div>
    </div>
    <div class="quiz-body">
      <div class="quiz-prompt">
        <div class="chip">LEVEL ${String(quiz.level).padStart(2, "0")} · ${TASK_LABEL[q.type]}</div>
        <h2>${TASK_TITLE[q.type]}</h2>
      </div>
      ${body}
    </div>
    <div class="quiz-foot">
      <div class="combo ${revealed && !quiz.choiceCorrect ? "silent" : ""}">${I.flame(13)} ${combo}</div>
      ${btn}
    </div>
  </section>`;
}
function speakTask() {
  const q = quiz && quiz.order[quiz.index];
  if (q && (q.type === "listen" || q.type === "repeat")) setTimer(() => speak(q.word), 450);
}
function selectOption(word) {
  if (!quiz) return;
  speak(word);
  if (quiz.revealed) return;
  quiz.selected = word;
  sfx("tap");
  render();
}
function matchPickWord(word) {
  if (!quiz || quiz.revealed) return;
  speak(word);
  quiz.pickWord = word;
  sfx("tap");
  render();
}
function matchPickArt(word) {
  if (!quiz || quiz.revealed || !quiz.pickWord) return;
  const q = quiz.order[quiz.index];
  if (word === quiz.pickWord) {
    quiz.matched.push(word);
    quiz.pickWord = null;
    sfx("correct");
    if (quiz.matched.length >= q.pairs.length) {
      quiz.revealed = true;
      quiz.choiceCorrect = quiz.matchWrong === 0;
      if (quiz.choiceCorrect) { quiz.correct++; quiz.combo++; q.pairs.forEach((p) => quiz.words.push(p.word)); }
      else quiz.combo = 0;
      render();
      setTimer(() => nextQuestion(), 1500);
      return;
    }
  } else {
    quiz.matchWrong++;
    quiz.pickWord = null;
    quiz.hearts = Math.max(0, quiz.hearts - 1);
    quiz.combo = 0;
    sfx("wrong");
    if (quiz.hearts <= 0) {
      quiz.revealed = true;
      quiz.choiceCorrect = false;
      render();
      setTimer(() => nextQuestion(), 1600);
      return;
    }
    toast("这两张不匹配，再试一次");
  }
  render();
}
function repeatDone() {
  if (!quiz || quiz.revealed) return;
  const q = quiz.order[quiz.index];
  quiz.revealed = true;
  quiz.choiceCorrect = true;
  quiz.correct++;
  quiz.combo++;
  quiz.words.push(q.word);
  sfx("correct");
  render();
  setTimer(() => nextQuestion(), 1400);
}
function checkAnswer() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  const q = quiz.order[quiz.index];
  const ok = quiz.selected === q.word;
  quiz.revealed = true;
  quiz.choiceCorrect = ok;
  if (ok) {
    quiz.correct++;
    quiz.combo++;
    quiz.words.push(q.word);
    sfx("correct");
  } else {
    quiz.hearts = Math.max(0, quiz.hearts - 1);
    quiz.combo = 0;
    sfx("wrong");
  }
  render();
  if (quiz && (quiz.index >= quiz.order.length - 1 || quiz.hearts <= 0)) {
    setTimer(() => nextQuestion(), 1800);
  } else {
    setTimer(() => nextQuestion(), 2200);
  }
}
function nextQuestion() {
  if (!quiz) return;
  clearTimers();
  if (quiz.index >= quiz.order.length - 1 || quiz.hearts <= 0) { finishQuiz(); return; }
  quiz.index++;
  quiz.selected = null;
  quiz.revealed = false;
  quiz.choiceCorrect = null;
  quiz.matched = [];
  quiz.pickWord = null;
  quiz.matchWrong = 0;
  render();
  speakTask();
}

function finishQuiz() {
  if (!quiz) return;
  const total = quiz.order.length;
  const accuracy = quiz.correct / total;
  /* 答对 3 题 1 星、4 题 2 星、5 题 3 星；2 星及以上才解锁下一关 */
  const stars = quiz.correct >= total ? 3 : quiz.correct >= total - 1 ? 2 : quiz.correct >= total - 2 ? 1 : 0;
  const passed = stars >= PASS_STARS;
  const growthGain = quiz.correct * 24;
  const prog = themeProgress();
  const completedLevel = quiz.level;
  const prevBest = prog.stars[completedLevel] || 0;
  const best = Math.max(prevBest, stars);
  /* 按最高星结算：重复复习只补发「刷新纪录」的差额星星 */
  const starGain = Math.round(Math.max(0, [0, 5, 10, 15][best] - [0, 5, 10, 15][prevBest]) * (1 + (state.starBonus || 0)));
  const isReplay = completedLevel < prog.level;
  const elapsed = Math.max(5, Math.round((Date.now() - quiz.startedAt) / 1000));
  state.growth += growthGain;
  state.stars += starGain;
  prog.stars[completedLevel] = best;
  /* 只有挑战当前关卡且达到 2 星才推进进度，复习旧关卡不影响进度 */
  if (passed && !isReplay) prog.level = Math.min(LEVELS_PER_THEME, completedLevel + 1);
  state.words += quiz.correct;
  state.minutes += Math.max(1, Math.round(elapsed / 60));
  state.threeStars += stars === 3 ? 1 : 0;
  state.tasks.level = true;
  recordLevel(stars);
  const target = stageForGrowth(state.growth);
  const canEvolve = stageIndex(target.key) > stageIndex(state.stage);
  lastResult = {
    level: completedLevel,
    replay: isReplay,
    prevBest,
    best,
    correct: quiz.correct,
    total,
    accuracy: Math.round(accuracy * 100),
    stars,
    passed,
    growthGain,
    starGain,
    seconds: elapsed,
    newWords: quiz.correct,
    canEvolve,
    targetStage: target.key,
    wordList: [...new Set(quiz.words)].slice(0, 3),
  };
  quiz = null;
  save();
  sfx(stars === 3 ? "win" : "coin");
  go("result", { replace: true });
}

/* ------------------------------------------------ result */
function screenResult() {
  if (!lastResult) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const r = lastResult;
  const st = stageMeta(state.stage);
  const next = nextStage(st.key);
  const pending = r.canEvolve && r.targetStage;
  const target = pending ? stageMeta(r.targetStage) : null;
  const pct = next ? clamp((state.growth - st.min) / (next.min - st.min), 0, 1) : 1;
  const mm = String(Math.floor(r.seconds / 60)).padStart(1, "0");
  const ss = String(r.seconds % 60).padStart(2, "0");
  const starRow = [0, 1, 2].map((i) => star(i === 1 ? 80 : 62, i < r.best ? "#FFC94A" : "#F1E7D2", i < r.best ? "#E9A93C" : "#E5D7BC", i < r.best ? 1 : 0.55)).join("");
  const confettiPieces = Array.from({ length: 26 }, (_, i) => {
    const colors = ["#FFC94A", "#FF8A4C", "#5BC178", "#9FDCF2", "#B8A7FF", "#FF6F61"];
    const w = 5 + (i % 4) * 2, h = 8 + (i % 5) * 3;
    return `<i style="left:${(i * 37 + 13) % 100}%;top:${(i * 29 + 5) % 92}%;width:${w}px;height:${h}px;background:${colors[i % 6]};transform:rotate(${(i * 47) % 180 - 90}deg);opacity:${0.35 + (i % 5) * 0.1};border-radius:${i % 3 === 0 ? "50%" : "2px"};animation-delay:${(i % 8) * 0.05}s;animation-duration:${1.2 + (i % 5) * 0.18}s"></i>`;
  }).join("");
  return `<section class="screen result-page" data-screen="result">
    <div class="confetti">${confettiPieces}</div>
    <div class="result-scroll">
      <div class="result-head">
        <div class="eyebrow">LEVEL ${String(r.level).padStart(2, "0")} · ${r.replay ? "REVIEW" : r.passed ? "COMPLETE" : "RETRY"}</div>
        <h1>${r.replay ? "复习完成！" : r.passed ? "闯关完成！" : "再试一次吧"}</h1>
        <div class="result-stars">${starRow}</div>
        <div class="result-sub">${r.replay && r.stars < r.prevBest ? `本次 ${r.stars} 星 · 保留最高 ${r.prevBest} 星成绩` : r.best === 3 ? "三星通关 · 今天的你超厉害" : r.best === 2 ? "两星通关 · 下一关已解锁" : r.best === 1 ? "一星通关 · 拿到两星才能解锁下一关" : "还差一点点，重新挑战这一关吧"}</div>
      </div>

      <div class="result-card">
        <div class="rc-top">
          <div class="rc-growth">
            <div class="g-ic">${I.leaf(28)}</div>
            <div><div class="lb">成长值</div><div class="v num">+${r.growthGain} <small>EXP</small></div></div>
          </div>
          <div class="rc-stars">${star(19)}<span class="num">+${r.starGain}</span></div>
        </div>
        <div class="rc-div"></div>
        <div class="rc-stats">
          <div class="rc-stat"><b class="num">${r.accuracy}%</b><span>正确率</span></div>
          <div class="rc-stat"><b class="num">${mm}:${ss}</b><span>用时</span></div>
          <div class="rc-stat"><b class="num">${r.newWords}</b><span>答对单词</span></div>
        </div>
        <div class="rc-words">
          <span class="lb">WORDS</span>
          ${(r.wordList.length ? r.wordList : themeWords().slice(0, 3).map((w) => w.word)).map((w) => `<span class="w">${w}</span>`).join("")}
        </div>
      </div>

      <div class="evo-card">
        <div class="evo-row"><span class="evo-lb">EVOLUTION · 进化进度</span><span class="evo-val num">${state.growth} / ${next ? next.min : "MAX"}</span></div>
        <div class="evo-name">${pending ? `${st.name} <b>→</b> ${target.name} · <span style="color:#E2691F">可以进化啦！</span>` : next ? `再获得 ${Math.max(0, next.min - state.growth)} 成长值进化为 ${next.name}` : "已经达到最高形态"}</div>
        <div class="bar gold evo-bar"><i style="width:${pending ? 100 : Math.round(pct * 100)}%"></i></div>
        <div class="evo-tip">${pending ? `${spark(11, "#fff")} 点击见证小诺的成长时刻` : `${spark(11, "#fff")} 继续闯关，离进化更近一步`}</div>
        <div class="evo-mini">${dino(state.stage)}</div>
      </div>

      <div class="result-cheer">
        <div class="cheer-dino">${dino(state.stage)}</div>
        <div class="cheer-say"><b>${pending ? "小诺已经等不及啦！" : "小诺今天也很开心！"}</b><span>${pending ? "再点一下，就能看到全新的我" : `再闯一关，就能继续长大`}</span></div>
      </div>
    </div>

    <div class="result-foot">
      ${pending && r.passed ? `<button class="btn" data-action="evolve">见证进化 ${I.arrow(18)}</button>` : `<button class="btn" data-action="start-quiz" data-level="${r.passed ? Math.min(themeProgress().level, r.level + 1) : r.level}">${r.passed ? "再闯一关" : "再试一次"} ${I.arrow(18)}</button>`}
      <button class="back" data-action="home">回到恐龙乐园</button>
    </div>
  </section>`;
}

/* ------------------------------------------------ evolution */
function beginEvolution() {
  const from = stageMeta(state.stage);
  const to = stageForGrowth(state.growth);
  if (stageIndex(to.key) <= stageIndex(from.key)) {
    toast("成长值还不够，再去闯一关吧");
    go("home", { replace: true });
    return;
  }
  const newDex = [...new Set([...state.dex, to.key])];
  const unlockItem = to.key === "adult" ? "hat" : to.key === "super" ? "crown" : to.key === "ultra" ? "wings" : null;
  const item = unlockItem ? ITEMS.find((it) => it.id === unlockItem) : null;
  const wasOwned = item ? state.owned.includes(item.id) : false;
  state.stage = to.key;
  state.dex = newDex;
  if (item && !wasOwned) {
    state.owned.push(item.id);
    if (!state.equipped[item.slot]) state.equipped[item.slot] = item.id;
  }
  if (stageIndex(to.key) >= 3) state.starBonus = 0.1;
  let dexReward = null;
  if (state.dex.length >= 4 && !state.bgOwned.includes("sunset")) {
    state.bgOwned.push("sunset");
    dexReward = "落日山谷";
  }
  if (state.dex.length >= 6 && !state.bgOwned.includes("night")) {
    state.bgOwned.push("night");
    dexReward = "星空营地";
  }
  save();
  evolutionInfo = { from, to, item, wasOwned, dexReward };
  sfx("evolve");
  go("evolution");
}

function screenEvolution() {
  if (!evolutionInfo) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const info = evolutionInfo;
  const dots = Array.from({ length: 34 }, (_, i) => {
    const x = (i * 43 + 7) % 100, y = (i * 31 + 11) % 100, s = 1.5 + (i % 4) * 0.8;
    return `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;opacity:${0.2 + (i % 5) * 0.12}"></i>`;
  }).join("");
  const item = info.item;
  return `<section class="screen" data-screen="evolution" style="background:#0F2E24">
    <div class="evo-page">
      <div class="bg"></div><div class="stars">${dots}</div>
      <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
      <div class="evo-inner">
        <div class="evo-top">
          <div class="tag">${spark(11, "#FFD25A")} MILESTONE ${String(stageIndex(info.to.key)).padStart(2, "0")} / 05</div>
          <button class="close" data-action="home" aria-label="回到乐园">${I.close(16)}</button>
        </div>
        <div class="evo-title">
          <div class="en">EVOLUTION COMPLETE</div>
          <h1>进化<em>成功</em>！</h1>
          <div class="evo-stage">
            <span class="st">${info.from.name} · LV.${stageIndex(info.from.key) + 1}</span>
            <span class="arr">${I.arrow(15, "#F2C860")}</span>
            <span class="st new">${I.crownMini(13, "#FFD25A")} ${info.to.name} · LV.${stageIndex(info.to.key) + 1}</span>
          </div>
        </div>
        <div class="evo-dino">
          <div class="glow"></div><div class="halo"></div>
          <span class="spark" style="left:8%;top:18%">${spark(22, "#FFE08A")}</span>
          <span class="spark" style="right:9%;top:10%">${spark(15, "#FFE08A")}</span>
          <span class="spark" style="right:14%;bottom:12%">${spark(11, "#FFE08A")}</span>
          <span class="spark" style="left:13%;bottom:16%">${spark(9, "#FFE08A")}</span>
          ${dino(info.to.key, { equipped: state.equipped })}
        </div>
        <div class="evo-unlock">
          <div class="u-head"><span class="lb">NEW UNLOCK · 成长奖励</span><span class="nv">+1 图鉴收录</span></div>
          <div class="u-main">
            <div class="u-ico">${item ? item.art() : I.crownMini(30, "#8A5B15")}</div>
            <div class="u-txt">
              <b>${item ? (info.wasOwned ? item.name + "（已拥有）" : item.name) : "成长礼包"}</b>
              <span>${item ? (info.wasOwned ? "这次进化没有新的装扮，但能力又变强了" : "已自动换上，也可以去小铺更换") : "解锁了新的成长阶段"}</span>
            </div>
            <div style="color:#FFD25A">${I.chevron(12)}</div>
          </div>
          <div class="u-skill">${spark(12, "#FFD25A")} 解锁被动技能：闯关获得的星星 <b>+10%</b></div>
          ${info.dexReward ? `<div class="u-skill" style="border-top:0;padding-top:2px">${I.gift(13)} 图鉴奖励：已解锁「${info.dexReward}」背景</div>` : ""}
          <button class="btn yellow" data-action="home">太棒了，继续冒险 ${I.arrow(18)}</button>
        </div>
      </div>
    </div>
  </section>`;
}

