PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_desktop` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text DEFAULT '名称未設定' NOT NULL,
	`isPublic` integer DEFAULT false NOT NULL,
	`background` text DEFAULT 'SUNSET' NOT NULL,
	`font` text DEFAULT 'INTER' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT '{"apps":[],"appPositions":{},"folderContents":{}}' NOT NULL,
	`creaxted_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "desktop_state_json_valid" CHECK(json_valid("__new_desktop"."state") = 1),
	CONSTRAINT "desktop_state_shape" CHECK(
      json_type("__new_desktop"."state", '$.appItems') = 'array' AND
      json_type("__new_desktop"."state", '$.appPositions') = 'object' AND
      json_type("__new_desktop"."state", '$.folderContents') = 'object'
    )
);
--> statement-breakpoint
INSERT INTO `__new_desktop`("id", "userId", "name", "isPublic", "background", "font", "order_index", "state", "creaxted_at", "updated_at") SELECT "id", "userId", "name", "isPublic", "background", "font", "order_index", "state", "creaxted_at", "updated_at" FROM `desktop`;--> statement-breakpoint
DROP TABLE `desktop`;--> statement-breakpoint
ALTER TABLE `__new_desktop` RENAME TO `desktop`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_desktop_user_order` ON `desktop` (`userId`,`order_index`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_desktop_user_order` ON `desktop` (`userId`,`order_index`);