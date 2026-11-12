/* ============================================================
   DinoGo · 恐龙英语 — 小铺（shop）
   底部 Tab 4：装扮 / 背景 / 图鉴，含购买与装备
   ============================================================ */

let shopTab = "decor";
let pendingBuy = null;

/* ------------------------------------------------ shop */
function itemState(item) {
  const locked = item.unlockStage && stageIndex(state.stage) < stageIndex(item.unlockStage);
  const owned = state.owned.includes(item.id);
  const using = state.equipped[item.slot] === item.id;
  return { locked, owned, using };
}

function screenShop() {
  const eq = state.equipped;
  const wearing = ITEMS.filter((it) => eq[it.slot] === it.id).map((it) => it.name);
  const dinoCls = state.stage === "ultra" ? "ultra" : "";
  const tabs = `<div class="shop-tabs">
    <button class="tab ${shopTab === "decor" ? "on" : ""}" data-action="shop-tab" data-tab="decor">装扮</button>
    <button class="tab ${shopTab === "bg" ? "on" : ""}" data-action="shop-tab" data-tab="bg">背景<span class="tb">${BACKGROUNDS.length - 1}</span></button>
    <button class="tab ${shopTab === "dex" ? "on" : ""}" data-action="shop-tab" data-tab="dex">图鉴</button>
    <span class="all">全部 ${I.chevron(9)}</span>
  </div>`;
  let panel = "";
  if (shopTab === "decor") {
    panel = `<div class="shop-grid">${ITEMS.map((it) => {
      const s = itemState(it);
      const cls = `shop-item ${s.owned ? "owned" : ""} ${s.using ? "using" : ""} ${s.locked ? "locked" : ""}`;
      const price = s.locked ? `<span class="price locked">${I.lock(9)} 进化解锁</span>`
        : s.owned ? `<span class="price owned">已拥有</span>` : `<span class="price">${star(13)}${it.price}</span>`;
      const action = s.locked ? "locked-item" : s.owned ? "equip-item" : "buy-item";
      return `<button class="${cls}" data-action="${action}" data-id="${it.id}">
        <div class="thumb ${it.thumb}">${it.badge ? `<span class="badge">${it.badge}</span>` : ""}${it.art()}</div>
        <div class="name">${it.name}${s.using ? `<span class="tag">穿着中</span>` : ""}</div>
        <div class="sub">${it.sub}</div>
        <div class="foot">${price}<span class="action">${s.using ? I.check(12) : s.owned ? I.arrow(12) : s.locked ? I.lock(12) : I.arrow(12)}</span></div>
      </button>`;
    }).join("")}</div>`;
  } else if (shopTab === "bg") {
    panel = `<div class="bg-grid">${BACKGROUNDS.map((bg) => {
      const owned = state.bgOwned.includes(bg.id) || state.bg === bg.id;
      const using = state.bg === bg.id;
      const price = using ? `<span class="price owned">使用中</span>` : owned ? `<span class="price owned">已拥有</span>` : `<span class="price">${star(13)}${bg.price}</span>`;
      return `<button class="bg-item ${using ? "using" : ""}" data-action="${owned ? "equip-bg" : "buy-bg"}" data-id="${bg.id}">
        <div class="bg-thumb ${bg.cls}"><div class="s"></div><div class="h"></div><div class="d">${dino(state.stage, { equipped: state.equipped })}</div></div>
        <div class="bg-info"><b>${bg.name}</b><span>${bg.sub}</span>${price}</div>
        ${using ? `<span class="check-ico">${I.check(12)}</span>` : `<span class="action" style="width:26px;height:26px;border-radius:9px;background:${owned ? "#2E8B57" : "#F4EFE3"};color:${owned ? "#fff" : "#B4811C"};display:grid;place-items:center">${owned ? I.arrow(12) : I.lock(12)}</span>`}
      </button>`;
    }).join("")}</div>`;
  } else {
    panel = `<div class="shop-dex">${dexBody()}</div>`;
  }
  const head = shopTab === "dex"
    ? `<div class="t"><h1>恐龙图鉴</h1><p>每一次进化，都会被记录在这里</p></div><div class="dex-count"><b class="num">${state.dex.length}</b><span>/ ${DEX.length}</span></div>`
    : `<div class="t"><h1>装饰小铺</h1><p>用星星把小诺打扮得更酷一点</p></div>${starPill()}`;
  return `<section class="screen has-tab" data-screen="shop">
    <div class="scroll">
      <div class="shop-head">
        ${head}
      </div>
      ${shopTab === "dex" ? "" : `<div class="shop-preview ${bgClass(state.bg)}">
        <div class="arch"></div><div class="podium"></div>
        <span class="spark" style="left:6%;top:20%">${spark(16, "#F0B53B")}</span>
        <span class="spark" style="right:8%;top:30%">${spark(10, "#F0B53B")}</span>
        <div class="wearing">${I.check(9, "#2E8B57")} ${wearing.length ? `试穿中 · ${wearing.length} 件装扮` : "今日造型"}</div>
        <div class="dino ${dinoCls}">${dino(state.stage, { equipped: state.equipped })}</div>
        <div class="pet">${I.crownMini(12, "#C98B25")} 小诺 · LV.${stageIndex(state.stage) + 1}</div>
      </div>`}
      ${tabs}
      ${panel}
    </div>
    ${tabbar("shop")}
  </section>`;
}


function openBuyItem(id) {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return;
  if (item.unlockStage && stageIndex(state.stage) < stageIndex(item.unlockStage)) return toast(`进化到${stageMeta(item.unlockStage).name}即可解锁`);
  if (state.owned.includes(id)) return;
  if (state.stars < item.price) { toast("星星不够啦，再去闯一关吧"); return; }
  pendingBuy = { type: "item", id };
  openOverlay(`<div class="overlay dialog-wrap">
    <div class="dialog">
      <div class="d-ico">${item.art()}</div>
      <h3>解锁「${item.name}」？</h3>
      <p>将花费 ${item.price} 星星，解锁后可随时给小诺换上或取下。</p>
      <div class="d-actions">
        <button class="btn ghost" data-action="close-overlay">再想想</button>
        <button class="btn" data-action="confirm-buy">花 ${item.price} 星星解锁</button>
      </div>
    </div>
  </div>`);
}
function openBuyBg(id) {
  const bg = bgMeta(id);
  if (!bg || bg.price === 0) return;
  if (state.stars < bg.price) { toast("星星不够啦，再去闯一关吧"); return; }
  pendingBuy = { type: "bg", id };
  openOverlay(`<div class="overlay dialog-wrap">
    <div class="dialog">
      <div class="bg-thumb ${bg.cls}" style="width:100%;height:96px;border-radius:16px"><div class="s"></div><div class="h"></div></div>
      <h3>解锁「${bg.name}」？</h3>
      <p>将花费 ${bg.price} 星星，解锁后会立即应用到恐龙乐园和装饰小铺。</p>
      <div class="d-actions">
        <button class="btn ghost" data-action="close-overlay">再想想</button>
        <button class="btn" data-action="confirm-buy">花 ${bg.price} 星星解锁</button>
      </div>
    </div>
  </div>`);
}
function confirmBuy() {
  if (!pendingBuy) return;
  if (pendingBuy.type === "item") {
    const item = ITEMS.find((i) => i.id === pendingBuy.id);
    if (!item || state.owned.includes(item.id)) { pendingBuy = null; closeOverlay(); return; }
    if (state.stars < item.price) { toast("星星不够啦"); return; }
    state.stars -= item.price;
    state.owned.push(item.id);
    state.equipped[item.slot] = item.id;
    sfx("coin");
    toast(`已解锁「${item.name}」并换上`);
  } else {
    const bg = bgMeta(pendingBuy.id);
    if (state.bgOwned.includes(bg.id)) { state.bg = bg.id; pendingBuy = null; closeOverlay(); render(); return; }
    if (state.stars < bg.price) { toast("星星不够啦"); return; }
    state.stars -= bg.price;
    state.bgOwned.push(bg.id);
    state.bg = bg.id;
    sfx("coin");
    toast(`已解锁「${bg.name}」背景`);
  }
  pendingBuy = null;
  closeOverlay();
  save();
  render();
}
function toggleItem(id) {
  const item = ITEMS.find((i) => i.id === id);
  if (!item || !state.owned.includes(id)) return;
  if (state.equipped[item.slot] === id) {
    state.equipped[item.slot] = null;
    toast(`已取下「${item.name}」`);
  } else {
    state.equipped[item.slot] = id;
    toast(`已换上「${item.name}」`);
  }
  sfx("tap");
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
