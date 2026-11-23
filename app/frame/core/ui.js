/* ============================================================
   通用界面：底部导航、状态胶囊、场景、弹层与提示
   ============================================================ */

/* ------------------------------------------------ common UI */
const TABS = [["home", "乐园", I.home], ["map", "闯关", I.flag], ["words", "词汇", I.book], ["collect", "收藏", I.bag]];
function tabbar(active) {
  return `<nav class="tabbar">${TABS.map(([id, label, ic]) =>
    `<button class="tab ${active === id ? "on" : ""}" data-action="tab" data-screen="${id}" aria-label="${label}">
      <span class="ic">${ic(22)}</span><span>${label}</span>
    </button>`).join("")}</nav>`;
}
function starPill() {
  return `<div class="star-pill">${star(22)}<span class="num">${fmt(starBalance())}</span></div>`;
}
function stageChip() {
  const st = stageMeta(state.stage);
  return `${I.leaf(11)} ${st.phase} · ${st.name}`;
}

/* 天空元素（太阳 / 月亮 / 星星 / 云）按真实时间自动切换，背景位图本身不含这些元素 */
function skyPhase() {
  const h = new Date().getHours();
  if (h >= 19 || h < 6) return "night";
  if (h < 9) return "dawn";
  if (h < 16) return "day";
  return "dusk";
}
function skyFx() {
  const phase = skyPhase();
  if (phase === "night") {
    const stars = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<i class="sf-star s${i}"></i>`).join("");
    return `<div class="sky-fx night" aria-hidden="true"><span class="sf-moon"></span>${stars}<span class="sf-cloud c2"></span></div>`;
  }
  return `<div class="sky-fx ${phase}" aria-hidden="true">
    <span class="sf-sun"></span>
    <span class="sf-cloud c1"></span><span class="sf-cloud c2"></span><span class="sf-cloud c3"></span>
  </div>`;
}
/* 场景背景由已购买的背景决定，光线氛围交给 skyFx() */
function heroSkyClass() {
  return `${bgClass(state.bg)} sky-${skyPhase()}`;
}


function openOverlay(html) { $("#overlay-root").innerHTML = html; }
function closeOverlay() { $("#overlay-root").innerHTML = ""; }

function openSettings() {
  const standalone = isStandaloneMode();
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <h2>设置</h2>
      <div class="sheet-sub">${standalone ? "当前已从主屏幕运行，体验和 App 一样。" : "调整声音、安装到主屏幕，或重置演示进度。"}</div>
      <div style="margin-top:0.625rem">
        <div class="setting-row">
          <div class="s-ic">${I.volume(18)}</div>
          <div class="s-txt"><b>音效与发音</b><span>答对 / 答错 / 翻页的提示音</span></div>
          <button class="switch ${state.sound ? "on" : ""}" data-action="toggle-sound" aria-label="音效开关"></button>
        </div>
        <div class="setting-row">
          <div class="s-ic">${I.volume(18)}</div>
          <div class="s-txt"><b>英文读音</b><span>${state.voice === "standard" ? "标准朗读 · 教材发音" : "童趣朗读 · 更慢更亮，像卡通姐姐"}</span></div>
          <button class="switch ${state.voice !== "standard" ? "on" : ""}" data-action="toggle-voice" aria-label="读音风格切换"></button>
        </div>
        <div class="setting-row" data-action="install-guide" role="button">
          <div class="s-ic">${I.share(18)}</div>
          <div class="s-txt"><b>安装到主屏幕</b><span>全屏运行，像原生 App 一样</span></div>
          <span style="color:#B3A78E">${I.chevron(12)}</span>
        </div>
        <div class="setting-row" data-action="reset-confirm" role="button">
          <div class="s-ic">${I.refresh(18)}</div>
          <div class="s-txt"><b>清空学习数据</b><span>星星、成长值与闯关进度全部归零</span></div>
          <span style="color:#B3A78E">${I.chevron(12)}</span>
        </div>
        <div class="setting-row">
          <div class="s-ic">${I.info(18)}</div>
          <div class="s-txt"><b>DinoGo · 恐龙英语</b><span>交互概念版 v1.0 · 离线可用</span></div>
        </div>
      </div>
      <div class="sheet-actions"><button class="btn ghost" data-action="close-overlay">完成</button></div>
    </div>
  </div>`);
}
function openInstallGuide() {
  const ios = isIOSDevice();
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <h2>把 DinoGo 装到主屏幕</h2>
      <div class="sheet-sub">添加后会以全屏方式运行；通过 HTTPS 访问时还支持离线打开。</div>
      ${ios ? `
        <div class="install-step"><span class="n">1</span><p>用 <b>Safari</b> 打开本页（需要是本机或局域网地址，不能是本地文件）。</p></div>
        <div class="install-step"><span class="n">2</span><p>点击底部工具栏的 <b>分享</b> 按钮。</p></div>
        <div class="install-step"><span class="n">3</span><p>向上滑动，选择 <b>添加到主屏幕</b>，再点右上角「添加」。</p></div>
        <div class="install-step"><span class="n">4</span><p>回到主屏幕，点击 DinoGo 图标即可全屏进入。</p></div>
      ` : `
        <div class="install-step"><span class="n">1</span><p>在 Chrome / Edge 中通过 <b>http 或 https</b> 打开本页。</p></div>
        <div class="install-step"><span class="n">2</span><p>点击地址栏右侧的 <b>安装</b> 图标，或菜单里的「安装应用」。</p></div>
        <div class="install-step"><span class="n">3</span><p>安装后可从桌面独立打开，并离线使用。</p></div>
      `}
      <div class="install-note">提示：直接双击本地 HTML 文件时，Safari 不会显示「添加到主屏幕」。请用项目里的 <b>start-ios.ps1</b> 启动本地服务，再用 iPad 访问电脑的局域网地址。局域网 HTTP 下不会启用离线缓存；需要离线请用单文件版，或部署到 HTTPS。</div>
      <div class="sheet-actions"><button class="btn" data-action="close-overlay">知道了</button></div>
    </div>
  </div>`);
}
function openResetConfirm() {
  openOverlay(`<div class="overlay dialog-wrap">
    <div class="dialog">
      <div class="d-ico">${I.refresh(24, "#B4811C")}</div>
      <h3>重置演示进度？</h3>
      <p>成长值、星星、背景和图鉴都会回到初始状态。此操作无法撤销。</p>
      <div class="d-actions">
        <button class="btn ghost" data-action="close-overlay">取消</button>
        <button class="btn" data-action="confirm-reset" style="background:linear-gradient(180deg,#F0796A,#D95848);box-shadow:0 0.3125rem 0 #B84435">确认重置</button>
      </div>
    </div>
  </div>`);
}

/* ------------------------------------------------ toast */
function toast(msg) {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  root.appendChild(el);
  while (root.children.length > 3) root.removeChild(root.firstChild);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 2100);
}
