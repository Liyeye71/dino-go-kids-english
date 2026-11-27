/* ============================================================
   DinoGo · 恐龙英语 — 答题页视图层交互
   由 main.js 拆出：喇叭朗读、拖拽手势、渲染后绑定
   ============================================================ */

/* 题型的视图层交互，不参与题目生成与判分 */
window.QuizView = {
  abort: null,
  drag: null,

  afterRender() {
    this.cleanup();
    const root = document.querySelector(".quiz-ref-page");
    if (!root || !quiz) return;
    const q = quiz.order[quiz.index];
    this.abort = new AbortController();
    const game = gameForTask(q);
    if (game && typeof game.onMount === "function") game.onMount(root, q, this);
  },

  cleanup() {
    if (this.abort) this.abort.abort();
    this.abort = null;
    this.clearDragVisual();
    this.drag = null;
  },

  clearDragVisual() {
    document.querySelectorAll(".ref-drag-ghost").forEach((el) => el.remove());
    document.querySelectorAll(".drop-ready").forEach((el) => el.classList.remove("drop-ready"));
  },

  /* 动物喂食：拖拽食物到动物嘴里 */
  setupDragging(root) {
    const options = { signal: this.abort.signal };
    root.querySelectorAll("[data-drag]").forEach((source) => {
      source.addEventListener("pointerdown", (e) => this.startDrag(e, source), options);
    });
  },

  startDrag(e, source) {
    if (!quiz || quiz.revealed || e.button !== 0 || source.disabled) return;
    const drag = {
      pointerId: e.pointerId, source, kind: source.dataset.drag,
      value: source.dataset.food,
      x: e.clientX, y: e.clientY, moved: false, ghost: null, overTarget: null,
    };
    this.drag = drag;
    try { source.setPointerCapture(e.pointerId); } catch {}
    const options = { signal: this.abort.signal };
    const move = (ev) => {
      if (ev.pointerId !== drag.pointerId) return;
      if (!drag.moved && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) <= 6) return;
      ev.preventDefault();
      if (!drag.moved) {
        drag.moved = true;
        drag.ghost = document.createElement("span");
        drag.ghost.className = "ref-drag-ghost";
        const art = source.querySelector(".ref-food-art");
        if (drag.kind === "food" && art) drag.ghost.innerHTML = art.innerHTML;
        else drag.ghost.textContent = source.textContent.trim();
        document.body.appendChild(drag.ghost);
      }
      drag.ghost.style.left = `${ev.clientX}px`;
      drag.ghost.style.top = `${ev.clientY}px`;
      const hit = document.elementFromPoint(ev.clientX, ev.clientY);
      const target = hit && hit.closest("[data-feed-drop]");
      if (target !== drag.overTarget) {
        if (drag.overTarget) drag.overTarget.classList.remove("drop-ready");
        if (target) target.classList.add("drop-ready");
        drag.overTarget = target || null;
      }
    };
    const finish = (ev, cancelled) => {
      if (ev.pointerId !== drag.pointerId) return;
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", cancel);
      const hit = document.elementFromPoint(ev.clientX, ev.clientY);
      this.clearDragVisual();
      this.drag = null;
      try { if (source.hasPointerCapture(ev.pointerId)) source.releasePointerCapture(ev.pointerId); } catch {}
      if (cancelled || !drag.moved) return;
      this.suppressClick(source);
      const target = hit && hit.closest("[data-feed-drop]");
      if (target) feedPick(drag.value, source);
    };
    const up = (ev) => finish(ev, false);
    const cancel = (ev) => finish(ev, true);
    document.addEventListener("pointermove", move, options);
    document.addEventListener("pointerup", up, options);
    document.addEventListener("pointercancel", cancel, options);
  },

  suppressClick(source) {
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
    source.addEventListener("click", stop, { capture: true, once: true });
    setTimeout(() => source.removeEventListener("click", stop, true), 350);
  },
};
