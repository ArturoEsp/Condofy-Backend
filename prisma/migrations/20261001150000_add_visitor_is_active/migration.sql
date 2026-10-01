-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Visitor_houseId_isActive_idx" ON "Visitor"("houseId", "isActive");

