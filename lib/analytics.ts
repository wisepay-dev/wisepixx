import { NextRequest } from "next/server";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export function getClientIp(request: NextRequest | Request) {
  const headers = request.headers;
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")
  );
}

export function parseDevice(userAgent: string | null) {
  const ua = userAgent ?? "";
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const browser = /Edg/i.test(ua)
    ? "Edge"
    : /Chrome/i.test(ua)
      ? "Chrome"
      : /Safari/i.test(ua)
        ? "Safari"
        : /Firefox/i.test(ua)
          ? "Firefox"
          : "Unknown";
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Android/i.test(ua)
      ? "Android"
      : /iPhone|iPad/i.test(ua)
        ? "iOS"
        : /Mac OS/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Unknown";
  return { device: mobile ? "mobile" : "desktop", browser, os };
}

export async function recordPageView(request: NextRequest, userId?: string | null) {
  const userAgent = request.headers.get("user-agent");
  const parsed = parseDevice(userAgent);
  const sessionId = request.cookies.get("wisepix_session")?.value ?? crypto.randomUUID();
  await prisma.pageView.create({
    data: {
      userId,
      sessionId,
      path: request.nextUrl.pathname,
      ipHash: await hashIp(getClientIp(request)),
      userAgent,
      referrer: request.headers.get("referer"),
      ...parsed
    }
  });
}
