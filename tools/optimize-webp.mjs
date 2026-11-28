import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/* ============================================================
   DinoGo · WebP 图片三项优化脚本
   1. words/action 超大图（长边 > 768px）等比缩放至 ≤ 768px，保 2x Retina 清晰度
   2. school-* / travel-* 白底动作图：边缘 BFS 泛洪抠白底 + 柔和抗锯齿 + 紧致裁边
   3. background/ 封面与底图：保持原分辨率重压（仅变小时写回）
   ============================================================ */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const materialDir = path.join(root, "app", "data", "images", "material");
const actionDir = path.join(materialDir, "words", "action");
const bgDir = path.join(materialDir, "background");

/* 边缘 BFS 泛洪去白底：只抠与外框连通的近白背景，绝不误伤恐龙眼白/画纸/白帆 */
async function removeWhiteBgAndTrim(srcBuf, filePath) {
  const { data, info } = await sharp(srcBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels: c } = info;
  const buf = Buffer.from(data);
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const isNearWhite = (idx) => {
    const p = idx * c;
    const r = buf[p], g = buf[p + 1], b = buf[p + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    return min >= 238 && (max - min) <= 18;
  };

  const push = (x, y) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    if (isNearWhite(idx)) {
      isBg[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = (idx - x) / w;
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }

  /* 透明化背景像素 */
  for (let i = 0; i < w * h; i++) {
    if (isBg[i]) buf[i * c + 3] = 0;
  }

  /* 1px 边缘柔和羽化：紧贴透明背景的浅白过渡像素按亮度平滑降 alpha，避免锯齿白边 */
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (isBg[idx]) continue;
      if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - w] || isBg[idx + w]) {
        const p = idx * c;
        const r = buf[p], g = buf[p + 1], b = buf[p + 2];
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        if (min >= 215 && (max - min) <= 24) {
          const t = (242 - min) / (242 - 215);
          buf[p + 3] = Math.max(0, Math.min(255, Math.round(t * 255)));
        }
      }
    }
  }

  /* 紧致裁切透明边 + 补 4% 安全留白 */
  const trimmed = await sharp(buf, { raw: { width: w, height: h, channels: c } })
    .trim({ threshold: 12 })
    .toBuffer({ resolveWithObject: true });

  const pad = Math.max(12, Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.04));
  const outBuf = await sharp(trimmed.data, {
    raw: { width: trimmed.info.width, height: trimmed.info.height, channels: trimmed.info.channels },
  })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 92, effort: 6 })
    .toBuffer();

  fs.writeFileSync(filePath, outBuf);
  return outBuf.length;
}

let savedTotal = 0;

/* 1 & 2. 优化 words/action */
let actionResized = 0;
let actionCutout = 0;
let actionBefore = 0;
let actionAfter = 0;

for (const file of fs.readdirSync(actionDir).filter((f) => f.endsWith(".webp"))) {
  const abs = path.join(actionDir, file);
  const srcBuf = fs.readFileSync(abs);
  const before = srcBuf.length;
  actionBefore += before;
  const meta = await sharp(srcBuf).metadata();

  if (/^(school|travel)-/i.test(file) && !meta.hasAlpha) {
    const after = await removeWhiteBgAndTrim(srcBuf, abs);
    actionAfter += after;
    actionCutout++;
    savedTotal += before - after;
    continue;
  }

  if (Math.max(meta.width || 0, meta.height || 0) > 768) {
    const outBuf = await sharp(srcBuf)
      .resize(768, 768, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 92, effort: 6 })
      .toBuffer();
    if (outBuf.length < before) {
      fs.writeFileSync(abs, outBuf);
      actionAfter += outBuf.length;
      actionResized++;
      savedTotal += before - outBuf.length;
    } else {
      actionAfter += before;
    }
  } else {
    actionAfter += before;
  }
}

/* 3. 优化 background/（保持原分辨率重压，仅当节省 >= 5% 时替换） */
let bgUpdated = 0;
let bgBefore = 0;
let bgAfter = 0;

for (const file of fs.readdirSync(bgDir).filter((f) => f.endsWith(".webp"))) {
  const abs = path.join(bgDir, file);
  const srcBuf = fs.readFileSync(abs);
  const before = srcBuf.length;
  bgBefore += before;
  const outBuf = await sharp(srcBuf)
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  if (outBuf.length < before * 0.95) {
    fs.writeFileSync(abs, outBuf);
    bgAfter += outBuf.length;
    bgUpdated++;
    savedTotal += before - outBuf.length;
  } else {
    bgAfter += before;
  }
}

console.log(`words/action: resized=${actionResized}, cutout=${actionCutout}, ${(actionBefore / 1024).toFixed(0)}KB -> ${(actionAfter / 1024).toFixed(0)}KB`);
console.log(`background:   recompressed=${bgUpdated}, ${(bgBefore / 1024).toFixed(0)}KB -> ${(bgAfter / 1024).toFixed(0)}KB`);
console.log(`Total saved:  ${(savedTotal / 1024 / 1024).toFixed(2)} MB (${(savedTotal / 1024).toFixed(0)} KB)`);
