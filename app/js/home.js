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

function resetVoice() {
  if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = null; }
  if (voiceRec && voiceRec.state !== "inactive") {
    try { voiceRec.stop(); } catch (e) {}
  }
  voiceRec = null;
  voiceChunks = [];
  if (voiceUrl) { URL.revokeObjectURL(voiceUrl); voiceUrl = ""; }
}

function cancelVoice() { resetVoice(); }

function setRecBtn(label, recording) {
  const btn = $('[data-action="record-say"]');
  if (!btn) return;
  btn.classList.toggle("recording", !!recording);
  btn.innerHTML = recording ? `<span class="rec-dot"></span>${label}` : `${I.speaker(18)} ${label}`;
}

async function recordSay() {
  if (voiceRec && voiceRec.state === "recording") return;
  if (!navigator.mediaDevices || !window.MediaRecorder) { toast("当前浏览器不支持录音"); return; }
  setRecBtn("准备录音…", true);
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
      setRecBtn("重录 · 5 秒", false);
      if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = null; }
      toast("录好啦，点「回放声音」听一听");
    };
    voiceRec.start();
    let left = 5;
    setRecBtn(`录音中 ${left}s`, true);
    voiceTimer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(voiceTimer); voiceTimer = null;
        if (voiceRec && voiceRec.state === "recording") voiceRec.stop();
        return;
      }
      setRecBtn(`录音中 ${left}s`, true);
    }, 1000);
  } catch (e) {
    setRecBtn("跟着读", false);
    toast("无法使用麦克风，请允许录音权限");
  }
}

function playVoice() {
  if (!voiceUrl) { toast("还没有录音，先跟着读一次吧"); return; }
  const audio = new Audio(voiceUrl);
  audio.play().catch(() => toast("播放失败，请再试一次"));
}

function randomWord() { return ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]; }

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
function tasksData() {
  const lv = todayLevels();
  const streak = streakDays();
  return [
    { done: !!state.tasks.level, color: "orange", icon: I.flag, title: "完成 1 次闯关", sub: state.tasks.level ? "今日目标已达成" : "还差 1 次，约 3 分钟", reward: "+60 成长值" },
    { done: lv >= 1, color: "blue", icon: I.book, title: "学会 5 个新单词", sub: `已掌握 ${Math.min(5, lv * 5)} / 5 个`, reward: "+40 成长值" },
    { done: streak >= 7, color: "coral", icon: I.flame, title: "连续学习 7 天", sub: streak ? `已连续 ${streak} 天` : "今天开始计数", reward: "+20 星星" },
  ];
}

function screenHome() {
  const st = stageMeta(state.stage);
  const next = nextStage(st.key);
  const pending = next && state.growth >= next.min;
  const pct = next ? clamp((state.growth - st.min) / (next.min - st.min), 0, 1) : 1;
  const tasks = tasksData();
  const doneCount = tasks.filter((t) => t.done).length;
  const word = reviewWord = randomWord();
  const remain = next ? Math.max(0, next.min - state.growth) : 0;
  let bubble;
  if (!next) bubble = `已经成长为<br><b>超级霸王龙</b>！<br>继续收集星星吧`;
  else if (pending) bubble = `成长值已满<br>快去<b>进化</b>吧！`;
  else bubble = `再获得 <b>${remain}</b> 成长值<br>就能进化成<br><b>${next.name}</b>！`;
  const dinoCls = state.stage === "ultra" ? "ultra" : "";
  return `<section class="screen has-tab" data-screen="home">
    <div class="scroll">
      <div class="home-top">
        <button class="avatar" data-action="profile" aria-label="成长档案"><span class="crop">${dino(state.stage)}</span></button>
        <div class="greet">
          <div class="hi">${greeting()}，<b>${state.name}</b></div>
          <div class="meta"><span class="flame">${I.flame(12)}</span> 连续 ${streakDays()} 天 · 今日已学 ${todayLevels() * 2} 分钟</div>
        </div>
        ${starPill()}
      </div>

      <section class="hero ${heroSkyClass()}">
        ${sceneHTML()}
        <div class="hero-id">
          <div class="stage-tag">${stageChip()}</div>
          <div class="name"><b>小诺</b></div>
        </div>
        <div class="bubble ${pending ? "max" : ""}">${bubble}</div>
        <div class="dino-wrap ${dinoCls} ${state.equipped.head ? "with-hat" : ""}">${dino(state.stage, { equipped: state.equipped })}</div>
        <div class="growth-panel">
          <div class="g-main">
            <div class="g-row"><span class="lb">成长值</span><span class="val num">${state.growth} <em>/ ${next ? next.min : "MAX"}</em></span></div>
            <div class="bar g-bar"><i style="width:${Math.round(pct * 100)}%"></i></div>
            <div class="g-next">
              <span>${!next ? "已达成最高形态" : pending ? "成长值已满，可以进化" : `距${next.name}还差 <b>${remain}</b>`}</span>
              <span>${Math.round(pct * 100)}%</span>
            </div>
          </div>
          <button class="go-btn ${pending ? "evolve" : ""}" data-action="${pending ? "evolve" : "start-quiz"}" aria-label="${pending ? "去进化" : "开始闯关"}">
            ${pending ? I.crownMini(22, "#4A3206") : I.arrow(19)}
          </button>
        </div>
      </section>

      <button class="word-card" data-action="open-review" aria-label="随机记单词 ${word.word}">
        <div class="ring"></div>
        <div class="spk">${I.speaker(21, "#B4811C")}</div>
        <div class="w-main">
          <div class="w-kicker">RANDOM WORDS · 随机记单词</div>
          <div class="w-word">${word.word}</div>
          <div class="w-phon">${word.phon} · n. ${word.zh}</div>
        </div>
        <div class="w-btn">去记单词 ${I.arrow(11)}</div>
      </button>

      <section class="card tasks">
        <div class="head">
          <h3>今日任务</h3><span class="count">${doneCount}/3</span>
          <span class="more">每日 0 点刷新</span>
        </div>
        ${tasks.map((t) => `<div class="task ${t.done ? "done" : ""}">
          <div class="ico ${t.color}">${t.icon(16)}</div>
          <div class="t-body"><div class="t-title">${t.title}</div><div class="t-sub">${t.sub}</div></div>
          <span class="reward">${t.reward}</span>
          <span class="check">${t.done ? I.check(11) : ""}</span>
        </div>`).join("")}
      </section>
      <div class="home-note">${todayLevels() ? `今天已学 ${todayLevels() * 2} 分钟 · 再闯 ${Math.max(0, 2 - todayLevels())} 关可以满星加成` : "今天还没闯关 · 完成 1 关点亮今日记录"}</div>
    </div>
    ${tabbar("home")}
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
    { cls: "a1", icon: I.flame(24, "#7A4E08"), name: "连续 7 天", sub: streak >= 7 ? "已获得" : `还差 ${Math.max(1, 7 - streak)} 天` },
    { cls: "a2", icon: I.book(24, "#265A80"), name: "单词达人", sub: `${state.words} / 100 词` },
    { cls: "a3", icon: star(24, "#7A5BB8", "#6A4DA8"), name: "三星收藏", sub: `${state.threeStars} 次` },
    { cls: "lock", icon: I.lock(20, "#C0B7A4"), name: "待解锁", sub: "???" },
  ];
  const decorCount = state.owned.length;
  return `<section class="screen" data-screen="profile">
    <div class="scroll profile-scroll">
      <div class="profile-head">
        <button class="circle-btn" data-action="home" aria-label="返回">${I.back(18)}</button>
        <div class="t"><h1>成长档案</h1><p>${state.name} · 和小诺一起长大的第 1 天</p></div>
        <button class="circle-btn" data-action="settings" aria-label="设置">${I.gear(19)}</button>
      </div>

      <div class="profile-card">
        <svg class="leaf" viewBox="0 0 100 100"><path d="M96 96C92 52 68 20 24 6c8 34 24 58 48 70-18-12-32-26-40-44 24 20 44 42 64 64z" fill="#8FC47A"/></svg>
        <div class="pc-ava"><div class="crop">${dino(state.stage)}</div></div>
        <div class="pc-main"><b>${state.name}</b><span class="lv">LV.${stageIndex(state.stage) + 1}</span><p>加入 1 天 · 累计闯关 ${totalLevelsDone()} 次</p></div>
        <div class="pc-stage"><span class="chip">${I.leaf(11)} ${st.name}</span><p>图鉴 No.${String(stageIndex(state.stage) + 1).padStart(3, "0")}</p></div>
      </div>

      <div class="stat-row">
        <div class="stat-card"><div class="v">${star(13)}<span class="num">${fmt(state.stars)}</span></div><div class="k">我的星星</div></div>
        <div class="stat-card"><div class="v num">${decorCount}</div><div class="k">已解锁装饰</div></div>
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
        <div class="ach-head"><b>成就徽章</b><span>3 / 12 已点亮</span></div>
        <div class="ach-list">${ach.map((a) => `<div class="ach">
          <div class="medal ${a.cls}">${a.icon}${a.cls !== "lock" ? `<span class="dot">${I.check(8)}</span>` : ""}</div>
          <b>${a.name}</b><span>${a.sub}</span>
        </div>`).join("")}</div>
      </div>

      <div class="quote-card">
        <div class="qi">${I.flame(18, "#E2A62E")}</div>
        <div class="q">小诺说：「今天也一起学 10 分钟吧，<br>我离超级霸王龙又近了一步！」</div>
      </div>

      <div class="profile-cta"><button class="btn" data-action="start-quiz">去闯关，帮小诺进化 <span class="hint">+120 EXP</span></button></div>
    </div>
  </section>`;
}


function openReview(next) {
  if (next) reviewWord = null;
  const w = reviewWord || (reviewWord = randomWord());
  resetVoice();
  openOverlay(`<div class="overlay">
    <div class="sheet word-sheet">
      <div class="grab"></div>
      <div class="eyebrow">RANDOM WORDS</div>
      <button class="word-art" data-action="speak-word" data-word="${w.word}" aria-label="播放 ${w.word} 发音">${w.art()}</button>
      <button class="word-big" data-action="speak-word" data-word="${w.word}" aria-label="播放 ${w.word} 发音">${w.word}</button>
      <div class="word-phon">${w.phon}</div>
      <div class="word-zh">n. ${w.zh}</div>
      <div class="tip">例句：${w.example}</div>
      <button class="btn speak-btn" data-action="record-say">${I.speaker(18)} 跟着读</button>
      <div class="sheet-actions">
        <button class="btn ghost" data-action="play-voice">${I.speaker(18)} 回放声音</button>
        <button class="btn" data-action="close-overlay">我记住啦</button>
      </div>
    </div>
  </div>`);
}
