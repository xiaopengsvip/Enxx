import { UAParser } from "ua-parser-js";

export type ParsedUserAgent = {
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
};

export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  const ua = userAgent?.trim() || null;
  if (!ua) return { userAgent: null, browser: null, os: null, device: null };
  const parsed = new UAParser(ua).getResult();
  const browser = [parsed.browser.name, parsed.browser.version].filter(Boolean).join(" ") || "Unknown Browser";
  const os = [parsed.os.name, parsed.os.version].filter(Boolean).join(" ") || "Unknown OS";
  const type = parsed.device.type;
  const device = type === "mobile" ? "Mobile" : type === "tablet" ? "Tablet" : type === "wearable" ? "Wearable" : "Desktop";
  return { userAgent: ua, browser, os, device };
}
