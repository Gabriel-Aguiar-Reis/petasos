CREATE TABLE `fuel_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `trip_platforms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `vehicle_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tags` text
);
