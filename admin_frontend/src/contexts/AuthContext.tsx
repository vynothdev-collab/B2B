"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/cookies";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const [user, setUser]           = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — restore session from existing tokens
  const restoreSession = useCallback(async () => {
    const access  = getAccessToken();
    const refresh = getRefreshToken();

    if (!access && !refresh) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get<AdminUser>("/admin/auth/me");
      if (!isAdminRole(data.role)) {
        clearTokens();
        setIsLoading(false);
        return;
      }
      setUser(data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{
      access_token: string;
      refresh_token: string;
      user: AdminUser;
    }>("/admin/auth/login", { email, password });

    if (!isAdminRole(data.user.role)) {
      throw new Error("Access denied. Admin privileges required.");
    }

    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    router.replace("/dashboard");
  }, [router]);

  const logout = useCallback(async () => {
    try { await api.post("/admin/auth/logout"); } catch { /* ignore */ }
    clearTokens();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function isAdminRole(role: string): boolean {
  return ["admin", "super_admin", "ADMIN", "SUPER_ADMIN"].includes(role);
}
