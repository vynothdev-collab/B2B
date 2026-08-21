"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { LinkedInSignInButton } from "@/components/ui/LinkedInSignInButton";
import { MicrosoftSignInButton } from "@/components/ui/MicrosoftSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Sign-in was cancelled. Please try again.",
  invalid_state: "Authentication request expired. Please try again.",
  auth_failed: "Authentication failed. Please try again.",
  no_email: "Your account does not have a verified email address.",
  account_disabled: "Your account has been disabled. Please contact support.",
  registration_closed: "New registrations are currently disabled. Please check back later.",
};

const PERKS = [
  "Search 800M+ people & 35M+ companies",
  "Unlock verified emails & phone numbers",
  "Export directly to your CRM",
  "Real-time data enrichment",
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register, applyOAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const oauthError = params.get("error");

    if (oauthError) {
      setError(ERROR_MESSAGES[oauthError] ?? "Sign-in failed. Please try again.");
      window.history.replaceState({}, "", "/register");
      return;
    }

    if (accessToken && refreshToken) {
      setOauthLoading(true);
      applyOAuth(accessToken, refreshToken).catch(() => {
        setError("Authentication failed. Please try again.");
        setOauthLoading(false);
        window.history.replaceState({}, "", "/register");
      });
    }
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail ?? "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-500"][
    pwStrength
  ];

  const isDisabled = loading || oauthLoading;

  if (oauthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-7 w-7 animate-spin text-red-600" />
          <p className="text-sm font-medium">Signing you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-gradient-to-br from-red-700 via-red-600 to-indigo-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5" />
        </div>

        <div className="relative flex items-center gap-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leadsbuddy-logo-white.svg" alt="leadsbuddy.ai" className="h-11 w-auto" />
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Start closing
              <br />
              more deals today.
            </h2>
            <p className="mt-4 text-red-200 text-base leading-relaxed">
              Join thousands of sales teams who use leadsbuddy.ai to find and
              connect with their ideal customers.
            </p>
          </div>

          <ul className="space-y-3.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm text-red-100">{p}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="h-4 w-4 text-amber-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-red-100 leading-relaxed">
              &ldquo;We onboarded on Monday and booked 12 demos by Friday. The
              data quality is unmatched.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                JR
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  James Reynolds
                </p>
                <p className="text-[11px] text-red-300">
                  VP of Sales, Growthly
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free to get started · No credit card required
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/leadsbuddy-logo.svg" alt="leadsbuddy.ai" className="h-7 w-auto" />
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Free forever · No credit card needed
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-red-400 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Full name
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                disabled={isDisabled}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Work email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                disabled={isDisabled}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isDisabled}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isDisabled}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Confirm password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isDisabled}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                    : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                }`}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1 text-[11px] text-red-500">
                  Passwords don&apos;t match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                </>
              ) : (
                "Create free account"
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className={`flex items-center justify-center gap-3 ${isDisabled ? "pointer-events-none opacity-50" : ""}`}>
            <GoogleSignInButton onError={(msg) => setError(msg)} />
            <LinkedInSignInButton onError={(msg) => setError(msg)} />
            <MicrosoftSignInButton onError={(msg) => setError(msg)} />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-[10px] text-gray-400 leading-relaxed">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer hover:text-gray-600">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer hover:text-gray-600">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-red-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
