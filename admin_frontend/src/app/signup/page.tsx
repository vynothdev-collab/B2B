"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const PERKS = [
  "Full access to user & enterprise management",
  "Billing, plans, credits & offers control",
  "Live chat & support ticket dashboard",
  "Platform-wide analytics & exports",
];

export default function AdminSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwStrength =
    password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-500"][pwStrength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    // API integration goes here
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 relative overflow-hidden">

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/10" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10" />
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

        {/* Hero */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Request admin<br />portal access.
            </h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              Authorised administrators get full control over the LeadsBuddy platform — users, billing, support, and more.
            </p>
          </div>

          <ul className="space-y-3.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm text-slate-300">{p}</span>
              </li>
            ))}
          </ul>

          {/* Super Admin info card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest">
                Super Admin
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              All admin accounts have full Super Admin access — complete control over every section of the platform.
            </p>
          </div>
        </div>

        {/* Footer badge */}
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Super Admin access · Full platform control
          </span>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px]">

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

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Create admin account</h1>
            <p className="mt-1.5 text-sm text-gray-500">Super Admin — full access to all platform controls</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Full name
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

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
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwStrength ? strengthColor : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      pwStrength === 1
                        ? "text-red-500"
                        : pwStrength === 2
                        ? "text-amber-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Confirm password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1 text-[11px] text-red-500">Passwords don&apos;t match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-500 active:scale-[0.98] transition-all"
            >
              Request Admin Access
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-[10px] text-gray-400 leading-relaxed">
            Access is restricted to authorised Super Admin personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
