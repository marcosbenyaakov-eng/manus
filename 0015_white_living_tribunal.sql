CREATE TABLE `stateLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`fromState` varchar(50),
	`toState` varchar(50) NOT NULL,
	`reason` text,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stateLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stateTransitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`currentState` varchar(50) NOT NULL,
	`allowedNextStates` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stateTransitions_id` PRIMARY KEY(`id`)
);
