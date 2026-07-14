"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  Users,
  Building2,
  MessageSquare,
} from "lucide-react";

const FEATURES = [
  { icon: <Users className="h-4 w-4" />, text: "Manage individual users & enterprise accounts" },
  { icon: <Building2 className="h-4 w-4" />, text: "Full enterprise team & credit management" },
  { icon: <BarChart3 className="h-4 w-4" />, text: "Platform-wide usage analytics & reports" },
  { icon: <MessageSquare className="h-4 w-4" />, text: "Live chat & support ticket management" },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // API integration goes here
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 relative overflow-hidden">

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-indigo-500/10" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-blue-400/10" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/50">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">leadsbuddy.ai</span>
            <span className="ml-2 rounded-md bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300 uppercase tracking-widest">
              Admin
            </span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Platform control.<br />Complete visibility.
            </h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-sm">
              The admin portal gives you full control over users, enterprises, billing, and support — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/20 text-blue-400">
                  {f.icon}
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-2">
            {[
              { value: "11", label: "Admin Pages" },
              { value: "3", label: "User Roles" },
              { value: "100%", label: "Visibility" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div className="relative rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Restricted Access</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            This portal is for authorised LeadsBuddy administrators only. Unauthorised access attempts are logged and monitored.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">leadsbuddy.ai</span>
            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-600 uppercase tracking-widest">
              Admin
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin sign in</h1>
            <p className="mt-1.5 text-sm text-gray-500">Sign in to access the admin portal</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-400 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Admin email address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@leadsbuddy.ai"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium transition-colors">
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-500 active:scale-[0.98] transition-all"
            >
              Sign in to Admin Portal
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">new admin?</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an admin account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Request access
            </Link>
          </p>

          <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed">
            Access is restricted to authorised personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
