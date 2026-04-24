CREATE TABLE `platform_profit_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`platform_id` text NOT NULL,
	`target_amount` real NOT NULL,
	`tags` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `trip_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saved_profit_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_amount` real NOT NULL,
	`period` text,
	`tags` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profits` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`amount` real NOT NULL,
	`platform_id` text NOT NULL,
	`description` text,
	`tags` text,
	FOREIGN KEY (`platform_id`) REFERENCES `trip_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`preferred_units` text DEFAULT 'km/l' NOT NULL,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`display_preferences` text NOT NULL,
	`starred_screen` text,
	`trip_offer_pill` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `trips` ADD `platform_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` DROP COLUMN `platform`;