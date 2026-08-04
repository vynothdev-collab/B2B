import React, { useState } from 'react';
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';
import logoFullUrl from '../assets/logo-full.svg';

interface Props {
  user: User;
  onRefresh?: () => void;
}

/* ─── Icon primitives ───────────────────────────────────────────────────── */
const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.8s linear', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
  >
    <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/* ─── Shared icon button ─────────────────────────────────────────────────── */
function IBtn({
  onClick, href, title, children, style: extraStyle,
}: {
  onClick?: () => void;
  href?: string;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '10px', border: 'none', cursor: 'pointer',
    background: 'transparent',
    color: '#94A3B8',
    transition: 'background 0.15s, color 0.15s',
    flexShrink: 0,
    textDecoration: 'none',
    ...extraStyle,
  };

  const hover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    (e.currentTarget as HTMLElement).style.background = '#F1F5F9';
    (e.currentTarget as HTMLElement).style.color = '#374151';
  };
  const unhover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    (e.currentTarget as HTMLElement).style.background = 'transparent';
    (e.currentTarget as HTMLElement).style.color = '#94A3B8';
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={title}
        style={base} onMouseEnter={hover} onMouseLeave={unhover}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} title={title} style={base}
      onMouseEnter={hover} onMouseLeave={unhover}>
      {children}
    </button>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
export function Header({ user, onRefresh }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const [showMenu, setShowMenu] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    if (spinning) return;
    setSpinning(true);
    onRefresh?.();
    setTimeout(() => setSpinning(false), 900);
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header style={{
      height: '60px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: '#FFFFFF',
      borderBottom: '1.5px solid #EEF2F7',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <img
        src={logoFullUrl}
        alt="LeadsBuddy.ai"
        style={{ height: '30px', width: 'auto', display: 'block' }}
      />

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <IBtn onClick={handleRefresh} title="Refresh">
          <RefreshIcon spinning={spinning} />
        </IBtn>

        <IBtn href="https://app.leadsbuddy.ai/settings" title="Settings">
          <SettingsIcon />
        </IBtn>

        {/* Thin divider */}
        <div style={{
          width: '1px', height: '20px',
          background: '#E8ECF0',
          margin: '0 6px',
          flexShrink: 0,
        }} />

        {/* Avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            onBlur={() => setTimeout(() => setShowMenu(false), 150)}
            title={user.name}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1A3D5C 0%, #2C6B9E 100%)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em',
              boxShadow: '0 2px 6px rgba(26,61,92,0.3)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {initials}
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '44px',
              background: '#fff', borderRadius: '14px',
              border: '1px solid #E8ECF0',
              boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
              width: '200px', zIndex: 100,
              overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </p>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px 0' }}>
                <a
                  href="https://app.leadsbuddy.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 14px',
                    fontSize: '12.5px', color: '#374151',
                    textDecoration: 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Open Dashboard
                </a>

                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 14px', width: '100%',
                    fontSize: '12.5px', color: '#EF4444',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
