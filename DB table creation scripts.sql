CREATE TABLE `user` (
  `UserID` bigint NOT NULL AUTO_INCREMENT,
  `FirebaseUID` varchar(45) NOT NULL,
  `JoinedDate` datetime NOT NULL,
  `Username` varchar(45) NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID_UNIQUE` (`UserID`),
  UNIQUE KEY `FirebaseUID_UNIQUE` (`FirebaseUID`),
  UNIQUE KEY `Username_UNIQUE` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `package` (
  `PackageID` bigint NOT NULL AUTO_INCREMENT,
  `Description` varchar(45) DEFAULT NULL,
  `LikeCount` int DEFAULT '0',
  `ShareCount` int DEFAULT '0',
  `UserID` bigint NOT NULL,
  `CreatedDate` datetime NOT NULL,
  PRIMARY KEY (`PackageID`,`UserID`),
  KEY `FK_PACKAGE_USER_ID_idx` (`UserID`),
  CONSTRAINT `FK_PACKAGE_USER_ID` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `like` (
  `UserID` bigint NOT NULL,
  `PackageID` bigint NOT NULL,
  PRIMARY KEY (`UserID`,`PackageID`),
  KEY `FK_LIKE_PACKAGE_ID_idx` (`PackageID`),
  CONSTRAINT `FK_LIKE_PACKAGE_ID` FOREIGN KEY (`PackageID`) REFERENCES `package` (`PackageID`) ON UPDATE CASCADE,
  CONSTRAINT `FK_LIKE_USER_ID` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `alarm` (
  `AlarmID` bigint NOT NULL AUTO_INCREMENT,
  `Time` time NOT NULL,
  `Description` varchar(45) DEFAULT NULL,
  `RepeatDay` varchar(7) DEFAULT NULL,
  `Sound` varchar(45) DEFAULT NULL,
  `Vibrate` tinyint DEFAULT '0',
  `Snooze` tinyint DEFAULT '0',
  `PackageID` bigint NOT NULL,
  `UserID` bigint DEFAULT NULL,
  PRIMARY KEY (`AlarmID`),
  UNIQUE KEY `AlarmID_UNIQUE` (`AlarmID`),
  KEY `FK_ALARM_PACKAGE_ID_idx` (`PackageID`),
  CONSTRAINT `FK_ALARM_PACKAGE_ID` FOREIGN KEY (`PackageID`) REFERENCES `package` (`PackageID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;