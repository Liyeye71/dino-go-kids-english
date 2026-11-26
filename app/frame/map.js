/* ============================================================
   DinoGo · 恐龙英语 — 闯关地图（map）
   底部 Tab 2：闯关
   - 顶层单元切换（basic 开放 / advance 锁定）
   - 单元内每个主题一张整卡地图入口（如神奇动物园封面）
   - 页面只保留一个单元大标题，旅程/宝箱跟随当前选中的主题岛（各主题独立进度）
   ============================================================ */



let islandIdx = 0;
let islandDir = "";

const MAP_BALLOON_SVG = `<svg viewBox="0 0 84 100" fill="none" aria-hidden="true">
  <path d="M34 68 L36 80 M50 68 L48 80" stroke="#8C6232" stroke-width="2.5"/>
  <ellipse cx="42" cy="36" rx="28" ry="32" fill="#FF8A4C" stroke="#5C411D" stroke-width="3.5"/>
  <ellipse cx="42" cy="36" rx="13" ry="31" fill="#FFD766" stroke="#5C411D" stroke-width="2.5"/>
  <rect x="30" y="78" width="24" height="16" rx="5" fill="#C89B63" stroke="#5C411D" stroke-width="3"/>
</svg>`;
const MAP_LEFT_ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5 L8 12 L15 19" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MAP_RIGHT_ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5 L16 12 L9 19" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function mapIslandsData() {
  const zooProg = sceneProgress("animal", "zoo");
  const curLv = zooProg.level || 1;
  return [
    {
      id: "zoo",
      themeId: "animal",
      name: "神奇动物园",
      sign: "🦁 神奇动物园 · 58 词",
      emoji: "🦁",
      mist: "探索中",
      live: true,
      playable: true,
      cover: "./images/background/theme-animal.webp",
      action: "open-animal-scene",
      scene: "zoo",
      btnText: `▶ 登岛闯关 · 第 ${curLv} 关`,
    },
    {
      id: "school",
      themeId: "school",
      name: "上学文具岛",
      sign: "🎒 上学文具岛 · 15 词",
      emoji: "🎒",
      mist: "建造中",
      live: false,
      playable: false,
      cover: "./images/background/theme-school.webp",
      action: "island-soon",
      scene: "",
      btnText: "🚧 即将开放 · 敬请期待",
    },
    {
      id: "travel",
      themeId: "travel",
      name: "去旅行交通岛",
      sign: "✈️ 去旅行交通岛 · 19 词",
      emoji: "✈️",
      mist: "建造中",
      live: false,
      playable: false,
      cover: "./images/background/theme-travel.webp",
      action: "island-soon",
      scene: "",
      btnText: "🚧 即将开放 · 敬请期待",
    },
  ];
}

function shiftIsland(delta) {
  const list = mapIslandsData();
  islandIdx = (islandIdx + delta + list.length) % list.length;
  islandDir = delta > 0 ? "next" : "prev";
  sfx("tap");
  render();
  islandDir = "";
}

function jumpIsland(idx) {
  const list = mapIslandsData();
  const next = Math.max(0, Math.min(list.length - 1, Number(idx) || 0));
  if (next === islandIdx) return;
  islandDir = next > islandIdx ? "next" : "prev";
  islandIdx = next;
  sfx("tap");
  render();
  islandDir = "";
}

function screenMap() {
  const unit = currentUnit();
  const unitThemes = themesOfUnit(unit);
  const isEnlighten = enlightenOn();

  const unitTabs = `<div class="unit-tabs">
    ${UNITS.map((u) => `<button class="ut ${u.id === unit.id ? "on" : ""}${u.locked ? " locked" : ""}" data-action="unit" data-unit="${u.id}"
      aria-label="${u.name}${u.locked ? "（未开放）" : ""}">
      <b>${u.emoji}</b>${u.name}${u.locked ? "<i>🔒</i>" : ""}
    </button>`).join("")}
  </div>`;

  const enlightenBtn = `<button type="button" class="enlighten-btn${isEnlighten ? " on" : ""}" data-action="enlighten-toggle"
    role="switch" aria-checked="${isEnlighten}" aria-label="启蒙模式开关">
    <span class="eb-ico">🍬</span>
    <span class="eb-txt"><b>启蒙</b></span>
    <span class="eb-switch" aria-hidden="true"><i></i></span>
  </button>`;

  if (unit.locked) {
    return `<section class="screen island-map-screen has-tab" data-screen="map">
      <div class="im-clouds" aria-hidden="true"><span class="im-cloud c1"></span><span class="im-cloud c2"></span><span class="im-cloud c3"></span></div>
      <div class="im-top">
        <button class="circle-btn" data-action="home" aria-label="返回营地">${I.back(18)}</button>
        ${unitTabs}
        ${enlightenBtn}
      </div>
      <div class="im-stage">
        <section class="card unit-locked-card" style="margin:0">
          <div class="ulc-emoji">🏝️</div>
          <h3>进阶浮空岛建造中</h3>
          <p>先在基础乐园收集星星，解锁更多神秘恐龙岛屿！</p>
        </section>
      </div>
      ${tabbar("map")}
    </section>`;
  }

  const dailyLeft = dailyChallengeLeft();

  const islands = mapIslandsData();
  const len = islands.length;
  const curIdx = ((islandIdx % len) + len) % len;
  const cur = islands[curIdx];

  /* 旅程进度跟随当前选中的主题岛：每个主题独立星星总数与进度，切换主题即切换 */
  const journeyThemeId = cur.themeId || (unitThemes.find(themeHasContent) || currentTheme()).id;
  const jProg = themeProgress(journeyThemeId);
  const starTotal = themeStars(jProg);
  const stageStep = window.STAGE_SIZE || 5;
  const starMax = Math.max(1, Math.floor(levelsPerTheme(journeyThemeId) / stageStep)) * 3;
  const journeyKey = activeProgressKey(journeyThemeId);

  const coverInner = `<img class="im-cover-full" src="${cur.cover}" alt="${cur.name}">${!cur.playable ? `<span class="im-cover-ribbon">${cur.mist}</span>` : ""}`;
  const slideCls = islandDir === "next" ? " slide-next" : islandDir === "prev" ? " slide-prev" : "";

  return `<section class="screen island-map-screen has-tab" data-screen="map">
    <div class="im-clouds" aria-hidden="true">
      <span class="im-cloud c1"></span><span class="im-cloud c2"></span><span class="im-cloud c3"></span>
    </div>

    <header class="im-top">
      <button class="circle-btn" data-action="home" aria-label="返回恐龙营地">${I.back(18)}</button>
      ${unitTabs}
      ${enlightenBtn}
    </header>

    <button type="button" class="im-balloon${dailyLeft ? "" : " is-empty"}" data-action="daily-start" aria-label="${dailyLeft ? "进入每日随机挑战，共 10 题" : "今日每日挑战已完成"}"${dailyLeft ? "" : " disabled"}>
      ${MAP_BALLOON_SVG}
      <span class="im-balloon-tag">${dailyLeft ? `每日飞艇 ${dailyLeft}/${DAILY_CHALLENGE_LIMIT}` : "今日已完成"}</span>
    </button>

    <div class="im-stage">
      <button type="button" class="im-nav-btn prev" data-action="island-prev" aria-label="切换到上一个主题岛">${MAP_LEFT_ARROW_SVG}</button>

      <div class="im-main-island theme-${cur.id}${slideCls}">
        <div class="im-main-sign">${cur.sign}</div>
        <div class="im-main-body">
          <button type="button" class="im-main-cover" data-action="${cur.action}" data-scene="${cur.scene}" data-name="${cur.name}" aria-label="进入 ${cur.name}">
            ${coverInner}
          </button>
          <div class="im-main-base" aria-hidden="true"></div>
          <button type="button" class="im-enter-btn${cur.playable ? "" : " is-soon"}" data-action="${cur.action}" data-scene="${cur.scene}" data-name="${cur.name}">
            <span>${cur.btnText}</span>
          </button>
        </div>
        <div class="im-dots" role="tablist" aria-label="切换浮空岛主题">
          ${islands.map((it, i) => `<button type="button" class="im-dot${i === curIdx ? " on" : ""}" data-action="island-jump" data-idx="${i}" aria-label="切换到 ${it.name}"></button>`).join("")}
        </div>
      </div>

      <button type="button" class="im-nav-btn next" data-action="island-next" aria-label="切换到下一个主题岛">${MAP_RIGHT_ARROW_SVG}</button>
    </div>

    <div class="im-bottom">
      <div class="journey">
        <span class="j-lb">旅程宝箱</span>
        <span class="j-val num">${starTotal}<em>/${starMax}★</em></span>
        <span class="j-track">
          <span class="track"><i style="width:${Math.round((starTotal / starMax) * 100)}%"></i></span>
          ${window.ChestManager ? ChestManager.renderJourneyChests(journeyKey, starTotal, starMax, journeyThemeId) : ""}
        </span>
        ${window.ChestManager && ChestManager.available() > 0
          ? `<button type="button" class="j-chest bonus" data-action="chest-open" aria-label="开启额外宝箱，剩 ${ChestManager.available()} 个">🎁<b>${ChestManager.available()}</b></button>`
          : ""}
      </div>
    </div>

    ${tabbar("map")}
  </section>`;
}


/* 动物乐园：点场景入口 → 锁定 animal 主题并记录场景后弹出路线抽屉 */
function openAnimalScene(sceneId) {
  const theme = THEME_BY_ID.get("animal") || currentTheme();
  const scenes = theme.scenes || [];
  if (!scenes.length) return;
  const scene = scenes.find((s) => s.id === sceneId) || scenes[0];

  state.theme = "animal";
  state.scene = scene.id;
  save();
  openOverlay(renderZooRouteSheet(scene, sceneProgress("animal", scene.id)));
  /* 抽屉插入 DOM 后把当前关滚到视口中央 */
  if (window.ZooRouteView) setTimeout(() => ZooRouteView.focusCurrent(), 60);
}
