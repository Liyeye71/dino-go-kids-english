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
  return dinoArtSrc(state.stage, state.ultraSkin);
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
    toast("无法使用麦克风，请允许录音权限");
  }
}

function playVoice() {
  if (!voiceUrl) { toast("还没有录音，先跟着读一次吧"); return; }
  const audio = new Audio(voiceUrl);
  audio.play().catch(() => toast("播放失败，请再试一次"));
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
  "哈哈，好痒呀! Hehe!",
  "High five! 击个掌!",
  "Good job! 你真棒!",
  "我最爱吃小星星啦 ★",
  "去动物园看看狮子吧!",
  "书包背好，上学去!",
  "嘀嘀! 坐小火车去旅行!",
  "Give me a hug! 抱抱!",
  "Yay! 再戳我一下!",
  "小恐龙正在长大哦!",
  "Super star! 超级小天才!",
  "肚子咕噜噜，快去闯关!",
  "Let's go! 冒险开始!",
  "今天也要开心学单词!",
  "Roar~ 我是最勇敢的小诺!",
];
let dinoGreetIdx = 0;

function pokeDinoInteraction(btn) {
  sfx("star");
  if (DINO_GREETINGS.length > 1) {
    let next = dinoGreetIdx;
    while (next === dinoGreetIdx) next = Math.floor(Math.random() * DINO_GREETINGS.length);
    dinoGreetIdx = next;
  }
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

/* 首页 CTA 按钮专用品牌 Logo（仅此一处使用，不再抽公共组件） */
const HOME_LOGO_SVG = `<svg class="bc-play-logo" width="720" height="136" viewBox="0 0 720 136" preserveAspectRatio="xMidYMid meet" role="img" aria-label="DinoGo 恐龙英语">
  <defs>
    <filter id="dinogo-sticker-shadow" x="-10%" y="-15%" width="120%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="#9A7242" flood-opacity="0.22"/>
    </filter>
    <!-- 小恐龙外轮廓（破壳版） -->
    <g id="dinogo-dino-shape" transform="translate(268.8 -3.6) scale(1.2556)">
      <path d="M78 24 Q88 18 87 30 Z"/>
      <path d="M86 38 Q97 35 93 47 Z"/>
      <path d="M36 62 C30 44 38 22 59 20 C79 18 90 36 86 62 Z"/>
      <path d="M24 62 L37 72 L49 58 L61 71 L74 58 L86 70 L96 62 C97 89 82 108 60 108 C38 108 23 89 24 62 Z"/>
      <ellipse cx="42" cy="64" rx="7" ry="4.5"/>
      <ellipse cx="78" cy="64" rx="7" ry="4.5"/>
    </g>
    <!-- 逐字歪头排版：DinoGo -->
    <g id="dinogo-text-en" text-anchor="middle" font-weight="400"
       font-family="'ZCOOL KuaiLe', ui-rounded, 'SF Pro Rounded', sans-serif">
      <text x="58"  y="89" font-size="68" transform="rotate(-8 58 89)">D</text>
      <text x="103" y="83" font-size="64" transform="rotate(6 103 83)">i</text>
      <text x="140" y="90" font-size="64" transform="rotate(-5 140 90)">n</text>
      <text x="186" y="84" font-size="64" transform="rotate(7 186 84)">o</text>
      <text x="236" y="90" font-size="68" transform="rotate(-6 236 90)">G</text>
      <text x="285" y="84" font-size="64" transform="rotate(6 285 84)">o</text>
    </g>
    <!-- 逐字歪头排版：恐龙英语 -->
    <g id="dinogo-text-zh" text-anchor="middle" font-weight="400"
       font-family="'ZCOOL KuaiLe', 'Hiragino Maru Gothic ProN', 'Yuanti SC', 'YouYuan', sans-serif">
      <text x="358" y="89" font-size="64" transform="rotate(-6 358 89)">恐</text>
      <text x="424" y="82" font-size="64" transform="rotate(5 424 82)">龙</text>
      <text x="490" y="90" font-size="64" transform="rotate(-5 490 90)">英</text>
      <text x="556" y="83" font-size="64" transform="rotate(6 556 83)">语</text>
    </g>
  </defs>

  <!-- 第 1 层：蛋壳白色模切贴纸外描边（文字不再加白边，直接以棕描边贴底） -->
  <g filter="url(#dinogo-sticker-shadow)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="26" stroke-linejoin="round" stroke-linecap="round">
    <use href="#dinogo-dino-shape" transform="translate(375 4) scale(0.84)"/>
  </g>

  <!-- 第 2 层：右侧卡通小绿恐龙 -->
  <g transform="translate(375 4) scale(0.84)">
    <g transform="translate(268.8 -3.6) scale(1.2556)" stroke="#6A401D" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M78 24 Q88 18 87 30 Z" fill="#F8C284"/>
      <path d="M86 38 Q97 35 93 47 Z" fill="#F8C284"/>
      <path d="M36 62 C30 44 38 22 59 20 C79 18 90 36 86 62 Z" fill="#B2DC8E"/>
      <circle cx="49" cy="43" r="3.2" fill="#5D3718" stroke="none"/>
      <circle cx="71" cy="43" r="3.2" fill="#5D3718" stroke="none"/>
      <path d="M55 50 Q60 55 65 50" fill="none" stroke="#5D3718" stroke-width="2.8"/>
      <ellipse cx="41" cy="49" rx="4.5" ry="2.8" fill="#F4A595" stroke="none" opacity=".85"/>
      <ellipse cx="79" cy="49" rx="4.5" ry="2.8" fill="#F4A595" stroke="none" opacity=".85"/>
      <path d="M24 62 L37 72 L49 58 L61 71 L74 58 L86 70 L96 62 C97 89 82 108 60 108 C38 108 23 89 24 62 Z" fill="#FFF7DF"/>
      <circle cx="42" cy="86" r="5.5" fill="#F7C77E" stroke="none" opacity=".75"/>
      <circle cx="77" cy="83" r="6" fill="#C7E49E" stroke="none" opacity=".8"/>
      <circle cx="60" cy="96" r="4" fill="#F4B09B" stroke="none" opacity=".75"/>
      <ellipse cx="42" cy="64" rx="7" ry="4.5" fill="#B2DC8E"/>
      <ellipse cx="78" cy="64" rx="7" ry="4.5" fill="#B2DC8E"/>
    </g>
  </g>

  <!-- 第 3 层：立体底厚（中英统一深棕，保证白字更干净） -->
  <g transform="translate(0 5)" fill="#6E3F1C" stroke="#6E3F1C" stroke-width="11" stroke-linejoin="round" paint-order="stroke fill">
    <use href="#dinogo-text-en"/>
  </g>
  <g transform="translate(0 5)" fill="#6E3F1C" stroke="#6E3F1C" stroke-width="11" stroke-linejoin="round" paint-order="stroke fill">
    <use href="#dinogo-text-zh"/>
  </g>

  <!-- 第 4 层：白色主字 + 描边（绿色按钮上的反色版本） -->
  <use href="#dinogo-text-en" fill="#FFFFFF" stroke="#764422" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill"/>
  <use href="#dinogo-text-zh" fill="#FFFFFF" stroke="#764422" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill"/>

  <!-- 第 5 层：糖果高光点与童趣小星星 -->
  <g fill="#FFFFFF" opacity="0.82">
    <ellipse cx="44" cy="48" rx="6" ry="3" transform="rotate(-24 44 48)"/>
    <ellipse cx="222" cy="48" rx="7" ry="3" transform="rotate(-22 222 48)"/>
    <ellipse cx="344" cy="46" rx="6" ry="3" transform="rotate(-20 344 46)"/>
    <ellipse cx="478" cy="46" rx="6" ry="3" transform="rotate(-18 478 46)"/>
  </g>
  <path d="M18 38 L21 45 L28 47 L21 50 L18 57 L15 50 L8 47 L15 45 Z" fill="#FFD36E" stroke="#764422" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="315" cy="34" r="4" fill="#A7D979" stroke="#764422" stroke-width="2"/>
</svg>`;

/* 首页静态装饰 SVG（模块级常量，避免每次渲染重复拼接） */
const HOME_TENT_SVG = `<svg viewBox="0 0 120 96" fill="none" aria-hidden="true">
  <ellipse cx="60" cy="84" rx="44" ry="8" fill="#4F8A45" opacity=".28"/>
  <path d="M60 14 L60 4" stroke="#5C411D" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M60 4 L80 10 L60 16 Z" fill="#FF8A4C" stroke="#5C411D" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M16 82 L60 16 L104 82 Z" fill="#FFE6AC" stroke="#5C411D" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M40 82 L60 44 L80 82 Z" fill="#8C6232" stroke="#5C411D" stroke-width="3" stroke-linejoin="round"/>
</svg>`;
const HOME_WORDS_BAG_SVG = `<svg viewBox="0 0 104 96" fill="none" aria-hidden="true">
  <ellipse cx="52" cy="84" rx="34" ry="7" fill="#4F8A45" opacity=".25"/>
  <path d="M36 26 C36 14 68 14 68 26" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
  <rect x="20" y="26" width="64" height="54" rx="18" fill="#FFD766" stroke="#5C411D" stroke-width="3.5"/>
  <rect x="28" y="48" width="48" height="22" rx="9" fill="#FFFDF7" stroke="#5C411D" stroke-width="2.6"/>
  <path d="M40 59 H64" stroke="#2E8B57" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="52" cy="38" r="5" fill="#FF8A4C" stroke="#5C411D" stroke-width="2.2"/>
</svg>`;
const HOME_FERN_L = `<svg class="bc-fern left" viewBox="0 0 110 90" fill="none" aria-hidden="true">
  <path d="M12 88 Q28 42 74 14" stroke="#1E6B47" stroke-width="4" stroke-linecap="round"/>
  <path d="M24 68 C8 54 14 32 32 38 C38 52 34 62 24 68 Z" fill="#7AC766" stroke="#1E6B47" stroke-width="2.5"/>
  <path d="M44 48 C34 26 54 14 66 28 C64 42 54 48 44 48 Z" fill="#9BE382" stroke="#1E6B47" stroke-width="2.5"/>
  <path d="M42 66 C60 56 82 62 84 78 C68 84 52 78 42 66 Z" fill="#63B848" stroke="#1E6B47" stroke-width="2.5"/>
</svg>`;
const HOME_FERN_R = HOME_FERN_L.replace('class="bc-fern left"', 'class="bc-fern right"');

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

  const nestSvg = `<svg viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <circle cx="60" cy="48" r="38" fill="#FFD766" opacity="${hasReward ? ".28" : ".12"}"/>
    <ellipse cx="60" cy="76" rx="44" ry="15" fill="#C89B63" stroke="#5C411D" stroke-width="3.5"/>
    <ellipse cx="60" cy="72" rx="34" ry="9" fill="#9E723C"/>
    <ellipse cx="60" cy="50" rx="22" ry="29" fill="#FFFDF7" stroke="#5C411D" stroke-width="3.5"/>
    <circle cx="51" cy="43" r="5" fill="#FF8A4C" opacity=".82"/>
    <circle cx="68" cy="54" r="6" fill="#FFD766" opacity=".9"/>
    <circle cx="54" cy="62" r="4" fill="#3FA46A" opacity=".78"/>
  </svg>`;

  return `<section class="screen basecamp-screen ${heroSkyClass()}" data-screen="home">
    ${skyFx()}
    <div class="hero-deco" aria-hidden="true">
      ${skyPhase() === "night" ? `<span class="firefly x1"></span><span class="firefly x2"></span><span class="firefly x3"></span><span class="firefly x4"></span><span class="firefly x5"></span>` : ""}
    </div>
    <div class="bc-hills" aria-hidden="true"><div class="bc-hill h1"></div><div class="bc-hill h2"></div><div class="bc-hill h3"></div></div>
    ${HOME_FERN_L}${HOME_FERN_R}

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
        ${HOME_TENT_SVG}<span class="bc-prop-label">图鉴 · 装扮</span>
      </button>
      <button class="bc-prop bc-prop-words" data-action="tab" data-screen="words" aria-label="我的单词本">
        ${HOME_WORDS_BAG_SVG}<span class="bc-prop-label">单词本</span>
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
            <button class="bc-sign-mini-btn" data-action="speak-word" data-word="${word.word}" aria-label="朗读 ${word.word}">${I.speaker(18, "#B4811C")}</button>
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
        <span>▶</span>${HOME_LOGO_SVG}
      </button>
    </div>
  </section>`;
}


/* ------------------------------------------------ achievements */
/* 12 枚徽章全部由现有存档实时计算，不新增存档字段 */
const ACH_CATS = [
  { id: "streak", name: "坚持", tone: "gold" },
  { id: "words", name: "学习", tone: "blue" },
  { id: "level", name: "闯关", tone: "green" },
  { id: "collect", name: "收集", tone: "purple" },
];
const ACH_TONE_INK = { gold: "#8A5A10", blue: "#265A80", green: "#2C7A4C", purple: "#5B3FA0" };
const ACH_TONE_BY_CAT = Object.fromEntries(ACH_CATS.map((c) => [c.id, c.tone]));
function achTone(catId) {
  return ACH_TONE_BY_CAT[catId] || "gold";
}
function achievementList() {
  const streak = streakDays();
  const words = Number(state.words) || 0;
  const levels = totalLevelsDone();
  const three = Number(state.threeStars) || 0;
  const dex = (state.dex || []).length;
  const ultra = ultraBaseOwned() ? 1 : 0;
  const raw = [
    { id: "streak3", cat: "streak", name: "小小坚持", desc: "连续学习 3 天", goal: 3, value: streak, unit: "天", icon: (c) => I.flame(22, c) },
    { id: "streak7", cat: "streak", name: "一周不落", desc: "连续学习 7 天", goal: 7, value: streak, unit: "天", icon: (c) => I.flame(22, c) },
    { id: "streak14", cat: "streak", name: "习惯成自然", desc: "连续学习 14 天", goal: 14, value: streak, unit: "天", icon: (c) => I.flame(22, c) },
    { id: "words10", cat: "words", name: "单词萌芽", desc: "累计学会 10 个单词", goal: 10, value: words, unit: "词", icon: (c) => I.book(22, c) },
    { id: "words50", cat: "words", name: "单词小达人", desc: "累计学会 50 个单词", goal: 50, value: words, unit: "词", icon: (c) => I.book(22, c) },
    { id: "words100", cat: "words", name: "百词斩", desc: "累计学会 100 个单词", goal: 100, value: words, unit: "词", icon: (c) => I.book(22, c) },
    { id: "level1", cat: "level", name: "第一声吼", desc: "完成 1 次闯关", goal: 1, value: levels, unit: "次", icon: (c) => I.flag(22, c) },
    { id: "level10", cat: "level", name: "闯关小能手", desc: "累计完成 10 次闯关", goal: 10, value: levels, unit: "次", icon: (c) => I.flag(22, c) },
    { id: "level30", cat: "level", name: "关卡达人", desc: "累计完成 30 次闯关", goal: 30, value: levels, unit: "次", icon: (c) => I.flag(22, c) },
    { id: "three1", cat: "collect", name: "满星初体验", desc: "首次拿到 3 星", goal: 1, value: three, unit: "次", icon: (c) => star(22, "#FFE7A0", c) },
    { id: "dex4", cat: "collect", name: "图鉴新星", desc: "收集 4 种恐龙形态", goal: 4, value: dex, unit: "种", icon: (c) => I.bag(22, c) },
    { id: "ultra", cat: "collect", name: "究极相逢", desc: "解锁究极体形态", goal: 1, value: ultra, unit: "", icon: (c) => I.crownMini(22, c) },
  ];
  return raw.map((a) => {
    const value = Math.max(0, Number(a.value) || 0);
    const done = value >= a.goal;
    const pct = done ? 100 : clamp(Math.round((value / a.goal) * 100), 0, 99);
    const sub = done ? "已点亮" : a.unit ? `${Math.min(value, a.goal)} / ${a.goal} ${a.unit}` : "未解锁";
    return { ...a, value, done, pct, sub };
  });
}
/* 首页卡片展示 4 枚：优先已点亮，再从不同分类里挑最接近达成的 */
function featuredAchievements(list) {
  const picked = list.filter((a) => a.done).slice(0, 4);
  const rest = list.filter((a) => !a.done).sort((a, b) => b.pct - a.pct);
  const cats = new Set(picked.map((a) => a.cat));
  for (const a of rest) {
    if (picked.length >= 4) break;
    if (cats.has(a.cat)) continue;
    picked.push(a);
    cats.add(a.cat);
  }
  for (const a of rest) {
    if (picked.length >= 4) break;
    if (!picked.includes(a)) picked.push(a);
  }
  return picked.slice(0, 4);
}
function achBadge(a) {
  const tone = achTone(a.cat);
  return `<button class="ach ${a.done ? "is-done" : "is-locked"}" data-action="ach-detail" data-id="${a.id}" aria-label="${a.name}，${a.done ? "已点亮" : a.sub}">
    <span class="medal tone-${tone}" style="--p:${a.pct}">
      <span class="ach-face">${a.done ? a.icon(ACH_TONE_INK[tone]) : I.lock(16, "#B9AE99")}</span>
      ${a.done ? `<span class="dot">${I.check(8)}</span>` : ""}
    </span>
    <b>${a.name}</b>
    <span class="ach-sub">${a.sub}</span>
  </button>`;
}
function achCard() {
  const list = achievementList();
  const done = list.filter((a) => a.done).length;
  const pct = Math.round((done / list.length) * 100);
  return `<div class="card ach-card">
    <div class="ach-head">
      <div class="ach-title"><span class="ach-title-ic">${I.crownMini(14, "#8A5A10")}</span><b>成就徽章</b></div>
      <span class="ach-count"><b class="num">${done}</b> / ${list.length} 已点亮</span>
    </div>
    <div class="ach-track"><i style="width:${pct}%"></i></div>
    <div class="ach-list">${featuredAchievements(list).map(achBadge).join("")}</div>
    <button class="ach-all" data-action="open-achievements">查看全部 ${list.length} 枚成就 ${I.chevron(10)}</button>
  </div>`;
}
function openAchievements() {
  const list = achievementList();
  const done = list.filter((a) => a.done).length;
  const pct = Math.round((done / list.length) * 100);
  const groups = ACH_CATS.map((cat) => {
    const items = list.filter((a) => a.cat === cat.id);
    const got = items.filter((a) => a.done).length;
    return `<section class="achv-cat">
      <div class="achv-cat-head"><span class="achv-dot tone-${cat.tone}"></span><b>${cat.name}</b><em>${got} / ${items.length}</em></div>
      <div class="achv-grid">${items.map(achBadge).join("")}</div>
    </section>`;
  }).join("");
  openOverlay(`<div class="overlay">
    <div class="sheet achv-sheet">
      <div class="grab"></div>
      <button class="achv-close" data-action="close-overlay" aria-label="关闭">${I.close(15)}</button>
      <div class="achv-hero">
        <div class="achv-ring" style="--p:${pct}"><span>${done}<em>/${list.length}</em></span></div>
        <div class="achv-hero-txt"><h2>成就徽章</h2><p>${done ? `已点亮 ${done} 枚，还差 ${list.length - done} 枚就集齐啦` : "每一次学习，都会点亮一枚新徽章"}</p></div>
      </div>
      <div class="achv-tip">${spark(11, "#F0B53B")} 完成条件会自动点亮，进度随学习实时更新</div>
      <div class="achv-groups">${groups}</div>
      <div class="sheet-actions"><button class="btn" data-action="close-overlay">继续加油</button></div>
    </div>
  </div>`);
  sfx("tap");
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

      ${achCard()}

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
