/* ============================================================
   DinoGo · 恐龙英语 — 闯关结算与恐龙进化
   由 chest.js 拆出：结算页 finishQuiz/screenResult，进化页 beginEvolution/screenEvolution
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     闯关结算
     ============================================================ */
  /* 每日随机挑战结算：一题一星，答对 1 题得 1★，不推进关卡、不计成长值、不入学习日志 */
  function finishDailyQuiz() {
    const total = quiz.order.length || 1;
    const correct = Math.min(quiz.correct, total);
    const stars = Math.min((quiz.starIndex || []).length, total);
    const enlighten = Boolean(state.enlighten);
    const seconds = Math.max(1, Math.round((Date.now() - quiz.startedAt) / 1000));
    const wordList = quiz.order.map((q) => ({ word: q.word, ok: quiz.words.indexOf(q.word) >= 0 }));
    state.stars = starBalance() + stars;
    lastResult = {
      mode: "daily",
      level: 0,
      total,
      correct,
      stars,
      starGain: stars,
      best: stars,
      growthGain: 0,
      accuracy: Math.round((correct / total) * 100),
      seconds,
      passed: true,
      enlighten,
      dailyLeft: dailyChallengeLeft(),
      wordList,
    };
    quiz = null;
    save();
    sfx(correct >= 5 ? "win" : correct >= 3 ? "coin" : "answer-right");
    go("result", { replace: true });
  }

  function finishQuiz() {
    if (!quiz) return;
    if (quiz.mode === "daily") { finishDailyQuiz(); return; }
    /* 每 5 关一个循环：
       前 4 关基础练习：3 题，0 星，答对 ≥1 题过关
       第 5/10/15… 关考核关：5 题，答对 3/4/5 → 1/2/3 星，答对 ≥4 题（2 星）过关 */
    const assessment = window.isAssessmentLevel
      ? isAssessmentLevel(quiz.level)
      : Number(quiz.level) % 5 === 0;
    const total = assessment ? BOSS_QUIZ_SIZE : QUIZ_SIZE;
    const correct = Math.min(quiz.correct, total);
    const accuracy = correct / total;
    const enlighten = Boolean(state.enlighten);
    /* 每关都按答对题数发 1~3 星：普通关 3 题答对 1/2/3 → 1/2/3 星；
       考核关 5 题答对 3/4/5 → 1/2/3 星 */
    const stars = assessment
      ? (correct >= 5 ? 3 : correct >= 4 ? 2 : correct >= 3 ? 1 : 0)
      : (correct >= 3 ? 3 : correct >= 2 ? 2 : correct >= 1 ? 1 : 0);
    /* 启蒙模式可以一直答到正确，只要完成本题就算过关；星星只按首答正确数发放 */
    const passed = enlighten ? true : (assessment ? correct >= 4 : correct >= 1);
    const prog = themeProgress();
    const completedLevel = quiz.level;
    const prevBest = prog.stars[completedLevel] || 0;
    const best = Math.max(prevBest, stars);
    /* 基础关不产出星星；考核关按最高星结算 */
    const bestGain = Math.max(0, best - prevBest);
    /* 已通关判定：末关通过后 prog.level 不再增长，靠 cleared 标记区分首通与重玩 */
    const alreadyCleared = Boolean(prog.cleared && prog.cleared[completedLevel]);
    const isReplay = alreadyCleared || completedLevel < prog.level;
    /* 重玩未满星关卡：只发放星级增量，可把这一关补到满星；成长值仍不重复发放 */
    const starGain = bestGain;
    const growthGain = isReplay ? 0 : (passed ? correct * 24 : Math.round(correct * 12));
    const elapsed = Math.max(5, Math.round((Date.now() - quiz.startedAt) / 1000));
    state.growth += growthGain;
    state.stars += starGain;
    if (best > 0) prog.stars[completedLevel] = best;
    /* 只有挑战当前关卡且达到过关线才推进进度，重玩旧关卡不影响进度 */
    if (passed && !isReplay) prog.level = Math.min(levelsPerTheme(), completedLevel + 1);
    if (passed) prog.cleared[completedLevel] = true;
    /* 单词数由解锁列表决定，同一单词答对多次不会重复计数 */
    state.words = Array.isArray(state.unlocked) ? state.unlocked.length : 0;
    const newUnlocked = [...new Set(quiz.newWords || [])];
    /* 三星收藏只在首次拿到 3 星时 +1，重玩补到满星同样计入 */
    if (stars === 3 && prevBest < 3) state.threeStars += 1;
    state.tasks.level = true;
    /* 学习日志记录本次实际获得的星星，重玩不虚增 */
    recordLevel(starGain);
    const target = stageForGrowth(state.growth);
    const canEvolve = stageIndex(target.key) > stageIndex(state.stage);
    lastResult = {
      level: completedLevel,
      replay: isReplay,
      prevBest,
      best,
      correct: quiz.correct,
      total,
      assessment,
      accuracy: Math.round(accuracy * 100),
      stars,
      enlighten,
      passed,
      growthGain,
      starGain,
      seconds: elapsed,
      newWords: newUnlocked.length,
      canEvolve,
      targetStage: target.key,
      wordList: newUnlocked.slice(0, 5),
    };
    quiz = null;
    save();
    sfx(stars === 3 ? "win" : "coin");

    /* 🔥 总 BOSS 关（第 50 关 动物欢乐马戏团）通关额外奖励：仅首次全通关发放 */
    if (isAnimalFinalBoss(completedLevel) && passed && window.ChestManager) {
      lastResult.bossClear = true;
      if (!ChestManager.isAllCleared()) lastResult.bossChests = ChestManager.rewardBossClear();
      lastResult.allCleared = ChestManager.isAllCleared();
    }

    go("result", { replace: true });
  }

  /* 每日随机挑战结算页：5 颗星、可爱恐龙、鼓励语，展示本局单词 */
  function screenDailyResult(r) {
    const dino = `<svg class="dd-dino" viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="106" rx="30" ry="5.5" fill="#EAD9B8" opacity=".55"/>
      <path d="M92 84c8 1 13 5 15 11-6 1-12-1-16-5z" fill="#63C682"/>
      <path d="M30 90c-4-22 6-44 30-44 22 0 32 17 32 36 0 9-7 14-16 14H46c-9 0-16-2-16-6z" fill="#63C682"/>
      <path d="M38 84c-2-16 5-32 22-32 15 0 23 12 23 26 0 6-5 10-11 10H48c-6 0-10-1-10-4z" fill="#8BDDA4" opacity=".55"/>
      <path d="M56 40l4-10 5 9z" fill="#43A96A"/><path d="M70 34l5-9 4 9z" fill="#3FA464"/>
      ${r.stars >= 4
        ? `<path d="M45 64q5 6 10 0" stroke="#1D3A2E" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M69 64q5 6 10 0" stroke="#1D3A2E" stroke-width="3.4" fill="none" stroke-linecap="round"/>`
        : `<circle cx="50" cy="66" r="5.2" fill="#1D3A2E"/><circle cx="74" cy="66" r="5.2" fill="#1D3A2E"/><circle cx="51.8" cy="64" r="1.7" fill="#fff"/><circle cx="75.8" cy="64" r="1.7" fill="#fff"/>`}
      <path d="M53 77q8 9 16 0" stroke="#1D3A2E" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="41" cy="75" r="4.4" fill="#FFB3A7" opacity=".9"/><circle cx="83" cy="75" r="4.4" fill="#FFB3A7" opacity=".9"/>
    </svg>`;
    /* 星级按答对题数计：一题一星，视觉统一跟随 r.stars */
    const crown = r.stars >= 5 ? `<svg class="dd-crown" viewBox="0 0 48 34" aria-hidden="true">
      <path d="M4 27l3-18 9 8 7-13 7 13 9-8 3 18z" fill="#FFC94A" stroke="#E0A63F" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="7" cy="9" r="2.6" fill="#FF8A4C"/><circle cx="24" cy="4" r="2.8" fill="#FF6F61"/><circle cx="41" cy="9" r="2.6" fill="#FF8A4C"/>
    </svg>` : "";
    const title = r.stars >= 5 ? "满星通关！" : r.stars >= 4 ? "太厉害啦！" : "挑战完成！";
    const bubble = r.stars >= 5
      ? "全部答对，太神啦！"
      : `你答对了 ${r.correct} 个单词！`;
    const cheer = r.stars >= 5 ? "全对！你是今天的单词小达人 🎉"
      : r.stars >= 4 ? "只差 1 颗星就满星啦"
      : r.stars >= 3 ? "不错哦！再答对 2 题就满星啦"
      : "没关系，明天再来挑战一次";
    const paw = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="15.5" rx="5.2" ry="4.4"/><ellipse cx="5.4" cy="9.6" rx="2.2" ry="2.7"/><ellipse cx="9.6" cy="6.6" rx="2.1" ry="2.6"/><ellipse cx="14.4" cy="6.6" rx="2.1" ry="2.6"/><ellipse cx="18.6" cy="9.6" rx="2.2" ry="2.7"/></svg>`;
    const starRow = [0, 1, 2, 3, 4].map((i) =>
      star(i === 2 ? 58 : 50, i < r.stars ? "#FFC94A" : "#F1E7D2", i < r.stars ? "#E9A93C" : "#E5D7BC", i < r.stars ? 1 : 0.55)
    ).join("");
    const confetti = r.stars >= 4
      ? Array.from({ length: 14 }, (_, i) => {
          const left = 4 + Math.round(Math.random() * 92);
          const delay = (Math.random() * 0.9).toFixed(2);
          const dur = (1.6 + Math.random() * 0.9).toFixed(2);
          const size = 5 + Math.round(Math.random() * 4);
          const round = i % 3 === 0 ? "50%" : "0.125rem";
          return `<i style="left:${left}%;width:${sz(size)};height:${sz(size + 2)};background:${["#FFC94A", "#FF8A4C", "#5BC178", "#5FBCDA", "#FF6F61"][i % 5]};border-radius:${round};animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
        }).join("")
      : "";
    const mm = String(Math.floor(r.seconds / 60)).padStart(2, "0");
    const ss = String(r.seconds % 60).padStart(2, "0");
    const chips = r.wordList.map((w) => `<span class="w ${w.ok ? "ok" : "no"}">${w.word} ${w.ok ? "✓" : "✗"}</span>`).join("");
    return `<section class="screen result-page daily-result" data-screen="result">
      <div class="confetti" aria-hidden="true">${confetti}</div>
      <button class="circle-btn result-close" data-action="close-quiz" aria-label="关闭">${I.close(16)}</button>
      <div class="result-scroll">
        <div class="result-head">
          <div class="eyebrow">DAILY CHALLENGE · ${r.total} 题</div>
          <h1>${title}</h1>
          <div class="daily-mascot">
            <span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✧</span>
            ${crown}
            <div class="daily-bubble">${bubble}</div>
            ${dino}
          </div>
          <div class="result-stars daily-stars">${starRow}</div>
          <div class="result-sub">答对 <b>${r.correct} / ${r.total}</b> · 获得 <b>${r.stars}★</b> · ${r.dailyLeft > 0 ? `今天还能挑战 ${r.dailyLeft} 次` : "今天的次数用完啦"}</div>
          <div class="daily-cheer">${paw}${cheer}</div>
        </div>
        <div class="result-card daily-card">
          <div class="rc-top">
            <div class="rc-mode">
              <div class="g-ic">🎲</div>
              <div><div class="lb">本模式</div><div class="v">不计成长值</div></div>
            </div>
            <div class="rc-stars">${star(19)}<span class="num">+${r.starGain}</span></div>
          </div>
          <div class="rc-div"></div>
          <div class="rc-stats">
            <div class="rc-stat"><b class="g num">${r.accuracy}%</b><span>正确率</span></div>
            <div class="rc-stat"><b class="num">${mm}:${ss}</b><span>用时</span></div>
            <div class="rc-stat"><b class="num">${r.dailyLeft} 次</b><span>今日剩余</span></div>
          </div>
          <div class="daily-words"><span class="lb">本局单词</span>${chips}</div>
          <div class="paws" aria-hidden="true">${paw}${paw}</div>
        </div>
      </div>
      <div class="result-foot">
        ${r.dailyLeft > 0
          ? `<button class="btn" data-action="daily-start">再抽一次（剩 ${r.dailyLeft} 次）</button>`
          : `<button class="btn off" disabled>明天再来</button>`}
        <button class="btn ghost" data-action="close-quiz">回地图</button>
        <div class="foot-note">${r.enlighten ? "启蒙模式：答错直接公布答案 · " : ""}随机挑战不推进关卡进度，也不计入成长值</div>
      </div>
    </section>`;
  }

  function screenResult() {
    if (!lastResult) {
      setTimeout(() => go("home", { replace: true }), 0);
      return `<section class="screen"></section>`;
    }
    const r = lastResult;
    if (r.mode === "daily") return screenDailyResult(r);
    const st = stageMeta(state.stage);
    const next = nextStage(st.key);
    const pending = r.canEvolve && r.targetStage;
    const target = pending ? stageMeta(r.targetStage) : null;
    const pct = next ? clamp((state.growth - st.min) / (next.min - st.min), 0, 1) : 1;
    const atMax = st.key === "super";
    const isUltra = st.key === "ultra";
    const ultraOpen = ultraExchangeOpen();
    const ultraPct = clamp(state.growth / ULTRA_MIN, 0, 1);
    const growPct = isUltra ? 1 : atMax ? ultraPct : pending ? 1 : pct;
    const growMax = atMax || isUltra ? ULTRA_MIN : next ? next.min : "MAX";
    const growKicker = atMax || isUltra ? "ULTRA · 究极体兑换" : "EVOLUTION · 进化进度";
    const growTitle = isUltra
      ? `究极体形态已解锁<span>去图鉴切换喜欢的机甲恐龙</span>`
      : atMax
        ? (ultraOpen
            ? `究极体兑换已开放<span><b>${ULTRA_PRICE}★/只</b> · 去图鉴兑换</span>`
            : `再获得 <b>${Math.max(0, ULTRA_MIN - state.growth)}</b> 成长值<span>开放究极体兑换</span>`)
        : pending
          ? `${st.name} <b>→</b> ${target.name}<span><b>可以进化啦！</b></span>`
          : next
            ? `再获得 <b>${Math.max(0, next.min - state.growth)}</b> 成长值<span>进化为 <b>${next.name}</b></span>`
            : "已经达到最高形态";
    const growNote = isUltra
      ? "<b>究极体形态真威风！</b>去图鉴用星星兑换更多机甲恐龙吧"
      : atMax
        ? (ultraOpen
            ? "<b>收集图鉴的时间到啦！</b>用星星把喜欢的机甲恐龙带回家"
            : "<b>小诺今天也很开心！</b>继续积累成长值，就能开启究极体兑换")
        : pending
          ? "<b>小诺已经等不及啦！</b>点下面的按钮见证进化"
          : "<b>小诺今天也很开心！</b>再闯一关，就能继续长大";
    const mm = String(Math.floor(r.seconds / 60)).padStart(1, "0");
    const ss = String(r.seconds % 60).padStart(2, "0");
    /* 顺序解锁：通过后前往下一关，未通过留在本关重试；已无新关卡时只回地图 */
    const progNow = themeProgress();
    const nextLevel = Math.min(progNow.level, r.level + 1);
    const nextBtnLevel = r.passed ? nextLevel : r.level;
    const nextCleared = nextLevel < progNow.level || Boolean(progNow.cleared && progNow.cleared[nextLevel]);
    const canNext = !(r.passed && nextCleared);
    const isBase = !r.assessment;
    /* 星星展示：所有关卡都按答对题数发 1~3 星 */
    const showStars = true;
    /* 重玩未满星关卡：只复习错词，星级可补，成长值不重复发放 */
    const replaySub = "复习模式 · 优先抽取错词 · 星级可提升，成长值不重复发放";
    /* 手绘风对勾 / 叉号：粗圆头描边，比字体图标更有贴纸感 */
    const markOk = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8.5 21.2c3.1 3.5 5.4 6.4 7.2 8.8 4.7-8.4 9.8-14.3 15.8-18.6"/></svg>`;
    const markNo = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 11.2c5.1 4.6 10.3 9.5 15.4 15.1"/><path d="M26.1 11.5c-5.1 5.1-10.1 10.1-14.9 14.8"/></svg>`;
    const baseMarks = Array.from({ length: r.total }, (_, i) =>
      i < r.correct ? `<span class="mark ok">${markOk}</span>` : `<span class="mark no">${markNo}</span>`).join("");
    const starRow = [0, 1, 2].map((i) => star(i === 1 ? 80 : 62, i < r.best ? "#FFC94A" : "#F1E7D2", i < r.best ? "#E9A93C" : "#E5D7BC", i < r.best ? 1 : 0.55)).join("");
    const confettiPieces = Array.from({ length: 26 }, (_, i) => {
      const colors = ["#FFC94A", "#FF8A4C", "#5BC178", "#9FDCF2", "#B8A7FF", "#FF6F61"];
      const w = 5 + (i % 4) * 2, h = 8 + (i % 5) * 3;
      return `<i style="left:${(i * 37 + 13) % 100}%;top:${(i * 29 + 5) % 92}%;width:${sz(w)};height:${sz(h)};background:${colors[i % 6]};transform:rotate(${(i * 47) % 180 - 90}deg);opacity:${0.35 + (i % 5) * 0.1};border-radius:${i % 3 === 0 ? "50%" : "0.125rem"};animation-delay:${(i % 8) * 0.05}s;animation-duration:${1.2 + (i % 5) * 0.18}s"></i>`;
    }).join("");
    return `<section class="screen result-page" data-screen="result">
    <button class="circle-btn result-close" data-action="close-quiz" aria-label="关闭">${I.close(16)}</button>
    <div class="confetti">${confettiPieces}</div>
    <div class="result-scroll">
      <div class="result-head">
        ${r.bossClear ? `<div class="boss-banner">🔥 BOSS 击破！陆地动物园全部通关 🏆</div>` : ""}
        <div class="eyebrow">${r.bossClear ? "🔥 BOSS · LEVEL" : isBase ? "基础练习 · LEVEL" : "LEVEL"} ${String(r.level).padStart(2, "0")} · ${r.replay ? "REPLAY" : r.passed ? "COMPLETE" : "RETRY"}</div>
        ${isBase
          ? `<div class="base-marks">${baseMarks}</div>`
          : `<h1>${r.bossClear ? "BOSS 击破！你太厉害啦 🎉" : r.replay ? "重玩完成！" : r.passed ? "闯关完成！" : "再试一次吧"}</h1>`}
        ${r.bossClear && r.bossChests ? `<div class="boss-chest-reward"><span>🎁</span> 额外奖励 <b>${r.bossChests}</b> 个神秘宝箱<span>✨</span></div>` : ""}
        ${showStars ? `<div class="result-stars">${starRow}</div>` : ""}
        <div class="result-sub">${r.bossClear ? "动物园的所有动物都为你欢呼！去地图上开宝箱吧" : r.replay ? replaySub : isBase
          ? `每关最多 3★ · 本关最好 ${r.best}★${r.best < 3 ? " · 没满星可以重玩复习错词" : ""}`
          : `考核关 · 答对 ${r.correct}/5${r.passed ? " · 成功过关" : " · 需答对 4 题才能过关"}`}</div>
      </div>

      <div class="result-card">
        <div class="rc-top">
          <div class="rc-growth">
            <div class="g-ic">${I.leaf(28)}</div>
            <div><div class="lb">成长值</div><div class="v num">+${r.growthGain} <small>EXP</small></div></div>
          </div>
          ${showStars || r.starGain > 0
            ? `<div class="rc-stars">${star(19)}<span class="num">+${r.starGain}</span></div>`
            : `<div class="rc-stars base-none">基础关 · 无星星</div>`}
        </div>
        <div class="rc-div"></div>
        <div class="rc-stats">
          <div class="rc-stat"><b class="num">${r.accuracy}%</b><span>正确率</span></div>
          <div class="rc-stat"><b class="num">${mm}:${ss}</b><span>用时</span></div>
          <div class="rc-stat"><b class="num">${r.newWords}</b><span>解锁新词</span></div>
        </div>
        <div class="rc-words">
          <span class="lb">WORDS</span>
          ${(r.wordList.length ? r.wordList : (state.unlocked || []).slice(-3).map((k) => k.slice(k.lastIndexOf(":") + 1))).map((w) => `<span class="w">${w}</span>`).join("")}
        </div>
      </div>

      <section class="grow-card${pending ? " ready" : ""}">
        <div class="gc-top">
          <div class="gc-pet">
            <span class="halo"></span>
            <div class="dino">${dino(state.stage)}</div>
            <span class="gc-phase">${pending ? "可进化" : st.phase}</span>
          </div>
          <div class="gc-main">
            <div class="gc-kicker"><span class="lb">${growKicker}</span><span class="val num">${state.growth}<i> / ${growMax}</i></span></div>
            <div class="gc-title">${growTitle}</div>
            <div class="gc-bar"><i style="width:${Math.round(growPct * 100)}%"></i></div>
          </div>
        </div>
        <div class="gc-note"><span class="ic">${spark(11, pending ? "#D79A2B" : "#6E9A52")}</span><p>${growNote}</p></div>
      </section>
    </div>

    <div class="result-foot">
      ${pending && r.passed ? `<button class="btn" data-action="evolve">见证进化 ${I.arrow(18)}</button>` : canNext ? `<button class="btn" data-action="start-quiz" data-level="${nextBtnLevel}">${r.passed ? "再闯一关" : "再试一次"} ${I.arrow(18)}</button>` : `<button class="btn" data-action="close-quiz">回地图看看 ${I.arrow(18)}</button>`}
    </div>
  </section>`;
  }

  /* ============================================================
     恐龙进化
     ============================================================ */
  function beginEvolution() {
    const from = stageMeta(state.stage);
    /* 自动进化止步完全体，究极体改为图鉴星星兑换 */
    if (from.key === "super" || from.key === "ultra") {
      toast("已经进化到完全体啦，去图鉴用星星兑换究极体吧");
      go("home", { replace: true });
      return;
    }
    const to = stageForGrowth(state.growth);
    if (stageIndex(to.key) <= stageIndex(from.key)) {
      toast("成长值还不够，再去闯一关吧");
      go("home", { replace: true });
      return;
    }
    const wasInDex = state.dex.includes(to.key);
    const newDex = [...new Set([...state.dex, to.key])];
    state.stage = to.key;
    state.dex = newDex;
    let dexReward = null;
    if (state.dex.length >= 4 && !state.bgOwned.includes("sunset")) {
      state.bgOwned.push("sunset");
      dexReward = "落日山谷";
    }
    if (state.dex.length >= 6 && !state.bgOwned.includes("night")) {
      state.bgOwned.push("night");
      dexReward = "星空营地";
    }
    save();
    evolutionInfo = { from, to, isNew: !wasInDex, dexReward };
    sfx("evolve");
    go("evolution");
  }

  function screenEvolution() {
    if (!evolutionInfo) {
      setTimeout(() => go("home", { replace: true }), 0);
      return `<section class="screen"></section>`;
    }
    const info = evolutionInfo;
    const dots = Array.from({ length: 34 }, (_, i) => {
      const x = (i * 43 + 7) % 100, y = (i * 31 + 11) % 100, s = 1.5 + (i % 4) * 0.8;
      return `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;opacity:${0.2 + (i % 5) * 0.12}"></i>`;
    }).join("");
    return `<section class="screen" data-screen="evolution" style="background:#0F2E24">
    <div class="evo-page">
      <div class="bg"></div><div class="stars">${dots}</div>
      <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
      <div class="evo-inner">
        <div class="evo-top">
          <div class="tag">${spark(11, "#FFD25A")} MILESTONE ${String(stageIndex(info.to.key)).padStart(2, "0")} / ${String(EVOLVE_MAX_INDEX).padStart(2, "0")}</div>
          <button class="close" data-action="home" aria-label="回到乐园">${I.close(16)}</button>
        </div>
        <div class="evo-title">
          <div class="en">EVOLUTION COMPLETE</div>
          <h1>进化<em>成功</em>！</h1>
          <div class="evo-stage">
            <span class="st">${info.from.name} · LV.${stageIndex(info.from.key) + 1}</span>
            <span class="arr">${I.arrow(15, "#F2C860")}</span>
            <span class="st new">${I.crownMini(13, "#FFD25A")} ${info.to.name} · LV.${stageIndex(info.to.key) + 1}</span>
          </div>
        </div>
        <div class="evo-dino">
          <div class="glow"></div><div class="halo"></div>
          <span class="spark" style="left:8%;top:18%">${spark(22, "#FFE08A")}</span>
          <span class="spark" style="right:9%;top:10%">${spark(15, "#FFE08A")}</span>
          <span class="spark" style="right:14%;bottom:12%">${spark(11, "#FFE08A")}</span>
          <span class="spark" style="left:13%;bottom:16%">${spark(9, "#FFE08A")}</span>
          ${dino(info.to.key)}
        </div>
        <div class="evo-unlock">
          <div class="u-head"><span class="lb">NEW UNLOCK · 成长奖励</span><span class="nv">${info.isNew ? "+1 图鉴收录" : "图鉴已收录"}</span></div>
          <div class="u-main">
            <div class="u-ico">${I.crownMini(30, "#8A5B15")}</div>
            <div class="u-txt">
              <b>${info.to.name}</b>
              <span>${info.to.key === "ultra" ? "已收录进图鉴，4 种机甲形态可以在图鉴里自由切换" : "已收录进图鉴，外形和能力都更强了"}</span>
            </div>
            <div style="color:#FFD25A">${I.chevron(12)}</div>
          </div>
          <div class="u-skill">${spark(12, "#FFD25A")} 成长奖励：首次闯关答对越多，获得的成长值越高</div>
          ${info.dexReward ? `<div class="u-skill" style="border-top:0;padding-top:0.125rem">${I.gift(13)} 图鉴奖励：已解锁「${info.dexReward}」背景</div>` : ""}
          <button class="btn yellow" data-action="home">太棒了，继续冒险 ${I.arrow(18)}</button>
        </div>
      </div>
    </div>
  </section>`;
  }

  /* 结算 / 进化函数由其他模块按全局名调用，这里统一暴露 */
  window.finishQuiz = finishQuiz;
  window.screenResult = screenResult;
  window.beginEvolution = beginEvolution;
  window.screenEvolution = screenEvolution;
})();
