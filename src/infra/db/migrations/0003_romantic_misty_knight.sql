CREATE TABLE `trip_offer_records` (
	`id` text PRIMARY KEY NOT NULL,
	`platform_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`date` integer NOT NULL,
	`offered_fare` real NOT NULL,
	`estimated_distance` real NOT NULL,
	`deadhead_distance` real NOT NULL,
	`estimated_duration` real NOT NULL,
	`deadhead_duration` real NOT NULL,
	`passenger_rating` real,
	`notes` text,
	FOREIGN KEY (`platform_id`) REFERENCES `trip_platforms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
