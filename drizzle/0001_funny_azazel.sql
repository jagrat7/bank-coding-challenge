CREATE TABLE `bank-coding-challange_statement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(255) NOT NULL,
	`content` text NOT NULL,
	`process_stage` text DEFAULT 'uploaded' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
