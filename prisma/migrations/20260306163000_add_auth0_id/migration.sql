-- Add Auth0 identity mapping for secure local user binding
ALTER TABLE "User" ADD COLUMN "auth0Id" TEXT;

-- Enforce unique mapping between Auth0 subject and local user
CREATE UNIQUE INDEX "User_auth0Id_key" ON "User"("auth0Id");

-- Speed up user-scoped account queries
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
