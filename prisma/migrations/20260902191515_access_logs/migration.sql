-- CreateEnum
CREATE TYPE "AuthorizationType" AS ENUM ('ONE_TIME', 'DATE_RANGE', 'PERMANENT');

-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'USED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "VisitorCategory" AS ENUM ('FAMILY', 'FRIEND', 'DELIVERY', 'SERVICE', 'EMPLOYEE', 'OTHER');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'STAND';

-- AlterTable
ALTER TABLE "House" ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HouseConfiguration" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "hideAccessAfter" INTEGER DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "photo" TEXT,
    "category" "VisitorCategory" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessAuthorization" (
    "id" TEXT NOT NULL,
    "index" SERIAL NOT NULL,
    "visitorId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "type" "AuthorizationType" NOT NULL,
    "status" "AuthorizationStatus" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "maxEntries" INTEGER,
    "usedEntries" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "accessAuthorizationId" TEXT NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "observations" TEXT,
    "userAcceptId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseConfiguration_houseId_key" ON "HouseConfiguration"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessAuthorization_qrCode_key" ON "AccessAuthorization"("qrCode");

-- AddForeignKey
ALTER TABLE "HouseConfiguration" ADD CONSTRAINT "HouseConfiguration_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessAuthorization" ADD CONSTRAINT "AccessAuthorization_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_accessAuthorizationId_fkey" FOREIGN KEY ("accessAuthorizationId") REFERENCES "AccessAuthorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_userAcceptId_fkey" FOREIGN KEY ("userAcceptId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
