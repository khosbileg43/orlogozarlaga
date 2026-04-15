-- Store local credential hash for email/password authentication
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
