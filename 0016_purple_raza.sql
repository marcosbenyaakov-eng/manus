CREATE TABLE `blog_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `blog_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blog_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`approved` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `blog_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`cover_image` varchar(500),
	`category_id` int,
	`tags` json,
	`seo_title` varchar(255),
	`seo_description` text,
	`seo_keywords` varchar(500),
	`published` boolean NOT NULL DEFAULT false,
	`author_id` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blog_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`view_date` date NOT NULL,
	`ip` varchar(45),
	`user_agent` varchar(500),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `blog_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_post_id_blog_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_category_id_blog_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_views` ADD CONSTRAINT `blog_views_post_id_blog_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE cascade ON UPDATE no action;