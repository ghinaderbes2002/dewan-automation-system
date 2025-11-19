/*
  Warnings:

  - Added the required column `job_role` to the `diwan_employees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMIN', 'ISSUING', 'AUDITOR', 'MEMBERSHIP_AND_SERVICE');

-- AlterTable
ALTER TABLE "diwan_employees" DROP COLUMN "job_role",
ADD COLUMN     "job_role" "EmployeeRole" NOT NULL;
