-- AlterTable
ALTER TABLE "CondominiumBillingConfig" ADD COLUMN "notifyOnPeriodStart" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyDueDateReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "dueDateReminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "notifyOnProofReviewed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notificationChannel" TEXT NOT NULL DEFAULT 'ALL';

