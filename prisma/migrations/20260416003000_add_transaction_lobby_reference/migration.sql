-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "lobbyId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_lobbyId_date_idx" ON "Transaction"("lobbyId", "date");

-- AddForeignKey
ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_lobbyId_fkey"
FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
