/* ============================================================
   DinoGo · 恐龙英语 — 通用路线图抽屉（RouteSheet）
   适用于所有带路线图海报的场景主题（如动物乐园 · 神奇动物园）
   - 支持 100% / 150% / 200% / 250% 缩放，打开时自动定位当前关
   - 节点按坐标落在底图上；每 STAGE_SIZE 关为 BOSS 关；满星关卡只读
   ============================================================ */

const ROUTE_ZOOM_STEPS = [1, 1.5, 2, 2.5];
let routeZoom = 1;

function routeBoardEls() {
  const viewport = document.querySelector(".zoo-board-viewport");
  const inner = viewport && viewport.querySelector(".zoo-board-inner");
  const label = document.querySelector(".zoo-zoom-val");
  return { viewport, inner, label };
}

/* 以当前关为锚点缩放，放大后始终把当前关留在视口中央 */
function routeApplyZoom() {
  const { viewport, inner, label } = routeBoardEls();
  if (!viewport || !inner) return;
  inner.style.width = (routeZoom * 100) + "%";
  if (label) label.textContent = Math.round(routeZoom * 100) + "%";
  requestAnimationFrame(routeFocusCurrent);
}

/* 把当前关节点滚到视口中央 */
function routeFocusCurrent() {
  const { viewport } = routeBoardEls();
  const node = viewport && viewport.querySelector(".zoo-step.current");
  if (!viewport || !node) return;
  const vr = viewport.getBoundingClientRect();
  const nr = node.getBoundingClientRect();
  viewport.scrollLeft += nr.left - vr.left - (vr.width - nr.width) / 2;
  viewport.scrollTop += nr.top - vr.top - (vr.height - nr.height) / 2;
}

window.RouteSheetView = {
  focusCurrent: routeFocusCurrent,
  zoomIn() {
    const i = ROUTE_ZOOM_STEPS.indexOf(routeZoom);
    routeZoom = ROUTE_ZOOM_STEPS[Math.min(ROUTE_ZOOM_STEPS.length - 1, (i < 0 ? 0 : i) + 1)];
    routeApplyZoom();
  },
  zoomOut() {
    const i = ROUTE_ZOOM_STEPS.indexOf(routeZoom);
    routeZoom = ROUTE_ZOOM_STEPS[Math.max(0, (i < 0 ? 0 : i) - 1)];
    routeApplyZoom();
  },
  resetZoom() {
    routeZoom = 1;
    routeApplyZoom();
    routeFocusCurrent();
  },
};
/* 兼容旧别名 */
window.ZooRouteView = window.RouteSheetView;

function renderRouteSheet(theme, scene, prog) {
  routeZoom = 1;
  const themeId = (theme && theme.id) || state.theme;
  const total = scene.levelCount || (scene.levels || []).length;
  const level = Math.min(total, Math.max(1, prog.level || 1));
  const stars = themeStars(prog);
  const starMax = themeStarMax(themeId, total);
  const emoji = scene.emoji || (theme && theme.emoji) || "🗺️";
  const ratio = scene.mapRatio || "1505/1045";
  const sheetCls = scene.sheetClass || "zoo-route-sheet";
  const mapCls = scene.mapClass || scene.id || "zoo";

  const nodes = (scene.levels || []).map((s) => {
    const locked = s.level > level;
    const done = s.level < level || Boolean(prog.cleared && prog.cleared[s.level]);
    const best = (prog.stars && prog.stars[s.level]) || 0;
    const isCurrent = s.level === level && !done;
    /* 满星关卡只读：不再允许点击重玩 */
    const full = done && best >= 3;
    const cls = [
      "animal-route-node", "zoo-step",
      isAssessmentLevel(s.level) ? "boss" : "",
      done ? "done" : "",
      full ? "stars-3" : "",
      isCurrent ? "current" : "",
      locked ? "locked" : "",
    ].filter(Boolean).join(" ");
    const stateText = done
      ? (full ? "，已通关，已满星" : `，已通关，${best} 星，可复习`)
      : (isCurrent ? "，当前关卡" : "，未解锁");
    return `<button type="button" class="${cls}" style="left:${s.x}%;top:${s.y}%"
        data-action="route-node" data-theme="${esc(themeId)}" data-scene="${esc(scene.id)}" data-level="${s.level}"
        title="第 ${s.level} 关${done ? ` · ★${best}${full ? " · 已满星" : ""}` : ""}"
        aria-label="第 ${s.level} 关${stateText}"
        ${(locked || full) ? "disabled" : ""}></button>`;
  }).join("");
  /* 完成结算即视为通关，最后一关也不再要求满星 */
  const allDone = Boolean(prog.cleared && prog.cleared[level]);

  return `<div class="overlay">
    <section class="sheet animal-route-sheet ${sheetCls}" role="dialog" aria-modal="true" aria-label="${esc(scene.name)}闯关路线">
      <div class="grab"></div>
      <div class="zoo-route-head">
        <div class="zoo-route-title">
          <strong>${emoji} ${esc(scene.name)}</strong>
          <small>${allDone ? "全部通关" : `第 ${level} 关`} · ★ ${stars} / ${starMax}</small>
        </div>
        <button type="button" class="zoo-route-close" data-action="close-overlay" aria-label="关闭路线图">×</button>
      </div>
      <div class="zoo-board-frame">
        <div class="zoo-board-viewport">
          <div class="zoo-board-inner">
            <div class="animal-route-map has-map ${mapCls}" style="--arm-ratio:${ratio}">
              <img class="arm-bg" src="${scene.mapImage}" alt="${esc(scene.name)}闯关路线图">
              ${nodes}
            </div>
          </div>
        </div>
        <div class="zoo-zoom-bar" role="group" aria-label="路线图缩放">
          <button type="button" data-action="route-zoom-out" aria-label="缩小路线图">−</button>
          <button type="button" class="zoo-zoom-val" data-action="route-zoom-reset" title="恢复 100%">100%</button>
          <button type="button" data-action="route-zoom-in" aria-label="放大路线图">＋</button>
        </div>
      </div>
    </section>
  </div>`;
}

/* 打开任意带路线图的主题场景抽屉，并自动定位到当前关 */
function openThemeScene(themeId, sceneId) {
  const theme = THEME_BY_ID.get(themeId) || currentTheme();
  const scenes = (theme && theme.scenes) || [];
  if (!scenes.length) return false;
  const scene = scenes.find((s) => s.id === sceneId) || scenes[0];
  state.theme = theme.id;
  state.scene = scene.id;
  save();
  openOverlay(renderRouteSheet(theme, scene, sceneProgress(theme.id, scene.id)));
  /* 抽屉插入 DOM 后把当前关滚到视口中央 */
  setTimeout(() => RouteSheetView.focusCurrent(), 60);
  return true;
}
