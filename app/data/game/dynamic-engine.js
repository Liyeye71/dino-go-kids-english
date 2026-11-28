/* ============================================================
   DynamicEngine · 动物乐园题库引擎 + 全主题题型实现
   - 本文件是题型的唯一实现来源：新增 / 调整题型只改这里
   - 词库三类：核心动物名词 57 / 动作动词 49 / 身体部位 19
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

  /* 所有关卡通用配比：1 名词 + 1 动词 + 1 动物喂食
     5 题关卡在这 3 题基础上再随机补 2 道（dialog / 进阶题型） */
  const NORMAL_MIX = [
    { role: "noun", count: 1 },
    { role: "verb", count: 1 },
    { role: "feed", count: 1 },
  ];

  /* 启蒙模式（3 岁）：2 选项，屏蔽情景对话（enlightenOn 由 shared.js 统一提供） */
  function optionCount() {
    return enlightenOn() ? 2 : 3;
  }
  /* 普通与启蒙共用题型池；启蒙仅屏蔽情景对话 */
  const ENLIGHTEN_BLOCKED_TYPES = new Set(["dialog"]);
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
     basic    = 保底基础认知题（看图 / 听音）
     advanced = 互动进阶题（动作） */
  const GAME_RULES = [
    { key: "pic",         label: "看图选词", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "listen",      label: "听音戳泡泡", group: "basic",  cats: ["noun"], recordWrong: true },
    { key: "feed_animal", label: "动物喂食", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "dialog",      label: "情景对话", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "action",      label: "动作猜猜", group: "advanced", cats: ["verb"], recordWrong: true },
  ];
  const RULE_BY_KEY = GAME_RULES.reduce((map, rule) => {
    map[rule.key] = rule;
    return map;
  }, {});
  const IMPLEMENTED_TYPES = GAME_RULES.map((rule) => rule.key);

  /* 名词题型：所有互动题型与启蒙共用同一池 */
  function nounTypesForStep() {
    return typesForCurrentTheme(["pic", "listen", "feed_animal"]);
  }

  /* 单词是否符合某个题型：标签匹配 + 特殊资源（动作图 / 食物）齐备 */
  function fitsRule(w, rule) {
    /* 听音戳泡泡：启蒙模式下允许动词（选项用 action 动作图），其余情况仍限名词 */
    const catOk = rule.cats.includes(w && w.category)
      || (rule.key === "listen" && enlightenOn() && w && w.category === "verb");
    if (!w || !catOk) return false;
    if (rule.key === "action" && !w.img) return false;
    if (rule.key === "feed_animal" && !w.food) return false;
    /* 启蒙模式：杂食动物可吃食物太杂，2 选项容易误伤，改出其他题型 */
    if (rule.key === "feed_animal" && enlightenOn() && w.diet === "omnivore") return false;
    if (rule.key === "dialog" && !w.dialogueClue) return false;
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

    /* 动作题与其它题型一样使用主题词池；缺图的动词由 fitsRule 排除 */
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
    const size = quizSize(level);
    const usedWords = new Set();
    const usedTypes = new Set();
    const questions = [];

    /* 普通与启蒙共用 NORMAL_MIX 基础配比和题型池 */
    for (const slot of NORMAL_MIX) {
      for (let i = 0; i < slot.count; i++) {
        let type = "action";
        if (slot.role === "noun") type = pickType(nounTypesForStep(), usedTypes);
        else if (slot.role === "verb") {
          type = verbType();
          /* 当前主题词表没有可用动作词时改出名词题，保证题量不缩水 */
          if (!pool.some((w) => w.category === "verb" && w.img)) type = pickType(nounTypesForStep(), usedTypes);
        }
        else if (slot.role === "feed") {
          /* 名词槽已抽到喂食时改抽其他名词题型，保证同一关题型不重复 */
          type = usedTypes.has("feed_animal")
            ? pickType(nounTypesForStep(), usedTypes)
            : "feed_animal";
        }
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
      /* 素材键：题目与图片解耦 */
      assetKey: w.assetKey || w.word,
      animal: !!w.animal,
      /* 图片与食物：数据层挂载，缺图时渲染层回退 emoji */
      img: w.img || "",
      food: w.food || null,
      foodId: w.foodId || "",
      eats: w.eats || "",
      diet: w.diet || "",
      habitat: w.habitat || "",
      dialogueClue: w.dialogueClue || "",
      /* 进阶题型专用数据 */
      actor: w.actor || "",
      motion: w.motion || "",
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

  /* 选项图片映射：从本主题词池取词条插画，供听音戳泡泡等题型直接复用 */
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
    /* 同一关题型不重复：优先从未出现的题型里抽，题型池用尽后才允许重复 */
    const usedTypes = new Set(tasks.map((task) => task.gameType));
    const primary = primaryPool && primaryPool.length ? primaryPool : allWords;
    let guard = 0;
    while (tasks.length < size && guard++ < 20) {
      const fresh = types.filter((type) => !usedTypes.has(type));
      const pickFrom = fresh.length ? fresh : types;
      const type = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      usedTypes.add(type);
      const rule = RULE_BY_KEY[type];
      let candidates = primary.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
      /* 优先池凑不满时，回退到完整场景词表兜底 */
      if (!candidates.length) candidates = allWords.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
      if (!candidates.length) candidates = allWords.filter((w) => fitsRule(w, rule));
      if (!candidates.length) continue;
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

  /* 关卡题型：主题显式配置优先；未配置时从当前主题可用题型池随机抽取 */
  function levelPlan(level) {
    const plans = currentTheme().levelGames || {};
    const configured = plans[level] || plans[10];
    if (Array.isArray(configured) && configured.length) return configured.slice();
    return shuffle(typesForCurrentTheme(IMPLEMENTED_TYPES));
  }

  function buildTasks(level, opts = {}) {
    const theme = currentTheme();
    const pool = themeWords();
    const dlg = theme.dialog || { q: "What's this?", a: "It's a {word}." };
    const size = quizSize(level);

    /* 多场景路线图主题：按四类题库 + 关卡模板动态组卷 */
    if (hasSceneRoute() && window.DynamicEngine) {
      const scene = activeScene();
      const sceneId = (scene && scene.id) || state.scene || theme.id;
      const allSceneWords = scene && scene.words && scene.words.length ? scene.words : pool;

      /* 重玩未满星关卡：目标词只从错词库抽，错词不够时再用正常词补足 */
      let targetPool = null;
      if (opts.replay) {
        const prefix = `${sceneId}_`;
        const wrongWords = new Set(WrongBank.listInScene(sceneId).map((id) => id.slice(prefix.length)));
        targetPool = new Set(allSceneWords.filter((w) => wrongWords.has(w.word)).map((w) => w.word));
      }

      const wordMap = new Map(allSceneWords.map((w) => [w.word, w]));
      /* 按关卡进度做词库难度分层：L1~15 只出 Tier 1，L16~35 解锁 Tier 1~2，L36+ 全池综合
         若重玩且错词库包含更高阶词，保留错词；分层池过小时自动回退全池 */
      const maxTier = level <= 15 ? 1 : (level <= 35 ? 2 : 3);
      const hasTiers = allSceneWords.some((w) => w.tier);
      const tiered = hasTiers
        ? allSceneWords.filter((w) => (w.tier || 3) <= maxTier || (targetPool && targetPool.has(w.word)))
        : allSceneWords;
      const sessionPool = tiered.length >= 12 ? tiered : allSceneWords;

      const questions = buildSession(level, sessionPool, sceneId, null, targetPool);
      const tasks = questions
        .filter((q) => theme.games[q.gameType] && theme.games[q.gameType].render)
        .map((q) => toTask(q, allSceneWords, dlg, sceneId, sessionPool, null, wordMap));

      /* 补题：全部已实现题型都开放（dialog 不再限制） */
      const allowed = typesForCurrentTheme(IMPLEMENTED_TYPES);
      const filled = fillTasks(tasks, size, allSceneWords, dlg, sceneId, allowed, sessionPool, targetPool, wordMap).slice(0, size);
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
    for (const type of plan) {
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

  /* 默认关卡题型：不再固定每关题序
     返回空表 → levelPlan 从当前主题可用题型池随机抽取，同一关内题型不重复 */
  function defaultLevelGames() {
    return {};
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

  /* 单词主图：优先使用数据层的 img，缺图时按主题目录拼路径并回退 emoji */
  function wordImageSrc(w) {
    if (!w) return "";
    return w.img || wordImgPath(w.word, w.themeId);
  }
  /* 带图片回退的通用插图：复用 shared.js 的 wordArtImg（webp → png → fallback） */
  function artWithImage(src, cls, fallback) {
    if (!src) return fallback;
    return wordArtImg(src, cls, fallback, "art-fallback", "eager", {
      imgStyle: "width:100%;height:100%;object-fit:contain",
      fallbackStyle: "width:100%;height:100%;place-items:center",
    });
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
    /* 2. 无动物图片：提示句中的动物单词或目标词（按 pool 缓存正则，避免重复编译） */
    if (tryPattern(_animalReForPool(pool))) return;
    if (task.word && task.word.length >= 2) {
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
                </div>
                <p class="ref-hint">点单词听一听，${q.picHint || (currentTheme() && currentTheme().picHint) || "猜猜这是什么动物"}</p>
                <div class="options ref-pic-options">${options(q.options)}</div>
              </div>`,
      btn: choiceButton("选一个答案"),
    };
  }

  /* 泡泡位置：从图片框内的安全槽位随机抽取（带轻微抖动），每次新题都不同 */
  function bubbleLayout(count) {
    /* 斜向错落布局：每颗泡泡 x 各不相同（避免同列）、y 也错开（避免平行），
       且任意两颗中心距 > 30% 舞台宽（泡泡直径约占 21%~24%），确保不重叠
       同时避开左下角小恐龙与底部草坪 */
    const triA = [{ x: 28, y: 22 }, { x: 72, y: 38 }, { x: 48, y: 60 }];
    const triB = [{ x: 72, y: 22 }, { x: 28, y: 38 }, { x: 52, y: 60 }];
    const duoA = [{ x: 30, y: 26 }, { x: 68, y: 56 }];
    const duoB = [{ x: 68, y: 26 }, { x: 30, y: 56 }];
    const sets = count >= 3 ? [triA, triB] : [duoA, duoB];
    const base = sets[Math.floor(Math.random() * sets.length)].slice(0, count);
    return base.map((s) => ({
      /* 抖动收窄到 ±1%，不会把安全间距吃掉 */
      x: `${(s.x + Math.random() * 2 - 1).toFixed(1)}%`,
      y: `${(s.y + Math.random() * 2 - 1).toFixed(1)}%`,
      /* 只保留上下浮动，取消水平漂移 */
      dx: "0rem",
      dy: `${(-(0.8 + Math.random() * 0.6)).toFixed(2)}rem`,
      duration: +(3.8 + Math.random() * 1.2).toFixed(1),
      delay: -+(Math.random() * 3).toFixed(1),
    }));
  }

  /* 听音戳泡泡：答对即时特效（不触发整页重绘），延时结算前先播爆裂 + 救援 */
  function playBubbleRescue({ el }) {
    const stage = el && el.closest ? el.closest(".listen-bubble-stage") : null;
    if (!stage) return;
    if (typeof sfx === "function") sfx("pop");
    const rect = el.getBoundingClientRect();
    const sRect = stage.getBoundingClientRect();
    const cx = rect.left - sRect.left + rect.width / 2;
    const cy = rect.top - sRect.top + rect.height / 2;
    const colors = ["#9CE3F2", "#FFE49A", "#FFB5C8", "#B6E39A"];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("i");
      const rad = (i / 8) * Math.PI * 2 + (Math.random() * 0.25 - 0.125);
      const dist = 38 + Math.random() * 14;
      p.className = "bubble-spark";
      p.style.cssText =
        `left:${cx}px;top:${cy}px;` +
        `--tx:${(Math.cos(rad) * dist).toFixed(1)}px;` +
        `--ty:${(Math.sin(rad) * dist).toFixed(1)}px;` +
        `background:${colors[i % colors.length]};`;
      stage.appendChild(p);
      setTimeout(() => p.remove(), 560);
    }
    el.classList.add("is-rescued");
    const dino = stage.querySelector(".bubble-dino");
    if (dino) {
      dino.classList.remove("is-blowing");
      dino.classList.add("is-cheering");
    }
  }

  /* 听音戳泡泡：戳错即时特效（果冻晃动弹开 + 恐龙疑惑抖动），延时后再进入统一结算 */
  function playBubbleWrong({ el }) {
    const stage = el && el.closest ? el.closest(".listen-bubble-stage") : null;
    if (!stage) return;
    if (typeof sfx === "function") sfx("boing");
    el.classList.remove("is-wrong-wobble");
    void el.offsetWidth;
    el.classList.add("is-wrong-wobble");
    const rect = el.getBoundingClientRect();
    const sRect = stage.getBoundingClientRect();
    const tag = document.createElement("span");
    tag.className = "bubble-oops-tag";
    tag.textContent = "?";
    tag.style.left = `${rect.left - sRect.left + rect.width / 2}px`;
    tag.style.top = `${Math.max(18, rect.top - sRect.top)}px`;
    stage.appendChild(tag);
    setTimeout(() => tag.remove(), 520);
    const dino = stage.querySelector(".bubble-dino");
    if (dino) {
      dino.classList.remove("is-blowing", "is-oops");
      void dino.offsetWidth;
      dino.classList.add("is-oops");
    }
  }

  /* 听音戳泡泡：在原展示框内浮动，答对后内部动物落到草坪 */
  function renderListen({ q, quiz, artOf }) {
    const revealed = quiz.revealed;
    const selected = quiz.selected;
    /* 位置缓存到题目上，答题后重渲染不再跳动 */
    if (!q.bubbleLayout) q.bubbleLayout = bubbleLayout(q.options.length);
    const positions = q.bubbleLayout;
    const bubbles = q.options.map((opt, i) => {
      const p = positions[i] || positions[0];
      const isCorrect = revealed && opt === q.word;
      const isWrong = revealed && opt === selected && opt !== q.word;
      const cls = ["listen-bubble"]
        .concat(isCorrect ? ["ok"] : [])
        .concat(isWrong ? ["wrong"] : [])
        .concat(revealed && isCorrect ? ["is-rescued"] : [])
        .join(" ");
      return `<button type="button" class="${cls}" style="--bubble-x:${p.x};--bubble-y:${p.y};--bubble-dx:${p.dx};--bubble-dy:${p.dy};--bubble-duration:${p.duration}s;--bubble-delay:${p.delay}s;--blow-delay:${(i * 0.11).toFixed(2)}s"
              data-action="select" data-word="${opt}" aria-label="戳破 ${opt} 泡泡"${revealed ? " disabled" : ""}>
              <span class="listen-bubble-art">${wordArtImg((q.optionImgs && q.optionImgs[opt]) || wordImgPath(opt, q.themeId), "listen-card-img", (q.optionEmojis && q.optionEmojis[opt]) || artOf(opt)(), "listen-card-emoji")}</span>
              ${isCorrect ? `<i class="ref-listen-mark">✓</i>` : ""}
              ${isWrong ? `<i class="ref-listen-mark bad">✕</i>` : ""}
            </button>`;
    }).join("");
    const dinoSvg = typeof bubbleDinoSvg === "function" ? bubbleDinoSvg() : "";
    return {
      body: `<div class="ref-listen-wrap listen-bubble-wrap">
                <div class="ref-listen-speaker listen-bubble-stage${revealed ? " is-revealed" : ""}" data-count="${q.options.length}">
                  ${bubbles}
                  <div class="bubble-grass" aria-hidden="true"></div>
                  <div class="bubble-dino${revealed ? " is-cheering" : " is-blowing"}" aria-hidden="true">${dinoSvg}</div>
                </div>
                <p class="ref-hint">${q.themeId === "animal" ? "小恐龙，快救出小动物！" : "小恐龙，快戳破正确的泡泡！"}</p>
                <div class="ref-listen-grid listen-bubble-hint">
                  <button type="button" class="listen-bubble-replay" data-action="speak-word" data-word="${q.word}" aria-label="再听一遍">
                    ${I.speaker(18, "#5C411D")}<span>点我，再听一遍</span>
                  </button>
                </div>
              </div>`,
      btn: quiz.revealed ? quizNextButton() : "",
    };
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
        return `<button class="option${state ? " " + state : ""}" data-action="select" data-word="${esc(o.value)}">
                  <span class="dlg-sentence">${highlightKeys(o.label)}</span>${markOf(o.value)}
                </button>`;
      }).join("")}</div>`;
    } else if (d.mode === "image") {
      optionHtml = `<div class="ref-dialog-image-grid">${d.options.map((o) => {
        const state = optionState(o.value);
        const cardState = state === "correct" ? "ok" : (state === "wrong" ? "wrong" : (state === "sel" ? "sel" : ""));
        const art = wordArtImg(o.img, "listen-card-img", artOf(o.value)(), "listen-card-emoji");
        return `<button class="ref-listen-card${cardState ? " " + cardState : ""}" data-action="select" data-word="${esc(o.value)}" aria-label="选择 ${o.value}">
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
                  <div class="ref-dialog-bubble ref-dialog-ask" data-action="speak-text" data-text="${esc(askSoundText)}" aria-label="点击朗读 A 的句子">${nameTag(cast && cast.ask, "A")}<p>${askText}</p>${askPic}<span class="ref-dialog-ask-say" aria-hidden="true">${I.speaker(13, "#8D6835")}</span></div></div>
                <div class="ref-dialog-row reply"><div class="ref-dialog-bubble">${replyHtml}</div>
                  <div class="ref-dialog-person person--player"><img class="ref-dialog-dino" src="${dinoArtSrc(state.stage, state.ultraSkin)}" alt=""></div></div>
              </div>
              ${optionHtml}`,
      btn: choiceButton("选一个答案"),
    };
  }

  /* 动物喂食：干扰项按「栖息地 + 食性」双维度隔离
     - habitat 隔离：海洋动物只从海洋食物池挑干扰项，陆地动物只从陆地池挑
       避免 shark 吃草、panda 吃 shellfish 这类跨域乱配
     - diet 隔离：carnivore 只配 plant 类干扰，herbivore 只配 animal 类干扰
       herbivore 额外排除 milk（奶牛产奶易误判）和 worm（鸟/爬行动物也吃） */
  function buildFeedAnimal(task, pool) {
    /* 1. 从 pool 里收集所有不重复的食物（自带 cls / habitat 字段） */
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
      const targetHabitat = task.habitat || "land"; /* 兜底陆地 */

      /* 2. 先按 habitat 过滤同域食物（正确答案天然已在同域） */
      let sameHabitat = unique.filter((f) => f.habitat === targetHabitat && f.id !== correct.id);

      /* 3. 再按 diet 过滤：食性安全池 */
      let safe;
      if (task.diet === "carnivore") {
        /* 肉食动物 → 植物类干扰 */
        safe = sameHabitat.filter((f) => f.cls === "plant");
      } else if (task.diet === "herbivore") {
        /* 食草动物 → 动物类干扰，排除 milk/worm（孩子易误判为正确） */
        safe = sameHabitat.filter((f) => f.cls === "animal" && f.id !== "milk" && f.id !== "worm");
      } else {
        /* omnivore（启蒙模式不出喂食题，这里兜底） */
        safe = sameHabitat;
      }

      /* 4. 分层兜底：同域安全 → 同域不限食性 → 全域安全 → 全域不限 */
      let rest = shuffle(safe).slice(0, need - 1);
      if (rest.length < need - 1) {
        const seenIds = new Set([correct.id, ...rest.map((f) => f.id)]);
        /* 同域不限食性补齐 */
        for (const f of sameHabitat) {
          if (rest.length >= need - 1) break;
          if (seenIds.has(f.id)) continue;
          rest.push(f); seenIds.add(f.id);
        }
      }
      if (rest.length < need - 1) {
        const seenIds = new Set([correct.id, ...rest.map((f) => f.id)]);
        /* 全域安全池补齐（仍保持食性安全，但允许跨域） */
        let globalSafe = unique.filter((f) => f.id !== correct.id && !seenIds.has(f.id));
        if (task.diet === "carnivore") globalSafe = globalSafe.filter((f) => f.cls === "plant");
        else if (task.diet === "herbivore") globalSafe = globalSafe.filter((f) => f.cls === "animal" && f.id !== "milk" && f.id !== "worm");
        for (const f of shuffle(globalSafe)) {
          if (rest.length >= need - 1) break;
          rest.push(f);
        }
      }
      if (rest.length < need - 1) {
        /* 最终兜底：全域不限 */
        const seenIds = new Set([correct.id, ...rest.map((f) => f.id)]);
        for (const f of shuffle(unique)) {
          if (rest.length >= need - 1) break;
          if (seenIds.has(f.id)) continue;
          rest.push(f); seenIds.add(f.id);
        }
      }

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
                ${revealed ? "" : `<span class="feed-hungry-badge" aria-hidden="true">💭</span>`}
              </div>
              <p class="ref-hint">${q.zh} 爱吃什么？拖到嘴边或点选食物</p>
              <div class="fd-foods">${foods}</div>
            </div>`;
    return { body, btn: revealed ? quizNextButton() : "" };
  }

  /* 动作猜猜：动作图片（点击可重播卡通拟声音效）+ 提示 + 文字选项 */
  function renderAction({ q, quiz, options }) {
    const actionSrc = q.img || `images/words/action/${q.assetKey}.webp`;
    return advancedLayout({
      wrap: "ref-action-wrap",
      stage: `<div class="ref-action-stage" data-action="action-sfx" data-word="${esc(q.word)}">
                  ${wordArtImg(actionSrc, "ref-action-img", q.emoji || wordGlyph(q.word), "pic-emoji")}
                </div>`,
      tipClass: "ref-hint",
      tip: q.themeId === "animal" ? "点单词听一听，动物在干什么？" : "点单词听一听，小恐龙在干什么？",
      optionsClass: "ref-action-options",
      options: options(q.options),
      btn: quiz.revealed ? quizNextButton() : "",
    });
  }

  /* 动物喂食答对：咬一口的“咔嚓”声 + 咀嚼回弹 + Yummy!/爱心飘出（不触发重绘） */
  function playFeedChew() {
    sfx("crunch");
    const box = document.querySelector(".ref-feed-animal");
    if (!box) return;
    box.classList.remove("is-chewing");
    /* 强制回流，保证连续答对时动画能重复播放 */
    void box.offsetWidth;
    box.classList.add("is-chewing");
    box.querySelectorAll(".feed-yummy, .feed-heart").forEach((n) => n.remove());
    const yummy = document.createElement("span");
    yummy.className = "feed-yummy";
    yummy.textContent = "Yummy!";
    const h1 = document.createElement("span");
    h1.className = "feed-heart h1";
    h1.textContent = "❤";
    const h2 = document.createElement("span");
    h2.className = "feed-heart h2";
    h2.textContent = "💛";
    box.append(yummy, h1, h2);
  }

  /* 动物喂食答错：软萌摇头 + 食物弹开 + Nope!/汗滴飘出，延时后再进统一结算 */
  function playFeedWrong({ q, word }) {
    sfx("nope");
    const box = document.querySelector(".ref-feed-animal");
    if (!box) return;
    box.classList.remove("is-chewing", "is-rejecting");
    void box.offsetWidth;
    box.classList.add("is-rejecting");
    box.querySelectorAll(".feed-nope, .feed-sweat, .feed-reject-food").forEach((n) => n.remove());
    const nope = document.createElement("span");
    nope.className = "feed-nope";
    nope.textContent = "Nope!";
    const sweat = document.createElement("span");
    sweat.className = "feed-sweat";
    sweat.textContent = "💧";
    box.append(nope, sweat);
    const picked = q && Array.isArray(q.foods)
      ? q.foods.find((f) => (f.id || f.word) === word)
      : null;
    if (picked) {
      const reject = document.createElement("span");
      reject.className = "feed-reject-food";
      reject.innerHTML = picked.img
        ? `<img src="${picked.img}" alt="">`
        : (picked.emoji || "🍽️");
      box.append(reject);
    }
  }

  /* 情景对话 eat 类答对：食物从选项飞到提问动物身上，并朗读小恐龙的回答（单一音源） */
  function playDialogReply({ q, el }) {
    const d = q && q.dialog;
    if (!d) return;
    const askBox = document.querySelector(".ref-dialog-ask");
    if (d.foodImg && el && askBox) {
      sfx("pop");
      const from = el.getBoundingClientRect();
      const to = askBox.getBoundingClientRect();
      const fly = document.createElement("img");
      fly.className = "dialog-food";
      fly.src = d.foodImg;
      fly.alt = "";
      fly.style.left = `${from.left + from.width / 2}px`;
      fly.style.top = `${from.top + from.height / 2}px`;
      document.body.appendChild(fly);
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      requestAnimationFrame(() => {
        fly.style.transform = `translate(${dx}px, ${dy}px) scale(.55)`;
        fly.style.opacity = "0.15";
      });
      setTimer(() => {
        fly.remove();
        /* 食物抵达：动物轻点头“开吃”，随后随重绘消失 */
        askBox.classList.remove("is-eating");
        void askBox.offsetWidth;
        askBox.classList.add("is-eating");
        setTimer(() => askBox.classList.remove("is-eating"), 900);
      }, 520);
    }
    /* 单一音源：先朗读回答句，弹卡在 settleDelay 后发生 */
    if (d.answerText) speak(d.answerText);
  }

  /* 通用默认答后信息与反馈策略（各题型可按需覆盖，消除 main.js / events.js 中的题型 if/else） */
  function defaultAnswerMeta(q) {
    const word = q && q.options && q.word ? q.word : null;
    return {
      word,
      zh: (q && q.zh) || "",
      phon: (q && q.phon) || "",
      speakText: (q && q.word) || "",
      isSentence: false,
    };
  }
  function wordOptionFeedback(q) {
    return { okSfx: "answer-right", wrongSfx: "answer-wrong", speakOnOk: (q && (q.answerValue || q.word)) || "" };
  }
  function defaultPromptLines(q, game) {
    const lines = [];
    if (game && game.prompt) lines.push(game.prompt);
    if (game && game.autoSpeak && q && q.word) lines.push(q.word);
    return lines;
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
        getAnswerMeta: defaultAnswerMeta,
        getPromptLines(q) {
          const t = typeof currentTheme === "function" ? currentTheme() : null;
          const prompt = (q && q.picPrompt) || (t && t.picPrompt) || this.prompt;
          return prompt ? [prompt] : [];
        },
        getFeedbackOpts: wordOptionFeedback,
      },
      listen: {
        label: "听音戳泡泡",
        title: "听单词，戳破正确的泡泡",
        prompt: "Listen and pop the right bubble!",
        badgeIcon: "speaker",
        autoSpeak: true,
        build: threeChoiceBuild,
        render: renderListen,
        getAnswerMeta: defaultAnswerMeta,
        getPromptLines(q) {
          /* 直接播目标词，去掉冗长前导句，避免还没读完就戳泡泡 */
          return q && q.word ? [q.word] : [];
        },
        getFeedbackOpts: () => ({ okSfx: "excellent", wrongSfx: "wrong", speakOnOk: "" }),
        /* 答对：爆裂救援特效；答错：果冻晃动弹开，延迟后统一结算 */
        settleDelay: 650,
        onCorrectFx: playBubbleRescue,
        wrongSettleDelay: 540,
        onWrongFx: playBubbleWrong,
      },
      dialog: {
        label: "情景对话",
        title: "读对话，选出正确的答案",
        build: buildDialog,
        render: renderDialog,
        getAnswerMeta(q) {
          const d = q && q.dialog;
          const isSentence = Boolean(d && d.mode === "sentence");
          const word = isSentence
            ? q.answerText
            : (d ? d.answerValue : (q && q.options && q.word ? q.word : null));
          const zh = isSentence ? (q.answerZh || "") : ((q && q.zh) || "");
          const phon = word && q && word === q.word ? (q.phon || "") : "";
          const speakText = isSentence ? (q.answerText || q.answerValue || q.word || "") : ((q && q.word) || "");
          return { word, zh, phon, speakText, isSentence };
        },
        getPromptLines(q) {
          const d = q && q.dialog;
          const ask = d && d.ask ? d.ask : ((q && q.dlgQ) || "").replace("{word}", (q && q.word) || "");
          const text = String(ask || "").replace(/<[^>]*>/g, "").trim();
          return text ? [text] : [];
        },
        getFeedbackOpts(q) {
          const d = q && q.dialog;
          const isWordMode = !d || (d.mode !== "sentence" && d.mode !== "image");
          if (isWordMode) return wordOptionFeedback(q);
          /* eat 类整句题已在 playDialogReply 中朗读回复句，其余子模式答对后补读回答句 */
          const alreadySpoke = Boolean(d && d.mode === "sentence" && d.foodImg);
          const speakOnOk = alreadySpoke ? "" : ((d && d.answerText) || (q && (q.answerText || q.word)) || "");
          return { okSfx: "excellent", wrongSfx: "wrong", speakOnOk };
        },
        /* 仅 eat 类整句题：飞食物 + 读回复，按句长估算弹卡时机 */
        settleDelay: (q) => {
          const d = q && q.dialog;
          if (!d || d.mode !== "sentence" || !d.foodImg) return 0;
          const words = String(d.answerText || "").trim().split(/\s+/).filter(Boolean).length;
          return 800 + words * 200;
        },
        onCorrectFx: playDialogReply,
      },
      /* 🍎 动物喂食 Feed the Animal（emoji 拖拽 + 选卡） */
      feed_animal: {
        label: "动物喂食",
        title: "给动物喂它爱吃的食物！",
        prompt: "What does this animal like to eat?",
        build: buildFeedAnimal,
        render: renderFeedAnimal,
        getCorrectValue: (q) => (q && q.correctFood) || "",
        getAnswerMeta(q) {
          const food = (q && q.correctFood) || "";
          return {
            word: food || null,
            zh: (q && q.correctZh) || "",
            phon: (q && q.correctPhon) || "",
            speakText: food || (q && q.word) || "",
            isSentence: false,
          };
        },
        getPromptLines(q) {
          return q && q.word
            ? [`What does the ${q.word} like to eat?`]
            : [this.prompt];
        },
        getFeedbackOpts: (q) => ({ okSfx: "excellent", wrongSfx: "wrong", speakOnOk: (q && q.correctFood) || "" }),
        onMount: (root, q, view) => { if (view && view.setupDragging) view.setupDragging(root); },
        settleDelay: 720,
        onCorrectFx: playFeedChew,
        wrongSettleDelay: 600,
        onWrongFx: playFeedWrong,
      },
      /* 🏃 动作猜猜 Action（进阶题：中央动态动物 + 纯文字选项） */
      action: {
        label: "动作猜猜",
        title: "看动作，选出正确的单词",
        prompt: "What is the animal doing?",
        hasOwnCue: true,
        build: threeChoiceBuild,
        render: renderAction,
        getAnswerMeta: defaultAnswerMeta,
        getPromptLines(q) { return defaultPromptLines(q, this); },
        getFeedbackOpts: wordOptionFeedback,
        onMount(root, q) {
          if (q && q.word && typeof actionSfx === "function") {
            setTimer(() => actionSfx(q.word), 120);
          }
        },
      },
    };
  }

  /* 只读缓存：供高频查题型复用，避免每次调用 defaultGames() 重建 7 套闭包对象 */
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
