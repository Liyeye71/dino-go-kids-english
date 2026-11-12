/* ============================================================
   全局事件：点击动作分发、浏览器后退与手势拦截
   ============================================================ */

/* ------------------------------------------------ events */
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
  } else if (action === "check") {
    checkAnswer();
  } else if (action === "match-word") {
    matchPickWord(el.dataset.word);
  } else if (action === "match-art") {
    matchPickArt(el.dataset.word);
  } else if (action === "repeat-done") {
    repeatDone();
  } else if (action === "next") {
    nextQuestion();
  } else if (action === "close-quiz") {
    quiz = null;
    go("map", { replace: true });
  } else if (action === "evolve") {
    beginEvolution();
  } else if (action === "shop-tab") {
    shopTab = el.dataset.tab;
    sfx("tap");
    render();
    const sc = $(".scroll"); if (sc) sc.scrollTop = 0;
  } else if (action === "buy-item") {
    openBuyItem(el.dataset.id);
  } else if (action === "equip-item") {
    toggleItem(el.dataset.id);
  } else if (action === "locked-item") {
    const item = ITEMS.find((i) => i.id === el.dataset.id);
    if (item && item.unlockStage) toast(`进化到${stageMeta(item.unlockStage).name}即可解锁`);
  } else if (action === "buy-bg") {
    openBuyBg(el.dataset.id);
  } else if (action === "equip-bg") {
    equipBg(el.dataset.id);
  } else if (action === "confirm-buy") {
    confirmBuy();
  } else if (action === "dex-detail") {
    openDexDetail(el.dataset.key);
  } else if (action === "filter-dex") {
    dexFilter = el.dataset.filter;
    sfx("tap");
    render();
  } else if (action === "filter-word") {
    wordsLetter = el.dataset.letter;
    sfx("tap");
    render();
    const sc = $(".scroll"); if (sc) sc.scrollTop = 0;
  } else if (action === "theme") {
    state.theme = el.dataset.theme;
    save();
    sfx("tap");
    render();
  } else if (action === "settings") {
    openSettings();
  } else if (action === "toggle-sound") {
    state.sound = !state.sound;
    save();
    if (state.sound) { ensureAudio(); sfx("tap"); }
    syncMusic(current, state.theme);
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
  if (s === "result" && !lastResult) { current = "home"; render(); return; }
  if (s === "evolution" && !evolutionInfo) { current = "home"; render(); return; }
  if (s === "quiz" && !quiz) { current = "map"; render(); return; }
  clearTimers();
  current = s;
  render();
});

document.addEventListener("gesturestart", (e) => e.preventDefault());
