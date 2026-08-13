import { type NextRequest, NextResponse } from "next/server";

// Redirect an unauthenticated visitor to /login unless the path is public.
const PUBLIC_PATHS = ["/login", "/register", "/document"];
// Redirect an already-authenticated visitor away from these (e.g. don't show /login when signed in).
const AUTH_ONLY_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("refresh_token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/search/people";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the API proxy, and any static file in /public (logos, icons, etc.)
  // so unauthenticated requests for them aren't bounced to /login.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|json)$).*)",
  ],
};
