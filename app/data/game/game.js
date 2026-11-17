/* ============================================================
   DinoGo · 恐龙英语 — 游戏流程
   包含公共答题流程、闯关结算和恐龙进化
   ============================================================ */

function levelPlan(level) {
  const plans = currentTheme().levelGames || {};
  return plans[level] || plans[10];
}

const UNKNOWN_ART = (word) => emojiArt(wordGlyph(word));
let artMap = null;
/* 当前主题（或场景）的「单词 → 插图」索引，避免每个选项都线性查找 */
function artOf(word) {
  const theme = currentTheme();
  const key = `${theme.id}:${state.scene || ""}`;
  if (!artMap || artMap.key !== key) {
    artMap = { key, map: new Map(themeWords().map((w) => [w.word, w.art])) };
  }
  return artMap.map.get(word) || (() => UNKNOWN_ART(word));
}

/* 判断当前是否为动物园场景（启用动态出题引擎） */
function isZooScene() {
  return state.theme === "animal" && state.scene === "zoo";
}

/* 当前动物园场景对象 */
function zooScene() {
  return (currentTheme().scenes || []).find((s) => s.id === (state.scene || "zoo")) || null;
}

/* 关卡对应的主题馆信息：{ level, venue, step, x, y } */
function zooLevelInfo(level) {
  const scene = zooScene();
  return scene && scene.levels ? scene.levels[level - 1] || null : null;
}

/* 每馆第 5 关为馆内 BOSS，最后一关为总 BOSS */
function isAnimalBossLevel(level) {
  return isZooScene() && Number(level) % LEVELS_PER_VENUE === 0;
}
function isAnimalFinalBoss(level) {
  const scene = zooScene();
  return isZooScene() && !!scene && Number(level) === scene.levelCount;
}

function buildTasks(level) {
  const theme = currentTheme();
  const pool = themeWords();
  const dlg = theme.dialog || { q: "What's this?", a: "It's a {word}." };

  /* 🦁 动物园场景：双层动态出题引擎（错题库加权 + 10抽5题型） */
  if (isZooScene() && window.DynamicEngine) {
    const sceneId = state.scene || "zoo";
    const scene = zooScene();
    /* 当前关卡所属主题馆：1~5 关 → 第 1 馆，6~10 关 → 第 2 馆…… */
    const info = zooLevelInfo(level);
    const venueWords = info ? info.venue.words : pool;
    /* 整个场景的全量词池（用于生成干扰项 + 降级兜底） */
    const allSceneWords = scene && scene.words && scene.words.length ? scene.words : pool;
    let questions = DynamicEngine.generateSession(
      allSceneWords, venueWords, sceneId, level,
      info ? info.step : level, isAnimalFinalBoss(level)
    );
    /* 安全兜底：只保留 defaultGames 里已有 render 的题型（新题型 Week 2+ 才逐个上线） */
    questions = questions.filter((q) => theme.games[q.gameType] && theme.games[q.gameType].render);
    /* 不够 5 道就降级：循环用已实现的题型补足 */
    const implementedTypes = Object.keys(theme.games).filter((k) => theme.games[k].render);
    while (questions.length < 5 && implementedTypes.length > 0) {
      const fbType = implementedTypes[Math.floor(Math.random() * implementedTypes.length)];
      const fbGame = theme.games[fbType];
      let fbCandidates = venueWords.filter((w) => {
        const wid = WrongBank.makeId(sceneId, w.word);
        return !questions.some((q) => WrongBank.makeId(sceneId, q.targetWord.word) === wid);
      });
      if (fbCandidates.length === 0) {
        fbCandidates = allSceneWords.filter((w) => {
          const wid = WrongBank.makeId(sceneId, w.word);
          return !questions.some((q) => WrongBank.makeId(sceneId, q.targetWord.word) === wid);
        });
      }
      if (fbCandidates.length === 0) break;
      const fbTarget = WrongBank.pickWithBias(fbCandidates, (w) => WrongBank.makeId(sceneId, w.word));
      questions.push({ gameType: fbType, recordWrong: true, targetWord: fbTarget, distractors: [] });
    }
    /* 把 DynamicEngine 输出转为现有 quiz.order 兼容的 task 对象 */
    return questions.slice(0, 5).map((q) => {
      /* 从全量词池找完整的词对象 */
      const w = allSceneWords.find((x) => x.word === q.targetWord.word)
             || pool.find((x) => x.word === q.targetWord.word)
             || q.targetWord;
      const task = {
        type: q.gameType,
        word: w.word,
        zh: w.zh || "",
        emoji: w.emoji || "",
        art: w.art || (() => UNKNOWN_ART(w.word)),
        phon: w.phon || "",
        category: w.category || "",
        animal: !!w.animal,
        eats: w.eats || "",
        dlgQ: dlg.q,
        dlgA: dlg.a,
        recordWrong: q.recordWrong,
        wrongWordId: WrongBank.makeId(sceneId, w.word),
      };
      /* 让现有题型的 build 自动填充 options / pairs 等字段（选项只取本馆词） */
      const game = theme.games[q.gameType];
      if (game && game.build) game.build(task, venueWords);
      return task;
    });
  }

  /* ✈️🍽️ 旅行 / 美食 / 海洋：原有固定题型顺序逻辑 */
  const picks = shuffle(pool);
  return levelPlan(level).map((type, i) => {
    const w = picks[i % picks.length];
    const task = { type, word: w.word, art: w.art, phon: w.phon, dlgQ: dlg.q, dlgA: dlg.a };
    const game = theme.games[type];
    if (game.build) game.build(task, pool);
    return task;
  });
}

function startQuiz(level) {
  const lvl = Math.min(levelsPerTheme(), Math.max(1, Number(level) || themeProgress().level));
  quiz = {
    level: lvl,
    index: 0,
    correct: 0,
    hearts: 3,
    combo: 0,
    selected: null,
    revealed: false,
    choiceCorrect: null,
    matched: [],
    pickWord: null,
    matchWrong: 0,
    startedAt: Date.now(),
    words: [],
    order: buildTasks(lvl),
  };
  lastResult = null;
  levelCue(currentTheme().id);
  go("quiz");
  speakTask();
}

const FX_COLORS = ["#FFC94A", "#FF8A4C", "#5BC178", "#5FBCDA", "#FF6F61", "#B8E05A"];
/* 答对：全屏庆祝特效 */
function correctFx(combo) {
  const confetti = Array.from({ length: 18 }, (_, i) => {
    const left = 5 + Math.round(Math.random() * 90);
    const delay = (Math.random() * 0.45).toFixed(2);
    const dur = (1.05 + Math.random() * 0.6).toFixed(2);
    const size = 6 + Math.round(Math.random() * 6);
    const round = i % 3 === 0 ? "50%" : "0.125rem";
    return `<i style="left:${left}%;width:${sz(size)};height:${sz(size)};background:${FX_COLORS[i % FX_COLORS.length]};border-radius:${round};animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
  }).join("");
  return `<div class="qfx ok-fx" aria-hidden="true">
    <div class="fx-confetti">${confetti}</div>
    <div class="fx-badge">
      <span class="fx-check">${I.check(28)}</span>
      <b>太棒了！</b>
      <span class="fx-sub">${combo >= 2 ? `连对 ${combo} 题 · 保持节奏！` : "答对啦，继续加油！"}</span>
    </div>
  </div>`;
}
/* 答错：醒目的正确答案提示（英文 + 中文） */
function wrongFx(word, zh) {
  return `<div class="qfx bad-fx" aria-hidden="true">
    <div class="fx-wrong">
      <span class="fx-wrong-ic">✕</span>
      <div class="fx-wrong-txt">
        <b>${word ? "正确答案是" : "别灰心"}</b>
        <span>${word || "下一题继续加油"}${word && zh ? `<i class="fx-zh">${zh}</i>` : ""}</span>
      </div>
    </div>
  </div>`;
}

/* 答完题后统一的手动“下一题”按钮 */
function quizNextButton() {
  if (!quiz) return "";
  const label = quiz.index >= quiz.order.length - 1 || quiz.hearts <= 0 ? "查看成绩" : "Next · 下一题";
  return `<button class="btn" data-action="next">${label} ${I.arrow(18)}</button>`;
}

function screenQuiz() {
  if (!quiz) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const total = quiz.order.length;
  const q = quiz.order[quiz.index];
  const game = currentTheme().games[q.type];
  const selected = quiz.selected;
  const revealed = quiz.revealed;
  const hearts = [0, 1, 2].map((i) => I.heart(16, "#FF6F61", i < quiz.hearts ? 1 : 0.22)).join("");
  const letters = ["A", "B", "C", "D"];
  const optionClass = (opt, base = "option") => {
    if (revealed) {
      if (opt === q.word) return `${base} correct`;
      if (opt === selected) return `${base} wrong`;
      return `${base} dim`;
    }
    return opt === selected ? `${base} sel` : base;
  };
  const choiceButton = () => (revealed ? quizNextButton() : "");
  const options = (list) => list.map((opt, i) => {
    const cls = optionClass(opt);
    const mark = revealed && opt === q.word ? `<span class="mark">${I.check(11)}</span>`
      : !revealed && opt === selected ? `<span class="mark radio"><i></i></span>` : "";
    return `<button class="${cls}" data-action="select" data-word="${opt}">
      <span class="key">${letters[i]}</span><span class="word">${opt}</span>${mark}
    </button>`;
  }).join("");
  const view = game.render({ q, quiz, total, optionClass, choiceButton, options, letters, artOf });
  let combo;
  if (revealed) {
    combo = quiz.choiceCorrect
      ? `太棒了！连对 <b>${quiz.combo}</b> 题`
      : `答错啦，正确答案是 <b>${q.word}</b>${q.zh ? `<i class="ans-zh">${q.zh}</i>` : ""}`;
  } else if (quiz.combo >= 2) {
    combo = `连对 <b>${quiz.combo}</b> 题 · 保持节奏！`;
  } else {
    combo = `连续答对 3 题，可以拿到更多星星`;
  }
  const fx = revealed ? (quiz.choiceCorrect ? correctFx(quiz.combo) : wrongFx(q.options ? q.word : null, q.zh)) : "";
  return `<section class="screen quiz-page ${game.pageClass || ""}" data-screen="quiz">
    ${fx}
    <div class="quiz-top">
      <button class="circle-btn" data-action="close-quiz" aria-label="退出闯关">${I.close(16)}</button>
      <div class="bar qbar"><i style="width:${Math.round((quiz.index / total) * 100)}%"></i></div>
      <div class="qcount num">${quiz.index + 1} <em>/ ${total}</em></div>
      <div class="hearts">${hearts}</div>
    </div>
    <div class="quiz-body">
      <div class="quiz-prompt">
        <div class="chip ${isAnimalBossLevel(quiz.level) ? "boss-chip" : ""}">${isAnimalBossLevel(quiz.level) ? "🔥 BOSS · " : ""}LEVEL ${String(quiz.level).padStart(2, "0")} · ${game.label}</div>
        <h2>${game.title}</h2>
      </div>
      ${view.body}
    </div>
    <div class="quiz-foot">
      <div class="combo${revealed ? (quiz.choiceCorrect ? " good" : " bad") : ""}">${revealed ? (quiz.choiceCorrect ? star(15) : I.info(15)) : I.flame(13)} ${combo}</div>
      ${view.btn}
    </div>
  </section>`;
}

function speakTask() {
  const q = quiz && quiz.order[quiz.index];
  if (q && currentTheme().games[q.type].autoSpeak) setTimer(() => speak(q.word), 450);
}
function selectOption(word) {
  if (!quiz || quiz.revealed) return;
  quiz.selected = word;
  sfx("tap");
  checkAnswer();
}
/* 听发音按钮：沿用原「答完听发音」的位置 */
function listenPill() {
  return `<button class="listen" data-action="listen-selected" aria-label="听发音">${I.speaker(14)} 听发音</button>`;
}
/* 听发音：需先点击选项，答题后朗读正确答案 */
function listenSelected() {
  if (!quiz) return;
  const q = quiz.order[quiz.index];
  const word = quiz.revealed ? q.word : quiz.selected || quiz.pickWord;
  if (!word) return;
  speak(word);
}
function callGameAction(action, value) {
  const q = quiz && quiz.order[quiz.index];
  const game = q && currentTheme().games[q.type];
  if (game && game[action]) game[action](value);
}
function matchPickWord(word) { callGameAction("onPickWord", word); }
function matchPickArt(word) { callGameAction("onPickArt", word); }
function repeatDone() { callGameAction("onDone"); }
function checkAnswer() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  const q = quiz.order[quiz.index];
  const ok = quiz.selected === q.word;
  quiz.revealed = true;
  quiz.choiceCorrect = ok;
  if (ok) {
    quiz.correct++;
    quiz.combo++;
    quiz.words.push(q.word);
    sfx("correct");
    /* 🦁 动物园场景：答对 → 尝试清除错题库 */
    if (isZooScene() && q.recordWrong && q.wrongWordId) WrongBank.recordCorrect(q.wrongWordId);
  } else {
    quiz.hearts = Math.max(0, quiz.hearts - 1);
    quiz.combo = 0;
    sfx("wrong");
    /* 🦁 动物园场景：答错 → 自动收录错题库 */
    if (isZooScene() && q.recordWrong && q.wrongWordId) WrongBank.recordWrong(q.wrongWordId);
  }
  render();
}
function nextQuestion() {
  if (!quiz) return;
  clearTimers();
  if (quiz.index >= quiz.order.length - 1 || quiz.hearts <= 0) { finishQuiz(); return; }
  quiz.index++;
  quiz.selected = null;
  quiz.revealed = false;
  quiz.choiceCorrect = null;
  quiz.matched = [];
  quiz.pickWord = null;
  quiz.matchWrong = 0;
  render();
  speakTask();
}

function finishQuiz() {
  if (!quiz) return;
  const total = quiz.order.length;
  const accuracy = quiz.correct / total;
  /* 答对 3 题 1 星、4 题 2 星、5 题 3 星；2 星及以上才解锁下一关 */
  const stars = quiz.correct >= total ? 3 : quiz.correct >= total - 1 ? 2 : quiz.correct >= total - 2 ? 1 : 0;
  const passed = stars >= PASS_STARS;
  const growthGain = quiz.correct * 24;
  const prog = themeProgress();
  const completedLevel = quiz.level;
  const prevBest = prog.stars[completedLevel] || 0;
  const best = Math.max(prevBest, stars);
  /* 按最高星结算：重复复习只补发「刷新纪录」的差额星星 */
  const starGain = Math.max(0, best - prevBest);
  const isReplay = completedLevel < prog.level;
  const elapsed = Math.max(5, Math.round((Date.now() - quiz.startedAt) / 1000));
  state.growth += growthGain;
  state.stars += starGain;
  prog.stars[completedLevel] = best;
  /* 只有挑战当前关卡且达到 2 星才推进进度，复习旧关卡不影响进度 */
  if (passed && !isReplay) prog.level = Math.min(levelsPerTheme(), completedLevel + 1);
  state.words += quiz.correct;
  state.minutes += Math.max(1, Math.round(elapsed / 60));
  state.threeStars += stars === 3 ? 1 : 0;
  state.tasks.level = true;
  recordLevel(stars);
  const target = stageForGrowth(state.growth);
  const canEvolve = stageIndex(target.key) > stageIndex(state.stage);
  lastResult = {
    level: completedLevel,
    replay: isReplay,
    prevBest,
    best,
    correct: quiz.correct,
    total,
    accuracy: Math.round(accuracy * 100),
    stars,
    passed,
    growthGain,
    starGain,
    seconds: elapsed,
    newWords: quiz.correct,
    canEvolve,
    targetStage: target.key,
    wordList: [...new Set(quiz.words)].slice(0, 3),
  };
  quiz = null;
  save();
  sfx(stars === 3 ? "win" : "coin");

  /* 🔥 总 BOSS 关（第 50 关 动物欢乐马戏团）通关额外奖励 */
  if (isAnimalFinalBoss(completedLevel) && passed && window.ChestManager) {
    const bossChests = ChestManager.rewardBossClear();
    lastResult.bossClear = true;
    lastResult.bossChests = bossChests;
    lastResult.allCleared = ChestManager.isAllCleared();
  }

  go("result", { replace: true });
}

function screenResult() {
  if (!lastResult) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const r = lastResult;
  const st = stageMeta(state.stage);
  const next = nextStage(st.key);
  const pending = r.canEvolve && r.targetStage;
  const target = pending ? stageMeta(r.targetStage) : null;
  const pct = next ? clamp((state.growth - st.min) / (next.min - st.min), 0, 1) : 1;
  const mm = String(Math.floor(r.seconds / 60)).padStart(1, "0");
  const ss = String(r.seconds % 60).padStart(2, "0");
  const starRow = [0, 1, 2].map((i) => star(i === 1 ? 80 : 62, i < r.best ? "#FFC94A" : "#F1E7D2", i < r.best ? "#E9A93C" : "#E5D7BC", i < r.best ? 1 : 0.55)).join("");
  const confettiPieces = Array.from({ length: 26 }, (_, i) => {
    const colors = ["#FFC94A", "#FF8A4C", "#5BC178", "#9FDCF2", "#B8A7FF", "#FF6F61"];
    const w = 5 + (i % 4) * 2, h = 8 + (i % 5) * 3;
    return `<i style="left:${(i * 37 + 13) % 100}%;top:${(i * 29 + 5) % 92}%;width:${sz(w)};height:${sz(h)};background:${colors[i % 6]};transform:rotate(${(i * 47) % 180 - 90}deg);opacity:${0.35 + (i % 5) * 0.1};border-radius:${i % 3 === 0 ? "50%" : "0.125rem"};animation-delay:${(i % 8) * 0.05}s;animation-duration:${1.2 + (i % 5) * 0.18}s"></i>`;
  }).join("");
  return `<section class="screen result-page" data-screen="result">
    <div class="confetti">${confettiPieces}</div>
    <div class="result-scroll">
      <div class="result-head">
        ${r.bossClear ? `<div class="boss-banner">🔥 BOSS 击破！陆地动物园全部通关 🏆</div>` : ""}
        <div class="eyebrow">${r.bossClear ? "🔥 BOSS · LEVEL" : "LEVEL"} ${String(r.level).padStart(2, "0")} · ${r.replay ? "REVIEW" : r.passed ? "COMPLETE" : "RETRY"}</div>
        <h1>${r.bossClear ? "BOSS 击破！你太厉害啦 🎉" : r.replay ? "复习完成！" : r.passed ? "闯关完成！" : "再试一次吧"}</h1>
        ${r.bossClear && r.bossChests ? `<div class="boss-chest-reward"><span>🎁</span> 额外奖励 <b>${r.bossChests}</b> 个神秘宝箱<span>✨</span></div>` : ""}
        <div class="result-stars">${starRow}</div>
        <div class="result-sub">${r.bossClear ? "动物园的所有动物都为你欢呼！去地图上开宝箱吧" : r.replay && r.stars < r.prevBest ? `本次 ${r.stars} 星 · 保留最高 ${r.prevBest} 星成绩` : r.best === 3 ? "三星通关 · 今天的你超厉害" : r.best === 2 ? "两星通关 · 下一关已解锁" : r.best === 1 ? "一星通关 · 拿到两星才能解锁下一关" : "还差一点点，重新挑战这一关吧"}</div>
      </div>

      <div class="result-card">
        <div class="rc-top">
          <div class="rc-growth">
            <div class="g-ic">${I.leaf(28)}</div>
            <div><div class="lb">成长值</div><div class="v num">+${r.growthGain} <small>EXP</small></div></div>
          </div>
          <div class="rc-stars">${star(19)}<span class="num">+${r.starGain}</span></div>
        </div>
        <div class="rc-div"></div>
        <div class="rc-stats">
          <div class="rc-stat"><b class="num">${r.accuracy}%</b><span>正确率</span></div>
          <div class="rc-stat"><b class="num">${mm}:${ss}</b><span>用时</span></div>
          <div class="rc-stat"><b class="num">${r.newWords}</b><span>答对单词</span></div>
        </div>
        <div class="rc-words">
          <span class="lb">WORDS</span>
          ${(r.wordList.length ? r.wordList : themeWords().slice(0, 3).map((w) => w.word)).map((w) => `<span class="w">${w}</span>`).join("")}
        </div>
      </div>

      <section class="grow-card${pending ? " ready" : ""}">
        <div class="gc-top">
          <div class="gc-pet">
            <span class="halo"></span>
            <div class="dino">${dino(state.stage)}</div>
            <span class="gc-phase">${pending ? "可进化" : st.phase}</span>
          </div>
          <div class="gc-main">
            <div class="gc-kicker"><span class="lb">EVOLUTION · 进化进度</span><span class="val num">${state.growth}<i> / ${next ? next.min : "MAX"}</i></span></div>
            <div class="gc-title">${pending ? `${st.name} <b>→</b> ${target.name}<span><b>可以进化啦！</b></span>` : next ? `再获得 <b>${Math.max(0, next.min - state.growth)}</b> 成长值<span>进化为 <b>${next.name}</b></span>` : "已经达到最高形态"}</div>
            <div class="gc-bar"><i style="width:${pending ? 100 : Math.round(pct * 100)}%"></i></div>
          </div>
        </div>
        <div class="gc-note"><span class="ic">${spark(11, pending ? "#D79A2B" : "#6E9A52")}</span><p>${pending ? "<b>小诺已经等不及啦！</b>点下面的按钮见证进化" : "<b>小诺今天也很开心！</b>再闯一关，就能继续长大"}</p></div>
      </section>
    </div>

    <div class="result-foot">
      ${pending && r.passed ? `<button class="btn" data-action="evolve">见证进化 ${I.arrow(18)}</button>` : `<button class="btn" data-action="start-quiz" data-level="${r.passed ? Math.min(themeProgress().level, r.level + 1) : r.level}">${r.passed ? "再闯一关" : "再试一次"} ${I.arrow(18)}</button>`}
      <button class="back" data-action="close-quiz">返回闯关地图</button>
    </div>
  </section>`;
}

function beginEvolution() {
  const from = stageMeta(state.stage);
  const to = stageForGrowth(state.growth);
  if (stageIndex(to.key) <= stageIndex(from.key)) {
    toast("成长值还不够，再去闯一关吧");
    go("home", { replace: true });
    return;
  }
  const wasInDex = state.dex.includes(to.key);
  const newDex = [...new Set([...state.dex, to.key])];
  state.stage = to.key;
  state.dex = newDex;
  let dexReward = null;
  if (state.dex.length >= 4 && !state.bgOwned.includes("sunset")) {
    state.bgOwned.push("sunset");
    dexReward = "落日山谷";
  }
  if (state.dex.length >= 6 && !state.bgOwned.includes("night")) {
    state.bgOwned.push("night");
    dexReward = "星空营地";
  }
  save();
  evolutionInfo = { from, to, isNew: !wasInDex, dexReward };
  sfx("evolve");
  go("evolution");
}

function screenEvolution() {
  if (!evolutionInfo) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const info = evolutionInfo;
  const dots = Array.from({ length: 34 }, (_, i) => {
    const x = (i * 43 + 7) % 100, y = (i * 31 + 11) % 100, s = 1.5 + (i % 4) * 0.8;
    return `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;opacity:${0.2 + (i % 5) * 0.12}"></i>`;
  }).join("");
  return `<section class="screen" data-screen="evolution" style="background:#0F2E24">
    <div class="evo-page">
      <div class="bg"></div><div class="stars">${dots}</div>
      <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
      <div class="evo-inner">
        <div class="evo-top">
          <div class="tag">${spark(11, "#FFD25A")} MILESTONE ${String(stageIndex(info.to.key)).padStart(2, "0")} / 05</div>
          <button class="close" data-action="home" aria-label="回到乐园">${I.close(16)}</button>
        </div>
        <div class="evo-title">
          <div class="en">EVOLUTION COMPLETE</div>
          <h1>进化<em>成功</em>！</h1>
          <div class="evo-stage">
            <span class="st">${info.from.name} · LV.${stageIndex(info.from.key) + 1}</span>
            <span class="arr">${I.arrow(15, "#F2C860")}</span>
            <span class="st new">${I.crownMini(13, "#FFD25A")} ${info.to.name} · LV.${stageIndex(info.to.key) + 1}</span>
          </div>
        </div>
        <div class="evo-dino">
          <div class="glow"></div><div class="halo"></div>
          <span class="spark" style="left:8%;top:18%">${spark(22, "#FFE08A")}</span>
          <span class="spark" style="right:9%;top:10%">${spark(15, "#FFE08A")}</span>
          <span class="spark" style="right:14%;bottom:12%">${spark(11, "#FFE08A")}</span>
          <span class="spark" style="left:13%;bottom:16%">${spark(9, "#FFE08A")}</span>
          ${dino(info.to.key)}
        </div>
        <div class="evo-unlock">
          <div class="u-head"><span class="lb">NEW UNLOCK · 成长奖励</span><span class="nv">${info.isNew ? "+1 图鉴收录" : "图鉴已收录"}</span></div>
          <div class="u-main">
            <div class="u-ico">${I.crownMini(30, "#8A5B15")}</div>
            <div class="u-txt">
              <b>${info.to.name}</b>
              <span>${info.to.key === "ultra" ? "已收录进图鉴，4 种机甲形态可以在图鉴里自由切换" : "已收录进图鉴，外形和能力都更强了"}</span>
            </div>
            <div style="color:#FFD25A">${I.chevron(12)}</div>
          </div>
          <div class="u-skill">${spark(12, "#FFD25A")} 解锁被动技能：闯关获得的星星 <b>+10%</b></div>
          ${info.dexReward ? `<div class="u-skill" style="border-top:0;padding-top:0.125rem">${I.gift(13)} 图鉴奖励：已解锁「${info.dexReward}」背景</div>` : ""}
          <button class="btn yellow" data-action="home">太棒了，继续冒险 ${I.arrow(18)}</button>
        </div>
      </div>
    </div>
  </section>`;
}
