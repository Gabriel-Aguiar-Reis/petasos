CREATE TABLE `costs` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fuel_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`fuel_type` text NOT NULL,
	`liters` real NOT NULL,
	`total_price` real NOT NULL,
	`odometer` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`target_amount` real NOT NULL,
	`period_start` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`plate` text
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`earnings` real NOT NULL,
	`platform` text NOT NULL,
	`distance` real,
	`duration` integer,
	`origin` text,
	`destination` text,
	`vehicle_id` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer
);
