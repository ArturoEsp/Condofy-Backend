-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('IN_CUSTODY', 'DELIVERED', 'RETURNED');

-- CreateEnum
CREATE TYPE "CourierCompany" AS ENUM ('AMAZON', 'MERCADO_LIBRE', 'DHL', 'FEDEX', 'ESTAFETA', 'UBER_EATS', 'RAPPI', 'DIDI', 'CORREOS_DE_MEXICO', 'OTHER');

-- CreateTable
CREATE TABLE "ParcelDelivery" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "courier" "CourierCompany" NOT NULL,
    "customCourier" TEXT,
    "trackingNumber" TEXT,
    "packageCount" INTEGER NOT NULL DEFAULT 1,
    "photoUrl" TEXT,
    "notes" TEXT,
    "pickupCode" TEXT NOT NULL,
    "status" "ParcelStatus" NOT NULL DEFAULT 'IN_CUSTODY',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedById" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "deliveredById" TEXT,
    "deliveredToName" TEXT,
    "deliveryNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParcelDelivery_condominiumId_status_idx" ON "ParcelDelivery"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "ParcelDelivery_houseId_status_idx" ON "ParcelDelivery"("houseId", "status");

-- CreateIndex
CREATE INDEX "ParcelDelivery_pickupCode_idx" ON "ParcelDelivery"("pickupCode");

-- CreateIndex
CREATE INDEX "ParcelDelivery_receivedAt_idx" ON "ParcelDelivery"("receivedAt");

-- AddForeignKey
ALTER TABLE "ParcelDelivery" ADD CONSTRAINT "ParcelDelivery_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelDelivery" ADD CONSTRAINT "ParcelDelivery_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelDelivery" ADD CONSTRAINT "ParcelDelivery_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelDelivery" ADD CONSTRAINT "ParcelDelivery_deliveredById_fkey" FOREIGN KEY ("deliveredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
