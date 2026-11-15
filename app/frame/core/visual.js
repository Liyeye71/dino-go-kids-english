/* ============================================================
   视觉资源：星标、界面图标、恐龙 / 商店 / 水果 SVG 与 emoji 插图
   ============================================================ */

const starPath = "M12 2.4l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9z";
/* 图标尺寸按 16px 设计稿换算成 rem，跟随根字号整体缩放 */
const sz = (n) => `${Math.round((n / 16) * 10000) / 10000}rem`;
const star = (s = 16, fill = "#FFC94A", stroke = "#E9A93C", opacity = 1) =>
  `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" style="opacity:${opacity}" aria-hidden="true"><path d="${starPath}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const spark = (s = 16, fill = "#FFD25A") =>
  `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" fill="${fill}"/></svg>`;

const I = {
  home: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 10.7 12 3.7l8.4 7v9.3a1 1 0 0 1-1 1h-4.9v-6.3H9.5V21H4.6a1 1 0 0 1-1-1z"/></svg>`,
  flag: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4.5h11.2l-2.3 3.7 2.3 3.8H6z" fill="${c}" fill-opacity=".16"/></svg>`,
  book: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.6A2.6 2.6 0 0 1 6.6 3H20v15.5H6.6A2.6 2.6 0 0 0 4 21z"/><path d="M20 18.5v2.2H6.6A2.6 2.6 0 0 1 4 18.1"/><path d="M8 7.5h8"/></svg>`,
  bag: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5.4 8h13.2l1 12.2a.9.9 0 0 1-.9 1H5.3a.9.9 0 0 1-.9-1z"/><path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8"/></svg>`,
  check: (s = 13, c = "#fff") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>`,
  lock: (s = 16, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>`,
  close: (s = 17, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  arrow: (s = 14, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  back: (s = 18, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
  speaker: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.4L12.5 5v14L7.4 14.5H4z" fill="${c}" fill-opacity=".14"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.2 6.5a7.6 7.6 0 0 1 0 11"/></svg>`,
  heart: (s = 17, c = "#FF6F61", opacity = 1) => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" style="opacity:${opacity}"><path d="M12 21s-8.4-5.2-8.4-11A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.4 10c0 5.8-8.4 11-8.4 11z" fill="${c}"/></svg>`,
  flame: (s = 14, c = "#FF7A45") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24"><path d="M12.6 2c.4 3.4-.9 5.2-2.6 6.8C8.4 10.3 7 12.1 7 14.2A5.2 5.2 0 0 0 12.6 19c3 0 5.4-2.2 5.4-5.2 0-2.3-1-4.2-2.4-5.9-.2 1.6-.8 2.7-1.6 3.3.1-2.7-.3-5.6-1.4-9.2z" fill="${c}"/></svg>`,
  gear: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  gift: (s = 22, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8.5" width="17" height="4" rx="1.2"/><path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8.5V21"/><path d="M12 8.5S10.8 4 8.3 4a2.3 2.3 0 0 0 0 4.5zM12 8.5S13.2 4 15.7 4a2.3 2.3 0 0 1 0 4.5z"/></svg>`,
  crownMini: (s = 18, c = "#C98B25") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 4l4.5 8L21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="${c}"/></svg>`,
  chevron: (s = 10, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l7 7-7 7"/></svg>`,
  leaf: (s = 24, c = "#2E8B57") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24"><path d="M20 4C10 4 4 9 4 16c0 2 1 4 1 4s2-9 11-11c-5 3-9 7-9 11 0 0 8 2 13-4 3-4 2-9 0-12z" fill="${c}"/></svg>`,
  share: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`,
  refresh: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/></svg>`,
  info: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="${c}"/></svg>`,
  volume: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h4L14 5v14l-6-4.5H4z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg>`,
};

/* ------------------------------------------------ dino art */
/* 蜡笔手绘霸王龙：一张位图对应一个成长阶段，ultra 复用 super。
   head / face / back 是装饰锚点：[中心 x, 基准 y, 目标宽度]，坐标系 0 0 768 768。
   head 的 y 是帽檐落点（头顶），face 的 y 是眼镜中心，back 的 y 是翅膀中心。 */
const DINO_ART = {
  egg:   { src: "images/dino/egg.webp",   k: 0.92, head: [384, 108, 430], face: [384, 380, 470], back: [384, 430, 540] },
  baby:  { src: "images/dino/baby.webp",  k: 0.88, head: [250, 80, 300],  face: [212, 186, 330], back: [466, 332, 310] },
  teen:  { src: "images/dino/teen.webp",  k: 0.97, head: [246, 84, 268],  face: [203, 128, 288], back: [520, 332, 330] },
  adult: { src: "images/dino/adult.webp", k: 1,    head: [232, 66, 262],  face: [202, 118, 286], back: [536, 338, 330] },
  super: { src: "images/dino/super.webp", k: 1,    head: [222, 98, 272],  face: [208, 172, 296], back: [516, 354, 330] },
};
const INK = "#3B2A1F";

function eggSVG() {
  const art = DINO_ART.egg;
  return `<svg class="dino" data-stage="egg" viewBox="0 0 768 768" width="100%" height="100%" aria-label="恐龙蛋">
    <ellipse cx="384" cy="742" rx="196" ry="15" fill="#1F6B4A" opacity=".13"/>
    <image href="${art.src}" x="0" y="0" width="768" height="768"/>
  </svg>`;
}

function dinoHat() {
  return `<g stroke="${INK}" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">
    <path d="M112 47c0-24 15-37 36-37s36 13 36 37z" fill="#F3CE93"/>
    <path d="M112 41c22 7 50 7 72 0v8c-22 7-50 7-72 0z" fill="#C98744"/>
    <ellipse cx="148" cy="49" rx="59" ry="7.5" fill="#E8B877"/>
    <path d="M148 16v26" stroke="#B97636" stroke-width="2.2" opacity=".75"/>
    <circle cx="148" cy="31" r="5" fill="#E75A4B" stroke-width="2"/>
  </g>`;
}
function dinoGlasses() {
  return `<g stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
    <rect x="144" y="50" width="29" height="22" rx="8" fill="#2B3A33"/>
    <rect x="178" y="54" width="22" height="19" rx="7" fill="#2B3A33"/>
    <path d="M173 57h5" fill="none"/>
    <path d="M150 55l7-2.5" stroke="#BFE9F8" stroke-width="2.2"/>
    <path d="M183 59l5-2" stroke="#BFE9F8" stroke-width="2"/>
  </g>`;
}
function dinoCrown() {
  return `<g stroke="${INK}" stroke-width="2.8" stroke-linejoin="round">
    <path d="M116 42l6-30 15 17 11-23 12 23 15-17 6 30z" fill="#FFD25A"/>
    <rect x="114" y="37" width="68" height="10" rx="3" fill="#F2B23E"/>
    <circle cx="148" cy="28" r="5" fill="#E75A4B" stroke-width="1.8"/>
    <circle cx="128" cy="32" r="3.4" fill="#7FD1F0" stroke-width="1.6"/>
    <circle cx="168" cy="32" r="3.4" fill="#7FD1F0" stroke-width="1.6"/>
  </g>`;
}
function dinoWings() {
  return `<g stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" opacity=".97">
    <path d="M92 132C70 112 42 88 18 78c-4 26 16 52 46 66-12-4-24-12-32-22 10 24 30 36 62 36z" fill="#C3B4FF"/>
    <path d="M148 132c22-20 50-44 74-54 4 26-16 52-46 66 12-4 24-12 32-22-10 24-30 36-62 36z" fill="#C3B4FF"/>
    <path d="M30 92c14 8 32 22 50 38M210 92c-14 8-32 22-50 38" fill="none" stroke="#8E76F0" stroke-width="2.8" opacity=".75"/>
  </g>`;
}

/* 装饰件原本按 240 画布绘制，这里按锚点缩放到 768 画布 */
function deco(art, slot, inner, baseW, ax, ay) {
  const [x, y, w] = art[slot];
  const k = w / baseW;
  return `<g transform="translate(${x} ${y}) scale(${k}) translate(${-ax} ${-ay})">${inner}</g>`;
}

function dino(stage = "teen", opts = {}) {
  if (stage === "egg") return eggSVG();
  const key = stage === "ultra" ? "super" : stage;
  const art = DINO_ART[key] || DINO_ART.teen;
  const eq = opts.equipped || {};
  const wings = eq.back === "wings" ? deco(art, "back", dinoWings(), 204, 120, 123) : "";
  const head = eq.head === "hat" ? deco(art, "head", dinoHat(), 120, 148, 49)
    : eq.head === "crown" ? deco(art, "head", dinoCrown(), 68, 148, 44) : "";
  const face = eq.face === "glasses" ? deco(art, "face", dinoGlasses(), 58, 173, 60) : "";
  const k = art.k;
  return `<svg class="dino" data-stage="${key}" viewBox="0 0 768 768" width="100%" height="100%" aria-label="恐龙">
    <g transform="translate(384 730) scale(${k}) translate(-384 -730)">
      <ellipse cx="384" cy="742" rx="212" ry="16" fill="#1F6B4A" opacity=".13"/>
      ${wings}
      <image href="${art.src}" x="0" y="0" width="768" height="768"/>
      ${head}${face}
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
