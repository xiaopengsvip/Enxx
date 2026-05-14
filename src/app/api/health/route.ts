import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET() {
  const databaseConfigured = isDatabaseConfigured();
  let databaseConnected = false;
  if (databaseConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
  }
  return NextResponse.json({
    ok: true,
    service: siteConfig.name,
    version: siteConfig.version,
    updatedAt: siteConfig.updatedAt,
    databaseConfigured,
    databaseConnected,
    timestamp: new Date().toISOString(),
  });
}
