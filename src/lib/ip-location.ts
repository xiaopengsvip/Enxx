export type IpLocation = {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
};

function clean(value: string | null): string | null {
  const next = value?.trim();
  return next || null;
}

export function getIpLocationFromHeaders(request: Request): IpLocation {
  const headers = request.headers;
  return {
    country: clean(headers.get("cf-ipcountry")) ?? "未知地区",
    region: clean(headers.get("cf-region")) ?? clean(headers.get("x-vercel-ip-country-region")),
    city: clean(headers.get("cf-ipcity")) ?? clean(headers.get("x-vercel-ip-city")),
    timezone: clean(headers.get("cf-timezone")),
    latitude: null,
    longitude: null,
  };
}

export function formatLocation(location: Pick<IpLocation, "country" | "region" | "city">): string {
  return [location.country, location.region, location.city].filter(Boolean).join(" / ") || "未知地区";
}
