-- 删除 images 表中 id 从 284 到 310 的数据
-- 由于设置了 ON DELETE CASCADE，关联的 image_tags 记录会自动删除

DELETE FROM images WHERE id BETWEEN 311 AND 337;