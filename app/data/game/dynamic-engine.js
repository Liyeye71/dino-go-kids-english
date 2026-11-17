/* ============================================================
   DynamicEngine · 动物园双层动态出题引擎
   - 第一层：10 大题型随机抽 5 种不重复题型（按关卡难度分层）
   - 第二层：五维标签过滤 → 错题加权抽词（WrongBank 协作）
   - 第 10 关（BOSS 关）特殊规则：80% 从全局错题库抽词
   - 与现有 _shared.js 的 defaultGames 题型（pic/listen/match/repeat/dialog）保持兼容
   ============================================================ */
(function () {
  "use strict";

  /* 五维标签：每个词必须打一个 category */
  const CATEGORIES = ["noun", "part", "verb", "color", "food"];

  /* 题型 → 所需词库标签 → 是否记录错题 → 关卡可用区间
     gameType 直接复用 defaultGames 的 key（pic/listen/match/repeat/dialog）
     + 5 个新题型 key 保持 snake_case */
  const GAME_RULES = [
    /* 现有题型（已在 _shared.js defaultGames 里实现 render） */
    { key: "pic",          label: "看图识词",   cats: ["noun", "part", "color"],                recordWrong: true,  levels: [1, 10] },
    { key: "listen",       label: "听音识词",   cats: ["noun", "part", "verb"],                 recordWrong: true,  levels: [1, 10] },
    { key: "match",        label: "句子连线",   cats: ["noun", "part", "verb", "color", "food"], recordWrong: false, levels: [1, 10] },
    { key: "dialog",       label: "情景对话",   cats: ["noun"],                                 recordWrong: false, levels: [1, 10], animalOnly: true },
    { key: "repeat",       label: "情景大声说", cats: ["noun", "verb"],                         recordWrong: false, levels: [3, 10] },

    /* 新增题型（Week 1 只注册规则不实现 render，后续逐步补） */
    { key: "word_puzzle",  label: "词汇拼图",   cats: ["noun"],                                 recordWrong: true,  levels: [3, 10], render: "shared.buildPuzzleRender" },
    { key: "shadow_match", label: "影子猜猜乐", cats: ["noun"],                                 recordWrong: true,  levels: [2, 10], render: "shared.buildShadowRender" },
    { key: "feed_animal",  label: "动物喂食",   cats: ["noun"],                                 recordWrong: true,  levels: [2, 10], render: "shared.buildFeedRender", animalOnly: true },
    { key: "action_time",  label: "动作模仿秀", cats: ["verb"],                                 recordWrong: true,  levels: [2, 10], render: "shared.buildActionRender" },
    { key: "color_paint",  label: "颜色涂鸦板", cats: ["color"],                                recordWrong: false, levels: [3, 10], render: "shared.buildPaintRender" },
  ];

  /* 根据关卡号过滤出可用题型（难度分层） */
  function availableGames(level) {
    return GAME_RULES.filter((g) => level >= g.levels[0] && level <= g.levels[1]);
  }

  /* Fisher–Yates 洗牌 */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* 从候选集里不重复地随机抽 n 个 */
  function pickN(candidates, n) {
    return shuffle(candidates).slice(0, Math.min(n, candidates.length));
  }

  /* 判断某个词是否满足某个题型的标签要求 */
  function wordMatchesGame(word, game) {
    if (game.animalOnly && !word.animal) return false;
    if (!word.category) {
      /* 兼容旧词：没有 category 时按 type 字段兜底映射 */
      if (word.type === "animal" && game.cats.includes("noun")) return true;
      if (word.type === "body"   && game.cats.includes("part")) return true;
      if (word.type === "color"  && game.cats.includes("color")) return true;
      return false;
    }
    return game.cats.includes(word.category);
  }

  /* 从当前关卡的 stop 词里，过滤出某个题型可用的候选词 */
  function eligibleWords(stopWords, game, usedWordIds, sceneId) {
    return stopWords.filter((w) => {
      const wid = WrongBank.makeId(sceneId, w.word);
      if (usedWordIds.has(wid)) return false;
      if (!wordMatchesGame(w, game)) return false;
      return true;
    });
  }

  /* 优先从当前馆取词；馆内词用完后允许本馆重复用词，最后才跨馆兜底 */
  function pickCandidates(primary, secondary, game, usedWordIds, sceneId) {
    let list = eligibleWords(primary, game, usedWordIds, sceneId);
    if (list.length === 0) list = primary.filter((w) => wordMatchesGame(w, game));
    if (list.length === 0) list = eligibleWords(secondary, game, usedWordIds, sceneId);
    if (list.length === 0) list = secondary.filter((w) => wordMatchesGame(w, game));
    return list;
  }

  /* 生成标准关卡的 5 道题（双层抽题） */
  function standardSession(stopWords, sceneWords, sceneId, level) {
    const gamePool = availableGames(level);
    const pickedGames = pickN(gamePool, 5);

    const usedWordIds = new Set();
    const questions = [];

    for (const game of pickedGames) {
      const candidates = pickCandidates(stopWords, sceneWords, game, usedWordIds, sceneId);
      if (candidates.length === 0) continue; /* 实在无匹配 → 跳过这个题型（自动降级） */

      /* 第二层：错题加权抽词 */
      const target = WrongBank.pickWithBias(candidates, (w) => WrongBank.makeId(sceneId, w.word));
      usedWordIds.add(WrongBank.makeId(sceneId, target.word));

      /* 生成干扰项（从整个场景词库里找同 category 的词） */
      const distractors = makeDistractors(target, sceneWords, 2, sceneId, usedWordIds);

      questions.push({
        gameType: game.key,
        recordWrong: game.recordWrong,
        targetWord: target,
        distractors,
      });
    }

    /* 兜底：若不够 5 道，补足（优先补现有题型，且仍优先使用本馆词） */
    while (questions.length < 5) {
      const fallback = availableGames(level);
      const fbGame = fallback[Math.floor(Math.random() * fallback.length)];
      const fbCandidates = pickCandidates(stopWords, sceneWords, fbGame, usedWordIds, sceneId);
      if (fbCandidates.length === 0) break;
      const fbTarget = fbCandidates[Math.floor(Math.random() * fbCandidates.length)];
      usedWordIds.add(WrongBank.makeId(sceneId, fbTarget.word));
      questions.push({
        gameType: fbGame.key,
        recordWrong: fbGame.recordWrong,
        targetWord: fbTarget,
        distractors: makeDistractors(fbTarget, sceneWords, 2, sceneId, usedWordIds),
      });
    }

    return questions;
  }

  /* 生成 BOSS 关（每馆第 5 关 / 第 50 关总 BOSS）：80% 从错题库抽词
     语义：错题库词权重 = 普通词权重 × 4（等价于 80% 优先抽错题） */
  function bossSession(stopWords, sceneWords, sceneId, step) {
    /* 收集当前词池里在错题库中的词 */
    const wrongIds = WrongBank.listInScene(sceneId);
    const wrongWordObjs = sceneWords.filter((w) => wrongIds.includes(WrongBank.makeId(sceneId, w.word)));

    /* 如果错题库不够多（< 3 词），全部走普通逻辑 */
    if (wrongWordObjs.length < 3) {
      return standardSession(stopWords, sceneWords, sceneId, step);
    }

    const gamePool = shuffle(availableGames(step));
    const usedWordIds = new Set();
    const questions = [];

    /* BOSS 关 80% 加权：从 candidates 里挑词时，错题库词重复 4 次进候选池 */
    function weightedPick(candidates) {
      const weighted = [];
      for (const c of candidates) {
        if (WrongBank.isWrongWord(WrongBank.makeId(sceneId, c.word))) {
          weighted.push(c, c, c, c); /* 权重 4 倍 */
        } else {
          weighted.push(c);
        }
      }
      return weighted[Math.floor(Math.random() * weighted.length)];
    }

    /* 先把错题库词尽可能分配出去（上限 4 题，保 1-2 题普通词） */
    const wrongPool = shuffle(wrongWordObjs).slice(0, Math.min(4, wrongWordObjs.length));
    for (const w of wrongPool) {
      for (const g of gamePool) {
        if (wordMatchesGame(w, g)) {
          usedWordIds.add(WrongBank.makeId(sceneId, w.word));
          questions.push({
            gameType: g.key, recordWrong: g.recordWrong,
            targetWord: w,
            distractors: makeDistractors(w, sceneWords, 2, sceneId, usedWordIds),
          });
          gamePool.splice(gamePool.indexOf(g), 1);
          break;
        }
      }
    }

    /* 剩余的 1-2 题：BOSS 关专用加权抽词（错题库词权重 × 4） */
    while (questions.length < 5) {
      const g = gamePool[questions.length % gamePool.length];
      const candidates = eligibleWords(sceneWords, g, usedWordIds, sceneId);
      if (candidates.length === 0) continue;
      const t = weightedPick(candidates);
      usedWordIds.add(WrongBank.makeId(sceneId, t.word));
      questions.push({
        gameType: g.key, recordWrong: g.recordWrong,
        targetWord: t,
        distractors: makeDistractors(t, sceneWords, 2, sceneId, usedWordIds),
      });
    }

    return questions;
  }

  /* 生成干扰项：从场景词库里抽同 category 的词，最多 2 个 */
  function makeDistractors(target, sceneWords, count, sceneId, usedWordIds) {
    const pool = sceneWords.filter((w) => {
      const wid = WrongBank.makeId(sceneId, w.word);
      if (wid === WrongBank.makeId(sceneId, target.word)) return false;
      if (usedWordIds.has(wid)) return false;
      if (w.category && target.category && w.category !== target.category) return false;
      return true;
    });
    return shuffle(pool).slice(0, count);
  }

  window.DynamicEngine = {
    GAME_RULES,
    CATEGORIES,
    /* level：全局 1~50 关；step：馆内第 1~5 关；isFinal：是否第 50 关总 BOSS */
    generateSession(sceneWords, stopWords, sceneId, level, step, isFinal) {
      const localStep = Number(step) || 1;
      const stopList = stopWords || sceneWords; /* 当前主题馆的词子集 */
      if (isFinal) return bossSession(stopList, sceneWords, sceneId, localStep);
      if (Number(level) % LEVELS_PER_VENUE === 0) {
        /* 馆内 BOSS：错题加权只在当前馆的词池里生效 */
        return bossSession(stopList, stopList, sceneId, localStep);
      }
      return standardSession(stopList, sceneWords, sceneId, localStep);
    },
  };
})();
