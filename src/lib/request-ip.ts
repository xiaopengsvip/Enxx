export function getClientIp(request: Request): string {
  const headers = request.headers;
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  const maybeRequest = request as Request & { ip?: string };
  return maybeRequest.ip?.trim() || "unknown";
}
