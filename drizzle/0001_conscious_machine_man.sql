CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`teamId` int,
	`guestName` varchar(255),
	`guestEmail` varchar(320),
	`role` varchar(64) NOT NULL,
	`score` int NOT NULL,
	`answers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(16) NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerId` int NOT NULL,
	`logoUrl` text,
	`slackWebhookUrl` text,
	`weeklyReportEnabled` boolean DEFAULT false,
	`weeklyReportEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`),
	CONSTRAINT `teams_code_unique` UNIQUE(`code`)
);
