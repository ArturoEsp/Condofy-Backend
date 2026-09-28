-- CreateIndex
CREATE INDEX "House_condominiumId_isDisabled_idx" ON "House"("condominiumId", "isDisabled");

-- CreateIndex
CREATE INDEX "Visitor_houseId_createdAt_idx" ON "Visitor"("houseId", "createdAt");

-- CreateIndex
CREATE INDEX "AccessAuthorization_index_idx" ON "AccessAuthorization"("index");

-- CreateIndex
CREATE INDEX "AccessAuthorization_vehiclePlate_idx" ON "AccessAuthorization"("vehiclePlate");

-- CreateIndex
CREATE INDEX "AccessAuthorization_status_validUntil_idx" ON "AccessAuthorization"("status", "validUntil");

-- CreateIndex
CREATE INDEX "AccessLog_accessAuthorizationId_date_idx" ON "AccessLog"("accessAuthorizationId", "date");

-- CreateIndex
CREATE INDEX "AccessLog_entryType_date_idx" ON "AccessLog"("entryType", "date");

-- CreateIndex
CREATE INDEX "MaintenanceCharge_maintenancePeriodId_idx" ON "MaintenanceCharge"("maintenancePeriodId");

-- CreateIndex
CREATE INDEX "MaintenanceCharge_condominiumId_status_idx" ON "MaintenanceCharge"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "ExtraordinaryFeeCharge_extraordinaryFeeId_status_idx" ON "ExtraordinaryFeeCharge"("extraordinaryFeeId", "status");
