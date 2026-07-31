"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { storeTokens } from "@/lib/tokens";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "LinkedIn sign-in was cancelled. Please try again.",
  invalid_state: "The authentication request expired or was invalid. Please try again.",
  auth_failed: "LinkedIn authentication failed. Please try again.",
  no_email: "Your LinkedIn account does not have a verified email address.",
  account_disabled: "Your account has been disabled. Please contact support.",
};

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const error = params.get("error");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (error) {
      setErrorMsg(ERROR_MESSAGES[error] ?? "Authentication failed. Please try again.");
      return;
    }

    if (accessToken && refreshToken) {
      storeTokens(accessToken, refreshToken);
      router.replace("/search");
      return;
    }

    setErrorMsg("Authentication failed. Please try again.");
  }, [params, router]);

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-xs">
              LB
            </div>
            <span className="font-bold text-gray-900">leadsbuddy.ai</span>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700 mb-1">Sign-in failed</p>
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
          <Link
            href="/login"
            className="mt-5 inline-block text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="h-7 w-7 animate-spin text-red-600" />
        <p className="text-sm font-medium">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-7 w-7 animate-spin text-red-600" />
            <p className="text-sm font-medium">Completing sign-in…</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
