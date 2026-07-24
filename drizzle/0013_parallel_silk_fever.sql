CREATE TABLE `flow_360_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`reviewerName` varchar(255),
	`reviewerEmail` varchar(320),
	`reviewerRelationship` varchar(128),
	`sparkRank` int NOT NULL,
	`amplifierRank` int NOT NULL,
	`filterRank` int NOT NULL,
	`groundRank` int NOT NULL,
	`conductorRank` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flow_360_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flow_360_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectName` varchar(255) NOT NULL,
	`subjectEmail` varchar(320),
	`subjectAssessmentId` int,
	`subjectUserId` int,
	`token` varchar(64) NOT NULL,
	`teamSlug` varchar(255),
	`selfScores` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `flow_360_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `flow_360_sessions_token_unique` UNIQUE(`token`)
);
