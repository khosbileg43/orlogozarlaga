-- CreateEnum
CREATE TYPE "DebtDirection" AS ENUM ('I_OWE', 'OWES_ME');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('OPEN', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DebtEventType" AS ENUM ('CREATE', 'ADDITIONAL', 'REPAYMENT', 'SETTLE', 'NOTE');

-- CreateEnum
CREATE TYPE "DebtCategory" AS ENUM ('FAMILY', 'FRIENDS', 'WORK', 'EMERGENCY', 'BUSINESS', 'OTHER');

-- CreateTable
CREATE TABLE "DebtCase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "counterpartyUserId" TEXT,
    "personName" TEXT NOT NULL,
    "direction" "DebtDirection" NOT NULL,
    "category" "DebtCategory" NOT NULL DEFAULT 'OTHER',
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "DebtStatus" NOT NULL DEFAULT 'OPEN',
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "repaidAmount" INTEGER NOT NULL DEFAULT 0,
    "remainingAmount" INTEGER NOT NULL DEFAULT 0,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtEvent" (
    "id" TEXT NOT NULL,
    "debtCaseId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "type" "DebtEventType" NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "settlementTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DebtCase_userId_status_direction_idx" ON "DebtCase"("userId", "status", "direction");

-- CreateIndex
CREATE INDEX "DebtCase_userId_dueDate_idx" ON "DebtCase"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "DebtCase_userId_category_idx" ON "DebtCase"("userId", "category");

-- CreateIndex
CREATE INDEX "DebtCase_counterpartyUserId_idx" ON "DebtCase"("counterpartyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "DebtEvent_settlementTransactionId_key" ON "DebtEvent"("settlementTransactionId");

-- CreateIndex
CREATE INDEX "DebtEvent_debtCaseId_eventDate_idx" ON "DebtEvent"("debtCaseId", "eventDate");

-- CreateIndex
CREATE INDEX "DebtEvent_actorUserId_idx" ON "DebtEvent"("actorUserId");

-- AddForeignKey
ALTER TABLE "DebtCase" ADD CONSTRAINT "DebtCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtCase" ADD CONSTRAINT "DebtCase_counterpartyUserId_fkey" FOREIGN KEY ("counterpartyUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtEvent" ADD CONSTRAINT "DebtEvent_debtCaseId_fkey" FOREIGN KEY ("debtCaseId") REFERENCES "DebtCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtEvent" ADD CONSTRAINT "DebtEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtEvent" ADD CONSTRAINT "DebtEvent_settlementTransactionId_fkey" FOREIGN KEY ("settlementTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
