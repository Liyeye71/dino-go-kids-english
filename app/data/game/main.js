/* ============================================================
   DinoGo · 恐龙英语 — 游戏流程
   包含公共答题流程
   ============================================================ */

const UNKNOWN_ART = (word) => emojiArt(wordGlyph(word));
let artMap = null;
/* 题型答对延时结算锁：防止特效播放期间重复点击/重复计分 */
let settleLock = false;
/* 新题语音/提示音延时句柄：选答案或切题时可精准取消，避免残留播报 */
let promptTimer = null;

function cancelTaskPrompt() {
  if (promptTimer) {
    clearTimeout(promptTimer);
    promptTimer = null;
  }
  if (typeof stopSpeak === "function") stopSpeak();
}

/* 当前主题（或场景）的「单词 → 插图」索引，避免每个选项都线性查找 */
function artOf(word) {
  const theme = currentTheme();
  const key = `${theme.id}:${state.scene || ""}`;
  if (!artMap || artMap.key !== key) {
    artMap = { key, map: new Map(themeWords().map((w) => [w.word, w.art])) };
  }
  return artMap.map.get(word) || (() => UNKNOWN_ART(word));
}

/* 每日挑战按题目来源取题型实现；复用 words.js 的 THEME_BY_ID，回退到只读公共实现 */
function gameForTask(q) {
  if (!q) return null;
  const source = THEME_BY_ID.get(q.themeId);
  const currentGames = currentTheme().games || {};
  return (source && source.games && source.games[q.type]) || currentGames[q.type] || DynamicEngine.getDefaultGame(q.type);
}

/* 统一读取题型的正确答案值与答后展示信息 */
function correctValueOf(q, game) {
  const g = game || gameForTask(q);
  if (g && typeof g.getCorrectValue === "function") return g.getCorrectValue(q);
  return q && q.answerValue != null ? q.answerValue : (q && q.word) || "";
}
function answerMetaOf(q, game) {
  const g = game || gameForTask(q);
  if (g && typeof g.getAnswerMeta === "function") return g.getAnswerMeta(q);
  return {
    word: q && q.options && q.word ? q.word : null,
    zh: (q && q.zh) || "",
    phon: (q && q.phon) || "",
    speakText: (q && q.word) || "",
    isSentence: false,
  };
}

/* 统一重置单题交互状态 */
function resetQuestionState(qState) {
  qState.selected = null;
  qState.revealed = false;
  qState.choiceCorrect = null;
  return qState;
}

/* 统一创建一局答题状态 */
function createQuiz(opts) {
  settleLock = false;
  return resetQuestionState({
    level: opts.level || 0,
    index: 0,
    correct: 0,
    startedAt: Date.now(),
    words: [],
    newWords: [],
    order: opts.order,
    ...(opts.mode ? { mode: opts.mode } : {}),
    ...(opts.starIndex ? { starIndex: opts.starIndex } : {}),
  });
}

function startQuiz(level, opts = {}) {
  const lvl = Math.min(levelsPerTheme(), Math.max(1, Number(level) || themeProgress().level));
  /* 关卡按顺序解锁：完成结算一次即可进入下一关，已通关关卡可复习 */
  const prog = themeProgress();
  const cleared = Boolean(prog.cleared && prog.cleared[lvl]);
  const replay = Boolean(opts.replay) || cleared || lvl < prog.level;
  if (lvl > prog.level) {
    toast("先完成前面的关卡吧");
    return;
  }
  cancelTaskPrompt();
  quiz = createQuiz({ level: lvl, order: DynamicEngine.buildTasks(lvl, { replay }) });
  lastResult = null;
  levelCue(currentTheme().id);
  go("quiz");
  /* 第 1 题已有开场旋律：听力题等旋律播完再读词，非听力题不叠播入场提示音 */
  speakTask(780, { playCue: false });
}

/* 每日随机挑战：全主题混抽 10 题，答对 1 题得 1★，完成结算才消耗次数 */
function startDailyQuiz() {
  if (dailyChallengeLeft() <= 0) {
    toast("今天的挑战已经完成啦，明天再来吧");
    return;
  }
  const order = DynamicEngine.buildDailyTasks(10);
  if (!order.length) {
    toast("词库还在准备中，稍后再试");
    return;
  }
  cancelTaskPrompt();
  quiz = createQuiz({ mode: "daily", level: 0, starIndex: [], order });
  lastResult = null;
  go("quiz");
  speakTask(260);
}

/* 答对：只撒彩纸，鼓励语与答案统一收进居中的结果卡 */
function correctFx() {
  return `<div class="qfx ok-fx" aria-hidden="true">
    <div class="fx-confetti">${renderConfetti(18, "quiz")}</div>
  </div>`;
}

/* 答完题后统一的手动“下一题”按钮 */
function quizNextButton() {
  if (!quiz) return "";
  const label = quiz.index >= quiz.order.length - 1 ? "See results" : "Next";
  return `<button class="btn" data-action="next">${label} ${I.arrow(18)}</button>`;
}

function screenQuiz() {
  if (!quiz) {
    setTimeout(() => go("home", { replace: true }), 0);
    return `<section class="screen"></section>`;
  }
  const total = quiz.order.length;
  const q = quiz.order[quiz.index];
  const game = gameForTask(q);
  const selected = quiz.selected;
  const revealed = quiz.revealed;
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
    let mark = "";
    if (revealed) {
      if (opt === q.word) mark = `<span class="mark">${I.check(11)}</span>`;
      else if (opt === selected) mark = `<span class="mark bad">${I.close(12, "#fff")}</span>`;
    } else if (opt === selected) {
      mark = `<span class="mark radio"><i></i></span>`;
    }
    return `<button class="${cls}" data-action="select" data-word="${opt}">
      <span class="word">${opt}</span>${mark}
    </button>`;
  }).join("");
  const view = game.render({ q, quiz, total, optionClass, choiceButton, options, letters, artOf });

  const meta = answerMetaOf(q, game);
  const answerWord = meta.word;
  const answerZh = meta.zh;
  const answerPhon = meta.phon;
  const dialogSentence = !!meta.isSentence;
  /* 答后结果卡：森林奶油风结构，从屏幕正中心弹出 */
  const ok = !!quiz.choiceCorrect;
  const statusTitle = ok ? "答对了，你真棒！" : "回答错误，继续努力";
  const nextLabel = quiz.index >= quiz.order.length - 1
    ? "查看结果" : "下一题";
  const audioIcon = `<svg viewBox="0 0 48 48" fill="none">
            <path d="M10 19 H18 L31 10 V38 L18 29 H10 C8.3 29 7 27.7 7 26 V22 C7 20.3 8.3 19 10 19 Z" fill="#d98a3c" stroke="#5c3412" stroke-width="3.5" stroke-linejoin="round"/>
            <ellipse cx="32" cy="24" rx="5.5" ry="13.5" fill="#fce4a6" stroke="#5c3412" stroke-width="3.5"/>
            <ellipse cx="32" cy="24" rx="2.5" ry="7" fill="#7a491d"/>
          </svg>`;
  const answerBox = answerWord
    ? `<div class="zoo-answer-box${dialogSentence ? " is-sentence" : ""}">
        <div class="zoo-answer-info">
          <div class="zoo-answer-top">
            <span class="zoo-answer-word">${answerWord}</span>
            ${answerPhon ? `<span class="zoo-answer-phon">${answerPhon}</span>` : ""}
          </div>
          ${answerZh ? `<span class="zoo-meaning-text">中文：${answerZh}</span>` : ""}
        </div>
        <button class="zoo-audio-btn" type="button" data-action="speak-answer" aria-label="播放读音">
          ${audioIcon}
        </button>
      </div>`
    : "";

  const actionArea = `<button class="zoo-action-btn" data-action="next"><span>${nextLabel} ▶</span></button>`;
  const decor = ok
    ? `<svg class="zoo-decor-grass" viewBox="0 0 80 26" fill="none">
        <path d="M4 24 L14 6 L22 20 L34 2 L44 21 L56 7 L66 24 Z" fill="#63b848" stroke="#1e6b3b" stroke-width="3" stroke-linejoin="round"/>
      </svg>`
    : `<svg class="zoo-decor-leaf" viewBox="0 0 110 50" fill="none">
        <path d="M8 14 Q55 24 98 12" stroke="#9e4332" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M36 16 C30 2, 54 2, 52 17 Z" fill="#f7a052" stroke="#8f2d1f" stroke-width="2.5"/>
        <path d="M68 18 C72 34, 92 30, 86 15 Z" fill="#f27d52" stroke="#8f2d1f" stroke-width="2.5"/>
      </svg>`;
  const resultPop = revealed ? `<div class="zoo-feedback-card ${ok ? "is-correct" : "is-wrong"}" role="status" aria-live="polite">
      ${decor}
      <div class="zoo-feedback-header">
        <span class="zoo-status-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">${ok
            ? `<path d="M6.5 16.5 L13 23 L25.5 9.5" stroke="#ffffff" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>`
            : `<path d="M9.5 9.5 L22.5 22.5 M22.5 9.5 L9.5 22.5" stroke="#ffffff" stroke-width="4.8" stroke-linecap="round"/>`}</svg>
        </span>
        <h2 class="zoo-feedback-title">${statusTitle}</h2>
      </div>
      <div class="zoo-feedback-body">
        ${answerBox}
        ${actionArea}
      </div>
    </div>` : "";
  const fx = revealed && ok ? correctFx() : "";
  const isDaily = quiz.mode === "daily";
  const refHead = `<div class="ref-stage-head">
      <span class="ref-stage-badge">${game.badgeIcon === "speaker" ? I.speaker(24, "#5C411D") : I.leaf(24, "#5C411D")}</span>
      <div><span class="ref-stage-kicker">${isDaily ? "每日随机挑战 · " : isStageBossLevel(quiz.level) ? "BOSS · " : ""}${isDaily ? "" : `LEVEL ${String(quiz.level).padStart(2, "0")} · `}${game.label}</span>
      <h2>${game.title}</h2></div>
    </div>`;
  const frameTop = `<div class="quiz-top">
      <button class="circle-btn" data-action="close-quiz" aria-label="退出闯关">${I.close(16)}</button>
      <div class="quiz-title">${refHead}</div>
      <div class="qcount num">${quiz.index + 1} <em>/ ${total}</em></div>
      ${isDaily ? `<div class="daily-run">🎲</div>` : ""}
    </div>`;
  return `<section class="screen quiz-page ${game.pageClass || ""} quiz-ref-page dino-stage-v2" data-screen="quiz" data-enlighten="${enlightenOn() ? "1" : "0"}" data-theme="${state.theme}" data-scene="${state.scene || ""}" data-type="${q.type}" data-revealed="${revealed ? "1" : "0"}">
    ${fx}
    <div class="ref-scene-bg">${QuizUiArt.scene()}</div>
    ${frameTop}
    <div class="quiz-body ref-quiz-body">
      ${view.body}
    </div>
    ${resultPop}
    <div class="quiz-foot">${revealed ? "" : view.btn}</div>
  </section>`;
}

/* 进题提醒：仅听力题（autoSpeak）自动读单词；其余题型改用轻提示音效 + 视觉引导，点喇叭仍可手动听题 */
function speakTask(delay = 260, opts = {}) {
  cancelTaskPrompt();
  const q = quiz && quiz.order[quiz.index];
  if (!q) return;
  const game = gameForTask(q);
  if (game && game.autoSpeak) {
    const lines = typeof game.getPromptLines === "function" ? game.getPromptLines(q) : [];
    if (lines.length) {
      promptTimer = setTimeout(() => {
        promptTimer = null;
        if (!quiz || quiz.revealed || quiz.order[quiz.index] !== q) return;
        speak(lines);
      }, delay);
    }
    return;
  }
  const playCue = opts.playCue !== false;
  if (playCue && !(game && game.hasOwnCue)) {
    promptTimer = setTimeout(() => {
      promptTimer = null;
      if (!quiz || quiz.revealed || quiz.order[quiz.index] !== q) return;
      sfx("question");
    }, 80);
  }
}
/* 通用结算分流：支持题型按答对 / 答错分别声明延时特效，再进入统一结算 */
function beginSettlement(q, ok, el, commit) {
  const run = typeof commit === "function" ? commit : checkAnswer;
  const game = gameForTask(q);
  /* settleDelay / wrongSettleDelay 支持数字（固定）或函数（按题目动态估算） */
  const rawDelay = game
    ? (ok ? game.settleDelay : game.wrongSettleDelay)
    : 0;
  const delay = (typeof rawDelay === "function" ? rawDelay(q) : rawDelay) || 0;
  if (delay > 0) {
    settleLock = true;
    const fxFn = ok ? game.onCorrectFx : game.onWrongFx;
    if (typeof fxFn === "function") fxFn({ q, el, word: quiz && quiz.selected });
    setTimer(() => {
      settleLock = false;
      /* 延时期间可能已退出答题页，避免在空页面上结算 */
      if (!document.querySelector(".quiz-page")) return;
      run();
    }, delay);
    return;
  }
  run();
}
function selectOption(word, el) {
  if (!quiz || quiz.revealed || settleLock) return;
  cancelTaskPrompt();
  const q = quiz.order[quiz.index];
  const correctValue = correctValueOf(q);
  quiz.selected = word;
  sfx("tap");
  beginSettlement(q, word === correctValue, el);
}
/* 听发音按钮：纯喇叭图标 + 圆形底色 */
function listenPill() {
  return `<button class="listen" data-action="listen-selected" aria-label="听发音">${I.speaker(16)}</button>`;
}
/* 听发音：答题前重播当前题干问句，答题后朗读正确答案 */
function listenSelected() {
  if (!quiz) return;
  const q = quiz.order[quiz.index];
  if (!q) return;
  if (quiz.revealed) {
    const meta = answerMetaOf(q);
    if (meta.speakText) speak(meta.speakText);
    return;
  }
  if (quiz.selected) {
    speak(quiz.selected);
    return;
  }
  const game = gameForTask(q);
  const lines = game && typeof game.getPromptLines === "function" ? game.getPromptLines(q) : [];
  if (lines.length) speak(lines);
}

/* 动物喂食点选 / 拖拽入口：复用统一选项提交流程，透传触发元素供特效使用 */
function feedPick(food, el = null) {
  selectOption(food, el);
}
/* 答对后解锁当前单词：写入存档并加入本次新解锁列表，词汇页立即可见 */
function unlockTaskWord(q) {
  if (!q || !q.word || typeof unlockWord !== "function") return;
  if (unlockWord(q.word) && quiz && Array.isArray(quiz.newWords)) quiz.newWords.push(q.word);
}
/* 每日挑战计星：一题一星，答对即得星；答错直接公布答案，不重来 */
function markDailyStar() {
  if (!quiz || quiz.mode !== "daily") return;
  quiz.starIndex = quiz.starIndex || [];
  if (!quiz.starIndex.includes(quiz.index)) quiz.starIndex.push(quiz.index);
}
/* 统一单题结算副作用：供选择题与喂食题共用 */
function finalizeTask(q, ok, opts = {}) {
  const {
    okSfx = "excellent",
    wrongSfx = "wrong",
    speakOnOk = "",
    speakOnWrong,
    words = null,
    wrongBank = true,
  } = opts;
  quiz.revealed = true;
  quiz.choiceCorrect = ok;
  const isDaily = quiz.mode === "daily";
  if (ok) {
    quiz.correct++;
    markDailyStar();
    const list = Array.isArray(words) ? words : (q && q.word ? [q.word] : []);
    list.forEach((w) => {
      quiz.words.push(w);
      if (!isDaily) unlockTaskWord({ word: w });
    });
    if (okSfx) sfx(okSfx);
    if (speakOnOk) {
      setTimer(() => {
        if (typeof shakeBtn === "function") shakeBtn(document.querySelector(".zoo-audio-btn"));
        speak(speakOnOk);
      }, 600);
    }
    if (!isDaily && wrongBank) WrongBank.applyResult(q, true);
  } else {
    if (wrongSfx) sfx(wrongSfx);
    /* 答错弹出结果卡后自动朗读正确读音，帮助孩子纠音记忆 */
    const wrongSpeak = speakOnWrong !== undefined ? speakOnWrong : answerMetaOf(q).speakText;
    if (wrongSpeak) {
      setTimer(() => {
        if (typeof shakeBtn === "function") shakeBtn(document.querySelector(".zoo-audio-btn"));
        speak(wrongSpeak);
      }, 520);
    }
    if (!isDaily && wrongBank) WrongBank.applyResult(q, false);
  }
  render();
}

function checkAnswer() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  const q = quiz.order[quiz.index];
  const game = gameForTask(q);
  const ok = quiz.selected === correctValueOf(q, game);
  const fb = game && typeof game.getFeedbackOpts === "function"
    ? game.getFeedbackOpts(q)
    : { okSfx: "excellent", wrongSfx: "wrong", speakOnOk: "" };
  finalizeTask(q, ok, fb);
}
function nextQuestion() {
  if (!quiz) return;
  cancelTaskPrompt();
  settleLock = false;
  clearTimers();
  if (quiz.index >= quiz.order.length - 1) { finishQuiz(); return; }
  quiz.index++;
  resetQuestionState(quiz);
  render();
  speakTask();
}
