"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetMe, apiLogin, apiRegister, type UserInfo } from "@/lib/authApi";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "@/lib/tokens";
import { toast } from "@/lib/toast";

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
        clearTokens();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      storeTokens(res.access_token, res.refresh_token);
      setUser({
        ...res.user,
        allocated_credits: res.user.allocated_credits ?? 0,
        used_credits: res.user.used_credits ?? 0,
        remaining_credits: res.user.remaining_credits ?? 0,
      });
      toast.success(`Welcome back, ${res.user.name}!`);
      router.replace("/search");
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRegister(name, email, password);
      storeTokens(res.access_token, res.refresh_token);
      setUser({
        ...res.user,
        allocated_credits: res.user.allocated_credits ?? 0,
        used_credits: res.user.used_credits ?? 0,
        remaining_credits: res.user.remaining_credits ?? 0,
      });
      toast.success("Account created! Welcome.");
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
