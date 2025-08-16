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

ALTER TABLE `tags`
ADD COLUMN `parent_id` INT UNSIGNED NULL DEFAULT NULL COMMENT '父标签ID，形成层级关系' AFTER `primary_name_en`,
ADD CONSTRAINT `fk_parent_tag` FOREIGN KEY (`parent_id`) REFERENCES `tags` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;