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
    else if (name === "wrong") { tone(190, 0.2, "sawtooth", 0.035); tone(150, 0.24, "sawtooth", 0.03, 0.12); }
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

/* 英文单词 / 句子朗读；传入数组时按顺序连续朗读 */
let speakToken = 0;
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
    const sayFrom = (i) => {
      if (token !== speakToken || i >= lines.length) return;
      const u = new SpeechSynthesisUtterance(lines[i]);
      u.lang = "en-US";
      u.rate = 0.82;
      u.pitch = 1.08;
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
