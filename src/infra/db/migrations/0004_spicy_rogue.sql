CREATE TABLE `fuel_consumption_records` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`fuel_type_id` text NOT NULL,
	`date` integer NOT NULL,
	`start_mileage` integer NOT NULL,
	`end_mileage` integer NOT NULL,
	`fuel_added` real NOT NULL,
	`average_consumption` real NOT NULL,
	`gauge_before` real,
	`gauge_after` real,
	`gauge_total_capacity` real,
	`tags` text,
	`notes` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fuel_price_records` (
	`id` text PRIMARY KEY NOT NULL,
	`fuel_type_id` text NOT NULL,
	`date` integer NOT NULL,
	`price_per_liter` real NOT NULL,
	`notes` text,
	FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types`(`id`) ON UPDATE no action ON DELETE no action
);
