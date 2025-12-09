ALTER TABLE `documents` MODIFY COLUMN `processId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `clientId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `userId` int NOT NULL;