-- AlterTable
ALTER TABLE `Plan` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `memo` VARCHAR(191) NOT NULL DEFAULT '';