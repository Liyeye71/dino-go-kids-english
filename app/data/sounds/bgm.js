/* DinoGo · 主题背景音乐（Web Audio 实时合成，4 小节循环）
   风格参考舒缓的动画电影配乐：柔和的旋律、流动的琶音、缓慢的低音铺底 */

let musicId = null;
let musicTimer = null;
let musicGain = null;
let musicPaused = false;
let duckCount = 0;

/* 每个主题一首原创 BGM：速度、音色、旋律、低音与琶音层 */
const THEME_MUSIC = {
  /* 美食节：温暖明亮，像午后厨房里的轻声哼唱 */
  food: {
    bpm: 82, wave: "triangle", bassWave: "sine", ambient: "bell",
    melody: [
      ["E5", 1], ["G5", 0.5], ["A5", 0.5], ["G5", 1], ["E5", 1],
      ["D5", 1], ["E5", 0.5], ["G5", 0.5], ["E5", 2],
      ["C5", 0.5], ["D5", 0.5], ["E5", 1], ["G5", 1], ["A5", 1],
      ["G5", 1.5], ["E5", 0.5], ["D5", 1], ["C5", 1],
    ],
    bass: [
      ["C3", 2], ["G3", 2],
      ["G3", 2], ["D4", 2],
      ["A3", 2], ["E4", 2],
      ["C3", 2], ["G3", 2],
    ],
    arp: [
      [["C4", "E4", "G4", "E4"], 4],
      [["G3", "B3", "D4", "B3"], 4],
      [["A3", "C4", "E4", "C4"], 4],
      [["C4", "E4", "G4", "E4"], 4],
    ],
    ambientAt: 8,
  },
  /* 环球旅行：轻盈上行，像乘着风慢慢升起 */
  travel: {
    bpm: 78, wave: "triangle", bassWave: "sine", ambient: "bird",
    melody: [
      ["G4", 1], ["C5", 1], ["E5", 1], ["D5", 0.5], ["C5", 0.5],
      ["D5", 1], ["E5", 1], ["G5", 2],
      ["E5", 0.5], ["D5", 0.5], ["C5", 1], ["A4", 1], ["C5", 1],
      ["D5", 1], ["E5", 1], ["C5", 2],
    ],
    bass: [
      ["C3", 2], ["G3", 2],
      ["E3", 2], ["B3", 2],
      ["A3", 2], ["E4", 2],
      ["C3", 2], ["G3", 2],
    ],
    arp: [
      [["C4", "E4", "G4", "C5"], 4],
      [["E3", "G3", "B3", "G3"], 4],
      [["A3", "C4", "E4", "C4"], 4],
      [["C4", "E4", "G4", "C5"], 4],
    ],
    ambientAt: 4,
  },
  /* 动物乐园：略带怀旧的柔和小调，像傍晚草原上的风 */
  animal: {
    bpm: 84, wave: "triangle", bassWave: "sine", ambient: "call",
    melody: [
      ["A4", 1], ["C5", 1], ["E5", 1], ["D5", 0.5], ["C5", 0.5],
      ["B4", 1], ["D5", 1], ["E5", 2],
      ["E5", 0.5], ["G5", 0.5], ["E5", 1], ["D5", 1], ["C5", 1],
      ["B4", 1], ["C5", 0.5], ["D5", 0.5], ["A4", 2],
    ],
    bass: [
      ["A3", 2], ["E4", 2],
      ["E3", 2], ["B3", 2],
      ["C3", 2], ["G3", 2],
      ["A3", 2], ["E4", 2],
    ],
    arp: [
      [["A3", "C4", "E4", "C4"], 4],
      [["E3", "B3", "E4", "B3"], 4],
      [["C4", "E4", "G4", "E4"], 4],
      [["A3", "C4", "E4", "C4"], 4],
    ],
    ambientAt: 12,
  },
};

/* 环境点缀：鸟鸣 / 动物呼唤 / 轻柔铃声 */
function birdChirp(delay, dest) {
  if (!audioCtx) return;
  for (let i = 0; i < 2; i++) {
    const t = audioCtx.currentTime + delay + i * 0.16;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1900, t);
    osc.frequency.exponentialRampToValueAtTime(2700, t + 0.07);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.008, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain).connect(dest || audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }
}
function animalCall(delay, dest) {
  tone(392, 0.18, "triangle", 0.01, delay, dest);
  tone(523.25, 0.24, "triangle", 0.009, delay + 0.2, dest);
}
function shopBell(delay, dest) {
  tone(1568, 0.4, "sine", 0.008, delay, dest);
  tone(2093, 0.32, "sine", 0.005, delay + 0.02, dest);
}

function stopMusic() {
  if (musicTimer) clearTimeout(musicTimer);
  musicTimer = null;
  musicId = null;
  musicPaused = false;
  duckCount = 0;
  if (musicGain && audioCtx) {
    /* 短暂淡出后断开，已排入队列的音符随节点一起静音 */
    const old = musicGain;
    musicGain = null;
    try {
      old.gain.setValueAtTime(old.gain.value || 1, audioCtx.currentTime);
      old.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      setTimeout(() => { try { old.disconnect(); } catch (e) { /* ignore */ } }, 320);
    } catch (e) { /* ignore */ }
  }
}

function playMusic(id) {
  if (!state.sound) { stopMusic(); return; }
  if (musicId === id && musicTimer) return;
  const ducked = duckCount > 0;
  stopMusic();
  ensureAudio();
  if (!audioCtx) return;
  const cfg = THEME_MUSIC[id] || THEME_MUSIC.food;
  musicId = id;
  duckCount = ducked ? 1 : 0;
  musicGain = audioCtx.createGain();
  musicGain.gain.value = ducked ? 0.0001 : 1;
  musicPaused = ducked;
  musicGain.connect(audioCtx.destination);
  const dest = musicGain;
  const beat = 60 / cfg.bpm;
  const run = () => {
    if (musicId !== id || !audioCtx || !dest) return;
    let mel = 0;
    cfg.melody.forEach(([note, beats]) => {
      if (note !== "R") tone(NOTE_FREQ[note], beat * beats * 0.94, cfg.wave, 0.017, mel, dest);
      mel += beat * beats;
    });
    let bass = 0;
    cfg.bass.forEach(([note, beats]) => {
      tone(NOTE_FREQ[note], beat * beats * 0.9, cfg.bassWave || "sine", 0.011, bass, dest);
      bass += beat * beats;
    });
    /* 流动琶音：每半拍一个音，音量交替，像钢琴轻轻铺底 */
    let arpTime = 0;
    cfg.arp.forEach(([notes, beats]) => {
      const step = beat * 0.5;
      const steps = Math.round((beats * beat) / step);
      for (let i = 0; i < steps; i++) {
        const note = notes[i % notes.length];
        const vol = i % 4 === 0 ? 0.0065 : 0.0042;
        tone(NOTE_FREQ[note], step * 0.92, "sine", vol, arpTime + i * step, dest);
      }
      arpTime += beats * beat;
    });
    if (cfg.ambient === "bird") birdChirp(beat * cfg.ambientAt, dest);
    else if (cfg.ambient === "call") animalCall(beat * cfg.ambientAt, dest);
    else shopBell(beat * cfg.ambientAt, dest);
    musicTimer = setTimeout(run, Math.max(mel, bass) * 1000);
  };
  run();
}

/* 背景音乐：只在乐园 / 词汇 / 小铺页面播放当前主题的 BGM */
const BGM_SCREENS = ["home", "words", "shop"];
function syncMusic(screen, themeId) {
  if (BGM_SCREENS.includes(screen)) playMusic(themeId);
  else stopMusic();
}

/* 闯关相关页面：地图、答题、结算、进化全部保持静音 */
const LEVEL_SCREENS = ["map", "quiz", "result", "evolution"];

/* 按页面类型统一同步音乐：闯关流程不播放背景音乐，其它页面走背景音乐 */
function syncAudio(screen, themeId) {
  if (LEVEL_SCREENS.includes(screen)) stopMusic();
  else syncMusic(screen, themeId);
}

/* 朗读 / 跟读时临时暂停背景音乐：只在乐园、词汇、小铺页面生效 */
function pauseMusic() {
  if (!musicGain || !audioCtx || musicPaused) return;
  musicPaused = true;
  try {
    const t = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), t);
    musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.15);
  } catch (e) { /* ignore */ }
}
function resumeMusic() {
  if (!musicGain || !audioCtx || !musicPaused) return;
  musicPaused = false;
  try {
    const t = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), t);
    musicGain.gain.linearRampToValueAtTime(1, t + 0.25);
  } catch (e) { /* ignore */ }
}
function duckMusic() {
  if (!BGM_SCREENS.includes(current)) return;
  duckCount++;
  if (duckCount === 1) pauseMusic();
}
function unduckMusic() {
  if (duckCount === 0) return;
  duckCount--;
  if (duckCount === 0) resumeMusic();
}
