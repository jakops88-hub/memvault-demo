import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes som inte kräver auth
  const publicRoutes = ["/", "/pricing", "/login", "/checkout/success", "/checkout/canceled"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if accessing protected routes (dashboard or playground)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/playground")) {
    // Check for API key in cookies (we'll set this on login)
    const apiKey = request.cookies.get("memvault_api_key");

    if (!apiKey) {
      // Redirect to login if no API key
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
