PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at") SELECT "id", "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_desktop` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text DEFAULT '名称未設定' NOT NULL,
	`isPublic` integer DEFAULT false NOT NULL,
	`background` text DEFAULT 'SUNSET' NOT NULL,
	`font` text DEFAULT 'INTER' NOT NULL,
	`state` text DEFAULT '{"apps":[],"appPositions":{},"folderContents":{}}' NOT NULL,
	`creaxted_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "desktop_state_json_valid" CHECK(json_valid("__new_desktop"."state") = 1),
	CONSTRAINT "desktop_state_shape" CHECK(
      json_type("__new_desktop"."state", '$.apps') = 'array' AND
      json_type("__new_desktop"."state", '$.appPositions') = 'object' AND
      json_type("__new_desktop"."state", '$.folderContents') = 'object'
    )
);
--> statement-breakpoint
INSERT INTO `__new_desktop`("id", "userId", "name", "isPublic", "background", "font", "state", "creaxted_at", "updated_at") SELECT "id", "userId", "name", "isPublic", "background", "font", "state", "creaxted_at", "updated_at" FROM `desktop`;--> statement-breakpoint
DROP TABLE `desktop`;--> statement-breakpoint
ALTER TABLE `__new_desktop` RENAME TO `desktop`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "expires_at", "token", "created_at", "updated_at", "ip_address", "user_agent", "user_id") SELECT "id", "expires_at", "token", "created_at", "updated_at", "ip_address", "user_agent", "user_id" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`osName` text
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "email_verified", "image", "created_at", "updated_at", "osName") SELECT "id", "name", "email", "email_verified", "image", "created_at", "updated_at", "osName" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_osName_unique` ON `user` (`osName`);--> statement-breakpoint
CREATE TABLE `__new_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_verification`("id", "identifier", "value", "expires_at", "created_at", "updated_at") SELECT "id", "identifier", "value", "expires_at", "created_at", "updated_at" FROM `verification`;--> statement-breakpoint
DROP TABLE `verification`;--> statement-breakpoint
ALTER TABLE `__new_verification` RENAME TO `verification`;