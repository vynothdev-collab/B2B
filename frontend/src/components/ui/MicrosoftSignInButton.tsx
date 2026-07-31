"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  label?: string;
  onError?: (msg: string) => void;
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function MicrosoftButtonInner({ label, onError }: { label: string; onError?: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    try {
      window.location.href = "/api/auth/microsoft";
    } catch {
      setLoading(false);
      onError?.("Failed to initiate Microsoft sign-in. Please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="relative flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-[#00A4EF]" />
          <span>Connecting to Microsoft…</span>
        </>
      ) : (
        <>
          <MicrosoftIcon />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export function MicrosoftSignInButton({ label = "Continue with Microsoft", onError }: Props) {
  return <MicrosoftButtonInner label={label} onError={onError} />;
}
