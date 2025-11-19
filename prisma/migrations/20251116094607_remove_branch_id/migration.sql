/*
  Warnings:

  - You are about to drop the column `branch_id` on the `engineering_offices` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `membership_requests` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `office_opening_requests` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `promotion_requests` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `training_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "engineering_offices" DROP COLUMN "branch_id";

-- AlterTable
ALTER TABLE "membership_requests" DROP COLUMN "branch_id";

-- AlterTable
ALTER TABLE "office_opening_requests" DROP COLUMN "branch_id";

-- AlterTable
ALTER TABLE "promotion_requests" DROP COLUMN "branch_id";

-- AlterTable
ALTER TABLE "training_requests" DROP COLUMN "branch_id";
