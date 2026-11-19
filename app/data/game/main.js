/* ============================================================
   DinoGo · 恐龙英语 — 游戏流程
   包含公共答题流程
   ============================================================ */

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

function startQuiz(level) {
  const lvl = Math.min(levelsPerTheme(), Math.max(1, Number(level) || themeProgress().level));
  /* 阶段门槛：每阶段第 5 关需前 4 关累计 8 星 */
  if (window.canEnterLevel && !canEnterLevel(lvl)) {
    toast(`还差 ${STAGE_GATE_STARS - stageStarsBefore(lvl)} 颗星才能进入第 ${lvl} 关`);
    return;
  }
  quiz = {
    level: lvl,
    index: 0,
    correct: 0,
    hearts: 3,
    selected: null,
    bonus: null,
    revealed: false,
    choiceCorrect: null,
    matched: [],
    pickWord: null,
    pickWordSide: null,
    matchWrong: 0,
    startedAt: Date.now(),
    words: [],
    order: DynamicEngine.buildTasks(lvl),
  };
  lastResult = null;
  levelCue(currentTheme().id);
  go("quiz");
  speakTask();
}

const FX_COLORS = ["#FFC94A", "#FF8A4C", "#5BC178", "#5FBCDA", "#FF6F61", "#B8E05A"];
/* 答对：全屏庆祝特效只给鼓励语，答案信息统一放在最下方提示栏 */
function correctFx() {
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
      <b>你真棒，答对了</b>
    </div>
  </div>`;
}
/* 答错：全屏提示只给鼓励语，答案信息统一放在最下方提示栏 */
function wrongFx() {
  return `<div class="qfx bad-fx" aria-hidden="true">
    <div class="fx-wrong">
      <span class="fx-wrong-ic">✕</span>
      <div class="fx-wrong-txt">
        <b>答错了</b>
        <span>继续努力哦</span>
      </div>
    </div>
  </div>`;
}

/* 答完题后统一的手动“下一题”按钮 */
function quizNextButton() {
  if (!quiz) return "";
  /* BOSS 关 5 题打完：可选是否挑战隐藏第 6 题 */
  if (quiz.bonus && quiz.bonus.state === "ask") {
    return `<div class="bonus-choose">
      <button class="btn ghost" data-action="bonus-skip">直接结算</button>
      <button class="btn" data-action="bonus-start">挑战隐藏题 🎁</button>
    </div>`;
  }
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
  /* 进度条按「已答完的题数」计算，答完最后一题正好 100% */
  const progress = Math.round(((quiz.index + (revealed ? 1 : 0)) / total) * 100);
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
  const refType = ["pic", "listen", "match", "dialog", "word_puzzle", "feed_animal", "action", "body_zoom", "compare"].includes(q.type);
  const isMatch = q.type === "match";
  const isFeed = q.type === "feed_animal";
  /* 纯单词选项题给出正确单词；词汇拼图也给出正确单词；动物喂食给出正确食物；连线题只说继续努力 */
  const answerWord = isMatch ? null
    : (isFeed ? q.correctFood
      : ((q.options || q.type === "word_puzzle") && q.word ? q.word : null));
  const answerZh = isFeed ? q.correctZh : q.zh;
  let hint;
  if (revealed) {
    if (q.isBonus) {
      hint = quiz.choiceCorrect ? "隐藏挑战成功 · 获得 1 个宝箱 🎁" : "隐藏挑战失败 · 下次再来！";
    } else if (isMatch) {
      hint = quiz.choiceCorrect ? "你真棒，答对了" : "答错了，继续努力哦";
    } else if (answerWord) {
      hint = `正确答案是 <b>${answerWord}</b>${answerZh ? `<i class="ans-zh">${answerZh}</i>` : ""}`;
    } else {
      hint = quiz.choiceCorrect ? "你真棒，答对了" : "答错了，继续努力哦";
    }
  } else {
    hint = "选出正确答案，继续前进！";
  }
  const fx = revealed ? (quiz.choiceCorrect ? correctFx() : wrongFx()) : "";
  const refHead = refType ? `<div class="ref-stage-head">
      <span class="ref-stage-badge">${q.type === "listen" ? I.speaker(24, "#5C411D") : I.leaf(24, "#5C411D")}</span>
      <div><span class="ref-stage-kicker">${isAnimalBossLevel(quiz.level) ? "BOSS · " : ""}LEVEL ${String(quiz.level).padStart(2, "0")} · ${game.label}</span>
      <h2>${game.title}</h2></div>
    </div>` : "";
  const frameTop = refType && state.scene === "zoo"
    ? `<div class="quiz-top quiz-top--frame">
      <button class="frame-btn" data-action="close-quiz" aria-label="返回闯关"><img src="data/icons/btn-home.webp" alt=""></button>
      <button class="frame-btn" data-action="close-quiz" aria-label="关闭并返回路线图"><img src="data/icons/btn-paw.webp" alt=""></button>
    </div>`
    : `<div class="quiz-top">
      <button class="circle-btn" data-action="close-quiz" aria-label="退出闯关">${I.close(16)}</button>
      <div class="bar qbar"><i style="width:${progress}%"></i></div>
      <div class="qcount num">${quiz.index + 1} <em>/ ${total}</em></div>
      <div class="hearts">${hearts}</div>
    </div>`;
  return `<section class="screen quiz-page ${game.pageClass || ""}${refType ? " quiz-ref-page" : ""}" data-screen="quiz" data-theme="${state.theme}" data-scene="${state.scene || ""}" data-type="${q.type}">
    ${fx}
    ${refType ? `<div class="ref-scene-bg">${QuizUiArt.scene()}</div>` : ""}
    ${frameTop}
    <div class="quiz-body${refType ? " ref-quiz-body" : ""}">
      ${refType ? refHead : `<div class="quiz-prompt">
        <div class="chip ${isAnimalBossLevel(quiz.level) ? "boss-chip" : ""}">${isAnimalBossLevel(quiz.level) ? "🔥 BOSS · " : ""}LEVEL ${String(quiz.level).padStart(2, "0")} · ${game.label}</div>
        <h2>${game.title}</h2>
      </div>`}
      ${view.body}
    </div>
    <div class="quiz-foot">
      <div class="combo${revealed ? (quiz.choiceCorrect ? " good" : " bad") : ""}">${revealed ? (quiz.choiceCorrect ? star(15) : I.info(15)) : I.info(15)} ${hint}</div>
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

/* 拼图和喂食的共享动作：点击与拖拽走同一条状态、计分路径 */
function puzzlePlace(letterId, slotId = null) {
  if (!quiz || quiz.revealed) return;
  const q = quiz.order[quiz.index];
  const slot = slotId === null
    ? q.puzzleSlots.find((s) => s.filled === null)
    : q.puzzleSlots.find((s) => s.id === Number(slotId));
  const letter = q.puzzleLetters.find((l) => l.id === letterId);
  if (!slot || slot.filled !== null || !letter || q.puzzleSlots.some((s) => s.filled === letterId)) return;
  slot.filled = letterId;
  sfx("tap");
  render();
}
function feedPick(food, shouldRender = true) {
  if (!quiz || quiz.revealed) return;
  quiz.selected = food;
  sfx("tap");
  if (shouldRender) render();
}
function feedCheck() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  const q = quiz.order[quiz.index];
  const ok = quiz.selected === q.correctFood;
  quiz.revealed = true; quiz.choiceCorrect = ok;
  if (ok) {
    quiz.correct++; quiz.words.push(q.word); sfx("correct");
    WrongBank.applyResult(q, true);
  } else {
    quiz.hearts = Math.max(0, quiz.hearts - 1); sfx("wrong");
    WrongBank.applyResult(q, false);
  }
  render();
}

function checkAnswer() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  const q = quiz.order[quiz.index];
  const ok = quiz.selected === q.word;
  quiz.revealed = true;
  quiz.choiceCorrect = ok;
  /* BOSS 关隐藏题：不计入星级、不扣生命，答对奖励一个宝箱 */
  if (q.isBonus) {
    quiz.bonus = { state: "playing", correct: ok };
    WrongBank.applyResult(q, ok);
    if (ok) {
      if (window.ChestManager) ChestManager.grantBonus();
      sfx("correct");
    } else {
      sfx("wrong");
    }
    render();
    return;
  }
  if (ok) {
    quiz.correct++;
    quiz.words.push(q.word);
    sfx("correct");
    /* 🦁 动物园场景：答对 → 尝试清除错题库 */
    WrongBank.applyResult(q, true);
  } else {
    quiz.hearts = Math.max(0, quiz.hearts - 1);
    sfx("wrong");
    /* 🦁 动物园场景：答错 → 自动收录错题库 */
    WrongBank.applyResult(q, false);
  }
  render();
}
function nextQuestion() {
  if (!quiz) return;
  clearTimers();
  const atEnd = quiz.index >= quiz.order.length - 1;
  /* BOSS 关 5 题打完且生命未耗尽：先让玩家选择是否挑战隐藏题 */
  if (atEnd && isAnimalBossLevel(quiz.level) && !quiz.bonus && quiz.hearts > 0) {
    quiz.bonus = { state: "ask", correct: null };
    render();
    return;
  }
  if (atEnd || quiz.hearts <= 0) { finishQuiz(); return; }
  quiz.index++;
  quiz.selected = null;
  quiz.revealed = false;
  quiz.choiceCorrect = null;
  quiz.matched = [];
  quiz.pickWord = null;
  quiz.pickWordSide = null;
  quiz.matchWrong = 0;
  render();
  speakTask();
}

/* BOSS 关第 6 题：挑战隐藏题（答对奖励宝箱，不计星级） */
function bonusStart() {
  if (!quiz || !quiz.bonus || quiz.bonus.state !== "ask") return;
  const task = window.DynamicEngine ? DynamicEngine.buildBonusTask() : null;
  if (!task) { bonusSkip(); return; }
  quiz.order.push(task);
  quiz.bonus.state = "playing";
  quiz.index++;
  quiz.selected = null;
  quiz.revealed = false;
  quiz.choiceCorrect = null;
  quiz.matched = [];
  quiz.pickWord = null;
  quiz.pickWordSide = null;
  quiz.matchWrong = 0;
  sfx("tap");
  render();
  speakTask();
}

/* 跳过隐藏题，直接结算 */
function bonusSkip() {
  if (!quiz) return;
  if (quiz.bonus) quiz.bonus.state = "skipped";
  finishQuiz();
}

/* 打开隐藏挑战奖励的宝箱（额外奖励后续迭代，先走现有恐龙奖励） */
function openBonusChest() {
  if (window.ChestManager) {
    const dino = ChestManager.openOne();
    if (dino) {
      toast(`宝箱开出 ${dino.zh || "新恐龙"}！额外奖励即将上线`);
      render();
      return;
    }
  }
  toast("宝箱已经打开啦");
}
