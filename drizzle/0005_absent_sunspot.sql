CREATE TABLE `email_drips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`assessmentId` int,
	`domain` varchar(255),
	`role` varchar(64),
	`day1Sent` boolean DEFAULT false,
	`day1SentAt` timestamp,
	`day3Sent` boolean DEFAULT false,
	`day3SentAt` timestamp,
	`day7Sent` boolean DEFAULT false,
	`day7SentAt` timestamp,
	`unsubscribed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_drips_id` PRIMARY KEY(`id`)
);
