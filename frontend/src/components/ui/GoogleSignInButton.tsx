"use client";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  label?: string;
  onError?: (msg: string) => void;
}

// Inner component — only mounted inside GoogleOAuthProvider, so GoogleLogin is safe
function GoogleButtonInner({ label, onError }: { label: string; onError?: (msg: string) => void }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative w-full">
      {/* Overlay shown while we're calling our backend after Google succeeds */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-white/80 text-sm font-semibold text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
        </div>
      )}

      {/*
        GoogleLogin renders Google's Identity Services button (GIS).
        It returns a `credential` (ID token JWT) — not an access token.
        We verify this token on the backend via Google's tokeninfo endpoint.
      */}
      <GoogleLogin
        text={label === "Sign up with Google" ? "signup_with" : "continue_with"}
        theme="outline"
        shape="rectangular"
        size="large"
        logo_alignment="left"
        width={380}
        onSuccess={async ({ credential }) => {
          if (!credential) {
            onError?.("Google did not return a token. Please try again.");
            return;
          }
          setLoading(true);
          try {
            await googleLogin(credential);
          } catch (err: unknown) {
            const detail =
              (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
              "Google sign-in failed. Please try again.";
            onError?.(detail);
          } finally {
            setLoading(false);
          }
        }}
        onError={() => {
          onError?.("Google sign-in was cancelled or failed. Please try again.");
        }}
      />
    </div>
  );
}

// Outer guard — hides the button when Google OAuth is not configured
export function GoogleSignInButton({ label = "Continue with Google", onError }: Props) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
  return <GoogleButtonInner label={label} onError={onError} />;
}
