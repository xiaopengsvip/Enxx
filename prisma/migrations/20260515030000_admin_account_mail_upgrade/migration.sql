-- ENXX 0.3.0-beta: account profile, avatar and email verification metadata.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "learningGoal" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locale" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUpdatedAt" TIMESTAMP(3);
