CREATE TABLE `repository_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` varchar(20) NOT NULL,
	`expires_at` datetime,
	CONSTRAINT `repository_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repository_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`file_url` varchar(500) NOT NULL,
	`file_type` varchar(50) NOT NULL,
	`file_size` int NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`uploaded_by` int NOT NULL,
	`visibility` varchar(20) NOT NULL DEFAULT 'internal',
	`tags` json,
	`extracted_meta` json,
	`version_group_id` int,
	`current_version_id` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `repository_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `repository_documents_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `repository_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`user_id` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`meta` json,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `repository_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repository_search_index` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`content_snippet` text NOT NULL,
	`indexed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `repository_search_index_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repository_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`version_number` int NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_size` int NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`changelog` text,
	`created_by` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `repository_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	CONSTRAINT `template_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `template_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category_id` int,
	`content` text NOT NULL,
	`fields_schema` json,
	`tags` json,
	`published` boolean NOT NULL DEFAULT false,
	`created_by` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`usage_count` int NOT NULL DEFAULT 0,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `templates_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `repository_access` ADD CONSTRAINT `repository_access_document_id_repository_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `repository_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_access` ADD CONSTRAINT `repository_access_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_documents` ADD CONSTRAINT `repository_documents_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_logs` ADD CONSTRAINT `repository_logs_document_id_repository_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `repository_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_logs` ADD CONSTRAINT `repository_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_search_index` ADD CONSTRAINT `repository_search_index_document_id_repository_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `repository_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_versions` ADD CONSTRAINT `repository_versions_document_id_repository_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `repository_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repository_versions` ADD CONSTRAINT `repository_versions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `templates` ADD CONSTRAINT `templates_category_id_template_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `template_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `templates` ADD CONSTRAINT `templates_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;