CREATE TABLE `clause_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`parent_id` int,
	CONSTRAINT `clause_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `clause_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `clause_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category_id` int,
	`content` text NOT NULL,
	`description` text,
	`tags` json,
	`variables` json,
	`usage_count` int NOT NULL DEFAULT 0,
	`created_by` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`published` boolean NOT NULL DEFAULT false,
	CONSTRAINT `clause_library_id` PRIMARY KEY(`id`),
	CONSTRAINT `clause_library_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `clause_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `clause_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `clause_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `document_metadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`extracted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`process_number` varchar(100),
	`parties` json,
	`deadlines` json,
	`court_info` json,
	`case_value` decimal(15,2),
	`extracted_text` text,
	`confidence` decimal(3,2),
	`extraction_method` varchar(20) NOT NULL,
	CONSTRAINT `document_metadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflow_id` int NOT NULL,
	`signer_id` int NOT NULL,
	`signer_email` varchar(255) NOT NULL,
	`signer_name` varchar(255) NOT NULL,
	`order` int NOT NULL DEFAULT 1,
	`status` enum('pending','signed','rejected','expired') NOT NULL DEFAULT 'pending',
	`signed_at` datetime,
	`ip_address` varchar(45),
	`signature_hash` varchar(255),
	`rejection_reason` text,
	CONSTRAINT `document_signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signature_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflow_id` int NOT NULL,
	`user_id` int,
	`action` varchar(50) NOT NULL,
	`details` json,
	`ip_address` varchar(45),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `signature_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signature_workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_id` int NOT NULL,
	`created_by` int NOT NULL,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`due_date` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`completed_at` datetime,
	CONSTRAINT `signature_workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clause_categories` ADD CONSTRAINT `clause_categories_parent_id_clause_categories_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `clause_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clause_library` ADD CONSTRAINT `clause_library_category_id_clause_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `clause_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clause_library` ADD CONSTRAINT `clause_library_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_metadata` ADD CONSTRAINT `document_metadata_document_id_repository_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `repository_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_signatures` ADD CONSTRAINT `document_signatures_workflow_id_signature_workflows_id_fk` FOREIGN KEY (`workflow_id`) REFERENCES `signature_workflows`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_signatures` ADD CONSTRAINT `document_signatures_signer_id_users_id_fk` FOREIGN KEY (`signer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_audit_log` ADD CONSTRAINT `signature_audit_log_workflow_id_signature_workflows_id_fk` FOREIGN KEY (`workflow_id`) REFERENCES `signature_workflows`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_audit_log` ADD CONSTRAINT `signature_audit_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_workflows` ADD CONSTRAINT `signature_workflows_document_id_repository_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `repository_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signature_workflows` ADD CONSTRAINT `signature_workflows_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;