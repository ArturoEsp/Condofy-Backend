-- CreateTable
CREATE TABLE "StandContact" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "extension" TEXT,
    "schedule" TEXT DEFAULT '24/7',
    "hasWhatsapp" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StandContact_condominiumId_idx" ON "StandContact"("condominiumId");

-- CreateIndex
CREATE INDEX "StandContact_condominiumId_isActive_idx" ON "StandContact"("condominiumId", "isActive");

-- AddForeignKey
ALTER TABLE "StandContact" ADD CONSTRAINT "StandContact_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
