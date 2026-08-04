import React from 'react';

const items = [
  'Any company website (stripe.com, etc.)',
  'LinkedIn person profiles (/in/...)',
  'LinkedIn company pages (/company/...)',
];

export function UnsupportedState() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"
          />
        </svg>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-1">Page not supported</p>
      <p className="text-xs text-gray-400 leading-relaxed mb-6">
        Navigate to a supported page to start enriching leads.
      </p>

      <div className="w-full bg-gray-50 rounded-xl p-3 text-left">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Supported pages
        </p>
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 flex-shrink-0" />
              <span className="text-xs text-gray-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
