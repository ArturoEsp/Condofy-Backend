-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "ResidentProfile" ADD COLUMN     "canCreateVisits" BOOLEAN NOT NULL DEFAULT true;
