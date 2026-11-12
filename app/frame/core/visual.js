/* ============================================================
   视觉资源：星标、界面图标、恐龙 / 商店 / 水果 SVG 与 emoji 插图
   ============================================================ */

const starPath = "M12 2.4l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9z";
const star = (s = 16, fill = "#FFC94A", stroke = "#E9A93C", opacity = 1) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="opacity:${opacity}" aria-hidden="true"><path d="${starPath}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const spark = (s = 16, fill = "#FFD25A") =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" fill="${fill}"/></svg>`;

const I = {
  home: (s = 23, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 10.7 12 3.7l8.4 7v9.3a1 1 0 0 1-1 1h-4.9v-6.3H9.5V21H4.6a1 1 0 0 1-1-1z"/></svg>`,
  flag: (s = 23, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4.5h11.2l-2.3 3.7 2.3 3.8H6z" fill="${c}" fill-opacity=".16"/></svg>`,
  book: (s = 23, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.6A2.6 2.6 0 0 1 6.6 3H20v15.5H6.6A2.6 2.6 0 0 0 4 21z"/><path d="M20 18.5v2.2H6.6A2.6 2.6 0 0 1 4 18.1"/><path d="M8 7.5h8"/></svg>`,
  bag: (s = 23, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5.4 8h13.2l1 12.2a.9.9 0 0 1-.9 1H5.3a.9.9 0 0 1-.9-1z"/><path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8"/></svg>`,
  check: (s = 13, c = "#fff") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>`,
  lock: (s = 16, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>`,
  close: (s = 17, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  arrow: (s = 14, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  back: (s = 18, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
  speaker: (s = 20, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.4L12.5 5v14L7.4 14.5H4z" fill="${c}" fill-opacity=".14"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.2 6.5a7.6 7.6 0 0 1 0 11"/></svg>`,
  heart: (s = 17, c = "#FF6F61", opacity = 1) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="opacity:${opacity}"><path d="M12 21s-8.4-5.2-8.4-11A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.4 10c0 5.8-8.4 11-8.4 11z" fill="${c}"/></svg>`,
  flame: (s = 14, c = "#FF7A45") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12.6 2c.4 3.4-.9 5.2-2.6 6.8C8.4 10.3 7 12.1 7 14.2A5.2 5.2 0 0 0 12.6 19c3 0 5.4-2.2 5.4-5.2 0-2.3-1-4.2-2.4-5.9-.2 1.6-.8 2.7-1.6 3.3.1-2.7-.3-5.6-1.4-9.2z" fill="${c}"/></svg>`,
  gear: (s = 20, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  gift: (s = 22, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8.5" width="17" height="4" rx="1.2"/><path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8.5V21"/><path d="M12 8.5S10.8 4 8.3 4a2.3 2.3 0 0 0 0 4.5zM12 8.5S13.2 4 15.7 4a2.3 2.3 0 0 1 0 4.5z"/></svg>`,
  crownMini: (s = 18, c = "#C98B25") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 4l4.5 8L21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="${c}"/></svg>`,
  chevron: (s = 10, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l7 7-7 7"/></svg>`,
  leaf: (s = 24, c = "#2E8B57") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M20 4C10 4 4 9 4 16c0 2 1 4 1 4s2-9 11-11c-5 3-9 7-9 11 0 0 8 2 13-4 3-4 2-9 0-12z" fill="${c}"/></svg>`,
  share: (s = 20, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`,
  refresh: (s = 20, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/></svg>`,
  info: (s = 20, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="${c}"/></svg>`,
  volume: (s = 20, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h4L14 5v14l-6-4.5H4z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg>`,
};

/* ------------------------------------------------ dino art */
const DINO_PAL = {
  baby:  { body: "#7ED46F", dark: "#5CB65A", belly: "#F1FBD6", accent: "#FFB347" },
  teen:  { body: "#5BC178", dark: "#3E9F5D", belly: "#EFFBD1", accent: "#FFB347" },
  adult: { body: "#3AA56D", dark: "#257B51", belly: "#E8F9C9", accent: "#FFC24D" },
  super: { body: "#247F59", dark: "#155B3D", belly: "#DCF3BC", accent: "#FFD25A" },
};

function nestSVG() {
  return `
    <path d="M48 198C64 184 92 178 120 180s58 6 72 20c-8 16-34 24-72 24s-64-10-72-26z" fill="#8CC06B"/>
    <path d="M52 200c14 10 40 15 68 15s54-5 68-15c-6 12-32 20-68 20s-62-8-68-20z" fill="#6BA552"/>
    <path d="M64 194c-6-10-4-18 2-24 2 10 6 16 12 20zM170 192c8-10 8-18 4-26-4 10-8 16-14 20z" fill="#5E9547"/>`;
}

function eggSVG() {
  return `<svg class="dino" viewBox="0 0 240 240" width="100%" height="100%" aria-label="恐龙蛋">
    <ellipse cx="120" cy="216" rx="58" ry="9" fill="#2F6B4A" opacity=".12"/>
    ${nestSVG()}
    <path d="M120 26C156 26 182 82 182 130s-28 78-62 78-62-30-62-78S84 26 120 26z" fill="#FFF7E4" stroke="#E9D7B4" stroke-width="3"/>
    <path d="M120 34c-24 0-44 34-51 68 14-20 30-30 51-30 20 0 37 10 51 31-7-35-27-69-51-69z" fill="#FFFDF3" opacity=".8"/>
    <ellipse cx="94" cy="88" rx="9" ry="12" fill="#CFE8B0" transform="rotate(-18 94 88)"/>
    <ellipse cx="148" cy="106" rx="11" ry="8" fill="#CFE8B0" transform="rotate(14 148 106)"/>
    <ellipse cx="104" cy="152" rx="8" ry="6" fill="#FFD79B" transform="rotate(-24 104 152)"/>
    <ellipse cx="147" cy="164" rx="10" ry="7" fill="#CFE8B0" transform="rotate(20 147 164)"/>
    <ellipse cx="168" cy="78" rx="5" ry="7" fill="#FFD79B" transform="rotate(18 168 78)"/>
    <path d="M78 120l16-12 10 16 15-14 12 17 15-13 10 15" fill="none" stroke="#DEC9A0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="82" cy="128" rx="12" ry="22" fill="#fff" opacity=".45" transform="rotate(24 82 128)"/>
  </svg>`;
}

function dinoHat() {
  return `<g>
    <path d="M112 48c0-24 14-36 36-36s36 12 36 36z" fill="#F2CB8D"/>
    <path d="M112 40c22 8 50 8 72 0v9c-22 8-50 8-72 0z" fill="#C98744"/>
    <ellipse cx="148" cy="50" rx="60" ry="8" fill="#E8B877"/>
    <ellipse cx="148" cy="50" rx="60" ry="8" fill="none" stroke="#C98744" stroke-width="2" opacity=".55"/>
    <path d="M148 13v32" stroke="#E3B678" stroke-width="2.6" opacity=".5"/>
    <circle cx="148" cy="31" r="5.5" fill="#2E8B57"/>
    <path d="M126 20c5-6 12-9 20-9" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}
function dinoGlasses() {
  return `<g>
    <rect x="144" y="49" width="30" height="23" rx="9" fill="#20322B"/>
    <rect x="179" y="53" width="23" height="20" rx="8" fill="#20322B"/>
    <path d="M174 56h5" stroke="#20322B" stroke-width="4"/>
    <path d="M149 54l8-3" stroke="#9FDCF2" stroke-width="2.4" opacity=".8" stroke-linecap="round"/>
    <path d="M184 58l6-3" stroke="#9FDCF2" stroke-width="2.2" opacity=".7" stroke-linecap="round"/>
  </g>`;
}
function dinoCrown() {
  return `<g>
    <path d="M116 40l6-28 15 16 11-22 12 22 15-16 6 28z" fill="#FFD25A" stroke="#E3A332" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="114" y="36" width="68" height="9" rx="4.5" fill="#F2B23E"/>
    <circle cx="148" cy="30" r="5.2" fill="#FF6F61"/>
    <circle cx="130" cy="32" r="3.6" fill="#7FD1F0"/>
    <circle cx="167" cy="32" r="3.6" fill="#7FD1F0"/>
  </g>`;
}
function dinoWings() {
  return `<g opacity=".96">
    <path d="M92 132C70 112 42 88 18 78c-4 26 16 52 46 66-12-4-24-12-32-22 10 24 30 36 62 36z" fill="#B8A7FF"/>
    <path d="M148 132c22-20 50-44 74-54 4 26-16 52-46 66 12-4 24-12 32-22-10 24-30 36-62 36z" fill="#B8A7FF"/>
    <path d="M30 92c14 8 32 22 50 38" stroke="#8E76F0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M210 92c-14 8-32 22-50 38" stroke="#8E76F0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
    <circle cx="52" cy="106" r="4" fill="#fff" opacity=".65"/><circle cx="188" cy="106" r="4" fill="#fff" opacity=".65"/>
  </g>`;
}

function dino(stage = "teen", opts = {}) {
  if (stage === "egg") return eggSVG();
  const artStage = stage === "ultra" ? "super" : stage;
  const p = DINO_PAL[artStage] || DINO_PAL.teen;
  const scale = { baby: 0.8, teen: 1, adult: 1.04, super: 1.08, ultra: 1.08 }[stage] || 1;
  const tx = 120 - 120 * scale;
  const ty = 214 - 214 * scale;
  const eq = opts.equipped || {};
  const head = eq.head === "hat" ? dinoHat() : eq.head === "crown" ? dinoCrown() : "";
  const face = eq.face === "glasses" ? dinoGlasses() : "";
  const back = eq.back === "wings" ? dinoWings() : "";
  const shell = stage === "baby"
    ? `<g>
        <path d="M56 166l14-14 12 12 14-15 13 14 14-13 12 12 14-13 12 13c4 22-16 38-57 38s-62-16-58-38z" fill="#FFF8E8" stroke="#EAD8B5" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M80 188c4 6 10 9 18 10M120 198c6 0 11-2 15-5" stroke="#E4D0AA" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="88" cy="178" r="3" fill="#CFE8B0"/><circle cx="150" cy="180" r="4" fill="#FFD79B"/>
      </g>`
    : "";
  const extra = stage === "super" || stage === "ultra"
    ? `<g><path d="M120 112l10 10-10 10-10-10z" fill="#FFD25A" opacity=".85"/><path d="M120 126l7 7-7 7-7-7z" fill="#FFD25A" opacity=".5"/></g>`
    : "";
  const horn = artStage === "adult" || artStage === "super"
    ? `<path d="M198 62l4-13 8 12z" fill="#FFF1C9" stroke="#E8D6AE" stroke-width="1.5" stroke-linejoin="round"/>`
    : "";
  return `<svg class="dino" viewBox="0 0 240 240" width="100%" height="100%" aria-label="恐龙">
    <ellipse cx="122" cy="216" rx="64" ry="10" fill="#1F6B4A" opacity=".13"/>
    <g transform="translate(${tx} ${ty}) scale(${scale})">
      ${back}
      <path d="M82 148C54 146 30 130 14 100c22 6 38 18 50 32C50 112 46 90 52 68c14 24 30 44 48 58z" fill="${p.dark}"/>
      <path d="M90 168h26c4 0 7 3 7 7v20c0 9-7 15-16 15s-15-6-15-15v-22c0-3 0-5 0-5z" fill="${p.dark}"/>
      <ellipse cx="107" cy="204" rx="23" ry="9" fill="${p.dark}"/>
      <path d="M89 206l-5 8h7zM104 208l-5 8h7zM119 206l-5 8h7z" fill="#FFF3D6"/>
      <path d="M120 82c38 0 60 28 60 64 0 32-26 48-60 48s-60-16-60-48c0-36 22-64 60-64z" fill="${p.body}"/>
      <path d="M96 124c-4 26 6 54 24 62 18-8 28-36 24-62-10 12-38 12-48 0z" fill="${p.belly}"/>
      <path d="M128 170h26c4 0 7 3 7 7v18c0 9-7 15-16 15s-15-6-15-15v-25z" fill="${p.body}"/>
      <ellipse cx="143" cy="204" rx="23" ry="9" fill="${p.body}"/>
      <path d="M125 206l-5 8h7zM140 208l-5 8h7zM155 206l-5 8h7z" fill="#FFF3D6"/>
      <path d="M66 132c-11 5-17 15-13 25 9 3 17-3 20-12z" fill="${p.body}"/>
      <path d="M174 132c11 5 17 15 13 25-9 3-17-3-20-12z" fill="${p.body}"/>
      <path d="M56 153l-4 7h6zM183 153l4 7h-6z" fill="#FFF3D6"/>
      <path d="M112 40L104 15 91 44zM92 57L77 39l2 29zM82 79L64 69l8 25z" fill="${p.accent}"/>
      ${extra}
      <path d="M148 26c36 0 60 22 62 50 2 16-6 28-18 32l-20 1c-4 11-16 17-30 15-28-4-42-24-42-50 0-28 18-48 48-48z" fill="${p.body}"/>
      <path d="M126 38c10-8 23-11 36-8" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="164" cy="63" rx="13.5" ry="15.5" fill="#FFFDF4"/>
      <circle cx="168" cy="66" r="7.2" fill="#1D3A2E"/>
      <circle cx="165.3" cy="61.5" r="2.7" fill="#fff"/>
      <path d="M150 43c10-5 22-4 31 3" fill="none" stroke="#1D3A2E" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="198" cy="79" r="2.8" fill="#1D3A2E" opacity=".55"/>
      <path d="M174 100c10 4 22 2 31-6" fill="none" stroke="#1D3A2E" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M180 102l3.5 6 3.5-5zM192 103l3.5 5 3.5-4z" fill="#fff"/>
      <path d="M186 104c3 3 6 3 9 1" stroke="#E8695B" stroke-width="2.6" stroke-linecap="round" opacity=".55" fill="none"/>
      <ellipse cx="143" cy="99" rx="11" ry="7" fill="#FF9273" opacity=".4"/>
      ${horn}
      ${head}
      ${face}
      ${shell}
    </g>
  </svg>`;
}

/* ------------------------------------------------ shop art */
function itemHat() {
  return `<svg viewBox="0 0 80 80">
    <path d="M18 52c0-21 10-33 22-33s22 12 22 33z" fill="#F2CB8D"/>
    <path d="M18 44c13 6 31 6 44 0l1 8c-13 6-33 6-46 0z" fill="#C98744"/>
    <ellipse cx="40" cy="56" rx="31" ry="7" fill="#E0AC6A"/>
    <ellipse cx="40" cy="56" rx="31" ry="7" fill="none" stroke="#B97636" stroke-width="2" opacity=".7"/>
    <path d="M40 19v26" stroke="#E3B678" stroke-width="2.4" opacity=".55"/>
    <circle cx="40" cy="38" r="5" fill="#2E8B57"/>
    <path d="M26 27c4-6 9-9 15-10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function itemGlasses() {
  return `<svg viewBox="0 0 80 80">
    <rect x="9" y="28" width="27" height="22" rx="10" fill="#20322B"/>
    <rect x="43" y="30" width="27" height="21" rx="10" fill="#20322B"/>
    <path d="M36 35h7" stroke="#20322B" stroke-width="4"/>
    <path d="M14 33l8-3" stroke="#9FDCF2" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M48 35l7-2.5" stroke="#9FDCF2" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M13 50c2 6 7 9 12 8" fill="none" stroke="#3E5A4E" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}
function itemWings() {
  return `<svg viewBox="0 0 80 80">
    <path d="M39 54C31 36 20 22 8 16c-3 13 5 27 18 35-6-1-11-4-15-8 5 10 14 16 28 18z" fill="#B8A7FF"/>
    <path d="M41 54c8-18 19-32 31-38 3 13-5 27-18 35 6-1 11-4 15-8-5 10-14 16-28 18z" fill="#B8A7FF"/>
    <path d="M11 20c8 2 17 10 25 24" fill="none" stroke="#8E76F0" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
    <path d="M69 20c-8 2-17 10-25 24" fill="none" stroke="#8E76F0" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
    <path d="M33 54c2 6 5 10 7 14 2-4 5-8 7-14z" fill="#8E76F0"/>
    <circle cx="22" cy="38" r="2.6" fill="#fff" opacity=".8"/><circle cx="58" cy="38" r="2.6" fill="#fff" opacity=".8"/>
  </svg>`;
}
function itemCrown() {
  return `<svg viewBox="0 0 80 80">
    <path d="M12 58l3-32 15 15L40 14l10 27 15-15 3 32z" fill="#FFD25A" stroke="#E3A332" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="12" y="55" width="56" height="10" rx="5" fill="#F2B23E"/>
    <circle cx="40" cy="42" r="5" fill="#FF6F61"/>
    <circle cx="23" cy="50" r="3.6" fill="#7FD1F0"/><circle cx="57" cy="50" r="3.6" fill="#7FD1F0"/>
    <path d="M26 22l4 10" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

/* ------------------------------------------------ theme words */
/* 主题词汇由 app/words/*.js 注册；有精绘 SVG 的用 art，其余用 emoji 插图 */
function emojiArt(ch) {
  return `<svg class="fruit" viewBox="0 0 120 120" aria-hidden="true">
    <text x="60" y="64" font-size="78" text-anchor="middle" dominant-baseline="middle">${ch}</text>
  </svg>`;
}
