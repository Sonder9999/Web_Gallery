const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// --- 数据库连接配置 ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '198386',
    database: 'gallery_db'
};

// 数据库连接中间件
router.use(async (req, res, next) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        req.db = {
            query: async (sql, params = []) => {
                const [rows] = await connection.execute(sql, params);
                await connection.end();
                return rows;
            }
        };
        next();
    } catch (error) {
        console.error('数据库连接失败:', error);
        res.status(500).json({
            success: false,
            message: '数据库连接失败',
            error: error.message
        });
    }
});

// 搜索图片
router.post('/search', async (req, res) => {
    try {
        const { query, filters, tags, tagLogic } = req.body;

        // 构建基础查询
        let sql = `
            SELECT DISTINCT i.*,
                   GROUP_CONCAT(DISTINCT t.name) as tag_names,
                   GROUP_CONCAT(DISTINCT t.id) as tag_ids
            FROM images i
        `;

        let joins = [];
        let conditions = [];
        let params = [];

        // 标签筛选
        if (tags && tags.length > 0) {
            joins.push(`
                LEFT JOIN image_tags it ON i.id = it.image_id
                LEFT JOIN tags t ON it.tag_id = t.id
                LEFT JOIN tag_aliases ta ON t.id = ta.tag_id
            `);

            if (tagLogic === 'AND') {
                // AND逻辑：必须包含所有标签
                for (let i = 0; i < tags.length; i++) {
                    conditions.push(`
                        EXISTS (
                            SELECT 1 FROM image_tags it${i}
                            JOIN tags t${i} ON it${i}.tag_id = t${i}.id
                            LEFT JOIN tag_aliases ta${i} ON t${i}.id = ta${i}.tag_id
                            WHERE it${i}.image_id = i.id
                            AND (t${i}.name LIKE ? OR ta${i}.name LIKE ?)
                        )
                    `);
                    params.push(`%${tags[i]}%`, `%${tags[i]}%`);
                }
            } else {
                // OR逻辑：包含任意标签
                const tagConditions = tags.map(() => '(t.name LIKE ? OR ta.name LIKE ?)').join(' OR ');
                conditions.push(`(${tagConditions})`);
                tags.forEach(tag => {
                    params.push(`%${tag}%`, `%${tag}%`);
                });
            }
        } else {
            // 即使没有标签筛选，也需要JOIN来获取标签信息
            joins.push(`
                LEFT JOIN image_tags it ON i.id = it.image_id
                LEFT JOIN tags t ON it.tag_id = t.id
            `);
        }

        // 文件名搜索
        if (query && query.trim()) {
            conditions.push('(i.filename LIKE ? OR i.filepath LIKE ?)');
            params.push(`%${query}%`, `%${query}%`);
        }

        // 分辨率筛选
        if (filters.resolution) {
            const { width, height, mode } = filters.resolution;
            if (mode === 'exact') {
                conditions.push('i.width = ? AND i.height = ?');
                params.push(width, height);
            } else if (mode === 'minimum') {
                conditions.push('i.width >= ? AND i.height >= ?');
                params.push(width, height);
            }
        }

        // 比例筛选
        if (filters.ratio) {
            if (filters.ratio.min || filters.ratio.max) {
                // 范围筛选
                if (filters.ratio.min) {
                    conditions.push('i.aspect_ratio >= ?');
                    params.push(filters.ratio.min);
                }
                if (filters.ratio.max) {
                    conditions.push('i.aspect_ratio <= ?');
                    params.push(filters.ratio.max);
                }
            } else if (filters.ratio.target) {
                // 精确或模糊匹配
                const target = filters.ratio.target;
                if (filters.ratio.fuzzy) {
                    const tolerance = 0.4;
                    conditions.push('i.aspect_ratio BETWEEN ? AND ?');
                    params.push(target - tolerance, target + tolerance);
                } else {
                    conditions.push('ABS(i.aspect_ratio - ?) < 0.01');
                    params.push(target);
                }
            }
        }

        // 来源筛选
        if (filters.source) {
            conditions.push('i.source_url LIKE ?');
            params.push(`%${filters.source}%`);
        }

        // 组装完整查询
        sql += joins.join(' ');

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' GROUP BY i.id ORDER BY i.uploaded_at DESC LIMIT 100';

        const results = await req.db.query(sql, params);

        // 处理结果，添加标签信息
        const processedResults = results.map(row => ({
            id: row.id,
            filename: row.filename,
            filepath: row.filepath,
            filesize: row.filesize,
            source_url: row.source_url,
            width: row.width,
            height: row.height,
            aspect_ratio: parseFloat(row.aspect_ratio),
            uploaded_at: row.uploaded_at,
            tags: row.tag_names ? row.tag_names.split(',').filter(Boolean) : []
        }));

        res.json({
            success: true,
            data: processedResults,
            total: processedResults.length,
            query: {
                query,
                filters,
                tags,
                tagLogic
            }
        });

    } catch (error) {
        console.error('搜索失败:', error);
        res.status(500).json({
            success: false,
            message: '搜索失败',
            error: error.message
        });
    }
});

// 获取热门标签
router.get('/tags/popular', async (req, res) => {
    try {
        const sql = `
            SELECT t.name, t.primary_name_en, COUNT(it.image_id) as usage_count
            FROM tags t
            JOIN image_tags it ON t.id = it.tag_id
            GROUP BY t.id, t.name, t.primary_name_en
            ORDER BY usage_count DESC, t.name ASC
            LIMIT 20
        `;

        const results = await req.db.query(sql);

        res.json(results.map(row => ({
            name: row.name,
            primary_name_en: row.primary_name_en,
            usage_count: row.usage_count
        })));

    } catch (error) {
        console.error('获取热门标签失败:', error);
        res.status(500).json({
            success: false,
            message: '获取热门标签失败',
            error: error.message
        });
    }
});

// 标签建议/自动完成
router.get('/tags/suggest', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 1) {
            return res.json([]);
        }

        const sql = `
            SELECT DISTINCT name as suggestion, 'tag' as type
            FROM tags
            WHERE name LIKE ?
            UNION
            SELECT DISTINCT name as suggestion, 'alias' as type
            FROM tag_aliases
            WHERE name LIKE ?
            ORDER BY suggestion
            LIMIT 10
        `;

        const results = await req.db.query(sql, [`%${q}%`, `%${q}%`]);

        res.json(results);

    } catch (error) {
        console.error('获取标签建议失败:', error);
        res.status(500).json({
            success: false,
            message: '获取标签建议失败',
            error: error.message
        });
    }
});

// 获取所有可用的分辨率选项
router.get('/filters/resolutions', async (req, res) => {
    try {
        const sql = `
            SELECT DISTINCT
                CONCAT(width, 'x', height) as resolution,
                width,
                height,
                COUNT(*) as count
            FROM images
            WHERE width > 0 AND height > 0
            GROUP BY width, height
            ORDER BY count DESC, width DESC
            LIMIT 20
        `;

        const results = await req.db.query(sql);

        res.json(results);

    } catch (error) {
        console.error('获取分辨率选项失败:', error);
        res.status(500).json({
            success: false,
            message: '获取分辨率选项失败',
            error: error.message
        });
    }
});

// 获取所有可用的比例选项
router.get('/filters/ratios', async (req, res) => {
    try {
        const sql = `
            SELECT
                ROUND(aspect_ratio, 2) as ratio,
                COUNT(*) as count
            FROM images
            WHERE aspect_ratio > 0
            GROUP BY ROUND(aspect_ratio, 2)
            ORDER BY count DESC
            LIMIT 20
        `;

        const results = await req.db.query(sql);

        // 转换为更易读的比例格式
        const processedResults = results.map(row => {
            const ratio = parseFloat(row.ratio);
            let displayRatio;

            // 常见比例的友好显示
            if (Math.abs(ratio - 1.78) < 0.1) {
                displayRatio = '16:9';
            } else if (Math.abs(ratio - 2.33) < 0.1) {
                displayRatio = '21:9';
            } else if (Math.abs(ratio - 0.56) < 0.1) {
                displayRatio = '9:16';
            } else if (Math.abs(ratio - 1.0) < 0.1) {
                displayRatio = '1:1';
            } else if (Math.abs(ratio - 1.33) < 0.1) {
                displayRatio = '4:3';
            } else if (Math.abs(ratio - 1.6) < 0.1) {
                displayRatio = '16:10';
            } else {
                displayRatio = `${ratio}:1`;
            }

            return {
                ratio: row.ratio,
                displayRatio,
                count: row.count
            };
        });

        res.json(processedResults);

    } catch (error) {
        console.error('获取比例选项失败:', error);
        res.status(500).json({
            success: false,
            message: '获取比例选项失败',
            error: error.message
        });
    }
});

module.exports = router;
