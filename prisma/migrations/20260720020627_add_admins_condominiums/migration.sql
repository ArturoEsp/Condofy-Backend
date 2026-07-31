/*
  Warnings:

  - A unique constraint covering the columns `[condominiumId,houseNumber]` on the table `House` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "condominiumId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "House_condominiumId_houseNumber_key" ON "House"("condominiumId", "houseNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
