CREATE TABLE `bank-coding-challange_statement_insight` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`statement_id` integer NOT NULL,
	`insight` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `bank-coding-challange_statement`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `insight_statement_id_idx` ON `bank-coding-challange_statement_insight` (`statement_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `bank-coding-challange_statement_insight` (`category`);--> statement-breakpoint
CREATE TABLE `bank-coding-challange_statement_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`statement_id` integer NOT NULL,
	`total_deposits` integer NOT NULL,
	`total_withdrawals` integer NOT NULL,
	`balance` integer NOT NULL,
	`outstanding_loans` integer NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `bank-coding-challange_statement`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `metrics_statement_id_idx` ON `bank-coding-challange_statement_metrics` (`statement_id`);--> statement-breakpoint
CREATE INDEX `period_idx` ON `bank-coding-challange_statement_metrics` (`period_start`,`period_end`);--> statement-breakpoint
CREATE TABLE `bank-coding-challange_transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`statement_id` integer NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `bank-coding-challange_statement`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `statement_id_idx` ON `bank-coding-challange_transaction` (`statement_id`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `bank-coding-challange_transaction` (`date`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `bank-coding-challange_transaction` (`type`);--> statement-breakpoint
ALTER TABLE `bank-coding-challange_statement` ADD `processed_at` integer;