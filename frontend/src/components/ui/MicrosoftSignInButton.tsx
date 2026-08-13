"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  onError?: (msg: string) => void;
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function MicrosoftSignInButton({ onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    try {
      window.location.href = "/api/v1/auth/microsoft";
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
      title="Continue with Microsoft"
      className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 active:scale-[0.97] disabled:opacity-60 transition-all"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#00A4EF]" />
      ) : (
        <MicrosoftIcon />
      )}
    </button>
  );
}
