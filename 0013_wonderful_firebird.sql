ALTER TABLE `notifications` MODIFY COLUMN `title` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('prazo_proximo','prazo_hoje','prazo_atrasado','nova_movimentacao_processo','documento_anexado','insight_critico','caso_inativo','pagamento_recebido','lead_convertido','checklist_incompleto') NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `severity` enum('info','warning','critical') DEFAULT 'info' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `origin` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `entityId` int;--> statement-breakpoint
ALTER TABLE `notifications` ADD `readAt` timestamp;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `processId`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `isRead`;