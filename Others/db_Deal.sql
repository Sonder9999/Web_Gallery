-- 删除 images 表中 id 从 284 到 310 的数据
-- 由于设置了 ON DELETE CASCADE，关联的 image_tags 记录会自动删除

DELETE FROM images WHERE id BETWEEN 311 AND 337;
DELETE FROM tags WHERE id BETWEEN 255 AND 306;
DELETE FROM tag_aliases WHERE id BETWEEN 1604 AND 1809;

-- 为 images 表添加 is_hidden 字段，并设置默认值为 0 (显示)
ALTER TABLE `images`
ADD COLUMN `is_hidden` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 for visible, 1 for hidden';

-- 为 is_hidden 字段添加索引，以优化查询性能
ALTER TABLE `images` ADD INDEX `idx_is_hidden` (`is_hidden`);


ALTER TABLE `tags`
ADD COLUMN `is_hidden` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 for visible, 1 for hidden';

-- 为 is_hidden 字段添加索引，以优化查询性能
ALTER TABLE `tags` ADD INDEX `idx_is_hidden` (`is_hidden`);

UPDATE images SET is_hidden = 1 WHERE id BETWEEN 841 AND 861;