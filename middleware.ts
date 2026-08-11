import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/constants";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and login API through.
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(req.cookies.get(ADMIN_COOKIE)?.value);
  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
