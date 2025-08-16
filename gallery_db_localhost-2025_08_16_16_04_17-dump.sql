-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gallery_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `image_tags`
--

DROP TABLE IF EXISTS `image_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_tags` (
  `image_id` int unsigned NOT NULL COMMENT '图片ID',
  `tag_id` int unsigned NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`image_id`,`tag_id`),
  KEY `fk_tag` (`tag_id`),
  CONSTRAINT `fk_image` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片与标签关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_tags`
--

LOCK TABLES `image_tags` WRITE;
/*!40000 ALTER TABLE `image_tags` DISABLE KEYS */;
INSERT INTO `image_tags` (`image_id`, `tag_id`) VALUES (13,18),(13,31),(12,32),(14,32),(12,33),(14,33);
/*!40000 ALTER TABLE `image_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '图片唯一ID',
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始文件名',
  `filepath` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '服务器存储路径',
  `filesize` int unsigned NOT NULL COMMENT '文件大小 (Bytes)',
  `source_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图片来源网址 (可选)',
  `file_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件内容的SHA256哈希值',
  `width` int unsigned DEFAULT '0' COMMENT '图片宽度 (px)',
  `height` int unsigned DEFAULT '0' COMMENT '图片高度 (px)',
  `aspect_ratio` decimal(10,4) NOT NULL COMMENT '宽高比 (width/height)',
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_filepath` (`filepath`),
  UNIQUE KEY `idx_file_hash` (`file_hash`),
  KEY `idx_aspect_ratio` (`aspect_ratio`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` (`id`, `filename`, `filepath`, `filesize`, `source_url`, `file_hash`, `width`, `height`, `aspect_ratio`, `uploaded_at`) VALUES (12,'genshin_kokomi_c6cbaf.jpg','images/genshin_kokomi_c6cbaf.jpg',694407,'','07714aec8f66dc197a0651fb015f0b9940dfdef2e09d32d736ac385ee4efdab3',2000,1151,1.7376,'2025-08-16 05:25:00'),(13,'honkai3_elysia_da211f.png','images/honkai3_elysia_da211f.png',10170134,'','4602b5c85a3f305464cee3e11096b68476892dae6ba526f90831ef48a3098bd4',15360,8640,1.7778,'2025-08-16 05:25:25'),(14,'genshin_kokomi_c6ca41.jpg','images/genshin_kokomi_c6ca41.jpg',3922299,'','3e5a3d5bcb5785d93ac4fb2bb2ada8e328e2ed210aec2b3eb512e97d6116cd1b',6145,4069,1.5102,'2025-08-16 05:45:03');
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag_aliases`
--

DROP TABLE IF EXISTS `tag_aliases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag_aliases` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tag_id` int unsigned NOT NULL COMMENT '关联的标签概念ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '别名/翻译名/昵称',
  `lang` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '语言或类型 (en, zh, ja, pinyin, nickname)',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `fk_alias_tag` (`tag_id`),
  CONSTRAINT `fk_alias_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签别名与多语言表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag_aliases`
--

LOCK TABLES `tag_aliases` WRITE;
/*!40000 ALTER TABLE `tag_aliases` DISABLE KEYS */;
INSERT INTO `tag_aliases` (`id`, `tag_id`, `name`, `lang`) VALUES (1,18,'爱莉希雅','zh'),(2,18,'Elysia','en'),(3,18,'エリシア','ja'),(4,18,'爱莉','nickname'),(5,18,'ailixiya','pinyin'),(6,18,'人之律者','nickname'),(20,29,'崩坏星穹铁道','zh'),(21,29,'Star Rail','en'),(22,29,'崩壊スターレイル','ja'),(23,29,'星铁','nickname'),(24,29,'benghuai_xingqiong_tiedao','pinyin'),(25,30,'流萤','zh'),(26,30,'Firefly','en'),(27,30,'ホタル','ja'),(28,30,'萨姆','nickname'),(29,30,'Sam','nickname'),(30,30,'liuying','pinyin'),(31,31,'崩坏3','zh'),(32,31,'Honkai3','en'),(33,31,'崩壊3rd','ja'),(34,31,'崩崩崩','nickname'),(35,31,'benghuai_3','pinyin'),(36,32,'原神','zh'),(38,32,'原神','ja'),(40,32,'yuanshen','pinyin'),(41,33,'珊瑚宫心海','zh'),(42,33,'Kokomi','en'),(43,33,'珊瑚宮心海','ja'),(44,33,'心海','nickname'),(45,33,'观赏鱼','nickname'),(46,33,'shanhu_gong_xinhai','pinyin'),(47,29,'崩铁','nickname'),(48,31,'崩坏三','nickname'),(49,31,'崩三','nickname'),(50,31,'Honkai Impact 3rd','nickname'),(51,32,'Genshin Impact','nickname'),(52,32,'Genshin','en'),(53,29,'Honkai Star Rail','nickname'),(54,33,'Sangonomiya Kokomi','nickname');
/*!40000 ALTER TABLE `tag_aliases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '标签唯一ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称',
  `primary_name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签的英文主名，用于程序关联',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_name` (`name`),
  UNIQUE KEY `idx_primary_name_en` (`primary_name_en`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` (`id`, `name`, `primary_name_en`) VALUES (18,'爱莉希雅','elysia'),(29,'崩坏：星穹铁道','honkai_star_rail'),(30,'流萤','firefly'),(31,'崩坏3','honkai_impact_3rd'),(32,'原神','genshin_impact'),(33,'珊瑚宫心海','sangonomiya_kokomi');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-16 16:04:17
