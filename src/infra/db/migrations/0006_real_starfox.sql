CREATE TABLE `maintenances` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`title` text NOT NULL,
	`estimated_cost` real NOT NULL,
	`trigger_type` text NOT NULL,
	`trigger_date` integer,
	`trigger_mileage` real,
	`completed_at` integer,
	`notes` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
