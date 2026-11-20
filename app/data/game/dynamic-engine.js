/* ============================================================
   DynamicEngine · 动物乐园题库引擎 + 全主题题型实现
   - 本文件是题型的唯一实现来源：新增 / 调整题型只改这里
   - 词库四类：核心动物名词 30 / 动作动词 30 / 身体部位 20 / 特征形容词 20
   - 普通关固定 3 题：1 名词 + 1 动词 + 1 部位/形容词
   - BOSS 关固定 5 题：3 名词 + 1 动词 + 1 部位/形容词
   - 每题独立携带 category + assetKey，题型与素材解耦
   - 错题库加权保留：答错过的词优先复现
   ============================================================ */
(function () {
  "use strict";

  /* 普通关 3 题；BOSS 关 5 题 */
  const QUIZ_SIZE = 3;
  const BOSS_QUIZ_SIZE = 5;
  window.QUIZ_SIZE = QUIZ_SIZE;
  window.BOSS_QUIZ_SIZE = BOSS_QUIZ_SIZE;

  /* 四维词库标签 */
  const CATEGORIES = ["noun", "verb", "part", "adj"];

  /* 普通关固定配比：1 名词 + 1 动词 + 1 部位/形容词
     保证每关既有基础认知题，又有互动进阶题 */
  const NORMAL_MIX = [
    { role: "noun",      count: 1 },
    { role: "verb",      count: 1 },
    { role: "partOrAdj", count: 1 },
  ];

  /* BOSS 关固定配比：3 名词 + 1 动词 + 1 部位/形容词 */
  const BOSS_MIX = [
    { role: "noun",      count: 3 },
    { role: "verb",      count: 1 },
    { role: "partOrAdj", count: 1 },
  ];


  /* 题型规则
     basic    = 保底基础认知题（看图 / 听音 / 拼词）
     advanced = 互动进阶题（动作 / 局部特写 / 对比观察） */
  const GAME_RULES = [
    { key: "pic",         label: "看图选词", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "listen",      label: "听音识图", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "word_puzzle", label: "词汇拼图", group: "basic",    cats: ["noun"], recordWrong: true, maxLetters: 8 },
    { key: "action",      label: "动作猜猜", group: "advanced", cats: ["verb"], recordWrong: true },
    { key: "body_zoom",   label: "局部特写", group: "advanced", cats: ["part"], recordWrong: true },
    { key: "compare",     label: "对比观察", group: "advanced", cats: ["adj"],  recordWrong: true },
  ];
  const RULE_BY_KEY = GAME_RULES.reduce((map, rule) => {
    map[rule.key] = rule;
    return map;
  }, {});

  /* 名词题型按阶段递进：前两关只有看图/听音，第 3 关起加入词汇拼图 */
  function nounTypesForStep(step) {
    return step >= 3 ? ["pic", "listen", "word_puzzle"] : ["pic", "listen"];
  }

  /* 第 5 题在「身体部位」和「形容词」之间按权重抽取：
     前两关偏局部观察，第 3 关起逐步提高形容词对比题的权重 */
  function pickPartOrAdjType(step) {
    const adjWeight = step <= 2 ? 0.3 : 0.5;
    return Math.random() < adjWeight ? "compare" : "body_zoom";
  }

  function wordId(sceneId, word) {
    return WrongBank.makeId(sceneId, word);
  }

  /* 单词是否符合某个题型：标签匹配 + 特殊资源（动作 / 部位 / 对比图）齐备 */
  function fitsRule(w, rule) {
    if (!w || !rule.cats.includes(w.category)) return false;
    if (rule.maxLetters && String(w.word).length > rule.maxLetters) return false;
    if (rule.key === "action" && !w.actor) return false;
    if (rule.key === "body_zoom" && !w.owner) return false;
    if (rule.key === "compare" && !w.compare) return false;
    return true;
  }

  /* 同类型题型尽量不重复，让一关里题型更丰富 */
  function pickType(types, usedTypes) {
    const fresh = shuffle(types).filter((type) => !usedTypes.has(type));
    return fresh[0] || shuffle(types)[0];
  }

  /* 生成一道题：按题型筛词 + 错题库加权 + 同局去重 */
  function makeQuestion(type, pool, sceneId, usedWords, usedTypes) {
    const rule = RULE_BY_KEY[type];
    if (!rule) return null;

    let candidates = pool.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
    if (!candidates.length) candidates = pool.filter((w) => fitsRule(w, rule));
    if (!candidates.length) return null;

    /* 错题库加权抽词：答错过的词优先复现 */
    const target = WrongBank.pickWithBias(candidates, (w) => wordId(sceneId, w.word)) || candidates[0];
    usedWords.add(target.word);
    usedTypes.add(type);
    return { gameType: type, recordWrong: rule.recordWrong, targetWord: target };
  }

  /* 按固定配比组卷：普通关 3 题，BOSS 关 5 题 */
  function buildSession(level, pool, sceneId) {
    const step = ((Number(level) - 1) % LEVELS_PER_VENUE) + 1;
    const mix = step === LEVELS_PER_VENUE ? BOSS_MIX : NORMAL_MIX;
    const usedWords = new Set();
    const usedTypes = new Set();
    const questions = [];

    for (const slot of mix) {
      for (let i = 0; i < slot.count; i++) {
        let type = "action";
        if (slot.role === "noun") type = pickType(nounTypesForStep(step), usedTypes);
        else if (slot.role === "partOrAdj") type = pickPartOrAdjType(step);
        const question = makeQuestion(type, pool, sceneId, usedWords, usedTypes);
        if (question) questions.push(question);
      }
    }

    return questions;
  }

  /* 把引擎输出转换成现有 quiz.order 兼容的 task 对象 */
  function toTask(question, allWords, dlg, sceneId) {
    const w = allWords.find((x) => x.word === question.targetWord.word) || question.targetWord;
    const task = {
      type: question.gameType,
      word: w.word,
      zh: w.zh || "",
      emoji: w.emoji || "",
      art: w.art || (() => UNKNOWN_ART(w.word)),
      phon: w.phon || "",
      category: w.category || "",
      /* 素材键：题目与图片解耦；成对形容词共用同一个 assetKey */
      assetKey: w.assetKey || w.word,
      animal: !!w.animal,
      /* 进阶题型专用数据 */
      actor: w.actor || "",
      motion: w.motion || "",
      owner: w.owner || "",
      focus: w.focus || null,
      compare: w.compare || null,
      dlgQ: dlg.q,
      dlgA: dlg.a,
      recordWrong: question.recordWrong,
      wrongWordId: wordId(sceneId, w.word),
    };
    const game = currentTheme().games[question.gameType];
    if (game && game.build) game.build(task, allWords);
    return task;
  }

  /* 兜底补题：只使用本次改造后的 6 个题型，避免抽到待建设题型 */
  const IMPLEMENTED_TYPES = ["pic", "listen", "word_puzzle", "action", "body_zoom", "compare"];
  function fillTasks(tasks, size, allWords, dlg, sceneId) {
    const usedWords = new Set(tasks.map((task) => task.word));
    let guard = 0;
    while (tasks.length < size && guard++ < 20) {
      const type = IMPLEMENTED_TYPES[Math.floor(Math.random() * IMPLEMENTED_TYPES.length)];
      const rule = RULE_BY_KEY[type];
      let candidates = allWords.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
      if (!candidates.length) candidates = allWords.filter((w) => fitsRule(w, rule));
      if (!candidates.length) break;
      const w = candidates[Math.floor(Math.random() * candidates.length)];
      usedWords.add(w.word);
      tasks.push(toTask({ gameType: type, recordWrong: rule.recordWrong, targetWord: w }, allWords, dlg, sceneId));
    }
    return tasks;
  }

  /* 关卡题型表（非动物园主题沿用）：优先取主题配置，缺省回退第 10 关 */
  function levelPlan(level) {
    const plans = currentTheme().levelGames || {};
    return plans[level] || plans[10];
  }

  function buildTasks(level) {
    const theme = currentTheme();
    const pool = themeWords();
    const dlg = theme.dialog || { q: "What's this?", a: "It's a {word}." };

    /* 🦁 动物园场景：按四类题库 + 关卡模板动态组卷 */
    if (isZooScene() && window.DynamicEngine) {
      const sceneId = state.scene || "zoo";
      const scene = zooScene();
      const allSceneWords = scene && scene.words && scene.words.length ? scene.words : pool;
      const size = isAnimalBossLevel(level) ? BOSS_QUIZ_SIZE : QUIZ_SIZE;

      const questions = buildSession(level, allSceneWords, sceneId);
      let tasks = questions
        .filter((q) => theme.games[q.gameType] && theme.games[q.gameType].render)
        .map((q) => toTask(q, allSceneWords, dlg, sceneId));

      return fillTasks(tasks, size, allSceneWords, dlg, sceneId).slice(0, size);
    }

    /* ✈️🍽️ 其他主题：原有固定题型顺序逻辑 */
    const picks = shuffle(pool);
    return levelPlan(level).map((type, i) => {
      const w = picks[i % picks.length];
      const task = { type, word: w.word, art: w.art, phon: w.phon, dlgQ: dlg.q, dlgA: dlg.a };
      const game = theme.games[type];
      if (game.build) game.build(task, pool);
      return task;
    });
  }


  /* ============================================================
     题型实现
     ============================================================ */

  /* 默认关卡题序（恐龙 / 学校等固定卷主题沿用） */
  function defaultLevelGames() {
    return {
      1: ["pic", "listen", "pic", "listen", "pic"],
      2: ["pic", "listen", "feed_animal", "pic", "listen"],
      3: ["pic", "listen", "match", "feed_animal", "listen"],
      4: ["listen", "pic", "match", "word_puzzle", "pic"],
      5: ["pic", "match", "word_puzzle", "listen", "pic"],
      6: ["listen", "feed_animal", "match", "pic", "listen"],
      7: ["pic", "match", "word_puzzle", "dialog", "listen"],
      8: ["listen", "dialog", "match", "feed_animal", "pic"],
      9: ["dialog", "match", "listen", "dialog", "word_puzzle"],
      10: ["dialog", "listen", "word_puzzle", "match", "feed_animal"],
    };
  }

  /* 选择题通用选项：干扰项优先取同类词（名词配名词、动词配动词） */
  function buildOptions(task, pool, count) {
    const sameCat = pool.filter((x) => x.word !== task.word && x.category && x.category === task.category);
    const source = sameCat.length >= count - 1 ? sameCat : pool.filter((x) => x.word !== task.word);
    task.options = shuffle([
      task.word,
      ...shuffle(source).slice(0, count - 1).map((x) => x.word),
    ]);
  }
  /* 三个选项的选择题共用 build（看图 / 听音 / 对话 / 动作 / 局部特写） */
  function threeChoiceBuild(task, pool) {
    buildOptions(task, pool, 3);
  }

  /* 对比观察选项：正确词 + 成对形容词 + 其他形容词干扰 */
  function buildCompareOptions(task, pool) {
    const adjPool = pool.filter((w) => w.category === "adj");
    const pair = task.compare && task.compare.pair;
    const extras = shuffle(adjPool.filter((w) => w.word !== task.word && w.word !== pair)).slice(0, 3 - (pair ? 2 : 1));
    task.options = shuffle([task.word, ...(pair ? [pair] : []), ...extras.map((w) => w.word)]);
  }

  /* 单词主图：优先 images/words/animal/{word}.webp，其次 images/words/{word}.png，缺图时回退 emoji */
  window.wordArtFallback = function (img) {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "png";
      img.src = img.src.replace("/animal/", "/").replace(/\.webp$/, ".png");
      return;
    }
    img.style.display = "none";
    img.nextElementSibling.style.display = "grid";
  };
  function wordHeroArt(w) {
    const emoji = w.emoji || wordGlyph(w.word);
    return `<img class="pic-img" src="images/words/animal/${w.word}.webp" alt="" loading="eager" decoding="async"
      onerror="wordArtFallback(this)">
      <span class="pic-emoji" style="display:none">${emoji}</span>`;
  }

  /* 进阶题（动作 / 局部特写 / 对比观察）共用的「舞台 + 提示 + 选项」外壳 */
  function advancedLayout({ wrap, stage, tipClass, tip, optionsClass, options, btn }) {
    return {
      body: `<div class="${wrap}">${stage}<p class="${tipClass}">${tip}</p><div class="options ${optionsClass}">${options}</div></div>`,
      btn,
    };
  }

  function defaultGames() {
    return {
      pic: {
        label: "看图选词",
        title: "看图，选出正确的单词",
        pageClass: "pic-page",
        build: threeChoiceBuild,
        render({ q, choiceButton, options }) {
          return {
            body: `<div class="ref-pic-wrap">
                <div class="ref-picture-frame">
                  <div class="ref-picture-art">${wordHeroArt(q)}</div>
                  ${listenPill()}
                </div>
                <div class="options ref-pic-options">${options(q.options)}</div>
              </div>`,
            btn: choiceButton("选一个答案"),
          };
        },
      },
      listen: {
        label: "听音选图",
        title: "听单词，选出正确的图片",
        autoSpeak: true,
        build: threeChoiceBuild,
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const selected = quiz.selected;
          const cards = q.options.map((opt) => {
            const isCorrect = revealed && opt === q.word;
            const isWrong = revealed && opt === selected && opt !== q.word;
            const isSel = !revealed && selected === opt;
            const cls = ["ref-listen-card"]
              .concat(isCorrect ? ["ok"] : [])
              .concat(isWrong ? ["wrong"] : [])
              .concat(isSel ? ["sel"] : [])
              .join(" ");
            return `<button class="${cls}" data-action="select" data-word="${opt}" aria-label="选择 ${opt}">
              <span class="ref-listen-card-art">${artOf(opt)()}</span>
              ${revealed ? `<span class="ref-listen-card-word${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}">${opt}</span>` : ""}
              ${isCorrect ? `<i class="ref-listen-mark">✓</i>` : ""}
              ${isWrong ? `<i class="ref-listen-mark bad">✕</i>` : ""}
            </button>`;
          }).join("");
          return {
            body: `<div class="ref-listen-wrap">
                <button class="ref-listen-speaker" data-action="speak-word" data-word="${q.word}" aria-label="再听一遍">
                  ${QuizUiArt.speaker()}<span>点我，再听一遍</span>
                </button>
                <div class="ref-listen-grid">${cards}</div>
              </div>`,
            btn: quiz.revealed ? quizNextButton() : "",
          };
        },
      },
      match: {
        label: "单词连线",
        title: "把单词和图片连起来",
        build(task, pool) {
          const trio = shuffle(pool).slice(0, 3);
          task.pairs = trio.map((x) => ({ word: x.word, art: x.art }));
          task.words = shuffle(trio.map((x) => x.word));
          task.arts = shuffle(trio.map((x) => ({ word: x.word, art: x.art })));
        },
        render({ q, quiz }) {
          const solved = new Set(quiz.matched || []);
          const selected = quiz.pickWord;
          const leftCol = q.arts.map((p) => {
            const isDone = solved.has(p.word);
            const isSel = selected === p.word && !isDone;
            return `<div class="ref-match-row${isDone ? " done" : ""}${isSel ? " sel" : ""}" data-match-row data-word="${p.word}" data-match-side="art">
              <div class="ref-match-art-card">${p.art()}</div>
              <button class="ref-match-dot" data-match-dot data-match-side="art" data-word="${p.word}" aria-label="选择 ${p.word}">${isDone ? "<i class='ok-check'>✓</i>" : ""}</button>
            </div>`;
          }).join("");
          const rightCol = q.words.map((w) => {
            const isDone = solved.has(w);
            const isSel = selected === w && !isDone;
            return `<div class="ref-match-row${isDone ? " done" : ""}${isSel ? " sel" : ""}" data-match-row data-word="${w}" data-match-side="word">
              <button class="ref-match-dot" data-match-dot data-match-side="word" data-word="${w}" aria-label="选择 ${w}">${isDone ? "<i class='ok-check'>✓</i>" : ""}</button>
              <div class="ref-match-word-card">${w}</div>
            </div>`;
          }).join("");
          return {
            body: `<div class="ref-match-area" data-match-area>
                <svg class="ref-match-svg" aria-hidden="true"></svg>
                <div class="ref-match-col ref-match-col-left">${leftCol}</div>
                <div class="ref-match-col ref-match-col-right">${rightCol}</div>
              </div>
              <div class="listen-row">${listenPill()}</div>`,
            btn: quiz.revealed ? quizNextButton() : `<button class="btn" disabled>连对 3 组即可过关 ${I.arrow(18)}</button>`,
          };
        },
        onPickWord(word) {
          if (!quiz || quiz.revealed) return;
          quiz.pickWord = word;
          quiz.pickWordSide = "word";
          sfx("tap");
          render();
        },
        onPickArt(word) {
          if (!quiz || quiz.revealed || !quiz.pickWord) return;
          const q = quiz.order[quiz.index];
          /* 构造错题库 wordId（match 题型的 q.pairs 里没有 wrongWordId） */
          const _sceneId = (state && state.scene) || "";
          const _makeWid = (w) => window.WrongBank ? WrongBank.makeId(_sceneId, w) : null;
          if (word === quiz.pickWord) {
            quiz.matched.push(word);
            quiz.pickWord = null;
            quiz.pickWordSide = null;
            sfx("correct");
            /* 🦁 动物园：配对成功 → 尝试清除错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(word)) WrongBank.recordCorrect(_makeWid(word));
            if (quiz.matched.length >= q.pairs.length) {
              quiz.revealed = true;
              quiz.choiceCorrect = quiz.matchWrong === 0;
              if (quiz.choiceCorrect) {
                quiz.correct++;
                q.pairs.forEach((p) => quiz.words.push(p.word));
                sfx("excellent");
              }
              render();
              return;
            }
          } else {
            quiz.matchWrong++;
            const wrongPair = quiz.pickWord; /* 被选错的那个单词 */
            quiz.pickWord = null;
            quiz.pickWordSide = null;
            quiz.hearts = Math.max(0, quiz.hearts - 1);
            sfx("wrong");
            /* 🦁 动物园：配对失败 → 自动收录错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(wrongPair)) WrongBank.recordWrong(_makeWid(wrongPair));
            if (quiz.hearts <= 0) {
              quiz.revealed = true;
              quiz.choiceCorrect = false;
              render();
              return;
            }
            toast("答错了，继续努力");
          }
          render();
        },
      },
      dialog: {
        label: "情景对话",
        title: "读对话，选出正确的单词",
        build: threeChoiceBuild,
        render({ q, quiz, choiceButton, options }) {
          const revealed = quiz.revealed;
          return {
            body: `<div class="ref-dialog-card">
                <div class="ref-dialog-row"><div class="ref-dialog-person">${QuizUiArt.child("boy")}</div>
                  <div class="ref-dialog-bubble"><span class="ref-dialog-name">A</span><p>${q.dlgQ}</p><span class="ref-dialog-pic">${q.art()}</span></div></div>
                <div class="ref-dialog-row reply"><div class="ref-dialog-bubble"><span class="ref-dialog-name">B</span><p>${q.dlgA.replace("{word}", `<b class="blank">${revealed ? q.word : "＿＿"}</b>`)}</p></div>
                  <div class="ref-dialog-person">${QuizUiArt.child("girl")}</div></div>
              </div>
              <div class="listen-row ref-dialog-listen">${listenPill()}</div>
              <div class="options one-col ref-dialog-options">${options(q.options)}</div>`,
            btn: choiceButton("选一个单词"),
          };
        },
      },
      /* 🧩 词汇拼图 Word Puzzle（纯 DOM 拖拽排序） */
      word_puzzle: {
        label: "词汇拼图",
        title: "拖动字母块，拼出单词！",
        build(task) {
          /* 打乱字母顺序（至少位移 2 个以上） */
          const letters = task.word.toUpperCase().split("");
          let shuffled;
          do { shuffled = [...letters].sort(() => Math.random() - 0.5); }
          while (shuffled.join("") === letters.join("") && letters.length > 1);
          task.puzzleLetters = shuffled.map((ch, i) => ({ ch, id: i, placed: false }));
          task.puzzleSlots = letters.map((ch, i) => ({ id: i, filled: null }));
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const slotsHtml = q.puzzleSlots.map((s) => {
            const letter = s.filled !== null ? q.puzzleLetters.find((l) => l.id === s.filled) : null;
            return `<div class="pz-slot ${letter ? "filled" : ""}" data-slot="${s.id}">${letter ? letter.ch : ""}</div>`;
          }).join("");
          const lettersHtml = q.puzzleLetters.map((l) => {
            const used = q.puzzleSlots.some((s) => s.filled === l.id);
            return `<button type="button" class="pz-letter ${used ? "used" : ""}" data-action="pz-letter" data-drag="puzzle" data-letter="${l.id}" ${used ? "disabled" : ""}>${l.ch}</button>`;
          }).join("");
          const allFilled = q.puzzleSlots.every((s) => s.filled !== null);
          const body = `
            <div class="pz-wrap ref-puzzle-wrap">
              <div class="pz-hint ref-puzzle-hint">
                <div class="pz-art">${artOf(q.word)()}</div>
                <small>${q.zh}</small>
              </div>
              <div class="pz-slots" style="--slot-count:${q.puzzleSlots.length}">${slotsHtml}</div>
              <div class="pz-letters">${lettersHtml}</div>
              ${!revealed
                ? `<button type="button" class="btn pz-check" data-action="pz-check" ${allFilled ? "" : "disabled"}>检查答案 ${I.arrow(16)}</button>`
                : `<span class="pz-check-spacer" aria-hidden="true"></span>`}
            </div>`;
          return { body, btn: revealed ? quizNextButton() : "" };
        },
      },
      /* 🍎 动物喂食 Feed the Animal（emoji 拖拽 + 选卡） */
      feed_animal: {
        label: "动物喂食",
        title: "给动物喂它爱吃的食物！",
        build(task, pool) {
          /* 从 pool 里找 3 种不同的食物 emoji 作为选项 */
          const foodPool = pool.filter((w) => w.category === "food" || ["banana", "meat", "grass", "honey", "bamboo"].includes(w.word));
          const foods = foodPool.slice(0, 3).map((w) => ({ word: w.word, emoji: w.emoji || "🍎", zh: w.zh || "" }));
          if (foods.length < 3) {
            /* 兜底：用不重复的基础食物补足到 3 种 */
            const seen = new Set(foods.map((f) => f.word));
            const fallback = [
              { word: "meat", emoji: "🥩", zh: "肉" },
              { word: "banana", emoji: "🍌", zh: "香蕉" },
              { word: "bamboo", emoji: "🎋", zh: "竹子" },
            ];
            for (const f of fallback) {
              if (foods.length >= 3) break;
              if (seen.has(f.word)) continue;
              foods.push(f);
              seen.add(f.word);
            }
          }
          /* 打乱；正确答案优先用词条自带的 eats，其次用动物常量映射 */
          task.foods = shuffle(foods);
          const match = { panda: "bamboo", lion: "meat", tiger: "meat", bear: "honey", monkey: "banana", koala: "eucalyptus", rabbit: "carrot" };
          const preferred = task.eats || match[task.word];
          task.correctFood = preferred && task.foods.some((f) => f.word === preferred)
            ? preferred
            : task.foods[0].word;
          /* 答错提示用：正确食物的中文翻译 */
          task.correctZh = (task.foods.find((f) => f.word === task.correctFood) || {}).zh || "";
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const foods = q.foods.map((f) =>
            `<button type="button" class="fd-food ${revealed && f.word === q.correctFood ? "correct" : ""} ${quiz.selected === f.word ? "selected" : ""}"
              data-action="fd-pick" data-drag="food" data-food="${f.word}"><span class="ref-food-art">${artOf(f.word)()}</span><small>${f.word}</small></button>`
          ).join("");
          const body = `
            <div class="fd-wrap ref-feed-wrap">
              <div class="fd-animal ref-feed-animal" data-feed-drop>
                <div class="fd-art">${artOf(q.word)()}</div>
                <div class="fd-name">${q.word.toUpperCase()}</div>
                <small>${q.zh} 爱吃什么？拖到嘴边或点选食物</small>
              </div>
              <div class="fd-foods">${foods}</div>
            </div>`;
          const btn = revealed ? quizNextButton() : `<button type="button" class="btn" data-action="fd-check" ${quiz.selected ? "" : "disabled"}>喂给它 ${I.arrow(16)}</button>`;
          return { body, btn };
        },
      },
      /* 🏃 动作猜猜 Action（进阶题：中央动态动物 + 纯文字选项） */
      action: {
        label: "动作猜猜",
        title: "看动作，选出正确的单词",
        build: threeChoiceBuild,
        render({ q, quiz, options }) {
          const motion = q.motion || "run";
          const actionArt = q.assetKey && q.assetKey.indexOf("action-") === 0
            ? `<img class="ref-action-img" src="images/words/${q.assetKey}.png" alt=""
                 onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">`
            : "";
          return advancedLayout({
            wrap: "ref-action-wrap",
            stage: `<div class="ref-action-stage" data-asset-key="${q.assetKey || q.word}" aria-hidden="true">
                  <span class="ref-action-sun"></span>
                  <span class="ref-action-cloud c1"></span>
                  <span class="ref-action-cloud c2"></span>
                  <span class="ref-action-ground"></span>
                  <span class="ref-action-animal act-${motion}"><span class="ref-action-emoji">${q.actor || q.emoji || "🐾"}</span>${actionArt}</span>
                  <span class="ref-action-spark s1">✦</span>
                  <span class="ref-action-spark s2">✦</span>
                </div>`,
            tipClass: "ref-action-tip",
            tip: "动物在干什么？",
            optionsClass: "ref-action-options",
            options: options(q.options),
            btn: quiz.revealed ? quizNextButton() : "",
          });
        },
      },
      /* 🔍 局部特写 Body Zoom（进阶题：放大镜高亮身体部位） */
      body_zoom: {
        label: "局部特写",
        title: "放大看看，这是哪个部位？",
        build: threeChoiceBuild,
        render({ q, quiz, options }) {
          const f = q.focus || { x: "0%", y: "0%", scale: 2 };
          return advancedLayout({
            wrap: "ref-zoom-wrap",
            stage: `<div class="ref-zoom-lens" data-asset-key="${q.assetKey || q.word}" aria-hidden="true">
                  <span class="ref-zoom-art" style="--fx:${f.x};--fy:${f.y};--fs:${f.scale}">${q.owner || q.emoji || "🐾"}</span>
                  <span class="ref-zoom-spot"></span>
                </div>
                <span class="ref-zoom-handle" aria-hidden="true"></span>`,
            tipClass: "ref-zoom-tip",
            tip: "这是谁身上的哪个部位？",
            optionsClass: "ref-zoom-options",
            options: options(q.options),
            btn: quiz.revealed ? quizNextButton() : "",
          });
        },
      },
      /* ⚖️ 对比观察 Compare（进阶题：同框大小 / 高矮 / 快慢对照） */
      compare: {
        label: "对比观察",
        title: "对比看看，选出正确的单词",
        build: buildCompareOptions,
        render({ q, quiz, options }) {
          const c = q.compare || { a: { emoji: q.emoji || "🐾", scale: 1 }, b: { emoji: "🐾", scale: 1 }, target: "a" };
          const a = c.a || {};
          const b = c.b || {};
          const item = (side, data) => `<div class="ref-cmp-item${c.target === side ? " target" : ""}" style="--s:${data.scale || 1}">
              <span>${data.emoji || "🐾"}</span>
              ${data.badge ? `<i class="ref-cmp-badge" aria-hidden="true">${data.badge}</i>` : ""}
              ${c.target === side ? '<i class="ref-cmp-ring" aria-hidden="true"></i>' : ""}
            </div>`;
          return advancedLayout({
            wrap: "ref-cmp-wrap",
            stage: `<div class="ref-cmp-stage mode-${c.mode || "size"}" data-asset-key="${q.assetKey || q.word}" data-target="${c.target || "a"}" aria-hidden="true">
                  ${item("a", a)}
                  ${item("b", b)}
                  <span class="ref-cmp-floor"></span>
                </div>`,
            tipClass: "ref-cmp-tip",
            tip: "圈出来的动物，用哪个词形容？",
            optionsClass: "ref-cmp-options",
            options: options(q.options),
            btn: quiz.revealed ? quizNextButton() : "",
          });
        },
      },
    };
  }

  window.DynamicEngine = {
    GAME_RULES,
    CATEGORIES,
    NORMAL_MIX,
    BOSS_MIX,
    /* 题型实现（唯一来源，主题注册时取用） */
    defaultGames,
    defaultLevelGames,
    buildTasks,

    /* 兼容旧调用：level 全局 1~50；pool 为当前场景词池 */
    generateSession(sceneWords, stopWords, sceneId, level) {
      const pool = sceneWords && sceneWords.length ? sceneWords : (stopWords || themeWords());
      return buildSession(level, pool, sceneId || state.scene || "zoo");
    },

    /* 隐藏题（BOSS 占位关第 6 题）：固定看图选词，答对奖励宝箱，不计入星级 */
    buildBonusTask() {
      const scene = zooScene();
      const words = ((scene && scene.words && scene.words.length) ? scene.words : themeWords())
        .filter((w) => w.category === "noun");
      const sceneId = state.scene || "zoo";
      const game = currentTheme().games.pic && currentTheme().games.pic.render ? currentTheme().games.pic : null;
      if (!game || !words.length) return null;
      const target = WrongBank.pickWithBias(words, (w) => wordId(sceneId, w.word));
      if (!target) return null;
      const task = {
        type: "pic",
        word: target.word,
        zh: target.zh || "",
        emoji: target.emoji || "",
        art: target.art || (() => UNKNOWN_ART(target.word)),
        phon: target.phon || "",
        category: target.category || "",
        recordWrong: false,
        wrongWordId: wordId(sceneId, target.word),
        isBonus: true,
      };
      if (game.build) game.build(task, words);
      return task;
    },
  };
})();
