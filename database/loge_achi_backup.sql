-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: loge_achi_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'System Administrator','admin@loge.com','$2b$10$zOCM.DaaFc7M7hL7mwtbM.rrPomLCY9/Q.2Q/HpdtsbMVrs304FmO','2026-09-10 20:58:26','/uploads/profile-pictures/110166bc-b405-4342-a4c1-f4a7e1920aec.jpg');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  `added_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  UNIQUE KEY `uq_cart_items_product` (`cart_id`,`product_id`),
  KEY `fk_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_cart_items_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (29,1,21,3,'2026-09-28 00:48:34','2026-09-28 00:48:37');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `uq_carts_customer` (`customer_id`),
  CONSTRAINT `fk_carts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,4,'2026-09-10 12:15:51','2026-09-10 12:15:51'),(2,5,'2026-09-10 20:58:26','2026-09-10 20:58:26'),(3,6,'2026-09-20 03:17:07','2026-09-20 03:17:07'),(4,7,'2026-09-24 15:24:06','2026-09-24 15:24:06'),(5,8,'2026-09-28 02:57:56','2026-09-28 02:57:56'),(6,9,'2026-09-30 15:27:37','2026-09-30 15:27:37');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_category_id` bigint unsigned DEFAULT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_categories_name` (`category_name`),
  KEY `fk_categories_parent` (`parent_category_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_categories_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Fashion','Footwear and apparel','ACTIVE','2026-09-10 20:58:26','2026-09-10 20:58:26'),(2,NULL,'Electronics','Electronics category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(3,NULL,'Home & Living','Home & Living category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(4,NULL,'Wearables','Wearables category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(5,NULL,'Footwear','Footwear category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(6,NULL,'Home & Kitchen','Home & Kitchen category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(7,NULL,'Health & Beauty','Health & Beauty category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(8,NULL,'Computing','Computing category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(9,NULL,'Sports','Sports category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(10,NULL,'TV & Home Appliances','TV & Home Appliances category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(11,NULL,'Groceries','Groceries category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(12,NULL,'Accessories','Accessories category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(13,NULL,'Home Decor','Home Decor category','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courier_consignments`
--

DROP TABLE IF EXISTS `courier_consignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courier_consignments` (
  `consignment_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_order_id` bigint unsigned NOT NULL,
  `courier_name` varchar(50) NOT NULL DEFAULT 'STEADFAST',
  `tracking_code` varchar(100) NOT NULL,
  `consignment_status` varchar(50) NOT NULL DEFAULT 'BOOKED',
  `recipient_name` varchar(100) NOT NULL,
  `recipient_phone` varchar(30) NOT NULL,
  `recipient_address` text NOT NULL,
  `cod_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`consignment_id`),
  UNIQUE KEY `uq_courier_consignment_seller_order` (`seller_order_id`),
  CONSTRAINT `fk_consignment_seller_order` FOREIGN KEY (`seller_order_id`) REFERENCES `seller_orders` (`seller_order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courier_consignments`
--

LOCK TABLES `courier_consignments` WRITE;
/*!40000 ALTER TABLE `courier_consignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `courier_consignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_addresses`
--

DROP TABLE IF EXISTS `customer_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_addresses` (
  `address_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `recipient_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Bangladesh',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`address_id`),
  KEY `fk_customer_addresses_customer` (`customer_id`),
  CONSTRAINT `fk_customer_addresses_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_addresses`
--

LOCK TABLES `customer_addresses` WRITE;
/*!40000 ALTER TABLE `customer_addresses` DISABLE KEYS */;
INSERT INTO `customer_addresses` VALUES (1,4,'Home','Badhon Pain','01634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh',1,'2026-09-20 02:00:42','2026-09-20 02:00:42'),(2,5,NULL,'Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh',1,'2026-09-20 02:44:47','2026-09-20 02:44:47'),(3,6,'Home','Badhon Pain','+8801634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh',1,'2026-09-20 04:38:31','2026-09-20 04:38:31'),(4,7,'Home','Badhon Pain','Badhon Pain','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh',1,'2026-09-24 15:35:54','2026-09-24 15:35:54'),(5,8,'Home','BP Badhon','01534678911','Shewrapara, Dhaka',NULL,'Dhaka',NULL,'Bangladesh',1,'2026-09-28 02:59:21','2026-09-28 02:59:21');
/*!40000 ALTER TABLE `customer_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_notifications`
--

DROP TABLE IF EXISTS `customer_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_notifications` (
  `notification_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `notification_type` varchar(30) NOT NULL,
  `title` varchar(160) NOT NULL,
  `body` varchar(500) NOT NULL,
  `order_id` bigint unsigned DEFAULT NULL,
  `seller_order_id` bigint unsigned DEFAULT NULL,
  `seller_id` bigint unsigned DEFAULT NULL,
  `conversation_id` bigint unsigned DEFAULT NULL,
  `message_id` bigint unsigned DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  UNIQUE KEY `uq_customer_notifications_message` (`message_id`),
  KEY `fk_customer_notifications_order` (`order_id`),
  KEY `fk_customer_notifications_seller_order` (`seller_order_id`),
  KEY `fk_customer_notifications_seller` (`seller_id`),
  KEY `fk_customer_notifications_conversation` (`conversation_id`),
  KEY `idx_customer_notifications_unread` (`customer_id`,`is_read`,`created_at`),
  CONSTRAINT `fk_customer_notifications_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `seller_conversations` (`conversation_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_notifications_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_notifications_message` FOREIGN KEY (`message_id`) REFERENCES `seller_messages` (`message_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_notifications_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_notifications_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_notifications_seller_order` FOREIGN KEY (`seller_order_id`) REFERENCES `seller_orders` (`seller_order_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_customer_notifications_type` CHECK ((`notification_type` in (_utf8mb4'ORDER_STATUS',_utf8mb4'SELLER_REPLY')))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_notifications`
--

LOCK TABLES `customer_notifications` WRITE;
/*!40000 ALTER TABLE `customer_notifications` DISABLE KEYS */;
INSERT INTO `customer_notifications` VALUES (3,5,'SELLER_REPLY','New message from UrbanEdge Fashion','Discount Available Sir',NULL,NULL,5,1,5,1,'2026-10-01 01:38:51','2026-10-01 01:39:00'),(4,5,'ORDER_STATUS','UrbanEdge Fashion updated an order','Order #17 is now delivered.',17,28,5,NULL,NULL,1,'2026-10-01 01:40:15','2026-10-01 01:40:21');
/*!40000 ALTER TABLE `customer_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `account_status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `uq_customers_email` (`email`),
  UNIQUE KEY `uq_customers_phone` (`phone`),
  CONSTRAINT `chk_customers_status` CHECK ((`account_status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE',_utf8mb4'SUSPENDED')))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Badhon Pain','badhonpain48@gmail.com','01323478583','$2b$10$ua1GRN7FFqviZVvUdS8Zd.RH03dOxiLNPjkfHdh3a5RVNKXUhMv.m',NULL,'ACTIVE','2026-09-02 16:05:17','2026-09-30 03:46:24',NULL),(2,'Joya the Player','jdkff@gmail.com','+8801634933901','$2b$10$UGGlApQGYzjkZkBtzTax9OG/9VNZ7K2iOB.hd5DpBMSRjLQyTPfCW',NULL,'SUSPENDED','2026-09-02 16:12:29','2026-09-20 03:10:39',NULL),(3,'Bristi Paine','bristipaine@gmail.com','01347858743','$2b$10$JCDmQZKQ0ydf60xH7TkB7upAIVtgMFd85QWiTniMP43g7oAfCoUru',NULL,'ACTIVE','2026-09-02 19:03:38','2026-09-02 19:03:38',NULL),(4,'King Poly','king@yahoo.com',NULL,'$2b$10$n839uDvJyGE4/myftS8MAulS8cjXokk9g2OauKtfeDAsHdgaz5UuW',NULL,'ACTIVE','2026-09-10 12:15:51','2026-09-10 12:15:51',NULL),(5,'Badol','customer@loge.com','+8801811223344','$2b$10$Qd9CyXR63CzTBbeU8QgUq.h2PX5NT0FVX8pwUKLU7x3G93WraVsN6',NULL,'ACTIVE','2026-09-10 20:58:26','2026-09-30 03:45:26','/uploads/profile-pictures/46cc37d7-5b41-46bf-b5de-d12199397239.png'),(6,'Bom Bola','bmbkp@logeachi.com','01552093113','$2b$10$pzgqFPfTSUixds2u5GfbL.d.P/zqABcw8OIw.MapeRsLJGoOnkONG',NULL,'ACTIVE','2026-09-20 03:17:07','2026-09-20 03:17:07',NULL),(7,'Trisha Ghosh','trishaghosh7436@gmail.com','01916900496','$2b$10$HjTmsrHCSeICLVOSEZdbhu0UcbNMoM.CNvRXlu4o78MdgZj9VME0G',NULL,'ACTIVE','2026-09-24 15:24:06','2026-09-24 15:24:06',NULL),(8,'BP Badhon','shrivik636@gmail.com','01563245703','$2b$10$xqhdN550T2Vg9pXJw1gCPu8Oq5NgJqQH0MnP4lbbWqbBFTyZsV6T2',NULL,'ACTIVE','2026-09-28 02:57:56','2026-09-28 02:57:56',NULL),(9,'CSE BUET','csebuet@loge.com','123456789','$2b$10$HpJSdBE7I61dp9lE.k9PU.6kEGSzGYATOdLYozNliuoD69lIqov4.',NULL,'ACTIVE','2026-09-30 15:27:37','2026-09-30 15:27:37',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offer_products`
--

DROP TABLE IF EXISTS `offer_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_products` (
  `offer_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`offer_id`,`product_id`),
  KEY `fk_offer_products_product` (`product_id`),
  CONSTRAINT `fk_offer_products_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`offer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_offer_products_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offer_products`
--

LOCK TABLES `offer_products` WRITE;
/*!40000 ALTER TABLE `offer_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `offer_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `offer_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` bigint unsigned NOT NULL,
  `offer_name` varchar(150) NOT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`offer_id`),
  KEY `fk_offers_seller` (`seller_id`),
  CONSTRAINT `fk_offers_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_offers_dates` CHECK ((`end_at` > `start_at`)),
  CONSTRAINT `chk_offers_discount_type` CHECK ((`discount_type` in (_utf8mb4'PERCENT',_utf8mb4'FIXED'))),
  CONSTRAINT `chk_offers_discount_value` CHECK (((`discount_value` >= 0) and ((`discount_type` = _utf8mb4'FIXED') or ((`discount_type` = _utf8mb4'PERCENT') and (`discount_value` <= 100))))),
  CONSTRAINT `chk_offers_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `applied_offer_id` bigint unsigned DEFAULT NULL,
  `product_name_snapshot` varchar(150) NOT NULL,
  `sku_snapshot` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `line_total` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  UNIQUE KEY `uq_order_items_product` (`seller_order_id`,`product_id`),
  KEY `fk_order_items_product` (`product_id`),
  KEY `fk_order_items_offer` (`applied_offer_id`),
  CONSTRAINT `fk_order_items_offer` FOREIGN KEY (`applied_offer_id`) REFERENCES `offers` (`offer_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_seller_order` FOREIGN KEY (`seller_order_id`) REFERENCES `seller_orders` (`seller_order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_order_items_discount` CHECK (((`discount_amount` >= 0) and (`discount_amount` <= (`unit_price` * `quantity`)))),
  CONSTRAINT `chk_order_items_line_total` CHECK ((`line_total` = ((`unit_price` * `quantity`) - `discount_amount`))),
  CONSTRAINT `chk_order_items_quantity` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_order_items_unit_price` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',2,35000.00,0.00,70000.00,'2026-09-20 02:45:11'),(2,2,2,NULL,'Minimalist Ceramic Coffee Mug - Matte Black','AC-MUG-MATT-BLK',4,850.00,0.00,3400.00,'2026-09-20 02:45:11'),(3,3,5,NULL,'Nike Air Max 270 React - Triple Black','NIKE-AM270R-BLK',2,12500.00,0.00,25000.00,'2026-09-20 02:45:11'),(4,4,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-20 02:47:07'),(5,5,2,NULL,'Minimalist Ceramic Coffee Mug - Matte Black','AC-MUG-MATT-BLK',1,850.00,0.00,850.00,'2026-09-20 02:47:07'),(6,6,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-20 02:48:53'),(7,7,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-20 03:02:10'),(8,8,2,NULL,'Minimalist Ceramic Coffee Mug - Matte Black','AC-MUG-MATT-BLK',1,850.00,0.00,850.00,'2026-09-20 03:02:10'),(9,9,4,NULL,'Premium Leather Crossbody Bag','UE-XBODY-TAN',1,4500.00,0.00,4500.00,'2026-09-20 03:07:03'),(10,10,13,NULL,'Premium Coffee Beans 1kg - 100% Arabica','BC-ARABICA-1KG',1,1800.00,0.00,1800.00,'2026-09-20 03:07:03'),(11,11,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-20 03:09:14'),(12,12,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-20 04:25:43'),(13,13,2,NULL,'Minimalist Ceramic Coffee Mug - Matte Black','AC-MUG-MATT-BLK',1,850.00,0.00,850.00,'2026-09-20 04:25:43'),(14,14,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-20 04:38:52'),(15,15,2,NULL,'Minimalist Ceramic Coffee Mug - Matte Black','AC-MUG-MATT-BLK',1,850.00,0.00,850.00,'2026-09-24 15:36:08'),(16,16,5,NULL,'Nike Air Max 270 React - Triple Black','NIKE-AM270R-BLK',1,12500.00,0.00,12500.00,'2026-09-24 15:36:08'),(18,18,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',2,35000.00,0.00,70000.00,'2026-09-24 15:40:36'),(19,19,4,NULL,'Premium Leather Crossbody Bag','UE-XBODY-TAN',1,4500.00,0.00,4500.00,'2026-09-24 15:40:36'),(21,21,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-24 15:56:47'),(22,22,2,NULL,'Minimalist Ceramic Coffee Mug - Matte Black','AC-MUG-MATT-BLK',2,850.00,0.00,1700.00,'2026-09-24 22:01:14'),(23,23,1,NULL,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','APEX-M-001',1,35000.00,0.00,35000.00,'2026-09-27 05:16:20'),(24,23,21,NULL,'Premium Wireless Soundbar Pro 0632','TEST-WORKFLOW-1790464580632',1,12500.00,0.00,12500.00,'2026-09-27 05:16:20'),(26,24,22,NULL,'Honey Nut','SKU-711497-145',1,1800.00,0.00,1800.00,'2026-09-27 05:33:31'),(27,25,25,NULL,'Durex Ultra Thin Condom','SKU-152852-598',1,269.00,0.00,269.00,'2026-09-28 00:47:52'),(28,26,23,NULL,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','SKU-687401-667',1,498.00,0.00,498.00,'2026-09-28 02:59:43'),(29,27,9,NULL,'Vitamin C Face Serum 30ml - Anti-Aging Formula','GL-VITC-30ML',1,1500.00,0.00,1500.00,'2026-09-28 21:18:41'),(30,28,24,NULL,'Robusta - bitter taste with higher caffeine','SKU-222574-117',1,950.00,0.00,950.00,'2026-09-28 21:18:41'),(31,29,22,NULL,'Honey Nut','SKU-711497-145',1,1800.00,0.00,1800.00,'2026-09-30 02:27:14'),(32,30,26,NULL,'Joy Koli BUET Question Bank','SKU-170923-837',1,800.00,0.00,800.00,'2026-09-30 13:31:22'),(33,31,23,NULL,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','SKU-687401-667',1,498.00,0.00,498.00,'2026-09-30 13:33:10'),(34,32,27,NULL,'buet MOBILE','SKU-605546-989',1,12000.00,0.00,12000.00,'2026-09-30 15:32:01');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_returns`
--

DROP TABLE IF EXISTS `order_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_returns` (
  `return_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `order_item_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `seller_id` bigint unsigned NOT NULL,
  `reason` varchar(100) NOT NULL,
  `comments` text,
  `image_proof` varchar(500) DEFAULT NULL,
  `refund_amount` decimal(12,2) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','REFUNDED') DEFAULT 'PENDING',
  `admin_comments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`return_id`),
  UNIQUE KEY `uq_order_returns_item` (`order_item_id`),
  KEY `fk_return_order` (`order_id`),
  KEY `fk_return_customer` (`customer_id`),
  KEY `fk_return_seller` (`seller_id`),
  CONSTRAINT `fk_return_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_return_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_return_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_return_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_returns`
--

LOCK TABLES `order_returns` WRITE;
/*!40000 ALTER TABLE `order_returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_log`
--

DROP TABLE IF EXISTS `order_status_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_log` (
  `log_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `old_status` varchar(30) DEFAULT NULL,
  `new_status` varchar(30) NOT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_log`
--

LOCK TABLES `order_status_log` WRITE;
/*!40000 ALTER TABLE `order_status_log` DISABLE KEYS */;
INSERT INTO `order_status_log` VALUES (1,7,'CONFIRMED','SHIPPED','2026-09-24 15:27:48'),(2,5,'CONFIRMED','READY_TO_SHIP','2026-09-24 15:27:57'),(3,8,'CONFIRMED','DELIVERED','2026-09-24 15:28:04'),(4,1,'CONFIRMED','DELIVERED','2026-09-24 15:28:18'),(5,9,'CONFIRMED','PREPARING','2026-09-24 15:37:34'),(6,9,'PREPARING','SHIPPED','2026-09-24 15:37:48'),(7,10,'CONFIRMED','CANCELLED','2026-09-24 15:41:49'),(8,13,'CONFIRMED','DELIVERED','2026-09-27 05:16:20'),(9,15,'CONFIRMED','SHIPPED','2026-09-28 01:19:26'),(10,15,'SHIPPED','DELIVERED','2026-09-28 01:19:57'),(11,5,'READY_TO_SHIP','SHIPPED','2026-09-28 01:21:32'),(12,2,'CONFIRMED','DELIVERED','2026-09-28 01:21:41'),(13,3,'CONFIRMED','CANCELLED','2026-09-28 01:21:44'),(14,14,'CONFIRMED','DELIVERED','2026-09-28 01:21:51'),(15,16,'CONFIRMED','DELIVERED','2026-09-28 03:03:38'),(16,11,'CONFIRMED','DELIVERED','2026-09-28 03:39:52'),(17,17,'CONFIRMED','DELIVERED','2026-09-28 21:19:53'),(18,18,'CONFIRMED','CANCELLED','2026-09-30 02:29:44'),(19,7,'SHIPPED','DELIVERED','2026-09-30 02:30:48'),(23,14,'PREPARING','PENDING','2026-09-30 03:10:35'),(28,19,'PENDING','DELIVERED','2026-09-30 13:32:02'),(29,20,'PENDING','DELIVERED','2026-09-30 13:34:13'),(30,21,'PENDING','DELIVERED','2026-09-30 15:32:42'),(31,17,'READY','DELIVERED','2026-10-01 01:40:15');
/*!40000 ALTER TABLE `order_status_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `items_subtotal` decimal(12,2) NOT NULL,
  `discount_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(12,2) NOT NULL,
  `order_status` varchar(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
  `shipping_name` varchar(100) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address_line1` varchar(255) NOT NULL,
  `shipping_address_line2` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_postal_code` varchar(20) DEFAULT NULL,
  `shipping_country` varchar(100) NOT NULL DEFAULT 'Bangladesh',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_customer` (`customer_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_orders_discount_total` CHECK (((`discount_total` >= 0) and (`discount_total` <= `items_subtotal`))),
  CONSTRAINT `chk_orders_grand_total` CHECK ((`grand_total` = ((`items_subtotal` - `discount_total`) + `shipping_fee`))),
  CONSTRAINT `chk_orders_items_subtotal` CHECK ((`items_subtotal` >= 0)),
  CONSTRAINT `chk_orders_shipping_fee` CHECK ((`shipping_fee` >= 0)),
  CONSTRAINT `chk_orders_status` CHECK ((`order_status` in (_utf8mb4'PENDING_PAYMENT',_utf8mb4'CONFIRMED',_utf8mb4'PREPARING',_utf8mb4'READY_TO_SHIP',_utf8mb4'SHIPPED',_utf8mb4'DELIVERED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,5,98400.00,0.00,0.00,98400.00,'DELIVERED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-20 02:45:11','2026-09-24 15:28:18'),(2,5,35850.00,0.00,0.00,35850.00,'DELIVERED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-20 02:47:07','2026-09-28 01:21:41'),(3,4,35000.00,0.00,0.00,35000.00,'CANCELLED','Badhon Pain','01634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-20 02:48:53','2026-09-28 01:21:44'),(4,5,35850.00,0.00,0.00,35850.00,'CONFIRMED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-20 03:02:10','2026-09-20 03:02:10'),(5,5,6300.00,0.00,0.00,6300.00,'SHIPPED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-20 03:07:03','2026-09-28 01:21:32'),(6,5,35000.00,0.00,0.00,35000.00,'CONFIRMED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-20 03:09:14','2026-09-20 03:09:14'),(7,5,35850.00,0.00,0.00,35850.00,'DELIVERED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-20 04:25:43','2026-09-30 02:30:48'),(8,6,35000.00,0.00,0.00,35000.00,'DELIVERED','Badhon Pain','+8801634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-20 04:38:52','2026-09-24 15:28:04'),(9,7,13350.00,0.00,0.00,13350.00,'SHIPPED','Badhon Pain','Badhon Pain','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-24 15:36:08','2026-09-24 15:37:48'),(10,5,74500.00,0.00,0.00,74500.00,'CANCELLED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-24 15:40:36','2026-09-24 15:41:49'),(11,4,35000.00,0.00,0.00,35000.00,'DELIVERED','Badhon Pain','01634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-24 15:56:47','2026-09-28 03:39:52'),(12,4,1700.00,0.00,0.00,1700.00,'CONFIRMED','Badhon Pain','01634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-24 22:01:14','2026-09-24 22:01:14'),(13,4,47500.00,0.00,0.00,47500.00,'DELIVERED','Badhon Pain','01634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-27 05:16:20','2026-09-27 05:16:20'),(14,5,1800.00,0.00,0.00,1800.00,'DELIVERED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-27 05:33:31','2026-09-28 01:21:51'),(15,4,269.00,0.00,0.00,269.00,'DELIVERED','Badhon Pain','01634933901','374/C,Iqbal Road, West Shewrapara, Mirpur, Dhaka',NULL,'Dhaka','7421','Bangladesh','2026-09-28 00:47:52','2026-09-28 01:19:57'),(16,8,498.00,0.00,0.00,498.00,'DELIVERED','BP Badhon','01534678911','Shewrapara, Dhaka',NULL,'Dhaka',NULL,'Bangladesh','2026-09-28 02:59:43','2026-09-28 03:03:38'),(17,5,2450.00,0.00,0.00,2450.00,'DELIVERED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-28 21:18:41','2026-09-28 21:19:53'),(18,5,1800.00,0.00,0.00,1800.00,'CANCELLED','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-30 02:27:14','2026-09-30 02:29:44'),(19,5,800.00,0.00,0.00,800.00,'PENDING_PAYMENT','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-30 13:31:22','2026-09-30 13:31:22'),(20,5,498.00,0.00,0.00,498.00,'PENDING_PAYMENT','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-30 13:33:10','2026-09-30 13:33:10'),(21,5,12000.00,0.00,0.00,12000.00,'PENDING_PAYMENT','Demo Customer','+8801811223344','House 12, Road 4, Sector 7, Uttara',NULL,'Dhaka','1230','Bangladesh','2026-09-30 15:32:01','2026-09-30 15:32:01');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `transaction_id` varchar(150) DEFAULT NULL,
  `payment_method` varchar(30) NOT NULL,
  `payment_provider` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `failure_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `uq_payments_transaction` (`transaction_id`),
  KEY `fk_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_payments_amount` CHECK ((`amount` >= 0)),
  CONSTRAINT `chk_payments_method` CHECK ((`payment_method` in (_utf8mb4'CARD',_utf8mb4'MOBILE_BANKING',_utf8mb4'BANK_TRANSFER',_utf8mb4'CASH_ON_DELIVERY'))),
  CONSTRAINT `chk_payments_status` CHECK ((`payment_status` in (_utf8mb4'PENDING',_utf8mb4'PROCESSING',_utf8mb4'SUCCESS',_utf8mb4'FAILED',_utf8mb4'CANCELLED',_utf8mb4'REFUNDED',_utf8mb4'PARTIALLY_REFUNDED')))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'TXN-1789850711910-9111','CASH_ON_DELIVERY','COD',98400.00,'PENDING',NULL,'2026-09-20 02:45:11',NULL),(2,2,'TXN-1789850827132-8260','CASH_ON_DELIVERY','COD',35850.00,'PENDING',NULL,'2026-09-20 02:47:07',NULL),(3,3,'TXN-1789850933005-2683','CASH_ON_DELIVERY','COD',35000.00,'PENDING',NULL,'2026-09-20 02:48:53',NULL),(4,4,'TXN-1789851730237-8251','CASH_ON_DELIVERY','COD',35850.00,'PENDING',NULL,'2026-09-20 03:02:10',NULL),(5,5,'TXN-1789852023612-2625','CARD','SSLCOMMERZ',6300.00,'SUCCESS',NULL,'2026-09-20 03:07:03','2026-09-20 03:07:04'),(6,6,'TXN-1789852154518-1799','BANK_TRANSFER','SSLCOMMERZ',35000.00,'SUCCESS',NULL,'2026-09-20 03:09:14','2026-09-20 03:09:15'),(7,7,'TXN-1789856743916-1066','CASH_ON_DELIVERY','COD',35850.00,'PENDING',NULL,'2026-09-20 04:25:43',NULL),(8,8,'TXN-1789857532287-1388','CARD','SSLCOMMERZ',35000.00,'SUCCESS',NULL,'2026-09-20 04:38:52','2026-09-20 04:38:52'),(9,9,'TXN-1790242568-8494','CASH_ON_DELIVERY','COD',13350.00,'PENDING',NULL,'2026-09-24 15:36:08',NULL),(10,10,'TXN-1790242836-4514','CASH_ON_DELIVERY','COD',74500.00,'PENDING',NULL,'2026-09-24 15:40:36',NULL),(11,11,'TXN-1790243807-7930','CASH_ON_DELIVERY','COD',35000.00,'PENDING',NULL,'2026-09-24 15:56:47',NULL),(12,12,'TXN-1790265674-6083','CASH_ON_DELIVERY','COD',1700.00,'PENDING',NULL,'2026-09-24 22:01:14',NULL),(13,13,'TXN-1790464580-2747','CASH_ON_DELIVERY','COD',47500.00,'PENDING',NULL,'2026-09-27 05:16:20',NULL),(14,14,'TXN-1790465611-4067','CASH_ON_DELIVERY','COD',1800.00,'PENDING',NULL,'2026-09-27 05:33:31',NULL),(15,15,'TXN-1790534872-1540','CASH_ON_DELIVERY','COD',269.00,'PENDING',NULL,'2026-09-28 00:47:52',NULL),(16,16,'TXN-1790542783-3814','CARD','SSLCOMMERZ',498.00,'SUCCESS',NULL,'2026-09-28 02:59:43','2026-09-28 02:59:43'),(17,17,'TXN-1790608721-2578','CASH_ON_DELIVERY','COD',2450.00,'PENDING',NULL,'2026-09-28 21:18:41',NULL),(18,18,'TXN-1790713634-4907','CASH_ON_DELIVERY','COD',1800.00,'PENDING',NULL,'2026-09-30 02:27:14',NULL),(19,19,'TXN-1790753482-7247','CASH_ON_DELIVERY','COD',800.00,'PENDING',NULL,'2026-09-30 13:31:22',NULL),(20,20,'TXN-1790753590-8247','CASH_ON_DELIVERY','COD',498.00,'PENDING',NULL,'2026-09-30 13:33:10',NULL),(21,21,'TXN-1790760721-6400','CASH_ON_DELIVERY','COD',12000.00,'PENDING',NULL,'2026-09-30 15:32:01',NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_payment_require_confirmation` BEFORE INSERT ON `payments` FOR EACH ROW SET NEW.payment_status = IF(
    (SELECT order_status FROM orders WHERE order_id = NEW.order_id) = 'PENDING_PAYMENT',
    'PENDING',
    NEW.payment_status
),
NEW.paid_at = IF(
    (SELECT order_status FROM orders WHERE order_id = NEW.order_id) = 'PENDING_PAYMENT',
    NULL,
    NEW.paid_at
); */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `phone_otps`
--

DROP TABLE IF EXISTS `phone_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_otps` (
  `otp_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(25) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`otp_id`),
  KEY `fk_phone_otps_customer` (`customer_id`),
  CONSTRAINT `fk_phone_otps_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_otps`
--

LOCK TABLES `phone_otps` WRITE;
/*!40000 ALTER TABLE `phone_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `phone_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone_verifications`
--

DROP TABLE IF EXISTS `phone_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_verifications` (
  `verification_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `phone` varchar(25) NOT NULL,
  `verified_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`verification_id`),
  UNIQUE KEY `uq_phone_verification_customer_phone` (`customer_id`,`phone`),
  CONSTRAINT `fk_phone_verifications_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_verifications`
--

LOCK TABLES `phone_verifications` WRITE;
/*!40000 ALTER TABLE `phone_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `phone_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '1',
  `alt_text` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  UNIQUE KEY `uq_product_images_order` (`product_id`,`display_order`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_product_images_display_order` CHECK ((`display_order` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop',1,1,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','2026-09-20 02:39:02'),(2,1,'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',0,2,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','2026-09-20 02:39:02'),(3,1,'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',0,3,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','2026-09-20 02:39:02'),(4,1,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',0,4,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','2026-09-20 02:39:02'),(5,2,'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop',1,1,'Minimalist Ceramic Coffee Mug - Matte Black','2026-09-20 02:39:02'),(6,2,'https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=800&auto=format&fit=crop',0,2,'Minimalist Ceramic Coffee Mug - Matte Black','2026-09-20 02:39:02'),(7,2,'https://images.unsplash.com/photo-1517256673644-36ad11246d21?q=80&w=800&auto=format&fit=crop',0,3,'Minimalist Ceramic Coffee Mug - Matte Black','2026-09-20 02:39:02'),(8,2,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',0,4,'Minimalist Ceramic Coffee Mug - Matte Black','2026-09-20 02:39:02'),(9,3,'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=400&auto=format&fit=crop',1,1,'Apple Watch Series 9 GPS 41mm','2026-09-20 02:39:02'),(10,3,'https://images.unsplash.com/photo-1546868871-af0de0ae72be?q=80&w=800&auto=format&fit=crop',0,2,'Apple Watch Series 9 GPS 41mm','2026-09-20 02:39:02'),(11,3,'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=800&auto=format&fit=crop',0,3,'Apple Watch Series 9 GPS 41mm','2026-09-20 02:39:02'),(12,3,'https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800&auto=format&fit=crop',0,4,'Apple Watch Series 9 GPS 41mm','2026-09-20 02:39:02'),(13,4,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop',1,1,'Premium Leather Crossbody Bag','2026-09-20 02:39:02'),(14,4,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',0,2,'Premium Leather Crossbody Bag','2026-09-20 02:39:02'),(15,4,'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop',0,3,'Premium Leather Crossbody Bag','2026-09-20 02:39:02'),(16,4,'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',0,4,'Premium Leather Crossbody Bag','2026-09-20 02:39:02'),(17,5,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',1,1,'Nike Air Max 270 React - Triple Black','2026-09-20 02:39:02'),(18,5,'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop',0,2,'Nike Air Max 270 React - Triple Black','2026-09-20 02:39:02'),(19,5,'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=800&auto=format&fit=crop',0,3,'Nike Air Max 270 React - Triple Black','2026-09-20 02:39:02'),(20,5,'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',0,4,'Nike Air Max 270 React - Triple Black','2026-09-20 02:39:02'),(21,6,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',1,1,'Men\'s Casual Fit Premium Cotton T-Shirt','2026-09-20 02:39:02'),(22,6,'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=800&auto=format&fit=crop',0,2,'Men\'s Casual Fit Premium Cotton T-Shirt','2026-09-20 02:39:02'),(23,6,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',0,3,'Men\'s Casual Fit Premium Cotton T-Shirt','2026-09-20 02:39:02'),(24,6,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',0,4,'Men\'s Casual Fit Premium Cotton T-Shirt','2026-09-20 02:39:02'),(25,7,'https://images.unsplash.com/photo-1572569433602-66665044ab49?q=80&w=400&auto=format&fit=crop',1,1,'Wireless Bluetooth Earbuds 5.0 - Premium Sound','2026-09-20 02:39:02'),(26,7,'https://images.unsplash.com/photo-1590658268037-6bf12f032f4f?q=80&w=800&auto=format&fit=crop',0,2,'Wireless Bluetooth Earbuds 5.0 - Premium Sound','2026-09-20 02:39:02'),(27,7,'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=800&auto=format&fit=crop',0,3,'Wireless Bluetooth Earbuds 5.0 - Premium Sound','2026-09-20 02:39:02'),(28,7,'https://images.unsplash.com/photo-1631176093617-63490a3d785a?q=80&w=800&auto=format&fit=crop',0,4,'Wireless Bluetooth Earbuds 5.0 - Premium Sound','2026-09-20 02:39:02'),(29,8,'https://images.unsplash.com/photo-1585837146751-a44118595680?q=80&w=400&auto=format&fit=crop',1,1,'Non-stick Frying Pan Set - 3 Piece','2026-09-20 02:39:02'),(30,8,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop',0,2,'Non-stick Frying Pan Set - 3 Piece','2026-09-20 02:39:02'),(31,8,'https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=800&auto=format&fit=crop',0,3,'Non-stick Frying Pan Set - 3 Piece','2026-09-20 02:39:02'),(32,8,'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=800&auto=format&fit=crop',0,4,'Non-stick Frying Pan Set - 3 Piece','2026-09-20 02:39:02'),(33,9,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',1,1,'Vitamin C Face Serum 30ml - Anti-Aging Formula','2026-09-20 02:39:02'),(34,9,'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=800&auto=format&fit=crop',0,2,'Vitamin C Face Serum 30ml - Anti-Aging Formula','2026-09-20 02:39:02'),(35,9,'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?q=80&w=800&auto=format&fit=crop',0,3,'Vitamin C Face Serum 30ml - Anti-Aging Formula','2026-09-20 02:39:02'),(36,9,'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',0,4,'Vitamin C Face Serum 30ml - Anti-Aging Formula','2026-09-20 02:39:02'),(37,10,'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop',1,1,'Mechanical Gaming Keyboard RGB Backlit','2026-09-20 02:39:02'),(38,10,'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop',0,2,'Mechanical Gaming Keyboard RGB Backlit','2026-09-20 02:39:02'),(39,10,'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop',0,3,'Mechanical Gaming Keyboard RGB Backlit','2026-09-20 02:39:02'),(40,10,'https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=800&auto=format&fit=crop',0,4,'Mechanical Gaming Keyboard RGB Backlit','2026-09-20 02:39:02'),(41,11,'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=400&auto=format&fit=crop',1,1,'Premium Yoga Mat with Carrying Strap','2026-09-20 02:39:02'),(42,11,'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',0,2,'Premium Yoga Mat with Carrying Strap','2026-09-20 02:39:02'),(43,11,'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',0,3,'Premium Yoga Mat with Carrying Strap','2026-09-20 02:39:02'),(44,11,'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',0,4,'Premium Yoga Mat with Carrying Strap','2026-09-20 02:39:02'),(45,12,'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop',1,1,'Smart LED TV 43 Inch 4K UHD Android','2026-09-20 02:39:02'),(46,12,'https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=800&auto=format&fit=crop',0,2,'Smart LED TV 43 Inch 4K UHD Android','2026-09-20 02:39:02'),(47,12,'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop',0,3,'Smart LED TV 43 Inch 4K UHD Android','2026-09-20 02:39:02'),(48,12,'https://images.unsplash.com/photo-1571415060716-baff5f717c37?q=80&w=800&auto=format&fit=crop',0,4,'Smart LED TV 43 Inch 4K UHD Android','2026-09-20 02:39:02'),(49,13,'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop',1,1,'Premium Coffee Beans 1kg - 100% Arabica','2026-09-20 02:39:02'),(50,13,'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',0,2,'Premium Coffee Beans 1kg - 100% Arabica','2026-09-20 02:39:02'),(51,13,'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?q=80&w=800&auto=format&fit=crop',0,3,'Premium Coffee Beans 1kg - 100% Arabica','2026-09-20 02:39:02'),(52,13,'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop',0,4,'Premium Coffee Beans 1kg - 100% Arabica','2026-09-20 02:39:02'),(53,14,'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop',1,1,'Men\'s Slim Leather Wallet - RFID Blocking','2026-09-20 02:39:02'),(54,14,'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?q=80&w=800&auto=format&fit=crop',0,2,'Men\'s Slim Leather Wallet - RFID Blocking','2026-09-20 02:39:02'),(55,14,'https://images.unsplash.com/photo-1556742400-b5b7c512f3f0?q=80&w=800&auto=format&fit=crop',0,3,'Men\'s Slim Leather Wallet - RFID Blocking','2026-09-20 02:39:02'),(56,14,'https://images.unsplash.com/photo-1612902456551-404854679e5e?q=80&w=800&auto=format&fit=crop',0,4,'Men\'s Slim Leather Wallet - RFID Blocking','2026-09-20 02:39:02'),(57,15,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400&auto=format&fit=crop',1,1,'Modern Ceramic Table Lamp - Minimalist','2026-09-20 02:39:02'),(58,15,'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',0,2,'Modern Ceramic Table Lamp - Minimalist','2026-09-20 02:39:02'),(59,15,'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=800&auto=format&fit=crop',0,3,'Modern Ceramic Table Lamp - Minimalist','2026-09-20 02:39:02'),(60,15,'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop',0,4,'Modern Ceramic Table Lamp - Minimalist','2026-09-20 02:39:02'),(61,21,'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop',1,1,'Premium Wireless Soundbar Pro 0632','2026-09-27 05:16:20'),(62,22,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQibyc_5M1FLRj0m6OwbQVA-iEjcuLVenQ30HREB9AeQCWKnHdCl4y7j-hx&s=10',1,1,'Honey Nut','2026-09-27 05:19:44'),(63,23,'https://laz-img-sg.alicdn.com/p/97ce7e4b0a1cfdf8a65bee0fd538767a.png',1,1,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','2026-09-27 23:44:04'),(64,23,'https://img.drz.lazcdn.com/g/kf/S4d3ca00018124c5c8c7169d074d8f94bt.jpg_720x720q80.jpg_.webp',0,2,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','2026-09-27 23:44:04'),(65,23,'https://img.drz.lazcdn.com/static/bd/p/eb57515e955076f91e654d9adce5f831.jpg_720x720q80.jpg_.webp',0,3,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','2026-09-27 23:44:04'),(66,23,'https://img.drz.lazcdn.com/static/bd/p/f55d63859eb2d837c868a1ce51ae0c1a.jpg_720x720q80.jpg_.webp',0,4,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','2026-09-27 23:44:04'),(67,23,'https://img.drz.lazcdn.com/static/bd/p/cd9e6b2f2767feb325cc32a1bebe204a.jpg_720x720q80.jpg_.webp',0,5,'Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','2026-09-27 23:44:04'),(68,24,'https://static.vecteezy.com/system/resources/thumbnails/008/916/970/small/shopping-cart-box-on-coffee-beans-shopping-online-for-export-or-import-free-photo.jpg',1,1,'Robusta - bitter taste with higher caffeine','2026-09-27 23:53:06'),(69,24,'https://static.vecteezy.com/system/resources/previews/011/098/728/large_2x/coffee-cup-and-coffee-beans-free-photo.jpg',0,2,'Robusta - bitter taste with higher caffeine','2026-09-27 23:53:06'),(70,24,'https://allyouneedbd.com/wp-content/uploads/2021/10/coffee-beans-cup-close-up-scaled.jpg',0,3,'Robusta - bitter taste with higher caffeine','2026-09-27 23:53:06'),(71,24,'https://marketplace.canva.com/9D8q8/MAGr379D8q8/1/tl/canva-steaming-cup-of-coffee-with-latte-art-MAGr379D8q8.jpg',0,4,'Robusta - bitter taste with higher caffeine','2026-09-27 23:53:06'),(72,25,'https://media.istockphoto.com/id/459228091/photo/durex-condoms.jpg?s=612x612&w=0&k=20&c=dw-xdyuqUjnLmOqaEWflRzHOeIsQhVGMPKIsTAiF_H4=',1,1,'Durex Ultra Thin Condom','2026-09-28 00:21:44'),(73,25,'https://media.istockphoto.com/id/2060397186/video/medical-contraception-line-animation.jpg?s=640x640&k=20&c=mQQCZz-WpvQnR34NS1LXriLohdDQXZ0sn4590wCU1w8=',0,2,'Durex Ultra Thin Condom','2026-09-28 00:21:44'),(74,25,'https://media.istockphoto.com/id/458632149/photo/durex-condoms.jpg?s=612x612&w=0&k=20&c=mkRi7LEQ_iaSvbH6wAPfHlxF00mM1MUzA1CzcfWXqrQ=',0,3,'Durex Ultra Thin Condom','2026-09-28 00:21:44'),(75,25,'https://media.istockphoto.com/id/458067887/photo/durex-extra-sensitive-condom-pack-and-opened-item.jpg?s=612x612&w=0&k=20&c=9Aa6N0ycbamSSCDfNMPGICWaNaj9w7R2unAU-xPqNYs=',0,4,'Durex Ultra Thin Condom','2026-09-28 00:21:44'),(76,25,'https://media.istockphoto.com/id/458657801/photo/two-durex-condom.jpg?s=612x612&w=0&k=20&c=u5bj0NgBc6xi0b1jWIsofG0GBjjcymTODzNgh_qWtx8=',0,5,'Durex Ultra Thin Condom','2026-09-28 00:21:44'),(77,26,'https://rokbucket.rokomari.io/ProductNew20190903/260X372/Buet_Prosnobank-Joykali_Reform_Council-f6227-559896.jpg',1,1,'Joy Koli BUET Question Bank','2026-09-30 13:28:58'),(78,26,'https://rokbucket.rokomari.io/ProductNew20190903/260X372/BUET_Question_with_Model_Test-Udvash_Academic_And_Admission_Care-c2e98-572916.jpeg',0,2,'Joy Koli BUET Question Bank','2026-09-30 13:28:58'),(79,26,'https://rokbucket.rokomari.io/ProductNew20190903/260X372/Buet_Model_Test_-Joykali_Reform_Council-21ed5-559895.jpg',0,3,'Joy Koli BUET Question Bank','2026-09-30 13:28:58'),(80,26,'https://rokbucket.rokomari.io/ProductNew20190903/260X372/Buet_Chemistry_1st_and_2nd_Part-Joykali_Reform_Council-4682a-559894.jpg',0,4,'Joy Koli BUET Question Bank','2026-09-30 13:28:58'),(81,27,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTb-DXkXoEx6S2ssIkvHVvuAcJvlbGmnWfj4c6q00uxQ&s',1,1,'buet MOBILE','2026-09-30 15:31:10'),(82,27,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTb-DXkXoEx6S2ssIkvHVvuAcJvlbGmnWfj4c6q00uxQ&s',0,2,'buet MOBILE','2026-09-30 15:31:10'),(83,27,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTb-DXkXoEx6S2ssIkvHVvuAcJvlbGmnWfj4c6q00uxQ&s',0,3,'buet MOBILE','2026-09-30 15:31:10'),(84,27,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTb-DXkXoEx6S2ssIkvHVvuAcJvlbGmnWfj4c6q00uxQ&s',0,4,'buet MOBILE','2026-09-30 15:31:10');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `sku` varchar(100) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(12,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `uq_products_seller_sku` (`seller_id`,`sku`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_products_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_products_price` CHECK ((`price` >= 0)),
  CONSTRAINT `chk_products_status` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE',_utf8mb4'OUT_OF_STOCK',_utf8mb4'ARCHIVED'))),
  CONSTRAINT `chk_products_stock` CHECK ((`stock_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,2,'APEX-M-001','Sony WH-1000XM5 Wireless Noise Canceling Headphones','Industry-leading noise cancellation with two processors controls 8 microphones. Magnificent sound quality with newly designed 30mm driver unit. Crystal clear hands-free calling with 4 beamforming microphones, advanced audio signal processing, and AI-based noise reduction.',35000.00,49,'ACTIVE','2026-09-10 20:58:26','2026-09-27 05:16:20'),(2,3,3,'AC-MUG-MATT-BLK','Minimalist Ceramic Coffee Mug - Matte Black','Handcrafted minimalist ceramic mug with a luxurious matte finish. Perfect for your morning coffee or evening tea. Each mug is unique with slight variations that add to its artisanal charm. Microwave and dishwasher safe.',850.00,140,'ACTIVE','2026-09-20 02:39:02','2026-09-24 22:01:14'),(3,4,4,'APPLE-WS9-41-MN','Apple Watch Series 9 GPS 41mm','Apple Watch Series 9 features the powerful S9 SiP chip with a custom Apple GPU for a magical new Double Tap gesture. A brighter display makes it easier to see in daylight. And advanced health and safety features give you more peace of mind.',45000.00,18,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(4,5,1,'UE-XBODY-TAN','Premium Leather Crossbody Bag','Crafted from genuine full-grain leather, this crossbody bag combines timeless elegance with everyday functionality. Features an adjustable strap, multiple interior compartments, and premium brass hardware that develops a beautiful patina over time.',4500.00,38,'ACTIVE','2026-09-20 02:39:02','2026-09-24 15:40:36'),(5,6,5,'NIKE-AM270R-BLK','Nike Air Max 270 React - Triple Black','The Nike Air Max 270 React combines two of Nike\'s best technologies to create an incredibly comfortable shoe. The Air Max 270 unit delivers visible cushioning under the heel while React foam provides lightweight, springy comfort.',12500.00,22,'ACTIVE','2026-09-20 02:39:02','2026-09-24 15:36:08'),(6,7,1,'CW-TSHIRT-WHT-M','Men\'s Casual Fit Premium Cotton T-Shirt','Premium 100% combed cotton t-shirt with a relaxed casual fit. Pre-shrunk fabric ensures it keeps its shape wash after wash. The perfect everyday essential for a clean, modern look.',850.00,200,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(7,8,2,'SM-EARBUDS-BLK','Wireless Bluetooth Earbuds 5.0 - Premium Sound','Experience premium audio with the SoundMax Wireless Bluetooth Earbuds 5.0. Featuring Active Noise Cancellation (ANC), these earbuds deliver crystal-clear sound in any environment.',1200.00,45,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(8,9,6,'CM-FPAN-SET3','Non-stick Frying Pan Set - 3 Piece','Professional-grade non-stick frying pan set with PFOA-free ceramic coating. Includes 20cm, 26cm, and 30cm pans. Heat-resistant silicone handles stay cool while cooking.',2500.00,90,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(9,10,7,'GL-VITC-30ML','Vitamin C Face Serum 30ml - Anti-Aging Formula','Powerful 20% Vitamin C serum with Hyaluronic Acid and Vitamin E. Brightens skin, reduces dark spots, and fights signs of aging. Dermatologist tested, suitable for all skin types.',1500.00,299,'ACTIVE','2026-09-20 02:39:02','2026-09-28 21:18:41'),(10,11,8,'KF-MECH-RGB-104','Mechanical Gaming Keyboard RGB Backlit','Full-size 104-key mechanical gaming keyboard with per-key RGB lighting. Features hot-swappable switches, double-shot PBT keycaps, and a detachable USB-C cable. Built for competitive gaming and marathon typing sessions.',3500.00,55,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(11,12,9,'FF-YMAT-6MM-PUR','Premium Yoga Mat with Carrying Strap','Extra thick 6mm TPE yoga mat with excellent grip and cushioning. Eco-friendly, non-toxic material with a closed-cell surface that prevents sweat absorption. Comes with a carrying strap for easy transport.',900.00,120,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(12,13,10,'VP-TV43-4K-AND','Smart LED TV 43 Inch 4K UHD Android','43-inch 4K UHD Smart TV with built-in Android TV OS. Access Netflix, YouTube, and thousands of apps. Dolby Audio and HDR10 for an immersive viewing experience. Slim bezel design fits perfectly in any room.',28000.00,12,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(13,14,11,'BC-ARABICA-1KG','Premium Coffee Beans 1kg - 100% Arabica','Freshly roasted 100% single-origin Arabica coffee beans from the highlands of Ethiopia. Medium roast with rich chocolate and fruity notes. Roasted in small batches for maximum freshness.',1800.00,199,'ACTIVE','2026-09-20 02:39:02','2026-09-20 03:07:03'),(14,5,12,'UE-WALLET-SLIM-BLK','Men\'s Slim Leather Wallet - RFID Blocking','Ultra-slim genuine leather bifold wallet with RFID blocking technology to protect your cards from electronic theft. Features 6 card slots, 2 hidden compartments, and a bill section, all in a pocket-friendly slim profile.',1200.00,75,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(15,15,13,'LC-TLAMP-WHT-01','Modern Ceramic Table Lamp - Minimalist','Handcrafted ceramic table lamp with a modern minimalist design. Features a ribbed ceramic base with a natural linen drum shade. Provides warm ambient lighting perfect for bedrooms, living rooms, or offices.',4500.00,30,'ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02'),(16,1,2,'SKU-8929','Men\'s Premiere Socks','Leathre Socks imported from Papua New Guinea with 3 available colors',800.00,10,'ACTIVE','2026-09-24 15:21:43','2026-09-24 15:21:43'),(21,1,12,'TEST-WORKFLOW-1790464580632','Premium Wireless Soundbar Pro 0632','High-fidelity cinema soundbar with wireless subwoofer.',12500.00,14,'ACTIVE','2026-09-27 05:16:20','2026-09-27 05:16:20'),(22,2,11,'SKU-711497-145','Honey Nut','Special honey Nut made by Joyshree Mukharjee Joya',1800.00,0,'OUT_OF_STOCK','2026-09-27 05:19:44','2026-09-30 13:23:25'),(23,5,1,'SKU-687401-667','Exquisite Butter Silk Western Multicolor 2 piece Dress Precision Crafted Shirt & Pant Set with Premium Finishing ','Fabric: High-Quality Butter Silk (Soft & Comfortable)\nDesign: Modern Western Two-Piece (Shirt + Pant)\nMeasurements: Shirt Length 42\" | Pant Length 38\"\nQuality: Crafted by expert artisans for a flawless finish.\nAssurance: What you see is what you get—100% matching with the product photos.',498.00,2,'ACTIVE','2026-09-27 23:44:04','2026-09-30 13:33:10'),(24,5,11,'SKU-222574-117','Robusta - bitter taste with higher caffeine','Stronger, more bitter taste with higher caffeine (1.7–4.0%), ',950.00,28,'ACTIVE','2026-09-27 23:53:06','2026-09-28 21:18:41'),(25,10,7,'SKU-152852-598','Durex Ultra Thin Condom','Ultra-Thin Design: Thinner than classic latex options to enhance natural sensation and physical intimacy.\nPre-Lubricated: Infused with premium silicone-based lubricant to reduce friction and provide a smooth, comfortable experience.\nSecure Fit & Shape: Features a straight-walled, teat-ended design for effortless application and a snug, reliable fit.\nRigorously Tested: 100% electronically and dermatologically tested to ensure maximum strength and leak protection.\nOdour-Neutralizing: Specially engineered to minimize the typical latex smell for a distraction-free intimate encounter',269.00,18,'ARCHIVED','2026-09-28 00:21:44','2026-09-30 13:30:17'),(26,15,3,'SKU-170923-837','Joy Koli BUET Question Bank','je porbe se mo*rbe',800.00,4,'ACTIVE','2026-09-30 13:28:58','2026-09-30 13:31:22'),(27,19,2,'SKU-605546-989','buet MOBILE','HJJDBSK LASSS MNS',15000.00,6,'ACTIVE','2026-09-30 15:31:10','2026-09-30 15:34:33');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_product_auto_out_of_stock` BEFORE UPDATE ON `products` FOR EACH ROW BEGIN
        IF NEW.stock_quantity = 0 AND NEW.status = 'ACTIVE' THEN
          SET NEW.status = 'OUT_OF_STOCK';
        END IF;

        IF NEW.stock_quantity > 0 AND OLD.stock_quantity = 0 AND OLD.status = 'OUT_OF_STOCK' THEN
          SET NEW.status = 'ACTIVE';
        END IF;
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_item_id` bigint unsigned NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `review_status` varchar(20) NOT NULL DEFAULT 'PUBLISHED',
  `reviewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `uq_reviews_order_item` (`order_item_id`),
  CONSTRAINT `fk_reviews_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK ((`rating` between 1 and 5)),
  CONSTRAINT `chk_reviews_status` CHECK ((`review_status` in (_utf8mb4'PUBLISHED',_utf8mb4'HIDDEN',_utf8mb4'REMOVED')))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,24,5,'Outstanding sound quality and fast delivery! Highly recommended.','PUBLISHED','2026-09-27 05:16:20'),(2,28,4,'The product is so nice and 69 others...','PUBLISHED','2026-09-28 03:28:20'),(3,29,5,'Kora Product','PUBLISHED','2026-09-28 21:21:29'),(4,4,5,'KoRa Sound !!!','PUBLISHED','2026-09-30 02:32:07'),(5,12,5,'Atto valo je 2 week er moddhe arekta neuya lagche','PUBLISHED','2026-09-30 02:32:38'),(6,32,5,'khub valo boi,kobor theke bolchi.','PUBLISHED','2026-09-30 13:42:43'),(7,34,5,'CHOLE NA, VERY BAD SERVICE LIKE BUET CSE','PUBLISHED','2026-09-30 15:33:21');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_applications`
--

DROP TABLE IF EXISTS `seller_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_applications` (
  `application_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `application_ref` char(64) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `business_description` text NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `rejection_reason` text,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `seller_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `uq_seller_applications_ref` (`application_ref`),
  KEY `fk_seller_applications_category` (`category_id`),
  KEY `fk_seller_applications_seller` (`seller_id`),
  KEY `idx_seller_applications_status_created` (`status`,`created_at`),
  KEY `idx_seller_applications_email` (`email`),
  CONSTRAINT `fk_seller_applications_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `fk_seller_applications_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_seller_applications_status` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'UNDER_REVIEW',_utf8mb4'APPROVED',_utf8mb4'REJECTED')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_applications`
--

LOCK TABLES `seller_applications` WRITE;
/*!40000 ALTER TABLE `seller_applications` DISABLE KEYS */;
INSERT INTO `seller_applications` VALUES (1,'ed2208848a71fb9a8324cf4b27d4a27a9251df2db953064443f32d694d4b7ae2','Tasnim Zara','tasnim99@gmail.com','+8801634933901','$2b$10$WGnz2WqwX.7bcUpvE3AeiuZJ2vMg8E5B6GAyDy05dp34aFEJd39T2','Clinical Politics',13,'Dekhi ki becha jai, manusher h mere tk kamate chai','34/B block, Dhanmondi-27','Dhaka','7430','Bangladesh','APPROVED',NULL,1,'2026-09-28 02:14:48',18,'2026-09-28 02:12:40','2026-09-28 02:14:48'),(2,'3b87c6a97244e9a3b84d020425db29a8be7670b3f6f6d4a48ef72cfb63375a1b','CSE BUET','csebuet23@loge.com','+8801523478583','$2b$10$mOQMZ.OGiYJEpKzDXJ0Pb.MJd9pZqu9lNSlLizk4/uPaB09eg2ugy','BUET MOBILE',2,'HDBDJSADSABDJDAS ABDDJABDJSD','374/3/C, West Shewrapara, Mirpur','Dhaka','1216','Bangladesh','APPROVED',NULL,1,'2026-09-30 15:29:41',19,'2026-09-30 15:29:12','2026-09-30 15:29:41');
/*!40000 ALTER TABLE `seller_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_conversations`
--

DROP TABLE IF EXISTS `seller_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_conversations` (
  `conversation_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `seller_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_message_at` datetime DEFAULT NULL,
  PRIMARY KEY (`conversation_id`),
  UNIQUE KEY `uq_seller_conversation_context` (`customer_id`,`seller_id`,`product_id`),
  KEY `fk_seller_conversations_product` (`product_id`),
  KEY `idx_seller_conversations_seller_recent` (`seller_id`,`last_message_at`),
  KEY `idx_seller_conversations_customer_recent` (`customer_id`,`last_message_at`),
  CONSTRAINT `fk_seller_conversations_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seller_conversations_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seller_conversations_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_conversations`
--

LOCK TABLES `seller_conversations` WRITE;
/*!40000 ALTER TABLE `seller_conversations` DISABLE KEYS */;
INSERT INTO `seller_conversations` VALUES (1,5,5,23,'2026-10-01 01:15:54','2026-10-01 01:38:51'),(8,5,5,24,'2026-10-01 02:20:50',NULL),(10,5,15,26,'2026-10-01 02:39:18',NULL);
/*!40000 ALTER TABLE `seller_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_messages`
--

DROP TABLE IF EXISTS `seller_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_messages` (
  `message_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `sender_role` varchar(10) NOT NULL,
  `sender_customer_id` bigint unsigned DEFAULT NULL,
  `sender_seller_id` bigint unsigned DEFAULT NULL,
  `message_body` varchar(2000) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `fk_seller_messages_customer` (`sender_customer_id`),
  KEY `fk_seller_messages_seller` (`sender_seller_id`),
  KEY `idx_seller_messages_conversation_time` (`conversation_id`,`created_at`),
  CONSTRAINT `fk_seller_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `seller_conversations` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_seller_messages_customer` FOREIGN KEY (`sender_customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `fk_seller_messages_seller` FOREIGN KEY (`sender_seller_id`) REFERENCES `sellers` (`seller_id`),
  CONSTRAINT `chk_seller_messages_sender` CHECK ((((`sender_role` = _utf8mb4'CUSTOMER') and (`sender_customer_id` is not null) and (`sender_seller_id` is null)) or ((`sender_role` = _utf8mb4'SELLER') and (`sender_seller_id` is not null) and (`sender_customer_id` is null))))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_messages`
--

LOCK TABLES `seller_messages` WRITE;
/*!40000 ALTER TABLE `seller_messages` DISABLE KEYS */;
INSERT INTO `seller_messages` VALUES (1,1,'CUSTOMER',5,NULL,'Can  you give any discount on this product ?','2026-10-01 01:16:11'),(2,1,'SELLER',NULL,5,'No Sir, Fixed Price.','2026-10-01 01:17:16'),(5,1,'SELLER',NULL,5,'Discount Available Sir','2026-10-01 01:38:51');
/*!40000 ALTER TABLE `seller_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_orders`
--

DROP TABLE IF EXISTS `seller_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_orders` (
  `seller_order_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `seller_id` bigint unsigned NOT NULL,
  `items_subtotal` decimal(12,2) NOT NULL,
  `discount_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `seller_total` decimal(12,2) NOT NULL,
  `preparation_status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`seller_order_id`),
  UNIQUE KEY `uq_seller_orders_order_seller` (`order_id`,`seller_id`),
  KEY `fk_seller_orders_seller` (`seller_id`),
  CONSTRAINT `fk_seller_orders_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_seller_orders_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_seller_orders_discount` CHECK (((`discount_total` >= 0) and (`discount_total` <= `items_subtotal`))),
  CONSTRAINT `chk_seller_orders_status` CHECK ((`preparation_status` in (_utf8mb4'PENDING',_utf8mb4'ACCEPTED',_utf8mb4'PREPARING',_utf8mb4'READY',_utf8mb4'SHIPPED',_utf8mb4'DELIVERED',_utf8mb4'CANCELLED'))),
  CONSTRAINT `chk_seller_orders_subtotal` CHECK ((`items_subtotal` >= 0)),
  CONSTRAINT `chk_seller_orders_total` CHECK ((`seller_total` = (`items_subtotal` - `discount_total`)))
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_orders`
--

LOCK TABLES `seller_orders` WRITE;
/*!40000 ALTER TABLE `seller_orders` DISABLE KEYS */;
INSERT INTO `seller_orders` VALUES (1,1,1,70000.00,0.00,70000.00,'ACCEPTED','2026-09-20 02:45:11','2026-09-20 02:50:54'),(2,1,3,3400.00,0.00,3400.00,'PENDING','2026-09-20 02:45:11','2026-09-20 02:45:11'),(3,1,6,25000.00,0.00,25000.00,'PENDING','2026-09-20 02:45:11','2026-09-20 02:45:11'),(4,2,1,35000.00,0.00,35000.00,'CANCELLED','2026-09-20 02:47:07','2026-09-20 02:50:50'),(5,2,3,850.00,0.00,850.00,'PENDING','2026-09-20 02:47:07','2026-09-20 02:47:07'),(6,3,1,35000.00,0.00,35000.00,'PREPARING','2026-09-20 02:48:53','2026-09-20 02:50:45'),(7,4,1,35000.00,0.00,35000.00,'PENDING','2026-09-20 03:02:10','2026-09-20 03:02:10'),(8,4,3,850.00,0.00,850.00,'PENDING','2026-09-20 03:02:10','2026-09-20 03:02:10'),(9,5,5,4500.00,0.00,4500.00,'CANCELLED','2026-09-20 03:07:03','2026-09-28 03:02:18'),(10,5,14,1800.00,0.00,1800.00,'PENDING','2026-09-20 03:07:03','2026-09-20 03:07:03'),(11,6,1,35000.00,0.00,35000.00,'PENDING','2026-09-20 03:09:14','2026-09-20 03:09:14'),(12,7,1,35000.00,0.00,35000.00,'CANCELLED','2026-09-20 04:25:43','2026-09-24 15:30:52'),(13,7,3,850.00,0.00,850.00,'PENDING','2026-09-20 04:25:43','2026-09-20 04:25:43'),(14,8,1,35000.00,0.00,35000.00,'ACCEPTED','2026-09-20 04:38:52','2026-09-24 15:30:47'),(15,9,3,850.00,0.00,850.00,'PENDING','2026-09-24 15:36:08','2026-09-24 15:36:08'),(16,9,6,12500.00,0.00,12500.00,'PENDING','2026-09-24 15:36:08','2026-09-24 15:36:08'),(18,10,1,70000.00,0.00,70000.00,'PENDING','2026-09-24 15:40:36','2026-09-24 15:40:36'),(19,10,5,4500.00,0.00,4500.00,'ACCEPTED','2026-09-24 15:40:36','2026-09-28 03:02:14'),(21,11,1,35000.00,0.00,35000.00,'PENDING','2026-09-24 15:56:47','2026-09-24 15:56:47'),(22,12,3,1700.00,0.00,1700.00,'PENDING','2026-09-24 22:01:14','2026-09-24 22:01:14'),(23,13,1,47500.00,0.00,47500.00,'PENDING','2026-09-27 05:16:20','2026-09-27 05:16:20'),(24,14,2,1800.00,0.00,1800.00,'PENDING','2026-09-27 05:33:31','2026-09-30 03:10:35'),(25,15,10,269.00,0.00,269.00,'PENDING','2026-09-28 00:47:52','2026-09-28 00:47:52'),(26,16,5,498.00,0.00,498.00,'READY','2026-09-28 02:59:43','2026-09-28 03:01:55'),(27,17,10,1500.00,0.00,1500.00,'PENDING','2026-09-28 21:18:41','2026-09-28 21:18:41'),(28,17,5,950.00,0.00,950.00,'DELIVERED','2026-09-28 21:18:41','2026-10-01 01:40:15'),(29,18,2,1800.00,0.00,1800.00,'CANCELLED','2026-09-30 02:27:14','2026-09-30 02:28:31'),(30,19,15,800.00,0.00,800.00,'DELIVERED','2026-09-30 13:31:22','2026-09-30 13:32:02'),(31,20,5,498.00,0.00,498.00,'DELIVERED','2026-09-30 13:33:10','2026-09-30 13:34:13'),(32,21,19,12000.00,0.00,12000.00,'DELIVERED','2026-09-30 15:32:01','2026-09-30 15:32:42');
/*!40000 ALTER TABLE `seller_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_order_status_audit` AFTER UPDATE ON `seller_orders` FOR EACH ROW BEGIN
        IF NOT (OLD.preparation_status <=> NEW.preparation_status) THEN
          INSERT INTO order_status_log (order_id, old_status, new_status)
          VALUES (NEW.order_id, OLD.preparation_status, NEW.preparation_status);
        END IF;
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `seller_payout_requests`
--

DROP TABLE IF EXISTS `seller_payout_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_payout_requests` (
  `payout_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_id` bigint unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payout_method` varchar(50) NOT NULL,
  `account_details` varchar(255) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `admin_note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`payout_id`),
  KEY `fk_payout_seller` (`seller_id`),
  CONSTRAINT `fk_payout_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_payout_requests`
--

LOCK TABLES `seller_payout_requests` WRITE;
/*!40000 ALTER TABLE `seller_payout_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `seller_payout_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_wallets`
--

DROP TABLE IF EXISTS `seller_wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_wallets` (
  `seller_id` bigint unsigned NOT NULL,
  `available_balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `pending_balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_earned` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_withdrawn` decimal(12,2) NOT NULL DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`seller_id`),
  CONSTRAINT `fk_wallets_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_wallets`
--

LOCK TABLES `seller_wallets` WRITE;
/*!40000 ALTER TABLE `seller_wallets` DISABLE KEYS */;
INSERT INTO `seller_wallets` VALUES (1,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(2,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(3,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(4,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(5,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(6,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(7,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(8,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(9,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(10,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(11,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(12,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(13,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(14,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(15,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(16,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(17,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(18,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29'),(19,0.00,0.00,0.00,0.00,'2026-09-30 19:59:29');
/*!40000 ALTER TABLE `seller_wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sellers` (
  `seller_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_name` varchar(100) NOT NULL,
  `shop_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`seller_id`),
  UNIQUE KEY `uq_sellers_shop_name` (`shop_name`),
  UNIQUE KEY `uq_sellers_email` (`email`),
  UNIQUE KEY `uq_sellers_phone` (`phone`),
  CONSTRAINT `chk_sellers_status` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'ACTIVE',_utf8mb4'SUSPENDED',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,'Apex Footwear Ltd','Apex Official Store','seller@apex.com','+8801711223344','$2b$10$.8rlvSRksE1QgoqISSg8oOjdtwp2oa/4FJHnWwWqqope3PdDHroPK','Gulshan-2, Dhaka','ACTIVE','2026-09-10 20:58:26','2026-09-10 20:58:26',NULL),(2,'Sony Official Store','Sony Official Store','vendor.1@loge.com','+880170000001','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(3,'ArtCraft Home','ArtCraft Home','vendor.2@loge.com','+880170000002','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(4,'Apple Authorized BD','Apple Authorized BD','vendor.3@loge.com','+880170000003','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(5,'UrbanEdge Fashion','UrbanEdge Fashion','vendor.4@loge.com','+880170000004','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(6,'Nike BD Official','Nike BD Official','vendor.5@loge.com','+880170000005','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(7,'ComfortWear BD','ComfortWear BD','vendor.6@loge.com','+880170000006','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(8,'TechHub Official','TechHub Official','vendor.7@loge.com','+880170000007','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(9,'ChefMaster Kitchen','ChefMaster Kitchen','vendor.8@loge.com','+880170000008','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(10,'GlowLab Beauty','GlowLab Beauty','vendor.9@loge.com','+880170000009','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(11,'GameZone BD','GameZone BD','vendor.10@loge.com','+8801700000010','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(12,'FlexFit Sports','FlexFit Sports','vendor.11@loge.com','+8801700000011','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(13,'VisionPlus Electronics','VisionPlus Electronics','vendor.12@loge.com','+8801700000012','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(14,'BeanCraft Coffee Co.','BeanCraft Coffee Co.','vendor.13@loge.com','+8801700000013','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(15,'LumaCasa Decor','LumaCasa Decor','vendor.15@loge.com','+8801700000015','$2b$10$Il95qvrZExQZ3V0RQZeNHOSV/CCgGu8Dhvwz5FPM0eRP/PXAT5Fm2','Dhaka, Bangladesh','ACTIVE','2026-09-20 02:39:02','2026-09-20 02:39:02',NULL),(16,'Lionel Andres Messi','Messi\'s Book Hub','goatlm10@gmail.com','01323478583','$2b$10$K/nOnrlFxcxOXxv9aUwEMuOH8ecE5dSbE5xgGCdw.5p1OndYpH5zq','Sony Hall, BUET, West Palashi, Dhaka','ACTIVE','2026-09-28 01:27:14','2026-09-28 01:27:14',NULL),(17,'Joya Mukharjee','Billu Hub','joya@achi.com','01323754210','$2b$10$KpdxzoQZbaKrHW8wqMzR3OhP.dddXPq2bfOEKIJ/sTPZQAA41tECC','West Palashi, BUET, Dhaka','ACTIVE','2026-09-28 01:41:01','2026-09-28 01:41:01',NULL),(18,'Tasnim Zara','Clinical Politics','tasnim99@gmail.com','+8801634933901','$2b$10$WGnz2WqwX.7bcUpvE3AeiuZJ2vMg8E5B6GAyDy05dp34aFEJd39T2','34/B block, Dhanmondi-27, Dhaka, 7430, Bangladesh','ACTIVE','2026-09-28 02:14:48','2026-09-28 02:14:48',NULL),(19,'CSE BUET','BUET MOBILE','csebuet23@loge.com','+8801523478583','$2b$10$mOQMZ.OGiYJEpKzDXJ0Pb.MJd9pZqu9lNSlLizk4/uPaB09eg2ugy','374/3/C, West Shewrapara, Mirpur, Dhaka, 1216, Bangladesh','ACTIVE','2026-09-30 15:29:41','2026-09-30 15:29:41',NULL);
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipments`
--

DROP TABLE IF EXISTS `shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `shipment_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `courier_name` varchar(100) DEFAULT NULL,
  `tracking_number` varchar(150) DEFAULT NULL,
  `shipment_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`shipment_id`),
  UNIQUE KEY `uq_shipments_order` (`order_id`),
  UNIQUE KEY `uq_shipments_tracking` (`tracking_number`),
  CONSTRAINT `fk_shipments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_shipments_status` CHECK ((`shipment_status` in (_utf8mb4'PENDING',_utf8mb4'PACKED',_utf8mb4'SHIPPED',_utf8mb4'OUT_FOR_DELIVERY',_utf8mb4'DELIVERED',_utf8mb4'FAILED',_utf8mb4'RETURNED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_blacklist`
--

DROP TABLE IF EXISTS `token_blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist` (
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklist`
--

LOCK TABLES `token_blacklist` WRITE;
/*!40000 ALTER TABLE `token_blacklist` DISABLE KEYS */;
INSERT INTO `token_blacklist` VALUES ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3ODk4NTc1ODAsImV4cCI6MTc5MDQ2MjM4MH0.5RbbnhnjH-Tnz6GE5boPMeA-iSaGJHKwIycl0Hfb_Lc','2026-09-27 04:39:40'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3ODk4NTIwODksImV4cCI6MTc5MDQ1Njg4OX0.jIhPtXOQeeGRwSgSlOlnhuo6eJnz2pvmYNei5vPItOQ','2026-09-27 03:08:09'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3ODk4NTIxNzIsImV4cCI6MTc5MDQ1Njk3Mn0.bIhnwTfKjWJFeSLEh59sUlGaC8pjLRmZtQMhbznw1Ko','2026-09-27 03:09:32'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA0NjU2MzksImV4cCI6MTc5MTA3MDQzOX0._eP02b9uVVwOH9SsVFqxVYJuhMIGO7voweXww-9iV80','2026-10-04 05:33:59'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA0NjU3NjMsImV4cCI6MTc5MTA3MDU2M30.oO0Hgy_a-44b6ZTAOj2OMS7qs22_I88_MWZGvtvT03k','2026-10-04 05:36:03'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA0NjU4NDgsImV4cCI6MTc5MTA3MDY0OH0.9pDg-mjnEYVubWthREoCKNoOMf0j1UOz0vXjgCc4f9E','2026-10-04 05:37:28'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA3NTI2NzEsImV4cCI6MTc5MTM1NzQ3MX0.Y9DTUy3KQS4AEzb5QIKwbLW2NxleLute9gODeEDIPZQ','2026-10-07 13:17:51'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTAyNDI4NjcsImV4cCI6MTc5MDg0NzY2N30.C5AqwGLqggsQr4t8HX7YeFx2OOL1T7_XRvCVDyG6Od0','2026-10-01 15:41:07'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJ2ZW5kb3IuMUBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTAyNjU3NTUsImV4cCI6MTc5MDg3MDU1NX0.yXpl7Good5LU1zSQYSIMXThAxaXz6bFoseJza_BiwVU','2026-10-01 22:02:35'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4OTg0OTUxNSwiZXhwIjoxNzkwNDU0MzE1fQ.J_syUPITjjeY37aN5Jxv1Ws7j2r9MNuZYvvggKMf1nI','2026-09-27 02:25:15'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4OTg1MjIzMCwiZXhwIjoxNzkwNDU3MDMwfQ.EhLajknuJWv6F8-_sBi81IC-jyMmnVAU2U9QvhtVZFw','2026-09-27 03:10:30'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4OTg1NzYwMSwiZXhwIjoxNzkwNDYyNDAxfQ.65joGqxDAUfOJKyJA8urDpYRE7qMxt_MksWMWuH9mQs','2026-09-27 04:40:01'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDc2MjkwOCwiZXhwIjoxNzkxMzY3NzA4fQ.mL85kjgsumcpT0lq74pxCnZ83aY0r_eJJKAHVZ8zGHo','2026-10-07 16:08:28'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDI0Mjg4MywiZXhwIjoxNzkwODQ3NjgzfQ.fcbn7pJIsDF8I_FqpqPPoA00ixNhd7R0BNV4YAIhNRo','2026-10-01 15:41:23'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDI0MjYzNywiZXhwIjoxNzkwODQ3NDM3fQ.Lou87ry-JOhc3V0bG6AlBCmsCYzHpv-jY4v9_9OcjvE','2026-10-01 15:37:17'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDI0MTg3OCwiZXhwIjoxNzkwODQ2Njc4fQ.66Comho4j_ufw63h78vXUZP2Pezh6fkQ5-dQqeJbeLk','2026-10-01 15:24:38'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDU0MDAwOSwiZXhwIjoxNzkxMTQ0ODA5fQ.jSadMt96tPJAkcybWXqduWfLq_k9JKzXPE0Aud7qIS0','2026-10-05 02:13:29'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDU0Mjk4NiwiZXhwIjoxNzkxMTQ3Nzg2fQ.7sFg5n_LsGORsJNcLFFNDd0C0Up7K-ZaAyLqUcPh86I','2026-10-05 03:03:06'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDU0NTczNSwiZXhwIjoxNzkxMTUwNTM1fQ.ypLdcE63W-vgkAD1bY10V1Ot6V2vjUIirrxnJdbHFoc','2026-10-05 03:48:55'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDU0NTE1MCwiZXhwIjoxNzkxMTQ5OTUwfQ.glFtculH3LEDou4v4ZG4bd3t9Fi-kl64BuNiaweXHxo','2026-10-05 03:39:10'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDUzNzI3NiwiZXhwIjoxNzkxMTQyMDc2fQ.-Lkcw2Qli_LD6yN61Fw6PXSIvCgsoBQIiBmj1hySMAM','2026-10-05 01:27:56'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDUzODExMywiZXhwIjoxNzkxMTQyOTEzfQ.KxjUHqQcmB0M91l2w5bCQnwj6h04XvKKkwg2ZkUbSm0','2026-10-05 01:41:53'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDYwODc4MywiZXhwIjoxNzkxMjEzNTgzfQ.trQQd-DcFkPVeE8sc3Pj9palX2OrT9ot33flTdulig0','2026-10-05 21:19:43'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsb2dlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDYyMTE1NSwiZXhwIjoxNzkxMjI1OTU1fQ.nz4OcUw20AGwuMbuf5kGvrrXS9Y1KKk-9jhm_ovTL6M','2026-10-06 00:45:55'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzZWxsZXJAYXBleC5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzg5ODQ5MzM2LCJleHAiOjE3OTA0NTQxMzZ9.WE9go2Le-KYluowy44ckeh4r9CIpb38pXEJHb9b09PQ','2026-09-27 02:22:16'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzZWxsZXJAYXBleC5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzg5ODUxMDIwLCJleHAiOjE3OTA0NTU4MjB9.e-xs1Ory1F04Ma4u9YVdnpFgcvt-nUiW8b4m243bs18','2026-09-27 02:50:20'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzZWxsZXJAYXBleC5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzkwMjQxNTIyLCJleHAiOjE3OTA4NDYzMjJ9.4O4DDl5ZIKMh5jjQ4aOXlua-6C24G0zNJ1aRg0gmAwY','2026-10-01 15:18:42'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzZWxsZXJAYXBleC5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzkwMjQyMjE5LCJleHAiOjE3OTA4NDcwMTl9.EJHhDWvx1lVSljeWHPGFLogC3QbbCM5KJwoBRJp3uwI','2026-10-01 15:30:19'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzZWxsZXJAYXBleC5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzkwMjQyNjE3LCJleHAiOjE3OTA4NDc0MTd9.bBT6_2dzTpocqVWR2I6Nl3SJ0E17t_BuKykzaCPfSgA','2026-10-01 15:36:57'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoidmVuZG9yLjlAbG9nZS5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzkwNTMyOTQzLCJleHAiOjE3OTExMzc3NDN9.mCQomLVUaWo3AVDqwnv-guUEm8rVqBKnxhCvPnjK1TM','2026-10-05 00:15:43'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoidmVuZG9yLjlAbG9nZS5jb20iLCJyb2xlIjoiU0VMTEVSIiwiaWF0IjoxNzkwNzUzNDEwLCJleHAiOjE3OTEzNTgyMTB9.bXfO-OcZjRxSKVuL_BhuK9sGLofhaYnKxLN6MGtLiNU','2026-10-07 13:30:10'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImVtYWlsIjoidmVuZG9yLjEwQGxvZ2UuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDUzMjg3OCwiZXhwIjoxNzkxMTM3Njc4fQ.gvNmdZpi5YPkpb_Rw6WG2Nb1pOzk0QEzUluPPPiYxFc','2026-10-05 00:14:38'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImVtYWlsIjoidGFzbmltOTlAZ21haWwuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDU0MDE4NSwiZXhwIjoxNzkxMTQ0OTg1fQ.lP6K3GjFjkFccpMOSuQezhjbIs95VO1rHXWeZ_3cvgY','2026-10-05 02:16:25'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImVtYWlsIjoidGFzbmltOTlAZ21haWwuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDU0MTU0MiwiZXhwIjoxNzkxMTQ2MzQyfQ.I-uo6ZHyGVWHpTQx7FWADr6n4UGa88UFBJI3qxxg0Jg','2026-10-05 02:39:02'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsImVtYWlsIjoidmVuZG9yLjEyQGxvZ2UuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDUzMjg0OSwiZXhwIjoxNzkxMTM3NjQ5fQ.K7qcEsi95ibHkDvHdc8wf9ky6PaoFkDt2SpMsiEkOqc','2026-10-05 00:14:09'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoidmVuZG9yLjE1QGxvZ2UuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDc1MzE2MSwiZXhwIjoxNzkxMzU3OTYxfQ.U6er0vvNL-wO6WtF6pReOGUwG6m00gXVIUmWAlhxDMw','2026-10-07 13:26:01'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoidmVuZG9yLjE1QGxvZ2UuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDc1MzUwMSwiZXhwIjoxNzkxMzU4MzAxfQ._HRvEkzAyzu2H6Brfs5HGT68SiChiNMgxqjPpf8nPpw','2026-10-07 13:31:41'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoidmVuZG9yLjE1QGxvZ2UuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDc1NDIyNywiZXhwIjoxNzkxMzU5MDI3fQ.yMbFfeU32t9Of21DD_rd9z8Y9oqyo7XJiWtx5h-X7lc','2026-10-07 13:43:47'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoiZ29hdGxtMTBAZ21haWwuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc5MDUzNzIzNCwiZXhwIjoxNzkxMTQyMDM0fQ.0O6AN9Dr-5CYdleVti3TWe23m2oWe2XJJXlQ54unvXs','2026-10-05 01:27:14'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ2ZW5kb3IuMkBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA1MTk3NjYsImV4cCI6MTc5MTEyNDU2Nn0.TD_7xU9u3vnilV1LxKhTRajNHeZGxaY3glS9Z5VaCd0','2026-10-04 20:36:06'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc4OTAyMDk1MSwiZXhwIjoxNzg5NjI1NzUxfQ.1eCSO90kJBWLTOPUjDTZtbqqnkgNSYvBiwuvc7-cl_s','2026-09-17 12:15:51'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc4OTg0NzkyOSwiZXhwIjoxNzkwNDUyNzI5fQ.BDWf6cGxjfkH-K1ipI4z9tpv77BxzjT4I5kQr8VZyxM','2026-09-27 01:58:49'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDU0NTIxNiwiZXhwIjoxNzkxMTUwMDE2fQ.twgg4T1AD3QNTLL6oov0DWbyAduSfFmmNUiQE7mNi_w','2026-10-05 03:40:16'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDUyMTA2NywiZXhwIjoxNzkxMTI1ODY3fQ.6otO0Y5m7Hw7Ynt6UhnmmiKAq_QpoZBG1DAnp52svQo','2026-10-04 20:57:47'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDUyODI5NSwiZXhwIjoxNzkxMTMzMDk1fQ.XzxMe3wP7q7IQBgWcTe9aDnPMIzxPoJ7J6LcxNo-4Ag','2026-10-04 22:58:15'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDUzMTY0MCwiZXhwIjoxNzkxMTM2NDQwfQ.kByKzAmYEqgUW5nrcupXkBA63hmUDwJxo5IrH9UluAQ','2026-10-04 23:54:00'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJraW5nQHlhaG9vLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDUzMzMyNSwiZXhwIjoxNzkxMTM4MTI1fQ.Wy8mAqhUQyygfqJtmvcboES1ANMCAxQSNhn2YXpG6wg','2026-10-05 00:22:05'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ2ZW5kb3IuNEBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA1MjgzMTksImV4cCI6MTc5MTEzMzExOX0.RCg876Uu3Vey9Eo1YgfHJ3prs5R9V5GI0zrK3PmI4DM','2026-10-04 22:58:39'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ2ZW5kb3IuNEBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA1NDI5MDAsImV4cCI6MTc5MTE0NzcwMH0.IQxsKrcw01mfAUVAhzHp7WdaHshtBeNm0wNHbbi8vpU','2026-10-05 03:01:40'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ2ZW5kb3IuNEBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA1NDMwNDksImV4cCI6MTc5MTE0Nzg0OX0._PkCO1tHYGgxbE1rAxHR_CLDNJ3GjA_o4xiAPCFifu0','2026-10-05 03:04:09'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ2ZW5kb3IuNEBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA2MDg3NDksImV4cCI6MTc5MTIxMzU0OX0.AVCMO7mJnv4qK_jr1iZhsWutJEXP1BZqbGQyIpIAdaM','2026-10-05 21:19:09'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ2ZW5kb3IuNEBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA3NTM2NDQsImV4cCI6MTc5MTM1ODQ0NH0.lKxfToy7gH6BizV5uXcJUe1BSYY8fTjKmn0xSB4dIMs','2026-10-07 13:34:04'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ2ZW5kb3IuNEBsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA3OTQ3MDIsImV4cCI6MTc5MTM5OTUwMn0.KeCceWkpRfSmeWf1xMYLUINQ2mzAY_XU-nh1htjl-ds','2026-10-08 00:58:22'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc4OTg1MjExMiwiZXhwIjoxNzkwNDU2OTEyfQ.s9AMyRJzW81hAvnLDF1NfGfdKiVISIxat3hwSfbqSm4','2026-09-27 03:08:32'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc4OTg1MTkxMCwiZXhwIjoxNzkwNDU2NzEwfQ.LkM02tNCSvbNOLC1448vI-BEJxSS_POaGaSdPqZBW5c','2026-09-27 03:05:10'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDcwNDU3NiwiZXhwIjoxNzkxMzA5Mzc2fQ.-C1GaxahOHujQHtBIVpY0_QNhy8I4jgMZe_LBb3Ct70','2026-10-06 23:56:16'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDI0Mjc1NiwiZXhwIjoxNzkwODQ3NTU2fQ.vzA5Ij-ZB8V6rWZkfTKPvcZ8c5C3482ztCVt-cetbic','2026-10-01 15:39:16'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NDgyNywiZXhwIjoxNzkxMDY5NjI3fQ.kIA3qPG3Jhvw89dTFL82L0P4V0innpQgdwh_ox4IqG4','2026-10-04 05:20:27'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NjE2MCwiZXhwIjoxNzkxMDcwOTYwfQ.inJJKPcAUWrQtpE-X52D8PqtJ9i1uPX2AUQsC8wHVn8','2026-10-04 05:42:40'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NjE3OSwiZXhwIjoxNzkxMDcwOTc5fQ.Ow0esJ97EfpVuPpLUisdo7z0Rc-nSNJGQP6dRkRDy4s','2026-10-04 05:42:59'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NjE5NiwiZXhwIjoxNzkxMDcwOTk2fQ.3RT_ttEglhquFNzBFuMFRzfUZoOSz9tSCscNfq4xIpk','2026-10-04 05:43:16'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NjkzMiwiZXhwIjoxNzkxMDcxNzMyfQ.NpSM54UZMmZuuhBKjSs89KrLTK3EF2y80IC5lEyuDzM','2026-10-04 05:55:32'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NTc5OCwiZXhwIjoxNzkxMDcwNTk4fQ.GJSas5f5_r1-XmWCHIMtECQXwIEOt5fC_KK2CDkbXiw','2026-10-04 05:36:38'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NTczNywiZXhwIjoxNzkxMDcwNTM3fQ.KsmZRSuIFi9Qh96Rl1hgeRwEjJltCV0A9plSHKUC4Ek','2026-10-04 05:35:37'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDQ2NTg5MiwiZXhwIjoxNzkxMDcwNjkyfQ.CghGSw-cP7Am13w4A-l_f-HDvPLe9-CENK69RSPLgrY','2026-10-04 05:38:12'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDU0NDUzMywiZXhwIjoxNzkxMTQ5MzMzfQ.haKdbdT6OZa1RKuKA0b3QiZe6fmxJ61THSfguA-Rq8M','2026-10-05 03:28:53'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDU0NTA2NywiZXhwIjoxNzkxMTQ5ODY3fQ.ljkziRcGKn4XRsfm0vCxSj2hxr0IaxTpkjMxBEH-_IY','2026-10-05 03:37:47'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDYwODY0OCwiZXhwIjoxNzkxMjEzNDQ4fQ.0Z8smmotNfRGQiYX_kpy3gvlv-z-Tk0LjYO4ojn7nJo','2026-10-05 21:17:28'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJjdXN0b21lckBsb2dlLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDYyMTg0NiwiZXhwIjoxNzkxMjI2NjQ2fQ.v-utoL7LMsPQvuvQ05cHHY2U5Xcr04j8YiJRwBzQpRk','2026-10-06 00:57:26'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJ0cmlzaGFnaG9zaDc0MzZAZ21haWwuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzkwMjQyNDcwLCJleHAiOjE3OTA4NDcyNzB9.XuTkgiESIFxBO5gTAqlS7Sl6LasroVxluhoWcW5aZtA','2026-10-01 15:34:30'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJ2ZW5kb3IuN0Bsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA1MzI4OTEsImV4cCI6MTc5MTEzNzY5MX0.paIr_bxmmSn4UDJs7Ez0mDV0dHZWSJCJlxBuZhokfyo','2026-10-05 00:14:51'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJ2ZW5kb3IuN0Bsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA1MzUwODMsImV4cCI6MTc5MTEzOTg4M30.p-zRZ59ix16OhYU901PqlFGjMwtCRaPP5Mxdc_VGkCo','2026-10-05 00:51:23'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJ2ZW5kb3IuN0Bsb2dlLmNvbSIsInJvbGUiOiJTRUxMRVIiLCJpYXQiOjE3OTA2MDg2MjYsImV4cCI6MTc5MTIxMzQyNn0.AuEjc0hkbYUmyO86kXWe6tO6Vqgr9Cvw-VImzn8gIS0','2026-10-05 21:17:06'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzaHJpdmlrNjM2QGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDU0MjY3NiwiZXhwIjoxNzkxMTQ3NDc2fQ.5tc4qRlGyeVclnVyOSlMmB7a8lM29ytzidnX_xaOPYc','2026-10-05 02:57:56'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzaHJpdmlrNjM2QGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDU0MzA4NSwiZXhwIjoxNzkxMTQ3ODg1fQ.HNT9EBMxIQp7iEZhG4m56197vdcrfUE6m_QecpLF4uc','2026-10-05 03:04:45'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzaHJpdmlrNjM2QGdtYWlsLmNvbSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5MDU0NTA5NCwiZXhwIjoxNzkxMTQ5ODk0fQ.U_wUQQliJhrnMBIzbRuVjok6KtlDfK6aWYOlwLqGyuc','2026-10-05 03:38:14'),('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJjc2VidWV0QGxvZ2UuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzkwNzYwNDU3LCJleHAiOjE3OTEzNjUyNTd9.TyMNwE73evKvFV2p-7ZcS2GECAFNZ6usflIiYPGqsSs','2026-10-07 15:27:37');
/*!40000 ALTER TABLE `token_blacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `customer_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`,`product_id`),
  KEY `fk_wishlist_items_product` (`product_id`),
  CONSTRAINT `fk_wishlist_items_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlist_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES (4,22,'2026-09-28 00:47:31'),(4,23,'2026-09-28 00:50:34');
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'loge_achi_db'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_product_avg_rating` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_product_avg_rating`(p_product_id BIGINT UNSIGNED) RETURNS decimal(3,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
        DECLARE v_avg DECIMAL(3,2);
        
        SELECT COALESCE(AVG(r.rating), 0)
        INTO v_avg
        FROM reviews r
        JOIN order_items oi ON r.order_item_id = oi.order_item_id
        WHERE oi.product_id = p_product_id
          AND r.review_status = 'PUBLISHED';
        
        RETURN v_avg;
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_seller_revenue` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_seller_revenue`(p_seller_id BIGINT UNSIGNED) RETURNS decimal(14,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
        DECLARE v_revenue DECIMAL(14,2);
        
        SELECT COALESCE(SUM(so.seller_total), 0)
        INTO v_revenue
        FROM seller_orders so
        JOIN orders o ON so.order_id = o.order_id
        WHERE so.seller_id = p_seller_id
          AND o.order_status != 'CANCELLED'
          AND so.preparation_status != 'CANCELLED';
        
        RETURN v_revenue;
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_place_order` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_place_order`(
        IN p_customer_id BIGINT UNSIGNED,
        IN p_address_id BIGINT UNSIGNED,
        IN p_payment_method VARCHAR(30),
        OUT p_order_id BIGINT UNSIGNED,
        OUT p_grand_total DECIMAL(12,2),
        OUT p_result_message VARCHAR(255)
      )
proc: BEGIN
        DECLARE v_cart_id BIGINT UNSIGNED;
        DECLARE v_item_count INT DEFAULT 0;
        DECLARE v_items_subtotal DECIMAL(12,2) DEFAULT 0;
        DECLARE v_shipping_fee DECIMAL(12,2) DEFAULT 0;
        DECLARE v_grand_total DECIMAL(12,2) DEFAULT 0;
        DECLARE v_txn_id VARCHAR(150);
        DECLARE v_payment_status VARCHAR(30);
        
        DECLARE v_recipient_name VARCHAR(100);
        DECLARE v_phone VARCHAR(20);
        DECLARE v_addr1 VARCHAR(255);
        DECLARE v_addr2 VARCHAR(255);
        DECLARE v_city VARCHAR(100);
        DECLARE v_postal VARCHAR(20);
        DECLARE v_country VARCHAR(100);
        
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
          SET p_order_id = 0;
          SET p_grand_total = 0;
          SET p_result_message = 'Transaction failed - rolled back';
        END;
        
        START TRANSACTION;
        
        SELECT recipient_name, phone, address_line1, address_line2, city, postal_code, country
        INTO v_recipient_name, v_phone, v_addr1, v_addr2, v_city, v_postal, v_country
        FROM customer_addresses
        WHERE address_id = p_address_id AND customer_id = p_customer_id;
        
        IF v_recipient_name IS NULL THEN
          ROLLBACK;
          SET p_order_id = 0;
          SET p_grand_total = 0;
          SET p_result_message = 'Address not found';
          LEAVE proc;
        END IF;
        
        SELECT cart_id INTO v_cart_id
        FROM carts WHERE customer_id = p_customer_id;
        
        SELECT COUNT(*) INTO v_item_count
        FROM cart_items WHERE cart_id = v_cart_id;
        
        IF v_item_count = 0 THEN
          ROLLBACK;
          SET p_order_id = 0;
          SET p_grand_total = 0;
          SET p_result_message = 'Cart is empty';
          LEAVE proc;
        END IF;

        IF EXISTS (
          SELECT 1 FROM cart_items ci
          JOIN products p ON ci.product_id = p.product_id
          WHERE ci.cart_id = v_cart_id AND ci.quantity > p.stock_quantity
        ) THEN
          ROLLBACK;
          SET p_order_id = 0;
          SET p_grand_total = 0;
          SET p_result_message = 'Insufficient stock for one or more items in cart';
          LEAVE proc;
        END IF;

        SELECT SUM(p.price * ci.quantity) INTO v_items_subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE';
        
        SET v_grand_total = v_items_subtotal + v_shipping_fee;
        
        INSERT INTO orders (
          customer_id, items_subtotal, discount_total, shipping_fee, grand_total,
          order_status, shipping_name, shipping_phone, shipping_address_line1,
          shipping_address_line2, shipping_city, shipping_postal_code, shipping_country
        ) VALUES (
          p_customer_id, v_items_subtotal, 0, v_shipping_fee, v_grand_total,
          'PENDING_PAYMENT', v_recipient_name, v_phone, v_addr1,
          v_addr2, v_city, v_postal, COALESCE(v_country, 'Bangladesh')
        );
        
        SET p_order_id = LAST_INSERT_ID();
        SET p_grand_total = v_grand_total;
        
        INSERT INTO seller_orders (order_id, seller_id, items_subtotal, discount_total, seller_total, preparation_status)
        SELECT p_order_id, p.seller_id,
               SUM(p.price * ci.quantity),
               0,
               SUM(p.price * ci.quantity),
               'PENDING'
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE'
        GROUP BY p.seller_id;
        
        INSERT INTO order_items (
          seller_order_id, product_id, product_name_snapshot, sku_snapshot,
          quantity, unit_price, discount_amount, line_total
        )
        SELECT so.seller_order_id, ci.product_id, p.product_name, p.sku,
               ci.quantity, p.price, 0, (p.price * ci.quantity)
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        JOIN seller_orders so ON so.order_id = p_order_id AND so.seller_id = p.seller_id
        WHERE ci.cart_id = v_cart_id AND p.status = 'ACTIVE';
        
        UPDATE products p
        JOIN cart_items ci ON p.product_id = ci.product_id
        SET p.stock_quantity = p.stock_quantity - ci.quantity
        WHERE ci.cart_id = v_cart_id;
        
        SET v_txn_id = CONCAT('TXN-', UNIX_TIMESTAMP(), '-', FLOOR(1000 + RAND() * 9000));
        SET v_payment_status = IF(p_payment_method = 'CASH_ON_DELIVERY', 'PENDING', 'SUCCESS');
        
        INSERT INTO payments (
          order_id, transaction_id, payment_method, payment_provider, amount, payment_status, paid_at
        ) VALUES (
          p_order_id, v_txn_id, p_payment_method,
          IF(p_payment_method = 'CASH_ON_DELIVERY', 'COD', 'SSLCOMMERZ'),
          v_grand_total, v_payment_status,
          IF(p_payment_method = 'CASH_ON_DELIVERY', NULL, NOW())
        );
        
        DELETE FROM cart_items WHERE cart_id = v_cart_id;
        
        COMMIT;
        SET p_result_message = 'Order placed successfully';
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_seller_dashboard` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_seller_dashboard`(
        IN p_seller_id BIGINT UNSIGNED
      )
BEGIN
        SELECT 
          COUNT(DISTINCT p.product_id) AS total_products,
          COUNT(DISTINCT CASE WHEN p.status = 'ACTIVE' THEN p.product_id END) AS active_products,
          COUNT(DISTINCT so.seller_order_id) AS total_orders,
          COUNT(DISTINCT CASE WHEN so.preparation_status = 'PENDING' THEN so.seller_order_id END) AS pending_orders,
          COALESCE(fn_seller_revenue(p_seller_id), 0) AS total_revenue,
          COALESCE(AVG(r.rating), 0) AS avg_rating,
          COUNT(DISTINCT r.review_id) AS total_reviews
        FROM sellers s
        LEFT JOIN products p ON s.seller_id = p.seller_id
        LEFT JOIN seller_orders so ON s.seller_id = so.seller_id
        LEFT JOIN order_items oi ON so.seller_order_id = oi.seller_order_id
        LEFT JOIN reviews r ON oi.order_item_id = r.order_item_id AND r.review_status = 'PUBLISHED'
        WHERE s.seller_id = p_seller_id;
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-01  3:21:23
