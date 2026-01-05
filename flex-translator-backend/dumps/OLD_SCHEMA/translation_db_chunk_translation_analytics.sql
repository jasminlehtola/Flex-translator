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
-- Table structure for table `chunk_translation_analytics`
--

DROP TABLE IF EXISTS `chunk_translation_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chunk_translation_analytics` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `textId` int NOT NULL,
  `chunkId` int NOT NULL,
  `optionKey` varchar(255) NOT NULL,
  `pastedText` text NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chunkId` (`chunkId`),
  KEY `chunk_translation_analytics_ibfk_1` (`textId`),
  CONSTRAINT `chunk_translation_analytics_ibfk_1` FOREIGN KEY (`textId`) REFERENCES `text` (`id`),
  CONSTRAINT `chunk_translation_analytics_ibfk_2` FOREIGN KEY (`chunkId`) REFERENCES `chunk` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chunk_translation_analytics`
--

LOCK TABLES `chunk_translation_analytics` WRITE;
/*!40000 ALTER TABLE `chunk_translation_analytics` DISABLE KEYS */;
INSERT INTO `chunk_translation_analytics` VALUES ('063aad79-cde0-11ef-85d0-2800afc44358',6,14,'DeepL','Here is an example of a page translated into Finnish. Not everything is translated, but this first paragraph is a demo of the translation.\n\n\n\n','2025-01-08 16:45:53'),('15ee62df-cde0-11ef-85d0-2800afc44358',6,14,'DeepL','A perplexing trend in recent years has been that many manufacturing industry companies also claim to be software companies!\n\n\n','2025-01-08 16:46:19'),('2125bb00-cde0-11ef-85d0-2800afc44358',6,14,'ChatGPT','## Software is Vast and Complex\n\n\n','2025-01-08 16:46:38'),('3e982f5a-cddf-11ef-85d0-2800afc44358',15,64,'ChatGPT','Kirk\'s career spanned over 40 years with hardly any interruptions. He began singing in 1964 with the band The Creatures, although they never recorded any albums. He transitioned to a solo career in 1967, making his breakthrough with the song \"The Moment Strikes\" released that same year. This was followed by numerous hits until the mid-1970s, including \"Kites\" and \"By the Riverbank.\" Kirk experienced a resurgence in 1984 when he represented the UK in the Eurovision Song Contest with the song \"Let\'s Hang Out,\" and his album of the same name went gold. Between 1986 and 1987, Kirk recorded English-language hard rock but soon returned to recording pop songs in English. Kirk won the 1988 Autumn Melody competition with the song \"Wiping Tears from Your Eyes,\" and the accompanying album achieved quintuple platinum status. This marked the start of the most successful period of his career, during which he released several gold and platinum records. Around the turn of the millennium, Kirk was part of the popular Masters ensemble. His final album was released in 2005.\n\n','2025-01-08 16:40:18'),('48573f1d-d991-11ef-a33a-2800afc44358',10,58,'ChatGPT','In folklore from around the globe, stories of hidden treasures have been preserved. Many of these tales associate treasures with hauntings or other enigmatic and mysterious occurrences, and sometimes they even relate to entirely historical facts. A ghost, spirit, or dragon might guard the treasure. The guardian of the treasure could set a challenge that the seeker must solve to claim the treasure. Treasures are often carefully hidden, for example, in a cave, under a stone, or underground. In English tradition, for instance, there are tales of money treasures buried inside pots, with will-o\'-the-wisps flickering above them.\n\n\n','2025-01-23 13:52:27'),('94b1a8ba-d993-11ef-a33a-2800afc44358',11,59,'ChatGPT','A custom-made mouthguard, crafted from a dental impression, is significantly more expensive than one purchased from a store. These unique mouthguards are more user-friendly and provide better protection against frontal impacts. Mouthguards made from dental impressions are recommended for adult users whose teeth are no longer developing. Source?\n\n','2025-01-23 14:08:54'),('a4c3b0c9-d992-11ef-a33a-2800afc44358',11,59,'ChatGPT','A mouthguard is always custom-fitted. Plastic mouthguards purchased from a store can be molded by placing them in hot water for a short time and then fitting them onto the upper teeth. The mouthguard is shaped to fit snugly by sucking the air out from between the guard and the teeth and pressing it firmly against the gums with the tongue. If necessary, the shaping process can be repeated by reheating the mouthguard. Source?\n\n\n','2025-01-23 14:02:12'),('d1051dbd-cddf-11ef-85d0-2800afc44358',15,64,'ChatGPT','Kirka (real name Kirill Babitzin, September 22, 1950, Helsinki – January 31, 2007, Helsinki) was a Finnish singer. He was one of Finland\'s most popular rock and pop singers, with over a million records sold. Throughout his career, Kirka was awarded five Emma Awards.\n\n\n','2025-01-08 16:44:23'),('ddc1fb51-cddf-11ef-85d0-2800afc44358',6,14,'ChatGPT','# Motivation / Background\n\n\n','2025-01-08 16:44:45');
/*!40000 ALTER TABLE `chunk_translation_analytics` ENABLE KEYS */;
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
