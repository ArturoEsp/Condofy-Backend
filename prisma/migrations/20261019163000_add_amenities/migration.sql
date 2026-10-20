-- CreateEnum
CREATE TYPE "AmenityReservationType" AS ENUM ('PER_DAY', 'PER_TIME_SLOT');

-- CreateEnum
CREATE TYPE "AmenityReservationStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AmenityPaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED_DEPOSIT');

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "requiresDeposit" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DECIMAL(10,2),
    "rulesDocumentUrl" TEXT,
    "rulesDocumentName" TEXT,
    "rulesText" TEXT,
    "photos" TEXT[],
    "reservationType" "AmenityReservationType" NOT NULL DEFAULT 'PER_DAY',
    "openingTime" TEXT,
    "closingTime" TEXT,
    "availableDays" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],
    "minNoticeHours" INTEGER NOT NULL DEFAULT 24,
    "maxNoticeDays" INTEGER NOT NULL DEFAULT 30,
    "maxHoursPerReservation" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmenityBlockPeriod" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmenityBlockPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmenityReservation" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "status" "AmenityReservationStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "totalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentStatus" "AmenityPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "adminNotes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmenityReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Amenity_condominiumId_isActive_idx" ON "Amenity"("condominiumId", "isActive");

-- CreateIndex
CREATE INDEX "Amenity_condominiumId_createdAt_idx" ON "Amenity"("condominiumId", "createdAt");

-- CreateIndex
CREATE INDEX "AmenityBlockPeriod_amenityId_idx" ON "AmenityBlockPeriod"("amenityId");

-- CreateIndex
CREATE INDEX "AmenityBlockPeriod_condominiumId_idx" ON "AmenityBlockPeriod"("condominiumId");

-- CreateIndex
CREATE INDEX "AmenityBlockPeriod_startDate_endDate_idx" ON "AmenityBlockPeriod"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "AmenityReservation_amenityId_idx" ON "AmenityReservation"("amenityId");

-- CreateIndex
CREATE INDEX "AmenityReservation_condominiumId_idx" ON "AmenityReservation"("condominiumId");

-- CreateIndex
CREATE INDEX "AmenityReservation_residentId_idx" ON "AmenityReservation"("residentId");

-- CreateIndex
CREATE INDEX "AmenityReservation_houseId_idx" ON "AmenityReservation"("houseId");

-- CreateIndex
CREATE INDEX "AmenityReservation_reservationDate_idx" ON "AmenityReservation"("reservationDate");

-- CreateIndex
CREATE INDEX "AmenityReservation_status_idx" ON "AmenityReservation"("status");

-- AddForeignKey
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityBlockPeriod" ADD CONSTRAINT "AmenityBlockPeriod_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityBlockPeriod" ADD CONSTRAINT "AmenityBlockPeriod_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityReservation" ADD CONSTRAINT "AmenityReservation_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityReservation" ADD CONSTRAINT "AmenityReservation_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityReservation" ADD CONSTRAINT "AmenityReservation_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmenityReservation" ADD CONSTRAINT "AmenityReservation_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

