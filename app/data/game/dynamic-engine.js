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

  /* 普通关固定配比：1 名词 + 1 动词 + 1 形容词
     名词题型覆盖看图/听音/拼图/连线/喂食；情景对话仅 BOSS 关开放 */
  const NORMAL_MIX = [
    { role: "noun",      count: 1 },
    { role: "verb",      count: 1 },
    { role: "partOrAdj", count: 1 },
  ];

  /* BOSS 关固定配比：5 题全部为进阶题型
     词汇拼图/连线/喂食 + 2 道情景对话 + 动作猜猜 + 局部/对比观察 */
  const BOSS_MIX = [
    { role: "noun",      count: 1 },
    { role: "dialog",    count: 2 },
    { role: "verb",      count: 1 },
    { role: "partOrAdj", count: 1 },
  ];
  const BOSS_NOUN_TYPES = ["word_puzzle", "match", "feed_animal"];
  const BOSS_TYPE_BY_ROLE = { verb: "action", adj: "action" };
  /* BOSS 关允许的题型：补题时也不会回落到简单题型（对比观察暂时关闭） */
  const BOSS_TYPES = ["word_puzzle", "action", "match", "feed_animal", "dialog"];


  /* 题型规则
     basic    = 保底基础认知题（看图 / 听音 / 拼词）
     advanced = 互动进阶题（动作 / 局部特写 / 对比观察） */
  const GAME_RULES = [
    { key: "pic",         label: "看图选词", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "listen",      label: "听音识图", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "word_puzzle", label: "词汇拼图", group: "basic",    cats: ["noun"], recordWrong: true, maxLetters: 8 },
    { key: "feed_animal", label: "动物喂食", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "dialog",      label: "情景对话", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "match",       label: "单词连线", group: "basic",    cats: ["noun"], recordWrong: true },
    { key: "action",      label: "动作猜猜", group: "advanced", cats: ["verb"], recordWrong: true },
    { key: "body_zoom",   label: "局部特写", group: "advanced", cats: ["part"], recordWrong: true },
    { key: "compare",     label: "对比观察", group: "advanced", cats: ["adj"],  recordWrong: true },
  ];
  const RULE_BY_KEY = GAME_RULES.reduce((map, rule) => {
    map[rule.key] = rule;
    return map;
  }, {});

  /* 名词题型按阶段递进，情景对话不进入普通关：
     第 1 关看图/听音/喂食，第 2 关加入连线，
     第 3 关起加入拼图，所有普通关题型逐步开放 */
  function nounTypesForStep(step) {
    if (step <= 1) return ["pic", "listen", "feed_animal"];
    if (step === 2) return ["pic", "listen", "feed_animal", "match"];
    return ["pic", "listen", "word_puzzle", "feed_animal", "match"];
  }

  /* 部位特写与对比观察暂时关闭，该槽位改出动物喂食题 */
  function pickPartOrAdjType() {
    return "feed_animal";
  }

  /* 单词是否符合某个题型：标签匹配 + 特殊资源（动作 / 部位 / 对比图）齐备 */
  function fitsRule(w, rule) {
    if (!w || !rule.cats.includes(w.category)) return false;
    if (rule.maxLetters && String(w.word).length > rule.maxLetters) return false;
    if (rule.key === "action" && !w.actor) return false;
    if (rule.key === "body_zoom" && !w.owner) return false;
    if (rule.key === "compare" && !w.compare) return false;
    if (rule.key === "feed_animal" && !w.food) return false;
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
  function makeQuestion(type, pool, sceneId, usedWords, usedTypes, familiarSet) {
    const rule = RULE_BY_KEY[type];
    if (!rule) return null;

    let candidates = pool.filter((w) => fitsRule(w, rule) && !usedWords.has(w.word));
    if (!candidates.length) candidates = pool.filter((w) => fitsRule(w, rule));
    if (!candidates.length) return null;

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

  /* 按固定配比组卷：普通关 3 题，BOSS 关 5 题 */
  function buildSession(level, pool, sceneId, familiarSet) {
    const step = ((Number(level) - 1) % LEVELS_PER_VENUE) + 1;
    const isBoss = step === LEVELS_PER_VENUE;
    const mix = isBoss ? BOSS_MIX : NORMAL_MIX;
    const usedWords = new Set();
    const usedTypes = new Set();
    const questions = [];

    for (const slot of mix) {
      for (let i = 0; i < slot.count; i++) {
        let type = "action";
        if (isBoss) {
          if (slot.role === "noun") type = pickType(BOSS_NOUN_TYPES, usedTypes);
          else if (slot.role === "dialog") type = "dialog";
          else if (slot.role === "partOrAdj") type = pickPartOrAdjType(step);
          else type = BOSS_TYPE_BY_ROLE[slot.role];
        } else if (slot.role === "noun") type = pickType(nounTypesForStep(step), usedTypes);
        else if (slot.role === "partOrAdj") type = pickPartOrAdjType(step);
        const question = makeQuestion(type, pool, sceneId, usedWords, usedTypes, familiarSet);
        if (question) questions.push(question);
      }
    }

    return questions;
  }

  /* 把引擎输出转换成现有 quiz.order 兼容的 task 对象
     buildPool：出题 / 干扰项用词池，BOSS 关会收窄到错题库 + 已解锁词 */
  function toTask(question, allWords, dlg, sceneId, buildPool) {
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
      /* 图片与食物：数据层挂载，缺图时渲染层回退 emoji */
      img: w.img || "",
      food: w.food || null,
      foodId: w.foodId || "",
      eats: w.eats || "",
      ownerWord: w.ownerWord || "",
      dialogueClue: w.dialogueClue || "",
      /* 进阶题型专用数据 */
      actor: w.actor || "",
      motion: w.motion || "",
      actionSound: w.actionSound || "",
      owner: w.owner || "",
      focus: w.focus || null,
      compare: w.compare || null,
      dlgQ: question.gameType === "dialog" && w.dialogueClue ? w.dialogueClue : dlg.q,
      dlgA: dlg.a,
      recordWrong: question.recordWrong,
      wrongWordId: WrongBank.makeId(sceneId, w.word),
    };
    const game = currentTheme().games[question.gameType];
    if (game && game.build) game.build(task, buildPool && buildPool.length ? buildPool : allWords);
    return task;
  }

  /* 兜底补题：部位特写暂时关闭，情景对话只允许出现在 BOSS 关 */
  const IMPLEMENTED_TYPES = ["pic", "listen", "word_puzzle", "match", "dialog", "feed_animal", "action"];
  const NORMAL_TYPES = ["pic", "listen", "word_puzzle", "match", "feed_animal", "action"];
  function fillTasks(tasks, size, allWords, dlg, sceneId, allowedTypes, primaryPool) {
    const types = allowedTypes && allowedTypes.length ? allowedTypes : IMPLEMENTED_TYPES;
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
      const w = candidates[Math.floor(Math.random() * candidates.length)];
      usedWords.add(w.word);
      tasks.push(toTask({ gameType: type, recordWrong: rule.recordWrong, targetWord: w }, allWords, dlg, sceneId, primary));
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
      const boss = window.isAssessmentLevel ? isAssessmentLevel(level) : isAnimalBossLevel(level);
      const size = boss ? BOSS_QUIZ_SIZE : QUIZ_SIZE;

      /* BOSS 关词池：错题库 + 已解锁词优先，凑不够时补少量场景新词兜底 */
      const familiarSet = boss ? unlockedWordSet(theme.id, sceneId) : null;
      let buildPool = allSceneWords;
      if (boss) {
        const familiar = allSceneWords.filter(
          (w) => familiarSet.has(w.word) || WrongBank.isWrongWord(WrongBank.makeId(sceneId, w.word))
        );
        if (familiar.length >= 3) {
          buildPool = familiar.slice();
          if (buildPool.length < 6) {
            const names = new Set(buildPool.map((w) => w.word));
            const rest = shuffle(allSceneWords.filter((w) => !names.has(w.word)));
            buildPool = buildPool.concat(rest.slice(0, 6 - buildPool.length));
          }
        }
      }

      const questions = buildSession(level, buildPool, sceneId, familiarSet);
      let tasks = questions
        .filter((q) => theme.games[q.gameType] && theme.games[q.gameType].render)
        .map((q) => toTask(q, allSceneWords, dlg, sceneId, buildPool));

      return fillTasks(tasks, size, allSceneWords, dlg, sceneId, boss ? BOSS_TYPES : NORMAL_TYPES, buildPool).slice(0, size);
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
  AMBIGUOUS_GROUPS.forEach((group, gi) => group.forEach((w) => { AMBIG_INDEX[w.toLowerCase()] = gi; }));
  /* 两个词条是否互为歧义：落在同一歧义组，或中文释义完全相同 */
  function isAmbiguous(a, b) {
    if (!a || !b) return false;
    const ga = AMBIG_INDEX[String(a.word || a).toLowerCase()];
    const gb = AMBIG_INDEX[String(b.word || b).toLowerCase()];
    if (ga !== undefined && ga === gb) return true;
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
  /* 三个选项的选择题共用 build（看图 / 听音 / 对话 / 动作 / 局部特写） */
  function threeChoiceBuild(task, pool) {
    buildOptions(task, pool, 3);
  }

  /* 对比观察选项：正确词 + 成对形容词 + 其他形容词干扰（成对词是题意保留，extras 排除歧义词） */
  function buildCompareOptions(task, pool) {
    const adjPool = pool.filter((w) => w.category === "adj");
    const pair = task.compare && task.compare.pair;
    const extras = shuffle(adjPool.filter((w) => w.word !== task.word && w.word !== pair && !isAmbiguous(w, task))).slice(0, 3 - (pair ? 2 : 1));
    task.options = shuffle([task.word, ...(pair ? [pair] : []), ...extras.map((w) => w.word)]);
  }

  /* 单词主图：优先使用数据层的 img，缺图时同目录 .png，再缺则回退 emoji */
  function wordImageSrc(w) {
    if (!w) return "";
    return w.img || `images/words/animal/${w.word}.webp`;
  }
  window.wordArtFallback = function (img) {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "png";
      img.src = img.src.replace(/\.webp$/i, ".png");
      return;
    }
    img.style.display = "none";
    if (img.nextElementSibling) img.nextElementSibling.style.display = "grid";
  };
  /* 带图片回退的通用插图：图片缺失时显示 emoji/SVG 兜底 */
  function artWithImage(src, cls, fallback) {
    if (!src) return fallback;
    return `<img class="${cls}" src="${src}" alt="" loading="eager" decoding="async"
      style="width:100%;height:100%;object-fit:contain"
      onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="art-fallback" style="display:none;width:100%;height:100%;place-items:center">${fallback}</span>`;
  }
  function wordHeroArt(w) {
    const emoji = w.emoji || wordGlyph(w.word);
    return `<img class="pic-img" src="${wordImageSrc(w)}" alt="" loading="eager" decoding="async"
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

  /* 情景对话：只给 A 问句加一处关键词提示；已有动物图片时提示动作词，不再重复提示动物名称 */
  function markDialogWords(dlg, task, pool) {
    const ask = String(dlg.ask || "");
    if (!ask) return;
    const wrap = (match) => `<span class="ref-dialog-word">${match}</span>`;
    const tryPattern = (re) => {
      if (!re.test(ask)) return false;
      dlg.ask = ask.replace(re, wrap);
      return true;
    };
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    /* 1. 已有动物图片：提示 like、eat、look、see 等动作词 */
    if (dlg.askImg) {
      tryPattern(/\b(eat|eats|eating|ate|like|likes|look|see|know|tell)\b/gi);
      return;
    }
    /* 2. 无动物图片：提示句中的动物单词 */
    const animals = new Set();
    (pool || []).forEach((x) => { if (x && x.animal && x.word && x.word.length >= 2) animals.add(x.word); });
    if (task.word && task.animal) animals.add(task.word);
    if (animals.size) {
      const re = new RegExp(`\\b(${[...animals].sort((a, b) => b.length - a.length).map(escapeRe).join("|")})\\b`, "gi");
      if (tryPattern(re)) return;
    }
    /* 3. 按食物选动物时，提示句中的食物单词 */
    const food = task.food && task.food.en;
    if (food && food.length >= 2) {
      if (tryPattern(new RegExp(`\\b${escapeRe(food)}\\b`, "gi"))) return;
    }
    /* 4. 通用问句：提示 animal */
    tryPattern(/\banimals?\b/gi);
  }

  function defaultGames() {
    return {
      pic: {
        label: "看图选词",
        title: "看图，选出正确的单词",
        prompt: "What is this animal?",
        pageClass: "pic-page",
        build: threeChoiceBuild,
        render({ q, choiceButton, options }) {
          return {
            body: `<div class="ref-pic-wrap">
                <div class="ref-picture-frame">
                  <div class="ref-picture-art">${wordHeroArt(q)}</div>
                  ${listenPill()}
                </div>
                <p class="ref-hint">猜猜这是什么动物</p>
                <div class="options ref-pic-options">${options(q.options)}</div>
              </div>`,
            btn: choiceButton("选一个答案"),
          };
        },
      },
      listen: {
        label: "听音选图",
        title: "听单词，选出正确的图片",
        prompt: "Listen and choose the correct picture.",
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
              <span class="ref-listen-card-art"><img class="listen-card-img" src="images/words/animal/${opt}.webp" alt="" loading="eager" decoding="async"
                onerror="wordArtFallback(this)"><span class="listen-card-emoji" style="display:none">${artOf(opt)()}</span></span>
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
        prompt: "Match the words with the pictures.",
        build(task, pool) {
          /* 只连同类词，避免连线题里混进动词/形容词 */
          const trioPool = pool.filter((x) => !task.category || x.category === task.category);
          /* 歧义过滤：同义/易混词不能同时出现在连线里（如 sleep 与 nap 都画着睡觉） */
          const picked = [];
          for (const cand of shuffle(trioPool)) {
            if (picked.length >= 3) break;
            if (picked.every((p) => !isAmbiguous(p, cand))) picked.push(cand);
          }
          /* 极端兜底：同类词过滤后不足 3 个，放开类别限制补齐 */
          if (picked.length < 3) {
            for (const cand of shuffle(pool)) {
              if (picked.length >= 3) break;
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

          task.pairs = pairs;
          task.words = shuffle(pairs.map((p) => p.word));
          task.arts = shuffle(pairs.map((p) => ({ word: p.word, art: p.art, img: p.img || "" })));
        },
        render({ q, quiz }) {
          const solved = new Set(quiz.matched || []);
          const wrongPairs = quiz.wrongPairs || [];
          const wrongArts = new Set(wrongPairs.map((p) => p.art));
          const wrongWords = new Set(wrongPairs.map((p) => p.word));
          const selected = quiz.pickWord;
          const leftCol = q.arts.map((p) => {
            const isDone = solved.has(p.word);
            const isWrong = wrongArts.has(p.word);
            const isSel = selected === p.word && !isDone && !isWrong;
            return `<div class="ref-match-row${isDone ? " done" : ""}${isWrong ? " wrong" : ""}${isSel ? " sel" : ""}" data-match-row data-word="${p.word}" data-match-side="art">
              <div class="ref-match-art-card">${artWithImage(p.img, "ref-match-img", p.art())}</div>
              <button class="ref-match-dot" data-match-dot data-match-side="art" data-word="${p.word}" aria-label="选择 ${p.word}">${isDone ? "<i class='ok-check'>✓</i>" : isWrong ? "<i class='ok-check'>✕</i>" : ""}</button>
            </div>`;
          }).join("");
          const rightCol = q.words.map((w) => {
            const isDone = solved.has(w);
            const isWrong = wrongWords.has(w);
            /* 单词框可复用：连过后仍可继续选，不锁定 */
            const isSel = selected === w;
            return `<div class="ref-match-row marked${isDone ? " done" : ""}${isWrong ? " wrong" : ""}${isSel ? " sel" : ""}" data-match-row data-word="${w}" data-match-side="word">
              <button class="ref-match-dot" data-match-dot data-match-side="word" data-word="${w}" aria-label="选择 ${w}">${isDone ? "<i class='ok-check'>✓</i>" : isWrong ? "<i class='ok-check'>✕</i>" : ""}</button>
              <div class="ref-match-word-card">${w}</div>
            </div>`;
          }).join("");
          return {
            body: `<div class="ref-match-wrap">
                <div class="ref-match-area" data-match-area>
                  <svg class="ref-match-svg" aria-hidden="true"></svg>
                  <div class="ref-match-col ref-match-col-left">${leftCol}</div>
                  <div class="ref-match-col ref-match-col-right">${rightCol}</div>
                </div>
              </div>`,
            btn: quiz.revealed ? quizNextButton() : "",
          };
        },
        onPickWord(word) {
          if (!quiz || quiz.revealed) return;
          /* 一个单词框可连多张图，不做锁定 */
          quiz.pickWord = word;
          quiz.pickWordSide = "word";
          sfx("tap");
          render();
        },
        onPickArt(word) {
          if (!quiz || quiz.revealed || !quiz.pickWord) return;
          const q = quiz.order[quiz.index];
          const wrongPairs = quiz.wrongPairs || (quiz.wrongPairs = []);
          /* 一张图只能连一次，连过即锁定；单词可以重复使用 */
          if (quiz.matched.includes(word) || wrongPairs.some((p) => p.art === word)) {
            quiz.pickWord = null;
            quiz.pickWordSide = null;
            render();
            return;
          }
          const pickedWord = quiz.pickWord;
          /* 构造错题库 wordId（match 题型的 q.pairs 里没有 wrongWordId） */
          const _sceneId = (state && state.scene) || "";
          const _makeWid = (w) => window.WrongBank ? WrongBank.makeId(_sceneId, w) : null;
          if (word === pickedWord) {
            quiz.matched.push(word);
            sfx("correct");
            /* 🦁 动物园：配对成功 → 尝试清除错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(word)) WrongBank.recordCorrect(_makeWid(word));
          } else {
            quiz.matchWrong++;
            /* 错误连线保留红线，不会被后续配对覆盖或清除 */
            wrongPairs.push({ art: word, word: pickedWord });
            sfx("wrong");
            /* 🦁 动物园：配对失败 → 自动收录错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(pickedWord)) WrongBank.recordWrong(_makeWid(pickedWord));
          }
          quiz.pickWord = null;
          quiz.pickWordSide = null;

          /* 三组全部连完后统一判题 */
          if (quiz.matched.length + wrongPairs.length >= q.pairs.length) {
            quiz.revealed = true;
            quiz.choiceCorrect = wrongPairs.length === 0;
            if (quiz.choiceCorrect) {
              quiz.correct++;
              q.pairs.forEach((p) => {
                quiz.words.push(p.word);
                /* 连线全部正确：把配对的单词一并解锁 */
                if (typeof unlockTaskWord === "function") unlockTaskWord({ word: p.word });
              });
              sfx("excellent");
            }
            render();
            return;
          }
          render();
        },
      },
      dialog: {
        label: "情景对话",
        title: "读对话，选出正确的答案",
        build(task, pool) {
          /* 模板库：按当前主题 / 场景收紧对话内容，避免出现主题外词汇 */
          const dlg = window.DialogTemplates
            ? window.DialogTemplates.build(task, pool, { themeId: currentTheme().id, sceneId: state.scene })
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
          /* 兜底：沿用旧版单句问答 */
          threeChoiceBuild(task, pool);
        },
        render({ q, quiz, choiceButton, options, artOf }) {
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
              const art = o.img
                ? `<img class="listen-card-img" src="${o.img}" alt="" loading="eager" decoding="async" onerror="wordArtFallback(this)"><span class="listen-card-emoji" style="display:none">${artOf(o.value)()}</span>`
                : `<span class="listen-card-emoji" style="display:grid">${artOf(o.value)()}</span>`;
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
        },
      },
      /* 🧩 词汇拼图 Word Puzzle（纯 DOM 拖拽排序） */
      word_puzzle: {
        label: "词汇拼图",
        title: "拖动字母块，拼出单词！",
        prompt: "Spell the word with the letters.",
        build(task) {
          /* 每道题随机留 1~3 个空槽需要拖拽填充，其余字母直接作为提示显示 */
          const letters = task.word.toUpperCase().split("");
          const blankCount = Math.min(letters.length, 1 + Math.floor(Math.random() * 3));
          const blankIdx = new Set(
            letters.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, blankCount)
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
          let shuffled;
          do { shuffled = [...chunks].sort(() => Math.random() - 0.5); }
          while (shuffled.map((c) => c.ch).join("") === chunks.map((c) => c.ch).join("") && chunks.length > 1);
          task.puzzleLetters = shuffled.map((c) => ({ ch: c.ch, id: c.id, placed: false }));
          task.puzzleSlots = chunks.map((c) => ({ id: c.id, filled: null }));
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const lettersById = new Map(q.puzzleLetters.map((l) => [l.id, l]));
          const slotsById = new Map(q.puzzleSlots.map((s) => [s.id, s]));
          const slotsHtml = q.puzzleCells.map((cell) => {
            if (cell.hint) return `<div class="pz-slot hint">${cell.hint}</div>`;
            const s = slotsById.get(cell.slot);
            const letter = s.filled !== null ? lettersById.get(s.filled) : null;
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
                <div class="pz-art">${wordHeroArt(q)}</div>
              </div>
              <div class="pz-slots">${slotsHtml}</div>
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
        prompt: "What does this animal like to eat?",
        build(task, pool) {
          /* 动物乐园：直接使用数据层挂载的 food 映射，选项即真实食物图 */
          const unique = [];
          const seenFood = new Set();
          pool.forEach((w) => {
            if (!w.food || seenFood.has(w.food.id)) return;
            seenFood.add(w.food.id);
            unique.push(w.food);
          });
          if (task.food && unique.length >= 3) {
            const correct = task.food;
            const rest = shuffle(unique.filter((f) => f.id !== correct.id)).slice(0, 2);
            task.foods = shuffle([correct, ...rest]);
            task.correctFood = correct.id;
            task.correctZh = correct.zh || "";
            task.correctPhon = correct.phon || "";
            return;
          }
          /* 其他主题沿用原有 emoji 食物池 */
          const foodPool = pool.filter((w) => w.category === "food" || ["banana", "meat", "grass", "honey", "bamboo"].includes(w.word));
          const foods = foodPool.slice(0, 3).map((w) => ({ word: w.word, emoji: w.emoji || "🍎", zh: w.zh || "", phon: w.phon || "" }));
          if (foods.length < 3) {
            /* 兜底：用不重复的基础食物补足到 3 种 */
            const seen = new Set(foods.map((f) => f.word));
            const fallback = [
              { word: "meat", emoji: "🥩", zh: "肉", phon: "/miːt/" },
              { word: "banana", emoji: "🍌", zh: "香蕉", phon: "/bəˈnɑːnə/" },
              { word: "bamboo", emoji: "🎋", zh: "竹子", phon: "/bæmˈbuː/" },
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
          task.correctPhon = (task.foods.find((f) => f.word === task.correctFood) || {}).phon || "";
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const foods = q.foods.map((f) => {
            const id = f.id || f.word;
            const art = f.img ? artWithImage(f.img, "ref-food-img", f.emoji || "🍎") : (f.emoji || artOf(id)());
            return `<button type="button" class="fd-food ${revealed && id === q.correctFood ? "correct" : ""} ${quiz.selected === id ? "selected" : ""}"
              data-action="fd-pick" data-drag="food" data-food="${id}"><span class="ref-food-art">${art}</span><small>${id}</small></button>`;
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
        },
      },
      /* 🏃 动作猜猜 Action（进阶题：中央动态动物 + 纯文字选项） */
      action: {
        label: "动作猜猜",
        title: "看动作，选出正确的单词",
        prompt: "What is the animal doing?",
        build: threeChoiceBuild,
        render({ q, quiz, options }) {
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
        },
      },
      /* 🔍 局部特写 Body Zoom（进阶题：放大镜高亮身体部位） */
      body_zoom: {
        label: "局部特写",
        title: "放大看看，这是哪个部位？",
        prompt: "Which body part is this?",
        build: threeChoiceBuild,
        render({ q, quiz, options }) {
          const f = q.focus || { x: "0%", y: "0%", scale: 2 };
          const src = q.img || (q.ownerWord ? `images/words/animal/${q.ownerWord}.webp` : "");
          const zoomArt = src
            ? `<img class="ref-zoom-art ref-zoom-photo" src="${src}" alt="" loading="eager" decoding="async"
                 style="--fx:${f.x};--fy:${f.y};--fs:${f.scale};width:100%;height:100%;object-fit:cover"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
               <span class="ref-zoom-art ref-zoom-emoji" style="--fx:${f.x};--fy:${f.y};--fs:${f.scale};display:none">${q.owner || q.emoji || "🐾"}</span>`
            : `<span class="ref-zoom-art" style="--fx:${f.x};--fy:${f.y};--fs:${f.scale}">${q.owner || q.emoji || "🐾"}</span>`;
          return advancedLayout({
            wrap: "ref-zoom-wrap",
            stage: `<div class="ref-zoom-lens" aria-hidden="true">
                  ${zoomArt}
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
        prompt: "Which word describes the animal?",
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
            stage: `<div class="ref-cmp-stage mode-${c.mode || "size"}" data-target="${c.target || "a"}" aria-hidden="true">
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
  };
})();
