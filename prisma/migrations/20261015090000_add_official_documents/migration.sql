-- CreateEnum
CREATE TYPE "OfficialDocumentCategory" AS ENUM ('REGLAMENTO', 'ACTA_ASAMBLEA', 'COMUNICADO_OFICIAL', 'MANUAL_CONVIVENCIA', 'CONTRATO_SERVICIO', 'FINANCIERO', 'OTRO');

-- CreateEnum
CREATE TYPE "DocumentTargetScope" AS ENUM ('ALL', 'SPECIFIC_HOUSES', 'PRIVATE');

-- CreateTable
CREATE TABLE "OfficialDocument" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "OfficialDocumentCategory" NOT NULL DEFAULT 'REGLAMENTO',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" TEXT,
    "mimeType" TEXT,
    "version" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "requiresAcknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "targetScope" "DocumentTargetScope" NOT NULL DEFAULT 'ALL',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialDocumentHouse" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,

    CONSTRAINT "OfficialDocumentHouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialDocumentAcknowledgment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "houseId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "OfficialDocumentAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfficialDocument_condominiumId_isPublished_idx" ON "OfficialDocument"("condominiumId", "isPublished");

-- CreateIndex
CREATE INDEX "OfficialDocument_condominiumId_category_idx" ON "OfficialDocument"("condominiumId", "category");

-- CreateIndex
CREATE INDEX "OfficialDocument_condominiumId_createdAt_idx" ON "OfficialDocument"("condominiumId", "createdAt");

-- CreateIndex
CREATE INDEX "OfficialDocumentHouse_documentId_idx" ON "OfficialDocumentHouse"("documentId");

-- CreateIndex
CREATE INDEX "OfficialDocumentHouse_houseId_idx" ON "OfficialDocumentHouse"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialDocumentHouse_documentId_houseId_key" ON "OfficialDocumentHouse"("documentId", "houseId");

-- CreateIndex
CREATE INDEX "OfficialDocumentAcknowledgment_documentId_idx" ON "OfficialDocumentAcknowledgment"("documentId");

-- CreateIndex
CREATE INDEX "OfficialDocumentAcknowledgment_houseId_idx" ON "OfficialDocumentAcknowledgment"("houseId");

-- CreateIndex
CREATE INDEX "OfficialDocumentAcknowledgment_userId_idx" ON "OfficialDocumentAcknowledgment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialDocumentAcknowledgment_documentId_userId_key" ON "OfficialDocumentAcknowledgment"("documentId", "userId");

-- AddForeignKey
ALTER TABLE "OfficialDocument" ADD CONSTRAINT "OfficialDocument_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialDocument" ADD CONSTRAINT "OfficialDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialDocumentHouse" ADD CONSTRAINT "OfficialDocumentHouse_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficialDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialDocumentHouse" ADD CONSTRAINT "OfficialDocumentHouse_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialDocumentAcknowledgment" ADD CONSTRAINT "OfficialDocumentAcknowledgment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficialDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialDocumentAcknowledgment" ADD CONSTRAINT "OfficialDocumentAcknowledgment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialDocumentAcknowledgment" ADD CONSTRAINT "OfficialDocumentAcknowledgment_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

