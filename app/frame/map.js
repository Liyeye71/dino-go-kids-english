/* ============================================================
   DinoGo · 恐龙英语 — 闯关地图（map）
   底部 Tab 2：闯关
   - 顶层单元切换（basic 开放 / advance 锁定）
   - 单元内每个主题一张整卡地图入口（如陆地动物园封面）
   - 页面只保留一个单元大标题，旅程/宝箱跟随可玩主题
   ============================================================ */

function screenMap() {
  const unit = currentUnit();
  const unitThemes = themesOfUnit(unit);

  /* 顶层单元切换：锁定单元渲染整块占位卡，不显示地图 */
  const unitTabs = `<div class="unit-tabs">
    ${UNITS.map((u) => `<button class="ut ${u.id === unit.id ? "on" : ""}${u.locked ? " locked" : ""}" data-action="unit" data-unit="${u.id}"
      aria-label="${u.name}${u.locked ? "（未开放）" : ""}">
      <b>${u.emoji}</b>${u.name}<span class="ut-en">${u.en}</span>${u.locked ? "<i>🔒</i>" : ""}
    </button>`).join("")}
  </div>`;

  /* 唯一的大主标题：单元名，末两字高亮；右侧为启蒙模式开关 */
  const uHead = unit.name.slice(0, -2);
  const uTail = unit.name.slice(-2);
  const enlightenOn = Boolean(state.enlighten);
  const hero = `<section class="map-hero">
    <h1>${uHead}<span>${uTail}</span></h1>
    <button type="button" class="enlighten-btn${enlightenOn ? " on" : ""}" data-action="enlighten-toggle"
      role="switch" aria-checked="${enlightenOn}" aria-label="启蒙模式开关">
      <span class="eb-ico">🍬</span>
      <span class="eb-txt"><b>启蒙模式</b></span>
      <span class="eb-switch" aria-hidden="true"><i></i></span>
    </button>
  </section>`;

  if (unit.locked) {
    return `<section class="screen has-tab" data-screen="map">
      <div class="scroll">
        ${unitTabs}
        ${hero}
        <section class="card unit-locked-card">
          <div class="ulc-emoji">🏝️</div>
          <h3>敬请期待</h3>
          <p>更多闯关地图正在制作，先在基础乐园收集星星，敬请期待后续更新！</p>
        </section>
      </div>
      ${tabbar("map")}
    </section>`;
  }

  /* 旅程与宝箱跟随单元内第一个可玩主题（旧存档主题可能指向占位页） */
  const journeyTheme = unitThemes.find(themeHasContent) || currentTheme();
  const jProg = themeProgress(journeyTheme.id);
  const starTotal = themeStars(jProg);
  const starMax = Math.floor(levelsPerTheme(journeyTheme.id) / 5) * 3;

  /* 单元内每个主题一张整卡地图：可玩主题渲染自己的封面，占位主题渲染筹备中卡片 */
  const mapCards = unitThemes.map((t) => {
    const tcfg = t.map || {};
    const tProg = themeProgress(t.id);
    const tLevel = tProg.level;
    const renderArgs = { prog: tProg, theme: t, cfg: tcfg, level: tLevel, LEVELS_PER_THEME, levels: levelsPerTheme(t.id), starTotal: themeStars(tProg) };
    if (!themeHasContent(t)) {
      return `<section class="map-card unit-map-card" style="background:${tcfg.bg || "#FFF7E6"};border-color:${tcfg.border || "#E7DAC3"};box-shadow:0 0.375rem 0 ${(tcfg.border || "#E7DAC3")}48">
        ${tcfg.render ? tcfg.render(renderArgs) : ""}
        <span class="map-tag">${t.emoji} ${t.name}</span>
      </section>`;
    }
    const mapHtml = tcfg.render ? tcfg.render(renderArgs) : "";
    /* 场景选择型主题（如动物园）自带整卡封面，其余主题包标准地图卡 */
    if (tcfg.sceneSelector) return mapHtml;
    return `<section class="map-card" style="background:${tcfg.bg || "#FBF3E3"};border-color:${tcfg.border || "#E7DAC3"};box-shadow:0 0.375rem 0 ${(tcfg.border || "#E7DAC3")}48">
      ${mapHtml}
      <span class="map-tag">${t.emoji} ${t.name}</span>
      <div class="caption"><b>第 ${tLevel} 关 · ${t.name}</b><span>${QUIZ_SIZE} 道题 · 每关最多 3★</span></div>
    </section>
    <section class="next-card">
      <div class="nc-l">
        <div class="nc-kicker">UP NEXT ${I.chevron(8)} 第 ${tLevel} 关</div>
        <h3>${t.name}</h3>
        <div class="nc-meta">${sceneWords(t, state.scene).length} 个词 · ${QUIZ_SIZE} 道题 · 每关最多 3★</div>
      </div>
      <button class="nc-btn" data-action="start-quiz" data-theme="${t.id}">开始闯关${I.arrow(14)}</button>
    </section>`;
  }).join("");

  return `<section class="screen has-tab" data-screen="map">
    <div class="scroll">
      ${unitTabs}
      ${hero}

      <button type="button" class="daily-challenge-card${dailyChallengeLeft() ? "" : " is-empty"}" data-action="daily-start">
        <span class="dcc-ic" aria-hidden="true">🎲</span>
        <span class="dcc-tx">
          <b>每日随机挑战</b>
          <em>${enlightenOn
            ? "启蒙 2 选项 · 答对 1 题得 1★ · 不计成长值"
            : "全主题混抽 5 题 · 答对 1 题得 1★ · 不计成长值"}</em>
        </span>
        <span class="dcc-count"><b>${dailyChallengeLeft()}/${DAILY_CHALLENGE_LIMIT}</b><small>次</small></span>
      </button>

      <div class="journey">
        <span class="j-lb">我们的旅程</span>
        <span class="j-val num">${starTotal}<em>/ ${starMax} 颗星</em></span>
        <span class="j-track">
          <span class="track"><i style="width:${Math.round((starTotal / starMax) * 100)}%"></i></span>
          ${window.ChestManager ? ChestManager.renderJourneyChests(activeProgressKey(journeyTheme.id), starTotal, starMax) : ""}
        </span>
        ${window.ChestManager && ChestManager.available() > 0
          ? `<button type="button" class="j-chest bonus" data-action="chest-open" aria-label="开启额外宝箱，剩 ${ChestManager.available()} 个">🎁<b>${ChestManager.available()}</b></button>`
          : ""}
      </div>

      <div class="unit-maps">${mapCards}</div>
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
      <button type="button" class="btn animal-route-start" disabled aria-disabled="true">即将开放</button>
    </section>
  </div>`);
}
