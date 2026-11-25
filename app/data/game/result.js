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
       前 4 关基础练习：3 题；第 5/10/15… 关考核关：5 题
       星级只按答对题数计算，不作为是否过关的门槛 */
    const assessment = window.isAssessmentLevel
      ? isAssessmentLevel(quiz.level)
      : Number(quiz.level) % 5 === 0;
    const total = quizSize(quiz.level);
    const correct = Math.min(quiz.correct, total);
    const accuracy = correct / total;
    const enlighten = Boolean(state.enlighten);
    /* 每关都按答对题数发 1~3 星：普通关 3 题答对 1/2/3 → 1/2/3 星；
       考核关 5 题答对 3/4/5 → 1/2/3 星 */
    const stars = assessment
      ? (correct >= 5 ? 3 : correct >= 4 ? 2 : correct >= 3 ? 1 : 0)
      : (correct >= 3 ? 3 : correct >= 2 ? 2 : correct >= 1 ? 1 : 0);
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
    const growthGain = isReplay ? 0 : correct * 24;
    const elapsed = Math.max(5, Math.round((Date.now() - quiz.startedAt) / 1000));
    state.growth += growthGain;
    state.stars += starGain;
    if (best > 0) prog.stars[completedLevel] = best;
    /* 完成结算即可推进到下一关，重玩旧关卡不影响进度 */
    if (!isReplay) prog.level = Math.min(levelsPerTheme(), completedLevel + 1);
    prog.cleared[completedLevel] = true;
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
    if (isAnimalFinalBoss(completedLevel) && window.ChestManager) {
      lastResult.bossClear = true;
      if (!ChestManager.isAllCleared()) lastResult.bossChests = ChestManager.rewardBossClear();
      lastResult.allCleared = ChestManager.isAllCleared();
    }

    go("result", { replace: true });
  }

  /* 每日随机挑战结算页：5 颗星、可爱恐龙、鼓励语，展示本局单词 */
  function screenDailyResult(r) {
    /* 星级按答对题数计：一题一星 */
    const title = r.stars >= 5 ? "满星通关！" : r.stars >= 4 ? "太厉害啦！" : "挑战完成！";
    const mm = String(Math.floor(r.seconds / 60)).padStart(2, "0");
    const ss = String(r.seconds % 60).padStart(2, "0");
    /* 五颗星（一题一星），用比闯关略小的尺寸 */
    const starRow = [0, 1, 2, 3, 4].map((i) =>
      star(i === 2 ? 54 : 44, i < r.stars ? "#FFC94A" : "#EFE4CE", i < r.stars ? "#E09A2B" : "#D6C5A7", i < r.stars ? 1 : 0.55)
    ).join("");
    /* 无条件飘彩纸屑（v2 骨架统一） */
    const confettiPieces = Array.from({ length: 20 }, (_, i) => {
      const colors = ["#FFC94A", "#FF8A4C", "#68BE83", "#9FDCF2", "#F4B4C6"];
      const w = 5 + (i % 3) * 2, h = 8 + (i % 4) * 3;
      return `<i style="left:${(i * 41 + 9) % 100}%;top:${(i * 23 + 4) % 45}%;width:${sz(w)};height:${sz(h)};background:${colors[i % 5]};transform:rotate(${(i * 47) % 180 - 90}deg);opacity:${0.4 + (i % 4) * 0.12};border-radius:${i % 3 === 0 ? "50%" : "0.125rem"};animation-delay:${(i % 7) * 0.06}s;animation-duration:${1.4 + (i % 4) * 0.2}s"></i>`;
    }).join("");
    /* 单词 chip：带 ok/no 标记 */
    const chips = r.wordList.map((w) => `<span class="dv2-chip ${w.ok ? "ok" : "no"}">${w.word} ${w.ok ? "✓" : "✗"}</span>`).join("");

    /* 按钮：右侧主按钮为「再抽一次」（次数用完时禁用），左侧次要按钮为「回地图」 */
    const leftBtn = `<button type="button" class="rs2-btn secondary" data-action="close-quiz">回地图</button>`;
    const rightBtn = r.dailyLeft > 0
      ? `<button type="button" class="rs2-btn primary" data-action="daily-start">再抽一次（剩 ${r.dailyLeft}） ▶</button>`
      : `<button type="button" class="rs2-btn primary" disabled>明天再来 🌙</button>`;

    return `<section class="screen result-page result-stage-v2 daily-v2" data-screen="result">
    <button class="circle-btn result-close" data-action="close-quiz" aria-label="关闭">${I.close(16)}</button>
    <div class="rs2-rays" aria-hidden="true"></div>
    <div class="rs2-hill" aria-hidden="true"></div>
    <div class="confetti">${confettiPieces}</div>

    <header class="rs2-hero">
      <h1 class="rs2-title">${title}</h1>
      <div class="rs2-sub">DAILY · 答对 ${r.correct}/${r.total} · 得 ${r.stars}★</div>
      <div class="rs2-stars dv2-stars">${starRow}</div>
      <div class="rs2-dino">${dino(state.stage)}</div>
    </header>

    <div class="rs2-tray-wrap">
      <div class="rs2-tray">
        <div class="rs2-pills">
          <div class="rs2-pill star">
            <span class="rs2-pill-ic">${star(15, "#FFE07D", "#C88B22")}</span>
            <span class="num">+${r.starGain} 星星</span>
          </div>
          <div class="rs2-pill daily">
            <span class="rs2-pill-ic">🎲</span>
            <span class="num">剩 ${r.dailyLeft} 次</span>
          </div>
        </div>

        <div class="dv2-stats">
          <div class="ds-stat"><b>${r.accuracy}%</b><span>正确率</span></div>
          <div class="ds-stat"><b>${mm}:${ss}</b><span>用时</span></div>
          <div class="ds-stat"><b>${r.total} 题</b><span>本局总量</span></div>
        </div>

        <div class="dv2-chips-row" aria-label="本局单词">
          ${chips}
        </div>

        <div class="rs2-actions">
          ${leftBtn}
          ${rightBtn}
        </div>

        <div class="dv2-note">
          ${r.enlighten ? "启蒙模式 · " : ""}随机挑战不推进关卡，不计成长值
        </div>
      </div>
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
    const growPct = isUltra ? 1 : atMax ? clamp(state.growth / ULTRA_MIN, 0, 1) : pending ? 1 : pct;
    const growPctNum = Math.round(growPct * 100);
    /* 进度条小恐龙头像滑块位置限制在 8% ~ 94%，避免贴边溢出 */
    const headLeft = Math.max(8, Math.min(94, growPctNum));

    const evoText = isUltra
      ? "究极体已解锁 · 可在图鉴切换形态"
      : atMax
        ? (ultraOpen
            ? `究极体兑换已开放（<b>${ULTRA_PRICE}★/只</b>）`
            : `距 <b>究极体兑换</b> 还差 <b>${Math.max(0, ULTRA_MIN - state.growth)}</b>`)
      : pending
        ? `成长值已满 · 可以进化为 <b>${target.name}</b>！`
        : next
          ? `距 <b>${next.name}</b> 还差 <b>${Math.max(0, next.min - state.growth)}</b>`
          : "已达成最高形态";

    /* 关卡进度与按钮逻辑：完成结算即可进入下一关 */
    const progNow = themeProgress();
    const nextLevel = Math.min(progNow.level, r.level + 1);
    const nextCleared = nextLevel < progNow.level || Boolean(progNow.cleared && progNow.cleared[nextLevel]);
    const canNext = !nextCleared;
    const canReplay = r.best < 3;

    /* 顶部主标题 */
    const titleText = r.bossClear
      ? `BOSS · 全部通关!`
      : `LEVEL ${String(r.level).padStart(2, "0")} · ${r.replay ? "复习完成" : "闯关完成"}`;

    /* 弧形三颗大星 */
    const starRow = [0, 1, 2].map((i) =>
      star(
        i === 1 ? 74 : 58,
        i < r.best ? "#FFC94A" : "#EFE4CE",
        i < r.best ? "#E09A2B" : "#D6C5A7",
        i < r.best ? 1 : 0.65
      )
    ).join("");

    /* 本关可点读无框动物圆标（最多展示 3 个，点击直接触发全局 speak-word 朗读） */
    const rawWords = r.wordList && r.wordList.length
      ? r.wordList
      : (state.unlocked || []).slice(-3).map((k) => k.slice(k.lastIndexOf(":") + 1));
    const uniqueWords = [...new Set(rawWords)].slice(0, 3);
    const lib = window.DINO_WORD_LIBRARY || {};
    const wordItemsHtml = uniqueWords.map((w, idx) => {
      const meta = lib[w] || {};
      const imgSrc = meta.img || `images/words/animal/${w}.webp`;
      const emoji = meta.emoji || "🐾";
      return `<button type="button" class="rs2-word-item" data-action="speak-word" data-word="${esc(w)}" aria-label="朗读 ${w}">
      <span class="rs2-word-pic t${idx % 3}">
        <img src="${imgSrc}" alt="${esc(w)}" loading="eager" onerror="wordArtFallback(this)">
        <span class="art-fallback" style="display:none">${emoji}</span>
      </span>
      <span class="rs2-word-label"><span>${esc(w)}</span>${I.speaker(16, "#B48A5A")}</span>
    </button>`;
    }).join("");

    /* 轻柔飘落彩纸屑 */
    const confettiPieces = Array.from({ length: 20 }, (_, i) => {
      const colors = ["#FFC94A", "#FF8A4C", "#68BE83", "#9FDCF2", "#F4B4C6"];
      const w = 5 + (i % 3) * 2, h = 8 + (i % 4) * 3;
      return `<i style="left:${(i * 41 + 9) % 100}%;top:${(i * 23 + 4) % 45}%;width:${sz(w)};height:${sz(h)};background:${colors[i % 5]};transform:rotate(${(i * 47) % 180 - 90}deg);opacity:${0.4 + (i % 4) * 0.12};border-radius:${i % 3 === 0 ? "50%" : "0.125rem"};animation-delay:${(i % 7) * 0.06}s;animation-duration:${1.4 + (i % 4) * 0.2}s"></i>`;
    }).join("");

    /* 左侧辅助按钮：未满星可重新挑战，已满星直接返回地图 */
    const leftBtn = canReplay
      ? `<button type="button" class="rs2-btn secondary" data-action="start-quiz" data-level="${r.level}">重新挑战</button>`
      : `<button type="button" class="rs2-btn secondary" data-action="close-quiz">返回地图</button>`;

    /* 右侧主按钮：满足进化条件优先引导进化 */
    const rightBtn = pending
      ? `<button type="button" class="rs2-btn primary evolve" data-action="evolve">✨ 见证进化 ▶</button>`
      : canNext
        ? `<button type="button" class="rs2-btn primary" data-action="start-quiz" data-level="${nextLevel}">继续下一关 ▶</button>`
        : `<button type="button" class="rs2-btn primary" data-action="close-quiz">回地图看看 ▶</button>`;

    return `<section class="screen result-page result-stage-v2" data-screen="result">
    <button class="circle-btn result-close" data-action="close-quiz" aria-label="关闭">${I.close(16)}</button>
    <div class="rs2-rays" aria-hidden="true"></div>
    <div class="rs2-hill" aria-hidden="true"></div>
    <div class="confetti">${confettiPieces}</div>

    <header class="rs2-hero">
      <h1 class="rs2-title${r.bossClear ? " is-boss" : ""}">${titleText}</h1>
      ${r.bossClear && r.bossChests ? `<div class="rs2-sub">🎁 额外获得 ${r.bossChests} 个神秘宝箱</div>` : ""}
      <div class="rs2-stars">${starRow}</div>
      <div class="rs2-dino">${dino(state.stage)}</div>
    </header>

    <div class="rs2-tray-wrap">
      <div class="rs2-tray">
        <div class="rs2-pills">
          <div class="rs2-pill exp">
            <span class="rs2-pill-ic">${I.leaf(15, "#FFFFFF")}</span>
            <span class="num">+${r.growthGain} 成长值</span>
          </div>
          <div class="rs2-pill star">
            <span class="rs2-pill-ic">${star(15, "#FFE07D", "#C88B22")}</span>
            <span class="num">+${r.starGain} 星星</span>
          </div>
        </div>

        <div class="rs2-evo">
          <div class="rs2-evo-txt">${evoText}</div>
          <div class="rs2-evo-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${growPctNum}">
            <div class="rs2-evo-fill" style="width:${growPctNum}%"></div>
            <span class="rs2-evo-head" style="left:${headLeft}%">
              <img src="${avatarArtSrc()}" alt="">
            </span>
          </div>
        </div>

        <div class="rs2-words" aria-label="本关收获单词">
          ${wordItemsHtml}
        </div>

        <div class="rs2-actions">
          ${leftBtn}
          ${rightBtn}
        </div>
      </div>
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
    const fromIdx = stageIndex(info.from.key);
    const toIdx = stageIndex(info.to.key);
    const fromSrc = info.from.key === "ultra"
      ? `images/dino/ultra-${Math.min(ULTRA_ART.length, Math.max(1, Number(state.ultraSkin) || 1))}.webp`
      : `images/dino/${info.from.key}.webp`;
    const toSrc = info.to.key === "ultra"
      ? `images/dino/ultra-${Math.min(ULTRA_ART.length, Math.max(1, Number(state.ultraSkin) || 1))}.webp`
      : `images/dino/${info.to.key}.webp`;

    const subNote = info.to.key === "ultra"
      ? "4 种究极体机甲形态可在图鉴中自由切换"
      : "已收录进图鉴，外形和能力都更强了！";

    return `<section class="screen" data-screen="evolution" style="background:#FBF3E3">
    <div class="evo-page evo-stage-v2">
      <button class="circle-btn result-close" data-action="home" aria-label="回到乐园">${I.close(16)}</button>
      <div class="ev2-rays" aria-hidden="true"></div>
      <div class="ev2-hill" aria-hidden="true"></div>

      <header class="ev2-top-wrap">
        <div class="ev2-milestone">${spark(11, "#E9A93C")} MILESTONE ${String(toIdx).padStart(2, "0")} / ${String(EVOLVE_MAX_INDEX).padStart(2, "0")}</div>
        <h1 class="ev2-title">进化成功！</h1>
        <div class="ev2-stages">
          <span class="ev2-st">${info.from.name} · LV.${fromIdx + 1}</span>
          <span class="ev2-st-arr" aria-hidden="true">→</span>
          <span class="ev2-st is-new">${I.crownMini(13, "#8A5B15")} ${info.to.name} · LV.${toIdx + 1}</span>
        </div>
      </header>

      <div class="ev2-hero">
        <div class="ev2-halo" aria-hidden="true"></div>
        <div class="ev2-orbit" aria-hidden="true"></div>
        <div class="ev2-dino">${dino(info.to.key)}</div>
      </div>

      <div class="ev2-tray-wrap">
        <div class="ev2-tray">
          <div class="ev2-pills">
            <div class="ev2-pill gold">
              <span>✨ 新形态 · ${info.to.name}</span>
            </div>
            <div class="ev2-pill sage">
              <span>${info.isNew ? "+1 图鉴收录" : "图鉴已收录"}</span>
            </div>
            ${info.dexReward ? `<div class="ev2-pill gold"><span>🎁 解锁「${info.dexReward}」</span></div>` : ""}
          </div>

          <div class="ev2-compare">
            <div class="ev2-avatars" aria-hidden="true">
              <span class="ev2-ava from"><img src="${fromSrc}" alt=""></span>
              <span class="ev2-ava-arr">→</span>
              <span class="ev2-ava to"><img src="${toSrc}" alt=""></span>
            </div>
            <div class="ev2-desc">
              ${subNote}
              <small>首次闯关答对越多，成长值奖励越高</small>
            </div>
          </div>

          <button type="button" class="ev2-cta" data-action="home">太棒了，继续冒险 ▶</button>
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
