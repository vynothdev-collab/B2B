const ACCESS_TOKEN_KEY  = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

function parseCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  return Object.fromEntries(
    document.cookie.split("; ").filter(Boolean).map((c) => {
      const idx = c.indexOf("=");
      return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
    })
  );
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Accessors ──────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return parseCookies()[ACCESS_TOKEN_KEY] ?? null;
}

export function getRefreshToken(): string | null {
  return parseCookies()[REFRESH_TOKEN_KEY] ?? null;
}

export function setTokens(accessToken: string, refreshToken: string) {
  setCookie(ACCESS_TOKEN_KEY,  accessToken,  30 * 60);         // 30 min
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 7 * 24 * 60 * 60); // 7 days
}

export function clearTokens() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}
