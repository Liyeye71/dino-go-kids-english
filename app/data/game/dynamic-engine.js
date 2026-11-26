/* ============================================================
   DynamicEngine · 动物乐园题库引擎 + 全主题题型实现
   - 本文件是题型的唯一实现来源：新增 / 调整题型只改这里
   - 词库四类：核心动物名词 30 / 动作动词 30 / 身体部位 20 / 特征形容词 20
   - 关卡题数循环：33335（每 5 关最后一关 5 题，其余 3 题）
   - 每题独立携带 category + assetKey，题型与素材解耦
   - 错题库加权保留：答错过的词优先复现
   ============================================================ */
(function () {
  "use strict";

  /* 关卡题数：每 5 关最后一关 5 题，其余 3 题（33335 循环） */
  function quizSize(level) {
    return isAssessmentLevel(level) ? 5 : 3;
  }
  window.quizSize = quizSize;

  /* 所有关卡通用配比：1 名词 + 1 动词 + 1 部位/形容词
     5 题关卡在这 3 题基础上再随机补 2 道（dialog / 进阶题型） */
  const NORMAL_MIX = [
    { role: "noun",      count: 1 },
    { role: "verb",      count: 1 },
    { role: "partOrAdj", count: 1 },
  ];

  /* 启蒙模式（3 岁）：2 选项，屏蔽词汇拼图与情景对话（enlightenOn 由 shared.js 统一提供） */
  function optionCount() {
    return enlightenOn() ? 2 : 3;
  }
  /* 设备形态感知：iPad/桌面(>=600px) 走全互动池，手机窄屏自动降级减量 */
  function isTabletOrDesktop() {
    return typeof window !== "undefined" && window.innerWidth >= 600;
  }
  function toddlerDeviceConfig() {
    const tablet = isTabletOrDesktop();
    return { bushCount: tablet ? 3 : 2 };
  }
  /* 普通与启蒙共用题型池；启蒙仅屏蔽词汇拼图和情景对话 */
  const ENLIGHTEN_BLOCKED_TYPES = new Set(["word_puzzle", "dialog"]);
  function typesForMode(types) {
    return enlightenOn() ? types.filter((type) => !ENLIGHTEN_BLOCKED_TYPES.has(type)) : types;
  }
  /* 普通闯关只使用当前主题注册的题型；每日挑战不受主题禁用限制 */
  function typesForCurrentTheme(types) {
    const games = currentTheme().games || {};
    return typesForMode(types).filter((type) => games[type]);
  }
  function verbType() {
    return "action";
  }

  /* 四维词库标签 */
  const CATEGORIES = ["noun", "verb", "part", "adj"];

  /* 题型规则
     basic    = 保底基础认知题（看图 / 听音 / 拼词）
     advanced = 互动进阶题（动作） */
  const GAME_RULES = [
    { key: "pic",         label: "看图选词", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "listen",      label: "听音戳泡泡", group: "basic",  cats: ["noun"], recordWrong: true },
    { key: "word_puzzle", label: "词汇拼图", group: "basic",    cats: ["noun"], recordWrong: true, maxLetters: 8 },
    { key: "feed_animal", label: "动物喂食", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "dialog",      label: "情景对话", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "match",       label: "单词连线", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "action",      label: "动作猜猜", group: "advanced", cats: ["verb"], recordWrong: true },
    { key: "hide_seek",     label: "草丛寻宝", group: "interactive", cats: ["noun"], recordWrong: true },
    { key: "voice_compare", label: "听音比大小", group: "interactive", cats: ["adj"], recordWrong: true },
  ];
  const RULE_BY_KEY = GAME_RULES.reduce((map, rule) => {
    map[rule.key] = rule;
    return map;
  }, {});
  const IMPLEMENTED_TYPES = GAME_RULES.map((rule) => rule.key);

  /* 名词题型按阶段递进，所有互动题型与启蒙共用同一池 */
  function nounTypesForStep(step) {
    let types;
    if (step <= 1) types = ["pic", "listen", "feed_animal", "hide_seek"];
    else if (step === 2) types = ["pic", "listen", "feed_animal", "match", "hide_seek"];
    else types = ["pic", "listen", "word_puzzle", "feed_animal", "match", "hide_seek"];
    return typesForCurrentTheme(types);
  }

  /* 部位 / 形容词槽位：动物喂食或听音比大小 */
  function pickPartOrAdjType(usedTypes) {
    return pickType(["feed_animal", "voice_compare"], usedTypes);
  }

  /* 单词是否符合某个题型：标签匹配 + 特殊资源（动作 / 部位 / 对比图）齐备 */
  function fitsRule(w, rule) {
    /* 听音戳泡泡：启蒙模式下允许动词（选项用 action 动作图），其余情况仍限名词 */
    const catOk = rule.cats.includes(w && w.category)
      || (rule.key === "listen" && enlightenOn() && w && w.category === "verb");
    if (!w || !catOk) return false;
    if (rule.maxLetters && String(w.word).length > rule.maxLetters) return false;
    if (rule.key === "action" && !w.actor) return false;
    if (rule.key === "feed_animal" && !w.food) return false;
    /* 启蒙模式：杂食动物可吃食物太杂，2 选项容易误伤，改出其他题型 */
    if (rule.key === "feed_animal" && enlightenOn() && w.diet === "omnivore") return false;
    if (rule.key === "dialog" && !w.dialogueClue) return false;
    if (rule.key === "voice_compare" && !w.compare) return false;
    return true;
  }

  /* 同类型题型尽量不重复，让一关里题型更丰富 */
  function pickType(types, usedTypes) {
    const fresh = shuffle(types).filter((type) => !usedTypes.has(type));
    return fresh[0] || shuffle(types)[0];
  }

  /* 生成一道题：按题型筛词 + 错题库加权 + 同局去重
     familiarSet 存在时（BOSS 关）严格按「错题库 → 已解锁词 → 其他词」优先抽词 */
  function makeQuestion(type, pool, sceneId, usedWords, usedTypes, familiarSet, targetPool) {
    const rule = RULE_BY_KEY[type];
    if (!rule) return null;

    let candidates = pool.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
    if (!candidates.length) candidates = pool.filter((w) => fitsRule(w, rule));
    if (!candidates.length) return null;
    /* 重玩关卡：目标词只从错词库抽，错词不够时自然回落到正常词补足 */
    if (targetPool && targetPool.size) {
      const wrongOnly = candidates.filter((w) => targetPool.has(w.word));
      if (wrongOnly.length) candidates = wrongOnly;
    }

    let target;
    if (familiarSet) {
      const wrong = candidates.filter((w) => WrongBank.isWrongWord(WrongBank.makeId(sceneId, w.word)));
      const known = candidates.filter((w) => familiarSet.has(w.word));
      const tier = wrong.length ? wrong : (known.length ? known : candidates);
      target = tier[Math.floor(Math.random() * tier.length)];
    } else {
      /* 错题库加权抽词：答错过的词优先复现 */
      target = WrongBank.pickWithBias(candidates, (w) => WrongBank.makeId(sceneId, w.word)) || candidates[0];
    }
    usedWords.add(target.word);
    usedTypes.add(type);
    return { gameType: type, recordWrong: rule.recordWrong, targetWord: target };
  }

  /* 按固定配比组卷：3 题关卡 1n+1v+1p，5 题关卡再加 2 道进阶题 */
  function buildSession(level, pool, sceneId, familiarSet, targetPool) {
    const step = ((Number(level) - 1) % LEVELS_PER_STAGE) + 1;
    const size = quizSize(level);
    const usedWords = new Set();
    const usedTypes = new Set();
    const questions = [];

    /* 普通与启蒙共用 NORMAL_MIX 基础配比和题型池 */
    for (const slot of NORMAL_MIX) {
      for (let i = 0; i < slot.count; i++) {
        let type = "action";
        if (slot.role === "noun") type = pickType(nounTypesForStep(step), usedTypes);
        else if (slot.role === "verb") type = verbType();
        else if (slot.role === "partOrAdj") type = pickPartOrAdjType(usedTypes);
        const question = makeQuestion(type, pool, sceneId, usedWords, usedTypes, familiarSet, targetPool);
        if (question) questions.push(question);
      }
    }

    /* 5 题关卡再补 2 道：普通与启蒙共用全题型池，启蒙仅过滤禁用题型 */
    const extraTypes = typesForCurrentTheme(IMPLEMENTED_TYPES);
    while (questions.length < size) {
      const t = pickType(extraTypes, usedTypes);
      const q = makeQuestion(t, pool, sceneId, usedWords, usedTypes, familiarSet, targetPool);
      if (!q) break;
      questions.push(q);
    }

    return questions;
  }

  /* 把引擎输出转换成现有 quiz.order 兼容的 task 对象
     buildPool：出题 / 干扰项用词池，BOSS 关会收窄到错题库 + 已解锁词 */
  function toTask(question, allWords, dlg, sceneId, buildPool, sourceTheme, wordMap) {
    const theme = sourceTheme || currentTheme();
    const w = (wordMap ? wordMap.get(question.targetWord.word) : allWords.find((x) => x.word === question.targetWord.word)) || question.targetWord;
    const task = {
      type: question.gameType,
      themeId: theme.id || sceneId,
      sceneId,
      word: w.word,
      zh: w.zh || "",
      emoji: w.emoji || "",
      art: w.art || (() => UNKNOWN_ART(w.word)),
      phon: w.phon || "",
      category: w.category || "",
      example: w.example || "",
      picHint: theme.picHint || "",
      picPrompt: theme.picPrompt || "",
      /* 素材键：题目与图片解耦；成对形容词共用同一个 assetKey */
      assetKey: w.assetKey || w.word,
      animal: !!w.animal,
      /* 图片与食物：数据层挂载，缺图时渲染层回退 emoji */
      img: w.img || "",
      food: w.food || null,
      foodId: w.foodId || "",
      eats: w.eats || "",
      diet: w.diet || "",
      dialogueClue: w.dialogueClue || "",
      /* 进阶题型专用数据 */
      actor: w.actor || "",
      motion: w.motion || "",
      actionSound: w.actionSound || "",
      compare: w.compare || null,
      dlgQ: question.gameType === "dialog" && w.dialogueClue ? w.dialogueClue : dlg.q,
      dlgA: dlg.a,
      recordWrong: question.recordWrong,
      wrongWordId: WrongBank.makeId(sceneId, w.word),
    };
    /* 每日挑战可回退到公共题型实现，不受来源主题禁用限制 */
    const game = (theme.games && theme.games[question.gameType]) || getDefaultGame(question.gameType);
    if (game && game.build) game.build(task, buildPool && buildPool.length ? buildPool : allWords);
    return task;
  }

  /* 选项图片映射：从本主题词池取词条插画，供听音戳泡泡 / 连线等题型直接复用 */
  function attachOptionArt(task, pool, wordMap) {
    if (!task || !Array.isArray(task.options) || task.optionImgs) return task;
    if (!task.options.every((opt) => typeof opt === "string")) return task;
    const lookup = wordMap || new Map(pool.map((x) => [x.word, x]));
    task.optionImgs = {};
    task.optionEmojis = {};
    task.options.forEach((opt) => {
      const w = lookup.get(opt);
      task.optionImgs[opt] = (w && w.img) || "";
      task.optionEmojis[opt] = (w && w.emoji) || "";
    });
    return task;
  }

  /* 兜底补题：从共用全题型池中按词汇适配补入 */
  function fillTasks(tasks, size, allWords, dlg, sceneId, allowedTypes, primaryPool, targetPool, wordMap) {
    const types = typesForCurrentTheme(allowedTypes && allowedTypes.length ? allowedTypes : IMPLEMENTED_TYPES);
    const usedWords = new Set(tasks.map((task) => task.word));
    const primary = primaryPool && primaryPool.length ? primaryPool : allWords;
    let guard = 0;
    while (tasks.length < size && guard++ < 20) {
      const type = types[Math.floor(Math.random() * types.length)];
      const rule = RULE_BY_KEY[type];
      let candidates = primary.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
      /* 优先池凑不满时，回退到完整场景词表兜底 */
      if (!candidates.length) candidates = allWords.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
      if (!candidates.length) candidates = allWords.filter((w) => fitsRule(w, rule));
      if (!candidates.length) break;
      /* 重玩关卡：补题也优先只抽错词库里的词 */
      if (targetPool && targetPool.size) {
        const wrongOnly = candidates.filter((w) => targetPool.has(w.word));
        if (wrongOnly.length) candidates = wrongOnly;
      }
      const w = candidates[Math.floor(Math.random() * candidates.length)];
      usedWords.add(w.word);
      tasks.push(toTask({ gameType: type, recordWrong: rule.recordWrong, targetWord: w }, allWords, dlg, sceneId, primary, null, wordMap));
    }
    return tasks;
  }

  /* 关卡题型表（非动物园主题沿用）：优先取主题配置，缺省回退第 10 关 */
  function levelPlan(level) {
    const plans = currentTheme().levelGames || {};
    return plans[level] || plans[10];
  }

  function buildTasks(level, opts = {}) {
    const theme = currentTheme();
    const pool = themeWords();
    const dlg = theme.dialog || { q: "What's this?", a: "It's a {word}." };
    const size = quizSize(level);

    /* 🦁 动物园场景：按四类题库 + 关卡模板动态组卷 */
    if (isZooScene() && window.DynamicEngine) {
      const sceneId = state.scene || "zoo";
      const scene = zooScene();
      const allSceneWords = scene && scene.words && scene.words.length ? scene.words : pool;

      /* 重玩未满星关卡：目标词只从错词库抽，错词不够时再用正常词补足 */
      let targetPool = null;
      if (opts.replay) {
        const prefix = `${sceneId}_`;
        const wrongWords = new Set(WrongBank.listInScene(sceneId).map((id) => id.slice(prefix.length)));
        targetPool = new Set(allSceneWords.filter((w) => wrongWords.has(w.word)).map((w) => w.word));
      }

      const wordMap = new Map(allSceneWords.map((w) => [w.word, w]));
      const questions = buildSession(level, allSceneWords, sceneId, null, targetPool);
      const tasks = questions
        .filter((q) => theme.games[q.gameType] && theme.games[q.gameType].render)
        .map((q) => toTask(q, allSceneWords, dlg, sceneId, allSceneWords, null, wordMap));

      /* 补题：全部已实现题型都开放（dialog 不再限制） */
      const allowed = typesForCurrentTheme(IMPLEMENTED_TYPES);
      const filled = fillTasks(tasks, size, allSceneWords, dlg, sceneId, allowed, allSceneWords, targetPool, wordMap).slice(0, size);
      /* 选项图片按本场景词池解析：动作动词取 action 目录，保证听音戳泡泡能显示动词图片 */
      return filled.map((task) => attachOptionArt(task, allSceneWords, wordMap));
    }

    /* ✈️🚌 单场景主题（上学了 / 去旅行）：与动物乐园共用同一套动态出题
       - 33335 循环：每 5 关最后一关 5 题，其余 3 题 */
    const themeId = theme.id || state.theme || "theme";
    const usedWords = new Set();
    const usedTypes = new Set();
    const plan = typesForCurrentTheme(levelPlan(level) || [])
      .filter((type) => theme.games[type] && theme.games[type].render);
    const questions = [];
    /* 按关卡轮转题型起点，避免每关前三题永远是同几种考法 */
    const turn = ((Number(level) || 1) - 1) % Math.max(1, plan.length);
    const ordered = plan.slice(turn).concat(plan.slice(0, turn));
    for (const type of ordered) {
      if (questions.length >= size) break;
      if (usedTypes.has(type)) continue;
      const q = makeQuestion(type, pool, themeId, usedWords, usedTypes);
      if (q) questions.push(q);
    }

    const wordMap = new Map(pool.map((w) => [w.word, w]));
    let tasks = questions.map((q) => toTask(q, pool, dlg, themeId, pool, null, wordMap));
    tasks = fillTasks(tasks, size, pool, dlg, themeId, plan, pool, null, wordMap).slice(0, size);
    return tasks.map((task) => attachOptionArt(task, pool, wordMap));
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
      7: ["pic", "match", "word_puzzle", "feed_animal", "listen"],
      8: ["listen", "word_puzzle", "match", "feed_animal", "pic"],
      9: ["feed_animal", "match", "listen", "pic", "word_puzzle"],
      10: ["dialog", "listen", "word_puzzle", "match", "feed_animal"],
    };
  }

  /* ============================================================
     歧义词过滤：同义/近义/时态易混的词不出现在同一道题的选项里
     （如正确答案 sleep 的选项不出现 nap，避免儿童看图/听音无法区分）
     ============================================================ */
  const AMBIGUOUS_GROUPS = [
    /* 动词同义/近义 */
    ["sleep", "nap"], ["smile", "laugh"], ["see", "look", "watch", "saw"], ["listen", "hear"],
    /* 动作场景易混：2 选项时同一动作的不同说法会让孩子无法判断 */
    ["run", "chase", "hunt", "race"], ["swim", "splash"], ["hold", "carry", "catch"],
    ["give", "share", "help"], ["eat", "bite", "lick"], ["hug", "love"],
    /* 上位词与具体动物：bird 不能和 eagle / owl 等同时选项 */
    ["bird", "eagle", "owl", "parrot", "duck", "chicken", "crow", "peacock", "flamingo"],
    ["say", "speak", "talk", "tell", "said", "told"], ["start", "begin"], ["like", "love"],
    /* 形容词近义 */
    ["small", "little"], ["big", "large", "huge"], ["happy", "glad"], ["sad", "unhappy"],
    ["fast", "quick", "quickly"], ["beautiful", "pretty"], ["tall", "high"],
    /* 名词同义 */
    ["film", "movie"], ["picture", "photo"], ["gift", "present"],
    ["autumn", "fall"], ["colour", "color"], ["grey", "gray"],
    /* 家庭称呼变体 */
    ["mum", "mom", "mother", "mummy"], ["dad", "father", "daddy"],
    ["grandma", "grandmother"], ["grandpa", "grandfather"],
    /* 交际用语 */
    ["hello", "hi"], ["thanks", "thank you"], ["bye", "goodbye"],
    /* 不规则动词现在/过去式易混 */
    ["eat", "ate"], ["go", "went"], ["take", "took"], ["come", "came"], ["run", "ran"],
    ["sing", "sang"], ["drink", "drank"], ["give", "gave"], ["buy", "bought"], ["make", "made"],
    ["get", "got"], ["have", "had"], ["do", "did"], ["fly", "flew"], ["draw", "drew"],
    ["swim", "swam"], ["sit", "sat"], ["stand", "stood"], ["write", "wrote"],
    ["teach", "taught"], ["find", "found"], ["know", "knew"], ["grow", "grew"], ["blow", "blew"],
    ["break", "broke"], ["drive", "drove"], ["ride", "rode"], ["wear", "wore"], ["think", "thought"],
  ];
  const AMBIG_INDEX = {};
  AMBIGUOUS_GROUPS.forEach((group, gi) => group.forEach((w) => {
    const key = w.toLowerCase();
    if (!AMBIG_INDEX[key]) AMBIG_INDEX[key] = [];
    AMBIG_INDEX[key].push(gi);
  }));
  /* 两个词条是否互为歧义：落在同一歧义组，或中文释义完全相同 */
  function isAmbiguous(a, b) {
    if (!a || !b) return false;
    const ga = AMBIG_INDEX[String(a.word || a).toLowerCase()];
    const gb = AMBIG_INDEX[String(b.word || b).toLowerCase()];
    if (ga && gb && ga.some((g) => gb.indexOf(g) >= 0)) return true;
    return !!a.zh && !!b.zh && a.zh === b.zh;
  }

  /* 选择题通用选项：干扰项优先取同类词（名词配名词、动词配动词），并排除与答案歧义的词 */
  function buildOptions(task, pool, count) {
    const others = pool.filter((x) => x.word !== task.word);
    const clean = others.filter((x) => !isAmbiguous(x, task));
    const sameCatClean = clean.filter((x) => x.category && x.category === task.category);
    /* 优先同类无歧义 → 全池无歧义 → 兜底放开，保证选项总能凑齐 */
    let source = sameCatClean;
    if (source.length < count - 1) source = clean;
    if (source.length < count - 1) source = others;
    task.options = shuffle([
      task.word,
      ...shuffle(source).slice(0, count - 1).map((x) => x.word),
    ]);
  }
  /* 选择题共用 build（看图 / 听音 / 对话 / 动作）：启蒙模式只给 2 个选项 */
  function threeChoiceBuild(task, pool) {
    buildOptions(task, pool, optionCount());
  }

  /* 单词主图：优先使用数据层的 img，缺图时同目录 .png，再缺则回退 emoji（wordArtFallback 由 shared.js 提供） */
  function wordImageSrc(w) {
    if (!w) return "";
    return w.img || `images/words/animal/${w.word}.webp`;
  }
  /* 带图片回退的通用插图：图片缺失时显示 emoji/SVG 兜底 */
  function artWithImage(src, cls, fallback) {
    if (!src) return fallback;
    return `<img class="${cls}" src="${src}" alt="" loading="eager" decoding="async"
      style="width:100%;height:100%;object-fit:contain"
      onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="art-fallback" style="display:none;width:100%;height:100%;place-items:center">${fallback}</span>`;
  }
  function wordHeroArt(w) {
    return wordArtImg(wordImageSrc(w), "pic-img", w.emoji || wordGlyph(w.word), "pic-emoji");
  }

  /* 动作题使用的「舞台 + 提示 + 选项」外壳 */
  function advancedLayout({ wrap, stage, tipClass, tip, optionsClass, options, btn }) {
    return {
      body: `<div class="${wrap}">${stage}<p class="${tipClass}">${tip}</p><div class="options ${optionsClass}">${options}</div></div>`,
      btn,
    };
  }

  const _poolAnimalReCache = new WeakMap();
  const _escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function _animalReForPool(pool) {
    if (!pool || typeof pool !== "object") return null;
    if (_poolAnimalReCache.has(pool)) return _poolAnimalReCache.get(pool);
    const animals = new Set();
    pool.forEach((x) => { if (x && x.animal && x.word && x.word.length >= 2) animals.add(x.word); });
    const re = animals.size
      ? new RegExp(`\\b(${[...animals].sort((a, b) => b.length - a.length).map(_escapeRe).join("|")})\\b`, "gi")
      : null;
    _poolAnimalReCache.set(pool, re);
    return re;
  }

  /* 情景对话：只给 A 问句加一处关键词提示；已有动物图片时提示动作词，不再重复提示动物名称 */
  function markDialogWords(dlg, task, pool) {
    const ask = String(dlg.ask || "");
    if (!ask) return;
    const wrap = (match) => `<span class="ref-dialog-word">${match}</span>`;
    const tryPattern = (re) => {
      if (!re) return false;
      re.lastIndex = 0;
      if (!re.test(ask)) return false;
      re.lastIndex = 0;
      dlg.ask = ask.replace(re, wrap);
      return true;
    };
    /* 1. 已有动物图片：提示 like、eat、look、see 等动作词 */
    if (dlg.askImg) {
      tryPattern(/\b(eat|eats|eating|ate|like|likes|look|see|know|tell)\b/gi);
      return;
    }
    /* 2. 无动物图片：提示句中的动物单词（按 pool 缓存正则，避免重复编译） */
    if (tryPattern(_animalReForPool(pool))) return;
    if (task.word && task.animal && task.word.length >= 2) {
      if (tryPattern(new RegExp(`\\b${_escapeRe(task.word)}\\b`, "gi"))) return;
    }
    /* 3. 按食物选动物时，提示句中的食物单词 */
    const food = task.food && task.food.en;
    if (food && food.length >= 2) {
      if (tryPattern(new RegExp(`\\b${_escapeRe(food)}\\b`, "gi"))) return;
    }
    /* 4. 通用问句：提示 animal */
    tryPattern(/\banimals?\b/gi);
  }

  /* 看图选词 */
  function renderPic({ q, choiceButton, options }) {
    return {
      body: `<div class="ref-pic-wrap">
                <div class="ref-picture-frame">
                  <div class="ref-picture-art">${wordHeroArt(q)}</div>
                  ${listenPill()}
                </div>
                <p class="ref-hint">${q.picHint || (currentTheme() && currentTheme().picHint) || "猜猜这是什么动物"}</p>
                <div class="options ref-pic-options">${options(q.options)}</div>
              </div>`,
      btn: choiceButton("选一个答案"),
    };
  }

  /* 听音戳泡泡：在原展示框内浮动，保留纸面与底部托盘 */
  function renderListen({ q, quiz, artOf }) {
    const revealed = quiz.revealed;
    const selected = quiz.selected;
    const positions = q.options.length === 2
      ? [
          { x: "29%", y: "63%", dx: "0.35rem", dy: "-0.5rem", duration: 7.4, delay: -1.6 },
          { x: "71%", y: "62%", dx: "-0.35rem", dy: "0.45rem", duration: 8.2, delay: -3.2 },
        ]
      : [
          { x: "19%", y: "62%", dx: "0.35rem", dy: "-0.45rem", duration: 7.2, delay: -1.4 },
          { x: "50%", y: "68%", dx: "-0.3rem", dy: "-0.55rem", duration: 8.4, delay: -3.1 },
          { x: "81%", y: "58%", dx: "-0.4rem", dy: "0.45rem", duration: 7.8, delay: -2.2 },
        ];
    const bubbles = q.options.map((opt, i) => {
      const p = positions[i] || positions[0];
      const isCorrect = revealed && opt === q.word;
      const isWrong = revealed && opt === selected && opt !== q.word;
      const cls = ["listen-bubble"]
        .concat(isCorrect ? ["ok"] : [])
        .concat(isWrong ? ["wrong"] : [])
        .join(" ");
      return `<button type="button" class="${cls}" style="--bubble-x:${p.x};--bubble-y:${p.y};--bubble-dx:${p.dx};--bubble-dy:${p.dy};--bubble-duration:${p.duration}s;--bubble-delay:${p.delay}s"
              data-action="select" data-word="${opt}" aria-label="戳破 ${opt} 泡泡"${revealed ? " disabled" : ""}>
              <span class="listen-bubble-art">${wordArtImg((q.optionImgs && q.optionImgs[opt]) || `images/words/animal/${opt}.webp`, "listen-card-img", (q.optionEmojis && q.optionEmojis[opt]) || artOf(opt)(), "listen-card-emoji")}</span>
              ${isCorrect ? `<i class="ref-listen-mark">✓</i>` : ""}
              ${isWrong ? `<i class="ref-listen-mark bad">✕</i>` : ""}
            </button>`;
    }).join("");
    return {
      body: `<div class="ref-listen-wrap listen-bubble-wrap">
                <div class="ref-listen-speaker listen-bubble-stage${revealed ? " is-revealed" : ""}" data-count="${q.options.length}">
                  <button type="button" class="listen-bubble-replay" data-action="speak-word" data-word="${q.word}" aria-label="再听一遍">
                    ${I.speaker(18, "#5C411D")}<span>点我，再听一遍</span>
                  </button>
                  ${bubbles}
                </div>
                <div class="ref-listen-grid listen-bubble-hint"><span>听单词，戳破正确的图片泡泡</span></div>
              </div>`,
      btn: quiz.revealed ? quizNextButton() : "",
    };
  }

  /* 单词连线：普通 3 组、启蒙 2 组，按概率掺入动物爱吃的食物 */
  function buildMatch(task, pool) {
    const pairTotal = optionCount();
    const trioPool = pool.filter((x) => !task.category || x.category === task.category);
    /* 歧义过滤：同义/易混词不能同时出现在连线里（如 sleep 与 nap 都画着睡觉） */
    const picked = [];
    for (const cand of shuffle(trioPool)) {
      if (picked.length >= pairTotal) break;
      if (picked.every((p) => !isAmbiguous(p, cand))) picked.push(cand);
    }
    /* 极端兜底：同类词过滤后数量不足，放开类别限制补齐 */
    if (picked.length < pairTotal) {
      for (const cand of shuffle(pool)) {
        if (picked.length >= pairTotal) break;
        if (picked.every((p) => p.word !== cand.word && !isAmbiguous(p, cand))) picked.push(cand);
      }
    }

    /* 英文单词既可以是动物名词，也可以是动物爱吃的水果/食物：
       保证至少 1 只动物，最多混入 2 个食物（食物取自动物自身的 food 数据） */
    const foods = [];
    const seen = new Set();
    picked.forEach((a) => {
      const f = a.food;
      if (!f || !f.en || seen.has(f.en) || picked.some((x) => x.word === f.en)) return;
      seen.add(f.en);
      const meta = pool.find((x) => x.word === f.en) || {};
      foods.push({ word: f.en, art: () => f.emoji, img: f.img || "", zh: f.zh || "", phon: f.phon || meta.phon || "" });
    });
    const foodCount = Math.min(foods.length, picked.length - 1, Math.random() < 0.35 ? 2 : 1);
    const pairs = picked.slice(0, picked.length - foodCount)
      .map((x) => ({ word: x.word, art: x.art, img: x.img || "", zh: x.zh || "", phon: x.phon || "" }))
      .concat(shuffle(foods).slice(0, foodCount));

    /* 固定版式：左列单词、右列图片，各自打乱顺序 */
    task.pairs = pairs;
    task.leftItems = shuffle(pairs.map((p) => ({ kind: "word", word: p.word })));
    task.rightItems = shuffle(pairs.map((p) => ({ kind: "art", word: p.word, art: p.art, img: p.img || "" })));
  }

  function renderMatch({ q, quiz }) {
    const solved = new Set(quiz.matched || []);
    const wrongPairs = quiz.wrongPairs || [];
    const wrongArts = new Set(wrongPairs.map((p) => p.art));
    const wrongWords = new Set(wrongPairs.map((p) => p.word));
    /* 选中一侧后，另一侧整列呼吸高亮，提示可以点 */
    const pickedSide = quiz.pickWord && quiz.pickWordSide ? quiz.pickWordSide : "";
    const rowHtml = (item, side) => {
      const word = item.word;
      const isDone = solved.has(word);
      const isWrong = side === "word" ? wrongWords.has(word) : wrongArts.has(word);
      const mark = isDone ? "<i class='ref-listen-mark'>✓</i>" : isWrong ? "<i class='ref-listen-mark bad'>✕</i>" : "";
      const breath = pickedSide && pickedSide !== side && !isDone && !isWrong ? " breath" : "";
      const cls = `ref-match-row ref-match-row-${side}${isDone ? " done" : ""}${isWrong ? " wrong" : ""}${breath}`;
      const body = side === "word"
        ? `<div class="ref-match-word-card">${word}${mark}</div>
           <button type="button" class="ref-match-speaker" data-match-speaker data-word="${word}" aria-label="朗读 ${word}">${I.speaker(20, "#B4811C")}</button>`
        : `<div class="ref-match-art-card">${artWithImage(item.img, "ref-match-img", item.art())}${mark}</div>`;
      return `<div class="${cls}" data-match-row data-word="${word}" data-match-side="${side}">${body}</div>`;
    };
    const leftCol = (q.leftItems || []).map((item) => rowHtml(item, "word")).join("");
    const rightCol = (q.rightItems || []).map((item) => rowHtml(item, "art")).join("");
    return {
      body: `<div class="ref-match-wrap">
                <div class="ref-match-area" data-match-area>
                  <div class="ref-match-col ref-match-col-left">${leftCol}</div>
                  <div class="ref-match-col ref-match-col-right">${rightCol}</div>
                </div>
              </div>`,
      btn: quiz.revealed ? quizNextButton() : "",
    };
  }

  /* 配对判定：点两次完成配对，无连线视觉 */
  function resolveMatch(pickSide, pickWord, side, word) {
    const q = quiz.order[quiz.index];
    const wordPart = pickSide === "word" ? pickWord : word;
    const artPart = pickSide === "art" ? pickWord : word;
    const wrongPairs = quiz.wrongPairs || (quiz.wrongPairs = []);
    /* 构造错题库 wordId（match 题型的 q.pairs 里没有 wrongWordId） */
    const sceneId = (state && state.scene) || "";
    const makeWid = (w) => (window.WrongBank ? WrongBank.makeId(sceneId, w) : null);
    quiz.pickWord = null;
    quiz.pickWordSide = null;

    if (wordPart === artPart) {
      quiz.matched.push(wordPart);
      sfx("correct");
      /* 🦁 动物园：配对成功 → 尝试清除错题库 */
      if (quiz.mode !== "daily" && window.isZooScene && isZooScene() && makeWid(wordPart)) WrongBank.recordCorrect(makeWid(wordPart));
    } else {
      quiz.matchWrong++;
      wrongPairs.push({ art: artPart, word: wordPart });
      sfx("wrong");
      /* 🦁 动物园：配对失败 → 自动收录错题库 */
      if (quiz.mode !== "daily" && window.isZooScene && isZooScene() && makeWid(wordPart)) WrongBank.recordWrong(makeWid(wordPart));
    }

    /* 三组全部配完（含配错）后统一判题 */
    if (quiz.matched.length + wrongPairs.length >= q.pairs.length) {
      const allOk = wrongPairs.length === 0;
      if (typeof finalizeTask === "function") {
        finalizeTask(q, allOk, {
          words: q.pairs.map((p) => p.word),
          wrongBank: false,
          wrongSfx: null,
        });
        return;
      }
      quiz.revealed = true;
      quiz.choiceCorrect = allOk;
    }
    render();
  }

  /* 情景对话 */
  function buildDialog(task, pool) {
    /* 模板库：按题目来源主题 / 场景收紧对话内容，每日混抽时使用原主题句式 */
    const dlg = window.DialogTemplates
      ? window.DialogTemplates.build(task, pool, { themeId: task.themeId || currentTheme().id, sceneId: task.sceneId || state.scene })
      : null;
    if (dlg) {
      /* 动物园场景：为 A / B 随机安排对话角色（动物、小朋友、饲养员） */
      dlg.cast = window.DialogTemplates.buildCast
        ? window.DialogTemplates.buildCast(task, pool, dlg)
        : null;
      markDialogWords(dlg, task, pool);
      task.dialog = dlg;
      task.answerValue = dlg.answerValue;
      task.answerText = dlg.answerText;
      task.answerZh = dlg.answerZh || "";
      if (dlg.mode === "word") task.options = dlg.options.map((o) => o.value);
      return;
    }
    /* 兜底：改用单句问答 */
    threeChoiceBuild(task, pool);
  }

  function renderDialog({ q, quiz, choiceButton, options, artOf }) {
    const revealed = quiz.revealed;
    const selected = quiz.selected;
    const d = q.dialog;
    const escAttr = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    /* 整句选项的关键词高亮：跳过虚词，突出 Yes/No 与食物、动物等实词 */
    const KEY_STOP = new Set([
      "yes", "no", "it", "is", "a", "an", "the", "does", "doesnt", "isnt", "dont",
      "do", "eats", "eat", "i", "you", "we", "they", "this", "that", "are", "am",
      "not", "of", "on", "in", "my", "your",
    ]);
    const highlightKeys = (label) => String(label).replace(/[A-Za-z']+/g, (token) => {
      const plain = token.toLowerCase().replace(/'/g, "");
      return KEY_STOP.has(plain) ? token : `<span class="dlg-key">${token}</span>`;
    });
    /* 答后勾叉 */
    const optionState = (value) => {
      const ok = value === d.answerValue;
      if (revealed) return ok ? "correct" : (value === selected ? "wrong" : "dim");
      return value === selected ? "sel" : "";
    };
    const markOf = (value) => {
      if (!revealed) {
        return value === selected ? `<span class="mark radio"><i></i></span>` : "";
      }
      if (value === d.answerValue) return `<span class="mark">${I.check(11)}</span>`;
      if (value === selected) return `<span class="mark bad">${I.close(12, "#fff")}</span>`;
      return "";
    };
    const askPic = d && d.askImg
      ? `<span class="ref-dialog-pic">${artWithImage(q.img, "ref-dialog-img", q.art())}</span>`
      : "";
    /* 出场角色：动物朋友 / 小朋友 / 饲养员，未配置时回退到 A、B 小朋友 */
    const cast = d && d.cast;
    const personArt = (p) => {
      if (p && p.type === "animal") {
        /* 角色头像用内置纯 SVG，不加载单词素材图片 */
        return QuizUiArt.zooAnimal(p.word) || QuizUiArt.child("boy");
      }
      if (p && p.type === "keeper") return QuizUiArt.zookeeper();
      const gender = p && p.gender === "girl" ? "girl" : "boy";
      return QuizUiArt.child(gender);
    };
    const person = (p, fallbackGender) => {
      const kind = p ? p.type : "child";
      return `<div class="ref-dialog-person person--${kind}">${personArt(p || { type: "child", gender: fallbackGender })}</div>`;
    };
    const nameTag = (p, fallback) => `<span class="ref-dialog-name">${p ? p.name : fallback}</span>`;
    const zooDeco = window.isZooScene && isZooScene()
      ? `<div class="ref-dialog-zoo" aria-hidden="true">
                <svg class="zd-vine" viewBox="0 0 120 92">
                  <path d="M8 88Q34 46 112 10" fill="none" stroke="#3F7E4A" stroke-width="3" stroke-linecap="round"/>
                  <path d="M38 62C22 52 26 28 44 30C52 44 50 56 38 62Z" fill="#8FD07A" stroke="#3F7E4A" stroke-width="2.5" stroke-linejoin="round"/>
                  <path d="M64 42C70 22 92 20 98 34C90 48 76 50 64 42Z" fill="#B6E39A" stroke="#3F7E4A" stroke-width="2.5" stroke-linejoin="round"/>
                  <path d="M86 24C92 10 112 12 114 24C106 34 94 32 86 24Z" fill="#8FD07A" stroke="#3F7E4A" stroke-width="2.5" stroke-linejoin="round"/>
                </svg>
                <svg class="zd-paws" viewBox="0 0 92 50">
                  <g fill="#C79A54" opacity=".45">
                    <g transform="translate(6 16) rotate(-14)">
                      <ellipse cx="14" cy="20" rx="8" ry="7"/>
                      <circle cx="5" cy="9" r="3.2"/><circle cx="12" cy="6" r="3.2"/><circle cx="19" cy="7" r="3.5"/><circle cx="25" cy="12" r="2.8"/>
                    </g>
                    <g transform="translate(48 2) rotate(12)">
                      <ellipse cx="14" cy="20" rx="7" ry="6"/>
                      <circle cx="6" cy="10" r="2.8"/><circle cx="12" cy="7.5" r="2.8"/><circle cx="18" cy="8" r="3"/><circle cx="23" cy="12" r="2.4"/>
                    </g>
                  </g>
                </svg>
                <svg class="zd-grass" viewBox="0 0 74 36">
                  <g fill="none" stroke="#5FA05A" stroke-width="3" stroke-linecap="round">
                    <path d="M10 34Q8 20 2 14"/><path d="M21 34Q21 16 21 7"/>
                    <path d="M32 34Q34 18 42 12"/><path d="M43 34Q47 24 55 20"/>
                  </g>
                </svg>
              </div>`
      : "";
    let askText = q.dlgQ;
    let replyHtml = "";
    if (d) {
      askText = d.ask;
      if (d.replyMode === "sentence") {
        const reply = revealed ? d.answerText : (selected || "＿＿＿");
        replyHtml = `<p class="ref-dialog-reply${revealed ? "" : " pending"}">${reply}</p>`;
      } else {
        replyHtml = `<p>${d.reply.replace("___", `<b class="blank">${revealed ? d.answerValue : "＿＿"}</b>`)}</p>`;
      }
    } else {
      askText = q.dlgQ.replace("{word}", q.word);
      replyHtml = `<p>${q.dlgA.replace("{word}", `<b class="blank">${revealed ? q.word : "＿＿"}</b>`)}</p>`;
    }
    /* 点击 A 的对话气泡直接朗读提问句（去掉高亮标签，避免读出 HTML） */
    const askSoundText = askText.replace(/<[^>]*>/g, "");
    let optionHtml;
    if (!d) {
      optionHtml = `<div class="options one-col ref-dialog-options">${options(q.options)}</div>`;
    } else if (d.mode === "sentence") {
      optionHtml = `<div class="options one-col ref-dialog-options ref-dialog-sentences">${d.options.map((o) => {
        const state = optionState(o.value);
        return `<button class="option${state ? " " + state : ""}" data-action="select" data-word="${escAttr(o.value)}">
                <span class="dlg-sentence">${highlightKeys(o.label)}</span>${markOf(o.value)}
              </button>`;
      }).join("")}</div>`;
    } else if (d.mode === "image") {
      optionHtml = `<div class="ref-dialog-image-grid">${d.options.map((o) => {
        const state = optionState(o.value);
        const cardState = state === "correct" ? "ok" : (state === "wrong" ? "wrong" : (state === "sel" ? "sel" : ""));
        const art = wordArtImg(o.img, "listen-card-img", artOf(o.value)(), "listen-card-emoji");
        return `<button class="ref-listen-card${cardState ? " " + cardState : ""}" data-action="select" data-word="${escAttr(o.value)}" aria-label="选择 ${o.value}">
                <span class="ref-listen-card-art">${art}</span>
                ${revealed && o.value === d.answerValue ? `<i class="ref-listen-mark">✓</i>` : ""}
                ${revealed && o.value === selected && o.value !== d.answerValue ? `<i class="ref-listen-mark bad">✕</i>` : ""}
              </button>`;
      }).join("")}</div>`;
    } else {
      optionHtml = `<div class="options one-col ref-dialog-options">${options(q.options)}</div>`;
    }
    return {
      body: `<div class="ref-dialog-card">
                ${zooDeco}
                <div class="ref-dialog-row">${person(cast && cast.ask, "boy")}
                  <div class="ref-dialog-bubble ref-dialog-ask" data-action="speak-text" data-text="${escAttr(askSoundText)}" aria-label="点击朗读 A 的句子">${nameTag(cast && cast.ask, "A")}<p>${askText}</p>${askPic}</div></div>
                <div class="ref-dialog-row reply"><div class="ref-dialog-bubble">${nameTag(cast && cast.reply, "B")}${replyHtml}</div>
                  ${person(cast && cast.reply, "girl")}</div>
              </div>
              ${optionHtml}`,
      btn: choiceButton("选一个答案"),
    };
  }

  /* 词汇拼图：按词长随机留 1~3 个空槽，连续缺失字母可合并成整块 */
  function buildWordPuzzle(task) {
    const letters = task.word.toUpperCase().split("");
    const blankCount = Math.min(letters.length, 1 + Math.floor(Math.random() * 3));
    const blankIdx = new Set(
      shuffle(letters.map((_, i) => i)).slice(0, blankCount)
    );
    const hinted = new Set(letters.map((_, i) => i).filter((i) => !blankIdx.has(i)));
    const missing = letters.map((ch, i) => ({ ch, i })).filter((m) => !hinted.has(m.i));

    /* 连续缺失字母分段，段内相邻字母才能合并成一块（提示字母把词隔断） */
    const runs = [];
    for (const m of missing) {
      const last = runs[runs.length - 1];
      if (last && last[last.length - 1].i + 1 === m.i) last.push(m);
      else runs.push([m]);
    }
    const blocks = runs.map((run) => run.map((m) => ({ ch: m.ch, positions: [m.i] })));
    let slotCount = blocks.reduce((n, run) => n + run.length, 0);
    while (slotCount > 5) {
      const pairs = [];
      blocks.forEach((run) => {
        for (let i = 0; i < run.length - 1; i++) pairs.push([run, i]);
      });
      if (!pairs.length) break;
      const [run, i] = pairs[Math.floor(Math.random() * pairs.length)];
      run[i] = { ch: run[i].ch + run[i + 1].ch, positions: run[i].positions.concat(run[i + 1].positions) };
      run.splice(i + 1, 1);
      slotCount -= 1;
    }

    const posToSlot = new Map();
    const chunks = [];
    let slotId = 0;
    blocks.forEach((run) => {
      run.forEach((b) => {
        b.positions.forEach((p) => posToSlot.set(p, slotId));
        chunks.push({ ch: b.ch, id: slotId });
        slotId += 1;
      });
    });
    /* 展示行：提示字母单独成格，合并拼块只占一格 */
    const cells = [];
    letters.forEach((ch, i) => {
      if (hinted.has(i)) {
        cells.push({ hint: ch });
        return;
      }
      const id = posToSlot.get(i);
      const prev = cells[cells.length - 1];
      if (!prev || prev.slot !== id) cells.push({ slot: id });
    });
    task.puzzleCells = cells;
    const origOrder = chunks.map((c) => c.ch).join("");
    const hasDistinct = new Set(chunks.map((c) => c.ch)).size > 1;
    let shuffled = shuffle(chunks);
    let guard = 0;
    while (hasDistinct && shuffled.map((c) => c.ch).join("") === origOrder && guard++ < 10) {
      shuffled = shuffle(chunks);
    }
    task.puzzleLetters = shuffled.map((c) => ({ ch: c.ch, id: c.id, placed: false }));
    task.puzzleSlots = chunks.map((c) => ({ id: c.id, filled: null }));
  }

  function renderWordPuzzle({ q, quiz, artOf }) {
    const revealed = quiz.revealed;
    const lettersById = new Map(q.puzzleLetters.map((l) => [l.id, l]));
    const slotsById = new Map(q.puzzleSlots.map((s) => [s.id, s]));
    const slotsHtml = q.puzzleCells.map((cell) => {
      if (cell.hint) return `<div class="pz-slot hint">${cell.hint}</div>`;
      const s = slotsById.get(cell.slot);
      const letter = s.filled !== null ? lettersById.get(s.filled) : null;
      return `<div class="pz-slot ${letter ? "filled" : ""}" data-slot="${s.id}">${letter ? letter.ch : ""}</div>`;
    }).join("");
    const filledSet = new Set(q.puzzleSlots.map((s) => s.filled));
    const lettersHtml = q.puzzleLetters.map((l) => {
      const used = filledSet.has(l.id);
      return `<button type="button" class="pz-letter ${used ? "used" : ""}" data-action="pz-letter" data-drag="puzzle" data-letter="${l.id}" ${used ? "disabled" : ""}>${l.ch}</button>`;
    }).join("");
    const allFilled = q.puzzleSlots.every((s) => s.filled !== null);
    const body = `
            <div class="pz-wrap ref-puzzle-wrap">
              <div class="pz-hint ref-puzzle-hint">
                <div class="pz-art">${wordHeroArt(q)}</div>
              </div>
              <div class="pz-slots">${slotsHtml}</div>
              <div class="pz-letters">${lettersHtml}</div>
              ${!revealed
                ? `<button type="button" class="btn pz-check" data-action="pz-check" ${allFilled ? "" : "disabled"}>检查答案 ${I.arrow(16)}</button>`
                : `<span class="pz-check-spacer" aria-hidden="true"></span>`}
            </div>`;
    return { body, btn: revealed ? quizNextButton() : "" };
  }

  /* 动物喂食：干扰项按食性隔离，避免出现孩子以为正确的食物 */
  function buildFeedAnimal(task, pool) {
    /* 动物乐园：直接使用数据层挂载的 food 映射，选项即真实食物图 */
    const unique = [];
    const seenFood = new Set();
    pool.forEach((w) => {
      if (!w.food || seenFood.has(w.food.id)) return;
      seenFood.add(w.food.id);
      unique.push(w.food);
    });
    const need = optionCount();
    if (task.food && unique.length >= need) {
      const correct = task.food;
      /* 食性安全：食肉动物只配植物干扰项，食草动物只配动物性干扰项 */
      const FOOD_CLASS = { meat: "animal", fish: "animal", bone: "animal", worm: "animal", milk: "animal", shrimp: "animal", shellfish: "animal", plankton: "animal" };
      const foodClass = (id) => FOOD_CLASS[id] || "plant";
      let safe = unique.filter((f) => f.id !== correct.id);
      if (task.diet === "carnivore") safe = safe.filter((f) => foodClass(f.id) === "plant");
      /* 食草动物：牛奶（奶牛产奶）和虫子（猴/松鼠也吃）都可能被孩子当成正确答案，排除 */
      else if (task.diet === "herbivore") safe = safe.filter((f) => foodClass(f.id) === "animal" && f.id !== "milk" && f.id !== "worm");
      const rest = shuffle(safe.length >= need - 1 ? safe : unique.filter((f) => f.id !== correct.id)).slice(0, need - 1);
      task.foods = shuffle([correct, ...rest]);
      task.correctFood = correct.id;
      task.correctZh = correct.zh || "";
      task.correctPhon = correct.phon || "";
      return;
    }
    /* 其他主题沿用原有 emoji 食物池 */
    const foodPool = pool.filter((w) => w.category === "food" || ["banana", "meat", "grass", "honey", "bamboo"].includes(w.word));
    const foods = foodPool.slice(0, need).map((w) => ({ word: w.word, emoji: w.emoji || "🍎", zh: w.zh || "", phon: w.phon || "" }));
    if (foods.length < need) {
      /* 兜底：用不重复的基础食物补足选项数 */
      const seen = new Set(foods.map((f) => f.word));
      const fallback = [
        { word: "meat", emoji: "🥩", zh: "肉", phon: "/miːt/" },
        { word: "banana", emoji: "🍌", zh: "香蕉", phon: "/bəˈnɑːnə/" },
        { word: "bamboo", emoji: "🎋", zh: "竹子", phon: "/bæmˈbuː/" },
      ];
      for (const f of fallback) {
        if (foods.length >= need) break;
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
    task.correctPhon = (task.foods.find((f) => f.word === task.correctFood) || {}).phon || "";
  }

  function renderFeedAnimal({ q, quiz, artOf }) {
    const revealed = quiz.revealed;
    const foods = q.foods.map((f) => {
      const id = f.id || f.word;
      const art = f.img ? artWithImage(f.img, "ref-food-img", f.emoji || "🍎") : (f.emoji || artOf(id)());
      /* 所有模式均使用纯图片选项，不显示英文名 */
      return `<button type="button" class="fd-food ${revealed && id === q.correctFood ? "correct" : ""} ${quiz.selected === id ? "selected" : ""}"
              data-action="fd-pick" data-drag="food" data-food="${id}"><span class="ref-food-art">${art}</span></button>`;
    }).join("");
    const body = `
            <div class="fd-wrap ref-feed-wrap">
              <div class="fd-animal ref-feed-animal" data-feed-drop>
                <div class="fd-art">${artWithImage(q.img, "fd-animal-img", artOf(q.word)())}</div>
                <div class="fd-name">${q.word.toUpperCase()}</div>
              </div>
              <p class="ref-hint">${q.zh} 爱吃什么？拖到嘴边或点选食物</p>
              <div class="fd-foods">${foods}</div>
            </div>`;
    return { body, btn: revealed ? quizNextButton() : "" };
  }

  /* 动作猜猜：舞台、提示与文字选项 */
  function renderAction({ q, quiz, options }) {
    const motion = q.motion || "run";
    const actionSrc = q.img || `images/words/action/${q.assetKey}.webp`;
    return advancedLayout({
      wrap: "ref-action-wrap",
      stage: `<div class="ref-action-stage">
                  <span class="ref-action-sun" aria-hidden="true"></span>
                  <span class="ref-action-cloud c1" aria-hidden="true"></span>
                  <span class="ref-action-cloud c2" aria-hidden="true"></span>
                  <span class="ref-action-ground" aria-hidden="true"></span>
                  <span class="ref-action-animal act-${motion}" aria-hidden="true"><span class="ref-action-emoji">${q.actor || q.emoji || "🐾"}</span></span>
                  <img class="ref-action-img" src="${actionSrc}" alt=""
                    onload="this.parentElement.classList.add('has-art')"
                    onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src=this.src.replace(/\\.webp$/,'.png')}else{this.remove()}">
                  <span class="ref-action-spark s1" aria-hidden="true">✦</span>
                  <span class="ref-action-spark s2" aria-hidden="true">✦</span>
                  <button type="button" class="ref-action-sound" data-action="action-sound" data-sound="${q.actionSound || ""}"
                    aria-label="${q.actionSound ? "听一听动作声音提示" : "该动作暂无声音提示"}" aria-pressed="false" ${q.actionSound ? "" : 'aria-disabled="true"'}>
                    <span>听一听提示</span><span class="ref-action-sound-icon" aria-hidden="true">${I.speaker(19)}</span>
                  </button>
                </div>`,
      tipClass: "ref-action-tip",
      tip: "动物在干什么？",
      optionsClass: "ref-action-options",
      options: options(q.options),
      btn: quiz.revealed ? quizNextButton() : "",
    });
  }

  function defaultGames() {
    return {
      pic: {
        label: "看图选词",
        title: "看图，选出正确的单词",
        prompt: "What is this animal?",
        pageClass: "pic-page",
        build: threeChoiceBuild,
        render: renderPic,
      },
      listen: {
        label: "听音戳泡泡",
        title: "听单词，戳破正确的泡泡",
        prompt: "Listen and pop the right bubble!",
        autoSpeak: true,
        build: threeChoiceBuild,
        render: renderListen,
      },
      match: {
        label: "单词连线",
        title: "把单词和图片连起来",
        prompt: "Match the words with the pictures.",
        build: buildMatch,
        render: renderMatch,
        onSelect(side, word) {
          if (!quiz || quiz.revealed) return;
          const matched = quiz.matched || [];
          const wrongPairs = quiz.wrongPairs || [];
          /* 已配对 / 已配错的框不再响应 */
          if (matched.includes(word) || wrongPairs.some((p) => p.art === word || p.word === word)) return;
          /* 另一侧已有选中项：本次点击完成配对 */
          if (quiz.pickWord && quiz.pickWordSide && quiz.pickWordSide !== side) {
            resolveMatch(quiz.pickWordSide, quiz.pickWord, side, word);
            return;
          }
          quiz.pickWord = word;
          quiz.pickWordSide = side;
          sfx("tap");
          render();
        },
      },
      dialog: {
        label: "情景对话",
        title: "读对话，选出正确的答案",
        build: buildDialog,
        render: renderDialog,
      },
      /* 🧩 词汇拼图 Word Puzzle（纯 DOM 拖拽排序） */
      word_puzzle: {
        label: "词汇拼图",
        title: "拖动字母块，拼出单词！",
        prompt: "Spell the word with the letters.",
        build: buildWordPuzzle,
        render: renderWordPuzzle,
      },
      /* 🍎 动物喂食 Feed the Animal（emoji 拖拽 + 选卡） */
      feed_animal: {
        label: "动物喂食",
        title: "给动物喂它爱吃的食物！",
        prompt: "What does this animal like to eat?",
        build: buildFeedAnimal,
        render: renderFeedAnimal,
      },
      /* 🏃 动作猜猜 Action（进阶题：中央动态动物 + 纯文字选项） */
      action: {
        label: "动作猜猜",
        title: "看动作，选出正确的单词",
        prompt: "What is the animal doing?",
        build: threeChoiceBuild,
        render: renderAction,
      },
      /* 🌿 草丛捉迷藏（剪影寻宝） */
      hide_seek: {
        label: "草丛寻宝",
        title: "听声音，点草丛找朋友！",
        prompt: "Where is the animal? Find it!",
        autoSpeak: true,
        build(task, pool) {
          const cnt = enlightenOn() ? 2 : toddlerDeviceConfig().bushCount;
          buildOptions(task, pool, cnt);
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const bushes = (q.options || []).map((opt) => {
            const isOk = revealed && opt === q.word;
            const src = (q.optionImgs && q.optionImgs[opt]) || `images/words/animal/${opt}.webp`;
            return `<button type="button" class="td-bush${isOk ? " opened" : ""}"
              data-action="select" data-word="${opt}"${revealed ? " disabled" : ""} aria-label="翻开草丛">
              <img src="${src}" alt="" onerror="wordArtFallback(this)">
              <span style="display:none;font-size:3rem">${(q.optionEmojis && q.optionEmojis[opt]) || artOf(opt)()}</span>
              <span class="td-bush-leaf" aria-hidden="true"></span>
            </button>`;
          }).join("");
          return {
            body: `<div class="td-stage">
              <button type="button" class="td-voice-bar" data-action="speak-word" data-word="Where is the ${q.word}? ${q.word}!">${I.speaker(18, "#B4811C")}<span>点我再听一遍</span></button>
              <div class="td-bushes" style="--cols:${(q.options || []).length}">${bushes}</div>
            </div>`,
            btn: revealed ? quizNextButton() : "",
          };
        },
      },
      /* ⚖️ 听指令比大小/高矮（使用 adj.compare，零文字选项） */
      voice_compare: {
        label: "听音比大小",
        title: "听一听，点出正确的动物！",
        prompt: "Listen and touch the right one!",
        autoSpeak: true,
        build(task) {
          const c = task.compare || { a: { emoji: "🐘", scale: 1.3 }, b: { emoji: "🐭", scale: 0.65 }, target: "a" };
          task.vcmp = c;
          task.answerValue = c.target === "b" ? "b" : "a";
        },
        render({ q, quiz }) {
          const c = q.vcmp || q.compare || { a: { emoji: "🐘", scale: 1.3 }, b: { emoji: "🐭", scale: 0.65 }, target: "a" };
          const revealed = quiz.revealed;
          const card = (side, item) => {
            const isOk = revealed && side === q.answerValue;
            return `<button type="button" class="td-vcmp-card${isOk ? " ok" : ""}"
              data-action="select" data-word="${side}"${revealed ? " disabled" : ""} aria-label="选择动物 ${side}">
              <span class="td-vcmp-emoji" style="--s:${item.scale || 1}">${item.emoji || "🐾"}</span>
              ${item.badge ? `<span style="font-size:1.75rem">${item.badge}</span>` : ""}
            </button>`;
          };
          return {
            body: `<div class="td-stage">
              <button type="button" class="td-voice-bar" data-action="speak-word" data-word="Touch the ${q.word} one! ${q.word}!">${I.speaker(18, "#B4811C")}<span>听指令：哪一个是「${q.zh}」？</span></button>
              <div class="td-vcmp-grid">${card("a", c.a || {})}${card("b", c.b || {})}</div>
            </div>`,
            btn: revealed ? quizNextButton() : "",
          };
        },
      },
    };
  }

  /* 只读缓存：供高频查题型复用，避免每次调用 defaultGames() 重建 9 套闭包对象 */
  let _defaultGamesCache = null;
  function getDefaultGame(type) {
    if (!_defaultGamesCache) _defaultGamesCache = defaultGames();
    return _defaultGamesCache[type];
  }

  /* ============================================================
     每日随机挑战：跨主题混抽词汇，从共用全题型池随机抽取适配题型
     ============================================================ */
  function dailyWordPool(theme, types) {
    const scenes = (theme.scenes || []).filter((s) => s.playable !== false && (s.words || []).length);
    const list = scenes.length ? scenes.flatMap((s) => s.words) : (theme.words || []);
    return list.filter((w) => {
      if (!w || !w.word) return false;
      return types.some((type) => {
        const rule = RULE_BY_KEY[type];
        return rule && fitsRule(w, rule);
      });
    });
  }
  function buildDailyTasks(size) {
    const count = Math.max(1, Number(size) || 10);
    const types = typesForMode(IMPLEMENTED_TYPES);
    /* 未开放主题（上学了 / 去旅行）只要有适配词表也参与混抽 */
    const themes = (window.DINO_WORD_SETS || []).filter(
      (t) => t && t.isTheme && dailyWordPool(t, types).length
    );
    if (!themes.length) return [];
    const pools = new Map(themes.map((t) => [t.id, dailyWordPool(t, types)]));
    const wordMaps = new Map(themes.map((t) => [t.id, new Map(pools.get(t.id).map((w) => [w.word, w]))]));
    const used = new Set();
    const usedTypes = new Set();
    const picked = [];
    /* 先每个主题各抽 1 个，保证跨主题；不足再从全局补抽 */
    const themeQueue = shuffle(themes);
    while (themeQueue.length && picked.length < count) {
      const theme = themeQueue.pop();
      const pool = pools.get(theme.id).filter((w) => !used.has(w.word));
      const w = shuffle(pool)[0];
      if (w) { used.add(w.word); picked.push({ theme, w }); }
    }
    const rest = shuffle(
      themes.flatMap((theme) => pools.get(theme.id).filter((w) => !used.has(w.word)).map((w) => ({ theme, w })))
    );
    while (picked.length < count && rest.length) {
      const item = rest.pop();
      if (used.has(item.w.word)) continue;
      used.add(item.w.word);
      picked.push(item);
    }
    return picked.map(({ theme, w }) => {
      const pool = pools.get(theme.id) || [];
      const wordMap = wordMaps.get(theme.id);
      const compatible = types.filter((type) => fitsRule(w, RULE_BY_KEY[type]));
      const type = pickType(compatible, usedTypes);
      usedTypes.add(type);
      const rule = RULE_BY_KEY[type];
      const task = toTask(
        { gameType: type, recordWrong: rule.recordWrong, targetWord: w },
        pool,
        theme.dialog || { q: "What's this?", a: "It's a {word}." },
        theme.id,
        pool,
        theme,
        wordMap
      );
      return attachOptionArt(task, pool, wordMap);
    });
  }

  window.DynamicEngine = {
    GAME_RULES,
    CATEGORIES,
    NORMAL_MIX,
    quizSize,
    /* 题型实现（唯一来源，主题注册时取用） */
    defaultGames,
    getDefaultGame,
    defaultLevelGames,
    buildTasks,
    buildDailyTasks,

    /* level 为全局 1~50 关卡号；pool 为当前场景词池 */
    generateSession(sceneWords, stopWords, sceneId, level) {
      const pool = sceneWords && sceneWords.length ? sceneWords : (stopWords || themeWords());
      return buildSession(level, pool, sceneId || state.scene || "zoo");
    },
  };
})();
