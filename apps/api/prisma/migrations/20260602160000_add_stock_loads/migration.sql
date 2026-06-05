-- Add professional stock loading documents with detailed expenses and cancellation support.

CREATE TABLE `stock_loads` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `supplier_name` VARCHAR(191) NULL,
  `supplier_contact` VARCHAR(191) NULL,
  `invoice_number` VARCHAR(191) NULL,
  `product_subtotal` DECIMAL(10, 2) NOT NULL,
  `expense_total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `total_cost` DECIMAL(10, 2) NOT NULL,
  `notes` TEXT NULL,
  `status` ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `cancelled_by` VARCHAR(191) NULL,
  `cancel_reason` TEXT NULL,
  `cancelled_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_load_items` (
  `id` VARCHAR(191) NOT NULL,
  `stock_load_id` VARCHAR(191) NOT NULL,
  `product_id` VARCHAR(191) NOT NULL,
  `quantity` INTEGER NOT NULL,
  `unit_cost` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `previous_stock` INTEGER NOT NULL,
  `new_stock` INTEGER NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_load_expenses` (
  `id` VARCHAR(191) NOT NULL,
  `stock_load_id` VARCHAR(191) NOT NULL,
  `type` ENUM('SHIPPING', 'TAX', 'PACKAGING', 'COMMISSION', 'OTHER') NOT NULL,
  `description` VARCHAR(191) NULL,
  `amount` DECIMAL(10, 2) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `stock_movements`
  ADD COLUMN `stock_load_id` VARCHAR(191) NULL;

ALTER TABLE `stock_loads`
  ADD CONSTRAINT `stock_loads_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `stock_loads`
  ADD CONSTRAINT `stock_loads_cancelled_by_fkey`
  FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `stock_load_items`
  ADD CONSTRAINT `stock_load_items_stock_load_id_fkey`
  FOREIGN KEY (`stock_load_id`) REFERENCES `stock_loads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `stock_load_items`
  ADD CONSTRAINT `stock_load_items_product_id_fkey`
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `stock_load_expenses`
  ADD CONSTRAINT `stock_load_expenses_stock_load_id_fkey`
  FOREIGN KEY (`stock_load_id`) REFERENCES `stock_loads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_stock_load_id_fkey`
  FOREIGN KEY (`stock_load_id`) REFERENCES `stock_loads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
