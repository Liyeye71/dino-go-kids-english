/* ============================================================
   视觉资源：星标、界面图标、恐龙 / 收藏 / 水果 SVG 与 emoji 插图
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

/* ------------------------------------------------ quiz UI art */
/* 答题页通用奶油卡通素材；题目单词图仍由 wordArt/artOf 提供 */
const QuizUiArt = {
  speaker() {
    return `<svg class="ref-toast-art" viewBox="0 0 180 150" aria-hidden="true">
      <path d="M38 58Q22 28 52 21Q90 7 128 21Q158 28 142 58V128Q142 139 131 139H49Q38 139 38 128Z" fill="#F6C878" stroke="#5C411D" stroke-width="6" stroke-linejoin="round"/>
      <path d="M49 61Q38 39 60 33Q90 22 120 33Q142 39 131 61V119Q131 127 123 127H57Q49 127 49 119Z" fill="#FFF0C9"/>
      <path d="M64 69H78L99 53V102L78 85H64Z" fill="#68BE83" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      <path d="M110 66Q123 77 110 89M121 55Q145 77 121 100" fill="none" stroke="#5C411D" stroke-width="5" stroke-linecap="round"/>
      <circle cx="67" cy="116" r="4" fill="#E59B56"/><circle cx="113" cy="116" r="4" fill="#E59B56"/>
    </svg>`;
  },
  child(kind = "boy") {
    const girl = kind === "girl";
    const hair = girl ? "#633F2C" : "#7A4A2B";
    const shirt = girl ? "#F49AB2" : "#75B9E8";
    return `<svg class="ref-child-art" viewBox="0 0 120 150" aria-hidden="true">
      ${girl ? `<path d="M25 66Q15 22 60 15Q105 22 95 70L91 105H29Z" fill="${hair}" stroke="#5C411D" stroke-width="5"/>` : ""}
      <path d="M30 137Q31 102 60 101Q89 102 90 137Z" fill="${shirt}" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      <path d="M42 104V94H78V104" fill="#FFD8B5" stroke="#5C411D" stroke-width="5"/>
      <ellipse cx="60" cy="62" rx="36" ry="40" fill="#FFD8B5" stroke="#5C411D" stroke-width="5"/>
      <path d="M25 57Q20 23 58 18Q93 18 97 50Q79 48 65 31Q54 48 25 57Z" fill="${hair}" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      ${girl ? `<path d="M31 47Q19 69 29 91M91 46Q103 69 92 93" fill="none" stroke="${hair}" stroke-width="12" stroke-linecap="round"/>` : ""}
      <circle cx="46" cy="63" r="4" fill="#5C411D"/><circle cx="75" cy="63" r="4" fill="#5C411D"/>
      <circle cx="37" cy="75" r="6" fill="#F5A2A0" opacity=".65"/><circle cx="84" cy="75" r="6" fill="#F5A2A0" opacity=".65"/>
      <path class="ref-child-mouth" d="M50 80Q60 90 71 80" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 120L60 132L76 120" fill="none" stroke="#FFF8E7" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  },
  scene() {
    return `
      <!-- 底层背景：云朵 + 小树 + 公路车队 + 最底层单行贴纸艺术字 -->
      <svg class="ref-scene-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <!-- 贴纸柔投影 -->
          <filter id="dinogo-sticker-shadow" x="-10%" y="-15%" width="120%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="#9A7242" flood-opacity="0.22"/>
          </filter>
          <!-- DinoGo 焦糖棕渐变（调淡版） -->
          <linearGradient id="dinogo-grad-en" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F7DDB8"/>
            <stop offset="28%" stop-color="#D6A77C"/>
            <stop offset="100%" stop-color="#B4825C"/>
          </linearGradient>
          <!-- 恐龙英语 蜂蜜橙渐变（调淡版） -->
          <linearGradient id="dinogo-grad-zh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FDF5DC"/>
            <stop offset="28%" stop-color="#FAD9A4"/>
            <stop offset="100%" stop-color="#F0B578"/>
          </linearGradient>
          <!-- 小恐龙奶油绿渐变 -->
          <linearGradient id="dinogo-grad-dino" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#B8E196"/>
            <stop offset="100%" stop-color="#97C975"/>
          </linearGradient>

          <!-- 小恐龙外轮廓 -->
          <g id="dinogo-dino-shape">
            <path d="M337 31 Q346 19 354 32 Z"/>
            <path d="M352 44 Q366 37 364 52 Z"/>
            <path d="M360 62 Q374 58 369 73 Z"/>
            <path d="M363 81 Q376 80 369 94 Z"/>
            <path d="M370 98 Q382 95 379 109 Z"/>
            <path d="M306 76 C295 66 297 46 310 35 C323 24 345 25 356 41 C364 53 366 72 365 88 C373 95 384 99 389 107 C393 114 381 127 366 129 C349 132 327 132 316 124 C305 116 304 98 308 86 C304 82 303 79 306 76 Z"/>
          </g>

          <!-- 逐字歪头跳动排版：DinoGo -->
          <g id="dinogo-text-en" text-anchor="middle" font-weight="400"
             font-family="'ZCOOL KuaiLe', ui-rounded, 'SF Pro Rounded', sans-serif">
            <text x="58"  y="89" font-size="68" transform="rotate(-8 58 89)">D</text>
            <text x="103" y="83" font-size="64" transform="rotate(6 103 83)">i</text>
            <text x="140" y="90" font-size="64" transform="rotate(-5 140 90)">n</text>
            <text x="186" y="84" font-size="64" transform="rotate(7 186 84)">o</text>
            <text x="236" y="90" font-size="68" transform="rotate(-6 236 90)">G</text>
            <text x="285" y="84" font-size="64" transform="rotate(6 285 84)">o</text>
          </g>

          <!-- 逐字歪头跳动排版：恐龙英语 -->
          <g id="dinogo-text-zh" text-anchor="middle" font-weight="400"
             font-family="'ZCOOL KuaiLe', 'Hiragino Maru Gothic ProN', 'Yuanti SC', 'YouYuan', sans-serif">
            <text x="358" y="89" font-size="64" transform="rotate(-6 358 89)">恐</text>
            <text x="424" y="82" font-size="64" transform="rotate(5 424 82)">龙</text>
            <text x="490" y="90" font-size="64" transform="rotate(-5 490 90)">英</text>
            <text x="556" y="83" font-size="64" transform="rotate(6 556 83)">语</text>
          </g>
        </defs>

        <!-- 蓬松白云 -->
        <g fill="#FFFFFF" opacity=".78">
          <path d="M105 110 Q110 88 134 90 Q144 70 168 76 Q188 76 194 94 Q214 94 214 112 Z"/>
          <path d="M585 155 Q590 138 610 140 Q618 124 638 130 Q654 130 658 144 Q674 144 674 158 Z"/>
          <path d="M40 245 Q45 232 62 234 Q70 220 88 225 Q102 225 106 238 Q120 238 120 248 Z" opacity=".7"/>
        </g>

        <!-- 两侧圆润绘本小树 -->
        <g stroke="#8E673E" stroke-width="2.5" stroke-linejoin="round">
          <rect x="38" y="422" width="12" height="46" rx="5" fill="#C99B6B"/>
          <circle cx="44" cy="400" r="34" fill="#B6D78F"/>
          <rect x="96" y="438" width="11" height="38" rx="5" fill="#C99B6B"/>
          <circle cx="101" cy="420" r="26" fill="#F8C88C"/>
          <rect x="748" y="418" width="12" height="48" rx="5" fill="#C99B6B"/>
          <circle cx="754" cy="396" r="34" fill="#B6D78F"/>
          <rect x="692" y="436" width="11" height="40" rx="5" fill="#C99B6B"/>
          <circle cx="698" cy="418" r="25" fill="#C9E3A1"/>
        </g>

        <!-- 柔和草坡地平线 -->
        <path d="M0 464 Q200 446 400 460 T800 456 V600 H0 Z" fill="#F3E4BE"/>

        <!-- 弯弯小镇公路 -->
        <path d="M-20 480 Q210 504 410 502 T820 476 L820 520 Q610 544 410 544 T-20 522 Z" fill="#EBD0AC" stroke="#C59D6C" stroke-width="2.5"/>
        <path d="M-10 501 Q210 524 410 523 T810 498" fill="none" stroke="#FFFDF6" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="14 14" opacity=".9"/>

        <!-- 左侧珊瑚红小巴士 -->
        <g transform="translate(115 458)" stroke="#7D512C" stroke-width="2.5" stroke-linejoin="round">
          <rect x="0" y="6" width="58" height="28" rx="9" fill="#F1987E"/>
          <rect x="7" y="12" width="9" height="9" rx="2.5" fill="#FFF8E8"/>
          <rect x="20" y="12" width="9" height="9" rx="2.5" fill="#FFF8E8"/>
          <rect x="33" y="12" width="9" height="9" rx="2.5" fill="#FFF8E8"/>
          <rect x="46" y="12" width="7" height="9" rx="2.5" fill="#FFF8E8"/>
          <circle cx="14" cy="35" r="6" fill="#A67A52"/><circle cx="14" cy="35" r="2.2" fill="#FFF8E8"/>
          <circle cx="44" cy="35" r="6" fill="#A67A52"/><circle cx="44" cy="35" r="2.2" fill="#FFF8E8"/>
        </g>

        <!-- 中间奶油黄小汽车 -->
        <g transform="translate(302 478)" stroke="#7D512C" stroke-width="2.5" stroke-linejoin="round">
          <path d="M8 18 Q13 4 26 4 Q39 4 43 18 Z" fill="#FFE08C"/>
          <rect x="2" y="16" width="48" height="15" rx="7" fill="#FFD36E"/>
          <path d="M14 16 Q17 8 24 8 V16 Z M28 8 Q35 8 38 16 H28 Z" fill="#FFFDF6" stroke-width="1.8"/>
          <circle cx="13" cy="31" r="5.5" fill="#A67A52"/><circle cx="13" cy="31" r="2" fill="#FFF8E8"/>
          <circle cx="38" cy="31" r="5.5" fill="#A67A52"/><circle cx="38" cy="31" r="2" fill="#FFF8E8"/>
        </g>

        <!-- 右侧晴空蓝小汽车 -->
        <g transform="translate(585 465)" stroke="#7D512C" stroke-width="2.5" stroke-linejoin="round">
          <path d="M9 18 Q14 4 27 4 Q40 4 44 18 Z" fill="#B7DCF2"/>
          <rect x="2" y="16" width="48" height="15" rx="7" fill="#9BCBE8"/>
          <path d="M15 16 Q18 8 25 8 V16 Z M29 8 Q36 8 39 16 H29 Z" fill="#FFFDF6" stroke-width="1.8"/>
          <circle cx="13" cy="31" r="5.5" fill="#A67A52"/><circle cx="13" cy="31" r="2" fill="#FFF8E8"/>
          <circle cx="38" cy="31" r="5.5" fill="#A67A52"/><circle cx="38" cy="31" r="2" fill="#FFF8E8"/>
        </g>

        <!-- 草丛与小花 -->
        <g stroke="#86A860" stroke-width="2" fill="none" stroke-linecap="round">
          <path d="M225 480 Q223 472 218 470 M225 480 Q226 470 226 466 M225 480 Q230 472 233 470"/>
          <path d="M510 482 Q508 474 503 472 M510 482 Q511 472 511 468 M510 482 Q515 474 518 472"/>
        </g>
        <circle cx="246" cy="472" r="4" fill="#F4A58C"/>
        <circle cx="655" cy="466" r="4" fill="#F4A58C"/>

        <!-- 最下层单行贴纸艺术字：DinoGo 恐龙英语（上移贴近答题框底边） -->
        <svg x="220" y="535" width="360" height="62" viewBox="0 0 700 125" overflow="visible">
          <!-- 第 1 层：白色模切贴纸外描边（恢复安全边距，防止内容临边） -->
          <g filter="url(#dinogo-sticker-shadow)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="26" stroke-linejoin="round" stroke-linecap="round">
            <use href="#dinogo-dino-shape" transform="translate(375 4) scale(0.84)"/>
            <use href="#dinogo-text-en"/>
            <use href="#dinogo-text-zh"/>
          </g>

          <!-- 第 2 层：右侧卡通小绿恐龙 -->
          <g transform="translate(375 4) scale(0.84)" stroke="#6A401D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
            <g fill="#F8C284">
              <path d="M337 31 Q346 19 354 32 Z"/>
              <path d="M352 44 Q366 37 364 52 Z"/>
              <path d="M360 62 Q374 58 369 73 Z"/>
              <path d="M363 81 Q376 80 369 94 Z"/>
              <path d="M370 98 Q382 95 379 109 Z"/>
            </g>
            <path d="M306 76 C295 66 297 46 310 35 C323 24 345 25 356 41 C364 53 366 72 365 88 C373 95 384 99 389 107 C393 114 381 127 366 129 C349 132 327 132 316 124 C305 116 304 98 308 86 C304 82 303 79 306 76 Z"
              fill="url(#dinogo-grad-dino)"/>
            <path d="M312 85 C323 86 334 94 335 112 C335 122 330 128 320 127 C309 124 305 108 308 92 Z"
              fill="#FEF2C4" stroke="none"/>
            <path d="M312 85 C323 86 334 94 335 112 C335 121 331 127 323 128"
              fill="none" stroke="#6A401D" stroke-width="3.2"/>
            <path d="M308 88 Q295 89 294 94 Q296 99 308 97" fill="url(#dinogo-grad-dino)" stroke-width="3.5"/>
            <path d="M337 93 Q324 95 324 100 Q326 105 338 102" fill="url(#dinogo-grad-dino)" stroke-width="3.5"/>
            <circle cx="314" cy="54" r="3.4" fill="#5D3718" stroke="none"/>
            <circle cx="334" cy="59" r="3.4" fill="#5D3718" stroke="none"/>
            <path d="M316 64 Q321 69 327 65" fill="none" stroke="#5D3718" stroke-width="3"/>
            <ellipse cx="306" cy="59" rx="4.5" ry="2.8" fill="#F3A697" stroke="none" opacity="0.85"/>
            <ellipse cx="340" cy="66" rx="4.8" ry="3" fill="#F3A697" stroke="none" opacity="0.85"/>
          </g>

          <!-- 第 3 层：巧克力棕立体底厚（调淡版 #A07C55） -->
          <g transform="translate(0 5)" fill="#A07C55" stroke="#A07C55" stroke-width="11" stroke-linejoin="round" paint-order="stroke fill">
            <use href="#dinogo-text-en"/>
            <use href="#dinogo-text-zh"/>
          </g>

          <!-- 第 4 层：双色渐变主字 + 圆角棕描边（调淡版描边 #A07C55） -->
          <use href="#dinogo-text-en" fill="url(#dinogo-grad-en)" stroke="#A07C55" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill"/>
          <use href="#dinogo-text-zh" fill="url(#dinogo-grad-zh)" stroke="#A07C55" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill"/>

          <!-- 第 5 层：糖果高光点与童趣小星星 -->
          <g fill="#FFFFFF" opacity="0.82">
            <ellipse cx="44" cy="48" rx="6" ry="3" transform="rotate(-24 44 48)"/>
            <ellipse cx="222" cy="48" rx="7" ry="3" transform="rotate(-22 222 48)"/>
            <ellipse cx="344" cy="46" rx="6" ry="3" transform="rotate(-20 344 46)"/>
            <ellipse cx="478" cy="46" rx="6" ry="3" transform="rotate(-18 478 46)"/>
          </g>
          <path d="M18 38 L21 45 L28 47 L21 50 L18 57 L15 50 L8 47 L15 45 Z" fill="#FFD36E" stroke="#7A4E2A" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="315" cy="34" r="4" fill="#A7D979" stroke="#7A4E2A" stroke-width="2"/>
        </svg>
      </svg>

      <!-- 左上角童趣小飞机 -->
      <svg class="zoo-deco-plane" viewBox="0 0 130 82" aria-hidden="true">
        <path d="M6 62 Q24 58 38 46" fill="none" stroke="#C89B63" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 6" opacity=".75"/>
        <g stroke="#7D512C" stroke-width="2.6" stroke-linejoin="round">
          <path d="M40 34 L30 22 L46 28 Z" fill="#F6C8A0"/>
          <ellipse cx="72" cy="38" rx="30" ry="14" fill="#FCE2BD"/>
          <path d="M58 42 Q76 58 92 44 L76 38 Z" fill="#A8D5EE"/>
          <path d="M58 28 Q74 14 86 26 L72 31 Z" fill="#BFE2F5"/>
          <circle cx="76" cy="34" r="5" fill="#FFFDF8"/>
          <ellipse cx="105" cy="38" rx="4" ry="13" fill="#F5B28B"/>
        </g>
      </svg>

      <!-- 右上角条纹热气球 -->
      <svg class="zoo-deco-balloons" viewBox="0 0 130 135" aria-hidden="true">
        <g stroke="#7D512C" stroke-width="2.4" stroke-linejoin="round">
          <path d="M48 10 C22 10 14 34 22 56 C28 70 38 78 48 82 C58 78 68 70 74 56 C82 34 74 10 48 10 Z" fill="#FAD2BE"/>
          <path d="M48 10 C38 14 34 38 38 64 C40 72 44 78 48 82 C52 78 56 72 58 64 C62 38 58 14 48 10 Z" fill="#FFF5DF"/>
          <path d="M41 82 L43 92 M55 82 L53 92" stroke-width="2"/>
          <rect x="40" y="92" width="16" height="12" rx="3" fill="#D9A874"/>
          <g transform="translate(64 38) scale(0.72)">
            <path d="M48 10 C22 10 14 34 22 56 C28 70 38 78 48 82 C58 78 68 70 74 56 C82 34 74 10 48 10 Z" fill="#BFE2F2"/>
            <path d="M48 10 C38 14 34 38 38 64 C40 72 44 78 48 82 C52 78 56 72 58 64 C62 38 58 14 48 10 Z" fill="#FCE0B8"/>
            <path d="M41 82 L43 92 M55 82 L53 92" stroke-width="2"/>
            <rect x="40" y="92" width="16" height="12" rx="3" fill="#D9A874"/>
          </g>
        </g>
      </svg>`;
  },
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
