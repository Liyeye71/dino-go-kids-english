/* DinoGo · 主题背景音乐（Web Audio 实时合成，8 小节循环） */

let musicId = null;
let musicTimer = null;
let musicGain = null;

/* 每个主题一首 BGM：速度、音色、旋律、低音与环境点缀 */
const THEME_MUSIC = {
  /* 美食节：热闹市集，收银小铃 + 彩炮声 */
  food: {
    bpm: 120, wave: "triangle", bassWave: "triangle", ambient: "bell",
    melody: [
      ["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["A5", 1], ["G5", 1], ["E5", 2],
      ["F5", 1], ["A5", 1], ["G5", 1], ["E5", 1], ["D5", 2], ["C5", 2],
    ],
    bass: [["C3", 2], ["A3", 2], ["F3", 2], ["G3", 2], ["C3", 2], ["A3", 2], ["F3", 2], ["G3", 2]],
  },
  /* 环球旅行：轻快客机巡航，带机舱广播感 */
  travel: {
    bpm: 118, wave: "triangle", bassWave: "square", ambient: "horn",
    melody: [
      ["G4", 1], ["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["C5", 1], ["G4", 2],
      ["A4", 1], ["D5", 1], ["F5", 1], ["A5", 1], ["G5", 2], ["E5", 1], ["R", 1],
    ],
    bass: [["C3", 2], ["G3", 2], ["C3", 2], ["F3", 2], ["G3", 2], ["C3", 2], ["F3", 2], ["G3", 2]],
  },
  /* 动物乐园：探险感，加入动物呼唤 */
  animal: {
    bpm: 104, wave: "triangle", bassWave: "sine", ambient: "call",
    melody: [
      ["D5", 1], ["F5", 1], ["A5", 1], ["F5", 1], ["D5", 2], ["C5", 2],
      ["D5", 1], ["F5", 1], ["G5", 1], ["A5", 1], ["G5", 2], ["F5", 2],
    ],
    bass: [["D3", 2], ["A3", 2], ["D3", 2], ["C3", 2], ["A3", 2], ["D3", 2], ["C3", 2], ["A3", 2]],
  },
  /* 美食街：热闹夜市，收银小铃点缀 */
  food: {
    bpm: 112, wave: "triangle", bassWave: "triangle", ambient: "bell",
    melody: [
      ["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["A5", 1], ["G5", 1], ["E5", 2],
      ["F5", 1], ["A5", 1], ["G5", 1], ["E5", 1], ["D5", 2], ["C5", 2],
    ],
    bass: [["C3", 2], ["A3", 2], ["F3", 2], ["G3", 2], ["C3", 2], ["A3", 2], ["F3", 2], ["G3", 2]],
  },
};

/* 环境点缀：鸟鸣 / 汽车喇叭 / 动物呼唤 / 店铺铃声 */
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
    gain.gain.exponentialRampToValueAtTime(0.014, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain).connect(dest || audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }
}
function carHorn(delay, dest) {
  tone(392, 0.1, "square", 0.016, delay, dest);
  tone(392, 0.1, "square", 0.016, delay + 0.16, dest);
}
function animalCall(delay, dest) {
  tone(392, 0.18, "triangle", 0.018, delay, dest);
  tone(523.25, 0.24, "triangle", 0.016, delay + 0.2, dest);
}
function shopBell(delay, dest) {
  tone(1568, 0.5, "sine", 0.018, delay, dest);
  tone(2093, 0.4, "sine", 0.011, delay + 0.02, dest);
}

function stopMusic() {
  if (musicTimer) clearTimeout(musicTimer);
  musicTimer = null;
  musicId = null;
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
  stopMusic();
  ensureAudio();
  if (!audioCtx) return;
  const cfg = THEME_MUSIC[id] || THEME_MUSIC.food;
  musicId = id;
  musicGain = audioCtx.createGain();
  musicGain.gain.value = 1;
  musicGain.connect(audioCtx.destination);
  const dest = musicGain;
  const beat = 60 / cfg.bpm;
  const run = () => {
    if (musicId !== id || !audioCtx || !dest) return;
    let mel = 0;
    cfg.melody.forEach(([note, beats]) => {
      if (note !== "R") tone(NOTE_FREQ[note], beat * beats * 0.9, cfg.wave, 0.02, mel, dest);
      mel += beat * beats;
    });
    let bass = 0;
    cfg.bass.forEach(([note, beats]) => {
      tone(NOTE_FREQ[note], beat * beats * 0.95, cfg.bassWave || "triangle", 0.015, bass, dest);
      bass += beat * beats;
    });
    if (cfg.ambient === "bird") birdChirp(beat * 6, dest);
    else if (cfg.ambient === "horn") carHorn(beat * 8, dest);
    else if (cfg.ambient === "call") animalCall(beat * 3, dest);
    else if (cfg.ambient === "bell") shopBell(beat * 10, dest);
    musicTimer = setTimeout(run, Math.max(mel, bass) * 1000);
  };
  run();
}

/* 页面与音乐同步：只在闯关地图里播放当前主题的 BGM */
function syncMusic(screen, themeId) {
  if (screen === "map") playMusic(themeId);
  else stopMusic();
}
