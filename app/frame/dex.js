/* ============================================================
   DinoGo · 恐龙英语 — 词汇（words）+ 恐龙图鉴（dex）
   底部 Tab 3：词汇本（按 A–Z 分组）
   恐龙图鉴并入「小铺 → 图鉴」，用 dexBody() 渲染
   ============================================================ */

let dexFilter = "all";
let wordsLetter = "all";
let wordsAlphaCache = null;

/* ------------------------------------------------ dex */
function dexRewardInfo() {
  if (state.dex.length >= 6) return { title: "图鉴全收集 · 星空营地", note: "所有形态都已收录，小诺为你骄傲", cur: 6, max: 6, reward: "全部完成" };
  if (state.dex.length >= 4) return { title: "收集奖励 · 星空营地", note: `再发现 ${6 - state.dex.length} 种形态，解锁「星空营地」背景`, cur: state.dex.length, max: 6, reward: "星空营地" };
  return { title: "收集奖励 · 落日山谷", note: `再发现 ${4 - state.dex.length} 种形态，解锁「落日山谷」背景`, cur: state.dex.length, max: 4, reward: "落日山谷" };
}

/* 图鉴正文：小铺 Tab 内嵌使用（不含 .scroll 与底部 Tab） */
function dexBody() {
  const filters = [["all", "全部"], ["baby", "幼年期"], ["teen", "成长期"], ["adult", "成熟期"], ["legend", "传说"]];
  const list = DEX.filter((d) => {
    if (dexFilter === "all") return true;
    if (dexFilter === "legend") return d.rarity >= 5;
    if (dexFilter === "baby") return d.key === "egg" || d.key === "baby";
    return d.key === dexFilter;
  });
  const reward = dexRewardInfo();
  const pct = Math.round((state.dex.length / DEX.length) * 100);
  return `<div class="dex-sum card">
      <div class="ds-main">
        <div class="ds-row"><b>图鉴收集度</b><span class="num">${pct}%</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="ds-foot">${spark(10, "#F0B53B")} 已收录 ${state.dex.length} / ${DEX.length} 种形态 · 继续成长解锁传说</div>
      </div>
      <div class="ds-badge">${I.book(26)}</div>
    </div>

    <div class="dex-filters">${filters.map(([id, label]) => `<button class="f ${dexFilter === id ? "on" : ""}" data-action="filter-dex" data-filter="${id}">${label}</button>`).join("")}</div>

    <div class="dex-grid">
      ${list.map((d) => {
        const found = state.dex.includes(d.key);
        const isNow = d.key === state.stage;
        const bgT = (DEX.findIndex((x) => x.key === d.key) % 5) + 1;
        return `<button class="dex-card ${found ? "" : "locked"} ${isNow ? "current" : ""}" data-action="dex-detail" data-key="${d.key}" aria-label="${found ? d.name : "未发现"}">
          ${found ? `<span class="rare r${d.rarity}">★</span>` : `<span class="lock-ic">${I.lock(13)}</span>`}
          ${isNow ? `<span class="now-tag">当前</span>` : ""}
          <div class="pic t${bgT}">${dino(d.key)}</div>
          <div class="nm">${found ? d.name : "未发现"}</div>
          <div class="stg">${found ? d.phase : "???"}</div>
        </button>`;
      }).join("")}
    </div>

    <div class="dex-reward">
      <div class="dr-ic"><div class="bg-thumb ${state.dex.length >= 4 ? "sunset" : "jungle"}" style="width:100%;height:100%;border-radius:0"><div class="s"></div><div class="h"></div></div></div>
      <div class="dr-main">
        <div class="dr-row"><b>${reward.title}</b><span>${reward.cur} / ${reward.max}</span></div>
        <div class="bar"><i style="width:${Math.round((reward.cur / reward.max) * 100)}%"></i></div>
        <div class="dr-note">${reward.note}</div>
      </div>
      <div class="dr-lock">${reward.cur >= reward.max ? I.check(14, "#B4811C") : I.lock(14, "#B4811C")}</div>
    </div>`;
}

/* ------------------------------------------------ words */
/* 所有主题词汇按首字母 A–Z 分组：词汇池在运行期不变，首次计算后缓存 */
function allWordsAlpha() {
  if (wordsAlphaCache) return wordsAlphaCache;
  const all = WORD_SETS.flatMap((set) =>
    set.words.map((w) => ({ ...w, themeId: set.id, themeName: set.name, themeEmoji: set.emoji || "🔤" })));
  all.sort((a, b) => a.word.localeCompare(b.word, "en"));
  const groups = [];
  all.forEach((w) => {
    const L = w.word[0].toUpperCase();
    let g = groups.find((x) => x.letter === L);
    if (!g) groups.push((g = { letter: L, words: [] }));
    g.words.push(w);
  });
  return (wordsAlphaCache = groups);
}

const THEME_SHORT = { fruit: "水果", cars: "汽车", zoo: "动物", food: "美食" };

function screenWords() {
  const groups = allWordsAlpha();
  const total = groups.reduce((n, g) => n + g.words.length, 0);
  const letters = groups.map((g) => g.letter);
  const shown = wordsLetter === "all" ? groups : groups.filter((g) => g.letter === wordsLetter);
  const index = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    .map((L) => `<button class="wl ${wordsLetter === L ? "on" : ""} ${letters.includes(L) ? "" : "off"}" data-action="filter-word" data-letter="${L}">${L}</button>`).join("");
  return `<section class="screen has-tab" data-screen="words">
    <div class="scroll">
      <div class="words-head">
        <div class="t"><h1>单词本</h1><p>四个主题的单词，按 A–Z 排好队</p></div>
        <div class="words-count"><b class="num">${total}</b><span>词</span></div>
      </div>

      <div class="wl-bar">
        <button class="wl all ${wordsLetter === "all" ? "on" : ""}" data-action="filter-word" data-letter="all">ALL</button>
        ${index}
      </div>

      ${shown.map((g) => `<div class="word-group">
        <div class="wg-letter">${g.letter}<span>${g.words.length}</span></div>
        <div class="wg-list">
          ${g.words.map((w) => `<button class="word-row" data-action="speak-word" data-word="${esc(w.word)}" aria-label="${w.word} ${w.zh}">
            <span class="wr-pic">${w.art()}</span>
            <span class="wr-main">
              <span class="wr-line"><b>${w.word}</b><i>${w.zh}</i></span>
              <span class="wr-line sub"><em>${w.phon || ""}</em>${posZh(w) ? `<span class="wr-tag pos">${posZh(w)}</span>` : ""}<span class="wr-tag t-${w.themeId}">${THEME_SHORT[w.themeId] || w.themeName}</span></span>
            </span>
          </button>`).join("")}
        </div>
      </div>`).join("")}

      <div class="words-foot">${I.leaf(12)} 点单词可以听发音，闯关后新词会自动出现在这里</div>
    </div>
    ${tabbar("words")}
  </section>`;
}
