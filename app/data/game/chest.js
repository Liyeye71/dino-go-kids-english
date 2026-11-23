/* ============================================================
   ChestManager · 神秘宝箱 + 星星幸运大转盘
   - 旅程里程碑：当前主题星数上限的 20% / 40% / 60% / 80% / 100%，各 1 个宝箱
   - 打开宝箱 = 获得 1 次免费转盘机会，并直接进入转盘页面；不消耗星星
   - 未使用的转盘机会存入 state.spins，可保留到下次
   - 奖励池统一：宝箱与转盘共用 REWARD_POOL，抽中的奖品券记入 state.coupons
   - 存档：state.chests = { total, unlocked, claimed: { 进度键: [里程碑星数] } }
   ============================================================ */
(function () {
  "use strict";

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

  /* 确保 chests / spins 字段存在 */
  function ensureChests() {
    const s = _state();
    if (!s.chests || typeof s.chests !== "object") {
      s.chests = { total: 0, unlocked: 0, claimed: {} };
    }
    if (!s.chests.claimed || typeof s.chests.claimed !== "object") s.chests.claimed = {};
  }
  function pendingSpins() {
    return Math.max(0, Math.floor(Number(_state().spins) || 0));
  }
  function grantSpin(n) {
    const s = _state();
    s.spins = pendingSpins() + n;
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

    /* 领取旅程里程碑宝箱：成功后赠送 1 次免费转盘机会 */
    claimJourney(threshold) {
      const s = _state();
      ensureChests();
      const starMax = currentStarMax();
      /* 只接受当前主题配置里的里程碑，防止无效入口 */
      if (milestonesFor(starMax).indexOf(threshold) < 0) return { status: "done", need: 0 };
      const key = activeProgressKey();
      const starTotal = themeStars(themeProgress());
      const claimed = s.chests.claimed[key] || (s.chests.claimed[key] = []);
      if (claimed.indexOf(threshold) >= 0) return { status: "done", need: 0 };
      if (starTotal < threshold) return { status: "locked", need: threshold - starTotal };

      claimed.push(threshold);
      s.chests.total += 1;
      grantSpin(1);
      save();
      return { status: "ok", need: 0 };
    },

    /* 手动开一个额外宝箱（BOSS 奖励）：成功返回 true 并赠送 1 次免费转盘机会 */
    openOne() {
      const s = _state();
      ensureChests();
      if (s.chests.unlocked <= 0) return false;
      s.chests.unlocked -= 1;
      s.chests.total += 1;
      grantSpin(1);
      save();
      return true;
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

  /* ============================================================
     LuckyWheel · 星星幸运大转盘
     - 宝箱开启后自动进入；优先消耗免费机会，其次花 6 ★
     ============================================================ */
  const WHEEL_COST = 6;
  const DAILY_LIMIT = 3;
  /* 今天的日期键，用于每日转盘次数限制 */
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function spinsToday() {
    const s = _state();
    return s.spinDay === todayKey() ? Math.max(0, Number(s.spinCount) || 0) : 0;
  }
  /* 统一奖励池：weight 越大越常出现，买玩具仅 5%（低概率大奖） */
  const REWARD_POOL = [
    { id: "cartoon", label: "看动画片15分", short: "动画15分", color: "#FFE082", weight: 20, icon: "📺" },
    { id: "story",   label: "多讲1个故事",  short: "讲故事",   color: "#B9F6CA", weight: 20, icon: "📚" },
    { id: "sticker", label: "恐龙贴纸1张",  short: "贴纸1张",  color: "#E1BEE7", weight: 15, icon: "🌈" },
    { id: "snack",   label: "选1个小零食",  short: "小零食",   color: "#FFCCBC", weight: 10, icon: "🍪" },
    { id: "game",    label: "一起玩20分钟", short: "玩游戏",   color: "#D5CCF6", weight: 8,  icon: "🎲" },
    { id: "park",    label: "去公园玩耍",   short: "去公园",   color: "#B3E5FC", weight: 8,  icon: "🌳" },
    { id: "book",    label: "挑一本新绘本", short: "新绘本",   color: "#FFF1A8", weight: 5,  icon: "📖" },
    { id: "zoo",     label: "周末去动物园", short: "动物园",   color: "#CFE8A8", weight: 5,  icon: "🦁" },
    { id: "toy",     label: "买个小玩具",   short: "小玩具",   color: "#FFAB91", weight: 5,  icon: "🧸" },
    { id: "icecream", label: "全家吃冰淇淋", short: "冰淇淋",  color: "#F9CFE0", weight: 4,  icon: "🍦" },
  ];
  const PRIZE_ICON = {};
  REWARD_POOL.forEach((p) => { PRIZE_ICON[p.id] = p.icon; });

  /* 按 weight 随机抽取索引 */
  function pickWeightedIndex(list) {
    const total = list.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
      r -= list[i].weight;
      if (r <= 0) return i;
    }
    return 0;
  }

  function buildOverlay(fromChest) {
    const segAngle = 360 / REWARD_POOL.length;
    const gradient = REWARD_POOL.map((p, i) =>
      `${p.color} ${i * segAngle}deg ${(i + 1) * segAngle}deg`).join(",");
    const labels = REWARD_POOL.map((p, i) => {
      const deg = i * segAngle + segAngle / 2;
      return `<span class="lw-label" style="transform:rotate(${deg}deg) translateY(-5.5rem)">
        <i style="transform:rotate(${-deg}deg)">${p.short || p.label}</i></span>`;
    }).join("");
    const free = pendingSpins();
    const balance = starBalance();
    const coupons = Array.isArray(state.coupons) ? state.coupons : [];
    const today = spinsToday();
    const dailyLeft = Math.max(0, DAILY_LIMIT - today);
    let btnText;
    let disabled = false;
    if (dailyLeft <= 0) { btnText = `今天转满 ${DAILY_LIMIT} 次啦，明天再来`; disabled = true; }
    else if (free > 0) btnText = free > 1 ? `免费转一次（剩 ${free} 次）` : "免费转一次";
    else if (balance >= WHEEL_COST) btnText = `花 ${WHEEL_COST} ★ 转一次`;
    else { btnText = `还差 ${WHEEL_COST - balance} ★ 才能转哦`; disabled = true; }
    const baseHint = fromChest
      ? "宝箱开启成功！送你 1 次免费转盘机会"
      : free > 0
        ? "免费机会不消耗星星，未使用会保留到下次"
        : `每 ${WHEEL_COST} ★ 转一次，抽中的奖励找爸爸妈妈兑换`;
    const hint = `${baseHint}；每天最多 ${DAILY_LIMIT} 次，今天还剩 ${dailyLeft} 次`;
    const records = coupons.length
      ? coupons.map((c, i) => {
        const action = c.used
          ? `<span class="lw-used">已兑换</span>`
          : confirmAsk === i
            ? `<span class="lw-confirm">
                <button class="lw-mini ghost" data-action="coupon-cancel">取消</button>
                <button class="lw-mini" data-action="coupon-redeem" data-index="${i}">确认</button>
              </span>`
            : `<button class="lw-redeem" data-action="coupon-ask" data-index="${i}"
                title="请爸爸妈妈亲手点击确认兑现">家长核销</button>`;
        return `<li class="lw-record${c.used ? " used" : ""}">
          <span class="ico">${PRIZE_ICON[c.id] || "🎁"}</span>
          <span class="lw-record-main"><b>${c.label}</b><time>${c.date || ""}</time></span>
          ${action}
        </li>`;
      }).join("")
      : `<li class="lw-history-empty">还没有抽奖记录，转一转试试手气吧</li>`;
    return `<div class="overlay"><div class="sheet lucky-wheel-sheet">
      <div class="grab"></div>
      <header class="lw-head">
        <span class="lw-deco d1">✦</span><span class="lw-deco d2">✦</span>
        <h2>星星幸运大转盘</h2>
        <p>${hint}</p>
      </header>
      <div class="lw-chips">
        <span class="lw-chip"><i>★</i>星星 <b>${fmt(balance)}</b></span>
        <span class="lw-chip free"><i>🎁</i>免费机会 <b>${free}</b></span>
      </div>
      <div class="lw-stage">
        <div class="lw-rim" aria-hidden="true"></div>
        <div class="lw-pointer" aria-hidden="true"></div>
        <div class="lw-disc" id="lucky-wheel-disc" style="background:conic-gradient(${gradient})">${labels}<span class="lw-hub">🦖</span></div>
      </div>
      <button class="btn lw-spin-btn" data-action="wheel-spin" ${disabled ? "disabled" : ""}>${btnText}</button>
      <section class="lw-history">
        <div class="lw-history-head"><h3>抽奖记录</h3><span>已抽 ${coupons.length} 次 · 兑换请家长核销</span></div>
        <ul class="lw-history-list">${records}</ul>
      </section>
    </div></div>`;
  }

  let spinning = false;
  let confirmAsk = -1;

  function open(opts) {
    confirmAsk = -1;
    sfx("tap");
    openOverlay(buildOverlay(Boolean(opts && opts.fromChest)));
  }

  function spin() {
    if (spinning) return;
    if (spinsToday() >= DAILY_LIMIT) {
      toast(`今天已经转满 ${DAILY_LIMIT} 次啦，明天再来哦！`);
      return;
    }
    const free = pendingSpins();
    const balance = starBalance();
    /* 优先消耗宝箱赠送的免费机会，其次才花星星 */
    if (free <= 0 && balance < WHEEL_COST) {
      toast(`还需要 ${WHEEL_COST - balance} ★ 才能转转盘哦！`);
      return;
    }
    spinning = true;
    if (free > 0) state.spins = free - 1;
    else state.stars = balance - WHEEL_COST;
    if (state.spinDay !== todayKey()) { state.spinDay = todayKey(); state.spinCount = 0; }
    state.spinCount = (Number(state.spinCount) || 0) + 1;
    save();

    const winIdx = pickWeightedIndex(REWARD_POOL);
    const segAngle = 360 / REWARD_POOL.length;
    /* 转 5 圈，让中奖扇区中心停在顶部指针下 */
    const stopDeg = 360 * 5 + (360 - winIdx * segAngle - segAngle / 2);
    const disc = document.getElementById("lucky-wheel-disc");
    if (disc) disc.style.transform = `rotate(${stopDeg}deg)`;
    sfx("coin");

    setTimeout(() => {
      const prize = REWARD_POOL[winIdx];
      if (!Array.isArray(state.coupons)) state.coupons = [];
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      state.coupons.unshift({
        id: prize.id,
        label: prize.label,
        date: `${now.getMonth() + 1}月${now.getDate()}日 ${pad(now.getHours())}:${pad(now.getMinutes())}`,
        used: false,
      });
      save();
      spinning = false;
      sfx("win");
      toast(`🎉 恭喜抽中：【${prize.label}】！快找爸爸妈妈兑换吧~`);
      const root = document.getElementById("overlay-root");
      if (root && root.querySelector(".lucky-wheel-sheet")) openOverlay(buildOverlay(false));
      render();
    }, 3900);
  }

  /* 家长核销：先点「家长核销」进入确认，再由家长点「确认」 */
  function askRedeem(i) {
    if (!Array.isArray(state.coupons) || !state.coupons[i] || state.coupons[i].used) return;
    confirmAsk = i;
    openOverlay(buildOverlay(false));
  }

  function cancelRedeem() {
    confirmAsk = -1;
    openOverlay(buildOverlay(false));
  }

  function redeem(i) {
    const c = Array.isArray(state.coupons) ? state.coupons[i] : null;
    if (!c || c.used) return;
    c.used = true;
    confirmAsk = -1;
    save();
    sfx("win");
    toast(`已核销：「${c.label}」，请家长兑现奖励`);
    openOverlay(buildOverlay(false));
  }

  window.LuckyWheel = { open, spin, askRedeem, cancelRedeem, redeem };
})();
