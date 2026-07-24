CREATE TABLE `calibrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`userId` int,
	`rankings` json NOT NULL,
	`calibratedScores` json NOT NULL,
	`calibratedRole` varchar(64) NOT NULL,
	`originalScores` json,
	`originalRole` varchar(64),
	`confidenceScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calibrations_id` PRIMARY KEY(`id`)
);
