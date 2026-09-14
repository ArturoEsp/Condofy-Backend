-- DropIndex
DROP INDEX "User_email_idx";

-- CreateIndex
CREATE INDEX "AccessAuthorization_visitorId_idx" ON "AccessAuthorization"("visitorId");

-- CreateIndex
CREATE INDEX "AccessAuthorization_status_idx" ON "AccessAuthorization"("status");

-- CreateIndex
CREATE INDEX "AccessAuthorization_validFrom_validUntil_idx" ON "AccessAuthorization"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "AccessLog_accessAuthorizationId_idx" ON "AccessLog"("accessAuthorizationId");

-- CreateIndex
CREATE INDEX "AccessLog_userAcceptId_idx" ON "AccessLog"("userAcceptId");

-- CreateIndex
CREATE INDEX "AccessLog_date_idx" ON "AccessLog"("date");

-- CreateIndex
CREATE INDEX "AccountMovement_houseId_idx" ON "AccountMovement"("houseId");

-- CreateIndex
CREATE INDEX "AccountMovement_movementDate_idx" ON "AccountMovement"("movementDate");

-- CreateIndex
CREATE INDEX "LateFee_maintenanceChargeId_idx" ON "LateFee"("maintenanceChargeId");

-- CreateIndex
CREATE INDEX "MaintenanceCharge_condominiumId_idx" ON "MaintenanceCharge"("condominiumId");

-- CreateIndex
CREATE INDEX "MaintenanceCharge_houseId_idx" ON "MaintenanceCharge"("houseId");

-- CreateIndex
CREATE INDEX "MaintenanceCharge_status_idx" ON "MaintenanceCharge"("status");

-- CreateIndex
CREATE INDEX "MaintenanceCharge_dueDate_idx" ON "MaintenanceCharge"("dueDate");

-- CreateIndex
CREATE INDEX "MaintenancePeriod_condominiumId_idx" ON "MaintenancePeriod"("condominiumId");

-- CreateIndex
CREATE INDEX "Payment_maintenanceChargeId_idx" ON "Payment"("maintenanceChargeId");

-- CreateIndex
CREATE INDEX "Payment_createdById_idx" ON "Payment"("createdById");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "ResidentProfile_condominiumId_idx" ON "ResidentProfile"("condominiumId");

-- CreateIndex
CREATE INDEX "ResidentProfile_houseId_idx" ON "ResidentProfile"("houseId");

-- CreateIndex
CREATE INDEX "User_condominiumId_idx" ON "User"("condominiumId");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "Visitor_houseId_idx" ON "Visitor"("houseId");

-- CreateIndex
CREATE INDEX "Visitor_category_idx" ON "Visitor"("category");
