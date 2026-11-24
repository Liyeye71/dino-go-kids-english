/* ============================================================
   DinoGo · 恐龙英语 — 乐园（home）
   底部 Tab 1：首页 + 成长档案 + 随机记单词弹层
   ============================================================ */

/* ------------------------------------------------ home */
let reviewWord = null;
let voiceRec = null;
let voiceChunks = [];
let voiceUrl = "";
let voiceTimer = null;

/* 头像图标：直接用恐龙大图 + CSS 裁切头部，与 hero 完全一致 */
function avatarArtSrc() {
  if (state.stage === "ultra") {
    const skin = Math.min(ULTRA_ART.length, Math.max(1, Number(state.ultraSkin) || 1));
    return `images/dino/ultra-${skin}.webp`;
  }
  return `images/dino/${state.stage}.webp`;
}

function resetVoice() {
  if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = null; }
  if (voiceRec && voiceRec.state !== "inactive") {
    try { voiceRec.stop(); } catch (e) {}
  }
  voiceRec = null;
  voiceChunks = [];
  if (voiceUrl) { URL.revokeObjectURL(voiceUrl); voiceUrl = ""; }
}

function setRecBtn(label, recording) {
  const btn = $('[data-action="record-say"]');
  if (!btn) return;
  btn.classList.toggle("recording", !!recording);
  btn.innerHTML = recording ? `<span class="rec-dot"></span>${label}` : `${I.speaker(18)} ${label}`;
}

async function recordSay() {
  if (voiceRec && voiceRec.state === "recording") {
    if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = null; }
    voiceRec.stop();
    return;
  }
  if (!navigator.mediaDevices || !window.MediaRecorder) { toast("当前浏览器不支持录音"); return; }
  setRecBtn("准备录音…", true);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
  };
  setTimeout(release, 12000);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceChunks = [];
    voiceRec = new MediaRecorder(stream);
    voiceRec.ondataavailable = (e) => { if (e.data && e.data.size) voiceChunks.push(e.data); };
    voiceRec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
      const blob = new Blob(voiceChunks, voiceRec.mimeType ? { type: voiceRec.mimeType } : {});
      voiceUrl = URL.createObjectURL(blob);
      setRecBtn("重新跟读", false);
      if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = null; }
      toast("录好啦，点「回放声音」听一听");
      release();
    };
    voiceRec.start();
    let left = 5;
    setRecBtn(`录音中 ${left}s · 点击结束`, true);
    voiceTimer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(voiceTimer); voiceTimer = null;
        if (voiceRec && voiceRec.state === "recording") voiceRec.stop();
        return;
      }
      setRecBtn(`录音中 ${left}s · 点击结束`, true);
    }, 1000);
  } catch (e) {
    setRecBtn("跟着读", false);
    release();
    toast("无法使用麦克风，请允许录音权限");
  }
}

function playVoice() {
  if (!voiceUrl) { toast("还没有录音，先跟着读一次吧"); return; }
  const audio = new Audio(voiceUrl);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
  };
  audio.addEventListener("ended", release, { once: true });
  audio.addEventListener("error", release, { once: true });
  setTimeout(release, 12000);
  audio.play().catch(() => { release(); toast("播放失败，请再试一次"); });
}

/* 每日随机学单词按单元解锁状态抽取：advance 未解锁时只取 basic，解锁后 basic + advance 都取 */
function randomWord() {
  const advanceOpen = !(UNIT_BY_ID.get("advance") || {}).locked;
  const pool = advanceOpen
    ? REVIEW_WORDS
    : REVIEW_WORDS.filter((w) => (w.attrs || []).includes("basic"));
  const list = pool.length ? pool : REVIEW_WORDS;
  return list[Math.floor(Math.random() * list.length)];
}
function wordPosLabel(w) { return w.pos === "verb" ? "phr." : "n."; }

/* -------- 例句直接从单词自带的 example 字段取 --------
   REVIEW_WORDS 里的单词全部有人工 example（noun.js / verb.js） */
function generateExample(word) {
  const en = (word.example || "").replace(/\{word\}/gi, word.word);
  return { en, zh: "" };
}


function todayLevels() {
  return (state.log[dateKey()] || {}).levels || 0;
}
function streakDays() {
  let n = 0;
  const d = new Date();
  if (!(state.log[dateKey(d)] || {}).levels) d.setDate(d.getDate() - 1);
  while ((state.log[dateKey(d)] || {}).levels) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
function tasksData(lv, streak) {
  return [
    { done: !!state.tasks.level, color: "orange", icon: I.flag, title: "完成 1 次闯关", sub: state.tasks.level ? "今日目标已达成" : "还差 1 次，约 3 分钟", reward: "+60 成长值" },
    { done: lv >= 1, color: "blue", icon: I.book, title: "学会 5 个新单词", sub: `已掌握 ${Math.min(5, lv * 5)} / 5 个`, reward: "+40 成长值" },
    { done: streak >= 7, color: "coral", icon: I.flame, title: "连续学习 7 天", sub: streak ? `已连续 ${streak} 天` : "今天开始计数", reward: "+20 星星" },
  ];
}

/* 长单词自适应缩放，避免文案溢出卡片 */
function fitHomeWord() {
  const el = document.querySelector(".w-word");
  if (!el) return;
  const box = el.closest(".w-main, .bc-sign-board");
  if (!box) return;
  el.style.fontSize = "";
  const base = parseFloat(getComputedStyle(el).fontSize) || 36;
  const avail = box.clientWidth;
  const need = el.scrollWidth;
  if (avail > 0 && need > avail) {
    el.style.fontSize = `${Math.max(18, Math.floor((base * avail) / need) - 1)}px`;
  }
}


const DINO_GREETINGS = [
  "Hi! 今天去哪玩?",
  "Roar! 准备出发啦!",
  "点我一起学英语!",
  "Let's explore!",
  "You are awesome!",
];
let dinoGreetIdx = 0;

function pokeDinoInteraction(btn) {
  sfx("star");
  dinoGreetIdx = (dinoGreetIdx + 1) % DINO_GREETINGS.length;
  const bubble = $(".bc-bubble");
  if (bubble) bubble.textContent = DINO_GREETINGS[dinoGreetIdx];
  if (btn) {
    btn.classList.remove("is-poked");
    void btn.offsetWidth;
    btn.classList.add("is-poked");
    setTimeout(() => btn.classList.remove("is-poked"), 580);
    const stage = btn.closest(".bc-dino-stage");
    if (stage) {
      ["💛", "✨", "💚"].forEach((sym, i) => {
        const sp = document.createElement("span");
        sp.className = "bc-heart-pop";
        sp.textContent = sym;
        sp.style.setProperty("--hx", `${(i - 1) * 34}px`);
        sp.style.animationDelay = `${i * 75}ms`;
        stage.appendChild(sp);
        setTimeout(() => sp.remove(), 950);
      });
    }
  }
}

function screenHome() {
  const st = stageMeta(state.stage);
  const next = nextStage(st.key);
  const pending = next && state.growth >= next.min;
  const pct = next ? clamp((state.growth - st.min) / (next.min - st.min), 0, 1) : 1;
  const atMax = st.key === "super";
  const isUltra = st.key === "ultra";
  const ultraOpen = ultraExchangeOpen();
  const ultraPct = clamp(state.growth / ULTRA_MIN, 0, 1);
  const barPct = isUltra ? 1 : atMax ? ultraPct : pct;
  const lv = todayLevels();
  const streak = streakDays();
  const tasks = tasksData(lv, streak);
  const doneCount = tasks.filter((t) => t.done).length;
  const hasReward = doneCount < 3 || Number(state.spins) > 0;
  const word = reviewWord || (reviewWord = randomWord());
  const dinoCls = state.stage === "ultra" ? "ultra" : "";
  const evoReady = pending || (atMax && ultraOpen);
  const evoAction = isUltra || (atMax && ultraOpen) ? "open-ultra-dex" : pending ? "evolve" : "growth-info";
  const evoSub = isUltra ? "究极体已解锁" : evoReady ? "可进化 · 点我!" : `成长 ${Math.round(barPct * 100)}% · 连续${streak}天`;
  const ringC = 138.23;
  const ringOffset = (ringC * (1 - barPct)).toFixed(2);

  const tentSvg = `<svg viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <ellipse cx="60" cy="84" rx="44" ry="8" fill="#4F8A45" opacity=".28"/>
    <path d="M60 14 L60 4" stroke="#5C411D" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M60 4 L80 10 L60 16 Z" fill="#FF8A4C" stroke="#5C411D" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M16 82 L60 16 L104 82 Z" fill="#FFE6AC" stroke="#5C411D" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M40 82 L60 44 L80 82 Z" fill="#8C6232" stroke="#5C411D" stroke-width="3" stroke-linejoin="round"/>
  </svg>`;
  const wordsBagSvg = `<svg viewBox="0 0 104 96" fill="none" aria-hidden="true">
    <ellipse cx="52" cy="84" rx="34" ry="7" fill="#4F8A45" opacity=".25"/>
    <path d="M36 26 C36 14 68 14 68 26" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
    <rect x="20" y="26" width="64" height="54" rx="18" fill="#FFD766" stroke="#5C411D" stroke-width="3.5"/>
    <rect x="28" y="48" width="48" height="22" rx="9" fill="#FFFDF7" stroke="#5C411D" stroke-width="2.6"/>
    <path d="M40 59 H64" stroke="#2E8B57" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="52" cy="38" r="5" fill="#FF8A4C" stroke="#5C411D" stroke-width="2.2"/>
  </svg>`;
  const nestSvg = `<svg viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <circle cx="60" cy="48" r="38" fill="#FFD766" opacity="${hasReward ? ".28" : ".12"}"/>
    <ellipse cx="60" cy="76" rx="44" ry="15" fill="#C89B63" stroke="#5C411D" stroke-width="3.5"/>
    <ellipse cx="60" cy="72" rx="34" ry="9" fill="#9E723C"/>
    <ellipse cx="60" cy="50" rx="22" ry="29" fill="#FFFDF7" stroke="#5C411D" stroke-width="3.5"/>
    <circle cx="51" cy="43" r="5" fill="#FF8A4C" opacity=".82"/>
    <circle cx="68" cy="54" r="6" fill="#FFD766" opacity=".9"/>
    <circle cx="54" cy="62" r="4" fill="#3FA46A" opacity=".78"/>
  </svg>`;
  const fernSvg = `<svg class="bc-fern left" viewBox="0 0 110 90" fill="none" aria-hidden="true">
    <path d="M12 88 Q28 42 74 14" stroke="#1E6B47" stroke-width="4" stroke-linecap="round"/>
    <path d="M24 68 C8 54 14 32 32 38 C38 52 34 62 24 68 Z" fill="#7AC766" stroke="#1E6B47" stroke-width="2.5"/>
    <path d="M44 48 C34 26 54 14 66 28 C64 42 54 48 44 48 Z" fill="#9BE382" stroke="#1E6B47" stroke-width="2.5"/>
    <path d="M42 66 C60 56 82 62 84 78 C68 84 52 78 42 66 Z" fill="#63B848" stroke="#1E6B47" stroke-width="2.5"/>
  </svg>`;
  const fernSvgR = fernSvg.replace('class="bc-fern left"', 'class="bc-fern right"');

  return `<section class="screen basecamp-screen ${heroSkyClass()}" data-screen="home">
    ${skyFx()}
    <div class="hero-deco" aria-hidden="true">
      ${skyPhase() === "night" ? `<span class="firefly x1"></span><span class="firefly x2"></span><span class="firefly x3"></span><span class="firefly x4"></span><span class="firefly x5"></span>` : ""}
    </div>
    <div class="bc-hills" aria-hidden="true"><div class="bc-hill h1"></div><div class="bc-hill h2"></div><div class="bc-hill h3"></div></div>
    ${fernSvg}${fernSvgR}

    <header class="bc-hud">
      <button class="bc-evo-hud ${evoReady ? "is-ready" : ""}" data-action="${evoAction}" aria-label="恐龙成长与进化">
        <span class="bc-ring-wrap">
          <svg class="bc-ring-svg" viewBox="0 0 52 52" aria-hidden="true">
            <circle class="bc-ring-track" cx="26" cy="26" r="22"></circle>
            <circle class="bc-ring-fill" cx="26" cy="26" r="22" stroke-dasharray="${ringC}" stroke-dashoffset="${ringOffset}"></circle>
          </svg>
          <span class="bc-ring-ava"><img src="${avatarArtSrc()}" alt=""></span>
        </span>
        <span class="bc-evo-info">
          <span class="bc-evo-stage">小诺 · ${st.name}</span>
          <span class="bc-evo-sub">${evoSub}</span>
        </span>
      </button>
      <div class="bc-hud-right">
        ${starPill()}
        <button class="parent-gate" data-action="parent-gate" aria-label="家长角，长按 1.5 秒进入">${I.lock(14)}<span>家长</span></button>
      </div>
    </header>

    <div class="bc-world" data-basecamp-world>
      <button class="bc-prop bc-prop-tent" data-action="tab" data-screen="collect" aria-label="恐龙图鉴与换装">
        ${tentSvg}<span class="bc-prop-label">图鉴 · 装扮</span>
      </button>
      <button class="bc-prop bc-prop-words" data-action="tab" data-screen="words" aria-label="我的单词本">
        ${wordsBagSvg}<span class="bc-prop-label">单词本</span>
      </button>
      <div class="bc-dino-stage">
        <div class="bc-bubble">${DINO_GREETINGS[dinoGreetIdx]}</div>
        <div class="bc-dino-pad"></div>
        <div class="bc-dino-shadow"></div>
        <button class="bc-dino-btn ${dinoCls}" data-action="poke-dino" aria-label="和小恐龙小诺互动">${dino(state.stage)}</button>
      </div>
      <button class="bc-prop bc-prop-nest ${hasReward ? "has-reward" : ""}" data-action="nest-open" aria-label="恐龙蛋巢奖励与今日任务">
        ${nestSvg}
        ${Number(state.spins) > 0 ? `<span class="bc-prop-badge">${state.spins}</span>` : doneCount < 3 ? `<span class="bc-prop-badge">${3 - doneCount}</span>` : ""}
        <span class="bc-prop-label">蛋巢奖励</span>
      </button>
      <div class="bc-word-sign">
        <div class="bc-sign-board">
          <div class="bc-sign-top">
            <span class="bc-sign-tag">每日一词</span>
            <div style="display:flex;gap:0.2rem">
              <button class="bc-sign-mini-btn" data-action="speak-word" data-word="${word.word}" aria-label="朗读 ${word.word}">${I.speaker(13, "#B4811C")}</button>
              <button class="bc-sign-mini-btn" data-action="next-home-word" aria-label="换一个单词">${I.refresh(12, "#8C6232")}</button>
            </div>
          </div>
          <button type="button" style="width:100%" data-action="open-review" aria-label="打开单词跟读 ${word.word}">
            <span class="bc-sign-word w-word">${word.word}</span>
            <span class="bc-sign-zh">${word.zh} · 点我跟读</span>
          </button>
        </div>
        <div class="bc-sign-post"></div>
      </div>
    </div>

    <div class="bc-cta-bar">
      <button class="bc-play-btn" data-action="tab" data-screen="map" aria-label="进入恐龙乐园闯关">
        <span>▶</span><span>进入恐龙乐园闯关！</span>
      </button>
    </div>
  </section>`;
}


/* ------------------------------------------------ profile */
function screenProfile() {
  const st = stageMeta(state.stage);
  const labels = ["一", "二", "三", "四", "五", "六", "日"];
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const days = labels.map((label, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow + i);
    const rec = state.log[dateKey(date)] || { levels: 0 };
    return [label, rec.levels * 2, Math.min(76, 12 + rec.levels * 24), i === dow];
  });
  const weekMin = days.reduce((n, d) => n + d[1], 0);
  const streak = streakDays();
  const ach = [
    { cls: "a1", icon: I.flame(24, "#7A4E08"), name: "连续 7 天", done: streak >= 7, sub: streak >= 7 ? "已获得" : `还差 ${Math.max(1, 7 - streak)} 天` },
    { cls: "a2", icon: I.book(24, "#265A80"), name: "单词达人", done: state.words >= 100, sub: `${state.words} / 100 词` },
    { cls: "a3", icon: star(24, "#7A5BB8", "#6A4DA8"), name: "三星收藏", done: state.threeStars >= 1, sub: `${state.threeStars} 次` },
    { cls: "lock", icon: I.lock(20, "#C0B7A4"), name: "待解锁", done: false, sub: "???" },
  ];
  const wordsCount = state.words;
  return `<section class="screen" data-screen="profile">
    <div class="scroll profile-scroll">
      <div class="profile-head">
        <button class="circle-btn" data-action="home" aria-label="返回">${I.back(18)}</button>
        <div class="t"><h1>成长档案</h1><p>${state.name} · 和小诺一起长大的第 1 天</p></div>
        <button class="circle-btn" data-action="settings" aria-label="设置">${I.gear(19)}</button>
      </div>

      <div class="profile-card">
        <svg class="leaf" viewBox="0 0 100 100"><path d="M96 96C92 52 68 20 24 6c8 34 24 58 48 70-18-12-32-26-40-44 24 20 44 42 64 64z" fill="#8FC47A"/></svg>
        <div class="pc-ava"><img class="ava-icon" src="${avatarArtSrc()}" alt=""></div>
        <div class="pc-main"><b>${state.name}</b><span class="lv">LV.${stageIndex(state.stage) + 1}</span><p>加入 1 天 · 累计闯关 ${totalLevelsDone()} 次</p></div>
        <div class="pc-stage"><span class="chip">${I.leaf(11)} ${st.name}</span><p>图鉴 No.${String(stageIndex(state.stage) + 1).padStart(3, "0")}</p></div>
      </div>

      <div class="stat-row">
        <div class="stat-card"><div class="v">${star(13)}<span class="num">${fmt(starBalance())}</span></div><div class="k">我的星星</div></div>
        <div class="stat-card"><div class="v num">${wordsCount}</div><div class="k">已学单词</div></div>
        <div class="stat-card"><div class="v num">${state.dex.length}</div><div class="k">已收集恐龙</div></div>
      </div>

      <div class="card chart-card">
        <div class="ch-head">
          <div><div class="lb">WEEKLY REPORT · 本周学习</div><div class="v">${weekMin} <small>分钟</small></div></div>
          <div class="goal">目标 10 分钟 ${weekMin >= 10 ? "✓" : ""}</div>
        </div>
        <div class="chart">
          <div class="gl"></div>
          ${days.map(([d, mins, h, today]) => `<div class="col ${today ? "today" : ""}">
            ${today ? `<span class="tip">${mins}′</span>` : ""}
            <div class="b" style="height:${h}px"></div><span class="d">${d}</span>
          </div>`).join("")}
        </div>
      </div>

      <div class="card ach-card">
        <div class="ach-head"><b>成就徽章</b><span>${ach.filter((a) => a.done).length} / 12 已点亮</span></div>
        <div class="ach-list">${ach.map((a) => `<div class="ach">
          <div class="medal ${a.cls}">${a.icon}${a.done ? `<span class="dot">${I.check(8)}</span>` : ""}</div>
          <b>${a.name}</b><span>${a.sub}</span>
        </div>`).join("")}</div>
      </div>

      <div class="quote-card">
        <div class="qi">${I.flame(18, "#E2A62E")}</div>
        <div class="q">小诺说：「今天也一起学 10 分钟吧，我离超级霸王龙又近了一步！」</div>
      </div>

      <div class="profile-cta"><button class="btn" data-action="start-quiz">去闯关，帮小诺进化 <span class="hint">+120 EXP</span></button></div>
    </div>
  </section>`;
}


function openNest() {
  const lv = todayLevels();
  const streak = streakDays();
  const tasks = tasksData(lv, streak);
  const doneCount = tasks.filter((t) => t.done).length;
  const spins = Number(state.spins) || 0;
  openOverlay(`<div class="overlay">
    <div class="sheet nest-sheet">
      <div class="grab"></div>
      <div class="nest-sheet-head">
        <h2>恐龙蛋巢</h2>
        <span class="nest-sheet-count">${doneCount}/3</span>
      </div>
      <div class="sheet-sub">今日任务每天 0 点刷新，攒下的免费抽奖机会不会过期。</div>
      <div class="nest-tasks">
        ${tasks.map((t) => `<div class="task ${t.done ? "done" : ""}">
          <div class="ico ${t.color}">${t.icon(16)}</div>
          <div class="t-body"><div class="t-title">${t.title}</div><div class="t-sub">${t.sub}</div></div>
          <span class="reward">${t.reward}</span>
          <span class="check">${t.done ? I.check(11) : ""}</span>
        </div>`).join("")}
      </div>
      <button class="btn yellow nest-wheel" data-action="wheel-open">${I.gift(20, "#4C3306")} 打开 Dingo 恐龙转盘${spins ? `<span class="hint">免费 ${spins} 次</span>` : ""}</button>
      <div class="sheet-actions">
        <button class="btn ghost" data-action="close-overlay">完成</button>
      </div>
    </div>
  </div>`);
}


/* 成长路径抽屉：点击头像查看各阶段门槛与当前进度 */
function openGrowth() {
  const now = stageIndex(state.stage);
  const ultraLeft = Math.max(0, ULTRA_MIN - state.growth);
  const rows = STAGES.filter((s) => s.key !== "ultra").map((s, i) => {
    const reached = i <= now;
    const cur = i === now && state.stage !== "ultra";
    return `<div class="growth-row${reached ? " reached" : ""}${cur ? " current" : ""}">
      <span class="gr-dot"></span>
      <span class="gr-name">${s.name}<em>${s.phase}</em></span>
      <span class="gr-min num">${s.min} 成长值</span>
      <span class="gr-state">${cur ? "当前" : reached ? "已达成" : "未解锁"}</span>
    </div>`;
  }).join("");
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <h2>成长路径</h2>
      <div class="sheet-sub">答对题目和完成闯关都会攒成长值，攒满就能进化。自动进化到完全体后，究极体可用星星兑换。</div>
      <div class="growth-list">${rows}</div>
      <div class="ultra-note">究极体 · 已解锁 ${state.dex.includes("ultra") || (state.ultraOwned || []).includes(1) ? "是" : "否"}${ultraLeft ? ` · 还差 ${ultraLeft} 成长值` : " · 已开放星星兑换"}</div>
      <div class="sheet-actions">
        <button class="btn" data-action="close-overlay">知道啦</button>
      </div>
    </div>
  </div>`);
}

function openReview() {
  const w = reviewWord || (reviewWord = randomWord());
  resetVoice();
  openOverlay(`<div class="overlay">
    <div class="sheet word-sheet">
      <div class="grab"></div>
      <div class="eyebrow">RANDOM WORDS</div>
      <button class="word-art" data-action="speak-word" data-word="${w.word}" aria-label="播放 ${w.word} 发音">${w.art()}</button>
      <button class="word-big" data-action="speak-word" data-word="${w.word}" aria-label="播放 ${w.word} 发音">${w.word}</button>
      <div class="word-phon">${w.phon}</div>
      <div class="word-zh">${wordPosLabel(w)} ${w.zh}</div>
      <div class="tip">例句：${w.example}</div>
      <button class="btn speak-btn" data-action="record-say">${I.speaker(18)} 跟着读</button>
      <div class="sheet-actions">
        <button class="btn ghost" data-action="play-voice">${I.speaker(18)} 回放声音</button>
        <button class="btn" data-action="close-overlay">我记住啦</button>
      </div>
    </div>
  </div>`);
}
