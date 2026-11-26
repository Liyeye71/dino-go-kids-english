/* ============================================================
   DinoGo · 恐龙英语 — 答题页视图层交互
   由 main.js 拆出：单词连线点击配对、喇叭朗读、拖拽手势、渲染后绑定
   ============================================================ */

/* 六题型的视图层交互，不参与题目生成与判分 */
window.QuizView = {
  abort: null,
  observer: null,
  drag: null,
  matchAreaW: null,

  afterRender() {
    this.cleanup();
    const root = document.querySelector(".quiz-ref-page");
    if (!root || !quiz) return;
    const q = quiz.order[quiz.index];
    this.abort = new AbortController();
    if (q.type === "match") this.setupMatch(root);
    if (q.type === "word_puzzle") this.setupPuzzle(root, q);
    if (q.type === "word_puzzle" || q.type === "feed_animal") this.setupDragging(root);
  },

  cleanup() {
    if (this.abort) this.abort.abort();
    if (this.observer) this.observer.disconnect();
    this.abort = null;
    this.observer = null;
    this.clearDragVisual();
    this.drag = null;
  },

  clearDragVisual() {
    document.querySelectorAll(".ref-drag-ghost").forEach((el) => el.remove());
    document.querySelectorAll(".drop-ready").forEach((el) => el.classList.remove("drop-ready"));
  },

  /* 单词框等宽：先按内容量出最长单词的自然宽度，再统一写入 --match-word-w */
  syncMatchWordWidth(area) {
    const cards = [...area.querySelectorAll(".ref-match-word-card")];
    if (!cards.length) return;
    cards.forEach((card) => { card.style.width = ""; });
    area.style.removeProperty("--match-word-w");
    const max = cards.reduce((w, card) => Math.max(w, card.getBoundingClientRect().width), 0);
    if (max > 0) area.style.setProperty("--match-word-w", `${Math.ceil(max)}px`);
  },

  setupMatch(root) {
    const area = root.querySelector("[data-match-area]");
    if (!area) return;
    this.syncMatchWordWidth(area);
    this.matchAreaW = Math.round(area.getBoundingClientRect().width);
    if (window.ResizeObserver) {
      this.observer = new ResizeObserver(() => {
        /* 只有可用宽度真的变了才重新量单词框，避免自身写入宽度引起回调循环 */
        const w = Math.round(area.getBoundingClientRect().width);
        if (w === this.matchAreaW) return;
        this.matchAreaW = w;
        this.syncMatchWordWidth(area);
      });
      this.observer.observe(area);
    }
    const options = { signal: this.abort.signal };
    /* 点单词框 / 图片框：先选一方，再点另一侧完成配对 */
    area.querySelectorAll("[data-match-row]").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("[data-match-speaker]")) return;
        matchSelect(row.dataset.matchSide, row.dataset.word);
      }, options);
    });
    /* 喇叭：抖动 + 朗读，不参与配对 */
    area.querySelectorAll("[data-match-speaker]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        speak(btn.dataset.word);
        if (typeof shakeBtn === "function") shakeBtn(btn);
      }, options);
    });
  },

  /* 词汇拼图：点击提示图片朗读正确单词 */
  setupPuzzle(root, q) {
    const hint = root.querySelector(".pz-hint");
    if (!hint) return;
    hint.addEventListener("click", () => {
      if (!quiz) return;
      speak(q.word);
      if (typeof shakeBtn === "function") shakeBtn(hint);
    }, { signal: this.abort.signal });
  },

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
      value: source.dataset.drag === "puzzle" ? Number(source.dataset.letter) : source.dataset.food,
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
      const target = hit && (drag.kind === "food" ? hit.closest("[data-feed-drop]") : hit.closest(".pz-slot"));
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
      if (drag.kind === "puzzle") {
        const slot = hit && hit.closest(".pz-slot[data-slot]");
        if (slot) puzzlePlace(drag.value, Number(slot.dataset.slot));
      } else {
        const target = hit && hit.closest("[data-feed-drop]");
        if (target) feedPick(drag.value);
      }
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
