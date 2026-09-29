-- AlterTable
ALTER TABLE "CondominiumBillingConfig" ADD COLUMN "initialDebt" DECIMAL(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE "CondominiumBillingConfig" ADD COLUMN "initialDebtNotes" TEXT;
ALTER TABLE "CondominiumBillingConfig" ADD COLUMN "showDebtInTransparency" BOOLEAN NOT NULL DEFAULT true;
