/* ============================================================
   DynamicEngine · 动物乐园题库引擎（仅陆地动物园，100 词）
   - 词库四类：核心动物名词 30 / 动作动词 30 / 身体部位 20 / 特征形容词 20
   - 普通关固定 3 题：1 名词 + 1 动词 + 1 部位/形容词
   - BOSS 关固定 5 题：3 名词 + 1 动词 + 1 部位/形容词
   - 每题独立携带 category + assetKey，题型与素材解耦
   - BOSS 专属规则后续迭代
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

  window.DynamicEngine = {
    GAME_RULES,
    CATEGORIES,
    NORMAL_MIX,
    BOSS_MIX,
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
