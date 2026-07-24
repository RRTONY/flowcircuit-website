CREATE TABLE `email_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(8) NOT NULL,
	`assessmentId` int,
	`verified` boolean DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peer_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetAssessmentId` int NOT NULL,
	`targetName` varchar(255) NOT NULL,
	`reviewerName` varchar(255) NOT NULL,
	`reviewerEmail` varchar(320) NOT NULL,
	`perceivedRole` varchar(64) NOT NULL,
	`perceivedScores` json,
	`answers` json,
	`inviteToken` varchar(32) NOT NULL,
	`completed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `peer_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `peer_reviews_inviteToken_unique` UNIQUE(`inviteToken`)
);
