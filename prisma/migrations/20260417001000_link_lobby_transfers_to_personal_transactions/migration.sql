-- AlterTable
ALTER TABLE "LobbyTransaction" ADD COLUMN "personalTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LobbyTransaction_personalTransactionId_key" ON "LobbyTransaction"("personalTransactionId");

-- AddForeignKey
ALTER TABLE "LobbyTransaction"
ADD CONSTRAINT "LobbyTransaction_personalTransactionId_fkey"
FOREIGN KEY ("personalTransactionId") REFERENCES "Transaction"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
