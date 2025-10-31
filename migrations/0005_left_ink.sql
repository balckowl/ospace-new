ALTER TABLE `desktop` ADD `order_index` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_desktop_user_order` ON `desktop` (`userId`,`order_index`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_desktop_user_order` ON `desktop` (`userId`,`order_index`);