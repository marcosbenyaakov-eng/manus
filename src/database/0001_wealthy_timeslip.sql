CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processId` int NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automationTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`templateType` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`createdById` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automationTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`processId` int,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`documentType` varchar(100) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`version` int NOT NULL DEFAULT 1,
	`uploadedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`processId` int,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('deadline','update','alert','system') NOT NULL DEFAULT 'system',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processNumber` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','pending','archived','closed') NOT NULL DEFAULT 'active',
	`processType` varchar(100) NOT NULL,
	`court` varchar(255),
	`judge` varchar(255),
	`plaintiff` varchar(255),
	`defendant` varchar(255),
	`responsibleUserId` int NOT NULL,
	`createdById` int NOT NULL,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`deadline` timestamp,
	`closedAt` timestamp,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processes_id` PRIMARY KEY(`id`),
	CONSTRAINT `processes_processNumber_unique` UNIQUE(`processNumber`)
);
