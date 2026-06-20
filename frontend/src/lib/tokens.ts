function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return getCookie("access_token");
}

export function getRefreshToken(): string | null {
  return getCookie("refresh_token");
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  setCookie("access_token", accessToken, 1800);
  setCookie("refresh_token", refreshToken, 604800);
}

export function updateAccessToken(accessToken: string): void {
  setCookie("access_token", accessToken, 1800);
}

export function clearTokens(): void {
  deleteCookie("access_token");
  deleteCookie("refresh_token");
}
