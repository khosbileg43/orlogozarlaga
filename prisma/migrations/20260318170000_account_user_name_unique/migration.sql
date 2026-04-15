-- Enforce account name uniqueness per user
CREATE UNIQUE INDEX "Account_userId_name_key" ON "Account"("userId", "name");
