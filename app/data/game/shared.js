/* ============================================================
   DinoGo · 恐龙英语 — 主题注册与关卡上下文
   题型实现统一放在 dynamic-engine.js，本文件只做主题注册
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 关卡 / 场景上下文（供出题、结算、错题库共用） ---------------- */
  /* 当前激活的场景对象（多场景主题返回匹配场景，单场景主题返回 null） */
  function activeScene(themeId, sceneId) {
    const theme = themeId && typeof THEME_BY_ID !== "undefined"
      ? THEME_BY_ID.get(themeId)
      : (typeof currentTheme === "function" ? currentTheme() : null);
    const scenes = (theme && theme.scenes) || [];
    if (!scenes.length) return null;
    const sid = sceneId != null ? sceneId : (state && state.scene);
    return scenes.find((s) => s.id === sid) || scenes[0];
  }

  /* 当前主题/场景是否拥有路线图场景（启用动态场景组卷、阶段 BOSS 与路线抽屉） */
  function hasSceneRoute(themeId, sceneId) {
    const scene = activeScene(themeId, sceneId);
    return Boolean(scene && Array.isArray(scene.levels) && scene.levels.length);
  }

  /* 当前主题是否启用智能错题库 */
  function usesWrongBank() {
    const theme = typeof currentTheme === "function" ? currentTheme() : null;
    return Boolean(theme && theme.useWrongBank) || hasSceneRoute();
  }

  /* 阶段划分：每 5 关为一组，第 5/10/15… 关为考核关（5 题，按答对题数发 1~3 星） */
  const STAGE_SIZE = 5;
  function isAssessmentLevel(level) {
    const L = Number(level) || 0;
    return L > 0 && L % STAGE_SIZE === 0;
  }

  /* 每 5 关的第 5 关为阶段 BOSS，最后一关为总 BOSS */
  function isStageBossLevel(level) {
    return hasSceneRoute() && isAssessmentLevel(level);
  }
  function isFinalBossLevel(level) {
    const scene = activeScene();
    return Boolean(scene && scene.levelCount && Number(level) === scene.levelCount);
  }

  /* 根据主题配置拼接单词图片路径，避免业务代码硬编码 images/words/animal/... */
  function wordImgPath(word, themeId) {
    if (!word) return "";
    const theme = themeId && typeof THEME_BY_ID !== "undefined"
      ? THEME_BY_ID.get(themeId)
      : (typeof currentTheme === "function" ? currentTheme() : null);
    const dir = (theme && theme.wordImgDir) || "animal";
    return `images/words/${dir}/${String(word).replace(/ /g, "-")}.webp`;
  }

  /* 通用能力接口 + 兼容旧别名 */
  window.activeScene = activeScene;
  window.hasSceneRoute = hasSceneRoute;
  window.usesWrongBank = usesWrongBank;
  window.isStageBossLevel = isStageBossLevel;
  window.isFinalBossLevel = isFinalBossLevel;
  window.wordImgPath = wordImgPath;
  window.isZooScene = () => hasSceneRoute();
  window.zooScene = () => activeScene();
  window.isAnimalBossLevel = isStageBossLevel;
  window.isAnimalFinalBoss = isFinalBossLevel;
  window.STAGE_SIZE = STAGE_SIZE;
  window.isAssessmentLevel = isAssessmentLevel;

  /* 启蒙模式（3 岁）：全局唯一判定，供出题引擎、答题页与地图页共用 */
  window.enlightenOn = function enlightenOn() {
    return Boolean(typeof state !== "undefined" && state && state.enlighten);
  };

  /* 单词图片回退：webp 加载失败时依次回退同目录 .png 和 emoji */
  window.wordArtFallback = function wordArtFallback(img) {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "png";
      img.src = img.src.replace(/\.webp$/i, ".png");
      return;
    }
    img.style.display = "none";
    if (img.nextElementSibling) img.nextElementSibling.style.display = "grid";
  };

  /* 统一生成带 webp → png → emoji 回退的图片标签 */
  window.wordArtImg = function wordArtImg(src, imgCls, fallback, fallbackCls, loading = "eager", opts = null) {
    const fbCls = fallbackCls ? ` class="${fallbackCls}"` : "";
    const fbExtra = opts && opts.fallbackStyle ? `;${opts.fallbackStyle}` : "";
    if (!src) return `<span${fbCls} style="display:grid${fbExtra}">${fallback}</span>`;
    const imgStyle = opts && opts.imgStyle ? ` style="${opts.imgStyle}"` : "";
    return `<img class="${imgCls}" src="${src}" alt="" loading="${loading}" decoding="async"${imgStyle} onerror="wordArtFallback(this)"><span${fbCls} style="display:none${fbExtra}">${fallback}</span>`;
  };

  /* 统一构造简单名词主题词表（供 school / travel 等主题复用） */
  window.buildThemeWordList = function buildThemeWordList(rows, imgDir) {
    return (rows || []).map(([word, zh, phon, example, emoji]) => ({
      word,
      zh,
      phon,
      example,
      emoji,
      category: "noun",
      assetKey: word,
      img: `images/words/${imgDir}/${word.replace(/ /g, "-")}.webp`,
      dialogueClue: example.replace(
        new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}\\b`, "i"),
        "___"
      ),
    }));
  };

  /* 占位主题：统一「敬请期待」页，主题文件只需传差异文案与配色 */
  window.definePlaceholderTheme = function definePlaceholderTheme(opts) {
    const o = opts || {};
    return window.defineDinoTheme({
      id: o.id,
      name: o.name,
      islandName: o.islandName || o.name,
      chip: o.chip,
      unit: o.unit,
      emoji: o.emoji,
      cover: o.cover || `./images/background/theme-${o.id}.webp`,
      wordImgDir: o.wordImgDir || o.id,
      dialog: o.dialog || { q: "What's this?", a: "It's a {word}." },
      /* 每日随机挑战混抽到该主题时，看图题的提示文案跟随主题 */
      picHint: o.picHint || "",
      picPrompt: o.picPrompt || "",
      playable: false,
      words: o.words || [],
      scenes: [],
      map: {
        title: "敬请期待",
        intro: o.mapIntro || `「${o.name}」主题正在筹备中…`,
        sceneSelector: false,
        render() {
          return `<div style="text-align:center;padding:2rem 1rem;color:${o.color}">
        <div style="font-size:3rem;margin-bottom:0.75rem">${o.emoji}</div>
        <h3 style="margin:0 0 0.25rem;color:${o.accent}">${o.name} · 主题筹备中</h3>
        <p style="font-size:0.8125rem;margin:0;color:${o.tip || o.color}">${o.plan}</p>
      </div>`;
        },
      },
    });
  };

  window.defineDinoTheme = function defineDinoTheme(config) {
    /* 题型与关卡题序的唯一来源：dynamic-engine.js（需在本文件之后、主题文件之前加载） */
    const levelGames = DynamicEngine.defaultLevelGames();
    Object.keys(config.levelGames || {}).forEach((level) => {
      const plan = config.levelGames[level];
      levelGames[level] = Array.isArray(plan) ? [...plan] : plan;
    });

    const games = DynamicEngine.defaultGames();
    Object.keys(config.games || {}).forEach((type) => {
      games[type] = { ...games[type], ...config.games[type] };
    });
    /* 动物喂食仅属于 animal 主题，其他主题注册时直接移除 */
    if (config.id !== "animal") delete games.feed_animal;

    const theme = {
      isTheme: true,
      words: [],
      ...config,
      levelGames,
      games,
    };
    window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
    window.DINO_WORD_SETS.push(theme);
    return theme;
  };
})();
