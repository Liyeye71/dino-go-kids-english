// 从下载的 HTML 模板中按顺序提取 <script> 块，写入项目对应 JS 文件
// 运行：node tools/split-js.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const TEMPLATE = "C:\\Users\\TangHao\\Downloads\\DinoGo_index_v4_carousel (1).html";
const APP_DIR = path.join(root, "app");

if (!fs.existsSync(TEMPLATE)) {
  console.error("模板不存在:", TEMPLATE);
  process.exit(1);
}

const html = fs.readFileSync(TEMPLATE, "utf8");

// 提取所有 <script>...</script> 块
// 注意：必须用 [\s\S] 而非 . 才能跨行
const scriptRe = /<script>([\s\S]*?)<\/script>/g;
const blocks = [];
let m;
while ((m = scriptRe.exec(html)) !== null) {
  blocks.push(m[1]);
}

// 最后一个 script 块通常只是 boot();，跳过
// 映射表：模板第 N 个 script 块 → 项目文件路径（相对 app/）
// 顺序严格对应 build.mjs 的打包顺序！
const fileMap = [
  "data/game/library.js",         // 1. 全局词库
  "data/game/shared.js",          // 2. 主题注册与关卡上下文
  "data/game/dialog-templates.js", // 3. 情景对话模板库
  "data/game/dynamic-engine.js",  // 4. DynamicEngine 题库引擎
  "data/theme/travel.js",         // 5. 去旅行
  "data/theme/animal.js",         // 6. 动物乐园
  "data/theme/school.js",         // 7. 上学了
  "data/sounds/sfx.js",           // 8. 音效
  "frame/core/utils.js",          // 9. 通用工具
  "frame/core/visual.js",         // 10. 视觉资源
  "frame/core/data.js",           // 11. 静态配置
  "frame/core/words.js",          // 12. 词汇池与关卡规则
  "frame/core/state.js",          // 13. 应用状态
  "frame/core/ui.js",             // 14. 通用界面
  "frame/core/events.js",         // 15. 全局事件
  "frame/core/boot.js",           // 16. 启动与渲染
  "data/game/wrongbank.js",       // 17. 错题库
  "data/game/chest.js",           // 18. 宝箱 + 转盘
  "data/game/result.js",          // 19. 闯关结算与进化
  "data/game/main.js",            // 20. 游戏流程
  "data/game/quiz-view.js",       // 21. 答题页视图
  "frame/home.js",                // 22. home
  "frame/map.js",                 // 23. map
  "frame/dex.js",                 // 24. 词汇 + 图鉴
  "frame/collect.js",             // 25. 收藏
  // 26: boot() 调用 → 忽略，index.html 里已有
];

if (blocks.length - 1 !== fileMap.length) {
  console.warn(`⚠️ 模板 script 块 (${blocks.length - 1}) 与 fileMap 条目 (${fileMap.length}) 数量不一致`);
}

console.log(`模板共 ${blocks.length} 个 script 块（最后一块 boot() 忽略）\n`);

let ok = 0, skip = 0;
const results = [];
for (let i = 0; i < fileMap.length; i++) {
  const target = fileMap[i];
  const body = (blocks[i] || "").trim();

  // 跳过空块或 boot() 调用
  if (!body || body === "boot();" || body === "boot()") {
    skip++;
    console.log(`⏭️  #${i + 1} ${target}: 空块/boot() 调用，跳过`);
    continue;
  }

  // 提取标题（从第一个 /* === */ 注释中）
  const titleMatch = body.match(/\/\* ={10,}\n\s*(.+?)\n/);
  const title = titleMatch ? titleMatch[1].trim() : "(no title)";

  const outPath = path.join(APP_DIR, target);
  fs.writeFileSync(outPath, body + "\n", "utf8");

  const lines = body.split("\n").length;
  const kb = (Buffer.byteLength(body) / 1024).toFixed(1);
  console.log(`✅ #${String(i + 1).padStart(2)} ${target.padEnd(35)} ${kb} KB / ${lines} 行 — ${title.substring(0, 50)}`);
  results.push({ target, lines, title });
  ok++;
}

console.log(`\n完成：${ok} 个文件写入，${skip} 个跳过`);

// 可选：写一份 manifest 记录
if (ok) {
  console.log("\n下一步: node build.mjs 验证打包");
}
