CREATE TABLE `aiInsightsGlobal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightType` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`dismissed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiInsightsGlobal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricKey` varchar(100) NOT NULL,
	`period` varchar(20),
	`area` varchar(50),
	`data` json NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsCache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsLogs_id` PRIMARY KEY(`id`)
);
