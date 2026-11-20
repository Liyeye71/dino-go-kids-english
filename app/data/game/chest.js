/* ============================================================
   ChestManager · 神秘宝箱
   - 旅程里程碑：按当前主题星数上限三等分（10 关主题 10/20/30，50 关主题 50/100/150）
   - 领取：随机给一个恐龙形态（state.dex 里还没有的 STAGES key）
   - 存档：state.chests = { total: 已开数, unlocked: 额外待开数, claimed: { 进度键: [里程碑星数] } }
   - 结算与进化见 result.js
   ============================================================ */
(function () {
  "use strict";

  /* 宝箱里程碑：按当前主题星数上限三等分
     10 关主题 → 10 / 20 / 30；50 关主题 → 50 / 100 / 150 */
  function milestonesFor(starMax) {
    const total = Number(starMax) || 30;
    return [1, 2, 3].map((n) => Math.round((total * n) / 3));
  }
  function currentStarMax() {
    return levelsPerTheme() * 3;
  }

  /* 安全获取 state（可能从模块内或 window） */
  function _state() { return window.state || state; }

  /* 确保 chests 字段存在 */
  function ensureChests() {
    const s = _state();
    if (!s.chests || typeof s.chests !== "object") {
      s.chests = { total: 0, unlocked: 0, claimed: {} };
    }
    if (!s.chests.claimed || typeof s.chests.claimed !== "object") s.chests.claimed = {};
  }

  /* 从 STAGES 里挑一个 state.dex 里还没有的（未发现的恐龙） */
  function pickRandomDino() {
    const s = _state();
    const found = new Set(s.dex || []);
    const pool = STAGES.filter((st) => !found.has(st.key));
    if (pool.length === 0) return null; /* 图鉴收齐了 */
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick;
  }

  /* 把恐龙收进图鉴 */
  function addDex(dino) {
    const s = _state();
    if (!dino) return;
    if (!s.dex) s.dex = [];
    if (s.dex.indexOf(dino.key) < 0) s.dex.push(dino.key);
  }

  /* 某个进度键下，三个宝箱的状态：done 已领取 / ready 可领取 / locked 未解锁 */
  function milestoneStatus(key, starTotal, starMax) {
    ensureChests();
    const claimed = _state().chests.claimed[key] || [];
    return milestonesFor(starMax || currentStarMax()).map((stars) => {
      const done = claimed.indexOf(stars) >= 0;
      return { stars, done, ready: !done && starTotal >= stars };
    });
  }

  window.ChestManager = {
    /* 旅程进度条上的宝箱节点：由地图页渲染，点击走 chest-claim */
    renderJourneyChests(key, starTotal, starMax) {
      const total = starMax || currentStarMax();
      return milestoneStatus(key, starTotal, total).map((m) => {
        const pct = total ? (m.stars / total) * 100 : 0;
        const cls = m.done ? "done" : m.ready ? "ready" : "locked";
        const tip = m.done ? "已领取" : m.ready ? "点击开启" : `再获得 ${m.stars - starTotal} ★ 解锁`;
        return `<button type="button" class="j-chest ${cls}" style="left:${pct}%"
          data-action="chest-claim" data-threshold="${m.stars}"
          aria-label="${m.stars} 星宝箱，${tip}" title="${m.stars} ★ 宝箱 · ${tip}"
          ${m.ready ? "" : "disabled"}>${m.done ? "✓" : "🎁"}</button>`;
      }).join("");
    },

    /* 领取旅程里程碑宝箱：返回 { status: ok|locked|done, dino, need } */
    claimJourney(threshold) {
      const s = _state();
      ensureChests();
      const starMax = currentStarMax();
      /* 只接受当前主题配置里的三个里程碑，防止无效入口 */
      if (milestonesFor(starMax).indexOf(threshold) < 0) return { status: "done", dino: null, need: 0 };
      const key = activeProgressKey();
      const starTotal = themeStars(themeProgress());
      const claimed = s.chests.claimed[key] || (s.chests.claimed[key] = []);
      if (claimed.indexOf(threshold) >= 0) return { status: "done", dino: null, need: 0 };
      if (starTotal < threshold) return { status: "locked", dino: null, need: threshold - starTotal };

      claimed.push(threshold);
      s.chests.total += 1;
      const dino = pickRandomDino();
      addDex(dino);
      save();
      return { status: "ok", dino, need: 0 };
    },

    /* 手动开一个额外宝箱（BOSS 奖励）：返回抽到的恐龙 STAGES 对象，null 表示没有宝箱了 */
    openOne() {
      const s = _state();
      ensureChests();
      if (s.chests.unlocked <= 0) return null;
      const dino = pickRandomDino();
      addDex(dino);
      s.chests.unlocked -= 1;
      s.chests.total += 1;
      save();
      return dino;
    },

    /* 只读：当前有多少个额外宝箱待开 */
    available() {
      ensureChests();
      return _state().chests.unlocked || 0;
    },

    /* 通关总 BOSS 关（第 50 关）：额外 2 个宝箱 + 首次全通关标记 allCleared */
    rewardBossClear() {
      const s = _state();
      ensureChests();
      s.chests.unlocked += 2;
      /* allCleared 只记首次动物园全通关 */
      if (!s.allCleared) s.allCleared = true;
      save();
      return 2;
    },

    /* 只读：是否首次全通关 */
    isAllCleared() {
      return Boolean(_state().allCleared);
    },
  };
})();
