CREATE TABLE `financialRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`caseId` int,
	`description` varchar(500) NOT NULL,
	`type` enum('entrada','saida','honorario','despesa') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`date` timestamp NOT NULL,
	`status` enum('pago','pendente') NOT NULL DEFAULT 'pendente',
	`paymentMethod` enum('pix','boleto','transferencia','dinheiro','cartao'),
	`docUrl` varchar(1000),
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`defaultEntryValue` decimal(10,2),
	`defaultHonorarioValue` decimal(10,2),
	`defaultPaymentMethod` enum('pix','boleto','transferencia','dinheiro','cartao') DEFAULT 'pix',
	`internalNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `financialSettings_userId_unique` UNIQUE(`userId`)
);
