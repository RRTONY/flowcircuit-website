CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int,
	`teamId` int,
	`authorName` varchar(255) NOT NULL,
	`authorEmail` varchar(320),
	`accuracyRating` int,
	`comment` text,
	`teamInsightRating` int,
	`teamComment` text,
	`wouldRecommend` boolean,
	`suggestion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assessments` ADD `scores` json;--> statement-breakpoint
ALTER TABLE `assessments` ADD `birthDate` varchar(16);--> statement-breakpoint
ALTER TABLE `assessments` ADD `birthTime` varchar(8);--> statement-breakpoint
ALTER TABLE `assessments` ADD `birthCity` varchar(255);--> statement-breakpoint
ALTER TABLE `assessments` ADD `soulprintData` json;--> statement-breakpoint
ALTER TABLE `assessments` ADD `shareToken` varchar(32);--> statement-breakpoint
ALTER TABLE `assessments` ADD `isPublic` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `teams` ADD `companyName` varchar(255);--> statement-breakpoint
ALTER TABLE `teams` ADD `maxMembers` int DEFAULT 25;--> statement-breakpoint
ALTER TABLE `teams` ADD `isAlpha` boolean DEFAULT true;