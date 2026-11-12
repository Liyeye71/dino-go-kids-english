/* ============================================================
   启动与渲染：屏幕注册、首屏渲染与 PWA 注册
   ============================================================ */

/* ------------------------------------------------ render */
/* 页面渲染表在 boot() 里装配，保证四个 Tab 文件都已加载 */
let SCREEN_FN = {};
function render() {
  const fn = SCREEN_FN[current] || screenHome;
  $("#view").innerHTML = fn();
  syncMusic(current, state.theme);
}

/* ------------------------------------------------ boot */
function boot() {
  SCREEN_FN = {
    home: screenHome,
    map: screenMap,
    quiz: screenQuiz,
    result: screenResult,
    evolution: screenEvolution,
    shop: screenShop,
    words: screenWords,
    profile: screenProfile,
  };
  try {
    if (!history.state || !history.state.screen) history.replaceState({ screen: "home" }, "");
    else current = history.state.screen;
  } catch (e) { current = "home"; }

  // A result/evolution screen cannot be restored without runtime context.
  if (current === "result" && !lastResult) current = "home";
  if (current === "evolution" && !evolutionInfo) current = "home";
  if (current === "quiz" && !quiz) current = "home";
  /* 旧存档里的“图鉴”Tab 已并入小铺 → 图鉴 */
  if (current === "dex") { current = "shop"; shopTab = "dex"; }

  render();

  // Warm up the audio graph on the first touch (iOS requirement).
  const wake = () => { ensureAudio(); syncMusic(current, state.theme); document.removeEventListener("touchstart", wake); document.removeEventListener("click", wake); };
  document.addEventListener("touchstart", wake, { passive: true });
  document.addEventListener("click", wake);

  // iOS install hint — only once, and only in Safari (not standalone).
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  let seen = false;
  try { seen = localStorage.getItem("dinogo.installHint") === "1"; } catch (e) {}
  if (isIOS && !standalone && !seen) {
    setTimeout(() => {
      if (current !== "home") return;
      try { localStorage.setItem("dinogo.installHint", "1"); } catch (e) {}
      toast("提示：分享 → 添加到主屏幕，可全屏离线玩");
    }, 2400);
  }
}

/* PWA: cache the app for offline use when served over http(s). */
if ("serviceWorker" in navigator && !window.__DINOGO_SINGLE__ && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
