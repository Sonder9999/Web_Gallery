-- 角色标签数据库插入语句
-- 生成时间: 2025-09-05 23:26:19.351146
-- 数据来源: Easy_CharacterList.md

-- 注意: 执行前请备份数据库！

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 插入游戏: 原神
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (101, '原神', 'genshin_impact', NULL);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1001, 101, '原神', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1002, 101, 'Genshin Impact', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1003, 101, 'yuanshen', 'pinyin');

-- 插入分类: 角色 (隶属于 原神)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (102, '角色', 'character', 101);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1004, 102, '角色', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1005, 102, 'Character', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1006, 102, 'キャラクター', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1007, 102, 'jiaose', 'pinyin');

-- 插入角色: 荧 (隶属于 角色)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (103, '荧', 'lumine', 102);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1008, 103, '荧', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1009, 103, 'Lumine', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1010, 103, '蛍', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1011, 103, 'ying', 'pinyin');

-- 插入角色: 空 (隶属于 角色)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (104, '空', 'aether', 102);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1012, 104, '空', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1013, 104, 'Aether', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1014, 104, 'kong', 'pinyin');

-- 插入角色: 派蒙 (隶属于 角色)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (105, '派蒙', 'paimon', 102);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1015, 105, '派蒙', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1016, 105, 'Paimon', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1017, 105, 'パイモン', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1018, 105, 'paimeng', 'pinyin');

-- 插入分类: 蒙德 (隶属于 原神)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (106, '蒙德', 'mondstadt', 101);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1019, 106, '蒙德', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1020, 106, 'Mondstadt', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1021, 106, 'モンド', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1022, 106, 'mengde', 'pinyin');

-- 插入角色: 芭芭拉 (隶属于 蒙德)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (107, '芭芭拉', 'barbara', 106);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1023, 107, '芭芭拉', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1024, 107, 'Barbara', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1025, 107, 'バーバラ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1026, 107, 'babala', 'pinyin');

-- 插入分类: 璃月 (隶属于 原神)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (108, '璃月', 'liyue', 101);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1027, 108, '璃月', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1028, 108, 'Liyue', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1029, 108, 'liyue', 'pinyin');

-- 插入角色: 钟离 (隶属于 璃月)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (109, '钟离', 'zhongli', 108);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1030, 109, '钟离', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1031, 109, 'Zhongli', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1032, 109, '鍾離', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1033, 109, 'zhongli', 'pinyin');

-- 插入角色: 甘雨 (隶属于 璃月)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (110, '甘雨', 'ganyu', 108);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1034, 110, '甘雨', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1035, 110, 'Ganyu', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1036, 110, 'ganyu', 'pinyin');

-- 插入角色: 凝光 (隶属于 璃月)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (111, '凝光', 'ningguang', 108);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1037, 111, '凝光', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1038, 111, 'Ningguang', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1039, 111, 'ningguang', 'pinyin');

-- 插入角色: 刻晴 (隶属于 璃月)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (112, '刻晴', 'keqing', 108);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1040, 112, '刻晴', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1041, 112, 'Keqing', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1042, 112, 'keqing', 'pinyin');

-- 插入分类: 稻妻 (隶属于 原神)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (113, '稻妻', 'inazuma', 101);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1043, 113, '稻妻', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1044, 113, 'Inazuma', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1045, 113, '稲妻', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1046, 113, 'daoqi', 'pinyin');

-- 插入角色: 雷电将军 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (114, '雷电将军', 'raiden_shogun', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1047, 114, '雷电将军', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1048, 114, 'Raiden Shogun', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1049, 114, '雷電将軍', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1050, 114, 'leidianjianjun', 'pinyin');

-- 插入角色: 宵宫 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (115, '宵宫', 'yoimiya', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1051, 115, '宵宫', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1052, 115, 'Yoimiya', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1053, 115, '宵宮', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1054, 115, 'xiaogong', 'pinyin');

-- 插入角色: 八重神子 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (116, '八重神子', 'yae_miko', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1055, 116, '八重神子', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1056, 116, 'Yae Miko', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1057, 116, 'bazhongshenzi', 'pinyin');

-- 插入角色: 神里绫华 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (117, '神里绫华', 'kamisato_ayaka', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1058, 117, '神里绫华', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1059, 117, 'Kamisato Ayaka', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1060, 117, '神里綾華', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1061, 117, 'shenlilinghua', 'pinyin');

-- 插入角色: 五郎 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (118, '五郎', 'gorou', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1062, 118, '五郎', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1063, 118, 'Gorou', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1064, 118, 'ゴロー', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1065, 118, 'wulang', 'pinyin');

-- 插入角色: 胡桃 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (119, '胡桃', 'hu_tao', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1066, 119, '胡桃', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1067, 119, 'Hu Tao', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1068, 119, 'hutao', 'pinyin');

-- 插入角色: 枫原万叶 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (120, '枫原万叶', 'kaedehara_kazuha', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1069, 120, '枫原万叶', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1070, 120, 'Kaedehara Kazuha', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1071, 120, '楓原万葉', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1072, 120, 'fengyuanwanye', 'pinyin');

-- 插入角色: 早柚 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (121, '早柚', 'sayu', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1073, 121, '早柚', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1074, 121, 'Sayu', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1075, 121, 'zaoyu', 'pinyin');

-- 插入角色: 九条裟罗 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (122, '九条裟罗', 'kujou_sara', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1076, 122, '九条裟罗', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1077, 122, 'Kujou Sara', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1078, 122, '九条裟羅', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1079, 122, 'jiutiaoshaluo', 'pinyin');

-- 插入角色: 鹿野院平藏 (隶属于 稻妻)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (123, '鹿野院平藏', 'shikanoin_heizou', 113);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1080, 123, '鹿野院平藏', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1081, 123, 'Shikanoin Heizou', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1082, 123, '鹿野院平蔵', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1083, 123, 'luyeyuanpingcang', 'pinyin');

-- 插入分类: 枫丹 (隶属于 原神)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (124, '枫丹', 'fontaine', 101);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1084, 124, '枫丹', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1085, 124, 'Fontaine', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1086, 124, 'フォンテーヌ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1087, 124, 'fengdan', 'pinyin');

-- 插入角色: 芙宁娜 (隶属于 枫丹)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (125, '芙宁娜', 'furina', 124);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1088, 125, '芙宁娜', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1089, 125, 'Furina', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1090, 125, 'フリーナ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1091, 125, 'funingna', 'pinyin');

-- 插入分类: 纳塔 (隶属于 原神)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (126, '纳塔', 'natlan', 101);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1092, 126, '纳塔', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1093, 126, 'Natlan', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1094, 126, 'ナタ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1095, 126, 'nata', 'pinyin');

-- 插入角色: 丝柯克 (隶属于 纳塔)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (127, '丝柯克', 'xilonen', 126);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1096, 127, '丝柯克', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1097, 127, 'Xilonen', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1098, 127, 'シロネン', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1099, 127, 'sikeke', 'pinyin');

-- 插入角色: 茜特菈莉 (隶属于 纳塔)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (128, '茜特菈莉', 'citlali', 126);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1100, 128, '茜特菈莉', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1101, 128, 'Citlali', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1102, 128, 'シトラリ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1103, 128, 'qiantelali', 'pinyin');

-- 插入游戏: 崩坏:星穹铁道
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (129, '崩坏:星穹铁道', 'honkai_star_rail', NULL);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1104, 129, '崩坏:星穹铁道', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1105, 129, 'Honkai: Star Rail', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1106, 129, '崩壊：スターレイル', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1107, 129, 'benghuaixingqiongtiedao', 'pinyin');

-- 插入角色: 星 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (130, '星', 'stelle', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1108, 130, '星', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1109, 130, 'Stelle', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1110, 130, 'xing', 'pinyin');

-- 插入角色: 海瑟音 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (131, '海瑟音', 'hestia', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1111, 131, '海瑟音', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1112, 131, 'Hestia', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1113, 131, 'ヘスティア', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1114, 131, 'haiseyin', 'pinyin');

-- 插入角色: 刻律德菈 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (132, '刻律德菈', 'cerydra', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1115, 132, '刻律德菈', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1116, 132, 'Cerydra', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1117, 132, 'ケリュドラ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1118, 132, 'kelüdela', 'pinyin');

-- 插入角色: Saber (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (133, 'Saber', 'saber', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1119, 133, 'Saber', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1120, 133, 'セイバー', 'ja');

-- 插入角色: 风堇 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (134, '风堇', 'bronya', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1121, 134, '风堇', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1122, 134, 'Bronya', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1123, 134, 'ブローニャ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1124, 134, 'fengjin', 'pinyin');

-- 插入角色: 遐蝶 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (135, '遐蝶', 'sunday', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1125, 135, '遐蝶', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1126, 135, 'Sunday', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1127, 135, 'サンデー', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1128, 135, 'xiadie', 'pinyin');

-- 插入角色: 黑塔 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (136, '黑塔', 'herta', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1129, 136, '黑塔', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1130, 136, 'Herta', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1131, 136, 'ヘルタ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1132, 136, 'heita', 'pinyin');

-- 插入角色: 大黑塔 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (137, '大黑塔', 'herta_puppet', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1133, 137, '大黑塔', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1134, 137, 'Herta (Puppet)', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1135, 137, 'ヘルタ人形', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1136, 137, 'daheita', 'pinyin');

-- 插入角色: 忘归人 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (138, '忘归人', 'feixiao', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1137, 138, '忘归人', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1138, 138, 'Feixiao', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1139, 138, '飛霄', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1140, 138, 'wangguiren', 'pinyin');

-- 插入角色: 灵砂 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (139, '灵砂', 'lingsha', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1141, 139, '灵砂', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1142, 139, 'Lingsha', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1143, 139, '霊砂', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1144, 139, 'lingsha', 'pinyin');

-- 插入角色: 云璃 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (140, '云璃', 'yunli', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1145, 140, '云璃', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1146, 140, 'Yunli', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1147, 140, '雲璃', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1148, 140, 'yunli', 'pinyin');

-- 插入角色: 流萤 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (141, '流萤', 'firefly', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1149, 141, '流萤', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1150, 141, 'Firefly', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1151, 141, '流蛍', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1152, 141, 'liuying', 'pinyin');

-- 插入角色: 知更鸟 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (142, '知更鸟', 'robin', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1153, 142, '知更鸟', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1154, 142, 'Robin', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1155, 142, '知更鳥', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1156, 142, 'zhigengniao', 'pinyin');

-- 插入角色: 黄泉 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (143, '黄泉', 'acheron', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1157, 143, '黄泉', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1158, 143, 'Acheron', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1159, 143, 'huangquan', 'pinyin');

-- 插入角色: 花火 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (144, '花火', 'sparkle', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1160, 144, '花火', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1161, 144, 'Sparkle', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1162, 144, 'huahuo', 'pinyin');

-- 插入角色: 藿藿 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (145, '藿藿', 'huohuo', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1163, 145, '藿藿', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1164, 145, 'Huohuo', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1165, 145, 'フォフォ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1166, 145, 'huohuo', 'pinyin');

-- 插入角色: 阮•梅 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (146, '阮•梅', 'ruan_mei', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1167, 146, '阮•梅', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1168, 146, 'Ruan Mei', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1169, 146, 'ルアン・メイ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1170, 146, 'ruanmei', 'pinyin');

-- 插入角色: 符玄 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (147, '符玄', 'fu_xuan', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1171, 147, '符玄', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1172, 147, 'Fu Xuan', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1173, 147, 'fuxuan', 'pinyin');

-- 插入角色: 停云 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (148, '停云', 'tingyun', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1174, 148, '停云', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1175, 148, 'Tingyun', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1176, 148, '停雲', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1177, 148, 'tingyun', 'pinyin');

-- 插入角色: 克拉拉 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (149, '克拉拉', 'clara', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1178, 149, '克拉拉', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1179, 149, 'Clara', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1180, 149, 'クララ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1181, 149, 'kelala', 'pinyin');

-- 插入角色: 希儿 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (150, '希儿', 'seele', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1182, 150, '希儿', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1183, 150, 'Seele', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1184, 150, 'ゼーレ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1185, 150, 'xier', 'pinyin');

-- 插入角色: 三月七 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (151, '三月七', 'march_7th', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1186, 151, '三月七', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1187, 151, 'March 7th', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1188, 151, '三月なのか', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1189, 151, 'sanyueqi', 'pinyin');

-- 插入角色: 艾丝妲 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (152, '艾丝妲', 'asta', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1190, 152, '艾丝妲', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1191, 152, 'Asta', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1192, 152, 'アスター', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1193, 152, 'aisida', 'pinyin');

-- 插入角色: 昔涟 (隶属于 崩坏:星穹铁道)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (153, '昔涟', 'xier', 129);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1194, 153, '昔涟', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1195, 153, 'Xier', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1196, 153, 'シエル', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1197, 153, 'xilian', 'pinyin');

-- 插入游戏: 崩坏三
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (154, '崩坏三', 'honkai_impact_3rd', NULL);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1198, 154, '崩坏三', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1199, 154, 'Honkai Impact 3rd', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1200, 154, '崩壊3rd', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1201, 154, 'benghuaisan', 'pinyin');

-- 插入分类: 琪亚娜·卡斯兰娜 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (155, '琪亚娜·卡斯兰娜', 'kiana_kaslana', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1202, 155, '琪亚娜·卡斯兰娜', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1203, 155, 'Kiana Kaslana', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1204, 155, 'キアナ・カスラナ', 'ja');

-- 插入角色: 终焉之律者 (隶属于 琪亚娜·卡斯兰娜)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (156, '终焉之律者', 'herrscher_of_finality', 155);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1205, 156, '终焉之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1206, 156, 'Herrscher of Finality', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1207, 156, '終焉の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1208, 156, 'zhongyanzhilvzhe', 'pinyin');

-- 插入角色: 薪炎之律者 (隶属于 琪亚娜·卡斯兰娜)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (157, '薪炎之律者', 'herrscher_of_flamescion', 155);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1209, 157, '薪炎之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1210, 157, 'Herrscher of Flamescion', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1211, 157, '薪炎の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1212, 157, 'xinyanzhilvzhe', 'pinyin');

-- 插入角色: 空之律者 (隶属于 琪亚娜·卡斯兰娜)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (158, '空之律者', 'herrscher_of_the_void', 155);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1213, 158, '空之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1214, 158, 'Herrscher of the Void', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1215, 158, '空の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1216, 158, 'kongzhilvzhe', 'pinyin');

-- 插入分类: 雷电芽衣 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (159, '雷电芽衣', 'raiden_mei', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1217, 159, '雷电芽衣', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1218, 159, 'Raiden Mei', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1219, 159, '雷電芽衣', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1220, 159, 'ledianyayi', 'pinyin');

-- 插入角色: 始源之律者 (隶属于 雷电芽衣)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (160, '始源之律者', 'herrscher_of_origin', 159);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1221, 160, '始源之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1222, 160, 'Herrscher of Origin', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1223, 160, '始源の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1224, 160, 'shiyuanzhilvzhe', 'pinyin');

-- 插入角色: 断罪影舞 (隶属于 雷电芽衣)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (161, '断罪影舞', 'shadow_dash', 159);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1225, 161, '断罪影舞', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1226, 161, 'Shadow Dash', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1227, 161, 'duanzuiyingwu', 'pinyin');

-- 插入角色: 雷之律者 (隶属于 雷电芽衣)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (162, '雷之律者', 'herrscher_of_thunder', 159);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1228, 162, '雷之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1229, 162, 'Herrscher of Thunder', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1230, 162, '雷の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1231, 162, 'leizhilvzhe', 'pinyin');

-- 插入角色: 破晓强袭 (隶属于 雷电芽衣)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (163, '破晓强袭', 'striker_fulminata', 159);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1232, 163, '破晓强袭', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1233, 163, 'Striker Fulminata', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1234, 163, '破暁強襲', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1235, 163, 'poxiaoqiangxi', 'pinyin');

-- 插入分类: 布洛妮娅·扎伊切克 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (164, '布洛妮娅·扎伊切克', 'bronya_zaychik', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1236, 164, '布洛妮娅·扎伊切克', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1237, 164, 'Bronya Zaychik', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1238, 164, 'ブロニャ・ザイチク', 'ja');

-- 插入角色: 真理之律者 (隶属于 布洛妮娅·扎伊切克)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (165, '真理之律者', 'herrscher_of_truth', 164);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1239, 165, '真理之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1240, 165, 'Herrscher of Truth', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1241, 165, '真理の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1242, 165, 'zhenglizhilvzhe', 'pinyin');

-- 插入角色: 次生银翼 (隶属于 布洛妮娅·扎伊切克)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (166, '次生银翼', 'silverwing_n_ex', 164);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1243, 166, '次生银翼', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1244, 166, 'Silverwing: N-EX', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1245, 166, '次元の銀翼', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1246, 166, 'cishengyinyi', 'pinyin');

-- 插入角色: 迷城骇兔 (隶属于 布洛妮娅·扎伊切克)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (167, '迷城骇兔', 'haxxor_bunny', 164);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1247, 167, '迷城骇兔', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1248, 167, 'Haxxor Bunny', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1249, 167, '迷城駭兎', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1250, 167, 'michenghaitu', 'pinyin');

-- 插入角色: 理之律者 (隶属于 布洛妮娅·扎伊切克)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (168, '理之律者', 'herrscher_of_reason', 164);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1251, 168, '理之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1252, 168, 'Herrscher of Reason', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1253, 168, '理の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1254, 168, 'lizhilvzhe', 'pinyin');

-- 插入分类: 八重樱 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (169, '八重樱', 'yae_sakura', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1255, 169, '八重樱', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1256, 169, 'Yae Sakura', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1257, 169, '八重桜', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1258, 169, 'bazhongying', 'pinyin');

-- 插入角色: 夜隐重霞 (隶属于 八重樱)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (170, '夜隐重霞', 'darkbolt_jonin', 169);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1259, 170, '夜隐重霞', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1260, 170, 'Darkbolt Jonin', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1261, 170, '夜隠重霞', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1262, 170, 'yeyinzhongxia', 'pinyin');

-- 插入角色: 真炎幸魂 (隶属于 八重樱)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (171, '真炎幸魂', 'flame_sakitama', 169);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1263, 171, '真炎幸魂', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1264, 171, 'Flame Sakitama', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1265, 171, 'zhengyanxinghun', 'pinyin');

-- 插入角色: 逆神巫女 (隶属于 八重樱)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (172, '逆神巫女', 'miko', 169);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1266, 172, '逆神巫女', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1267, 172, 'Miko', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1268, 172, 'nishenwunü', 'pinyin');

-- 插入角色: 御神装·勿忘 (隶属于 八重樱)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (173, '御神装·勿忘', 'memento', 169);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1269, 173, '御神装·勿忘', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1270, 173, 'Memento', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1271, 173, '御神装・勿忘', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1272, 173, 'yushenzhuangwuwang', 'pinyin');

-- 插入分类: 希儿·芙乐艾 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (174, '希儿·芙乐艾', 'seele_vollerei', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1273, 174, '希儿·芙乐艾', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1274, 174, 'Seele Vollerei', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1275, 174, 'ゼーレ・フェレライ', 'ja');

-- 插入角色: 死生之律者 (隶属于 希儿·芙乐艾)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (175, '死生之律者', 'herrscher_of_rebirth', 174);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1276, 175, '死生之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1277, 175, 'Herrscher of Rebirth', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1278, 175, '死生の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1279, 175, 'sishengzhilvzhe', 'pinyin');

-- 插入角色: 魇夜星渊 (隶属于 希儿·芙乐艾)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (176, '魇夜星渊', 'stygian_nymph', 174);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1280, 176, '魇夜星渊', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1281, 176, 'Stygian Nymph', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1282, 176, '夢夜星淵', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1283, 176, 'yanyexingyuan', 'pinyin');

-- 插入角色: 彼岸双生 (隶属于 希儿·芙乐艾)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (177, '彼岸双生', 'swallowtail_phantasm', 174);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1284, 177, '彼岸双生', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1285, 177, 'Swallowtail Phantasm', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1286, 177, 'bianshuangsheng', 'pinyin');

-- 插入角色: 幻海梦蝶 (隶属于 希儿·芙乐艾)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (178, '幻海梦蝶', 'starchasm_nyx', 174);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1287, 178, '幻海梦蝶', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1288, 178, 'Starchasm Nyx', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1289, 178, '幻海夢蝶', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1290, 178, 'huanhaimengdie', 'pinyin');

-- 插入分类: 爱莉希雅 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (179, '爱莉希雅', 'elysia', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1291, 179, '爱莉希雅', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1292, 179, 'Elysia', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1293, 179, 'エリシア', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1294, 179, 'ailixiya', 'pinyin');

-- 插入角色: 真我·人之律者 (隶属于 爱莉希雅)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (180, '真我·人之律者', 'herrscher_of_human_ego', 179);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1295, 180, '真我·人之律者', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1296, 180, 'Herrscher of Human: Ego', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1297, 180, '真我・人の律者', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1298, 180, 'zhenwurenzhilvzhe', 'pinyin');

-- 插入角色: 粉色妖精小姐♪ (隶属于 爱莉希雅)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (181, '粉色妖精小姐♪', 'miss_pink_elf', 179);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1299, 181, '粉色妖精小姐♪', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1300, 181, 'Miss Pink Elf', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1301, 181, 'ピンクの妖精お嬢様♪', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1302, 181, 'fenseyaojingxiaojie', 'pinyin');

-- 插入分类: 梅比乌斯 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (182, '梅比乌斯', 'mobius', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1303, 182, '梅比乌斯', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1304, 182, 'Mobius', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1305, 182, 'メビウス', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1306, 182, 'meibiwusi', 'pinyin');

-- 插入角色: 无限·噬界之蛇 (隶属于 梅比乌斯)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (183, '无限·噬界之蛇', 'infinite_ouroboros', 182);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1307, 183, '无限·噬界之蛇', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1308, 183, 'Infinite Ouroboros', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1309, 183, '無限・噬界の蛇', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1310, 183, 'wuxianshijiezhishe', 'pinyin');

-- 插入分类: 帕朵菲莉丝 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (184, '帕朵菲莉丝', 'pardofelis', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1311, 184, '帕朵菲莉丝', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1312, 184, 'Pardofelis', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1313, 184, 'パルドフェリス', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1314, 184, 'paduofeilisi', 'pinyin');

-- 插入角色: 空梦·掠集之兽 (隶属于 帕朵菲莉丝)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (185, '空梦·掠集之兽', 'reverist_calico', 184);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1315, 185, '空梦·掠集之兽', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1316, 185, 'Reverist Calico', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1317, 185, '空夢・掠集の獣', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1318, 185, 'kongmengluejizishuo', 'pinyin');

-- 插入分类: 伊甸 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (186, '伊甸', 'eden', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1319, 186, '伊甸', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1320, 186, 'Eden', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1321, 186, 'エデン', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1322, 186, 'yidian', 'pinyin');

-- 插入角色: 黄金·璀耀之歌 (隶属于 伊甸)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (187, '黄金·璀耀之歌', 'golden_diva', 186);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1323, 187, '黄金·璀耀之歌', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1324, 187, 'Golden Diva', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1325, 187, '黄金・璀耀の歌', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1326, 187, 'huangjincuiyaozhige', 'pinyin');

-- 插入分类: 格蕾修 (隶属于 崩坏三)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (188, '格蕾修', 'griseo', 154);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1327, 188, '格蕾修', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1328, 188, 'Griseo', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1329, 188, 'グレイシュ', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1330, 188, 'geleixiu', 'pinyin');

-- 插入角色: 繁星·绘世之卷 (隶属于 格蕾修)
INSERT INTO tags (id, name, primary_name_en, parent_id) VALUES (189, '繁星·绘世之卷', 'cosmic_expression', 188);
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1331, 189, '繁星·绘世之卷', 'zh');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1332, 189, 'Cosmic Expression', 'en');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1333, 189, '繁星・絵世の巻', 'ja');
INSERT INTO tag_aliases (id, tag_id, name, lang) VALUES (1334, 189, 'fanxinghuishizhijuan', 'pinyin');


SET FOREIGN_KEY_CHECKS = 1;
-- 插入完成
