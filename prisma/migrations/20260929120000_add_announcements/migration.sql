-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');

-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('GENERAL', 'MAINTENANCE', 'SECURITY', 'MEETING', 'FINANCE', 'EVENT');

-- CreateEnum
CREATE TYPE "AnnouncementAttachmentType" AS ENUM ('IMAGE', 'DOCUMENT');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewMessage" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "authorName" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementAttachment" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "type" "AnnouncementAttachmentType" NOT NULL DEFAULT 'IMAGE',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" TEXT,
    "mimeType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementReader" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "houseId" TEXT,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementReader_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_condominiumId_isActive_idx" ON "Announcement"("condominiumId", "isActive");

-- CreateIndex
CREATE INDEX "Announcement_condominiumId_startDate_idx" ON "Announcement"("condominiumId", "startDate");

-- CreateIndex
CREATE INDEX "Announcement_condominiumId_priority_idx" ON "Announcement"("condominiumId", "priority");

-- CreateIndex
CREATE INDEX "AnnouncementAttachment_announcementId_idx" ON "AnnouncementAttachment"("announcementId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementReader_announcementId_userId_key" ON "AnnouncementReader"("announcementId", "userId");

-- CreateIndex
CREATE INDEX "AnnouncementReader_announcementId_idx" ON "AnnouncementReader"("announcementId");

-- CreateIndex
CREATE INDEX "AnnouncementReader_userId_idx" ON "AnnouncementReader"("userId");

-- CreateIndex
CREATE INDEX "AnnouncementReader_houseId_idx" ON "AnnouncementReader"("houseId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementAttachment" ADD CONSTRAINT "AnnouncementAttachment_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReader" ADD CONSTRAINT "AnnouncementReader_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReader" ADD CONSTRAINT "AnnouncementReader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReader" ADD CONSTRAINT "AnnouncementReader_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;
