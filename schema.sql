-- schema.sql - 数据库表结构

-- ----------------------------
-- 1. 图片表 (images)
-- 存储每张图片的核心信息
-- ----------------------------
CREATE TABLE `images` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图片唯一ID',
    `filename` VARCHAR(255) NOT NULL COMMENT '原始文件名',
    `filepath` VARCHAR(512) NOT NULL COMMENT '服务器存储路径',
    `filesize` INT UNSIGNED NOT NULL COMMENT '文件大小 (Bytes)',
    `source_url` VARCHAR(1024) DEFAULT '' COMMENT '图片来源网址 (可选)',
    `width` INT UNSIGNED DEFAULT 0 COMMENT '图片宽度 (px)',
    `height` INT UNSIGNED DEFAULT 0 COMMENT '图片高度 (px)',
    `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_filepath` (`filepath`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '图片信息表';

-- ----------------------------
-- 2. 标签表 (tags)
-- 存储所有唯一的标签
-- ----------------------------
CREATE TABLE `tags` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签唯一ID',
    `name` VARCHAR(100) NOT NULL COMMENT '标签名称',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_name` (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '标签表';

-- ----------------------------
-- 3. 图片与标签关联表 (image_tags)
-- 连接图片和标签的多对多关系
-- ----------------------------
CREATE TABLE `image_tags` (
    `image_id` INT UNSIGNED NOT NULL COMMENT '图片ID',
    `tag_id` INT UNSIGNED NOT NULL COMMENT '标签ID',
    PRIMARY KEY (`image_id`, `tag_id`),
    CONSTRAINT `fk_image` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '图片与标签关联表';

ALTER TABLE `images`
ADD COLUMN `file_hash` VARCHAR(64) NOT NULL COMMENT '文件内容的SHA256哈希值' AFTER `source_url`,
ADD UNIQUE INDEX `idx_file_hash` (`file_hash`);

ALTER TABLE `images`
ADD COLUMN `aspect_ratio` DECIMAL(10, 4) NOT NULL COMMENT '宽高比 (width/height)' AFTER `height`,
ADD INDEX `idx_aspect_ratio` (`aspect_ratio`);

ALTER TABLE `tags`
ADD COLUMN `primary_name_en` VARCHAR(100) NOT NULL COMMENT '标签的英文主名，用于程序关联' AFTER `name`,
ADD UNIQUE INDEX `idx_primary_name_en` (`primary_name_en`);

CREATE TABLE `tag_aliases` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tag_id` INT UNSIGNED NOT NULL COMMENT '关联的标签概念ID',
    `name` VARCHAR(100) NOT NULL COMMENT '别名/翻译名/昵称',
    `lang` VARCHAR(10) NOT NULL COMMENT '语言或类型 (en, zh, ja, pinyin, nickname)',
    PRIMARY KEY (`id`),
    INDEX `idx_name` (`name`),
    CONSTRAINT `fk_alias_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '标签别名与多语言表';


-- ===============================================================
--  为角色“爱莉希雅” (Elysia) 生成标签和别名测试数据
-- ===============================================================

-- --- 步骤 1: 在 `tags` 表中创建“爱莉希雅”这个独一无二的“概念” ---
-- 我们用她的中文名作为基础名，用'elysia'作为程序内部关联用的英文主名。
INSERT INTO
    `tags` (`name`, `primary_name_en`)
VALUES ('爱莉希雅', 'elysia');

-- --- 步骤 2: 获取刚刚插入的“爱莉希雅”概念的ID ---
-- 我们将这个ID存入一个临时变量 @elysia_id，方便下面使用。
SET @elysia_id = LAST_INSERT_ID();

-- --- 步骤 3: 在 `tag_aliases` 表中为“爱莉希雅”添加各种别名和翻译 ---
-- 所有的别名都通过 @elysia_id 关联到同一个概念上。
INSERT INTO
    `tag_aliases` (`tag_id`, `name`, `lang`)
VALUES (@elysia_id, '爱莉希雅', 'zh'), -- 中文名
    (@elysia_id, 'Elysia', 'en'), -- 英文名
    (@elysia_id, 'エリシア', 'ja'), -- 日文名
    (@elysia_id, '爱莉', 'nickname'), -- 昵称
    (
        @elysia_id,
        'ailixiya',
        'pinyin'
    );
-- 拼音

-- --- 验证 (可选) ---
-- 你可以执行下面这行代码来检查是否成功插入了数据。
-- 它会找出所有与“爱莉希雅”概念相关的别名。
SELECT t.id AS concept_id, t.primary_name_en, ta.name AS alias_name, ta.lang
FROM tags t
    JOIN tag_aliases ta ON t.id = ta.tag_id
WHERE
    t.primary_name_en = 'elysia';