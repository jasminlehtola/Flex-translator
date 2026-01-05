CREATE DATABASE  IF NOT EXISTS `translation_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `translation_db`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: translation_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `document`
--

DROP TABLE IF EXISTS `document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `owner_UID` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `text_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `document_ibfk_1` (`text_id`),
  CONSTRAINT `document_ibfk_1` FOREIGN KEY (`text_id`) REFERENCES `text` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
INSERT INTO `document` VALUES ('162ec5a6-cdde-11ef-85d0-2800afc44358','devTest','sdasdasda',15),('40b76eb2-9851-11ef-81d4-2800afc44358','devTest','asdasdasd',4),('43eef528-a0f4-11ef-93e6-2800afc44358','devTest','Test',14),('49996a9f-99d4-11ef-b84d-2800afc44358','devTest','hammassuoja',11),('66380076-985e-11ef-81d4-2800afc44358','devTest','tests',8),('78033964-9c28-11ef-a61b-2800afc44358','devTest','sdasd',12),('87c641e4-985d-11ef-81d4-2800afc44358','devTest','Test',6),('9c60a6d2-9862-11ef-81d4-2800afc44358','devTest','Testi ',10),('b2269789-9ce0-11ef-a145-2800afc44358','devTest','asdas',13),('bcd7f584-984c-11ef-81d4-2800afc44358','devTest','test',3),('db75336f-985d-11ef-81d4-2800afc44358','devTest','Real test 5',7),('e55f8e0b-985c-11ef-81d4-2800afc44358','devTest','Real data test',5),('e7730c67-985e-11ef-81d4-2800afc44358','devTest','Live demo',9);
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-23 16:32:13
