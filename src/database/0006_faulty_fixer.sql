CREATE TABLE `automationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`pipelineItemId` int,
	`clientId` int,
	`action` varchar(255) NOT NULL,
	`result` text,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` enum('document_uploaded','multiple_documents','no_action_10_days','deadline_detected') NOT NULL,
	`action` enum('move_to_stage','add_tag','mark_urgent','create_alert') NOT NULL,
	`targetStageId` int,
	`tagName` varchar(100),
	`enabled` boolean NOT NULL DEFAULT true,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`checked` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseType` enum('civel','consumidor','imobiliario','processual','empresarial') NOT NULL,
	`title` varchar(255) NOT NULL,
	`clientId` int,
	`processId` int,
	`pipelineItemId` int,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('contradiction','missing_document','deadline_mentioned','risk','strength','next_step') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`clientId` int,
	`processId` int,
	`pipelineItemId` int,
	`dismissed` boolean NOT NULL DEFAULT false,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
