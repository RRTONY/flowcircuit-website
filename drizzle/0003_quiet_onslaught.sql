ALTER TABLE `assessments` ADD `domain` varchar(255);--> statement-breakpoint
ALTER TABLE `teams` ADD `domain` varchar(255);--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_domain_unique` UNIQUE(`domain`);