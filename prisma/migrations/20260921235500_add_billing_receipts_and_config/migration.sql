-- CreateEnum
CREATE TYPE "LateFeeType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterEnum
ALTER TYPE "MaintenanceChargeStatus" ADD VALUE 'IN_REVIEW';

-- AlterTable
ALTER TABLE "MaintenanceCharge" ADD COLUMN     "proofFileName" TEXT,
ADD COLUMN     "proofNotes" TEXT,
ADD COLUMN     "proofReference" TEXT,
ADD COLUMN     "proofUploadedAt" TIMESTAMP(3),
ADD COLUMN     "proofUrl" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "receiptFileName" TEXT,
ADD COLUMN     "receiptFolio" TEXT,
ADD COLUMN     "receiptUploadedAt" TIMESTAMP(3),
ADD COLUMN     "receiptUrl" TEXT;

-- CreateTable
CREATE TABLE "CondominiumBillingConfig" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "defaultMonthlyFee" DECIMAL(12,2) NOT NULL DEFAULT 1500.00,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "dueDay" INTEGER NOT NULL DEFAULT 10,
    "applyLateFee" BOOLEAN NOT NULL DEFAULT true,
    "lateFeeType" "LateFeeType" NOT NULL DEFAULT 'PERCENTAGE',
    "lateFeeValue" DECIMAL(12,2) NOT NULL DEFAULT 10.00,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 2,
    "bankName" TEXT,
    "accountHolder" TEXT,
    "clabe" TEXT,
    "accountNumber" TEXT,
    "paymentReferenceRule" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CondominiumBillingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CondominiumBillingConfig_condominiumId_key" ON "CondominiumBillingConfig"("condominiumId");

-- CreateIndex
CREATE INDEX "CondominiumBillingConfig_condominiumId_idx" ON "CondominiumBillingConfig"("condominiumId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenancePeriod_condominiumId_year_month_key" ON "MaintenancePeriod"("condominiumId", "year", "month");

-- AddForeignKey
ALTER TABLE "CondominiumBillingConfig" ADD CONSTRAINT "CondominiumBillingConfig_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

