/* ============================================================
   DinoGo · 恐龙英语 — interactive app
   ============================================================ */

/* ------------------------------------------------ data */
const STAGES = [
  { key: "egg",   name: "恐龙蛋",       phase: "孵化期", min: 0,    rarity: 3, height: "18 cm", weight: "0.4 kg", skill: "等待破壳", desc: "一颗安静的恐龙蛋，表面有薄荷色斑点。每天认真学习，它就会听见你的声音。" },
  { key: "baby",  name: "幼龙",         phase: "幼年期", min: 240,  rarity: 3, height: "0.6 m", weight: "8 kg", skill: "奶声奶气", desc: "刚破壳的小家伙，走起路来摇摇晃晃。最喜欢和你一起读单词。" },
  { key: "teen",  name: "少年龙",       phase: "成长期", min: 900,  rarity: 4, height: "1.2 m", weight: "36 kg", skill: "记忆力 +10%", desc: "背上长出了第一排小刺，眼睛亮亮的。它已经能记住好多水果单词了。" },
  { key: "adult", name: "成年龙",       phase: "成熟期", min: 2100, rarity: 4, height: "2.1 m", weight: "120 kg", skill: "星星加成 +10%", desc: "鼻尖长出了小角，步伐变得稳健。现在是森林里最可靠的伙伴。" },
  { key: "super", name: "霸王龙",       phase: "完全体", min: 4200, rarity: 5, height: "3.6 m", weight: "1.2 t", skill: "王者气势", desc: "金色的背刺在阳光下闪闪发亮。它记得你陪它走过的每一次闯关。" },
  { key: "ultra", name: "超级霸王龙",   phase: "究极体", min: 6000, rarity: 5, height: "5.0 m", weight: "2.4 t", skill: "星辉护佑", desc: "传说中的究极形态，身上环绕着星辉。只有最坚持的小探险家才能遇见它。" },
];

const ITEMS = [
  { id: "hat",     slot: "head", name: "探险帽",     sub: "进化奖励 · 稀有", price: 0,   unlockStage: "adult", thumb: "h1", art: itemHat },
  { id: "glasses", slot: "face", name: "酷酷墨镜",   sub: "配饰 · 稀有",     price: 80,  thumb: "h2", art: itemGlasses },
  { id: "wings",   slot: "back", name: "蝴蝶翅膀",   sub: "翅膀 · 史诗",     price: 150, thumb: "h3", badge: "NEW", art: itemWings },
  { id: "crown",   slot: "head", name: "黄金小皇冠", sub: "头饰 · 传说",     price: 200, thumb: "h4", art: itemCrown },
];

const BACKGROUNDS = [
  { id: "jungle", name: "晨雾森林", sub: "默认场景",     price: 0,   cls: "jungle" },
  { id: "sunset", name: "落日山谷", sub: "背景 · 稀有",   price: 120, cls: "sunset" },
  { id: "night",  name: "星空营地", sub: "背景 · 史诗",   price: 200, cls: "night" },
];

const DEX = STAGES.map((s) => ({ ...s }));

/* ------------------------------------------------ helpers */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function stageIndex(key) { return Math.max(0, STAGES.findIndex((s) => s.key === key)); }
function stageMeta(key) { return STAGES[stageIndex(key)] || STAGES[0]; }
function nextStage(key) { return STAGES[stageIndex(key) + 1] || null; }
function stageForGrowth(growth) {
  let out = STAGES[0];
  for (const s of STAGES) if (growth >= s.min) out = s;
  return out;
}
function fmt(n) { return Number(n).toLocaleString("en-US"); }
function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function bgClass(bg) { return bg === "sunset" ? "bg-sunset" : bg === "night" ? "bg-night" : "bg-jungle"; }
function bgMeta(id) { return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0]; }

/* ------------------------------------------------ icons */
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
  medal: (s = 26, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14.5" r="6"/><path d="M8.2 3h7.6l-2.6 5.6h-2.4z"/><path d="M12 11.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 13.8l2-.3z" fill="${c}" fill-opacity=".14"/></svg>`,
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

/* ------------------------------------------------ fruit art */
function appleSVG() {
  return `<svg viewBox="0 0 160 160" class="fruit" aria-label="苹果">
    <path d="M80 40c-4-12-12-18-22-20 2 10 8 17 18 22z" fill="#8CC063"/>
    <path d="M80 41c1-9 5-16 13-22 1 11-3 19-11 24z" fill="#6BA552"/>
    <path d="M80 44c-4-10-4-16-2-22" stroke="#8A5B32" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M80 42c17-13 48-7 58 23 10 32-10 70-33 76-11 3-18-2-25-2s-14 5-25 2C32 135 12 97 22 65 32 35 63 29 80 42z" fill="#F4603F"/>
    <path d="M80 50c14-10 36-8 47 10-12-6-28-6-40 2z" fill="#FF8A66" opacity=".75"/>
    <path d="M36 74c4-14 14-22 24-24-12 8-18 18-20 32z" fill="#fff" opacity=".35"/>
    <path d="M120 118c8-10 12-24 12-36" stroke="#C33F26" stroke-width="4" stroke-linecap="round" opacity=".4" fill="none"/>
  </svg>`;
}
function bananaSVG() {
  return `<svg viewBox="0 0 160 160" class="fruit" aria-label="香蕉">
    <path d="M42 36c6 50 42 82 88 66 12-4 20-13 24-26-28 18-64 8-82-20-10-15-14-32-14-46-8 2-14 12-16 26z" fill="#FFD25A" stroke="#E3A93C" stroke-width="4" stroke-linejoin="round"/>
    <path d="M58 52c8 34 32 58 62 60" fill="none" stroke="#FFF0B8" stroke-width="8" stroke-linecap="round" opacity=".7"/>
    <path d="M42 36c-2-8-8-12-16-12 1 9 5 15 12 18z" fill="#8A5B32"/>
    <path d="M154 76c6 1 10 5 10 9-5 2-10 0-13-4z" fill="#8A5B32"/>
    <circle cx="128" cy="96" r="3" fill="#D99A2F" opacity=".6"/><circle cx="112" cy="104" r="2.4" fill="#D99A2F" opacity=".5"/>
  </svg>`;
}
function orangeSVG() {
  return `<svg viewBox="0 0 160 160" class="fruit" aria-label="橙子">
    <circle cx="80" cy="90" r="52" fill="#FF9A3D"/>
    <circle cx="80" cy="90" r="52" fill="none" stroke="#E2781F" stroke-width="3"/>
    <path d="M80 38c-2-10 2-18 10-24 0 10-4 18-10 24z" fill="#6BA552"/>
    <path d="M80 38c2-9 8-16 16-18-1 9-7 16-16 18z" fill="#8CC063"/>
    <path d="M80 40v-4" stroke="#8A5B32" stroke-width="5" stroke-linecap="round"/>
    <path d="M48 62c6-14 18-22 30-24-12 8-20 20-24 34z" fill="#FFC27A" opacity=".8"/>
    <circle cx="112" cy="72" r="3" fill="#E2781F" opacity=".45"/><circle cx="118" cy="96" r="4" fill="#E2781F" opacity=".35"/>
    <circle cx="58" cy="110" r="3.4" fill="#E2781F" opacity=".35"/><circle cx="92" cy="122" r="3" fill="#E2781F" opacity=".4"/>
    <circle cx="70" cy="72" r="2.6" fill="#E2781F" opacity=".3"/><circle cx="102" cy="108" r="2.4" fill="#E2781F" opacity=".35"/>
  </svg>`;
}
function grapeSVG() {
  return `<svg viewBox="0 0 160 160" class="fruit" aria-label="葡萄">
    <path d="M80 38c-2-12 4-20 14-26 1 10-4 20-14 26z" fill="#8CC063"/>
    <path d="M80 40c-6-8-14-12-24-12 2 10 10 16 24 16z" fill="#6BA552"/>
    <path d="M80 42c-2-6-2-10 0-14" stroke="#8A5B32" stroke-width="5" stroke-linecap="round"/>
    <g fill="#8E76F0" stroke="#7A5FD8" stroke-width="2">
      <circle cx="62" cy="62" r="15"/><circle cx="86" cy="58" r="14"/><circle cx="108" cy="66" r="13"/>
      <circle cx="50" cy="86" r="14"/><circle cx="74" cy="82" r="15"/><circle cx="98" cy="84" r="14"/><circle cx="120" cy="88" r="12"/>
      <circle cx="62" cy="108" r="14"/><circle cx="86" cy="104" r="15"/><circle cx="108" cy="108" r="13"/>
      <circle cx="76" cy="126" r="13"/><circle cx="98" cy="126" r="11"/>
    </g>
    <circle cx="62" cy="57" r="4" fill="#C9BEFF" opacity=".75"/><circle cx="74" cy="77" r="4" fill="#C9BEFF" opacity=".65"/>
    <circle cx="86" cy="99" r="3.5" fill="#C9BEFF" opacity=".6"/>
  </svg>`;
}
function strawberrySVG() {
  return `<svg viewBox="0 0 160 160" class="fruit" aria-label="草莓">
    <path d="M80 42c18-12 44-4 46 22 2 24-24 58-46 72-22-14-48-48-46-72 2-26 28-34 46-22z" fill="#F25450"/>
    <path d="M80 42c-10-4-16-10-18-18 10-1 18 3 24 12 6-9 14-13 24-12-2 8-10 14-20 18z" fill="#5FAE5A"/>
    <path d="M80 44V30" stroke="#3E8F45" stroke-width="4" stroke-linecap="round"/>
    <g fill="#FFE3B0">
      <ellipse cx="62" cy="66" rx="2" ry="3.4"/><ellipse cx="84" cy="60" rx="2" ry="3.4"/><ellipse cx="102" cy="72" rx="2" ry="3.4"/>
      <ellipse cx="54" cy="88" rx="2" ry="3.4"/><ellipse cx="76" cy="84" rx="2" ry="3.4"/><ellipse cx="96" cy="92" rx="2" ry="3.4"/>
      <ellipse cx="64" cy="108" rx="2" ry="3.4"/><ellipse cx="86" cy="110" rx="2" ry="3.4"/><ellipse cx="76" cy="126" rx="2" ry="3.4"/>
      <ellipse cx="112" cy="86" rx="2" ry="3.4"/>
    </g>
    <path d="M40 66c4-14 14-22 24-24-12 8-18 18-20 32z" fill="#fff" opacity=".22"/>
  </svg>`;
}

/* ------------------------------------------------ theme words */
/* 主题词汇由 app/words/*.js 注册；有精绘 SVG 的用 art，其余用 emoji 插图 */
function emojiArt(ch) {
  return `<svg class="fruit" viewBox="0 0 120 120" aria-hidden="true">
    <text x="60" y="64" font-size="78" text-anchor="middle" dominant-baseline="middle">${ch}</text>
  </svg>`;
}
const WORD_SETS = (window.DINO_WORD_SETS || []).map((set) => ({
  ...set,
  words: set.words.map((w) => ({ ...w, art: w.art || (() => emojiArt(w.emoji || "❓")) })),
}));
const ALL_WORDS = WORD_SETS.flatMap((set) => set.words);
/* 每个主题 10 关；每关 5 题：答对 3 题 1 星、4 题 2 星、5 题 3 星，≥2 星才解锁下一关 */
const LEVELS_PER_THEME = 10;
const PASS_STARS = 2;
function currentTheme() {
  return WORD_SETS.find((set) => set.id === state.theme) || WORD_SETS[0];
}
function themeWords() {
  return currentTheme().words;
}
/* 每个主题独立关卡进度：{ level, stars }，互不影响 */
function themeProgress(id) {
  const key = id || (state && state.theme) || "fruit";
  if (!state.progress) state.progress = {};
  if (!state.progress[key]) state.progress[key] = { level: 1, stars: {} };
  return state.progress[key];
}
function themeStars(p) {
  return Object.values(p.stars).reduce((a, b) => a + b, 0);
}
function totalLevelsDone() {
  return WORD_SETS.reduce((n, t) => n + (state.progress && state.progress[t.id] ? state.progress[t.id].level - 1 : 0), 0);
}
/* 全新存档：零星星、零成长、零记录，所有主题从第 1 关开始 */
function initialState() {
  return {
    ...DEFAULT_STATE,
    tasks: { ...DEFAULT_STATE.tasks },
    equipped: { ...DEFAULT_STATE.equipped },
    progress: {},
    log: {},
    bgOwned: [...DEFAULT_STATE.bgOwned],
    dex: [...DEFAULT_STATE.dex],
    owned: [],
  };
}

/* ------------------------------------------------ state */
const STORE_KEY = "dinogo.v3";
try {
  if (new URLSearchParams(location.search).get("fresh") === "1") localStorage.removeItem(STORE_KEY);
} catch (e) { /* private mode */ }
const DEFAULT_STATE = {
  v: 3,
  name: "毛肚",
  stars: 0,
  growth: 0,
  stage: "egg",
  theme: "fruit",
  progress: {},
  log: {},
  words: 0,
  minutes: 0,
  threeStars: 0,
  tasks: { level: false },
  owned: [],
  equipped: { head: null, face: null, back: null },
  bg: "jungle",
  bgOwned: ["jungle"],
  dex: ["egg"],
  sound: true,
  starBonus: 0,
};

let state = loadState();
let current = "home";
let quiz = null;
let lastResult = null;
let evolutionInfo = null;
let timers = [];
let installDismissed = false;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return {
      ...initialState(),
      ...parsed,
      tasks: { ...DEFAULT_STATE.tasks, ...(parsed.tasks || {}) },
      equipped: { ...DEFAULT_STATE.equipped, ...(parsed.equipped || {}) },
      progress: parsed.progress || {},
      log: parsed.log || {},
      bgOwned: Array.isArray(parsed.bgOwned) ? parsed.bgOwned : [...DEFAULT_STATE.bgOwned],
      dex: Array.isArray(parsed.dex) ? parsed.dex : [...DEFAULT_STATE.dex],
      owned: Array.isArray(parsed.owned) ? parsed.owned : [],
    };
  } catch (e) {
    return initialState();
  }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
}
function resetState() {
  state = initialState();
  lastResult = null;
  evolutionInfo = null;
  quiz = null;
  save();
}

/* ------------------------------------------------ study log */
function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function recordLevel(stars) {
  const k = dateKey();
  const rec = state.log[k] || { levels: 0, stars: 0 };
  state.log[k] = { levels: rec.levels + 1, stars: rec.stars + stars };
}

/* ------------------------------------------------ timers */
function setTimer(fn, ms) {
  const id = setTimeout(() => { timers = timers.filter((t) => t !== id); fn(); }, ms);
  timers.push(id);
  return id;
}
function clearTimers() { timers.forEach((t) => clearTimeout(t)); timers = []; }

/* ------------------------------------------------ router */
function go(name, opts = {}) {
  if (name === current && !opts.replace && !opts.force) { render(); return; }
  clearTimers();
  current = name;
  try {
    if (opts.replace) history.replaceState({ screen: name }, "");
    else history.pushState({ screen: name }, "");
  } catch (e) { /* local file / restricted history */ }
  render();
  requestAnimationFrame(() => {
    const sc = $(".scroll");
    if (sc) sc.scrollTop = 0;
  });
}
function back() {
  clearTimers();
  if (quiz && current === "quiz") { quiz = null; go("map", { replace: true }); return; }
  if (history.length > 1) history.back();
  else go("home", { replace: true });
}

/* ------------------------------------------------ common UI */
const TABS = [["home", "乐园", I.home], ["map", "闯关", I.flag], ["words", "词汇", I.book], ["shop", "小铺", I.bag]];
function tabbar(active) {
  return `<nav class="tabbar">${TABS.map(([id, label, ic]) =>
    `<button class="tab ${active === id ? "on" : ""}" data-action="tab" data-screen="${id}" aria-label="${label}">
      <span class="ic">${ic(22)}</span><span>${label}</span>
    </button>`).join("")}</nav>`;
}
function starPill() {
  return `<div class="star-pill">${star(17)}<span class="num">${fmt(state.stars)}</span></div>`;
}
function stageChip() {
  const st = stageMeta(state.stage);
  return `${I.leaf(11)} ${st.phase} · ${st.name}`;
}

/* 按真实时间切换天空：19:00–05:59 为夜晚，其余为白天 */
function isNightNow() {
  const h = new Date().getHours();
  return h >= 19 || h < 6;
}
function sceneHTML() {
  if (isNightNow()) {
    const dots = Array.from({ length: 18 }, (_, i) => {
      const x = (i * 37 + 11) % 100, y = (i * 23 + 7) % 70, s = (i % 3) + 1.2;
      return `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;opacity:${0.3 + (i % 4) * 0.16}"></i>`;
    }).join("");
    return `<div class="scene"><div class="moon"></div><div class="stars">${dots}</div>
      <div class="hill a"></div><div class="hill b"></div>
      <svg class="leaves l" viewBox="0 0 100 120"><path d="M4 118C8 78 30 42 74 22 64 58 48 84 26 102 46 86 62 70 72 50 44 70 24 94 4 118z" fill="#2E6B4E"/></svg>
      <svg class="leaves r" viewBox="0 0 100 120"><path d="M96 118C92 78 70 42 26 22c10 36 26 62 48 80-20-16-36-32-46-52 28 20 48 44 68 68z" fill="#347454"/></svg>
    </div>`;
  }
  return `<div class="scene">
    <div class="sun"></div><div class="cloud a"></div><div class="cloud b"></div>
    <div class="hill a"></div><div class="hill b"></div>
    <svg class="leaves l" viewBox="0 0 100 120"><path d="M4 118C8 78 30 42 74 22 64 58 48 84 26 102 46 86 62 70 72 50 44 70 24 94 4 118z" fill="#62A968"/><path d="M0 120C18 92 44 70 80 56 60 82 34 104 0 120z" fill="#4E9459"/></svg>
    <svg class="leaves r" viewBox="0 0 100 120"><path d="M96 118C92 78 70 42 26 22c10 36 26 62 48 80-20-16-36-32-46-52 28 20 48 44 68 68z" fill="#6DB270"/></svg>
  </div>`;
}
/* 天空外观由真实时间决定：夜晚统一夜空，白天沿用已购买的背景色调 */
function heroSkyClass() {
  if (isNightNow()) return "sky-night";
  return `sky-day bg-${state.bg === "night" ? "jungle" : state.bg}`;
}


function openOverlay(html) { $("#overlay-root").innerHTML = html; }
function closeOverlay() { $("#overlay-root").innerHTML = ""; }

function openSettings() {
  const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <h2>设置</h2>
      <div class="sheet-sub">${standalone ? "当前已从主屏幕运行，体验和 App 一样。" : "调整声音、安装到主屏幕，或重置演示进度。"}</div>
      <div style="margin-top:10px">
        <div class="setting-row">
          <div class="s-ic">${I.volume(18)}</div>
          <div class="s-txt"><b>音效与发音</b><span>答对 / 答错 / 翻页的提示音</span></div>
          <button class="switch ${state.sound ? "on" : ""}" data-action="toggle-sound" aria-label="音效开关"></button>
        </div>
        <div class="setting-row" data-action="install-guide" role="button">
          <div class="s-ic">${I.share(18)}</div>
          <div class="s-txt"><b>安装到主屏幕</b><span>全屏运行，像原生 App 一样</span></div>
          <span style="color:#B3A78E">${I.chevron(12)}</span>
        </div>
        <div class="setting-row" data-action="reset-confirm" role="button">
          <div class="s-ic">${I.refresh(18)}</div>
          <div class="s-txt"><b>清空学习数据</b><span>星星、成长值与闯关进度全部归零</span></div>
          <span style="color:#B3A78E">${I.chevron(12)}</span>
        </div>
        <div class="setting-row">
          <div class="s-ic">${I.info(18)}</div>
          <div class="s-txt"><b>DinoGo · 恐龙英语</b><span>交互概念版 v1.0 · 离线可用</span></div>
        </div>
      </div>
      <div class="sheet-actions"><button class="btn ghost" data-action="close-overlay">完成</button></div>
    </div>
  </div>`);
}
function openInstallGuide() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <h2>把 DinoGo 装到主屏幕</h2>
      <div class="sheet-sub">添加后会以全屏方式运行；通过 HTTPS 访问时还支持离线打开。</div>
      ${ios ? `
        <div class="install-step"><span class="n">1</span><p>用 <b>Safari</b> 打开本页（需要是本机或局域网地址，不能是本地文件）。</p></div>
        <div class="install-step"><span class="n">2</span><p>点击底部工具栏的 <b>分享</b> 按钮。</p></div>
        <div class="install-step"><span class="n">3</span><p>向上滑动，选择 <b>添加到主屏幕</b>，再点右上角「添加」。</p></div>
        <div class="install-step"><span class="n">4</span><p>回到主屏幕，点击 DinoGo 图标即可全屏进入。</p></div>
      ` : `
        <div class="install-step"><span class="n">1</span><p>在 Chrome / Edge 中通过 <b>http 或 https</b> 打开本页。</p></div>
        <div class="install-step"><span class="n">2</span><p>点击地址栏右侧的 <b>安装</b> 图标，或菜单里的「安装应用」。</p></div>
        <div class="install-step"><span class="n">3</span><p>安装后可从桌面独立打开，并离线使用。</p></div>
      `}
      <div class="install-note">提示：直接双击本地 HTML 文件时，Safari 不会显示「添加到主屏幕」。请用项目里的 <b>start-ios.ps1</b> 启动本地服务，再用 iPad 访问电脑的局域网地址。局域网 HTTP 下不会启用离线缓存；需要离线请用单文件版，或部署到 HTTPS。</div>
      <div class="sheet-actions"><button class="btn" data-action="close-overlay">知道了</button></div>
    </div>
  </div>`);
}
function openResetConfirm() {
  openOverlay(`<div class="overlay dialog-wrap">
    <div class="dialog">
      <div class="d-ico">${I.refresh(24, "#B4811C")}</div>
      <h3>重置演示进度？</h3>
      <p>成长值、星星、装扮和图鉴都会回到初始状态。此操作无法撤销。</p>
      <div class="d-actions">
        <button class="btn ghost" data-action="close-overlay">取消</button>
        <button class="btn" data-action="confirm-reset" style="background:linear-gradient(180deg,#F0796A,#D95848);box-shadow:0 5px 0 #B84435">确认重置</button>
      </div>
    </div>
  </div>`);
}

/* ------------------------------------------------ toast */
function toast(msg) {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  root.appendChild(el);
  while (root.children.length > 3) root.removeChild(root.firstChild);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 2100);
}

/* ------------------------------------------------ events */
document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("overlay")) { closeOverlay(); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  if (action === "tab") {
    closeOverlay();
    go(el.dataset.screen, { replace: true });
    sfx("tap");
  } else if (action === "home") {
    closeOverlay();
    go("home", { replace: true });
  } else if (action === "profile") {
    go("profile");
    sfx("tap");
  } else if (action === "start-quiz") {
    closeOverlay();
    startQuiz(el.dataset.level);
  } else if (action === "review-level") {
    startQuiz(Number(el.dataset.level));
  } else if (action === "locked-level") {
    toast("先拿到两星通过前一关，才能解锁这一关");
  } else if (action === "select") {
    selectOption(el.dataset.word);
  } else if (action === "check") {
    checkAnswer();
  } else if (action === "match-word") {
    matchPickWord(el.dataset.word);
  } else if (action === "match-art") {
    matchPickArt(el.dataset.word);
  } else if (action === "repeat-done") {
    repeatDone();
  } else if (action === "next") {
    nextQuestion();
  } else if (action === "close-quiz") {
    quiz = null;
    go("map", { replace: true });
  } else if (action === "evolve") {
    beginEvolution();
  } else if (action === "shop-tab") {
    shopTab = el.dataset.tab;
    sfx("tap");
    render();
    const sc = $(".scroll"); if (sc) sc.scrollTop = 0;
  } else if (action === "buy-item") {
    openBuyItem(el.dataset.id);
  } else if (action === "equip-item") {
    toggleItem(el.dataset.id);
  } else if (action === "locked-item") {
    const item = ITEMS.find((i) => i.id === el.dataset.id);
    if (item && item.unlockStage) toast(`进化到${stageMeta(item.unlockStage).name}即可解锁`);
  } else if (action === "buy-bg") {
    openBuyBg(el.dataset.id);
  } else if (action === "equip-bg") {
    equipBg(el.dataset.id);
  } else if (action === "confirm-buy") {
    confirmBuy();
  } else if (action === "dex-detail") {
    openDexDetail(el.dataset.key);
  } else if (action === "filter-dex") {
    dexFilter = el.dataset.filter;
    sfx("tap");
    render();
  } else if (action === "filter-word") {
    wordsLetter = el.dataset.letter;
    sfx("tap");
    render();
    const sc = $(".scroll"); if (sc) sc.scrollTop = 0;
  } else if (action === "theme") {
    state.theme = el.dataset.theme;
    save();
    sfx("tap");
    render();
  } else if (action === "settings") {
    openSettings();
  } else if (action === "toggle-sound") {
    state.sound = !state.sound;
    save();
    if (state.sound) { ensureAudio(); sfx("tap"); }
    syncMusic(current, state.theme);
    openSettings();
    toast(state.sound ? "音效已开启" : "音效已关闭");
  } else if (action === "install-guide") {
    openInstallGuide();
  } else if (action === "reset-confirm") {
    openResetConfirm();
  } else if (action === "confirm-reset") {
    resetState();
    closeOverlay();
    go("home", { replace: true });
    toast("已重置演示进度");
  } else if (action === "close-overlay") {
    closeOverlay();
  } else if (action === "speak-word") {
    speak(el.dataset.word);
  } else if (action === "open-review") {
    openReview();
  } else if (action === "random-word") {
    openReview(true);
  } else if (action === "open-map") {
    go("map");
  }
});

window.addEventListener("popstate", (e) => {
  const s = (e.state && e.state.screen) || "home";
  if (s === "result" && !lastResult) { current = "home"; render(); return; }
  if (s === "evolution" && !evolutionInfo) { current = "home"; render(); return; }
  if (s === "quiz" && !quiz) { current = "map"; render(); return; }
  clearTimers();
  current = s;
  render();
});

document.addEventListener("gesturestart", (e) => e.preventDefault());

/* ------------------------------------------------ render */
/* 页面渲染表在 boot() 里装配，保证四个 Tab 文件都已加载 */
let SCREEN_FN = {};
function render() {
  const fn = SCREEN_FN[current] || screenHome;
  $("#view").innerHTML = fn();
  syncMusic(current, state.theme);
}

/* ------------------------------------------------ boot */
function boot() {
  SCREEN_FN = {
    home: screenHome,
    map: screenMap,
    quiz: screenQuiz,
    result: screenResult,
    evolution: screenEvolution,
    shop: screenShop,
    words: screenWords,
    profile: screenProfile,
  };
  try {
    if (!history.state || !history.state.screen) history.replaceState({ screen: "home" }, "");
    else current = history.state.screen;
  } catch (e) { current = "home"; }

  // A result/evolution screen cannot be restored without runtime context.
  if (current === "result" && !lastResult) current = "home";
  if (current === "evolution" && !evolutionInfo) current = "home";
  if (current === "quiz" && !quiz) current = "home";
  /* 旧存档里的“图鉴”Tab 已并入小铺 → 图鉴 */
  if (current === "dex") { current = "shop"; shopTab = "dex"; }

  render();

  // Warm up the audio graph on the first touch (iOS requirement).
  const wake = () => { ensureAudio(); syncMusic(current, state.theme); document.removeEventListener("touchstart", wake); document.removeEventListener("click", wake); };
  document.addEventListener("touchstart", wake, { passive: true });
  document.addEventListener("click", wake);

  // iOS install hint — only once, and only in Safari (not standalone).
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  let seen = false;
  try { seen = localStorage.getItem("dinogo.installHint") === "1"; } catch (e) {}
  if (isIOS && !standalone && !seen) {
    setTimeout(() => {
      if (current !== "home") return;
      try { localStorage.setItem("dinogo.installHint", "1"); } catch (e) {}
      toast("提示：分享 → 添加到主屏幕，可全屏离线玩");
    }, 2400);
  }
}

/* PWA: cache the app for offline use when served over http(s). */
if ("serviceWorker" in navigator && !window.__DINOGO_SINGLE__ && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

