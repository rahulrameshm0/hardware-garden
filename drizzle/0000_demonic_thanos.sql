CREATE TABLE `learning_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`position_at` integer DEFAULT 0 NOT NULL,
	`bookmarked` integer DEFAULT 0 NOT NULL,
	`bookmark_at` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
