CREATE TABLE `agenda` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`caseId` int,
	`title` varchar(500) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`time` varchar(10),
	`type` enum('prazo','compromisso','lembrete') NOT NULL,
	`source` enum('manual','documento','pipeline','historico') NOT NULL DEFAULT 'manual',
	`priority` enum('normal','alta') NOT NULL DEFAULT 'normal',
	`status` enum('pendente','concluido') NOT NULL DEFAULT 'pendente',
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agenda_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processManager` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int,
	`clientId` int,
	`stage` varchar(200),
	`lastMove` text,
	`lastMoveDate` timestamp,
	`nextAction` text,
	`responsible` varchar(200),
	`status` enum('ativo','arquivado','suspenso','concluido') NOT NULL DEFAULT 'ativo',
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processManager_id` PRIMARY KEY(`id`)
);
