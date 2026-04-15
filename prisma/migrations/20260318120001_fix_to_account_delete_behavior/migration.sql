-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_toAccountId_fkey";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
