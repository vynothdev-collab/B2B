import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const accessToken  = request.cookies.get("admin_access_token")?.value;
  const refreshToken = request.cookies.get("admin_refresh_token")?.value;
  const hasSession   = !!(accessToken || refreshToken);

  // Already authenticated — redirect away from login
  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not authenticated — redirect to login
  if (!isPublic && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
