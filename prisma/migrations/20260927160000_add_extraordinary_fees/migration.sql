-- CreateEnum
CREATE TYPE "ExtraordinaryFeeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ExtraordinaryFee" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountPerHouse" DECIMAL(12,2) NOT NULL,
    "totalTargetAmount" DECIMAL(12,2),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ExtraordinaryFeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "useCustomBankAccount" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "accountHolder" TEXT,
    "clabe" TEXT,
    "accountNumber" TEXT,
    "paymentReferenceRule" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraordinaryFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraordinaryFeeDocument" (
    "id" TEXT NOT NULL,
    "extraordinaryFeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtraordinaryFeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraordinaryFeeCharge" (
    "id" TEXT NOT NULL,
    "extraordinaryFeeId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "MaintenanceChargeStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "reference" TEXT,
    "notes" TEXT,
    "proofUrl" TEXT,
    "proofFileName" TEXT,
    "proofUploadedAt" TIMESTAMP(3),
    "receiptFolio" TEXT,
    "receiptUrl" TEXT,
    "receiptUploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraordinaryFeeCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtraordinaryFee_condominiumId_status_idx" ON "ExtraordinaryFee"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "ExtraordinaryFee_dueDate_idx" ON "ExtraordinaryFee"("dueDate");

-- CreateIndex
CREATE INDEX "ExtraordinaryFeeDocument_extraordinaryFeeId_idx" ON "ExtraordinaryFeeDocument"("extraordinaryFeeId");

-- CreateIndex
CREATE INDEX "ExtraordinaryFeeCharge_extraordinaryFeeId_idx" ON "ExtraordinaryFeeCharge"("extraordinaryFeeId");

-- CreateIndex
CREATE INDEX "ExtraordinaryFeeCharge_houseId_idx" ON "ExtraordinaryFeeCharge"("houseId");

-- CreateIndex
CREATE INDEX "ExtraordinaryFeeCharge_status_idx" ON "ExtraordinaryFeeCharge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraordinaryFeeCharge_extraordinaryFeeId_houseId_key" ON "ExtraordinaryFeeCharge"("extraordinaryFeeId", "houseId");

-- AddForeignKey
ALTER TABLE "ExtraordinaryFee" ADD CONSTRAINT "ExtraordinaryFee_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraordinaryFee" ADD CONSTRAINT "ExtraordinaryFee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraordinaryFeeDocument" ADD CONSTRAINT "ExtraordinaryFeeDocument_extraordinaryFeeId_fkey" FOREIGN KEY ("extraordinaryFeeId") REFERENCES "ExtraordinaryFee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraordinaryFeeCharge" ADD CONSTRAINT "ExtraordinaryFeeCharge_extraordinaryFeeId_fkey" FOREIGN KEY ("extraordinaryFeeId") REFERENCES "ExtraordinaryFee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraordinaryFeeCharge" ADD CONSTRAINT "ExtraordinaryFeeCharge_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
