import React from 'react';
import type { User } from '../types';

interface Props {
  user: User;
}

export function Footer({ user }: Props) {
  const remaining = user.remaining_credits;
  const isLow = remaining < 20;

  return (
    <footer className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-white">
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isLow ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {remaining > 999 ? '1k+' : remaining}
        </div>
        <span className="text-[11.5px] text-gray-500">
          <span className="font-semibold text-gray-700">{remaining.toLocaleString()}</span> credits left
        </span>
      </div>

      <a
        href="https://app.leadsbuddy.ai/plans"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[11.5px] font-semibold text-[#E84010] hover:text-[#c93509] transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
            d="M12 4v16m8-8H4" />
        </svg>
        Get more credits
      </a>
    </footer>
  );
}
