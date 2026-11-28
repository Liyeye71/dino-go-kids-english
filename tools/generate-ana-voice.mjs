import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

/* ============================================================
   DinoGo · 离线批量生成美音童声（en-US-AnaNeural）轻量 MP3
   - 从 app/data/game/library.js 与 animal.js 提取全部单词 + 常用句
   - 增量生成：已存在且非空的 mp3 自动跳过，新增词条重跑即可补齐
   - 输出目录：app/data/sounds/voice/ana/<slug>.mp3
   - 同步产出：app/data/sounds/ana-manifest.js（前端零 404 查表）
   ============================================================ */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "app");
const outDir = path.join(appDir, "data", "sounds", "voice", "ana");
const manifestFile = path.join(appDir, "data", "sounds", "ana-manifest.js");

const VOICE = "en-US-AnaNeural";
const RATE = "-8%";
const CONCURRENCY = 6;
const MAX_RETRIES = 3;

const EXTRA_PHRASES = [
  "Hello! Let's learn English together!",
  "Yes, it is.",
  "Yes, they are.",
  "Yes, it does.",
];

/* 与前端 sfx.js 完全一致的文本规范化函数 */
function voiceSlug(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* 从 library.js / animal.js 收集所有待生成条目（Map<slug, text>） */
function collectItems() {
  const map = new Map();
  const add = (text) => {
    const clean = String(text || "").trim();
    const slug = voiceSlug(clean);
    if (slug && !map.has(slug)) map.set(slug, clean);
  };

  /* 1. 全局词库 library.js */
  const libSrc = fs.readFileSync(path.join(appDir, "data", "game", "library.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(libSrc, sandbox);
  const lib = sandbox.window.DINO_WORD_LIBRARY || {};
  for (const entry of Object.values(lib)) {
    if (entry && entry.word) add(entry.word);
  }

  /* 2. animal.js 中的食物词与情景对话食物问答句 */
  const animalSrc = fs.readFileSync(path.join(appDir, "data", "theme", "animal.js"), "utf8");
  for (const m of animalSrc.matchAll(/\ben:\s*"([^"]+)"/g)) {
    const food = m[1];
    add(food);
    add(`It eats ${food}.`);
    add(`No, it doesn't. It eats ${food}.`);
  }

  /* 3. dialog-templates.js 中的固定无变量场景问句（zoo / school / travel / default） */
  const dlgPath = path.join(appDir, "data", "game", "dialog-templates.js");
  if (fs.existsSync(dlgPath)) {
    const dlgSrc = fs.readFileSync(dlgPath, "utf8");
    for (const m of dlgSrc.matchAll(/"([A-Z][^"{}]*[?!.])"/g)) {
      const s = m[1].trim();
      if (s.includes(" ") && !s.includes("{") && !s.includes("___")) add(s);
    }
  }

  /* 4. school.js / travel.js 等独立定义的主题词表（名词数组 + 动作动词对象） */
  for (const themeFile of ["school.js", "travel.js"]) {
    const p = path.join(appDir, "data", "theme", themeFile);
    if (!fs.existsSync(p)) continue;
    const src = fs.readFileSync(p, "utf8");
    for (const m of src.matchAll(/\[\s*"([^"]+)"\s*,/g)) {
      add(m[1]);
    }
    for (const m of src.matchAll(/\{\s*word:\s*"([^"]+)"/g)) {
      add(m[1]);
    }
  }

  /* 4. 常用固定提示句 & 试听句 */
  for (const phrase of EXTRA_PHRASES) add(phrase);

  return map;
}

async function synthOne(text, destPath) {
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(text, { rate: RATE });
      const chunks = [];
      await new Promise((resolve, reject) => {
        audioStream.on("data", (chunk) => chunks.push(chunk));
        audioStream.on("end", resolve);
        audioStream.on("error", reject);
      });
      const buf = Buffer.concat(chunks);
      if (buf.length < 256) throw new Error(`音频过短 (${buf.length} B)`);
      fs.writeFileSync(destPath, buf);
      return buf.length;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    } finally {
      try { tts.close(); } catch {}
    }
  }
  throw lastErr;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const items = collectItems();
  const entries = [...items.entries()];
  const pending = entries.filter(([slug]) => {
    const p = path.join(outDir, `${slug}.mp3`);
    return !fs.existsSync(p) || fs.statSync(p).size < 256;
  });

  console.log(`共收集 ${entries.length} 条，待生成 ${pending.length} 条（音色：${VOICE}）`);

  let done = 0;
  let failed = 0;
  const queue = pending.slice();

  const worker = async () => {
    while (queue.length) {
      const [slug, text] = queue.shift();
      const dest = path.join(outDir, `${slug}.mp3`);
      try {
        await synthOne(text, dest);
        done++;
        if (done % 25 === 0 || done === pending.length) {
          console.log(`进度：${done}/${pending.length}（失败 ${failed}）`);
        }
      } catch (err) {
        failed++;
        console.error(`失败 [${slug}] "${text}": ${err && err.message ? err.message : err}`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, Math.max(1, pending.length)) }, worker));

  /* 写入前端清单：只收录实际存在且有效的 mp3，确保零 404 */
  const ready = fs.readdirSync(outDir)
    .filter((f) => f.endsWith(".mp3") && fs.statSync(path.join(outDir, f)).size >= 256)
    .map((f) => f.slice(0, -4))
    .sort();

  const totalBytes = ready.reduce((sum, slug) => sum + fs.statSync(path.join(outDir, `${slug}.mp3`)).size, 0);
  const manifestContent =
    `/* 自动生成：美音童声 Ana（en-US-AnaNeural）可用本地音频索引，由 tools/generate-ana-voice.mjs 产出 */\n` +
    `window.ANA_VOICE_FILES = new Set(${JSON.stringify(ready)});\n`;
  fs.writeFileSync(manifestFile, manifestContent, "utf8");

  console.log(`完成：可用音频 ${ready.length} 条，总计 ${(totalBytes / 1024 / 1024).toFixed(2)} MB，失败 ${failed} 条`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
