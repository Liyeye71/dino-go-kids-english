/* ============================================================
   DinoGo · 恐龙英语 — 词汇（words）+ 恐龙图鉴（dex）
   底部 Tab 3：词汇本（按 A–Z 分组）
   恐龙图鉴并入「收藏 → 图鉴」，用 dexBody() 渲染
   ============================================================ */

let dexFilter = "all";
let wordsLetter = "all";

/* ------------------------------------------------ dex */
const DEX_FILTERS = [["all", "全部"], ["baby", "幼年期"], ["teen", "成长期"], ["adult", "成熟期"], ["super", "完全体"], ["ultra", "究极体"]];
const DEX_FILTER_PHASES = { baby: "幼年期", teen: "成长期", adult: "成熟期", super: "完全体", ultra: "究极体" };

function dexRewardInfo() {
  if (state.dex.length >= 6) return { title: "图鉴全收集 · 珊瑚海湾", note: "所有形态都已收录，小诺为你骄傲", cur: 6, max: 6, reward: "全部完成" };
  if (state.dex.length >= 4) return { title: "收集奖励 · 珊瑚海湾", note: `再发现 ${6 - state.dex.length} 种形态，解锁「珊瑚海湾」背景`, cur: state.dex.length, max: 6, reward: "珊瑚海湾" };
  return { title: "收集奖励 · 静谧湖畔", note: `再发现 ${4 - state.dex.length} 种形态，解锁「静谧湖畔」背景`, cur: state.dex.length, max: 4, reward: "静谧湖畔" };
}

/* 图鉴正文：收藏 Tab 内嵌使用（不含 .scroll 与底部 Tab） */
function dexBody() {
  /* 究极体筛选下，超级霸王龙统一在下方「究极体图鉴」里展示，避免重复 */
  const list = STAGES.filter((d) => (dexFilter === "all" || d.phase === DEX_FILTER_PHASES[dexFilter])
    && !(dexFilter === "ultra" && d.key === "ultra"));
  const reward = dexRewardInfo();
  const pct = Math.round((state.dex.length / STAGES.length) * 100);
  const ultraOpen = ultraExchangeOpen();
  const ultraOwned = ultraBaseOwned();
  return `<div class="dex-sum card">
      <div class="ds-main">
        <div class="ds-row"><b>图鉴收集度</b><span class="num">${pct}%</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="ds-foot">${spark(10, "#F0B53B")} 已收录 ${state.dex.length} / ${STAGES.length} 种形态 · 继续成长解锁传说</div>
      </div>
      <div class="ds-badge">${I.book(26)}</div>
    </div>

    <div class="dex-filters">${DEX_FILTERS.map(([id, label]) => `<button class="f ${dexFilter === id ? "on" : ""}" data-action="filter-dex" data-filter="${id}">${label}</button>`).join("")}</div>

    ${list.length ? `<div class="dex-grid">
      ${list.map((d) => {
        const isUltra = d.key === "ultra";
        const found = isUltra ? ultraOwned : state.dex.includes(d.key);
        const isNow = d.key === state.stage && (!isUltra || state.ultraSkin <= 4);
        const bgT = (stageIndex(d.key) % 5) + 1;
        const ultraHint = ultraOpen ? `${ULTRA_PRICE}★ 兑换` : `${ULTRA_MIN} 成长值开放`;
        const nm = found || isUltra ? d.name : "未发现";
        const stg = found ? d.phase : isUltra ? ultraHint : "???";
        const inner = `${found ? `<span class="rare r${d.rarity}">★</span>` : isUltra && ultraOpen ? "" : `<span class="lock-ic">${I.lock(13)}</span>`}
          ${!found && isUltra && ultraOpen ? `<span class="buy-tag">${star(10)}${ULTRA_PRICE}</span>` : ""}
          ${isNow ? `<span class="now-tag">当前</span>` : ""}
          <div class="pic t${bgT}">${dino(d.key)}</div>
          <div class="nm">${nm}</div>
          <div class="stg">${stg}</div>`;
        const cls = `dex-card ${found ? "" : "locked"} ${isNow ? "current" : ""}`;
        if (isUltra) {
          const action = found ? "pick-ultra" : "buy-ultra";
          return `<button class="${cls}" data-action="${action}" data-id="1" data-skin="${state.ultraSkin <= 4 ? state.ultraSkin : 1}" aria-label="${found ? d.name : `${d.name} 兑换`}">${inner}</button>`;
        }
        return `<div class="${cls}" aria-label="${found ? d.name : "未发现"}">${inner}</div>`;
      }).join("")}
    </div>` : ""}

    ${dexFilter === "ultra" ? ultraDexSection() : ""}

    <div class="dex-reward">
      <div class="dr-ic"><div class="bg-thumb ${state.dex.length >= 4 ? "sunset" : "jungle"}" style="width:100%;height:100%;border-radius:0"></div></div>
      <div class="dr-main">
        <div class="dr-row"><b>${reward.title}</b><span>${reward.cur} / ${reward.max}</span></div>
        <div class="bar"><i style="width:${Math.round((reward.cur / reward.max) * 100)}%"></i></div>
        <div class="dr-note">${reward.note}</div>
      </div>
      <div class="dr-lock">${reward.cur >= reward.max ? I.check(14, "#B4811C") : I.lock(14, "#B4811C")}</div>
    </div>`;
}

/* 究极体图鉴：超级霸王龙的 4 种形态 + 10 种机甲恐龙，合并成一个板块展示 */
function ultraDexSection() {
  const open = ultraExchangeOpen();
  const baseOwned = ultraBaseOwned();
  const total = ULTRA_SKINS.length + ULTRA_DINOS.length;
  const ownedCount = (baseOwned ? ULTRA_SKINS.length : 0)
    + ULTRA_DINOS.filter((d) => ultraSkinOwned(d.id)).length;
  const head = open
    ? `${ULTRA_PRICE}★/只 · 已兑换 ${ownedCount}/${total}`
    : `成长值达到 ${ULTRA_MIN} 后开放 · 还差 ${Math.max(0, ULTRA_MIN - state.growth)}`;
  const skinCards = ULTRA_SKINS.map((s) => {
    const owned = baseOwned;
    const on = state.ultraSkin === s.id;
    return `<button class="skin-card form-card ${owned ? "" : "locked"} ${on && owned ? "on" : ""}" data-action="${owned ? "pick-ultra" : "buy-ultra"}" data-id="1" data-skin="${s.id}">
      <div class="pic">${dino("ultra", { skin: s.id })}</div>
      <div class="nm">${s.name}</div>
      <div class="sub">${owned ? s.sub : open ? "兑换超级霸王龙后解锁" : "未解锁"}</div>
      ${owned && on ? `<span class="cur">使用中</span>` : ""}
      ${owned ? "" : `<span class="lock-ic">${I.lock(13)}</span>`}
    </button>`;
  }).join("");
  const dinoCards = ULTRA_DINOS.map((d) => {
    const owned = ultraSkinOwned(d.id);
    const on = state.ultraSkin === d.id;
    return `<button class="skin-card form-card ${owned ? "" : "locked"} ${on && owned ? "on" : ""}" data-action="${owned ? "pick-ultra" : "buy-ultra"}" data-id="${d.id}" data-skin="${d.id}">
      <div class="pic">${dino("ultra", { skin: d.id })}</div>
      <div class="nm">${d.name}</div>
      <div class="sub">${owned ? d.sub : open ? `${ULTRA_PRICE}★ 兑换` : "未解锁"}</div>
      ${owned && on ? `<span class="cur">使用中</span>` : ""}
      ${owned ? "" : open ? `<span class="buy-tag">${star(10)}${ULTRA_PRICE}</span>` : `<span class="lock-ic">${I.lock(13)}</span>`}
    </button>`;
  }).join("");
  return `<div class="skin-head"><b>究极体图鉴</b><span>${head}</span></div>
    <div class="skin-grid">${skinCards}${dinoCards}</div>`;
}

/* ------------------------------------------------ words */
/* 词汇本：只展示闯关答对后解锁的单词，未解锁的灰化占位 */
function allWordsAlpha() {
  const byWord = new Map();
  allThemeWords().forEach((w) => {
    const unlocked = isWordUnlocked(w.word, w.themeId, w.sceneId);
    const exist = byWord.get(w.word);
    /* 同一拼写只保留一条，优先展示已解锁的那条 */
    if (!exist || (!exist.unlocked && unlocked)) {
      byWord.set(w.word, { wordObj: w, unlocked });
    }
  });
  const groupMap = new Map();
  let total = 0;
  let learned = 0;
  [...byWord.values()]
    .sort((a, b) => a.wordObj.word.localeCompare(b.wordObj.word, "en"))
    .forEach(({ wordObj: w, unlocked }) => {
      total += 1;
      if (unlocked) learned += 1;
      const L = w.word[0].toUpperCase();
      let g = groupMap.get(L);
      if (!g) groupMap.set(L, (g = { letter: L, words: [] }));
      g.words.push({ w, unlocked });
    });
  return { groups: [...groupMap.values()], letterSet: new Set(groupMap.keys()), total, learned };
}

function screenWords() {
  const { groups, letterSet, total, learned } = allWordsAlpha();
  const shown = wordsLetter === "all" ? groups : groups.filter((g) => g.letter === wordsLetter);
  const index = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    .map((L) => `<button class="wl ${wordsLetter === L ? "on" : ""} ${letterSet.has(L) ? "" : "off"}" data-action="filter-word" data-letter="${L}">${L}</button>`).join("");
  return `<section class="screen has-tab" data-screen="words">
    <div class="scroll">
      <div class="words-head">
        <div class="t"><h1>单词本</h1><p>闯关答对就能解锁新单词</p></div>
        <div class="words-count"><b class="num">${learned}</b><span>/ ${total} 词</span></div>
      </div>

      <div class="wl-bar">
        <button class="wl all ${wordsLetter === "all" ? "on" : ""}" data-action="filter-word" data-letter="all">ALL</button>
        ${index}
      </div>

      ${shown.map((g) => `<div class="word-group">
        <div class="wg-letter">${g.letter}<span>${g.words.length}</span></div>
        <div class="wg-list">
          ${g.words.map(({ w, unlocked }) => {
            if (!unlocked) {
              return `<div class="word-row locked" aria-label="未解锁单词">
                <span class="wr-pic">${I.lock(16, "#B9AE99")}</span>
                <span class="wr-main">
                  <span class="wr-line"><b>???</b><i>待解锁</i></span>
                  <span class="wr-line sub"><em>闯关答对后解锁</em>${categoryZh(w) ? `<span class="wr-tag pos">${categoryZh(w)}</span>` : ""}</span>
                </span>
              </div>`;
            }
            return `<button class="word-row" data-action="speak-word" data-word="${esc(w.word)}" aria-label="${w.word} ${w.zh}">
              <span class="wr-pic">${w.art()}</span>
              <span class="wr-main">
                <span class="wr-line"><b>${w.word}</b><i>${w.zh}</i></span>
                <span class="wr-line sub"><em>${w.phon || ""}</em>${categoryZh(w) ? `<span class="wr-tag pos">${categoryZh(w)}</span>` : ""}</span>
              </span>
            </button>`;
          }).join("")}
        </div>
      </div>`).join("")}

      <div class="words-foot">${I.leaf(12)} 点单词可以听发音，闯关答对后新词会自动解锁</div>
    </div>
    ${tabbar("words")}
  </section>`;
}
