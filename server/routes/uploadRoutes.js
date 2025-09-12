// server/routes/uploadRoutes.js - (最终修复版) 统一并强化了标签查找逻辑，确保严格遵守语言设置

const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const { imageSize: sizeOf } = require('image-size');
const envConfig = require('../../config/env');

const router = express.Router();

const FILENAME_LANGUAGE = 'en'; // 生成文件名时优先使用的语言
const FOLDER_NAME_LANGUAGE = 'en'; // 生成文件夹名时优先使用的语言
const STORAGE_CONFIG = require('../config/storage');

const dbConfig = envConfig.database;

const pool = mysql.createPool(dbConfig);
console.log('[数据库] 连接池已成功创建。');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * [新增] 统一的、健壮的标签信息查找函数
 * @param {string} tagName - 从客户端传入的标签名
 * @returns {Promise<{id: number, primary_name_en: string, aliases: Array<{lang: string, name: string}>}|null>}
 */
async function findTagInfo(tagName) {
    const cleanedClientTag = tagName.trim().replace(/[:：\s]/g, '');
    if (!cleanedClientTag) return null;

    const query = `
        SELECT t.id, t.primary_name_en
        FROM tags t
        JOIN tag_aliases ta ON t.id = ta.tag_id
        WHERE REPLACE(REPLACE(REPLACE(ta.name, ':', ''), '：', ''), ' ', '') = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [cleanedClientTag]);

    if (rows.length > 0) {
        const tag = rows[0];
        const [aliases] = await pool.execute('SELECT lang, name FROM tag_aliases WHERE tag_id = ?', [tag.id]);
        tag.aliases = aliases;
        return tag;
    }

    return null;
}

/**
 * [核心最终修复] 使用统一的查找逻辑来生成文件名
 */
async function generateFilenameFromTags(tagNames, originalExtension) {
    console.log('[文件名生成] 开始:', { tagNames, originalExtension });
    let nameParts = [];

    if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
            const tagInfo = await findTagInfo(tagName);
            let partFound = false;

            if (tagInfo) {
                const langAlias = tagInfo.aliases.find(a => a.lang === FILENAME_LANGUAGE);
                if (langAlias && langAlias.name) {
                    nameParts.push(langAlias.name);
                    console.log(`[文件名生成] -> 找到 "${tagName}" 的 ${FILENAME_LANGUAGE} 别名: "${langAlias.name}"`);
                    partFound = true;
                } else if (tagInfo.primary_name_en) {
                    nameParts.push(tagInfo.primary_name_en);
                    console.log(`[文件名生成] -> 未找到 ${FILENAME_LANGUAGE} 别名，使用 primary_name_en: "${tagInfo.primary_name_en}"`);
                    partFound = true;
                }
            }

            if (!partFound) {
                nameParts.push(tagName);
                console.log(`[文件名生成] -> 标签 "${tagName}" 在数据库中未找到，使用原始名称`);
            }
        }
    }
    console.log('[文件名生成] 组件 (清理前):', nameParts);

    let baseName = nameParts.map(part =>
        part.toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5-]/g, ' ')
            .trim()
            .replace(/\s+/g, '_')
    ).join('_');

    if (!baseName) baseName = `image_${Date.now()}`;
    console.log('[文件名生成] 基础 (清理后):', baseName);

    const shortId = crypto.randomBytes(3).toString('hex');
    const finalFilename = `${baseName}_${shortId}${originalExtension}`;
    console.log('[文件名生成] 最终文件名:', finalFilename);
    return finalFilename;
}

/**
 * [核心最终修复] 使用统一的查找逻辑来生成文件夹名
 */
async function generateFolderPathFromTags(tagNames) {
    if (!STORAGE_CONFIG.enableTagBasedFolders || !tagNames || tagNames.length === 0) {
        return STORAGE_CONFIG.noTagsFolder || 'others';
    }
    const folderTags = tagNames.slice(0, STORAGE_CONFIG.folderDepth);
    const folderNames = [];

    for (const tagName of folderTags) {
        let folderName = tagName; // 默认值
        const tagInfo = await findTagInfo(tagName);

        if (tagInfo) {
            const langAlias = tagInfo.aliases.find(a => a.lang === FOLDER_NAME_LANGUAGE);
            if (langAlias && langAlias.name) {
                folderName = langAlias.name;
            } else if (tagInfo.primary_name_en) {
                folderName = tagInfo.primary_name_en; // 备用
            }
        }

        if (STORAGE_CONFIG.tagToFolderName.lowercase) folderName = folderName.toLowerCase();
        if (STORAGE_CONFIG.tagToFolderName.replaceSpaces) folderName = folderName.replace(/\s+/g, '_');
        if (STORAGE_CONFIG.tagToFolderName.removeSpecialChars) folderName = folderName.replace(/[^\w\u4e00-\u9fa5_-]/g, '');
        const processedName = folderName.trim();
        if (processedName) folderNames.push(processedName);
    }
    const folderPath = folderNames.join('/');
    console.log(`[文件存储] 标签: [${tagNames.join(', ')}] -> 文件夹路径(${FOLDER_NAME_LANGUAGE}): ${folderPath || '(根目录)'}`);
    return folderPath;
}


// --- 其他函数 (保持不变) ---
async function findOrCreateTag(connection, tagName) {
    const tagInfo = await findTagInfo(tagName);
    if (tagInfo) return tagInfo.id;

    // 如果找不到，则创建新标签
    try {
        const cleanedTagNameForPrimary = tagName.trim().replace(/[:：\s]/g, '');
        const primary_name_en = cleanedTagNameForPrimary.toLowerCase().replace(/[^\w-]/g, ' ').trim().replace(/\s+/g, '_') || `tag_${Date.now()}`;
        const [tagResult] = await connection.execute('INSERT INTO tags (name, primary_name_en) VALUES (?, ?)', [tagName.trim(), primary_name_en]);
        const newTagId = tagResult.insertId;
        await connection.execute('INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)', [newTagId, tagName.trim(), 'zh']);
        return newTagId;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(`竞态条件处理：标签 "${tagName}" 已被创建，重新获取中...`);
            await new Promise(resolve => setTimeout(resolve, 50));
            const retryTagInfo = await findTagInfo(tagName);
            if (retryTagInfo) return retryTagInfo.id;
            throw new Error(`在处理竞态条件后，仍然无法找到标签 "${tagName}"`);
        } else {
            throw error;
        }
    }
}

async function updateImageInfo(connection, imageId, tagNames, source) {
    await connection.execute('DELETE FROM image_tags WHERE image_id = ?', [imageId]);
    await connection.execute('UPDATE images SET source_url = ? WHERE id = ?', [source || '', imageId]);
    if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
            if (tagName.trim()) {
                const tagId = await findOrCreateTag(connection, tagName);
                if (tagId) await connection.execute('INSERT IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)', [imageId, tagId]);
            }
        }
    }
}

// --- 路由部分 (保持不变) ---
router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    const { tags, source } = req.body;
    const tagList = (tags && tags.length > 0) ? JSON.parse(tags) : [];
    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const dimensions = sizeOf(fileBuffer);
    const aspectRatio = dimensions.height > 0 ? dimensions.width / dimensions.height : 0;
    let connection;
    try {
        connection = await pool.getConnection();
        const [existingImages] = await connection.execute('SELECT * FROM images WHERE file_hash = ?', [hash]);
        if (existingImages.length > 0) {
            connection.release();
            return res.status(200).json({ success: true, duplicate: true, message: '文件已存在', image: existingImages[0] });
        }
        const originalExtension = req.file.originalname ? path.extname(req.file.originalname) : '.jpg';
        const newFilename = await generateFilenameFromTags(tagList, originalExtension);
        const folderPath = await generateFolderPathFromTags(tagList);
        const uploadPath = path.join(__dirname, '../../public/images/', folderPath);
        const filepath = path.join(uploadPath, newFilename);
        const relativePath = path.join('images', folderPath, newFilename).replace(/\\/g, '/');
        await fs.mkdir(uploadPath, { recursive: true });
        await fs.writeFile(filepath, fileBuffer);
        await connection.beginTransaction();
        const [imageResult] = await connection.execute(
            'INSERT INTO images (filename, filepath, filesize, width, height, aspect_ratio, source_url, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newFilename, relativePath, req.file.size, dimensions.width, dimensions.height, aspectRatio, source || '', hash]
        );
        const imageId = imageResult.insertId;
        await updateImageInfo(connection, imageId, tagList, source);
        await connection.commit();
        res.status(201).json({ success: true, duplicate: false, message: '图片上传成功！' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('上传处理失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/overwrite', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    const { tags, source } = req.body;
    const tagList = (tags && tags.length > 0) ? JSON.parse(tags) : [];
    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    let connection;
    try {
        connection = await pool.getConnection();
        const [existingImages] = await connection.execute('SELECT id FROM images WHERE file_hash = ?', [hash]);
        if (existingImages.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: '未找到要覆盖的原始图片记录。' });
        }
        const imageId = existingImages[0].id;
        await connection.beginTransaction();
        await updateImageInfo(connection, imageId, tagList, source);
        await connection.commit();
        res.status(200).json({ success: true, message: '图片信息覆盖更新成功！' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('覆盖更新失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) connection.release();
    }
});

router.get('/api/images', async (req, res) => {
    try {
        const [images] = await pool.execute('SELECT id, filename, filepath, width, height FROM images ORDER BY id DESC');
        res.status(200).json(images);
    } catch (error) {
        console.error('获取图片列表失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

module.exports = router;