CREATE TABLE `planned_absences` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`date` integer NOT NULL,
	`end_date` integer,
	`worked_days` text,
	`cancelled_at` integer,
	`notes` text
);
