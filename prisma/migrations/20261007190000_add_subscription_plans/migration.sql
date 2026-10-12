-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "includedHouses" INTEGER NOT NULL DEFAULT 60,
    "extraHousePrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");

-- AlterTable
ALTER TABLE "Condominium" ADD COLUMN "planId" TEXT,
ADD COLUMN "isTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "customPriceOverride" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Condominium_planId_idx" ON "Condominium"("planId");

-- AddForeignKey
ALTER TABLE "Condominium" ADD CONSTRAINT "Condominium_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
