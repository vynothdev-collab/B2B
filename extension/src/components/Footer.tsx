import React from 'react';
import type { User } from '../types';

interface Props {
  user: User;
}

function CoinIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#F59E0B" />
      <circle cx="12" cy="12" r="8.5" fill="#FBBF24" />
      <circle cx="12" cy="12" r="6" fill="#F59E0B" />
      <text x="12" y="16" textAnchor="middle" fill="#FEF3C7" fontSize="8" fontWeight="bold" fontFamily="sans-serif">$</text>
    </svg>
  );
}

export function Footer({ user }: Props) {
  const remaining = user.remaining_credits;

  return (
    <footer className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-white">
      <div className="flex items-center gap-2">
        <CoinIcon />
        <span className="text-[13px] text-gray-500">
          <span className="font-bold text-gray-800">{remaining.toLocaleString()}</span>{' '}
          credits left
        </span>
      </div>

      <a
        href="https://app.leadsbuddy.ai/plans"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[12px] font-semibold text-[#E84010] hover:text-[#c93509] transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        Get more credits
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
    </footer>
  );
}
