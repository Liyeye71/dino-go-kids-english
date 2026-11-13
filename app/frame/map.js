/* ============================================================
   DinoGo · 恐龙英语 — 闯关地图（map）
   底部 Tab 2：闯关
   - 只负责统计本主题进度、切换主题、渲染主题地图
   - 具体的路径、节点、宝箱由各主题自行实现
   ============================================================ */

/* 当前主题对应的地图配置，缺省回落到第一个主题 */
function mapTheme() {
  return currentTheme().map || WORD_SETS[0].map;
}

function screenMap() {
  const prog = themeProgress();
  const theme = currentTheme();
  const cfg = mapTheme();
  const level = prog.level;
  const starTotal = themeStars(prog);
  const starMax = LEVELS_PER_THEME * 3;
  const head = cfg.title.slice(0, -2);
  const tail = cfg.title.slice(-2);

  /* 主题地图渲染，返回场景、路线 SVG、节点与宝箱的完整 HTML */
  const mapHtml = cfg.render
    ? cfg.render({ prog, theme, cfg, level, LEVELS_PER_THEME, starTotal })
    : "";

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

      <section class="map-hero">
        <div class="eyebrow"><i></i>${theme.unit}</div>
        <h1>${head}<span>${tail}</span></h1>
        <p>沿着地图一路向前，把${theme.name}里的单词都变成星星。</p>
      </section>

      <div class="journey">
        <span class="j-lb">我们的旅程</span>
        <span class="j-val num">${starTotal}<em>/ ${starMax} 颗星</em></span>
        <span class="track"><i style="width:${Math.round((starTotal / starMax) * 100)}%"></i></span>
      </div>

      <section class="map-card" style="background:${cfg.bg};border-color:${cfg.border};box-shadow:0 6px 0 ${cfg.border}48">
        ${mapHtml}
        <span class="map-tag">${theme.emoji} ${theme.name}</span>
        <div class="caption">
          <b>第 ${level} 关 · ${theme.name}</b>
          <span>5 道题 · ★×${PASS_STARS} 解锁下一关</span>
        </div>
      </section>

      <section class="next-card">
        <div class="nc-l">
          <div class="nc-kicker">UP NEXT ${I.chevron(8)} 第 ${level} 关</div>
          <h3>${theme.name}</h3>
          <div class="nc-meta">${theme.words.length} 个词 · 5 道题 · ★×${PASS_STARS} 解锁下一关</div>
        </div>
        <button class="nc-btn" data-action="start-quiz">开始闯关${I.arrow(14)}</button>
      </section>
    </div>
    ${tabbar("map")}
  </section>`;
}
