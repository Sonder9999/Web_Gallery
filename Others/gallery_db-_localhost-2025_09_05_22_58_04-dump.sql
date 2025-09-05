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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
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
  `parent_id` int unsigned DEFAULT NULL COMMENT '父标签ID，形成层级关系',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_name` (`name`),
  UNIQUE KEY `idx_primary_name_en` (`primary_name_en`),
  KEY `fk_parent_tag` (`parent_id`),
  CONSTRAINT `fk_parent_tag` FOREIGN KEY (`parent_id`) REFERENCES `tags` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
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

-- Dump completed on 2025-09-05 22:58:04
