import { NextRequest, NextResponse } from "next/server";
import { extractSubdomain } from "@/lib/subdomains";

export function middleware(request: NextRequest) {
  const subdomain = extractSubdomain(request.headers.get("host"));
  if (subdomain && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/loja/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"]
};
