const RESERVED_SUBDOMAINS = new Set(["admin", "owner", "api", "www", "app", "dashboard", "support", "login"]);

export function isReservedSubdomain(value: string) {
  return RESERVED_SUBDOMAINS.has(value.toLowerCase());
}

export function extractSubdomain(host: string | null, rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "wisepix.online") {
  if (!host) return null;
  const cleanHost = host.split(":")[0].toLowerCase();
  if (!cleanHost.endsWith(rootDomain)) return null;
  const subdomain = cleanHost.replace(`.${rootDomain}`, "");
  if (!subdomain || subdomain === cleanHost || subdomain.includes(".")) return null;
  if (isReservedSubdomain(subdomain)) return null;
  return subdomain;
}
