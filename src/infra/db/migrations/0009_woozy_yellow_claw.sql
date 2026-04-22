CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`date` integer NOT NULL,
	`alarm` integer DEFAULT false NOT NULL,
	`recurrence_rule` text,
	`recurrence_end_date` integer,
	`recurrence_exceptions` text,
	`notes` text
);
