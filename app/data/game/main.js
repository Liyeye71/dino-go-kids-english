/* ============================================================
   DinoGo · 恐龙英语 — 游戏流程
   包含公共答题流程
   ============================================================ */

const UNKNOWN_ART = (word) => emojiArt(wordGlyph(word));
let artMap = null;
let themeSetCache = { len: -1, map: new Map() };

/* 当前主题（或场景）的「单词 → 插图」索引，避免每个选项都线性查找 */
function artOf(word) {
  const theme = currentTheme();
  const key = `${theme.id}:${state.scene || ""}`;
  if (!artMap || artMap.key !== key) {
    artMap = { key, map: new Map(themeWords().map((w) => [w.word, w.art])) };
  }
  return artMap.map.get(word) || (() => UNKNOWN_ART(word));
}

/* 每日挑战按题目来源取题型实现；按 id 建索引缓存，回退到只读公共实现 */
function gameForTask(q) {
  if (!q) return null;
  const sets = window.DINO_WORD_SETS || [];
  if (themeSetCache.len !== sets.length) {
    themeSetCache = { len: sets.length, map: new Map(sets.map((t) => [t.id, t])) };
  }
  const source = themeSetCache.map.get(q.themeId);
  const currentGames = currentTheme().games || {};
  return (source && source.games && source.games[q.type]) || currentGames[q.type] || DynamicEngine.getDefaultGame(q.type);
}

/* 统一重置单题交互状态 */
function resetQuestionState(qState) {
  qState.selected = null;
  qState.revealed = false;
  qState.choiceCorrect = null;
  qState.matched = [];
  qState.wrongPairs = [];
  qState.pickWord = null;
  qState.pickWordSide = null;
  qState.matchWrong = 0;
  qState.hatchHits = 0;
  return qState;
}

/* 统一创建一局答题状态 */
function createQuiz(opts) {
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
  quiz = createQuiz({ level: lvl, order: DynamicEngine.buildTasks(lvl, { replay }) });
  lastResult = null;
  levelCue(currentTheme().id);
  go("quiz");
  speakTask();
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
  quiz = createQuiz({ mode: "daily", level: 0, starIndex: [], order });
  lastResult = null;
  go("quiz");
  speakTask();
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

  const isMatch = q.type === "match";
  const isFeed = q.type === "feed_animal";
  const isDialog = q.type === "dialog";
  /* 情景对话整句选项展示正确句子，其余对话题展示目标单词 */
  const dialogSentence = isDialog && q.dialog && q.dialog.mode === "sentence";
  /* 纯单词选项题给出正确单词；词汇拼图也给出正确单词；动物喂食给出正确食物；连线题只说继续努力 */
  const answerWord = dialogSentence ? q.answerText
    : isMatch ? null
      : (isFeed ? q.correctFood
        : (isDialog && q.dialog ? q.dialog.answerValue
          : ((q.options || q.type === "word_puzzle") && q.word ? q.word : null)));
  const answerZh = isFeed ? q.correctZh : (dialogSentence ? (q.answerZh || "") : q.zh);
  const answerPhon = isFeed
    ? (q.correctPhon || "")
    : (answerWord && answerWord === q.word ? (q.phon || "") : "");
  /* 答后结果卡：参考 temp/correnct.html、woring.html 的森林奶油风结构，从屏幕正中心弹出 */
  const ok = !!quiz.choiceCorrect;
  const statusTitle = ok
    ? (isMatch ? `${q.pairs && q.pairs.length === 2 ? "两" : "三"}组全连对啦！` : "答对了，你真棒！")
    : (isMatch ? "有连错的，看看正确答案" : "回答错误，继续努力");
  const nextLabel = quiz.index >= quiz.order.length - 1
    ? "Result" : "Next";
  const audioIcon = `<svg viewBox="0 0 48 48" fill="none">
            <path d="M10 19 H18 L31 10 V38 L18 29 H10 C8.3 29 7 27.7 7 26 V22 C7 20.3 8.3 19 10 19 Z" fill="#d98a3c" stroke="#5c3412" stroke-width="3.5" stroke-linejoin="round"/>
            <ellipse cx="32" cy="24" rx="5.5" ry="13.5" fill="#fce4a6" stroke="#5c3412" stroke-width="3.5"/>
            <ellipse cx="32" cy="24" rx="2.5" ry="7" fill="#7a491d"/>
          </svg>`;
  /* 连线题答后展示完整配对表：图片 + 单词 + 喇叭 + 音标 + 中文，最右为对错标记 */
  const wrongByArt = new Map((quiz.wrongPairs || []).map((p) => [p.art, p.word]));
  const matchAnswerBox = isMatch && revealed
    ? `<div class="zoo-match-list">
        ${q.pairs.map((p) => {
          const picked = wrongByArt.get(p.word);
          const thumb = wordArtImg(p.img, "zoo-match-thumb-img", p.art(), "zoo-match-thumb-emoji", "lazy");
          return `<div class="zoo-match-row${picked ? " is-wrong" : ""}">
            <span class="zoo-match-thumb">${thumb}</span>
            <span class="zoo-match-main">
              <span class="zoo-match-word">${p.word}</span>
              <button class="zoo-audio-btn" type="button" data-action="speak-word" data-word="${p.word}" aria-label="播放 ${p.word} 读音">${audioIcon}</button>
              ${p.phon ? `<span class="zoo-match-phon">${p.phon}，</span>` : ""}
              ${p.zh ? `<span class="zoo-match-zh">${p.zh}</span>` : ""}
              ${picked ? `<span class="zoo-match-picked">你连成了 <b>${picked}</b></span>` : ""}
            </span>
            <span class="zoo-match-flag">${picked ? "✕" : "✓"}</span>
          </div>`;
        }).join("")}
      </div>`
    : "";
  const answerHasMeta = !!(answerPhon || answerZh);
  const answerBox = answerWord
    ? `<div class="zoo-answer-box${dialogSentence ? " is-sentence" : ""}">
        <span class="zoo-answer-label">正确答案：</span>
        <span class="zoo-answer-word">${answerWord}</span>
        <button class="zoo-audio-btn" type="button" data-action="speak-answer" aria-label="播放读音">
          ${audioIcon}
        </button>
        ${answerHasMeta ? `<span class="zoo-answer-meta">
          ${answerPhon ? `<span class="zoo-answer-phon">${answerPhon}，</span>` : ""}
          ${answerZh ? `<span class="zoo-meaning-text">${answerZh}</span>` : ""}
        </span>` : ""}
      </div>`
    : matchAnswerBox;

  const star = (cls) => `<svg class="zoo-btn-star ${cls}" viewBox="0 0 24 24"><polygon points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9" fill="#ffe066" stroke="#8a5a00" stroke-width="1.5"/></svg>`;
  const actionArea = `<button class="zoo-action-btn" data-action="next">
        ${ok ? star("star-top") : ""}<span>${nextLabel}</span>${ok ? star("star-bottom") : ""}
      </button>`;
  const decor = ok
    ? `<svg class="zoo-decor-grass" viewBox="0 0 80 26" fill="none">
        <path d="M4 24 L14 6 L22 20 L34 2 L44 21 L56 7 L66 24 Z" fill="#63b848" stroke="#1e6b3b" stroke-width="3" stroke-linejoin="round"/>
      </svg>
      <svg class="zoo-decor-vine" viewBox="0 0 160 130" fill="none">
        <path d="M10 12 Q70 25 135 18 Q145 65 138 115" stroke="#2d7a36" stroke-width="6" stroke-linecap="round"/>
        <path d="M55 16 C45 2, 72 0, 74 16 Z" fill="#68be47" stroke="#1e6b3b" stroke-width="2.5"/>
        <path d="M105 22 C110 38, 130 34, 124 18 Z" fill="#54a838" stroke="#1e6b3b" stroke-width="2.5"/>
        <path d="M138 58 C154 52, 156 74, 138 74 Z" fill="#68be47" stroke="#1e6b3b" stroke-width="2.5"/>
        <g transform="translate(126, 22)">
          <circle cx="0" cy="-7" r="5.5" fill="#f79c65" stroke="#5c2d0c" stroke-width="2"/>
          <circle cx="7" cy="-2" r="5.5" fill="#f79c65" stroke="#5c2d0c" stroke-width="2"/>
          <circle cx="4" cy="6" r="5.5" fill="#f79c65" stroke="#5c2d0c" stroke-width="2"/>
          <circle cx="-4" cy="6" r="5.5" fill="#f79c65" stroke="#5c2d0c" stroke-width="2"/>
          <circle cx="-7" cy="-2" r="5.5" fill="#f79c65" stroke="#5c2d0c" stroke-width="2"/>
          <circle cx="0" cy="0" r="4" fill="#ffe066"/>
        </g>
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
      <div class="zoo-feedback-body${isMatch ? " is-match" : ""}">
        ${answerBox}
        ${actionArea}
      </div>
    </div>` : "";
  const fx = revealed && ok ? correctFx() : "";
  const isDaily = quiz.mode === "daily";
  const refHead = `<div class="ref-stage-head">
      <span class="ref-stage-badge">${q.type === "listen" ? I.speaker(24, "#5C411D") : I.leaf(24, "#5C411D")}</span>
      <div><span class="ref-stage-kicker">${isDaily ? "每日随机挑战 · " : isAnimalBossLevel(quiz.level) ? "BOSS · " : ""}${isDaily ? "" : `LEVEL ${String(quiz.level).padStart(2, "0")} · `}${game.label}</span>
      <h2>${game.title}</h2></div>
    </div>`;
  const frameTop = `<div class="quiz-top">
      <button class="circle-btn" data-action="close-quiz" aria-label="退出闯关">${I.close(16)}</button>
      <div class="quiz-title">${refHead}</div>
      <div class="qcount num">${quiz.index + 1} <em>/ ${total}</em></div>
      ${isDaily ? `<div class="daily-run">🎲</div>` : ""}
    </div>`;
  return `<section class="screen quiz-page ${game.pageClass || ""} quiz-ref-page dino-stage-v2" data-screen="quiz" data-enlighten="${enlightenOn() ? "1" : "0"}" data-theme="${state.theme}" data-scene="${state.scene || ""}" data-type="${q.type}">
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

function speakTask() {
  const q = quiz && quiz.order[quiz.index];
  if (!q) return;
  const game = gameForTask(q);
  const lines = [];
  if (q.type === "dialog") {
    /* 情景对话：直接朗读 A 的提问句 */
    const d = q.dialog;
    const ask = d && d.ask ? d.ask : (q.dlgQ || "").replace("{word}", q.word);
    const text = String(ask || "").replace(/<[^>]*>/g, "").trim();
    if (text) lines.push(text);
  } else if (game && game.prompt) {
    const t = typeof currentTheme === "function" ? currentTheme() : null;
    /* 每日混抽：看图朗读提示跟随词条来源主题 */
    const picPrompt = (q.type === "pic" && q.picPrompt) || (q.type === "pic" && t && t.picPrompt) || "";
    lines.push(picPrompt || game.prompt);
  }
  /* 听音戳泡泡：先读题型说明，再读要听的目标单词 */
  if (q.type === "voice_compare") {
    lines.push(`Touch the ${q.word} one!`);
  } else if (game && game.autoSpeak && q.word) lines.push(q.word);
  if (lines.length) setTimer(() => speak(lines), 450);
}
function selectOption(word) {
  if (!quiz || quiz.revealed) return;
  quiz.selected = word;
  sfx("tap");
  checkAnswer();
}
/* 听发音按钮：纯喇叭图标 + 圆形底色 */
function listenPill() {
  return `<button class="listen" data-action="listen-selected" aria-label="听发音">${I.speaker(16)}</button>`;
}
/* 听发音：需先点击选项，答题后朗读正确答案 */
function listenSelected() {
  if (!quiz) return;
  const q = quiz.order[quiz.index];
  const word = quiz.revealed ? q.word : quiz.selected || quiz.pickWord;
  if (!word) return;
  speak(word);
}
function matchSelect(side, word) {
  const q = quiz && quiz.order[quiz.index];
  const game = q && gameForTask(q);
  if (game && game.onSelect) game.onSelect(side, word);
}

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
function feedPick(food) {
  if (!quiz || quiz.revealed) return;
  quiz.selected = food;
  sfx("tap");
  /* 点选食物后立即判题，不再需要底部确认按钮 */
  feedCheck();
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
/* 统一单题结算副作用：供选择题、喂食题与连线题共用 */
function finalizeTask(q, ok, opts = {}) {
  const {
    okSfx = "excellent",
    wrongSfx = "wrong",
    speakOnOk = "",
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
    if (speakOnOk) setTimer(() => speak(speakOnOk), 600);
    if (!isDaily && wrongBank) WrongBank.applyResult(q, true);
  } else {
    if (wrongSfx) sfx(wrongSfx);
    if (!isDaily && wrongBank) WrongBank.applyResult(q, false);
  }
  render();
}

function feedCheck() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  const q = quiz.order[quiz.index];
  finalizeTask(q, quiz.selected === q.correctFood, { speakOnOk: q.correctFood });
}

/* 纯单词选项题型：答对后弹框自动朗读该单词，并播放专属结果音效 */
const WORD_OPTION_TYPES = ["pic", "action"];
function isWordOptionTask(q) {
  if (!q) return false;
  /* 情景对话只有「单词选项」模式算纯单词题，整句 / 图片选项不算 */
  if (q.type === "dialog") return !q.dialog || (q.dialog.mode !== "sentence" && q.dialog.mode !== "image");
  return WORD_OPTION_TYPES.includes(q.type);
}
function checkAnswer() {
  if (!quiz || quiz.revealed || !quiz.selected) return;
  stopActionSound();
  const q = quiz.order[quiz.index];
  /* 情景对话整句/图片选项使用 answerValue 判题，其余题型仍按单词判定 */
  const correctValue = q.answerValue != null ? q.answerValue : q.word;
  const ok = quiz.selected === correctValue;
  const wordOption = isWordOptionTask(q);
  finalizeTask(q, ok, {
    okSfx: wordOption ? "answer-right" : "excellent",
    wrongSfx: wordOption ? "answer-wrong" : "wrong",
    speakOnOk: wordOption ? (q.answerValue || q.word) : "",
  });
}
function nextQuestion() {
  if (!quiz) return;
  clearTimers();
  if (quiz.index >= quiz.order.length - 1) { finishQuiz(); return; }
  quiz.index++;
  resetQuestionState(quiz);
  render();
  speakTask();
}
