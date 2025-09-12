// server/routes/imageProxyRoutes.js - 按需压缩与缓存的图片预览路由
const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const router = express.Router();

// 允许的根目录（仅限于项目 public 下的资源）
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const MEDIA_DIR = path.join(PUBLIC_DIR, 'media');

// 预览缓存目录
const CACHE_DIR = path.join(PUBLIC_DIR, 'cache', 'images-preview');
fs.mkdirSync(CACHE_DIR, { recursive: true });

// 简单并发去重锁，key 为缓存文件绝对路径
const generationLocks = new Map();

function isPathAllowed(absFilePath) {
    const allowedRoots = [PUBLIC_DIR, IMAGES_DIR, MEDIA_DIR].map(p => path.resolve(p));
    const resolved = path.resolve(absFilePath);
    return allowedRoots.some(root => resolved.startsWith(root + path.sep) || resolved === root);
}

function pickBestFormat(acceptHeader, srcExt) {
    const accept = (acceptHeader || '').toLowerCase();
    if (accept.includes('image/avif')) return { format: 'avif', contentType: 'image/avif' };
    if (accept.includes('image/webp')) return { format: 'webp', contentType: 'image/webp' };
    // 动图 gif 直接返回 jpeg/webp 首帧预览也可，这里按 jpeg 处理
    if (srcExt === '.png') return { format: 'png', contentType: 'image/png' };
    return { format: 'jpeg', contentType: 'image/jpeg' };
}

function buildDeterministicCachePath(relPathNormalized, w, h, q, fmt) {
    // 平铺命名：将原相对路径用下划线替换分隔符，避免目录结构
    // 例: images/a/b/c.jpg -> cache/images-preview/images_a_b_c__w480_q60_fmt-webp.webp
    const relNoExt = relPathNormalized.replace(/\.[^.]+$/i, '');
    const safeRel = relNoExt.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '_');
    const parts = [`w${w}`];
    if (h) parts.push(`h${h}`);
    parts.push(`q${q}`, `fmt-${fmt}`);
    const outExt = fmt === 'jpg' ? 'jpeg' : fmt;
    const fileName = `${safeRel}__${parts.join('_')}.${outExt}`;
    return path.join(CACHE_DIR, fileName);
}

router.get('/preview', async (req, res) => {
    try {
        const relPath = req.query.path; // 相对于 public 的路径，如 images/xxx/yyy.jpg
        if (!relPath) return res.status(400).json({ message: '缺少 path 参数' });

        let decodedRelPath = decodeURIComponent(relPath);
        // 统一分隔符，兼容数据库中可能存入的反斜杠
        decodedRelPath = decodedRelPath.replace(/\\/g, '/');
        const absPath = path.resolve(PUBLIC_DIR, decodedRelPath);
        if (!isPathAllowed(absPath)) {
            return res.status(400).json({ message: '非法路径' });
        }

        if (!fs.existsSync(absPath)) {
            console.warn('[image/preview] 文件不存在:', { rel: decodedRelPath, abs: absPath });
            return res.status(404).json({ message: '文件不存在' });
        }

        // 参数
        const w = Number.parseInt(req.query.w, 10) || 480; // 默认预览宽度
        const h = req.query.h ? Number.parseInt(req.query.h, 10) : undefined;
        const q = Number.parseInt(req.query.q, 10) || 60; // 质量 1-100
        const requestedFmt = (req.query.fmt || 'auto').toLowerCase();

        const ext = path.extname(absPath).toLowerCase();
        const autoFmt = pickBestFormat(req.headers['accept'], ext);
        const format = requestedFmt === 'auto' ? autoFmt.format : requestedFmt;
        const contentType = requestedFmt === 'auto' ? autoFmt.contentType : `image/${format === 'jpg' ? 'jpeg' : format}`;

    const cachedFile = buildDeterministicCachePath(decodedRelPath, w, h, q, format);

        // 命中缓存直接返回
        if (fs.existsSync(cachedFile)) {
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return fs.createReadStream(cachedFile).pipe(res);
        }

        // 生成预览（并发去重）
        let genOk = false;
        if (generationLocks.has(cachedFile)) {
            await generationLocks.get(cachedFile);
        } else {
            const p = (async () => {
                try {
                    const transformer = sharp(absPath, { failOnError: false });
                    transformer.rotate();
                    transformer.resize({ width: w, height: h, fit: 'inside', withoutEnlargement: true });
                    if (format === 'webp') {
                        transformer.webp({ quality: q, effort: 4 });
                    } else if (format === 'avif') {
                        transformer.avif({ quality: Math.max(30, Math.min(q, 70)), effort: 3 });
                    } else if (format === 'png') {
                        transformer.png({ compressionLevel: 9, palette: true, effort: 4 });
                    } else {
                        transformer.jpeg({ quality: q, mozjpeg: true });
                    }
                    await transformer.toFile(cachedFile);
                    genOk = true;
                } catch (e) {
                    console.warn('[image/preview] 生成预览失败，回退原图:', e?.message || e);
                    try { if (fs.existsSync(cachedFile)) fs.unlinkSync(cachedFile); } catch {}
                    genOk = false;
                }
            })().finally(() => {
                generationLocks.delete(cachedFile);
            });
            generationLocks.set(cachedFile, p);
            await p;
        }

        if (genOk && fs.existsSync(cachedFile)) {
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return fs.createReadStream(cachedFile).pipe(res);
        }

        // 原图回退
        const extLower = ext; // path.extname(absPath) 已得
        const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.tiff': 'image/tiff', '.avif': 'image/avif' };
        res.setHeader('Content-Type', mimeMap[extLower] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=604800');
        return fs.createReadStream(absPath).pipe(res);

    } catch (err) {
        console.error('生成预览失败:', err);
        return res.status(500).json({ message: '生成预览失败' });
    }
});

module.exports = router;
