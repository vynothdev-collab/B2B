"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetMe, apiLogin, apiRegister, type UserInfo } from "@/lib/authApi";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "@/lib/tokens";

interface AuthContextValue {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from stored tokens.
  // Checks refresh_token too — if only the access token has expired (30-min
  // window), the api.ts interceptor will silently refresh it during apiGetMe.
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const hasSession = !!getAccessToken() || !!getRefreshToken();

    if (!hasSession) {
      setIsLoading(false);
      return;
    }

    apiGetMe()
      .then((u) => setUser(u))
      .catch(() => {
        // Both access token and refresh failed — session is truly expired
        clearTokens();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      storeTokens(res.access_token, res.refresh_token);
      setUser(res.user);
      router.replace("/search");
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRegister(name, email, password);
      storeTokens(res.access_token, res.refresh_token);
      setUser(res.user);
      router.replace("/search");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
