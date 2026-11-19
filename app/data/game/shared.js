/* ============================================================
   DinoGo · 恐龙英语 — 主题注册与关卡上下文
   题型实现统一放在 dynamic-engine.js，本文件只做主题注册
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 关卡 / 场景上下文（供出题、结算、错题库共用） ---------------- */
  /* 判断当前是否为动物园场景（启用动态出题引擎） */
  function isZooScene() {
    return state.theme === "animal" && state.scene === "zoo";
  }

  /* 当前动物园场景对象 */
  function zooScene() {
    return (currentTheme().scenes || []).find((s) => s.id === (state.scene || "zoo")) || null;
  }

  /* 每馆第 5 关为馆内 BOSS，最后一关为总 BOSS */
  function isAnimalBossLevel(level) {
    return isZooScene() && Number(level) % LEVELS_PER_VENUE === 0;
  }
  function isAnimalFinalBoss(level) {
    const scene = zooScene();
    return isZooScene() && !!scene && Number(level) === scene.levelCount;
  }

  window.isZooScene = isZooScene;
  window.zooScene = zooScene;
  window.isAnimalBossLevel = isAnimalBossLevel;
  window.isAnimalFinalBoss = isAnimalFinalBoss;

  /* 阶段门槛：每 5 关为一阶段，阶段内第 5 关需前 4 关累计 ≥8 星 */
  const STAGE_SIZE = 5;
  const STAGE_GATE_STARS = 8;
  function stageStarsBefore(level) {
    const L = Number(level) || 1;
    const start = Math.floor((L - 1) / STAGE_SIZE) * STAGE_SIZE + 1;
    const stars = themeProgress().stars || {};
    let sum = 0;
    for (let i = start; i < L; i++) sum += Number(stars[i]) || 0;
    return sum;
  }
  function canEnterLevel(level) {
    const L = Number(level) || 1;
    if (!isZooScene()) return true;
    if (L % STAGE_SIZE !== 0) return true;
    return stageStarsBefore(L) >= STAGE_GATE_STARS;
  }
  window.STAGE_SIZE = STAGE_SIZE;
  window.STAGE_GATE_STARS = STAGE_GATE_STARS;
  window.stageStarsBefore = stageStarsBefore;
  window.canEnterLevel = canEnterLevel;

  /* 占位主题：统一「敬请期待」页，主题文件只需传差异文案与配色 */
  window.definePlaceholderTheme = function definePlaceholderTheme(opts) {
    const o = opts || {};
    return window.defineDinoTheme({
      id: o.id,
      name: o.name,
      chip: o.chip,
      unit: o.unit,
      emoji: o.emoji,
      dialog: o.dialog || { q: "What's this?", a: "It's a {word}." },
      playable: false,
      words: [],
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
