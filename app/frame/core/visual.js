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
/* 蜡笔手绘霸王龙：一张位图对应一个成长阶段，坐标系 0 0 768 768，脚底在 y=730 */
const DINO_ART = {
  egg:   { src: "images/dino/egg.webp",   k: 0.92 },
  baby:  { src: "images/dino/baby.webp",  k: 0.88 },
  teen:  { src: "images/dino/teen.webp",  k: 0.97 },
  adult: { src: "images/dino/adult.webp", k: 1 },
  super: { src: "images/dino/super.webp", k: 1 },
};

/* 究极体的四种机甲形态，索引 = ultraSkin - 1 */
const ULTRA_ART = [
  { src: "images/dino/ultra-1.webp", k: 1 },
  { src: "images/dino/ultra-2.webp", k: 1 },
  { src: "images/dino/ultra-3.webp", k: 1 },
  { src: "images/dino/ultra-4.webp", k: 1 },
];
let ultraSkin = 1;
function setUltraSkin(n) {
  ultraSkin = Math.min(ULTRA_ART.length, Math.max(1, Number(n) || 1));
}
function ultraArt(skin) {
  return ULTRA_ART[Math.min(ULTRA_ART.length, Math.max(1, Number(skin) || ultraSkin)) - 1];
}
function eggSVG() {
  const art = DINO_ART.egg;
  return `<svg class="dino" data-stage="egg" viewBox="0 0 768 768" width="100%" height="100%" aria-label="恐龙蛋">
    <ellipse cx="384" cy="742" rx="196" ry="15" fill="#1F6B4A" opacity=".13"/>
    <image href="${art.src}" x="0" y="0" width="768" height="768"/>
  </svg>`;
}

function dino(stage = "teen", opts = {}) {
  if (stage === "egg") return eggSVG();
  const key = stage === "ultra" ? "ultra" : stage;
  const art = stage === "ultra" ? ultraArt(opts.skin) : (DINO_ART[key] || DINO_ART.teen);
  return `<svg class="dino" data-stage="${key}" viewBox="0 0 768 768" width="100%" height="100%" aria-label="恐龙">
    <g transform="translate(384 730) scale(${art.k}) translate(-384 -730)">
      <ellipse cx="384" cy="742" rx="212" ry="16" fill="#1F6B4A" opacity=".13"/>
      <image href="${art.src}" x="0" y="0" width="768" height="768"/>
    </g>
  </svg>`;
}

/* ------------------------------------------------ theme words */
/* 主题词汇由 app/words/*.js 注册；有精绘 SVG 的用 art，其余用 emoji 插图 */
function emojiArt(ch) {
  return `<svg class="fruit" viewBox="0 0 120 120" aria-hidden="true">
    <text x="60" y="64" font-size="78" text-anchor="middle" dominant-baseline="middle">${ch}</text>
  </svg>`;
}
