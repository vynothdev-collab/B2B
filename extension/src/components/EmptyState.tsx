import React from 'react';

interface Props {
  message?: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

function NotFoundIllustration() {
  return (
    <svg width="150" height="130" viewBox="0 0 150 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ambient glow */}
      <ellipse cx="75" cy="105" rx="50" ry="16" fill="url(#emptyGlow)" opacity="0.3" />
      {/* Open box base */}
      <rect x="32" y="65" width="86" height="52" rx="6" fill="url(#emptyBox)" />
      {/* Box left lid flap */}
      <path d="M32 70 L32 65 Q32 59 38 59 L75 59 L75 72 Q55 78 32 70Z" fill="url(#emptyLid1)" />
      {/* Box right lid flap */}
      <path d="M118 70 L118 65 Q118 59 112 59 L75 59 L75 72 Q95 78 118 70Z" fill="url(#emptyLid2)" />
      {/* Box inner shadow */}
      <ellipse cx="75" cy="95" rx="30" ry="8" fill="#94A3B8" opacity="0.2" />

      {/* Magnifying glass */}
      <circle cx="96" cy="52" r="18" fill="url(#magGlass)" stroke="white" strokeWidth="3" />
      <circle cx="96" cy="52" r="13" fill="white" opacity="0.15" />
      <line x1="109" y1="65" x2="120" y2="78" stroke="url(#magHandle)" strokeWidth="5" strokeLinecap="round" />

      {/* Search cross lines inside glass */}
      <line x1="90" y1="46" x2="102" y2="58" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="102" y1="46" x2="90" y2="58" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Sparkles */}
      <path d="M38 42 L39 38 L40 42 L44 43 L40 44 L39 48 L38 44 L34 43 Z" fill="#FCD34D" opacity="0.8" />
      <circle cx="118" cy="38" r="2" fill="#A78BFA" opacity="0.8" />
      <circle cx="30" cy="60" r="1.5" fill="#F9A8D4" opacity="0.7" />

      <defs>
        <radialGradient id="emptyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="emptyBox" x1="32" y1="65" x2="118" y2="117" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="emptyLid1" x1="32" y1="59" x2="75" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="emptyLid2" x1="118" y1="59" x2="75" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8EDF2" />
          <stop offset="1" stopColor="#D4DBE4" />
        </linearGradient>
        <radialGradient id="magGlass" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#E84010" />
        </radialGradient>
        <linearGradient id="magHandle" x1="109" y1="65" x2="120" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E84010" />
          <stop offset="1" stopColor="#9A2D08" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function EmptyState({
  message = 'No results found',
  description,
  action,
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: 'calc(100vh - 112px)' }}
    >
      <NotFoundIllustration />
      <p className="mt-2 text-[14px] font-semibold text-gray-800">{message}</p>
      {description && (
        <p className="mt-2 text-[12px] text-gray-400 leading-relaxed max-w-[220px]">{description}</p>
      )}
      {action && (
        action.href ? (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-colors"
            style={{ background: '#E84010' }}
          >
            <span>✦</span>
            {action.label}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-5 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-colors"
            style={{ background: '#E84010' }}
          >
            <span>✦</span>
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
