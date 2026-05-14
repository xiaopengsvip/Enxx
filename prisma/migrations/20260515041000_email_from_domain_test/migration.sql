-- ENXX email sending-domain test: record effective From address for audit/debugging.
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "from" TEXT;
