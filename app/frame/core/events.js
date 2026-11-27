/* ============================================================
   全局事件：点击动作分发、浏览器后退与手势拦截
   ============================================================ */

/* ------------------------------------------------ events */
function renderAndResetScroll() {
  render();
  const sc = $(".scroll");
  if (sc) sc.scrollTop = 0;
}
/* 喇叭按钮点击抖动反馈 */
function shakeBtn(el) {
  if (!el) return;
  el.classList.remove("is-shaking");
  /* 强制 reflow 让动画可重放 */
  void el.offsetWidth;
  el.classList.add("is-shaking");
  setTimeout(() => el.classList.remove("is-shaking"), 560);
}

/* 家长角长按 + 浮空岛左右滑动 + 营地脚印彩蛋：合并为统一 pointer 监听 */
let parentGateTimer = null;
let parentGateHit = null;
let parentGateOpenAt = 0;
let _imTouchX = null;

function clearParentGate() {
  clearTimeout(parentGateTimer);
  parentGateTimer = null;
  parentGateHit = null;
}

document.addEventListener("pointerdown", (e) => {
  const target = e.target;
  if (!target || !target.closest) return;

  /* 1. 家长角：右上角钥匙需长按 1.5 秒才进入，避免幼儿误触 */
  const gate = target.closest('[data-action="parent-gate"]');
  if (gate) {
    parentGateHit = gate;
    clearTimeout(parentGateTimer);
    parentGateTimer = setTimeout(() => {
      if (!parentGateHit) return;
      parentGateHit.dataset.gateOpen = "1";
      parentGateOpenAt = Date.now();
      sfx("tap");
      go("profile");
    }, 1500);
    return;
  }

  /* 2. 浮空岛舞台手势：支持在 iPad / 手机上左右滑动切换主题岛 */
  if (target.closest(".im-stage") && !target.closest(".im-nav-btn")) {
    _imTouchX = e.clientX;
    return;
  }

  /* 3. 全屏恐龙营地空白区域点击彩蛋：指尖绽放恐龙小脚印波纹（0.8s 淡出） */
  if (!target.closest("button, a, .bc-sign-board, .overlay") && target.closest(".basecamp-screen")) {
    const paw = document.createElement("span");
    paw.className = "dino-paw-ripple";
    paw.style.left = `${e.clientX}px`;
    paw.style.top = `${e.clientY}px`;
    paw.style.setProperty("--pr", `${Math.round(Math.random() * 44 - 22)}deg`);
    paw.innerHTML = `<svg viewBox="0 0 40 40" fill="none"><g fill="#8C6232" opacity=".55"><ellipse cx="20" cy="25" rx="8.5" ry="6.8"/><circle cx="11" cy="14" r="3.4"/><circle cx="20" cy="10.5" r="3.6"/><circle cx="29" cy="14" r="3.4"/></g></svg>`;
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 820);
  }
}, { passive: true });

document.addEventListener("pointerup", (e) => {
  clearParentGate();
  if (_imTouchX !== null) {
    const dx = e.clientX - _imTouchX;
    _imTouchX = null;
    if (Math.abs(dx) > 48 && current === "map") shiftIsland(dx < 0 ? 1 : -1);
  }
}, { passive: true });

document.addEventListener("pointercancel", () => {
  clearParentGate();
  _imTouchX = null;
}, { passive: true });

/* 点击动作路由表（O(1) 分发，替代超长 if/else 链） */
const ACTIONS = {
  tab(el) {
    closeOverlay();
    go(el.dataset.screen, { replace: true });
    sfx("tap");
  },
  home() {
    closeOverlay();
    go("home", { replace: true });
  },
  "parent-gate"(el) {
    if (el.dataset.gateOpen === "1") { delete el.dataset.gateOpen; return; }
    toast("长按 1.5 秒进入家长角");
  },
  "nest-open"() { openNest(); sfx("tap"); },
  "growth-info"() { openGrowth(); sfx("tap"); },
  profile() { go("profile"); sfx("tap"); },
  "open-achievements"() { openAchievements(); },
  "ach-detail"(el) {
    const a = achievementList().find((x) => x.id === el.dataset.id);
    if (a) toast(`${a.name}：${a.desc} · ${a.done ? "已点亮" : a.sub}`);
    sfx("tap");
  },
  "start-quiz"(el) {
    closeOverlay();
    /* 从单元地图卡直接开闯：先切到卡片对应的主题 */
    if (el.dataset.theme && THEME_BY_ID.get(el.dataset.theme)) {
      const next = THEME_BY_ID.get(el.dataset.theme);
      state.theme = el.dataset.theme;
      /* 单场景主题没有场景概念，清空上一个主题残留的场景，避免解锁/进度键错位 */
      if (!(next.scenes || []).some((s) => s.id === state.scene)) state.scene = "";
      save();
    }
    startQuiz(el.dataset.level);
  },
  "daily-start"() { closeOverlay(); startDailyQuiz(); },
  select(el) { selectOption(el.dataset.word, el); },
  "listen-selected"(el) { shakeBtn(el); listenSelected(); },
  next() { nextQuestion(); },
  "close-quiz"() {
    /* 关闭答题页时立即中断题型提示 / 单词朗读 */
    stopSpeak();
    settleLock = false;
    quiz = null;
    const prevTheme = state.theme;
    const prevScene = state.scene;
    go("map", { replace: true });
    /* 从带路线图的场景抽屉进入闯关 → 返回时自动重开该场景路线图 */
    if (hasSceneRoute(prevTheme, prevScene)) {
      setTimeout(() => openThemeScene(prevTheme, prevScene), 0);
    }
  },
  "speak-answer"(el) {
    /* 结果条喇叭：按题型协议朗读正确答案 */
    shakeBtn(el);
    const q = quiz && quiz.order[quiz.index];
    if (q) {
      const meta = answerMetaOf(q);
      if (meta.speakText) speak(meta.speakText);
    }
  },
  evolve() { beginEvolution(); },
  "collect-tab"(el) {
    collectTab = el.dataset.tab;
    sfx("tap");
    renderAndResetScroll();
  },
  "buy-bg"(el) { openBuyBg(el.dataset.id); },
  "equip-bg"(el) { equipBg(el.dataset.id); },
  "confirm-buy"() { confirmBuy(); },
  "pick-ultra"(el) {
    const skin = Math.min(ULTRA_ART.length, Math.max(1, Number(el.dataset.skin) || 1));
    if (!ultraSkinOwned(skin)) { toast("先在图鉴里兑换这只究极体吧"); return; }
    equipUltra(skin);
  },
  "buy-ultra"(el) { openBuyUltra(el.dataset.id || el.dataset.skin); },
  "confirm-ultra"() { confirmBuyUltra(); },
  "locked-ultra"() { toast(`成长值达到 ${ULTRA_MIN} 后，用 ${ULTRA_PRICE} 星星兑换究极体`); },
  "open-ultra-dex"() {
    collectTab = "dex";
    dexFilter = "ultra";
    sfx("tap");
    go("collect", { replace: true });
  },
  "filter-dex"(el) { dexFilter = el.dataset.filter; sfx("tap"); render(); },
  "filter-word"(el) { wordsLetter = el.dataset.letter; sfx("tap"); renderAndResetScroll(); },
  theme(el) { state.theme = el.dataset.theme; save(); sfx("tap"); render(); },
  "enlighten-toggle"() {
    /* 启蒙模式：2 选项，屏蔽情景对话 */
    state.enlighten = !state.enlighten;
    save();
    sfx("tap");
    render();
  },
  unit(el) {
    /* 顶层单元切换：锁定单元只提示，不进入 */
    const target = UNIT_BY_ID.get(el.dataset.unit);
    if (!target) return;
    if (target.locked) { toast(`${target.name}正在筹备中，敬请期待`); return; }
    const first = themesOfUnit(target)[0];
    if (!first) { toast("这个单元还没有开放内容"); return; }
    state.unit = target.id;
    state.theme = first.id;
    save();
    sfx("tap");
    render();
  },
  "open-scene"(el) { sfx("tap"); openThemeScene(el.dataset.theme || state.theme, el.dataset.scene); },
  "open-animal-scene"(el) { sfx("tap"); openThemeScene("animal", el.dataset.scene); },
  "route-node"(el) {
    /* 通用路线图抽屉里的关卡节点 */
    const level = Number(el.dataset.level) || 1;
    const themeId = el.dataset.theme || state.theme;
    const sceneId = el.dataset.scene || state.scene;
    const prog = sceneProgress(themeId, sceneId);
    const cleared = Boolean(prog.cleared && prog.cleared[level]);
    const best = (prog.stars && prog.stars[level]) || 0;
    if (cleared && best >= 3) {
      toast("这一关已经满星啦");
      return;
    }
    if (level > prog.level) {
      toast(`先完成第 ${prog.level} 关，才能解锁这一关`);
      return;
    }
    sfx("tap");
    closeOverlay();
    startQuiz(level, { replay: cleared || level < prog.level });
  },
  "route-zoom-in"() { sfx("tap"); if (window.RouteSheetView) RouteSheetView.zoomIn(); },
  "route-zoom-out"() { sfx("tap"); if (window.RouteSheetView) RouteSheetView.zoomOut(); },
  "route-zoom-reset"() { sfx("tap"); if (window.RouteSheetView) RouteSheetView.resetZoom(); },
  "chest-claim"(el) {
    /* 🎁 旅程进度条上的里程碑宝箱：开箱即送 1 次免费转盘；按按钮上的主题领取对应进度 */
    const res = ChestManager.claimJourney(Number(el.dataset.threshold) || 0, el.dataset.theme);
    if (res.status === "locked") {
      toast(`再获得 ${res.need} 颗星就能开启这个宝箱`);
      return;
    }
    if (res.status === "done") return;
    sfx("win");
    LuckyWheel.open({ fromChest: true });
    render();
  },
  "chest-open"() {
    /* 🎁 BOSS 奖励的额外宝箱 */
    if (!ChestManager.openOne()) return;
    sfx("win");
    LuckyWheel.open({ fromChest: true });
    render(); /* 更新地图上的宝箱计数 */
  },
  /* 🍎 动物喂食 Feed Animal */
  "fd-pick"(el) { feedPick(el.dataset.food, el); },
  settings() { openSettings(); },
  "wheel-open"() { LuckyWheel.open(); },
  "wheel-spin"() { LuckyWheel.spin(); },
  "wheel-win-ok"() { LuckyWheel.closeWinPop(); },
  /* 家长核销第一步：进入二次确认，避免宝宝误点 */
  "coupon-ask"(el) { LuckyWheel.askRedeem(Number(el.dataset.index)); },
  "coupon-cancel"() { LuckyWheel.cancelRedeem(); },
  "coupon-redeem"(el) { LuckyWheel.redeem(Number(el.dataset.index)); },
  "toggle-sound"() {
    state.sound = !state.sound;
    save();
    if (state.sound) { ensureAudio(); sfx("tap"); }
    openSettings();
    toast(state.sound ? "音效已开启" : "音效已关闭");
  },
  "toggle-voice"() {
    state.voice = state.voice === "standard" ? "kids" : "standard";
    save();
    sfx("tap");
    stopSpeak();
    speak("Hello! Let's learn English together!");
    openSettings();
    toast(state.voice === "kids" ? "已切换童趣朗读" : "已切换标准朗读");
  },
  "install-guide"() { openInstallGuide(); },
  "reset-confirm"() { openResetConfirm(); },
  "confirm-reset"() {
    resetState();
    closeOverlay();
    go("home", { replace: true });
    toast("已重置演示进度");
  },
  "close-overlay"() { resetVoice(); closeOverlay(); },
  "speak-word"(el) { shakeBtn(el); speak(el.dataset.word); },
  /* 动作猜猜：点击舞台重播卡通动作拟声 */
  "action-sfx"(el) { if (typeof actionSfx === "function") actionSfx(el.dataset.word); },
  /* 情景对话：朗读 A 提问框里的完整句子 */
  "speak-text"(el) { shakeBtn(el); speak(el.dataset.text); },
  "open-review"() { openReview(); },
  "record-say"() { recordSay(); },
  "play-voice"() { playVoice(); },
  "poke-dino"(el) { pokeDinoInteraction(el); },
  "next-home-word"() {
    sfx("tap");
    reviewWord = randomWord();
    render();
  },
  "island-prev"() { shiftIsland(-1); },
  "island-next"() { shiftIsland(1); },
  "island-jump"(el) { jumpIsland(el.dataset.idx); },
  "island-soon"(el) {
    sfx("tap");
    toast(`${el.dataset.name || "新岛屿"}正在云雾中建造，先去每日飞艇抢先体验单词吧！`);
  },
};

document.addEventListener("click", (e) => {
  /* 长按进门后的同一次点击可能是从旧元素冒泡来的，直接吞掉避免误触新页面 */
  if (parentGateOpenAt && Date.now() - parentGateOpenAt < 600) return;
  if (e.target.classList && e.target.classList.contains("overlay")) { closeOverlay(); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const handler = ACTIONS[el.dataset.action];
  if (handler) handler(el);
});

window.addEventListener("popstate", (e) => {
  const s = (e.state && e.state.screen) || "home";
  if (!screenContextValid(s)) { current = s === "quiz" ? "map" : "home"; render(); return; }
  clearTimers();
  current = s;
  render();
});

document.addEventListener("gesturestart", (e) => e.preventDefault());
/* 兜底：阻止任何图片被原生拖拽（长按图片拖出框） */
document.addEventListener("dragstart", (e) => {
  const t = e.target;
  if (t && t.tagName === "IMG") e.preventDefault();
}, true);
