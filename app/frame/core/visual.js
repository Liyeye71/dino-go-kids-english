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
  home: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.4 11.6a7.6 7.6 0 0 1 15.2 0"/><path d="M6.6 11.4v7.2a1.6 1.6 0 0 0 1.6 1.6h7.6a1.6 1.6 0 0 0 1.6-1.6v-7.2"/><path d="M10.2 20.2v-4a1.8 1.8 0 0 1 3.6 0v4"/><path d="M8.6 8.3h6.8" opacity=".45"/></svg>`,
  flag: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9.8" cy="15.6" rx="3.7" ry="4.1" fill="${c}" fill-opacity=".16"/><circle cx="6.2" cy="9.6" r="1.7"/><circle cx="9.8" cy="7.5" r="1.8"/><circle cx="13.4" cy="9.6" r="1.7"/><path d="M18.4 5.6c1.7 1.1 2.7 2.6 2.7 4.4" opacity=".45"/></svg>`,
  book: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.6A2.6 2.6 0 0 1 6.6 3H20v15.5H6.6A2.6 2.6 0 0 0 4 21z"/><path d="M20 18.5v2.2H6.6A2.6 2.6 0 0 1 4 18.1"/><path d="M8 7.5h8"/></svg>`,
  bag: (s = 23, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5.4 8h13.2l1 12.2a.9.9 0 0 1-.9 1H5.3a.9.9 0 0 1-.9-1z"/><path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8"/></svg>`,
  check: (s = 13, c = "#fff") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>`,
  lock: (s = 16, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.4 10.2V8.4C7.4 5.5 9.4 3.5 12 3.5s4.6 2 4.6 4.9v1.8"/><rect x="4.4" y="10.2" width="15.2" height="10.4" rx="4.4"/><circle cx="12" cy="15.4" r="1.25" fill="${c}" stroke="none"/></svg>`,
  close: (s = 17, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  arrow: (s = 14, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  back: (s = 18, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
  speaker: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.2 9.6h3.2L12 5.4v13.2L7.4 14.4H4.2a1.2 1.2 0 0 1-1.2-1.2v-2.4a1.2 1.2 0 0 1 1.2-1.2z" fill="${c}" fill-opacity=".14"/><path d="M15.2 9.4a3.6 3.6 0 0 1 0 5.2"/><path d="M17.8 7.2a7 7 0 0 1 0 9.6"/><circle cx="20.2" cy="4.4" r="1.5" fill="${c}" stroke="none" opacity=".85"/><path d="M17 17.2h2.8" opacity=".5"/></svg>`,
  heart: (s = 17, c = "#FF6F61", opacity = 1) => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" style="opacity:${opacity}"><path d="M12 21s-8.4-5.2-8.4-11A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.4 10c0 5.8-8.4 11-8.4 11z" fill="${c}"/></svg>`,
  flame: (s = 14, c = "#FF7A45") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24"><path d="M12.6 2c.4 3.4-.9 5.2-2.6 6.8C8.4 10.3 7 12.1 7 14.2A5.2 5.2 0 0 0 12.6 19c3 0 5.4-2.2 5.4-5.2 0-2.3-1-4.2-2.4-5.9-.2 1.6-.8 2.7-1.6 3.3.1-2.7-.3-5.6-1.4-9.2z" fill="${c}"/></svg>`,
  gear: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  gift: (s = 22, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.6c3.1 0 5.3 3.2 5.3 6.5H6.7c0-3.3 2.2-6.5 5.3-6.5z" fill="${c}" fill-opacity=".14"/><path d="M12 3.8l-1.5 3.2 2.1 2.2"/><path d="M6.2 10.4h11.6"/><path d="M6.7 13.4c-1.7 0-2.7 1.7-1.8 3.1 1 1.6 3.8 2.8 7.1 2.8s6.1-1.2 7.1-2.8c.9-1.4-.1-3.1-1.8-3.1"/><path d="M18.7 4.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="${c}" stroke="none"/></svg>`,
  crownMini: (s = 18, c = "#C98B25") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 4l4.5 8L21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="${c}"/></svg>`,
  chevron: (s = 10, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l7 7-7 7"/></svg>`,
  leaf: (s = 24, c = "#2E8B57") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24"><path d="M20 4C10 4 4 9 4 16c0 2 1 4 1 4s2-9 11-11c-5 3-9 7-9 11 0 0 8 2 13-4 3-4 2-9 0-12z" fill="${c}"/></svg>`,
  share: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`,
  refresh: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/></svg>`,
  info: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="${c}"/></svg>`,
  volume: (s = 20, c = "currentColor") => `<svg width="${sz(s)}" height="${sz(s)}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.8" y="8.4" width="7.2" height="7.2" rx="2.4"/><path d="M11 11.2l4.4-3v7.6L11 12.8"/><path d="M18 9.4a4.4 4.4 0 0 1 0 5.2"/></svg>`,
};

/* ------------------------------------------------ quiz UI art */
/* 答题页通用奶油卡通素材；题目单词图仍由 wordArt/artOf 提供 */
/* 情景对话的动物角色头像：纯 SVG 绘制，不使用单词素材图片，避免与题目配图混淆 */
const ZOO_AVATAR_ART = {
  panda: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="31" cy="30" r="14" fill="#3E3A36" stroke="#5C411D" stroke-width="5"/>
    <circle cx="89" cy="30" r="14" fill="#3E3A36" stroke="#5C411D" stroke-width="5"/>
    <circle cx="60" cy="66" r="41" fill="#FFFDF6" stroke="#5C411D" stroke-width="5"/>
    <ellipse cx="43" cy="62" rx="12" ry="15" fill="#3E3A36" transform="rotate(-18 43 62)"/>
    <ellipse cx="77" cy="62" rx="12" ry="15" fill="#3E3A36" transform="rotate(18 77 62)"/>
    <circle cx="45" cy="62" r="4" fill="#FFFDF6"/><circle cx="75" cy="62" r="4" fill="#FFFDF6"/>
    <ellipse cx="60" cy="80" rx="7" ry="5" fill="#3E3A36"/>
    <path d="M51 88q9 7 18 0" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  monkey: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="22" cy="52" r="15" fill="#C98A55" stroke="#5C411D" stroke-width="5"/>
    <circle cx="98" cy="52" r="15" fill="#C98A55" stroke="#5C411D" stroke-width="5"/>
    <circle cx="60" cy="64" r="40" fill="#D89A63" stroke="#5C411D" stroke-width="5"/>
    <ellipse cx="60" cy="78" rx="25" ry="20" fill="#F6D3A8" stroke="#5C411D" stroke-width="4"/>
    <circle cx="46" cy="57" r="4.5" fill="#4B3626"/><circle cx="74" cy="57" r="4.5" fill="#4B3626"/>
    <ellipse cx="60" cy="74" rx="5" ry="4" fill="#4B3626"/>
    <path d="M51 85q9 7 18 0" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  rabbit: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="43" cy="28" rx="11" ry="25" fill="#F7F2E7" stroke="#5C411D" stroke-width="5" transform="rotate(-8 43 28)"/>
    <ellipse cx="77" cy="28" rx="11" ry="25" fill="#F7F2E7" stroke="#5C411D" stroke-width="5" transform="rotate(8 77 28)"/>
    <ellipse cx="43" cy="29" rx="4.5" ry="15" fill="#F2B7C4"/>
    <ellipse cx="77" cy="29" rx="4.5" ry="15" fill="#F2B7C4"/>
    <circle cx="60" cy="69" r="38" fill="#F7F2E7" stroke="#5C411D" stroke-width="5"/>
    <circle cx="46" cy="64" r="4.5" fill="#4B3626"/><circle cx="74" cy="64" r="4.5" fill="#4B3626"/>
    <ellipse cx="60" cy="77" rx="5.5" ry="4" fill="#E48A9E"/>
    <path d="M60 81v6M52 88q8 6 16 0" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  duck: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="66" r="38" fill="#FFD75E" stroke="#5C411D" stroke-width="5"/>
    <path d="M49 30q5-14 16-10" fill="none" stroke="#EFAF2F" stroke-width="7" stroke-linecap="round"/>
    <circle cx="46" cy="59" r="4.5" fill="#4B3626"/><circle cx="74" cy="59" r="4.5" fill="#4B3626"/>
    <ellipse cx="60" cy="80" rx="17" ry="10" fill="#F79B3E" stroke="#5C411D" stroke-width="4"/>
    <path d="M44 80q16 6 32 0" fill="none" stroke="#D97B22" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  lion: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <g fill="#E8A33D" stroke="#5C411D" stroke-width="4">
      <circle cx="104" cy="64" r="10"/><circle cx="96" cy="90" r="10"/><circle cx="74" cy="106" r="10"/>
      <circle cx="46" cy="106" r="10"/><circle cx="24" cy="90" r="10"/><circle cx="16" cy="64" r="10"/>
      <circle cx="24" cy="38" r="10"/><circle cx="46" cy="22" r="10"/><circle cx="74" cy="22" r="10"/><circle cx="96" cy="38" r="10"/>
    </g>
    <circle cx="60" cy="64" r="44" fill="#E8A33D" stroke="#5C411D" stroke-width="5"/>
    <circle cx="60" cy="66" r="31" fill="#FFD08A" stroke="#5C411D" stroke-width="5"/>
    <ellipse cx="60" cy="80" rx="16" ry="11" fill="#FFE7BE"/>
    <circle cx="48" cy="63" r="4.5" fill="#4B3626"/><circle cx="72" cy="63" r="4.5" fill="#4B3626"/>
    <path d="M55 76h10l-5 6z" fill="#4B3626"/>
    <path d="M52 87q8 6 16 0" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  elephant: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="24" cy="64" rx="20" ry="27" fill="#AEBAC6" stroke="#5C411D" stroke-width="5"/>
    <ellipse cx="96" cy="64" rx="20" ry="27" fill="#AEBAC6" stroke="#5C411D" stroke-width="5"/>
    <circle cx="60" cy="62" r="37" fill="#BCC8D4" stroke="#5C411D" stroke-width="5"/>
    <path d="M60 84q-2 19 5 27q7 7 13 1" fill="none" stroke="#5C411D" stroke-width="15" stroke-linecap="round"/>
    <path d="M60 84q-2 19 5 27q7 7 13 1" fill="none" stroke="#BCC8D4" stroke-width="9" stroke-linecap="round"/>
    <circle cx="47" cy="58" r="4.5" fill="#4B3626"/><circle cx="73" cy="58" r="4.5" fill="#4B3626"/>
    <path d="M44 80q-6 6-2 12M76 80q6 6 2 12" fill="none" stroke="#FFFDF6" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  giraffe: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M46 26V15M74 26V15" stroke="#5C411D" stroke-width="5" stroke-linecap="round"/>
    <circle cx="46" cy="12" r="6" fill="#C98A3E" stroke="#5C411D" stroke-width="4"/>
    <circle cx="74" cy="12" r="6" fill="#C98A3E" stroke="#5C411D" stroke-width="4"/>
    <ellipse cx="32" cy="41" rx="12" ry="8" fill="#F3C766" stroke="#5C411D" stroke-width="4" transform="rotate(-24 32 41)"/>
    <ellipse cx="88" cy="41" rx="12" ry="8" fill="#F3C766" stroke="#5C411D" stroke-width="4" transform="rotate(24 88 41)"/>
    <ellipse cx="60" cy="70" rx="32" ry="40" fill="#F3C766" stroke="#5C411D" stroke-width="5"/>
    <ellipse cx="60" cy="88" rx="22" ry="21" fill="#F7DD9E" stroke="#5C411D" stroke-width="4"/>
    <circle cx="48" cy="60" r="4.5" fill="#4B3626"/><circle cx="72" cy="60" r="4.5" fill="#4B3626"/>
    <circle cx="37" cy="45" r="5" fill="#C98A3E"/><circle cx="83" cy="51" r="4.5" fill="#C98A3E"/><circle cx="40" cy="76" r="4" fill="#C98A3E"/>
    <ellipse cx="53" cy="87" rx="3" ry="4" fill="#C98A3E"/><ellipse cx="67" cy="87" rx="3" ry="4" fill="#C98A3E"/>
    <path d="M54 97q6 5 12 0" fill="none" stroke="#5C411D" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  tiger: () => `<svg class="ref-zoo-art" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="28" cy="36" r="13" fill="#F0A03E" stroke="#5C411D" stroke-width="5"/>
    <circle cx="92" cy="36" r="13" fill="#F0A03E" stroke="#5C411D" stroke-width="5"/>
    <circle cx="60" cy="68" r="40" fill="#F5A23F" stroke="#5C411D" stroke-width="5"/>
    <path d="M46 30l4 14M60 26v14M74 30l-4 14" stroke="#4B3626" stroke-width="5" stroke-linecap="round"/>
    <path d="M24 58l12 4M22 72l12 2M96 58l-12 4M98 72l-12 2" stroke="#4B3626" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="60" cy="82" rx="22" ry="17" fill="#FFF1D6"/>
    <circle cx="47" cy="63" r="4.5" fill="#4B3626"/><circle cx="73" cy="63" r="4.5" fill="#4B3626"/>
    <path d="M54 76h12l-6 6z" fill="#4B3626"/>
    <path d="M52 88q8 6 16 0" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
};

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
  zookeeper() {
    return `<svg class="ref-keeper-art" viewBox="0 0 120 150" aria-hidden="true">
      <path d="M26 140Q27 104 60 103Q93 104 94 140Z" fill="#7FA85A" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      <path d="M46 104L60 118L74 104" fill="none" stroke="#FFF8E7" stroke-width="5" stroke-linecap="round"/>
      <rect x="52" y="118" width="16" height="13" rx="3" fill="#FFE08C" stroke="#5C411D" stroke-width="3"/>
      <circle cx="60" cy="124.5" r="3" fill="#B5651D"/>
      <ellipse cx="60" cy="70" rx="32" ry="30" fill="#FFD8B5" stroke="#5C411D" stroke-width="5"/>
      <path d="M29 58Q22 34 58 32Q92 34 91 56Q76 52 62 42Q50 54 29 58Z" fill="#7A4A2B" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="48" cy="70" r="3.6" fill="#5C411D"/><circle cx="73" cy="70" r="3.6" fill="#5C411D"/>
      <circle cx="38" cy="80" r="5.5" fill="#F5A2A0" opacity=".6"/><circle cx="83" cy="80" r="5.5" fill="#F5A2A0" opacity=".6"/>
      <path class="ref-keeper-mouth" d="M51 84Q60 92 70 84" fill="none" stroke="#5C411D" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 45Q31 22 60 20Q89 22 90 45Z" fill="#8FAF63" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      <path d="M22 46Q60 38 98 46Q98 54 60 56Q22 54 22 46Z" fill="#A8C77C" stroke="#5C411D" stroke-width="5" stroke-linejoin="round"/>
      <path d="M60 23V43" stroke="#5C411D" stroke-width="3"/>
    </svg>`;
  },
  /* 出场动物角色白名单：只使用下面这些纯 SVG 头像，保证名字和形象一致 */
  zooAnimalWords: ["panda", "monkey", "rabbit", "duck", "lion", "elephant", "giraffe", "tiger"],
  zooAnimal(word) {
    const art = ZOO_AVATAR_ART[word];
    return art ? art() : "";
  },
  scene() {
    return `
      <!-- 底层背景：云朵 + 小树 + 公路车队 + 最底层单行贴纸艺术字 -->
      <svg class="ref-scene-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
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

  /* 独立 Logo：不再跟随背景切片，viewBox 完整包住艺术字，可放进任意容器安全缩放 */
  logo() {
    /* viewBox 底部留白收紧：艺术字在容器内垂直居中，整体观感更靠下 */
    return `<svg class="ref-logo-art" viewBox="0 0 720 136" preserveAspectRatio="xMidYMid meet" role="img" aria-label="DinoGo 恐龙英语">
      <defs>
        <!-- 贴纸柔投影 -->
        <filter id="dinogo-sticker-shadow" x="-10%" y="-15%" width="120%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="#9A7242" flood-opacity="0.22"/>
        </filter>
        <!-- DinoGo 焦糖棕渐变（参考稿配色） -->
        <linearGradient id="dinogo-grad-en" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E4B58F"/>
          <stop offset="45%" stop-color="#D0956B"/>
          <stop offset="100%" stop-color="#B87C50"/>
        </linearGradient>
        <!-- 恐龙英语 蜂蜜橙渐变（参考稿浅蜜桃配色） -->
        <linearGradient id="dinogo-grad-zh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFE1B8"/>
          <stop offset="45%" stop-color="#FBC98C"/>
          <stop offset="100%" stop-color="#F2AE6E"/>
        </linearGradient>

        <!-- 小恐龙外轮廓（破壳版，保持原占位盒 294–393 / 19–132） -->
        <g id="dinogo-dino-shape" transform="translate(268.8 -3.6) scale(1.2556)">
          <path d="M78 24 Q88 18 87 30 Z"/>
          <path d="M86 38 Q97 35 93 47 Z"/>
          <path d="M36 62 C30 44 38 22 59 20 C79 18 90 36 86 62 Z"/>
          <path d="M24 62 L37 72 L49 58 L61 71 L74 58 L86 70 L96 62 C97 89 82 108 60 108 C38 108 23 89 24 62 Z"/>
          <ellipse cx="42" cy="64" rx="7" ry="4.5"/>
          <ellipse cx="78" cy="64" rx="7" ry="4.5"/>
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

      <!-- 第 1 层：白色模切贴纸外描边（26px 白边作为安全边距） -->
      <g filter="url(#dinogo-sticker-shadow)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="26" stroke-linejoin="round" stroke-linecap="round">
        <use href="#dinogo-dino-shape" transform="translate(375 4) scale(0.84)"/>
        <use href="#dinogo-text-en"/>
        <use href="#dinogo-text-zh"/>
      </g>

      <!-- 第 2 层：右侧卡通小绿恐龙（破壳形象，占位盒子与原图一致） -->
      <g transform="translate(375 4) scale(0.84)">
        <g transform="translate(268.8 -3.6) scale(1.2556)" stroke="#6A401D" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">
          <path d="M78 24 Q88 18 87 30 Z" fill="#F8C284"/>
          <path d="M86 38 Q97 35 93 47 Z" fill="#F8C284"/>
          <path d="M36 62 C30 44 38 22 59 20 C79 18 90 36 86 62 Z" fill="#B2DC8E"/>
          <circle cx="49" cy="43" r="3.2" fill="#5D3718" stroke="none"/>
          <circle cx="71" cy="43" r="3.2" fill="#5D3718" stroke="none"/>
          <path d="M55 50 Q60 55 65 50" fill="none" stroke="#5D3718" stroke-width="2.8"/>
          <ellipse cx="41" cy="49" rx="4.5" ry="2.8" fill="#F4A595" stroke="none" opacity=".85"/>
          <ellipse cx="79" cy="49" rx="4.5" ry="2.8" fill="#F4A595" stroke="none" opacity=".85"/>
          <path d="M24 62 L37 72 L49 58 L61 71 L74 58 L86 70 L96 62 C97 89 82 108 60 108 C38 108 23 89 24 62 Z" fill="#FFF7DF"/>
          <circle cx="42" cy="86" r="5.5" fill="#F7C77E" stroke="none" opacity=".75"/>
          <circle cx="77" cy="83" r="6" fill="#C7E49E" stroke="none" opacity=".8"/>
          <circle cx="60" cy="96" r="4" fill="#F4B09B" stroke="none" opacity=".75"/>
          <ellipse cx="42" cy="64" rx="7" ry="4.5" fill="#B2DC8E"/>
          <ellipse cx="78" cy="64" rx="7" ry="4.5" fill="#B2DC8E"/>
        </g>
      </g>

      <!-- 第 3 层：立体底厚（英文深巧克力棕，中文浅焦糖棕） -->
      <g transform="translate(0 5)" fill="#6E3F1C" stroke="#6E3F1C" stroke-width="11" stroke-linejoin="round" paint-order="stroke fill">
        <use href="#dinogo-text-en"/>
      </g>
      <g transform="translate(0 5)" fill="#BE8255" stroke="#BE8255" stroke-width="11" stroke-linejoin="round" paint-order="stroke fill">
        <use href="#dinogo-text-zh"/>
      </g>

      <!-- 第 4 层：渐变主字 + 描边（中文用浅棕描边，降低厚重感） -->
      <use href="#dinogo-text-en" fill="url(#dinogo-grad-en)" stroke="#764422" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill"/>
      <use href="#dinogo-text-zh" fill="url(#dinogo-grad-zh)" stroke="#BE8255" stroke-width="10" stroke-linejoin="round" paint-order="stroke fill"/>

      <!-- 第 5 层：糖果高光点与童趣小星星 -->
      <g fill="#FFFFFF" opacity="0.82">
        <ellipse cx="44" cy="48" rx="6" ry="3" transform="rotate(-24 44 48)"/>
        <ellipse cx="222" cy="48" rx="7" ry="3" transform="rotate(-22 222 48)"/>
        <ellipse cx="344" cy="46" rx="6" ry="3" transform="rotate(-20 344 46)"/>
        <ellipse cx="478" cy="46" rx="6" ry="3" transform="rotate(-18 478 46)"/>
      </g>
      <path d="M18 38 L21 45 L28 47 L21 50 L18 57 L15 50 L8 47 L15 45 Z" fill="#FFD36E" stroke="#764422" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="315" cy="34" r="4" fill="#A7D979" stroke="#764422" stroke-width="2"/>
    </svg>`;
  },

  /* Logo 外框：任意页面放入即可复用同一套尺寸与间距 */
  logoBanner() {
    return `<div class="ref-logo">${this.logo()}</div>`;
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

/* 究极体形态：索引 = ultraSkin - 1（前 4 种为超级霸王龙机甲，后 10 种为究极体图鉴） */
const ULTRA_ART = [
  { src: "images/dino/ultra-1.webp", k: 1 },
  { src: "images/dino/ultra-2.webp", k: 1 },
  { src: "images/dino/ultra-3.webp", k: 1 },
  { src: "images/dino/ultra-4.webp", k: 1 },
  { src: "images/dino/ultra-5.webp", k: 1 },
  { src: "images/dino/ultra-6.webp", k: 1 },
  { src: "images/dino/ultra-7.webp", k: 1 },
  { src: "images/dino/ultra-8.webp", k: 1 },
  { src: "images/dino/ultra-9.webp", k: 1 },
  { src: "images/dino/ultra-10.webp", k: 1 },
  { src: "images/dino/ultra-11.webp", k: 1 },
  { src: "images/dino/ultra-12.webp", k: 1 },
  { src: "images/dino/ultra-13.webp", k: 1 },
  { src: "images/dino/ultra-14.webp", k: 1 },
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
