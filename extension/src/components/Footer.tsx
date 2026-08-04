import React from 'react';
import type { User } from '../types';

interface Props {
  user: User;
}

function CreditCoin() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="13" fill="#F59E0B" />
      <circle cx="14" cy="14" r="10" fill="#FBBF24" />
      <circle cx="14" cy="14" r="7" fill="#F59E0B" />
      <text x="14" y="18" textAnchor="middle" fill="#FEF3C7" fontSize="9.5" fontWeight="800" fontFamily="sans-serif">$</text>
    </svg>
  );
}

export function Footer({ user }: Props) {
  const remaining = user.remaining_credits;
  const allocated = user.allocated_credits || 0;
  const isLow = remaining < 20;
  const pct = allocated > 0 ? Math.max(0, Math.min(100, (remaining / allocated) * 100)) : 100;

  return (
    <footer
      className="flex-shrink-0 bg-white"
      style={{ borderTop: '1px solid #F1F5F9' }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Credits */}
        <div className="flex items-center gap-2.5">
          <CreditCoin />
          <div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-[15px] font-bold leading-tight"
                style={{ color: isLow ? '#DC2626' : '#111827' }}
              >
                {remaining.toLocaleString()}
              </span>
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>credits left</span>
            </div>
            {/* Credit bar */}
            {allocated > 0 && (
              <div className="mt-1 w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: isLow
                      ? 'linear-gradient(90deg, #DC2626, #EF4444)'
                      : 'linear-gradient(90deg, #1A3D5C, #2C6B9E)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Upgrade CTA */}
        <a
          href="https://app.leadsbuddy.ai/plans"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-150 hover:opacity-90"
          style={{
            background: '#FFF7F5',
            color: '#E84010',
            border: '1px solid #FED7CC',
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          Get more
        </a>
      </div>
    </footer>
  );
}
