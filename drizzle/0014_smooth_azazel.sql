CREATE TABLE `tribe_trials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255) NOT NULL,
	`userId` int,
	`teamId` int,
	`status` enum('active','expired','converted','cancelled') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`convertedAt` timestamp,
	`cancelledAt` timestamp,
	`source` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tribe_trials_id` PRIMARY KEY(`id`)
);
