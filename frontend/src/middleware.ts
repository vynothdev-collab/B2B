import { type NextRequest, NextResponse } from "next/server";

// Redirect an unauthenticated visitor to /login unless the path is public.
const PUBLIC_PATHS = ["/login", "/register", "/document"];
// Redirect an already-authenticated visitor away from these (e.g. don't show /login when signed in).
const AUTH_ONLY_PATHS = ["/login", "/register"];

// Path that renders the maintenance page — never gate this one, or every
// request would rewrite here again.
const MAINTENANCE_PATH = "/maintenance";

// Cache the maintenance flag briefly in module scope so we don't hit the
// backend on every single request; failures fail OPEN (site stays up).
let cachedMaintenance = false;
let cachedAt = 0;
const CACHE_TTL_MS = 5000;

async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (now - cachedAt < CACHE_TTL_MS) return cachedMaintenance;

  try {
    const backendUrl = process.env.BACKEND_URL ?? "";
    const res = await fetch(`${backendUrl}/platform/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = (await res.json()) as { maintenance_mode?: boolean };
      cachedMaintenance = Boolean(data.maintenance_mode);
    }
  } catch {
    // Backend unreachable — fail open rather than locking everyone out.
  }
  cachedAt = now;
  return cachedMaintenance;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== MAINTENANCE_PATH && (await isMaintenanceMode())) {
    const url = request.nextUrl.clone();
    url.pathname = MAINTENANCE_PATH;
    return NextResponse.rewrite(url);
  }

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
