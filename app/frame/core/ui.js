/* ============================================================
   通用界面：底部导航、状态胶囊、场景、弹层与提示
   ============================================================ */

/* ------------------------------------------------ common UI */
const TABS = [["home", "乐园", I.home], ["map", "闯关", I.flag], ["words", "词汇", I.book], ["shop", "小铺", I.bag]];
function tabbar(active) {
  return `<nav class="tabbar">${TABS.map(([id, label, ic]) =>
    `<button class="tab ${active === id ? "on" : ""}" data-action="tab" data-screen="${id}" aria-label="${label}">
      <span class="ic">${ic(22)}</span><span>${label}</span>
    </button>`).join("")}</nav>`;
}
function starPill() {
  return `<div class="star-pill">${star(17)}<span class="num">${fmt(state.stars)}</span></div>`;
}
function stageChip() {
  const st = stageMeta(state.stage);
  return `${I.leaf(11)} ${st.phase} · ${st.name}`;
}

/* 按真实时间切换天空：19:00–05:59 为夜晚，其余为白天 */
function isNightNow() {
  const h = new Date().getHours();
  return h >= 19 || h < 6;
}
/* 天空场景只随昼夜变化，首次渲染后缓存，避免重复拼接星星与叶片 SVG */
const SCENE_HTML = { day: "", night: "" };
function sceneHTML() {
  if (isNightNow()) {
    if (SCENE_HTML.night) return SCENE_HTML.night;
    const dots = Array.from({ length: 18 }, (_, i) => {
      const x = (i * 37 + 11) % 100, y = (i * 23 + 7) % 70, s = (i % 3) + 1.2;
      return `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;opacity:${0.3 + (i % 4) * 0.16}"></i>`;
    }).join("");
    return (SCENE_HTML.night = `<div class="scene"><div class="moon"></div><div class="stars">${dots}</div>
      <div class="hill a"></div><div class="hill b"></div>
      <svg class="leaves l" viewBox="0 0 100 120"><path d="M4 118C8 78 30 42 74 22 64 58 48 84 26 102 46 86 62 70 72 50 44 70 24 94 4 118z" fill="#2E6B4E"/></svg>
      <svg class="leaves r" viewBox="0 0 100 120"><path d="M96 118C92 78 70 42 26 22c10 36 26 62 48 80-20-16-36-32-46-52 28 20 48 44 68 68z" fill="#347454"/></svg>
    </div>`);
  }
  if (SCENE_HTML.day) return SCENE_HTML.day;
  return (SCENE_HTML.day = `<div class="scene">
    <div class="sun"></div><div class="cloud a"></div><div class="cloud b"></div>
    <div class="hill a"></div><div class="hill b"></div>
    <svg class="leaves l" viewBox="0 0 100 120"><path d="M4 118C8 78 30 42 74 22 64 58 48 84 26 102 46 86 62 70 72 50 44 70 24 94 4 118z" fill="#62A968"/><path d="M0 120C18 92 44 70 80 56 60 82 34 104 0 120z" fill="#4E9459"/></svg>
    <svg class="leaves r" viewBox="0 0 100 120"><path d="M96 118C92 78 70 42 26 22c10 36 26 62 48 80-20-16-36-32-46-52 28 20 48 44 68 68z" fill="#6DB270"/></svg>
  </div>`);
}
/* 天空外观由真实时间决定：夜晚统一夜空，白天沿用已购买的背景色调 */
function heroSkyClass() {
  if (isNightNow()) return "sky-night";
  return `sky-day bg-${state.bg === "night" ? "jungle" : state.bg}`;
}


function openOverlay(html) { $("#overlay-root").innerHTML = html; }
function closeOverlay() { $("#overlay-root").innerHTML = ""; }

function openSettings() {
  const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  openOverlay(`<div class="overlay">
    <div class="sheet">
      <div class="grab"></div>
      <h2>设置</h2>
      <div class="sheet-sub">${standalone ? "当前已从主屏幕运行，体验和 App 一样。" : "调整声音、安装到主屏幕，或重置演示进度。"}</div>
      <div style="margin-top:10px">
        <div class="setting-row">
          <div class="s-ic">${I.volume(18)}</div>
          <div class="s-txt"><b>音效与发音</b><span>答对 / 答错 / 翻页的提示音</span></div>
          <button class="switch ${state.sound ? "on" : ""}" data-action="toggle-sound" aria-label="音效开关"></button>
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
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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
      <p>成长值、星星、装扮和图鉴都会回到初始状态。此操作无法撤销。</p>
      <div class="d-actions">
        <button class="btn ghost" data-action="close-overlay">取消</button>
        <button class="btn" data-action="confirm-reset" style="background:linear-gradient(180deg,#F0796A,#D95848);box-shadow:0 5px 0 #B84435">确认重置</button>
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
