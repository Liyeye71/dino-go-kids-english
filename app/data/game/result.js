/* ============================================================
   DinoGo · 恐龙英语 — 闯关结算与恐龙进化
   由 chest.js 拆出：结算页 finishQuiz/screenResult，进化页 beginEvolution/screenEvolution
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     闯关结算
     ============================================================ */
  function finishQuiz() {
    if (!quiz) return;
    /* 普通关 3 题：答对 3/2/1 题 → 3/2/1 星，≥1 星过关
       BOSS 关 5 题：答对 5/4/3 题 → 3/2/1 星，≥4 题过关 */
    const isBoss = isAnimalBossLevel(quiz.level);
    const total = isBoss ? BOSS_QUIZ_SIZE : QUIZ_SIZE;
    const correct = Math.min(quiz.correct, total);
    const accuracy = correct / total;
    const stars = isBoss
      ? (correct >= 5 ? 3 : correct >= 4 ? 2 : correct >= 3 ? 1 : 0)
      : (correct >= 3 ? 3 : correct >= 2 ? 2 : correct >= 1 ? 1 : 0);
    const passed = isBoss ? correct >= 4 : correct >= 1;
    const growthGain = quiz.correct * 24;
    const prog = themeProgress();
    const completedLevel = quiz.level;
    const prevBest = prog.stars[completedLevel] || 0;
    const best = Math.max(prevBest, stars);
    /* 按最高星结算：重复复习只补发「刷新纪录」的差额星星 */
    const starGain = Math.max(0, best - prevBest);
    const isReplay = completedLevel < prog.level;
    const elapsed = Math.max(5, Math.round((Date.now() - quiz.startedAt) / 1000));
    state.growth += growthGain;
    state.stars += starGain;
    prog.stars[completedLevel] = best;
    /* 只有挑战当前关卡且达到 2 星才推进进度，复习旧关卡不影响进度 */
    if (passed && !isReplay) prog.level = Math.min(levelsPerTheme(), completedLevel + 1);
    state.words += quiz.correct;
    state.threeStars += stars === 3 ? 1 : 0;
    state.tasks.level = true;
    recordLevel(stars);
    const target = stageForGrowth(state.growth);
    const canEvolve = stageIndex(target.key) > stageIndex(state.stage);
    lastResult = {
      level: completedLevel,
      replay: isReplay,
      prevBest,
      best,
      correct: quiz.correct,
      total,
      isBoss,
      accuracy: Math.round(accuracy * 100),
      stars,
      passed,
      growthGain,
      starGain,
      seconds: elapsed,
      newWords: quiz.correct,
      canEvolve,
      targetStage: target.key,
      wordList: [...new Set(quiz.words)].slice(0, 5),
    };
    quiz = null;
    save();
    sfx(stars === 3 ? "win" : "coin");

    /* 🔥 总 BOSS 关（第 50 关 动物欢乐马戏团）通关额外奖励 */
    if (isAnimalFinalBoss(completedLevel) && passed && window.ChestManager) {
      const bossChests = ChestManager.rewardBossClear();
      lastResult.bossClear = true;
      lastResult.bossChests = bossChests;
      lastResult.allCleared = ChestManager.isAllCleared();
    }

    go("result", { replace: true });
  }

  function screenResult() {
    if (!lastResult) {
      setTimeout(() => go("home", { replace: true }), 0);
      return `<section class="screen"></section>`;
    }
    const r = lastResult;
    const st = stageMeta(state.stage);
    const next = nextStage(st.key);
    const pending = r.canEvolve && r.targetStage;
    const target = pending ? stageMeta(r.targetStage) : null;
    const pct = next ? clamp((state.growth - st.min) / (next.min - st.min), 0, 1) : 1;
    const mm = String(Math.floor(r.seconds / 60)).padStart(1, "0");
    const ss = String(r.seconds % 60).padStart(2, "0");
    /* 下一关若被阶段门槛挡住（每 5 关需前 4 关累计 8 星），引导回刷本阶段 */
    const nextLevel = Math.min(themeProgress().level, r.level + 1);
    const gateBlocked = r.passed && !canEnterLevel(nextLevel);
    const stageStart = Math.max(1, Math.floor((nextLevel - 1) / STAGE_SIZE) * STAGE_SIZE + 1);
    const nextBtnLevel = r.passed ? (gateBlocked ? stageStart : nextLevel) : r.level;
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
        <div class="eyebrow">${r.bossClear ? "🔥 BOSS · LEVEL" : "LEVEL"} ${String(r.level).padStart(2, "0")} · ${r.replay ? "REVIEW" : r.passed ? "COMPLETE" : "RETRY"}</div>
        <h1>${r.bossClear ? "BOSS 击破！你太厉害啦 🎉" : r.replay ? "复习完成！" : r.passed ? "闯关完成！" : "再试一次吧"}</h1>
        ${r.bossClear && r.bossChests ? `<div class="boss-chest-reward"><span>🎁</span> 额外奖励 <b>${r.bossChests}</b> 个神秘宝箱<span>✨</span></div>` : ""}
        <div class="result-stars">${starRow}</div>
        <div class="result-sub">${r.bossClear ? "动物园的所有动物都为你欢呼！去地图上开宝箱吧" : r.replay && r.stars < r.prevBest ? `本次 ${r.stars} 星 · 保留最高 ${r.prevBest} 星成绩` : r.isBoss ? `BOSS 关 · 答对 ${r.correct}/5${r.passed ? " · 成功过关" : " · 需答对 4 题才能过关"}` : r.best === 3 ? "三星通关 · 今天的你超厉害" : r.best === 2 ? "两星通关 · 继续加油" : r.best === 1 ? "一星通关 · 继续挑战可以拿更多星星" : "还差一点点，重新挑战这一关吧"}</div>
      </div>

      <div class="result-card">
        <div class="rc-top">
          <div class="rc-growth">
            <div class="g-ic">${I.leaf(28)}</div>
            <div><div class="lb">成长值</div><div class="v num">+${r.growthGain} <small>EXP</small></div></div>
          </div>
          <div class="rc-stars">${star(19)}<span class="num">+${r.starGain}</span></div>
        </div>
        <div class="rc-div"></div>
        <div class="rc-stats">
          <div class="rc-stat"><b class="num">${r.accuracy}%</b><span>正确率</span></div>
          <div class="rc-stat"><b class="num">${mm}:${ss}</b><span>用时</span></div>
          <div class="rc-stat"><b class="num">${r.newWords}</b><span>答对单词</span></div>
        </div>
        <div class="rc-words">
          <span class="lb">WORDS</span>
          ${(r.wordList.length ? r.wordList : themeWords().slice(0, 3).map((w) => w.word)).map((w) => `<span class="w">${w}</span>`).join("")}
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
            <div class="gc-kicker"><span class="lb">EVOLUTION · 进化进度</span><span class="val num">${state.growth}<i> / ${next ? next.min : "MAX"}</i></span></div>
            <div class="gc-title">${pending ? `${st.name} <b>→</b> ${target.name}<span><b>可以进化啦！</b></span>` : next ? `再获得 <b>${Math.max(0, next.min - state.growth)}</b> 成长值<span>进化为 <b>${next.name}</b></span>` : "已经达到最高形态"}</div>
            <div class="gc-bar"><i style="width:${pending ? 100 : Math.round(pct * 100)}%"></i></div>
          </div>
        </div>
        <div class="gc-note"><span class="ic">${spark(11, pending ? "#D79A2B" : "#6E9A52")}</span><p>${pending ? "<b>小诺已经等不及啦！</b>点下面的按钮见证进化" : "<b>小诺今天也很开心！</b>再闯一关，就能继续长大"}</p></div>
      </section>
    </div>

    <div class="result-foot">
      ${pending && r.passed ? `<button class="btn" data-action="evolve">见证进化 ${I.arrow(18)}</button>` : `<button class="btn" data-action="start-quiz" data-level="${nextBtnLevel}">${gateBlocked ? "回刷补星" : r.passed ? "再闯一关" : "再试一次"} ${I.arrow(18)}</button>`}
    </div>
  </section>`;
  }

  /* ============================================================
     恐龙进化
     ============================================================ */
  function beginEvolution() {
    const from = stageMeta(state.stage);
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
          <div class="tag">${spark(11, "#FFD25A")} MILESTONE ${String(stageIndex(info.to.key)).padStart(2, "0")} / 05</div>
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
          <div class="u-skill">${spark(12, "#FFD25A")} 解锁被动技能：闯关获得的星星 <b>+10%</b></div>
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
