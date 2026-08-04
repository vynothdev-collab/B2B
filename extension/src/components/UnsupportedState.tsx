import React from 'react';

function UnsupportedIllustration() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ambient glow */}
      <ellipse cx="80" cy="110" rx="55" ry="18" fill="url(#glowGrad)" opacity="0.35" />
      {/* Main box */}
      <rect x="38" y="60" width="84" height="60" rx="6" fill="url(#boxGrad)" />
      <rect x="38" y="60" width="84" height="18" rx="6" fill="url(#lidGrad)" />
      {/* Box shine */}
      <rect x="44" y="64" width="28" height="6" rx="3" fill="white" opacity="0.18" />
      {/* Lock */}
      <rect x="73" y="84" width="14" height="12" rx="3" fill="#CBD5E1" />
      <path d="M76 84v-4a4 4 0 018 0v4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="90" r="2" fill="#94A3B8" />

      {/* Floating shape 1 - orange-red blob */}
      <ellipse cx="118" cy="38" rx="14" ry="12" fill="url(#shape1Grad)" transform="rotate(-15 118 38)" />
      <ellipse cx="115" cy="35" rx="5" ry="4" fill="white" opacity="0.25" transform="rotate(-15 115 35)" />

      {/* Floating shape 2 - purple blob */}
      <ellipse cx="46" cy="30" rx="12" ry="14" fill="url(#shape2Grad)" transform="rotate(10 46 30)" />
      <ellipse cx="43" cy="27" rx="4" ry="5" fill="white" opacity="0.22" transform="rotate(10 43 27)" />

      {/* Floating shape 3 - small pink */}
      <ellipse cx="130" cy="72" rx="8" ry="7" fill="url(#shape3Grad)" transform="rotate(20 130 72)" />

      {/* Sparkles */}
      <path d="M105 22 L106 18 L107 22 L111 23 L107 24 L106 28 L105 24 L101 23 Z" fill="white" opacity="0.8" />
      <path d="M33 52 L34 49 L35 52 L38 53 L35 54 L34 57 L33 54 L30 53 Z" fill="white" opacity="0.6" />
      <circle cx="126" cy="52" r="2" fill="white" opacity="0.7" />
      <circle cx="52" cy="18" r="1.5" fill="white" opacity="0.6" />

      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boxGrad" x1="38" y1="60" x2="122" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="38" y1="60" x2="122" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="shape1Grad" x1="104" y1="26" x2="132" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B6B" />
          <stop offset="1" stopColor="#E84010" />
        </linearGradient>
        <linearGradient id="shape2Grad" x1="34" y1="16" x2="58" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="shape3Grad" x1="122" y1="65" x2="138" y2="79" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9A8D4" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UnsupportedState() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: 'calc(100vh - 112px)' }}
    >
      <UnsupportedIllustration />
      <p className="mt-2 text-[14px] font-semibold text-gray-800">
        We don't support this page.
      </p>
      <p className="mt-2 text-[12px] text-gray-400 leading-relaxed max-w-[220px]">
        Navigate to a LinkedIn profile, LinkedIn company page, or company website.
      </p>
    </div>
  );
}
