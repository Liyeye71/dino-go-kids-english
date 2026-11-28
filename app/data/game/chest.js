/* ============================================================
   ChestManager · 神秘宝箱 + 星星幸运大转盘
   - 旅程里程碑：当前主题星数上限的 30% / 60% / 100%，各 1 个宝箱（共 3 个）
   - 打开宝箱 = 获得 1 次免费转盘机会，并直接进入转盘页面；不消耗星星
   - 未使用的转盘机会存入 state.spins，可保留到下次
   - 奖励池统一：宝箱与转盘共用 REWARD_POOL，抽中的奖品券记入 state.coupons
   - 存档：state.chests = { total, unlocked, claimed: { 进度键: [里程碑星数] } }
   ============================================================ */
(function () {
  "use strict";

  /* 里程碑：当前主题星数上限的 30% / 60% / 100%，每个主题各 3 个宝箱 */
  const MILESTONE_PCTS = [0.3, 0.6, 1];
  function milestonesFor(starMax) {
    const total = Number(starMax) || 30;
    const list = MILESTONE_PCTS.map((p) => Math.max(1, Math.round(total * p)));
    return list.filter((v, i) => list.indexOf(v) === i);
  }
  function currentStarMax(themeId) {
    return themeStarMax(themeId);
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
    /* 旅程进度条上的宝箱节点：由地图页渲染，点击走 chest-claim；themeId 用于按主题领取 */
    renderJourneyChests(key, starTotal, starMax, themeId) {
      const total = starMax || currentStarMax(themeId);
      const dataTheme = themeId ? ` data-theme="${themeId}"` : "";
      return milestoneStatus(key, starTotal, total).map((m) => {
        const pct = total ? Math.round((m.stars / total) * 100) : 0;
        const cls = m.done ? "done" : m.ready ? "ready" : "locked";
        const tip = m.done ? "已领取" : m.ready ? "点击开启" : `再获得 ${m.stars - starTotal} ★ 解锁`;
        return `<button type="button" class="j-chest ${cls}" style="left:${pct}%"
          data-action="chest-claim" data-threshold="${m.stars}"${dataTheme}
          aria-label="${pct}% 宝箱，${tip}" title="${pct}% 宝箱 · ${tip}"
          ${m.ready ? "" : "disabled"}>${m.done ? "✓" : "🎁"}</button>`;
      }).join("");
    },

    /* 领取旅程里程碑宝箱：成功后赠送 1 次免费转盘机会；themeId 指定领取哪个主题的进度 */
    claimJourney(threshold, themeId) {
      const s = _state();
      ensureChests();
      const tid = themeId || (s && s.theme);
      const starMax = currentStarMax(tid);
      /* 只接受该主题配置里的里程碑，防止无效入口 */
      if (milestonesFor(starMax).indexOf(threshold) < 0) return { status: "done", need: 0 };
      const key = activeProgressKey(tid);
      const starTotal = themeStars(themeProgress(tid));
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
     LuckyWheel · DINO SPIN 萌趣恐龙大转盘（抽屉版）
     - 宝箱开启后自动进入；优先消耗免费机会，其次花 6 ★
     ============================================================ */
  const WHEEL_COST = 6;
  const DAILY_LIMIT = 2;
  function spinsToday() {
    const s = _state();
    return s.spinDay === dateKey() ? Math.max(0, Number(s.spinCount) || 0) : 0;
  }
  /* 统一奖励池（12 种 · 面向 3-6 岁小朋友）：weight 总和 100，日常亲子陪伴与小奖励为主，小玩具/动物园/冰淇淋为低概率大奖
     配色统一为项目奶油+水彩体系：低饱和底色 + 深色墨水字，相邻扇区冷暖交替 */
  const REWARD_POOL = [
    { id: "story",    label: "睡前多讲1个故事", short: "讲故事",   color: "#CFE9C8", ink: "#2F5B3A", weight: 14, icon: "📚" },
    { id: "cartoon",  label: "看动画片10分钟",  short: "动画10分", color: "#FBEBC8", ink: "#6B4E1E", weight: 12, icon: "📺" },
    { id: "sticker",  label: "恐龙小贴纸1张",   short: "小贴纸",   color: "#E7D9F3", ink: "#51406E", weight: 13, icon: "🌈" },
    { id: "snack",    label: "挑1个小零食",     short: "小零食",   color: "#FAD9C2", ink: "#7A4526", weight: 8,  icon: "🍪" },
    { id: "game",     label: "一起玩积木20分",  short: "玩积木",   color: "#D4E4F2", ink: "#31536E", weight: 9,  icon: "🧩" },
    { id: "hug",      label: "骑大马举高高",    short: "骑大马",   color: "#F8DDE4", ink: "#7A4052", weight: 11, icon: "🐎" },
    { id: "park",     label: "去公园玩滑滑梯",  short: "去公园",   color: "#CFE9DE", ink: "#2A5747", weight: 7,  icon: "🌳" },
    { id: "craft",    label: "一起画画做手工",  short: "画画手工", color: "#F7EBC0", ink: "#6C5A20", weight: 10, icon: "🎨" },
    { id: "toy",      label: "买1个小玩具",     short: "小玩具",   color: "#F5CFC7", ink: "#7A3A31", weight: 3,  icon: "🧸" },
    { id: "zoo",      label: "周末去动物园",    short: "动物园",   color: "#DFEAC8", ink: "#46603A", weight: 4,  icon: "🦁" },
    { id: "book",     label: "挑1本新绘本",     short: "新绘本",   color: "#DCE0F5", ink: "#3B4473", weight: 5,  icon: "📖" },
    { id: "icecream", label: "吃1个小冰淇淋",   short: "冰淇淋",   color: "#FBE2CE", ink: "#7A4B2A", weight: 4,  icon: "🍦" },
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

  /* 构建并缓存 12 扇区 SVG 盘面（0 号扇区正对顶部指针） */
  let _wheelSvgCache = "";
  function buildWheelSVG() {
    if (_wheelSvgCache) return _wheelSvgCache;
    const cx = 200, cy = 200, r = 196;
    const sliceDeg = 360 / REWARD_POOL.length;
    const slices = REWARD_POOL.map((p, i) => {
      const a1 = (-90 - sliceDeg / 2 + i * sliceDeg) * Math.PI / 180;
      const a2 = (-90 + sliceDeg / 2 + i * sliceDeg) * Math.PI / 180;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      return `<g>
        <path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z"
          fill="${p.color}" stroke="#5C411D" stroke-width="2.4" stroke-linejoin="round" stroke-opacity=".55"/>
        <g transform="translate(${cx},${cy}) rotate(${i * sliceDeg})">
          <text x="0" y="-150" text-anchor="middle" fill="${p.ink}" font-size="12.5" font-weight="800">${p.short}</text>
          <text x="0" y="-116" text-anchor="middle" font-size="22">${p.icon}</text>
        </g>
      </g>`;
    }).join("");
    _wheelSvgCache = `<svg viewBox="0 0 400 400">${slices}</svg>`;
    return _wheelSvgCache;
  }

  /* 构建并缓存外圈 16 颗跑马灯灯泡 */
  let _bulbsSvgCache = "";
  function buildBulbsSVG() {
    if (_bulbsSvgCache) return _bulbsSvgCache;
    const cx = 180, cy = 180, r = 171;
    let dots = "";
    for (let i = 0; i < 16; i++) {
      const rad = ((i * 360) / 16 - 90) * Math.PI / 180;
      dots += `<circle cx="${(cx + r * Math.cos(rad)).toFixed(1)}" cy="${(cy + r * Math.sin(rad)).toFixed(1)}"
        r="5.5" class="${i % 2 === 0 ? "lw-bulb-a" : "lw-bulb-b"}" stroke="#B08E5C" stroke-width="1.5"/>`;
    }
    _bulbsSvgCache = `<svg class="lw-bulbs" viewBox="0 0 360 360" aria-hidden="true">${dots}</svg>`;
    return _bulbsSvgCache;
  }

  /* 礼花纸屑喷射 */
  function launchConfetti() {
    const colors = ["#2E8B57", "#E8A23C", "#FF8A4C", "#FF6F61", "#9BC98A", "#7FA8C9", "#C9A6D8", "#F2C6CE"];
    for (let i = 0; i < 36; i++) {
      const el = document.createElement("div");
      el.className = "lw-confetti";
      el.style.left = Math.random() * 100 + "vw";
      el.style.backgroundColor = colors[i % colors.length];
      el.style.borderRadius = i % 2 === 0 ? "50%" : "3px";
      el.style.setProperty("--tx", (Math.random() - 0.5) * 200 + "px");
      el.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      el.style.animationDuration = (1.5 + Math.random() * 1.3).toFixed(2) + "s";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }

  let spinning = false;
  let confirmAsk = -1;
  let lastWon = null;
  let currentDeg = 0;

  function buildOverlay(fromChest) {
    const free = pendingSpins();
    const balance = starBalance();
    const coupons = Array.isArray(state.coupons) ? state.coupons : [];
    const dailyLeft = Math.max(0, DAILY_LIMIT - spinsToday());

    let btnText;
    let disabled = false;
    if (dailyLeft <= 0) { btnText = `今天转满 ${DAILY_LIMIT} 次啦，明天再来`; disabled = true; }
    else if (free > 0) btnText = free > 1 ? `开始抽奖！免费转（剩 ${free} 次）` : "开始抽奖！免费转一次";
    else if (balance >= WHEEL_COST) btnText = `开始抽奖！花 ${WHEEL_COST} ★ SPIN!`;
    else { btnText = `还差 ${WHEEL_COST - balance} ★ 才能转哦`; disabled = true; }

    const baseHint = fromChest
      ? "宝箱开启成功！送你 1 次免费转盘机会"
      : free > 0
        ? "免费机会不消耗星星，未使用会保留到下次"
        : `每 ${WHEEL_COST} ★ 转一次，抽中的奖励找爸爸妈妈兑换`;
    const hint = `${baseHint}；今天还剩 ${dailyLeft}/${DAILY_LIMIT} 次`;

    const records = coupons.length
      ? coupons.map((c, i) => {
        const action = c.used
          ? `<span class="lw-used">已兑换</span>`
          : confirmAsk === i
            ? `<span class="lw-confirm">
                <button class="lw-mini ghost" data-action="coupon-cancel">取消</button>
                <button class="lw-mini" data-action="coupon-redeem" data-index="${i}">确认</button>
              </span>`
            : `<button class="lw-redeem" data-action="coupon-ask" data-index="${i}">家长核销</button>`;
        return `<li class="lw-record${c.used ? " used" : ""}">
          <span class="ico">${PRIZE_ICON[c.id] || "🎁"}</span>
          <span class="lw-record-main"><b>${c.label}</b><time>${c.date || ""}</time></span>
          ${action}
        </li>`;
      }).join("")
      : `<li class="lw-history-empty">还没有抽奖记录，转一转试试手气吧</li>`;

    const winPop = lastWon ? `<div class="lw-win-mask">
      <div class="lw-win-card">
        <div class="lw-win-ribbon">🎉 恭喜中奖啦！ 🎉</div>
        <div class="lw-win-ico">${lastWon.icon}</div>
        <h3>${lastWon.label}</h3>
        <p>已放入下方抽奖记录，快找爸爸妈妈兑换吧~</p>
        <button type="button" class="btn lw-win-ok" data-action="wheel-win-ok">开心收下！</button>
      </div>
    </div>` : "";

    return `<div class="overlay"><div class="sheet lucky-wheel-sheet">
      <div class="lw-paper">
      <div class="grab"></div>
      <button type="button" class="lw-close" data-action="close-overlay" aria-label="关闭转盘">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="#5C411D" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </button>
      <header class="lw-head">
        <span class="lw-deco d1">✦</span><span class="lw-deco d2">✦</span>
        <h2><span class="lw-brand">Dingo</span> 恐龙转盘</h2>
        <p>${hint}</p>
      </header>
      <div class="lw-chips">
        <span class="lw-chip"><i>★</i>星星 <b id="lw-star-val">${fmt(balance)}</b></span>
        <span class="lw-chip free"><i>🎁</i>免费机会 <b id="lw-free-val">${free}</b></span>
      </div>
      <div class="lw-stage">
        <div class="lw-stand" aria-hidden="true"></div>
        <div class="lw-pointer" id="lw-pointer" aria-hidden="true">
          <svg viewBox="0 0 60 72" width="100%" height="100%">
            <path d="M30,68 L8,26 A22,22 0 1,1 52,26 Z" fill="#FF6F61" stroke="#5C411D" stroke-width="4.5" stroke-linejoin="round"/>
            <circle cx="30" cy="24" r="10" fill="#FFF6E0" stroke="#5C411D" stroke-width="3.5"/>
            <circle cx="27" cy="21" r="3" fill="#FFF"/>
          </svg>
        </div>
        <div class="lw-rim" id="lw-rim">
          ${buildBulbsSVG()}
          <div class="lw-disc" id="lucky-wheel-disc" style="transform:rotate(${currentDeg}deg)">${buildWheelSVG()}</div>
          <span class="lw-hub" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 64 64">
              <path d="M18,52 C14,34 22,14 42,10 C38,24 42,38 48,48 C38,54 26,55 18,52 Z" fill="#2E8B57" stroke="#5C411D" stroke-width="3.5" stroke-linejoin="round"/>
              <polygon points="22,26 14,22 20,33" fill="#E8A23C" stroke="#5C411D" stroke-width="2.5"/>
              <polygon points="28,16 21,10 25,22" fill="#E8A23C" stroke="#5C411D" stroke-width="2.5"/>
              <polygon points="36,11 32,4 33,15" fill="#E8A23C" stroke="#5C411D" stroke-width="2.5"/>
            </svg>
          </span>
        </div>
      </div>
      <button class="btn lw-spin-btn" id="lw-spin-btn" data-action="wheel-spin" ${disabled ? "disabled" : ""}>${btnText}</button>
      <section class="lw-history">
        <div class="lw-history-head"><h3>抽奖记录</h3><span>已抽 ${coupons.length} 次 · 兑换请家长核销</span></div>
        <ul class="lw-history-list">${records}</ul>
      </section>
      </div>
      ${winPop}
    </div></div>`;
  }

  function open(opts) {
    confirmAsk = -1;
    lastWon = null;
    currentDeg = 0;
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

    ensureAudio();
    sfx("coin");
    spinning = true;
    lastWon = null;

    /* 1. 扣费 + 抽取中奖扇区 + 立刻写入存档（防中途刷新丢星星） */
    if (free > 0) state.spins = free - 1;
    else state.stars = balance - WHEEL_COST;
    if (state.spinDay !== dateKey()) { state.spinDay = dateKey(); state.spinCount = 0; }
    state.spinCount = (Number(state.spinCount) || 0) + 1;

    const winIdx = pickWeightedIndex(REWARD_POOL);
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

    /* 2. 更新顶部数字与按钮禁用态（不整页重绘，保持转盘流畅） */
    const starEl = document.getElementById("lw-star-val");
    const freeEl = document.getElementById("lw-free-val");
    const btnEl = document.getElementById("lw-spin-btn");
    const rimEl = document.getElementById("lw-rim");
    const discEl = document.getElementById("lucky-wheel-disc");
    const ptrEl = document.getElementById("lw-pointer");
    if (starEl) starEl.textContent = fmt(starBalance());
    if (freeEl) freeEl.textContent = pendingSpins();
    if (btnEl) btnEl.disabled = true;
    if (rimEl) rimEl.classList.add("spinning-fast");

    /* 3. requestAnimationFrame 物理缓动 + 跨扇区指针滴答声 */
    const sliceDeg = 360 / REWARD_POOL.length;
    const targetMod = (360 - winIdx * sliceDeg) % 360;
    const jitter = (Math.random() - 0.5) * (sliceDeg * 0.55);
    const curMod = ((currentDeg % 360) + 360) % 360;
    let delta = (targetMod - curMod + jitter + 360) % 360;
    if (delta < 60) delta += 360;

    const startRot = currentDeg;
    const targetRot = startRot + 6 * 360 + delta;
    const startTime = performance.now();
    const duration = 4200;
    let lastStep = Math.floor((startRot + sliceDeg / 2) / sliceDeg);

    function frame(ts) {
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4.2);
      const deg = startRot + (targetRot - startRot) * eased;
      if (discEl) discEl.style.transform = `rotate(${deg}deg)`;

      const step = Math.floor((deg + sliceDeg / 2) / sliceDeg);
      if (step !== lastStep) {
        lastStep = step;
        if (ptrEl) {
          if (typeof ptrEl.animate === "function") {
            ptrEl.animate(
              [{ transform: "rotate(-16deg)" }, { transform: "rotate(0deg)" }],
              { duration: 120, easing: "ease-out" }
            );
          } else {
            ptrEl.classList.remove("ticking");
            void ptrEl.offsetWidth;
            ptrEl.classList.add("ticking");
          }
        }
        if (state.sound && typeof tone === "function") tone(680, 0.04, "triangle", 0.055);
      }

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        currentDeg = targetRot;
        spinning = false;
        lastWon = prize;
        if (rimEl) rimEl.classList.remove("spinning-fast");
        sfx("win");
        launchConfetti();
        const root = document.getElementById("overlay-root");
        if (root && root.querySelector(".lucky-wheel-sheet")) openOverlay(buildOverlay(false));
        render();
      }
    }
    requestAnimationFrame(frame);
  }

  function closeWinPop() {
    lastWon = null;
    sfx("tap");
    openOverlay(buildOverlay(false));
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

  window.LuckyWheel = {
    open,
    spin,
    closeWinPop,
    askRedeem,
    cancelRedeem,
    redeem,
    isSpinning: () => spinning,
  };
})();
