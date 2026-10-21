-- CreateEnum
CREATE TYPE "ServiceProviderType" AS ENUM ('OFFICIAL', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "ServiceProviderCategory" AS ENUM ('SECURITY', 'MAINTENANCE', 'PLUMBING', 'ELECTRICITY', 'AIR_CONDITIONING', 'LOCKSMITH', 'PAINTING', 'GARDENING', 'CLEANING', 'APPLIANCES', 'PETS', 'OTHER');

-- CreateTable
CREATE TABLE "ServiceProvider" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ServiceProviderCategory" NOT NULL,
    "type" "ServiceProviderType" NOT NULL DEFAULT 'COMMUNITY',
    "imageUrl" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "schedule" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderLike" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceProviderLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceProvider_condominiumId_isActive_idx" ON "ServiceProvider"("condominiumId", "isActive");

-- CreateIndex
CREATE INDEX "ServiceProvider_condominiumId_category_idx" ON "ServiceProvider"("condominiumId", "category");

-- CreateIndex
CREATE INDEX "ServiceProvider_condominiumId_type_idx" ON "ServiceProvider"("condominiumId", "type");

-- CreateIndex
CREATE INDEX "ServiceProviderLike_providerId_idx" ON "ServiceProviderLike"("providerId");

-- CreateIndex
CREATE INDEX "ServiceProviderLike_userId_idx" ON "ServiceProviderLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderLike_providerId_userId_key" ON "ServiceProviderLike"("providerId", "userId");

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderLike" ADD CONSTRAINT "ServiceProviderLike_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderLike" ADD CONSTRAINT "ServiceProviderLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

