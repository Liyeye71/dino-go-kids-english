# DinoGo · 恐龙英语 — UI 概念稿 + 可运行 App

围绕「**英语闯关 → 获得成长值 / 星星 → 恐龙进化 → 解锁装扮与背景 → 图鉴收集**」设计的儿童英语学习 App。

项目包含两部分：

1. **UI 概念稿**（`ui/` + `out/`）：8 屏静态设计图，用于评审视觉与信息结构。
2. **可运行 App**（`app/` → `DinoGo.html` / `dist/`）：在 iPhone / iPad 上真机可玩的交互版本，含完整学习闭环、音效与存档。

> 真机安装方式见 [`README-iOS.md`](README-iOS.md)。

## 快速开始（iPad / iPhone）

| 方式 | 操作 | 适用 |
| --- | --- | --- |
| 单文件 | 把 [`DinoGo.html`](DinoGo.html) AirDrop 到 iPad，用 Safari 打开 | 离线、零配置 |
| 局域网 | 运行 [`start-ios.ps1`](start-ios.ps1)，iPad 打开打印出的局域网地址，分享 → 添加到主屏幕 | 全屏 + 主屏图标 |
| HTTPS | 把 `dist/` 部署到静态站点 | 正式分发、离线缓存 |

## 交付文件

### 总览
- [`out/overview.png`](out/overview.png) — 8 屏设计总览（2796 × 3780）

### 单屏（780 × 1688，2x）
| 文件 | 页面 | 说明 |
| --- | --- | --- |
| [`out/01-home.png`](out/01-home.png) | 恐龙乐园 | 恐龙状态、成长值进度、每日任务、单词复习 |
| [`out/02-map.png`](out/02-map.png) | 闯关地图 | 单元进度、路径式关卡、星星记录 |
| [`out/03-quiz.png`](out/03-quiz.png) | 单词闯关 | 大图四选一、连对加成、生命值 |
| [`out/04-result.png`](out/04-result.png) | 闯关结算 | 成长值 / 星星 / 正确率结算，指向进化 |
| [`out/05-evolution.png`](out/05-evolution.png) | 进化时刻 | 形态升级、解锁装扮与被动技能 |
| [`out/06-shop.png`](out/06-shop.png) | 装饰小铺 | 星星消费、试穿预览、装扮 / 背景 / 图鉴 |
| [`out/07-dex.png`](out/07-dex.png) | 恐龙图鉴 | 已发现 / 未发现、稀有度、收集奖励 |
| [`out/08-profile.png`](out/08-profile.png) | 成长档案 | 学习时长、收集数据、成就徽章 |

### 源文件
- [`ui/index.html`](ui/index.html) — 打开即预览 8 屏总览
- [`ui/app.js`](ui/app.js) — 页面模板、恐龙 SVG 插画、数据文案
- [`ui/styles.css`](ui/styles.css) — 设计系统与 390 × 844 页面样式
- [`render.ps1`](render.ps1) — 用本机 Chrome 重新导出全部 PNG

打开单屏：`ui/index.html?screen=home`（可选 `home / map / quiz / result / evolution / shop / dex / profile`）。

重新渲染：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\render.ps1
```

## 可运行 App

- [`app/index.html`](app/index.html) / [`app/js/`](app/js) / [`app/css/`](app/css) / [`app/words/`](app/words) — 响应式源码（iPhone 单列 + iPad 双区布局），JS 按底部四个 Tab 拆分：`core.js`（公共数据/图标/状态/路由/事件）+ `home.js` / `map.js` / `dex.js` / `shop.js`；CSS 按模块拆分：`base` / `home` / `map` / `dex` / `shop` / `overlays` / `responsive`；主题词汇一个主题一个文件放在 `words/`（fruits / cars / zoo / food）
- [`build.mjs`](build.mjs) — 生成单文件 `DinoGo.html` 与 PWA 目录 `dist/`
- [`package.mjs`](package.mjs) — 打包为 `DinoGo-iOS.zip`
- [`serve.mjs`](serve.mjs) / [`start-ios.ps1`](start-ios.ps1) — 零依赖静态服务
- [`preview/`](preview) — iPhone 390×844 与 iPad 834×1194 的实机截图

```powershell
node build.mjs      # 重新生成 DinoGo.html 与 dist/
node serve.mjs dist 8080
```

单文件版支持 `?fresh=1` 清空存档，便于演示。

## 核心循环

```
闯关答题 ──► 成长值 +120 / 星星 +15
   ▲                 │
   │                 ▼
每日任务 ◄── 恐龙进化（蛋 → 幼龙 → 少年龙 → 成年龙 → 霸王龙）
                     │
                     ▼
            星星解锁装饰 / 背景；图鉴自动收录
```

## 养成数值（概念稿）

| 形态 | 成长值门槛 | 视觉特征 |
| --- | --- | --- |
| 恐龙蛋 | 0 | 巢穴、斑点、裂纹 |
| 幼龙 | 60 | 体型小，带蛋壳 |
| 少年龙 | 250 | 圆润、背刺、大眼 |
| 成年龙 | 600 | 体型更大、鼻角、深绿 |
| 霸王龙 | 1,200 | 金色背刺、胸口纹章 |
| 超级霸王龙 | 2,000 | 王冠 / 光效（图鉴传说位） |

当前主流程的状态是连贯的：首页 480 / 600 → 闯关 +120 → 结算 600 / 600 → 进化成年龙 → 商店与档案显示 LV.4、星星 1,295（1,280 + 15）。

## 设计语言

- **底色**：奶油纸感 `#FBF3E3`，降低儿童长时间学习的视觉刺激
- **主色**：丛林绿 `#2E8B57`，成长值 / 主按钮
- **强调**：星星黄 `#FFC94A`、珊瑚橙 `#FF8A4C`，用于奖励与行动点
- **字体**：Segoe UI + 微软雅黑，重字重、紧凑字距
- **图形**：全部为内联 SVG 手绘插画（恐龙、蛋、苹果、装扮），无外部图片依赖
- **卡片**：24–30px 大圆角、1.5px 暖色描边、低饱和投影，按钮用 3D 底边制造「可按」感

## 设计取舍

1. **首页先给情绪，再给任务**：恐龙占据首屏最大面积，成长条直接贴在它脚下，让「学习 = 喂养」一眼可见。
2. **进化是高光时刻**：唯一一屏深色场景，用光环、星点和大标题制造仪式感，随后立刻给出装扮 / 技能奖励。
3. **星星有两个出口**：买装扮、解锁背景；图鉴则通过进化与收集自然点亮，避免「所有东西都要花星星」的疲惫。
4. **家长侧信息不抢戏**：学习时长、正确率、周报放在「成长档案」，儿童主路径保持轻量。
