CREATE TABLE `soulprint_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`userId` int,
	`soulprintData` json NOT NULL,
	`enneagramType` varchar(64),
	`enneagramWing` varchar(64),
	`humanDesignType` varchar(64),
	`humanDesignProfile` varchar(64),
	`enabled` boolean DEFAULT false,
	`showInTeam` boolean DEFAULT false,
	`consentGiven` boolean DEFAULT false,
	`adminHidden` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `soulprint_profiles_id` PRIMARY KEY(`id`)
);
