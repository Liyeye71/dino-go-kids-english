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

/* 家长角：右上角钥匙需长按 1.5 秒才进入，避免幼儿误触 */
let parentGateTimer = null;
let parentGateHit = null;
let parentGateOpenAt = 0;
document.addEventListener("pointerdown", (e) => {
  const gate = e.target.closest && e.target.closest('[data-action="parent-gate"]');
  if (!gate) return;
  parentGateHit = gate;
  clearTimeout(parentGateTimer);
  parentGateTimer = setTimeout(() => {
    if (!parentGateHit) return;
    parentGateHit.dataset.gateOpen = "1";
    parentGateOpenAt = Date.now();
    sfx("tap");
    go("profile");
  }, 1500);
}, { passive: true });
["pointerup", "pointercancel"].forEach((ev) => document.addEventListener(ev, () => {
  clearTimeout(parentGateTimer);
  parentGateTimer = null;
  parentGateHit = null;
}, { passive: true }));

document.addEventListener("click", (e) => {
  /* 长按进门后的同一次点击可能是从旧元素冒泡来的，直接吞掉避免误触新页面 */
  if (parentGateOpenAt && Date.now() - parentGateOpenAt < 600) return;
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
  } else if (action === "parent-gate") {
    if (el.dataset.gateOpen === "1") { delete el.dataset.gateOpen; return; }
    toast("长按 1.5 秒进入家长角");
  } else if (action === "nest-open") {
    openNest();
    sfx("tap");
  } else if (action === "growth-info") {
    openGrowth();
    sfx("tap");
  } else if (action === "profile") {
    go("profile");
    sfx("tap");
  } else if (action === "open-achievements") {
    openAchievements();
  } else if (action === "ach-detail") {
    const a = achievementList().find((x) => x.id === el.dataset.id);
    if (a) toast(`${a.name}：${a.desc} · ${a.done ? "已点亮" : a.sub}`);
    sfx("tap");
  } else if (action === "start-quiz") {
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
  } else if (action === "daily-start") {
    closeOverlay();
    startDailyQuiz();
  } else if (action === "select") {
    selectOption(el.dataset.word);
  } else if (action === "listen-selected") {
    shakeBtn(el);
    listenSelected();
  } else if (action === "action-sound") {
    /* 无论该动作是否配置拟声音效，点击都给出抖动反馈 */
    shakeBtn(el);
    playActionSound(el.dataset.sound, el);
  } else if (action === "next") {
    nextQuestion();
  } else if (action === "close-quiz") {
    /* 关闭答题页时立即中断题型提示 / 单词朗读与动作拟声音效 */
    stopSpeak();
    stopActionSound();
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
    shakeBtn(el);
    const q = quiz && quiz.order[quiz.index];
    /* 动物喂食题读食物；情景对话整句题读正确整句；其余读单词 */
    if (q) {
      const isDialogSentence = q.type === "dialog" && q.dialog && q.dialog.mode === "sentence";
      const text = q.type === "feed_animal"
        ? (q.correctFood || q.word || "")
        : isDialogSentence ? (q.answerText || q.answerValue || q.word || "")
          : (q.word || "");
      speak(text);
    }
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
    const skin = Math.min(ULTRA_ART.length, Math.max(1, Number(el.dataset.skin) || 1));
    if (!ultraSkinOwned(skin)) { toast("先在图鉴里兑换这只究极体吧"); return; }
    equipUltra(skin);
  } else if (action === "buy-ultra") {
    openBuyUltra(el.dataset.id || el.dataset.skin);
  } else if (action === "confirm-ultra") {
    confirmBuyUltra();
  } else if (action === "locked-ultra") {
    toast(`成长值达到 ${ULTRA_MIN} 后，用 ${ULTRA_PRICE} 星星兑换究极体`);
  } else if (action === "open-ultra-dex") {
    collectTab = "dex";
    dexFilter = "ultra";
    sfx("tap");
    go("collect", { replace: true });
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
  } else if (action === "enlighten-toggle") {
    /* 启蒙模式：2 选项 + 零挫败答题，屏蔽拼写与长句对话 */
    state.enlighten = !state.enlighten;
    save();
    sfx("tap");
    render();
  } else if (action === "unit") {
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
  } else if (action === "open-animal-scene") {
    sfx("tap");
    openAnimalScene(el.dataset.scene);
  } else if (action === "zoo-node") {
    /* 🦁 路线弹框里的关卡节点 */
    const level = Number(el.dataset.level) || 1;
    const prog = sceneProgress("animal", "zoo");
    const cleared = Boolean(prog.cleared && prog.cleared[level]);
    if (level > prog.level) {
      toast(`先完成第 ${prog.level} 关，才能解锁这一关`);
      return;
    }
    sfx("tap");
    closeOverlay();
    startQuiz(level, { replay: cleared || level < prog.level });
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
  } else if (action === "chest-open") {
    /* 🎁 BOSS 奖励的额外宝箱 */
    if (!ChestManager.openOne()) return;
    sfx("win");
    LuckyWheel.open({ fromChest: true });
    render(); /* 更新地图上的宝箱计数 */
  /* 🧩 词汇拼图 Word Puzzle：点字母 → 依次填入槽位 */
  } else if (action === "pz-letter") {
    puzzlePlace(Number(el.dataset.letter));
  } else if (action === "pz-check") {
    if (!quiz || quiz.revealed) return;
    const q = quiz.order[quiz.index];
    const got = q.puzzleCells.map((c) => {
      if (c.hint) return c.hint;
      const s = q.puzzleSlots.find((x) => x.id === c.slot);
      const l = s && s.filled !== null ? q.puzzleLetters.find((x) => x.id === s.filled) : null;
      return l ? l.ch : "_";
    }).join("").toLowerCase();
    const target = q.word.toUpperCase().toLowerCase();
    const ok = got === target;
    quiz.revealed = true;
    quiz.choiceCorrect = ok;
    quiz.selected = ok ? q.word : got;
    if (ok) {
      quiz.correct++; quiz.words.push(q.word); sfx("excellent");
      unlockTaskWord(q);
      WrongBank.applyResult(q, true);
    } else {
      sfx("wrong");
      WrongBank.applyResult(q, false);
    }
    render();

  /* 🍎 动物喂食 Feed Animal */
  } else if (action === "fd-pick") {
    feedPick(el.dataset.food);

  } else if (action === "settings") {
    openSettings();
  } else if (action === "wheel-open") {
    LuckyWheel.open();
  } else if (action === "wheel-spin") {
    LuckyWheel.spin();
  } else if (action === "wheel-win-ok") {
    LuckyWheel.closeWinPop();
  } else if (action === "coupon-ask") {
    /* 家长核销第一步：进入二次确认，避免宝宝误点 */
    LuckyWheel.askRedeem(Number(el.dataset.index));
  } else if (action === "coupon-cancel") {
    LuckyWheel.cancelRedeem();
  } else if (action === "coupon-redeem") {
    LuckyWheel.redeem(Number(el.dataset.index));
  } else if (action === "toggle-sound") {
    state.sound = !state.sound;
    save();
    if (state.sound) { ensureAudio(); sfx("tap"); }
    else stopActionSound();
    openSettings();
    toast(state.sound ? "音效已开启" : "音效已关闭");
  } else if (action === "toggle-voice") {
    state.voice = state.voice === "standard" ? "kids" : "standard";
    save();
    sfx("tap");
    stopSpeak();
    speak("Hello! Let's learn English together!");
    openSettings();
    toast(state.voice === "kids" ? "已切换童趣朗读" : "已切换标准朗读");
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
    shakeBtn(el);
    speak(el.dataset.word);
  } else if (action === "speak-text") {
    /* 情景对话：朗读 A 提问框里的完整句子 */
    shakeBtn(el);
    speak(el.dataset.text);
  } else if (action === "open-review") {
    openReview();
  } else if (action === "record-say") {
    recordSay();
  } else if (action === "play-voice") {
    playVoice();
  } else if (action === "poke-dino") {
    pokeDinoInteraction(el);
  } else if (action === "next-home-word") {
    sfx("tap");
    reviewWord = randomWord();
    render();
  } else if (action === "island-prev") {
    shiftIsland(-1);
  } else if (action === "island-next") {
    shiftIsland(1);
  } else if (action === "island-jump") {
    jumpIsland(el.dataset.idx);
  } else if (action === "island-soon") {
    sfx("tap");
    toast(`${el.dataset.name || "新岛屿"}正在云雾中建造，先去每日飞艇抢先体验单词吧！`);
  } else if (action === "td-hatch") {
    if (!quiz || quiz.revealed) return;
    const q = quiz.order[quiz.index];
    quiz.hatchHits = (quiz.hatchHits || 0) + 1;
    sfx(quiz.hatchHits >= (q.hatchNeed || 3) ? "excellent" : "tap");
    if (quiz.hatchHits >= (q.hatchNeed || 3)) {
      quiz.revealed = true;
      quiz.choiceCorrect = true;
      quiz.correct++;
      quiz.words.push(q.word);
      if (typeof unlockTaskWord === "function") unlockTaskWord(q);
      setTimer(() => speak(`It's a ${q.word}! ${q.word}!`), 320);
    }
    render();
  } else if (action === "td-count-feed") {
    if (!quiz || quiz.revealed) return;
    const q = quiz.order[quiz.index];
    const numWords = ["One!", "Two!", "Three!", "Four!", "Five!"];
    quiz.countFed = (quiz.countFed || 0) + 1;
    const target = q.feedTarget || 2;
    speak(numWords[quiz.countFed - 1] || String(quiz.countFed));
    if (quiz.countFed >= target) {
      quiz.revealed = true;
      quiz.choiceCorrect = true;
      quiz.correct++;
      quiz.words.push(q.word);
      sfx("excellent");
      if (typeof unlockTaskWord === "function") unlockTaskWord(q);
      setTimer(() => speak(`Yummy! ${q.food ? q.food.en : ""}`), 550);
    } else {
      sfx("correct");
    }
    render();
  }
});


/* 浮空岛舞台手势：支持在 iPad / 手机上左右滑动切换主题岛 */
let _imTouchX = null;
document.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".im-stage") && !e.target.closest(".im-nav-btn")) _imTouchX = e.clientX;
});
document.addEventListener("pointerup", (e) => {
  if (_imTouchX === null) return;
  const dx = e.clientX - _imTouchX;
  _imTouchX = null;
  if (Math.abs(dx) > 48 && current === "map") shiftIsland(dx < 0 ? 1 : -1);
});

/* 全屏恐龙营地空白区域点击彩蛋：指尖绽放恐龙小脚印波纹（0.8s 淡出） */
document.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button, a, .bc-sign-board, .overlay")) return;
  if (!e.target.closest(".basecamp-screen")) return;
  const paw = document.createElement("span");
  paw.className = "dino-paw-ripple";
  paw.style.left = `${e.clientX}px`;
  paw.style.top = `${e.clientY}px`;
  paw.style.setProperty("--pr", `${Math.round(Math.random() * 44 - 22)}deg`);
  paw.innerHTML = `<svg viewBox="0 0 40 40" fill="none"><g fill="#8C6232" opacity=".55"><ellipse cx="20" cy="25" rx="8.5" ry="6.8"/><circle cx="11" cy="14" r="3.4"/><circle cx="20" cy="10.5" r="3.6"/><circle cx="29" cy="14" r="3.4"/></g></svg>`;
  document.body.appendChild(paw);
  setTimeout(() => paw.remove(), 820);
});

window.addEventListener("popstate", (e) => {
  const s = (e.state && e.state.screen) || "home";
  if (!screenContextValid(s)) { current = s === "quiz" ? "map" : "home"; render(); return; }
  clearTimers();
  current = s;
  render();
});

document.addEventListener("gesturestart", (e) => e.preventDefault());
