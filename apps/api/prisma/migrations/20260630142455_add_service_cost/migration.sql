-- AlterTable: add purchase_cost to services
ALTER TABLE `services` ADD COLUMN `purchase_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable: add purchase_cost to service_variants
ALTER TABLE `service_variants` ADD COLUMN `purchase_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0;
