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

-- ===============================================================
--  为游戏“崩坏：星穹铁道” (Honkai: Star Rail) 生成标签和别名测试数据
-- ===============================================================

-- --- 步骤 1: 创建“崩坏：星穹铁道”概念 ---
INSERT INTO
    `tags` (`name`, `primary_name_en`)
VALUES ('崩坏：星穹铁道', 'honkai_star_rail');

-- --- 步骤 2: 获取ID ---
SET @hsr_id = LAST_INSERT_ID();

-- --- 步骤 3: 添加别名 ---
INSERT INTO
    `tag_aliases` (`tag_id`, `name`, `lang`)
VALUES (@hsr_id, '崩坏：星穹铁道', 'zh'),
    (
        @hsr_id,
        'Honkai: Star Rail',
        'en'
    ),
    (@hsr_id, '崩壊：スターレイル', 'ja'),
    (@hsr_id, '星铁', 'nickname'),
    (
        @hsr_id,
        'benghuai_xingqiong_tiedao',
        'pinyin'
    );

-- ===============================================================
--  为角色“流萤” (Firefly) 生成标签和别名测试数据
-- ===============================================================

-- --- 步骤 1: 创建“流萤”概念 ---
INSERT INTO
    `tags` (`name`, `primary_name_en`)
VALUES ('流萤', 'firefly');

-- --- 步骤 2: 获取ID ---
SET @firefly_id = LAST_INSERT_ID();

-- --- 步骤 3: 添加别名 ---
INSERT INTO
    `tag_aliases` (`tag_id`, `name`, `lang`)
VALUES (@firefly_id, '流萤', 'zh'),
    (@firefly_id, 'Firefly', 'en'),
    (@firefly_id, 'ホタル', 'ja'),
    (@firefly_id, '萨姆', 'nickname'), -- 另一个重要身份
    (
        @firefly_id,
        'Sam',
        'nickname'
    ),
    (
        @firefly_id,
        'liuying',
        'pinyin'
    );

-- ===============================================================
--  为游戏“崩坏3” (Honkai Impact 3rd) 生成标签和别名测试数据
-- ===============================================================

-- --- 步骤 1: 创建“崩坏3”概念 ---
INSERT INTO
    `tags` (`name`, `primary_name_en`)
VALUES ('崩坏3', 'honkai_impact_3rd');

-- --- 步骤 2: 获取ID ---
SET @hi3_id = LAST_INSERT_ID();

-- --- 步骤 3: 添加别名 ---
INSERT INTO
    `tag_aliases` (`tag_id`, `name`, `lang`)
VALUES (@hi3_id, '崩坏3', 'zh'),
    (
        @hi3_id,
        'Honkai Impact 3rd',
        'en'
    ),
    (@hi3_id, '崩壊3rd', 'ja'),
    (@hi3_id, '崩崩崩', 'nickname'),
    (
        @hi3_id,
        'benghuai_3',
        'pinyin'
    );

-- ===============================================================
--  为游戏“原神” (Genshin Impact) 生成标签和别名测试数据
-- ===============================================================

-- --- 步骤 1: 创建“原神”概念 ---
INSERT INTO
    `tags` (`name`, `primary_name_en`)
VALUES ('原神', 'genshin_impact');

-- --- 步骤 2: 获取ID ---
SET @genshin_id = LAST_INSERT_ID();

-- --- 步骤 3: 添加别名 ---
INSERT INTO
    `tag_aliases` (`tag_id`, `name`, `lang`)
VALUES (@genshin_id, '原神', 'zh'),
    (
        @genshin_id,
        'Genshin Impact',
        'en'
    ),
    (@genshin_id, '原神', 'ja'),
    (@genshin_id, '启动', 'nickname'), -- 社区流行梗
    (
        @genshin_id,
        'yuanshen',
        'pinyin'
    );

-- ===============================================================
--  为角色“珊瑚宫心海” (Sangonomiya Kokomi) 生成标签和别名测试数据
-- ===============================================================

-- --- 步骤 1: 创建“珊瑚宫心海”概念 ---
INSERT INTO
    `tags` (`name`, `primary_name_en`)
VALUES ('珊瑚宫心海', 'sangonomiya_kokomi');

-- --- 步骤 2: 获取ID ---
SET @kokomi_id = LAST_INSERT_ID();

-- --- 步骤 3: 添加别名 ---
INSERT INTO
    `tag_aliases` (`tag_id`, `name`, `lang`)
VALUES (@kokomi_id, '珊瑚宫心海', 'zh'),
    (
        @kokomi_id,
        'Sangonomiya Kokomi',
        'en'
    ),
    (@kokomi_id, '珊瑚宮心海', 'ja'),
    (@kokomi_id, '心海', 'nickname'),
    (@kokomi_id, '观赏鱼', 'nickname'), -- 社区昵称
    (
        @kokomi_id,
        'shanhu_gong_xinhai',
        'pinyin'
    );

-- --- 验证 (可选) ---
-- 查询所有刚刚插入的数据，以作验证
SELECT t.id AS concept_id, t.primary_name_en, ta.name AS alias_name, ta.lang
FROM tags t
    JOIN tag_aliases ta ON t.id = ta.tag_id
WHERE
    t.primary_name_en IN (
        'honkai_star_rail',
        'firefly',
        'honkai_impact_3rd',
        'genshin_impact',
        'sangonomiya_kokomi'
    );