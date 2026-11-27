/* DinoGo · 交互音效、单词朗读与关卡提示音（Web Audio 实时合成，无需音频素材） */

let audioCtx = null;

/* 音高表：音效与关卡提示音共用 */
const NOTE_FREQ = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.5,
};

/* 首次交互时创建 / 唤醒音频上下文（iOS 要求） */
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

/* 播放一个音：类型、音量、延迟与输出目标均可配置 */
function tone(freq, dur = 0.12, type = "sine", vol = 0.05, delay = 0, dest = null) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(dest || audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/* 界面音效 */
function sfx(name) {
  if (!state.sound) return;
  try {
    ensureAudio();
    if (name === "tap") tone(520, 0.05, "sine", 0.025);
    else if (name === "correct") { tone(660, 0.12, "sine", 0.05); tone(880, 0.16, "sine", 0.05, 0.1); }
    else if (name === "excellent") {
      [659, 784, 988, 1318].forEach((f, i) => tone(f, 0.16, "triangle", 0.05, i * 0.08));
      tone(1568, 0.36, "sine", 0.035, 0.34);
    }
    /* 答错：柔和三角波低音下滑，不刺耳、不吓低龄孩子 */
    else if (name === "wrong") { tone(240, 0.16, "triangle", 0.045); tone(185, 0.22, "triangle", 0.032, 0.1); }
    /* 听音戳泡泡：戳破正确泡泡的清脆“啵！”上扬水泡音（频率滑音需直接操作 AudioParam） */
    else if (name === "pop") {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(1080, t + 0.085);
      g.gain.setValueAtTime(0.11, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
    /* 动物喂食：咬一口的“咔嚓”咀嚼声（短促中频颗粒感） */
    else if (name === "crunch") {
      tone(196, 0.06, "square", 0.035);
      tone(233, 0.06, "square", 0.03, 0.07);
      tone(175, 0.07, "triangle", 0.028, 0.14);
    }
    /* 纯单词选项题型答后弹框：正确 / 错误各自的专属结果音效 */
    else if (name === "answer-right") {
      [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.18, "triangle", 0.05, i * 0.09));
      tone(1976, 0.4, "sine", 0.028, 0.4);
    }
    else if (name === "answer-wrong") {
      [392, 330, 262].forEach((f, i) => tone(f, 0.22, "triangle", 0.045, i * 0.12));
      tone(196, 0.36, "sine", 0.03, 0.36);
    }
    else if (name === "coin") { tone(988, 0.08, "triangle", 0.05); tone(1318, 0.14, "triangle", 0.045, 0.07); }
    else if (name === "star") { tone(740, 0.1, "sine", 0.05); tone(1108, 0.14, "sine", 0.04, 0.09); }
    else if (name === "evolve") { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.24, "triangle", 0.05, i * 0.13)); }
    else if (name === "win") { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, "sine", 0.045, i * 0.1)); }
  } catch (e) { /* no audio */ }
}

/* 英文单词 / 句子朗读；传入数组时按顺序连续朗读
   读音风格由设置切换：kids 童趣（更慢更亮，优先儿童/活泼女声音色）/ standard 标准 */
let speakToken = 0;

/* 触发音色列表异步加载（Chrome 首次 getVoices 为空，voiceschanged 后可用） */
if ("speechSynthesis" in window) {
  try { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => {}; } catch (e) { /* ignore */ }
}

/* 童趣朗读偏好的音色：Ana（Win11 真儿童音色）→ 活泼/柔和女声 → Google 女声 */
const KID_VOICE_HINTS = [
  "ana", "aria", "zira", "michelle", "samantha", "karen", "moira", "tessa",
  "google us english", "google uk english female", "female",
];
/* 标准朗读偏好的音色：发音最清晰的教材风音色 */
const STANDARD_VOICE_HINTS = ["daniel", "google uk english", "aria", "google us english", "zira", "samantha"];

function pickVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    const en = voices.filter((v) => /^en([-_]|$)/i.test(v.lang || "") || /english/i.test(v.name || ""));
    if (!en.length) return null;
    const hints = state.voice === "standard" ? STANDARD_VOICE_HINTS : KID_VOICE_HINTS;
    for (const hint of hints) {
      const hit = en.find((v) => (v.name || "").toLowerCase().includes(hint));
      if (hit) return hit;
    }
    return en.find((v) => /female|女/i.test(v.name || "")) || en[0];
  } catch (e) { return null; }
}

/* 立即停止当前朗读（切换读音风格、翻页、弹窗等场景调用） */
function stopSpeak() {
  try {
    speakToken++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

function speak(text) {
  try {
    if (!("speechSynthesis" in window)) {
      if (typeof toast === "function") toast("当前浏览器不支持发音");
      return;
    }
    const synth = window.speechSynthesis;
    const lines = (Array.isArray(text) ? text : [text])
      .map((t) => String(t == null ? "" : t).trim())
      .filter(Boolean);
    if (!lines.length) return;
    const token = ++speakToken;
    const kids = state.voice !== "standard";
    const voice = pickVoice();
    const sayFrom = (i) => {
      if (token !== speakToken || i >= lines.length) return;
      const u = new SpeechSynthesisUtterance(lines[i]);
      u.lang = "en-US";
      /* 童趣：语速更慢、音调更高，听起来像卡通姐姐；标准：教材朗读节奏 */
      u.rate = kids ? 0.72 : 0.82;
      u.pitch = kids ? 1.32 : 1.08;
      if (voice) u.voice = voice;
      /* 一句读完自动接下一句；被新的朗读打断后不再继续 */
      u.onend = () => sayFrom(i + 1);
      synth.speak(u);
    };
    /* 先停掉上一段朗读；连续点击时立即 speak 会被部分浏览器丢弃，稍作延迟 */
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(() => sayFrom(0), 60);
    } else {
      sayFrom(0);
    }
  } catch (e) { /* ignore */ }
}

/* 立即停止当前朗读（关闭答题页时调用，避免返回页面后继续读题型提示） */
function stopSpeak() {
  speakToken += 1;
  try {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

/* 动作猜猜：本地短拟声音效；未配置音效或全局静音时点击不处理 */
let actionAudio = null;
let actionAudioButton = null;

function stopActionSound() {
  const audio = actionAudio;
  const btn = actionAudioButton;
  actionAudio = null;
  actionAudioButton = null;
  if (audio) {
    audio.pause();
    try { audio.currentTime = 0; } catch (e) { /* audio not seekable yet */ }
  }
  if (btn) {
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-pressed", "false");
  }
}

function playActionSound(name, btn) {
  stopActionSound();
  if (!name || !state.sound || !btn) return false;
  const audio = new Audio();
  actionAudio = audio;
  actionAudioButton = btn;
  const cleanup = () => {
    if (actionAudio !== audio) return;
    actionAudio = null;
    actionAudioButton = null;
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-pressed", "false");
  };
  const fail = () => {
    if (actionAudio !== audio) return;
    cleanup();
    if (typeof toast === "function") toast("声音提示加载失败，请再试一次");
  };
  audio.preload = "auto";
  audio.src = `data/sounds/action/${encodeURIComponent(name)}.wav`;
  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", fail, { once: true });
  btn.classList.add("is-playing");
  btn.setAttribute("aria-pressed", "true");
  const playing = audio.play();
  if (playing && typeof playing.catch === "function") playing.catch(fail);
  return true;
}

/* 关卡提示音：进入某主题关卡时播放的短旋律 */
const LEVEL_CUES = {
  animal: [
    [110, 0.2, "triangle", 0.05, 0], [NOTE_FREQ.D5, 0.16, "triangle", 0.045, 0.18],
    [NOTE_FREQ.F5, 0.16, "triangle", 0.045, 0.3], [NOTE_FREQ.A5, 0.16, "triangle", 0.045, 0.42],
    [NOTE_FREQ.D6, 0.34, "triangle", 0.04, 0.54],
  ],
};

function levelCue(id) {
  if (!state.sound) return;
  try {
    ensureAudio();
    if (!audioCtx) return;
    const pattern = LEVEL_CUES[id] || LEVEL_CUES.animal;
    pattern.forEach(([f, d, type, vol, delay]) => tone(f, d, type, vol, delay));
  } catch (e) { /* no audio */ }
}
