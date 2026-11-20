/* ============================================================
   DinoGo · 恐龙英语 — 答题页视图层交互
   由 main.js 拆出：单词连线画线、拖拽手势、渲染后绑定
   ============================================================ */

/* 六题型的视图层交互，不参与题目生成与判分 */
window.QuizView = {
  abort: null,
  observer: null,
  drag: null,

  afterRender() {
    this.cleanup();
    const root = document.querySelector(".quiz-ref-page");
    if (!root || !quiz) return;
    const q = quiz.order[quiz.index];
    this.abort = new AbortController();
    if (q.type === "match") this.setupMatch(root);
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

  point(board, el, boardRect) {
    const b = boardRect || board.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
  },

  curve(a, b) {
    const direction = b.x >= a.x ? 1 : -1;
    const bend = Math.max(2.5 * 16, Math.abs(b.x - a.x) * 0.45);
    return `M ${a.x} ${a.y} C ${a.x + bend * direction} ${a.y}, ${b.x - bend * direction} ${b.y}, ${b.x} ${b.y}`;
  },

  /* 重绘已配对的连线 */
  drawMatch() {
    const area = document.querySelector("[data-match-area]");
    if (!area || !quiz) return;
    const svg = area.querySelector(".ref-match-svg");
    const rect = area.getBoundingClientRect();
    if (!svg || !rect.width || !rect.height) return;
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = "";
    const dots = [...area.querySelectorAll("[data-match-dot]")];
    const findDot = (side, word) => dots.find((d) => d.dataset.matchSide === side && d.dataset.word === word);
    /* 错误配对先画红线，再叠加正确的绿线 */
    (quiz.wrongPairs || []).forEach(({ art, word }) => {
      const left = findDot("art", art);
      const right = findDot("word", word);
      if (!left || !right) return;
      svg.appendChild(this.makeCurvedPath(this.point(area, left, rect), this.point(area, right, rect), "ref-match-path wrong"));
    });
    (quiz.matched || []).forEach((word) => {
      const left = findDot("art", word);
      const right = findDot("word", word);
      if (!left || !right) return;
      svg.appendChild(this.makeCurvedPath(this.point(area, left, rect), this.point(area, right, rect)));
    });
  },

  makeCurvedPath(p1, p2, cls = "ref-match-path") {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const midX = (p1.x + p2.x) / 2;
    const d = `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;
    path.setAttribute("d", d);
    path.setAttribute("class", cls);
    return path;
  },

  setupMatch(root) {
    const area = root.querySelector("[data-match-area]");
    if (!area) return;
    this.drawMatch();
    if (window.ResizeObserver) {
      this.observer = new ResizeObserver(() => this.drawMatch());
      this.observer.observe(area);
    }
    const options = { signal: this.abort.signal };
    area.querySelectorAll("[data-match-dot]").forEach((dot) => {
      dot.addEventListener("pointerdown", (e) => this.startMatchDrag(e, dot), options);
    });
    /* 点击英文单词卡片：朗读发音 + 抖动反馈 */
    area.querySelectorAll('[data-match-row][data-match-side="word"]').forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("[data-match-dot]")) return;
        if (!quiz || quiz.revealed) return;
        const card = row.querySelector(".ref-match-word-card");
        speak(row.dataset.word);
        if (card) {
          card.classList.remove("is-shaking");
          void card.offsetWidth;
          card.classList.add("is-shaking");
        }
      }, options);
    });
  },

  /* 该图/单词是否已连过（正确或错误都算锁定） */
  isUsed(word, side) {
    if (!quiz) return true;
    if ((quiz.matched || []).includes(word)) return true;
    return (quiz.wrongPairs || []).some((p) => p[side] === word);
  },

  /* 圆点按下：支持点击配对 + 拖拽连线两种模式 */
  startMatchDrag(e, dot) {
    if (!quiz || quiz.revealed || e.button !== 0) return;
    const word = dot.dataset.word;
    const side = dot.dataset.matchSide;
    const area = dot.closest("[data-match-area]");
    if (!area || this.isUsed(word, side)) return;
    e.preventDefault();
    e.stopPropagation();

    const svg = area.querySelector(".ref-match-svg");
    const start = this.point(area, dot);
    const path = this.makeCurvedPath(start, start, "ref-match-path temp");
    svg.appendChild(path);

    const drag = { pointerId: e.pointerId, dot, area, path, startedAt: Date.now(), moved: false, start };
    this.drag = drag;
    try { dot.setPointerCapture(e.pointerId); } catch {}

    const move = (ev) => {
      if (ev.pointerId !== drag.pointerId) return;
      const dx = ev.clientX - e.clientX;
      const dy = ev.clientY - e.clientY;
      if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
      if (!drag.moved) return;
      ev.preventDefault();
      const rect = area.getBoundingClientRect();
      const end = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const midX = (start.x + end.x) / 2;
      path.setAttribute("d", `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`);
    };
    const finish = (ev, cancelled) => {
      if (ev.pointerId !== drag.pointerId) return;
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", cancel);
      if (!cancelled) {
        try { if (dot.hasPointerCapture(ev.pointerId)) dot.releasePointerCapture(ev.pointerId); } catch {}
      }
      path.remove();
      this.drag = null;

      if (cancelled) return;

      if (drag.moved) {
        /* 拖拽模式：找释放位置的另一个侧圆点 */
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const targetDot = target && target.closest("[data-match-dot]");
        if (targetDot && targetDot !== dot && targetDot.dataset.matchSide !== side) {
          this.tryConnect(dot, targetDot);
        }
      } else {
        /* 点击模式：切换选中点，若已有另一个侧的选中点则配对 */
        this.trySelectOrPair(dot);
      }
    };
    const up = (ev) => finish(ev, false);
    const cancel = (ev) => finish(ev, true);
    document.addEventListener("pointermove", move, { signal: this.abort.signal });
    document.addEventListener("pointerup", up, { signal: this.abort.signal });
    document.addEventListener("pointercancel", cancel, { signal: this.abort.signal });
  },

  /* 点击配对：参考 temp 的 tryConnect 逻辑 — 同侧切换、异侧配对 */
  trySelectOrPair(dot) {
    if (!quiz || quiz.revealed) return;
    const word = dot.dataset.word;
    const side = dot.dataset.matchSide;
    if (this.isUsed(word, side)) return;

    /* 如果 quiz.pickWord 已有值，表示另一侧已选中 */
    if (quiz.pickWord && quiz.pickWordSide && quiz.pickWordSide !== side) {
      /* 另一侧已选中 — 尝试配对 */
      const pickedWord = quiz.pickWord;
      if (side === "art") {
        /* 当前点是 art（左），之前 pickWord 是 word（右） */
        matchPickWord(pickedWord);
        matchPickArt(word);
      } else {
        /* 当前点是 word（右），之前 pickWord 是 art（左） */
        matchPickWord(word);
        matchPickArt(pickedWord);
      }
      return;
    }

    /* 同侧或首次点击 — 设置当前选中点 */
    matchPickWord(word);
    quiz.pickWordSide = side;
    render();
  },

  /* 拖拽到另一个圆点：直接配对 */
  tryConnect(dotA, dotB) {
    if (!quiz || quiz.revealed) return;
    const a = { word: dotA.dataset.word, side: dotA.dataset.matchSide };
    const b = { word: dotB.dataset.word, side: dotB.dataset.matchSide };
    if (a.side === b.side) return;
    if (this.isUsed(a.word, a.side) || this.isUsed(b.word, b.side)) return;

    quiz.pickWordSide = a.side;
    quiz.pickWord = a.word;

    if (a.side === "art") {
      matchPickWord(b.word);
      matchPickArt(a.word);
    } else {
      matchPickWord(a.word);
      matchPickArt(b.word);
    }
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
      x: e.clientX, y: e.clientY, moved: false, ghost: null,
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
      document.querySelectorAll(".drop-ready").forEach((el) => el.classList.remove("drop-ready"));
      const hit = document.elementFromPoint(ev.clientX, ev.clientY);
      const target = hit && (drag.kind === "food" ? hit.closest("[data-feed-drop]") : hit.closest(".pz-slot"));
      if (target) target.classList.add("drop-ready");
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
