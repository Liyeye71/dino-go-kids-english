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
    /* 新题入场轻提示音：替代非听力题的自动长句朗读，柔和短促不打断作答 */
    else if (name === "question") { tone(587.33, 0.08, "sine", 0.032); tone(783.99, 0.11, "sine", 0.026, 0.06); }
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
    /* 听音戳泡泡：戳错时的轻柔弹性“啵咚”弹开声 */
    else if (name === "boing") {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(210, t + 0.09);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.16);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    }
    /* 动物喂食：喂错食物时的软萌摇头“唔唔”声 */
    else if (name === "nope") {
      tone(310, 0.11, "triangle", 0.05);
      tone(235, 0.15, "triangle", 0.042, 0.11);
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
   读音风格由设置切换：
   - kids（默认）：美音童声 Ana（预生成神经网络 MP3，未命中词条自动回退系统朗读）
   - standard：系统标准朗读（speechSynthesis） */
let speakToken = 0;
let activeAudio = null;

function voiceSlug(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function anaVoiceUrl(text) {
  const files = window.ANA_VOICE_FILES;
  if (!files || typeof files.has !== "function") return "";
  const slug = voiceSlug(text);
  return slug && files.has(slug) ? `data/sounds/voice/ana/${slug}.mp3` : "";
}

/* 触发音色列表异步加载（Chrome 首次 getVoices 为空，voiceschanged 后可用） */
if ("speechSynthesis" in window) {
  try { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => {}; } catch (e) { /* ignore */ }
}

/* 童趣朗读回退音色：Ana（Win11 真儿童音色）→ 活泼/柔和女声 → Google 女声 */
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

function stopActiveAudio() {
  if (!activeAudio) return;
  try {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio.currentTime = 0;
  } catch (e) { /* ignore */ }
  activeAudio = null;
}

/* 立即停止当前朗读（切换读音风格、翻页、弹窗等场景调用） */
function stopSpeak() {
  try {
    speakToken++;
    stopActiveAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

function speak(text) {
  try {
    const lines = (Array.isArray(text) ? text : [text])
      .map((t) => String(t == null ? "" : t).trim())
      .filter(Boolean);
    if (!lines.length) return;
    const token = ++speakToken;
    const kids = state.voice !== "standard";
    const slow = typeof enlightenOn === "function" && enlightenOn();
    const hasSynth = "speechSynthesis" in window;
    const synth = hasSynth ? window.speechSynthesis : null;
    const voice = hasSynth ? pickVoice() : null;

    stopActiveAudio();
    const hadSynth = Boolean(synth && (synth.speaking || synth.pending));
    if (hadSynth) synth.cancel();

    const speakWithSynth = (line, next) => {
      if (token !== speakToken) return;
      if (!synth) {
        if (typeof toast === "function") toast("当前浏览器不支持发音");
        return;
      }
      const u = new SpeechSynthesisUtterance(line);
      u.lang = "en-US";
      /* 启蒙模式自动放慢，方便 3~4 岁听清尾音与跟读 */
      u.rate = slow ? 0.72 : (kids ? 0.80 : 0.84);
      u.pitch = kids ? 1.15 : 1.04;
      if (voice) u.voice = voice;
      u.onend = () => next();
      u.onerror = () => next();
      synth.speak(u);
    };

    const sayFrom = (i) => {
      if (token !== speakToken || i >= lines.length) return;
      const line = lines[i];
      const next = () => sayFrom(i + 1);
      const url = kids ? anaVoiceUrl(line) : "";
      if (url) {
        const audio = new Audio(url);
        audio.preload = "auto";
        /* 保持童声原音高：启蒙模式 0.85x，普通模式 0.93x */
        if ("preservesPitch" in audio) audio.preservesPitch = true;
        if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;
        audio.playbackRate = slow ? 0.85 : 0.93;
        activeAudio = audio;
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          if (activeAudio === audio) activeAudio = null;
          next();
        };
        const fallback = () => {
          if (settled) return;
          settled = true;
          if (activeAudio === audio) activeAudio = null;
          if (token === speakToken) speakWithSynth(line, next);
        };
        audio.onended = done;
        audio.onerror = fallback;
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(fallback);
        return;
      }
      speakWithSynth(line, next);
    };

    /* 刚 cancel 完系统朗读时稍作延迟，避免部分浏览器丢弃紧随其后的 speak */
    if (hadSynth && !kids) {
      setTimeout(() => sayFrom(0), 60);
    } else {
      sayFrom(0);
    }
  } catch (e) { /* ignore */ }
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

/* ============================================================
   卡通动作拟声音效（纯 Web Audio 合成，零音频文件、离线秒播）
   仅覆盖物理/卡通动作类；真实动物叫声（bark/roar 等）不硬合成
   ============================================================ */
function noiseBurst(dur = 0.12, freq = 900, q = 1.6, vol = 0.04, delay = 0) {
  if (!audioCtx) return;
  const len = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = audioCtx.createGain();
  const t = audioCtx.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(audioCtx.destination);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function slideTone(f1, f2, dur = 0.16, type = "sine", vol = 0.055, delay = 0) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const CARTOON_ACTION_SFX = {
  /* 弹簧跳 */
  jump() {
    slideTone(250, 780, 0.18, "sine", 0.065, 0);
    tone(190, 0.07, "triangle", 0.035, 0.2);
  },
  /* 水花四溅 */
  splash() {
    noiseBurst(0.24, 1300, 1.1, 0.055, 0);
    slideTone(320, 880, 0.09, "sine", 0.045, 0.06);
    slideTone(420, 1020, 0.08, "sine", 0.04, 0.15);
  },
  /* 划水游泳 */
  swim() {
    noiseBurst(0.16, 850, 1.4, 0.042, 0);
    slideTone(260, 560, 0.1, "sine", 0.04, 0.08);
    noiseBurst(0.16, 950, 1.4, 0.038, 0.2);
    slideTone(300, 640, 0.1, "sine", 0.038, 0.27);
  },
  /* 拍翅飞翔 */
  fly() {
    noiseBurst(0.11, 680, 1.8, 0.045, 0);
    slideTone(360, 560, 0.11, "triangle", 0.03, 0.02);
    noiseBurst(0.11, 780, 1.8, 0.045, 0.16);
    slideTone(420, 680, 0.12, "triangle", 0.032, 0.18);
  },
  /* 轻快跑步 */
  run() {
    [0, 0.09, 0.18, 0.27].forEach((d, i) => {
      tone(i % 2 ? 230 : 185, 0.055, "triangle", 0.045, d);
    });
  },
  chase() { CARTOON_ACTION_SFX.run(); },
  /* 稳步走路 */
  walk() {
    [0, 0.15, 0.3].forEach((d, i) => {
      tone(i % 2 ? 195 : 165, 0.07, "triangle", 0.042, d);
    });
  },
  /* 吃 / 咬：清脆咔嚓 */
  eat() {
    tone(205, 0.055, "square", 0.032, 0);
    tone(245, 0.055, "square", 0.028, 0.075);
    tone(185, 0.065, "triangle", 0.03, 0.15);
  },
  bite() {
    noiseBurst(0.06, 1500, 2.0, 0.045, 0);
    tone(220, 0.06, "square", 0.032, 0.01);
    tone(160, 0.08, "triangle", 0.035, 0.07);
  },
  /* 咕咚喝水 */
  drink() {
    slideTone(240, 520, 0.1, "sine", 0.055, 0);
    slideTone(280, 600, 0.1, "sine", 0.052, 0.13);
    slideTone(320, 680, 0.11, "sine", 0.048, 0.26);
  },
  /* 沙沙挖土 */
  dig() {
    noiseBurst(0.11, 1100, 2.2, 0.048, 0);
    tone(150, 0.06, "triangle", 0.03, 0.02);
    noiseBurst(0.12, 1250, 2.2, 0.048, 0.17);
    tone(165, 0.06, "triangle", 0.03, 0.19);
  },
  /* 欢快跳舞节拍 */
  dance() {
    [NOTE_FREQ.C5, NOTE_FREQ.E5, NOTE_FREQ.G5, NOTE_FREQ.E5, NOTE_FREQ.C6].forEach((f, i) => {
      tone(f, 0.09, "triangle", 0.042, i * 0.08);
    });
  },
  /* 摇尾巴呼呼声 */
  wag() {
    slideTone(300, 440, 0.09, "sine", 0.035, 0);
    slideTone(440, 300, 0.09, "sine", 0.035, 0.1);
    slideTone(300, 460, 0.09, "sine", 0.035, 0.2);
  },
  /* 逐阶攀爬 */
  climb() {
    [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.C5].forEach((f, i) => {
      tone(f, 0.08, "triangle", 0.042, i * 0.09);
    });
  },
  /* 伸懒腰 */
  stretch() {
    slideTone(260, 520, 0.22, "sine", 0.045, 0);
    slideTone(520, 390, 0.16, "sine", 0.035, 0.22);
  },
  /* 抓 / 拉 / 推 */
  catch() {
    slideTone(620, 280, 0.11, "triangle", 0.05, 0);
    tone(480, 0.06, "sine", 0.04, 0.11);
  },
  pull() { slideTone(240, 420, 0.18, "triangle", 0.045, 0); },
  push() { slideTone(380, 210, 0.16, "triangle", 0.045, 0); },
  /* 悄悄躲藏 */
  hide() {
    tone(520, 0.07, "sine", 0.035, 0);
    tone(360, 0.09, "sine", 0.032, 0.09);
  },
  /* 轻柔安眠波 */
  sleep() {
    slideTone(220, 265, 0.22, "sine", 0.032, 0);
    slideTone(265, 200, 0.24, "sine", 0.028, 0.22);
  },
  nap() { CARTOON_ACTION_SFX.sleep(); },
};

function actionSfx(word) {
  if (!state.sound || !word) return false;
  const fn = CARTOON_ACTION_SFX[String(word).toLowerCase()];
  if (!fn) return false;
  try {
    ensureAudio();
    if (!audioCtx) return false;
    fn();
    return true;
  } catch (e) { return false; }
}
