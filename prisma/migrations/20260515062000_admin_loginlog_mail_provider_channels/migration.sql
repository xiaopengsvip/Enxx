-- ENXX 0.3.2-beta: login audit logs, mail provider channels and provider-aware email logs.
ALTER TYPE "EmailCodeType" ADD VALUE IF NOT EXISTS 'CHANGE_EMAIL';
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "providerKey" TEXT;
CREATE INDEX IF NOT EXISTS "EmailLog_providerKey_idx" ON "EmailLog"("providerKey");

CREATE TABLE IF NOT EXISTS "LoginLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "ip" TEXT,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "timezone" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "userAgent" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "device" TEXT,
  "source" TEXT,
  "status" TEXT NOT NULL DEFAULT 'success',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LoginLog_userId_idx" ON "LoginLog"("userId");
CREATE INDEX IF NOT EXISTS "LoginLog_ip_idx" ON "LoginLog"("ip");
CREATE INDEX IF NOT EXISTS "LoginLog_status_idx" ON "LoginLog"("status");
CREATE INDEX IF NOT EXISTS "LoginLog_createdAt_idx" ON "LoginLog"("createdAt");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LoginLog_userId_fkey') THEN
    ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "MailProviderConfig" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "capability" TEXT NOT NULL DEFAULT 'coming_soon',
  "status" TEXT NOT NULL DEFAULT 'planned',
  "description" TEXT,
  "host" TEXT,
  "port" INTEGER,
  "secure" BOOLEAN,
  "username" TEXT,
  "passwordEncrypted" TEXT,
  "apiKeyEncrypted" TEXT,
  "apiSecretEncrypted" TEXT,
  "domain" TEXT,
  "region" TEXT,
  "fromName" TEXT,
  "fromAddress" TEXT,
  "replyTo" TEXT,
  "testTo" TEXT,
  "logoUrl" TEXT,
  "lastTestAt" TIMESTAMP(3),
  "lastTestStatus" TEXT,
  "lastTestError" TEXT,
  "lastMessageId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MailProviderConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MailProviderConfig_key_key" ON "MailProviderConfig"("key");
CREATE INDEX IF NOT EXISTS "MailProviderConfig_isDefault_idx" ON "MailProviderConfig"("isDefault");
CREATE INDEX IF NOT EXISTS "MailProviderConfig_enabled_idx" ON "MailProviderConfig"("enabled");
CREATE INDEX IF NOT EXISTS "MailProviderConfig_status_idx" ON "MailProviderConfig"("status");
