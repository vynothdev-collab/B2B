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
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.name}!`);
      router.replace("/search");
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRegister(name, email, password);
      storeTokens(res.access_token, res.refresh_token);
      setUser(res.user);
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

  if (isLoading) {
    return (
      <div className="flex h-dvh min-w-0 overflow-hidden bg-gray-50">

        {/* ── Sidebar — mirrors AppSidebar exactly ── */}
        <div className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
          {/* Logo area — h-14 matching actual sidebar */}
          <div className="flex h-14 items-center px-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>

          {/* Nav section */}
          <nav className="flex-1 py-2">
            {/* "SEARCH" section label */}
            <div className="px-4 pb-1 pt-2">
              <div className="h-2 w-12 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="flex flex-col gap-0.5 px-2">
              {/* People — active (red) */}
              <div className="flex items-center gap-2.5 rounded-lg bg-red-50 px-2.5 py-2">
                <div className="h-4 w-4 rounded bg-red-200 animate-pulse shrink-0" />
                <div className="h-3.5 w-14 rounded bg-red-200 animate-pulse" />
              </div>
              {/* Companies */}
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
                <div className="h-4 w-4 rounded bg-gray-200 animate-pulse shrink-0" />
                <div className="h-3.5 w-20 rounded bg-gray-100 animate-pulse" />
              </div>
              {/* Lists */}
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
                <div className="h-4 w-4 rounded bg-gray-200 animate-pulse shrink-0" />
                <div className="h-3.5 w-10 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </nav>

          {/* User area at bottom */}
          <div className="border-t border-gray-100 px-3 py-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-red-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-12 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* AppHeader — h-14 matching actual AppHeader */}
          <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-3 sm:h-16 sm:px-6">
            <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
          </header>

          {/* Body: filter panel + table card */}
          <div className="flex min-w-0 flex-1 gap-2 overflow-hidden px-2 py-2 sm:px-3">

            {/* Filter panel */}
            <div className="hidden lg:flex w-56 shrink-0 flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">
              {/* Filter header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-12 rounded bg-gray-100 animate-pulse" />
              </div>
              {/* Filter rows (accordion items) */}
              <div className="flex-1 divide-y divide-gray-50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded bg-gray-200 animate-pulse shrink-0" />
                      <div className={`h-3 rounded bg-gray-100 animate-pulse ${["w-20","w-16","w-14","w-20","w-16","w-24","w-16","w-24"][i]}`} />
                    </div>
                    <div className="h-3 w-3 rounded bg-gray-100 animate-pulse" />
                  </div>
                ))}
              </div>
              {/* Reset + Apply buttons */}
              <div className="flex gap-2 border-t border-gray-100 px-3 py-3">
                <div className="h-9 flex-1 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-9 flex-1 rounded-lg bg-red-100 animate-pulse" />
              </div>
            </div>

            {/* Table card */}
            <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">
              {/* Toolbar */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 w-8 rounded-full bg-gray-100 animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-md bg-red-100 animate-pulse" />
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full min-w-[640px] [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-2.5">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="w-9"><div className="h-3.5 w-3.5 rounded bg-gray-200 animate-pulse mx-auto" /></th>
                      <th className="min-w-[180px] text-left"><div className="h-3 w-12 rounded bg-gray-200 animate-pulse" /></th>
                      <th className="min-w-[160px] text-left"><div className="h-3 w-16 rounded bg-gray-200 animate-pulse" /></th>
                      <th className="min-w-[140px] text-left"><div className="h-3 w-10 rounded bg-gray-200 animate-pulse" /></th>
                      <th className="min-w-[120px] text-left"><div className="h-3 w-10 rounded bg-gray-200 animate-pulse" /></th>
                      <th className="min-w-[100px] text-left"><div className="h-3 w-14 rounded bg-gray-200 animate-pulse" /></th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td><div className="h-3.5 w-3.5 rounded bg-gray-200 animate-pulse mx-auto" /></td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
                            <div className="space-y-1.5">
                              <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                              <div className="h-2.5 w-16 rounded bg-gray-100 animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1.5">
                            <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                            <div className="h-2.5 w-14 rounded bg-gray-100 animate-pulse" />
                          </div>
                        </td>
                        <td><div className="h-3 w-24 rounded bg-gray-200 animate-pulse" /></td>
                        <td><div className="h-3 w-28 rounded bg-gray-200 animate-pulse" /></td>
                        <td><div className="h-3 w-16 rounded bg-gray-200 animate-pulse" /></td>
                        <td><div className="h-6 w-6 rounded bg-gray-100 animate-pulse mx-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
