-- Add optional username column to User
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Add unique index for username (allows NULLs)
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
