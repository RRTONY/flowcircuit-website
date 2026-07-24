ALTER TABLE `feedback` ADD `isTestimonial` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `feedback` ADD `testimonialApproved` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `feedback` ADD `testimonialQuote` text;--> statement-breakpoint
ALTER TABLE `feedback` ADD `authorTitle` varchar(255);--> statement-breakpoint
ALTER TABLE `feedback` ADD `authorCompany` varchar(255);--> statement-breakpoint
ALTER TABLE `feedback` ADD `flowCircuitRole` varchar(64);