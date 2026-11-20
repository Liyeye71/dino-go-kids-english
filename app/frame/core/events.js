/* ============================================================
   全局事件：点击动作分发、浏览器后退与手势拦截
   ============================================================ */

/* ------------------------------------------------ events */
function renderAndResetScroll() {
  render();
  const sc = $(".scroll");
  if (sc) sc.scrollTop = 0;
}

document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("overlay")) { closeOverlay(); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  if (action === "tab") {
    closeOverlay();
    go(el.dataset.screen, { replace: true });
    sfx("tap");
  } else if (action === "home") {
    closeOverlay();
    go("home", { replace: true });
  } else if (action === "profile") {
    go("profile");
    sfx("tap");
  } else if (action === "start-quiz") {
    closeOverlay();
    startQuiz(el.dataset.level);
  } else if (action === "review-level") {
    startQuiz(Number(el.dataset.level));
  } else if (action === "locked-level") {
    toast("先拿到两星通过前一关，才能解锁这一关");
  } else if (action === "select") {
    selectOption(el.dataset.word);
  } else if (action === "listen-selected") {
    listenSelected();
  } else if (action === "match-word") {
    matchPickWord(el.dataset.word);
  } else if (action === "match-art") {
    matchPickArt(el.dataset.word);
  } else if (action === "next") {
    nextQuestion();
  } else if (action === "bonus-start") {
    bonusStart();
  } else if (action === "bonus-skip") {
    bonusSkip();
  } else if (action === "open-bonus-chest") {
    openBonusChest();
  } else if (action === "close-quiz") {
    quiz = null;
    const prevTheme = state.theme;
    const prevScene = state.scene;
    go("map", { replace: true });
    /* 从场景路线抽屉进入闯关 → 返回时自动重开该场景的路线图 */
    if (prevTheme === "animal" && prevScene) {
      const theme = currentTheme();
      const scene = (theme.scenes || []).find((s) => s.id === prevScene);
      if (scene) {
        setTimeout(() => {
          openOverlay(renderZooRouteSheet(scene, sceneProgress(prevTheme, prevScene)));
          if (window.ZooRouteView) ZooRouteView.focusCurrent();
        }, 0);
      }
    }
  } else if (action === "speak-answer") {
    /* 结果条喇叭：朗读正确答案 */
    const q = quiz && quiz.order[quiz.index];
    if (q) speak(q.word || q.correctFood || "");
  } else if (action === "evolve") {
    beginEvolution();
  } else if (action === "collect-tab") {
    collectTab = el.dataset.tab;
    sfx("tap");
    renderAndResetScroll();
  } else if (action === "buy-bg") {
    openBuyBg(el.dataset.id);
  } else if (action === "equip-bg") {
    equipBg(el.dataset.id);
  } else if (action === "confirm-buy") {
    confirmBuy();
  } else if (action === "dex-detail") {
    openDexDetail(el.dataset.key);
  } else if (action === "pick-ultra") {
    state.ultraSkin = Math.min(4, Math.max(1, Number(el.dataset.skin) || 1));
    setUltraSkin(state.ultraSkin);
    save();
    sfx("tap");
    render();
  } else if (action === "locked-ultra") {
    toast("进化成超级霸王龙后，就能切换这几种机甲形态");
  } else if (action === "filter-dex") {
    dexFilter = el.dataset.filter;
    sfx("tap");
    render();
  } else if (action === "filter-word") {
    wordsLetter = el.dataset.letter;
    sfx("tap");
    renderAndResetScroll();
  } else if (action === "theme") {
    state.theme = el.dataset.theme;
    save();
    sfx("tap");
    render();
  } else if (action === "open-animal-scene") {
    sfx("tap");
    openAnimalScene(el.dataset.scene);
  } else if (action === "animal-node") {
    const level = Number(el.dataset.level) || 1;
    const prog = themeProgress();
    if (level > prog.level) {
      toast(`先拿到两星通过第 ${prog.level} 关，才能解锁这一关`);
      return;
    }
    sfx("tap");
    closeOverlay();
    startQuiz(level);
  } else if (action === "zoo-node") {
    /* 🦁 路线弹框里的关卡节点 */
    const level = Number(el.dataset.level) || 1;
    const prog = sceneProgress("animal", "zoo");
    if (level > prog.level) {
      toast(`先通过第 ${prog.level} 关，才能解锁这一关`);
      return;
    }
    sfx("tap");
    closeOverlay();
    startQuiz(level);
  } else if (action === "zoo-zoom-in") {
    sfx("tap");
    if (window.ZooRouteView) ZooRouteView.zoomIn();
  } else if (action === "zoo-zoom-out") {
    sfx("tap");
    if (window.ZooRouteView) ZooRouteView.zoomOut();
  } else if (action === "zoo-zoom-reset") {
    sfx("tap");
    if (window.ZooRouteView) ZooRouteView.resetZoom();
  } else if (action === "chest-claim") {
    /* 🎁 旅程进度条上的里程碑宝箱 */
    const res = ChestManager.claimJourney(Number(el.dataset.threshold) || 0);
    if (res.status === "locked") {
      toast(`再获得 ${res.need} 颗星就能开启这个宝箱`);
      return;
    }
    if (res.status === "done") return;
    sfx("win");
    openOverlay(buildChestOverlay(res.dino));
    render();
  } else if (action === "chest-open") {
    sfx("win");
    const dino = ChestManager.openOne();
    const overlay = buildChestOverlay(dino);
    openOverlay(overlay);
    render(); /* 更新地图上的宝箱计数 */
  } else if (action === "chest-again") {
    /* 继续开下一个（如果还有） */
    if (ChestManager.available() > 0) {
      sfx("win");
      const dino = ChestManager.openOne();
      const overlay = buildChestOverlay(dino);
      openOverlay(overlay);
      render();
    } else {
      closeOverlay();
      render();
    }
  } else if (action === "chest-close") {
    closeOverlay();
    render();
  /* 🧩 词汇拼图 Word Puzzle：点字母 → 依次填入槽位 */
  } else if (action === "pz-letter") {
    puzzlePlace(Number(el.dataset.letter));
  } else if (action === "pz-check") {
    if (!quiz || quiz.revealed) return;
    const q = quiz.order[quiz.index];
    const got = q.puzzleSlots.map((s) => {
      const l = q.puzzleLetters.find((x) => x.id === s.filled);
      return l ? l.ch : "_";
    }).join("").toLowerCase();
    const target = q.word.toUpperCase().toLowerCase();
    const ok = got === target;
    quiz.revealed = true;
    quiz.choiceCorrect = ok;
    quiz.selected = ok ? q.word : got;
    if (ok) {
      quiz.correct++; quiz.words.push(q.word); sfx("excellent");
      WrongBank.applyResult(q, true);
    } else {
      quiz.hearts = Math.max(0, quiz.hearts - 1); sfx("wrong");
      WrongBank.applyResult(q, false);
    }
    render();

  /* 🍎 动物喂食 Feed Animal */
  } else if (action === "fd-pick") {
    feedPick(el.dataset.food);
  } else if (action === "fd-check") {
    feedCheck();

  } else if (action === "settings") {
    openSettings();
  } else if (action === "toggle-sound") {
    state.sound = !state.sound;
    save();
    if (state.sound) { ensureAudio(); sfx("tap"); }
    openSettings();
    toast(state.sound ? "音效已开启" : "音效已关闭");
  } else if (action === "install-guide") {
    openInstallGuide();
  } else if (action === "reset-confirm") {
    openResetConfirm();
  } else if (action === "confirm-reset") {
    resetState();
    closeOverlay();
    go("home", { replace: true });
    toast("已重置演示进度");
  } else if (action === "close-overlay") {
    resetVoice();
    closeOverlay();
  } else if (action === "speak-word") {
    speak(el.dataset.word);
  } else if (action === "open-review") {
    openReview();
  } else if (action === "record-say") {
    recordSay();
  } else if (action === "play-voice") {
    playVoice();
  } else if (action === "open-map") {
    go("map");
  }
});

window.addEventListener("popstate", (e) => {
  const s = (e.state && e.state.screen) || "home";
  if (!screenContextValid(s)) { current = s === "quiz" ? "map" : "home"; render(); return; }
  clearTimers();
  current = s;
  render();
});

document.addEventListener("gesturestart", (e) => e.preventDefault());

/* ============================================================
   🎁 神秘宝箱开箱 overlay（Week 4）
   ============================================================ */
function buildChestOverlay(stage) {
  const left = !stage;
  const nextAvailable = ChestManager.available();
  const pct = Math.round((state.dex.length / STAGES.length) * 100);

  if (left) {
    /* 图鉴已经收齐了（理论上不会走到这里，因为 ChestManager.pickRandomDino 会返回 null） */
    return `<div class="overlay"><section class="sheet chest-sheet" role="dialog" aria-modal="true">
      <div class="chest-open">
        <div class="chest-emoji">🏆</div>
        <h2>图鉴全部收集！</h2>
        <p>你已经发现了所有 ${STAGES.length} 种恐龙形态</p>
        <button class="btn" data-action="chest-close">太棒了</button>
      </div>
    </section></div>`;
  }

  return `<div class="overlay"><section class="sheet chest-sheet" role="dialog" aria-modal="true">
    <div class="chest-reveal">
      <div class="chest-sparkle">✨✨✨</div>
      <div class="chest-found">
        <div class="cf-stage">${dino(stage.key, { size: "lg" })}</div>
      </div>
      <div class="chest-meta">
        <div class="chest-rarity rarity-${stage.rarity}">${"★".repeat(stage.rarity)}</div>
        <h2>发现了 <b>${stage.name}</b>！</h2>
        <p class="chest-phase">${stage.phase} · ${stage.skill}</p>
        <p class="chest-desc">${stage.desc}</p>
      </div>
      <div class="chest-progress">
        <span>图鉴进度</span>
        <b>${state.dex.length} / ${STAGES.length}</b>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </div>
      <div class="chest-actions">
        ${nextAvailable > 0
          ? `<button class="btn" data-action="chest-again">继续开 · 剩 ${nextAvailable} 个</button>
             <button class="btn ghost" data-action="chest-close">收下了</button>`
          : `<button class="btn" data-action="chest-close">收下了！</button>`}
      </div>
    </div>
  </section></div>`;
}
