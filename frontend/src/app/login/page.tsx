"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Search, Users, Building2, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-12 relative overflow-hidden">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-white/5" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-sm">
            B2B
          </div>
          <span className="text-white font-bold text-lg tracking-tight">B2B Platform</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Find the right people.<br />Close more deals.
            </h2>
            <p className="mt-4 text-purple-200 text-base leading-relaxed max-w-sm">
              Search 800M+ professional profiles and 35M+ companies with precision filters and real-time data enrichment.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <Search className="h-4 w-4" />, text: "Advanced people & company search" },
              { icon: <Users className="h-4 w-4" />, text: "800M+ verified professional profiles" },
              { icon: <Building2 className="h-4 w-4" />, text: "35M+ company records with live data" },
              { icon: <Zap className="h-4 w-4" />, text: "Instant contact reveal & CRM export" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                  {f.icon}
                </div>
                <span className="text-sm text-purple-100">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-8 pt-2">
            {[
              { value: "800M+", label: "Profiles" },
              { value: "35M+", label: "Companies" },
              { value: "98%", label: "Accuracy" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-purple-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/10">
          <p className="text-sm text-purple-100 leading-relaxed">
            &ldquo;B2B Platform cut our prospecting time in half. The data quality is outstanding and the filters are incredibly precise.&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-purple-400 flex items-center justify-center text-white text-xs font-bold">
              SM
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Sarah Mitchell</p>
              <p className="text-[11px] text-purple-300">Head of Sales, TechCorp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[380px]">

          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">
              B2B
            </div>
            <span className="font-bold text-gray-900">B2B Platform</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-400 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <span className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 hover:bg-purple-700 active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : "Sign in to your account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
