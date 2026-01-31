/*
  Warnings:

  - A unique constraint covering the columns `[national_id_number]` on the table `engineers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobile]` on the table `engineers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `engineers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "engineers" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_registered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_hash" TEXT;

-- AlterTable
ALTER TABLE "membership_requests" ADD COLUMN     "submitted_by" TEXT DEFAULT 'employee';

-- AlterTable
ALTER TABLE "office_opening_requests" ADD COLUMN     "submitted_by" TEXT DEFAULT 'employee';

-- AlterTable
ALTER TABLE "promotion_requests" ADD COLUMN     "submitted_by" TEXT DEFAULT 'employee';

-- AlterTable
ALTER TABLE "training_requests" ADD COLUMN     "submitted_by" TEXT DEFAULT 'employee';

-- CreateIndex
CREATE UNIQUE INDEX "engineers_national_id_number_key" ON "engineers"("national_id_number");

-- CreateIndex
CREATE UNIQUE INDEX "engineers_mobile_key" ON "engineers"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "engineers_email_key" ON "engineers"("email");
