-- CreateEnum
CREATE TYPE "GeneralProviderCategory" AS ENUM ('WATER', 'GAS', 'GARDENING', 'TRASH', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "GeneralProviderStatus" AS ENUM ('INSIDE', 'EXITED');

-- CreateTable
CREATE TABLE "GeneralProviderAccess" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "GeneralProviderCategory" NOT NULL,
    "driverName" TEXT,
    "vehiclePlate" TEXT,
    "companyPhone" TEXT,
    "notes" TEXT,
    "status" "GeneralProviderStatus" NOT NULL DEFAULT 'INSIDE',
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryGuardId" TEXT NOT NULL,
    "exitedAt" TIMESTAMP(3),
    "exitGuardId" TEXT,
    "exitNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralProviderAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneralProviderAccess_condominiumId_status_idx" ON "GeneralProviderAccess"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "GeneralProviderAccess_enteredAt_idx" ON "GeneralProviderAccess"("enteredAt");

-- AddForeignKey
ALTER TABLE "GeneralProviderAccess" ADD CONSTRAINT "GeneralProviderAccess_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProviderAccess" ADD CONSTRAINT "GeneralProviderAccess_entryGuardId_fkey" FOREIGN KEY ("entryGuardId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProviderAccess" ADD CONSTRAINT "GeneralProviderAccess_exitGuardId_fkey" FOREIGN KEY ("exitGuardId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

