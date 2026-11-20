/* ============================================================
   ChestManager · 神秘宝箱
   - 旅程里程碑：当前主题星数上限的 20% / 40% / 60% / 80% / 100%，各 1 个宝箱
   - 奖励：从家庭奖励池随机抽一条（看动画片、买玩具等），不再发放恐龙图鉴
   - 存档：state.chests = { total: 已开数, unlocked: 额外待开数, claimed: { 进度键: [里程碑星数] } }
   - 结算与进化见 result.js
   ============================================================ */
(function () {
  "use strict";

  /* 家庭奖励池：开箱随机抽一条，由家长兑现 */
  const REWARD_POOL = [
    "看动画片 30 分钟",
    "给毛肚买一个新玩具",
    "睡前多讲一个故事",
    "周末去动物园玩一次",
    "挑一个喜欢的零食",
    "和爸爸妈妈一起玩 20 分钟游戏",
    "周末去公园骑滑板车",
    "挑选一本新绘本",
    "全家一起吃一次冰淇淋",
    "获得一次「晚睡 30 分钟」特权",
  ];

  /* 里程碑：当前主题星数上限的 20% / 40% / 60% / 80% / 100% */
  const MILESTONE_PCTS = [0.2, 0.4, 0.6, 0.8, 1];
  function milestonesFor(starMax) {
    const total = Number(starMax) || 30;
    const list = MILESTONE_PCTS.map((p) => Math.max(1, Math.round(total * p)));
    return list.filter((v, i) => list.indexOf(v) === i);
  }
  function currentStarMax() {
    /* 只有考核关（第 5/10/15… 关）产出星星，每关最多 3 星 */
    return Math.max(1, Math.floor(levelsPerTheme() / 5)) * 3;
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

  /* 随机抽一条家庭奖励 */
  function pickReward() {
    return REWARD_POOL[Math.floor(Math.random() * REWARD_POOL.length)];
  }

  /* 某个进度键下，五个宝箱的状态：done 已领取 / ready 可领取 / locked 未解锁 */
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
        const pct = total ? Math.round((m.stars / total) * 100) : 0;
        const cls = m.done ? "done" : m.ready ? "ready" : "locked";
        const tip = m.done ? "已领取" : m.ready ? "点击开启" : `再获得 ${m.stars - starTotal} ★ 解锁`;
        return `<button type="button" class="j-chest ${cls}" style="left:${pct}%"
          data-action="chest-claim" data-threshold="${m.stars}"
          aria-label="${pct}% 宝箱，${tip}" title="${pct}% 宝箱 · ${tip}"
          ${m.ready ? "" : "disabled"}>${m.done ? "✓" : "🎁"}</button>`;
      }).join("");
    },

    /* 领取旅程里程碑宝箱：返回 { status: ok|locked|done, reward, need } */
    claimJourney(threshold) {
      const s = _state();
      ensureChests();
      const starMax = currentStarMax();
      /* 只接受当前主题配置里的里程碑，防止无效入口 */
      if (milestonesFor(starMax).indexOf(threshold) < 0) return { status: "done", reward: null, need: 0 };
      const key = activeProgressKey();
      const starTotal = themeStars(themeProgress());
      const claimed = s.chests.claimed[key] || (s.chests.claimed[key] = []);
      if (claimed.indexOf(threshold) >= 0) return { status: "done", reward: null, need: 0 };
      if (starTotal < threshold) return { status: "locked", reward: null, need: threshold - starTotal };

      claimed.push(threshold);
      s.chests.total += 1;
      const reward = pickReward();
      save();
      return { status: "ok", reward, need: 0 };
    },

    /* 手动开一个额外宝箱（BOSS 奖励）：返回抽到的奖励文案，null 表示没有宝箱了 */
    openOne() {
      const s = _state();
      ensureChests();
      if (s.chests.unlocked <= 0) return null;
      const reward = pickReward();
      s.chests.unlocked -= 1;
      s.chests.total += 1;
      save();
      return reward;
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
