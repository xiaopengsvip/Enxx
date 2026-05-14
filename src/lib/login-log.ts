import { getIpLocationFromHeaders } from "@/lib/ip-location";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";
import { parseUserAgent } from "@/lib/user-agent";

export type LoginLogSource = "password" | "email_code" | "admin" | "unknown";
export type LoginLogStatus = "success" | "failed" | "blocked";

export async function recordLoginLog(input: { request: Request; userId: string; source?: LoginLogSource; status?: LoginLogStatus }): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    const ip = getClientIp(input.request);
    const location = getIpLocationFromHeaders(input.request);
    const parsedUa = parseUserAgent(input.request.headers.get("user-agent"));
    await prisma.loginLog.create({
      data: {
        userId: input.userId,
        ip,
        country: location.country,
        region: location.region,
        city: location.city,
        timezone: location.timezone,
        latitude: location.latitude,
        longitude: location.longitude,
        userAgent: parsedUa.userAgent,
        browser: parsedUa.browser,
        os: parsedUa.os,
        device: parsedUa.device,
        source: input.source ?? "unknown",
        status: input.status ?? "success",
      },
    });
  } catch (error) {
    console.warn("login log write skipped", error instanceof Error ? error.message : "unknown error");
  }
}

export function serializeLoginLog<T extends { createdAt: Date }>(log: T) {
  return { ...log, createdAt: log.createdAt.toISOString() };
}
