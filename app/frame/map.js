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
  const starMax = Math.floor(levelsPerTheme() / 5) * 3;
  const head = cfg.title.slice(0, -2);
  const tail = cfg.title.slice(-2);

  /* 主题地图渲染，返回场景、路线 SVG、节点与宝箱的完整 HTML */
  const mapHtml = cfg.render
    ? cfg.render({ prog, theme, cfg, level, LEVELS_PER_THEME, levels: levelsPerTheme(), starTotal })
    : "";
  const mapSection = cfg.sceneSelector ? mapHtml : `<section class="map-card" style="background:${cfg.bg};border-color:${cfg.border};box-shadow:0 0.375rem 0 ${cfg.border}48">
    ${mapHtml}
    <span class="map-tag">${theme.emoji} ${theme.name}</span>
    <div class="caption">
      <b>第 ${level} 关 · ${theme.name}</b>
      <span>${QUIZ_SIZE} 道题 · 第 5 关考核得星星</span>
    </div>
  </section>`;
  /* 占位主题（playable: false + 空词表）不显示"开始闯关"按钮 */
  const hasPlayableContent = themeWords().length > 0;
  const nextSection = cfg.sceneSelector || !hasPlayableContent ? "" : `<section class="next-card">
    <div class="nc-l">
      <div class="nc-kicker">UP NEXT ${I.chevron(8)} 第 ${level} 关</div>
      <h3>${theme.name}</h3>
      <div class="nc-meta">${themeWords().length} 个词 · ${QUIZ_SIZE} 道题 · 第 5 关考核得星星</div>
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
        <span class="j-track">
          <span class="track"><i style="width:${Math.round((starTotal / starMax) * 100)}%"></i></span>
          ${window.ChestManager ? ChestManager.renderJourneyChests(activeProgressKey(), starTotal, starMax) : ""}
        </span>
        ${window.ChestManager && ChestManager.available() > 0
          ? `<button type="button" class="j-chest bonus" data-action="chest-open" aria-label="开启额外宝箱，剩 ${ChestManager.available()} 个">🎁<b>${ChestManager.available()}</b></button>`
          : ""}
      </div>

      ${mapSection}
      ${nextSection}
    </div>
    ${tabbar("map")}
  </section>`;
}

/* 动物乐园：点场景入口 → 记录场景后弹出路线抽屉 */
function openAnimalScene(sceneId) {
  const theme = currentTheme();
  const scenes = theme.scenes || [];
  if (!scenes.length) return;
  const scene = scenes.find((s) => s.id === sceneId) || scenes[0];
  if (!scene.playable) { openAnimalPreview(scene); return; }

  state.scene = scene.id;
  save();
  openOverlay(renderZooRouteSheet(scene, sceneProgress("animal", scene.id)));
  /* 抽屉插入 DOM 后把当前关滚到视口中央 */
  if (window.ZooRouteView) setTimeout(() => ZooRouteView.focusCurrent(), 60);
}

/* 触屏左右滑动切换主题：左滑下一个，右滑上一个 */
function stepTheme(step) {
  const idx = WORD_SETS.findIndex((t) => t.id === currentTheme().id);
  const next = WORD_SETS[idx + step];
  if (!next) return;
  state.theme = next.id;
  save();
  sfx("tap");
  render();
}

(function bindThemeSwipe() {
  const EDGE = 24;   /* 两侧边缘留给 iOS 返回手势 */
  const DIST = 60;   /* 最小横向位移 */
  let fromX = 0, fromY = 0, fromAt = 0, active = false;

  document.addEventListener("touchstart", (e) => {
    active = false;
    if (e.touches.length !== 1) return;
    const target = e.target;
    if (!target.closest || !target.closest('.screen[data-screen="map"]')) return;
    /* 主题栏本身可横向滚动时，把手势让给滚动 */
    const tabs = target.closest(".theme-tabs");
    if (tabs && tabs.scrollWidth > tabs.clientWidth + 2) return;
    const t = e.touches[0];
    if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
    fromX = t.clientX;
    fromY = t.clientY;
    fromAt = Date.now();
    active = true;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    if (!active) return;
    active = false;
    const t = e.changedTouches[0];
    if (!t || Date.now() - fromAt > 800) return;
    const dx = t.clientX - fromX;
    const dy = t.clientY - fromY;
    /* 横向位移足够大且明显大于纵向，才判定为切主题，避免误伤上下滚动 */
    if (Math.abs(dx) < DIST || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    stepTheme(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener("touchcancel", () => { active = false; }, { passive: true });
})();

/* 未接入关卡逻辑的场景：保留静态路线预览 */
function openAnimalPreview(scene) {
  const points = [[48, 249], [144, 231], [115, 180], [218, 159], [262, 102], [198, 48]];
  const nodes = points.map(([x, y], index) => {
    const number = index + 1;
    const status = number <= 2 ? "done" : number === 3 ? "current" : "";
    return `<span class="animal-route-node ${status}" style="left:${(x / 320) * 100}%;top:${(y / 300) * 100}%">${number <= 2 ? "✓" : number}</span>`;
  }).join("");

  openOverlay(`<div class="overlay">
    <section class="sheet animal-route-sheet" role="dialog" aria-modal="true" aria-label="${scene.name}关卡路线">
      <div class="grab"></div>
      <div class="animal-route-map ${scene.id}" aria-hidden="true">
        <svg class="animal-route-path" viewBox="0 0 320 300" preserveAspectRatio="none">
          <path d="M48 249 L144 231 L115 180 L218 159 L262 102 L198 48" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 13"/>
        </svg>
        ${nodes}
        <button type="button" class="arm-close" data-action="close-overlay" aria-label="关闭路线预览">×</button>
      </div>
      <button type="button" class="btn animal-route-start" disabled aria-disabled="true">开始闯关</button>
    </section>
  </div>`);
}
