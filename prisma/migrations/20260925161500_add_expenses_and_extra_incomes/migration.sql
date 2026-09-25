-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('SERVICES', 'MAINTENANCE', 'SECURITY', 'CLEANING', 'GARDENING', 'ADMINISTRATION', 'RESERVE_FUND', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PAID', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExtraIncomeCategory" AS ENUM ('AMENITY_RENTAL', 'ACCESS_DEVICE', 'RULE_PENALTY', 'EXTRAORDINARY_FEE', 'BANK_INTEREST', 'OTHER');

-- AlterTable
ALTER TABLE "CondominiumBillingConfig" ADD COLUMN "initialBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "initialReserveFund" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "initialBalanceDate" TIMESTAMP(3),
ADD COLUMN "initialBalanceNotes" TEXT;

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PAID',
    "supplier" TEXT,
    "reference" TEXT,
    "invoiceUrl" TEXT,
    "invoiceFileName" TEXT,
    "invoiceFileType" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraIncome" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "houseId" TEXT,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "incomeDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "category" "ExtraIncomeCategory" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
    "reference" TEXT,
    "receiptUrl" TEXT,
    "receiptFileName" TEXT,
    "receiptFileType" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondominiumTransparencyConfig" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "showExpenses" BOOLEAN NOT NULL DEFAULT true,
    "showIncomes" BOOLEAN NOT NULL DEFAULT true,
    "showBalance" BOOLEAN NOT NULL DEFAULT true,
    "showSuppliers" BOOLEAN NOT NULL DEFAULT false,
    "allowInvoiceViewing" BOOLEAN NOT NULL DEFAULT true,
    "allowInvoiceDownload" BOOLEAN NOT NULL DEFAULT true,
    "showCollectionRate" BOOLEAN NOT NULL DEFAULT true,
    "timeframeMode" TEXT NOT NULL DEFAULT '90_DAYS',
    "condominiumNotice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CondominiumTransparencyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_condominiumId_period_idx" ON "Expense"("condominiumId", "period");

-- CreateIndex
CREATE INDEX "Expense_condominiumId_category_idx" ON "Expense"("condominiumId", "category");

-- CreateIndex
CREATE INDEX "Expense_condominiumId_status_idx" ON "Expense"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "ExtraIncome_condominiumId_period_idx" ON "ExtraIncome"("condominiumId", "period");

-- CreateIndex
CREATE INDEX "ExtraIncome_condominiumId_category_idx" ON "ExtraIncome"("condominiumId", "category");

-- CreateIndex
CREATE INDEX "ExtraIncome_incomeDate_idx" ON "ExtraIncome"("incomeDate");

-- CreateIndex
CREATE UNIQUE INDEX "CondominiumTransparencyConfig_condominiumId_key" ON "CondominiumTransparencyConfig"("condominiumId");

-- CreateIndex
CREATE INDEX "CondominiumTransparencyConfig_condominiumId_idx" ON "CondominiumTransparencyConfig"("condominiumId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraIncome" ADD CONSTRAINT "ExtraIncome_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraIncome" ADD CONSTRAINT "ExtraIncome_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraIncome" ADD CONSTRAINT "ExtraIncome_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondominiumTransparencyConfig" ADD CONSTRAINT "CondominiumTransparencyConfig_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
