-- Add transfer transaction type
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- Track destination account for transfer transactions
ALTER TABLE "Transaction" ADD COLUMN "toAccountId" TEXT;

-- Keep transfer destination lookups fast
CREATE INDEX "Transaction_toAccountId_date_idx" ON "Transaction"("toAccountId", "date");

-- Ensure destination account references a valid account
ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_toAccountId_fkey"
FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
