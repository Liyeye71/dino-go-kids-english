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
  const mapSection = cfg.sceneSelector ? mapHtml : `<section class="map-card" style="background:${cfg.bg};border-color:${cfg.border};box-shadow:0 0.375rem 0 ${cfg.border}48">
    ${mapHtml}
    <span class="map-tag">${theme.emoji} ${theme.name}</span>
    <div class="caption">
      <b>第 ${level} 关 · ${theme.name}</b>
      <span>5 道题 · ★×${PASS_STARS} 解锁下一关</span>
    </div>
  </section>`;
  const nextSection = cfg.sceneSelector ? "" : `<section class="next-card">
    <div class="nc-l">
      <div class="nc-kicker">UP NEXT ${I.chevron(8)} 第 ${level} 关</div>
      <h3>${theme.name}</h3>
      <div class="nc-meta">${theme.words.length} 个词 · 5 道题 · ★×${PASS_STARS} 解锁下一关</div>
    </div>
    <button class="nc-btn" data-action="start-quiz">开始闯关${I.arrow(14)}</button>
  </section>`;

  return `<section class="screen has-tab" data-screen="map">
    <div class="scroll">
      <div class="theme-tabs">
        ${WORD_SETS.map((t) => `<button class="tt ${t.id === theme.id ? "on" : ""}" data-action="theme" data-theme="${t.id}">
          <b>${t.emoji}</b>${t.name}
        </button>`).join("")}
      </div>

      <section class="map-hero">
        <div class="eyebrow"><i></i>${theme.unit}</div>
        <h1>${head}<span>${tail}</span></h1>
        <p>${cfg.intro || `沿着地图一路向前，把${theme.name}里的单词都变成星星。`}</p>
      </section>

      <div class="journey">
        <span class="j-lb">我们的旅程</span>
        <span class="j-val num">${starTotal}<em>/ ${starMax} 颗星</em></span>
        <span class="track"><i style="width:${Math.round((starTotal / starMax) * 100)}%"></i></span>
      </div>

      ${mapSection}
      ${nextSection}
    </div>
    ${tabbar("map")}
  </section>`;
}

/* 动物乐园双场景目前只展示静态路线，不接入独立答题与进度。 */
function openAnimalScene(scene) {
  const scenes = {
    zoo: { title: "陆地动物园 · 关卡路线", label: "草原探索路线" },
    ocean: { title: "海洋公园 · 关卡路线", label: "海洋探索路线" },
  };
  const cfg = scenes[scene] || scenes.zoo;
  const points = [[48, 249], [144, 231], [115, 180], [218, 159], [262, 102], [198, 48]];
  const nodes = points.map(([x, y], index) => {
    const number = index + 1;
    const status = number <= 2 ? "done" : number === 3 ? "current" : "";
    return `<span class="animal-route-node ${status}" style="left:${(x / 320) * 100}%;top:${(y / 300) * 100}%">${number <= 2 ? "✓" : number}</span>`;
  }).join("");

  openOverlay(`<div class="overlay">
    <section class="sheet animal-route-sheet" role="dialog" aria-modal="true" aria-label="${cfg.title}">
      <div class="grab"></div>
      <button type="button" class="animal-route-close" data-action="close-overlay" aria-label="关闭路线预览">×</button>
      <div class="animal-route-head">
        <h2>${cfg.title}</h2>
        <div class="sheet-sub">静态路线预览，暂未接入答题与解锁逻辑</div>
      </div>
      <div class="animal-route-map ${scene}" aria-hidden="true">
        <span class="animal-route-label">${cfg.label}</span>
        <svg class="animal-route-path" viewBox="0 0 320 300" preserveAspectRatio="none">
          <path d="M48 249 L144 231 L115 180 L218 159 L262 102 L198 48" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 13"/>
        </svg>
        ${nodes}
      </div>
      <button type="button" class="btn animal-route-start" disabled aria-disabled="true">开始闯关</button>
    </section>
  </div>`);
}
