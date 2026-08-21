"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiGetMe, apiGoogleLogin, apiLogin, apiRegister, type UserInfo } from "@/lib/authApi";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "@/lib/tokens";
import { toast } from "@/lib/toast";

interface AuthContextValue {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  applyOAuth: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored tokens on mount
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
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const _applyAuth = useCallback(
    (res: Awaited<ReturnType<typeof apiLogin>>, welcomeMsg: string) => {
      storeTokens(res.access_token, res.refresh_token);
      setUser({
        ...res.user,
        allocated_credits: res.user.allocated_credits ?? 0,
        used_credits: res.user.used_credits ?? 0,
        remaining_credits: res.user.remaining_credits ?? 0,
      });
      toast.success(welcomeMsg);
      router.replace("/search");
    },
    [router],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      _applyAuth(res, `Welcome back, ${res.user.name}!`);
    },
    [_applyAuth]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRegister(name, email, password);
      _applyAuth(res, "Account created! Welcome.");
    },
    [_applyAuth]
  );

  const googleLogin = useCallback(
    async (credential: string) => {
      const res = await apiGoogleLogin(credential);
      _applyAuth(res, `Welcome, ${res.user.name}!`);
    },
    [_applyAuth]
  );

  const applyOAuth = useCallback(
    async (accessToken: string, refreshToken: string) => {
      storeTokens(accessToken, refreshToken);
      const u = await apiGetMe();
      setUser(u);
      toast.success(`Welcome, ${u.name}!`);
      router.replace("/search");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken() && !getRefreshToken()) return;
    try {
      const u = await apiGetMe();
      setUser(u);
    } catch {
      // ignore — a real auth failure is already handled by the response interceptor
    }
  }, []);

  // Any credit-spending request (search, unlock, CRM push) fires this event —
  // refetch so the sidebar/usage credit numbers stay in sync in real time.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("leadsbuddy:credits-changed", refreshUser);
    return () => window.removeEventListener("leadsbuddy:credits-changed", refreshUser);
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, googleLogin, applyOAuth, logout, refreshUser }}
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
