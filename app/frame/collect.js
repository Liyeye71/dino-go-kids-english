/* ============================================================
   DinoGo · 恐龙英语 — 收藏（collect）
   底部 Tab 4：背景 / 图鉴，含背景购买与切换
   ============================================================ */

let collectTab = "bg";
let pendingBuy = null;

/* ------------------------------------------------ collect */
function screenCollect() {
  const dinoCls = state.stage === "ultra" ? "ultra" : "";
  const purchasableBgCount = BACKGROUNDS.filter((bg) => bg.price > 0 && state.stars >= bg.price && !state.bgOwned.includes(bg.id) && state.bg !== bg.id).length;
  const tabs = `<div class="collect-tabs">
    <button class="tab ${collectTab === "bg" ? "on" : ""}" data-action="collect-tab" data-tab="bg">背景${purchasableBgCount ? `<span class="tb">${purchasableBgCount}</span>` : ""}</button>
    <button class="tab ${collectTab === "dex" ? "on" : ""}" data-action="collect-tab" data-tab="dex">图鉴</button>
    <span class="all">全部 ${I.chevron(9)}</span>
  </div>`;
  let panel = "";
  if (collectTab === "bg") {
    panel = `<div class="bg-grid">${BACKGROUNDS.map((bg) => {
      const owned = state.bgOwned.includes(bg.id) || state.bg === bg.id;
      const using = state.bg === bg.id;
      const price = using ? `<span class="price owned">使用中</span>` : owned ? `<span class="price owned">已拥有</span>` : `<span class="price">${star(13)}${bg.price}</span>`;
      return `<button class="bg-item ${using ? "using" : ""}" data-action="${owned ? "equip-bg" : "buy-bg"}" data-id="${bg.id}">
        <div class="bg-thumb ${bg.cls}"></div>
        <div class="bg-info"><b>${bg.name}</b><span>${bg.sub}</span>${price}</div>
        ${using ? `<span class="check-ico">${I.check(12)}</span>` : `<span class="action" style="width:1.625rem;height:1.625rem;border-radius:0.5625rem;background:${owned ? "#2E8B57" : "#F4EFE3"};color:${owned ? "#fff" : "#B4811C"};display:grid;place-items:center">${owned ? I.arrow(12) : I.lock(12)}</span>`}
      </button>`;
    }).join("")}</div>`;
  } else {
    panel = `<div class="collect-dex">${dexBody()}</div>`;
  }
  const head = collectTab === "dex"
    ? `<div class="t"><h1>恐龙图鉴</h1><p>每一次进化，都会被记录在这里</p></div><div class="dex-count"><b class="num">${state.dex.length}</b><span>/ ${STAGES.length}</span></div>`
    : `<div class="t"><h1>我的收藏</h1><p>用星星给恐龙乐园换个背景</p></div>${starPill()}`;
  return `<section class="screen has-tab" data-screen="collect">
    <div class="scroll">
      <div class="collect-head">
        ${head}
      </div>
      ${collectTab === "dex" ? "" : `<div class="collect-preview ${bgClass(state.bg)}">
        ${skyFx()}
        <div class="wearing">${I.check(9, "#2E8B57")} 今日造型</div>
        <div class="dino ${dinoCls}">${dino(state.stage)}</div>
        <div class="pet">${I.crownMini(12, "#C98B25")} 小诺 · LV.${stageIndex(state.stage) + 1}</div>
      </div>`}
      ${tabs}
      ${panel}
    </div>
    ${tabbar("collect")}
  </section>`;
}


function openBuyBg(id) {
  const bg = bgMeta(id);
  if (!bg || bg.price === 0) return;
  if (state.stars < bg.price) { toast("星星不够啦，再去闯一关吧"); return; }
  pendingBuy = id;
  openOverlay(`<div class="overlay dialog-wrap">
    <div class="dialog">
      <div class="bg-thumb ${bg.cls}" style="width:100%;height:6rem;border-radius:1rem"></div>
      <h3>解锁「${bg.name}」？</h3>
      <p>将花费 ${bg.price} 星星，解锁后会立即应用到恐龙乐园和收藏页。</p>
      <div class="d-actions">
        <button class="btn ghost" data-action="close-overlay">再想想</button>
        <button class="btn" data-action="confirm-buy">花 ${bg.price} 星星解锁</button>
      </div>
    </div>
  </div>`);
}
function confirmBuy() {
  if (!pendingBuy) return;
  const bg = bgMeta(pendingBuy);
  if (state.bgOwned.includes(bg.id)) { state.bg = bg.id; pendingBuy = null; closeOverlay(); render(); return; }
  if (state.stars < bg.price) { toast("星星不够啦"); return; }
  state.stars -= bg.price;
  state.bgOwned.push(bg.id);
  state.bg = bg.id;
  sfx("coin");
  toast(`已解锁「${bg.name}」背景`);
  pendingBuy = null;
  closeOverlay();
  save();
  render();
}
function equipBg(id) {
  if (!state.bgOwned.includes(id)) return;
  state.bg = id;
  sfx("tap");
  save();
  render();
  toast(`场景已切换为「${bgMeta(id).name}」`);
}
