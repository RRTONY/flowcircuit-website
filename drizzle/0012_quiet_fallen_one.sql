CREATE TABLE `team_affiliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamDomain` varchar(255) NOT NULL,
	`assessmentId` int NOT NULL,
	`label` varchar(64) DEFAULT 'candidate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_affiliations_id` PRIMARY KEY(`id`)
);
