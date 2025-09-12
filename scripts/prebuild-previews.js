// scripts/prebuild-previews.js
// 用于本地预生成预览图，命名与服务器一致，便于直接上传至 public/cache/img-previews

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const CACHE_DIR = path.join(PUBLIC_DIR, 'cache', 'images-preview');

function walk(dir, predicate) {
  const result = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) result.push(...walk(p, predicate));
    else if (predicate(p)) result.push(p);
  }
  return result;
}

function toPosixRel(absolutePath) {
  return path.posix.join('images', path.relative(IMAGES_DIR, absolutePath).split(path.sep).join('/'));
}

function buildOutPath(relPathNormalized, w, h, q, fmt) {
  const relNoExt = relPathNormalized.replace(/\.[^.]+$/i, '');
  const safeRel = relNoExt.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '_');
  const parts = [`w${w}`];
  if (h) parts.push(`h${h}`);
  parts.push(`q${q}`, `fmt-${fmt}`);
  const outExt = fmt === 'jpg' ? 'jpeg' : fmt;
  const fileName = `${safeRel}__${parts.join('_')}.${outExt}`;
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  return path.join(CACHE_DIR, fileName);
}

async function buildOne(absPath, relPosix, w, h, q, fmt) {
  const outFile = buildOutPath(relPosix, w, h, q, fmt);
  if (fs.existsSync(outFile)) return;
  const transformer = sharp(absPath, { failOnError: false }).rotate().resize({ width: w, height: h, fit: 'inside', withoutEnlargement: true });
  if (fmt === 'webp') transformer.webp({ quality: q, effort: 4 });
  else if (fmt === 'avif') transformer.avif({ quality: Math.max(30, Math.min(q, 70)), effort: 3 });
  else if (fmt === 'png') transformer.png({ compressionLevel: 9, palette: true, effort: 4 });
  else transformer.jpeg({ quality: q, mozjpeg: true });
  await transformer.toFile(outFile);
  console.log('built', path.relative(PUBLIC_DIR, outFile));
}

async function main() {
  const w = Number(process.env.W) || 480;
  const q = Number(process.env.Q) || 60;
  const fmt = (process.env.FMT || 'webp').toLowerCase();
  const h = process.env.H ? Number(process.env.H) : undefined;

  const files = walk(IMAGES_DIR, p => /\.(jpg|jpeg|png|webp|gif)$/i.test(p));
  console.log('found', files.length, 'images');

  for (const f of files) {
    const rel = toPosixRel(f);
    await buildOne(f, rel, w, h, q, fmt);
  }

  console.log('done');
}

main().catch(err => { console.error(err); process.exit(1); });
