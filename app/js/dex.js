/* ============================================================
   DinoGo · 恐龙英语 — 图鉴（dex）
   底部 Tab 3：恐龙图鉴 + 详情弹层
   ============================================================ */

let dexFilter = "all";

/* ------------------------------------------------ dex */
function dexRewardInfo() {
  if (state.dex.length >= 6) return { title: "图鉴全收集 · 星空营地", note: "所有形态都已收录，小诺为你骄傲", cur: 6, max: 6, reward: "全部完成" };
  if (state.dex.length >= 4) return { title: "收集奖励 · 星空营地", note: `再发现 ${6 - state.dex.length} 种形态，解锁「星空营地」背景`, cur: state.dex.length, max: 6, reward: "星空营地" };
  return { title: "收集奖励 · 落日山谷", note: `再发现 ${4 - state.dex.length} 种形态，解锁「落日山谷」背景`, cur: state.dex.length, max: 4, reward: "落日山谷" };
}

function screenDex() {
  const filters = [["all", "全部"], ["baby", "幼年期"], ["teen", "成长期"], ["adult", "成熟期"], ["legend", "传说"]];
  const list = DEX.filter((d) => {
    if (dexFilter === "all") return true;
    if (dexFilter === "legend") return d.rarity >= 5;
    if (dexFilter === "baby") return d.key === "egg" || d.key === "baby";
    return d.key === dexFilter;
  });
  const reward = dexRewardInfo();
  return `<section class="screen has-tab" data-screen="dex">
    <div class="scroll">
      <div class="dex-head">
        <div class="t"><h1>恐龙图鉴</h1><p>每一次进化，都会被记录在这里</p></div>
        <div class="dex-count"><b class="num">${state.dex.length}</b><span>/ ${DEX.length}</span></div>
      </div>

      <div class="card dex-sum">
        <div class="ds-main">
          <div class="ds-row"><b>图鉴收集度</b><span class="num">${Math.round((state.dex.length / DEX.length) * 100)}%</span></div>
          <div class="bar"><i style="width:${Math.round((state.dex.length / DEX.length) * 100)}%"></i></div>
          <div class="ds-foot">${spark(10, "#F0B53B")} 已收录 ${state.dex.length} 种形态 · 继续成长解锁传说</div>
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
      </div>
    </div>
    ${tabbar("dex")}
  </section>`;
}


function openDexDetail(key) {
  const d = DEX.find((x) => x.key === key);
  if (!d) return;
  if (!state.dex.includes(key)) { toast("这只恐龙还在沉睡，继续闯关吧"); return; }
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <div class="detail-hero"><div class="dino" style="width:170px;height:170px">${dino(key)}</div></div>
      <div class="detail-meta"><b>${d.name}</b><span class="ph">${d.phase} · ★${d.rarity}</span></div>
      <div class="detail-desc">${d.desc}</div>
      <div class="detail-stats">
        <div class="ds"><b>${d.height}</b><span>身高</span></div>
        <div class="ds"><b>${d.weight}</b><span>体重</span></div>
        <div class="ds"><b style="font-size:11px">${d.skill}</b><span>专属能力</span></div>
      </div>
      <div class="sheet-actions"><button class="btn" data-action="close-overlay">继续收集</button></div>
    </div>
  </div>`);
}
