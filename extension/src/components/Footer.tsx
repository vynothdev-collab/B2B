import React from 'react';
import type { User } from '../types';

interface Props {
  user: User;
}

function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#F59E0B" />
      <circle cx="10" cy="10" r="7.5" fill="#FBBF24" />
      <circle cx="10" cy="10" r="5" fill="#F59E0B" />
      <text x="10" y="13.5" textAnchor="middle" fill="#FEF3C7" fontSize="7" fontWeight="800" fontFamily="sans-serif">$</text>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16m8-8H4" />
    </svg>
  );
}

type StatusLevel = 'healthy' | 'low' | 'warning' | 'critical';

function getStatusLevel(pct: number): StatusLevel {
  if (pct >= 50) return 'healthy';
  if (pct >= 25) return 'low';
  if (pct >= 10) return 'warning';
  return 'critical';
}

const STATUS_CONFIG: Record<StatusLevel, { label: string; color: string; bg: string; border: string; bar: string }> = {
  healthy:  { label: 'Healthy',      color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', bar: 'linear-gradient(90deg, #16A34A, #22C55E)' },
  low:      { label: 'Running Low',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', bar: 'linear-gradient(90deg, #CA8A04, #EAB308)' },
  warning:  { label: 'Low',          color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', bar: 'linear-gradient(90deg, #EA580C, #F97316)' },
  critical: { label: 'Critical',     color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', bar: 'linear-gradient(90deg, #DC2626, #EF4444)' },
};

export function Footer({ user }: Props) {
  const remaining = user.remaining_credits ?? 0;
  const allocated = user.allocated_credits || 0;
  const pct = allocated > 0 ? Math.max(0, Math.min(100, (remaining / allocated) * 100)) : 100;

  const level = getStatusLevel(pct);
  const status = STATUS_CONFIG[level];

  return (
    <footer
      style={{
        flexShrink: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E8ECF2',
        boxShadow: '0 -4px 20px rgba(15,23,42,0.07)',
        padding: '11px 16px 12px',
      }}
      aria-label="Credits usage"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

        {/* ── Left: Credits block ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0 }}>

          {/* Coin icon container */}
          <div
            style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(145deg, #FEF9EC, #FEF0C7)',
              border: '1px solid #FDE68A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(245,158,11,0.18)',
            }}
            aria-hidden="true"
          >
            <CoinIcon />
          </div>

          {/* Credits info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Count row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', flexWrap: 'nowrap' }}>
              <span
                style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1, flexShrink: 0 }}
                aria-label={`${remaining.toLocaleString()} credits remaining`}
              >
                {remaining.toLocaleString()}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, flexShrink: 0 }}>
                credits
              </span>
              {/* Status badge */}
              <span
                style={{
                  fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.025em',
                  color: status.color, background: status.bg, border: `1px solid ${status.border}`,
                  padding: '2px 7px', borderRadius: '20px', flexShrink: 0,
                }}
                role="status"
                aria-label={`Credit status: ${status.label}`}
              >
                {status.label}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: '100%', height: '6px', borderRadius: '99px',
                background: '#F1F5F9', overflow: 'hidden',
              }}
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Credits remaining"
            >
              <div
                style={{
                  height: '100%', borderRadius: '99px',
                  width: `${pct}%`,
                  background: status.bar,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.5s ease',
                  minWidth: pct > 0 ? '4px' : '0',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Right: Buy Credits CTA ──────────────────────────────────────── */}
        <a
          href="https://app.leadsbuddy.ai/search/plans"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '8px 13px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700, lineHeight: 1,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #E84010 0%, #F97316 100%)',
            textDecoration: 'none', flexShrink: 0,
            boxShadow: '0 2px 10px rgba(232,64,16,0.28)',
            transition: 'opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.opacity = '0.92';
            el.style.transform = 'translateY(-1px)';
            el.style.boxShadow = '0 4px 14px rgba(232,64,16,0.36)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = '0 2px 10px rgba(232,64,16,0.28)';
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0) scale(0.97)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px) scale(1)';
          }}
          aria-label="Buy more credits — opens in new tab"
        >
          <PlusIcon />
          Buy Credits
        </a>
      </div>
    </footer>
  );
}
