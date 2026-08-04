import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import logoFullUrl from '../assets/logo-full.svg';

/* ─── Icons ─────────────────────────────────────────────────────────────── */

const EmailIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const EyeOnIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3}
      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

/* ─── Dot grid ───────────────────────────────────────────────────────────── */
function DotGrid({ cols, rows, color, gap = 7 }: { cols: number; rows: number; color: string; gap?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
      ))}
    </div>
  );
}

/* ─── Split-icon input ───────────────────────────────────────────────────── */
interface SplitInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  icon: React.ReactNode;
  disabled?: boolean;
  suffix?: React.ReactNode;
}

function SplitInput({ id, type, value, onChange, placeholder, autoComplete, icon, disabled, suffix }: SplitInputProps) {
  const [focused, setFocused] = useState(false);
  const bc = focused ? '#2563EB' : '#E2E8F0';
  return (
    <div style={{
      display: 'flex', height: 48,
      border: `1.5px solid ${bc}`, borderRadius: 12, overflow: 'hidden',
      background: '#fff',
      transition: 'border-color 0.18s, box-shadow 0.18s',
      boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.10)' : '0 1px 2px rgba(15,23,42,0.05)',
    }}>
      <div style={{
        width: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F8FAFC',
        borderRight: `1.5px solid ${focused ? '#BFDBFE' : '#E2E8F0'}`,
        color: focused ? '#2563EB' : '#94A3B8',
        transition: 'color 0.18s, border-color 0.18s',
      }}>
        {icon}
      </div>
      <input
        id={id} type={type} required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1, padding: '0 12px',
          fontSize: 13.5, color: '#0F172A',
          background: 'transparent', border: 'none', outline: 'none',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {suffix && (
        <div style={{ width: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [btnHover, setBtnHover] = useState(false);
  const { login, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(email, password); } catch { /* store shows error */ }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(155deg, #EEF2F7 0%, #F8FAFC 55%, #EDF1F7 100%)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes lb-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lb-spin { to { transform: rotate(360deg); } }
        input[type="email"]::placeholder,
        input[type="password"]::placeholder,
        input[type="text"]::placeholder { color: #CBD5E1; }
      `}</style>

      {/* Blue ambient — bottom-left */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, width: 220, height: 200,
        background: 'radial-gradient(circle at bottom left, rgba(37,99,235,0.12) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 1, margin: 12,
        background: '#FFFFFF', borderRadius: 24,
        border: '1px solid rgba(226,232,240,0.9)',
        boxShadow: '0 2px 4px rgba(15,23,42,0.04), 0 10px 40px rgba(15,23,42,0.09)',
        overflow: 'hidden',
        animation: 'lb-fade-up 0.30s cubic-bezier(0.22,1,0.36,1) both',
      }}>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', padding: '28px 24px 20px', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: 14, left: 14, pointerEvents: 'none' }}>
            <DotGrid cols={5} rows={4} color="rgba(249,115,22,0.38)" gap={7} />
          </div>

          <div style={{
            position: 'absolute', top: 0, right: 0, width: 130, height: 130, pointerEvents: 'none',
            background: 'radial-gradient(circle at top right, rgba(251,146,60,0.22) 0%, rgba(253,186,116,0.08) 48%, transparent 68%)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <img src={logoFullUrl} alt="LeadsBuddy.ai" style={{ height: 44, width: 'auto' }} />
          </div>

          <div style={{ textAlign: 'center', marginTop: 18, position: 'relative', zIndex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Welcome back!
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
              Sign in to continue to your LeadsBuddy.ai account
            </p>
          </div>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label htmlFor="lb-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Email address
            </label>
            <SplitInput
              id="lb-email" type="email" value={email} onChange={setEmail}
              placeholder="you@company.com" autoComplete="email"
              icon={<EmailIcon />} disabled={loading}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label htmlFor="lb-pwd" style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Password</label>
              <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2563EB' }}>
                Forgot?
              </button>
            </div>
            <SplitInput
              id="lb-pwd"
              type={showPwd ? 'text' : 'password'}
              value={password} onChange={setPassword}
              placeholder="Enter your password" autoComplete="current-password"
              icon={<LockIcon />} disabled={loading}
              suffix={
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOnIcon /> : <EyeOffIcon />}
                </button>
              }
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox" checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
              style={{ width: 15, height: 15, accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: '#475569' }}>Remember me</span>
          </label>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px',
            }}>
              <span style={{ color: '#F87171', marginTop: 1 }}><AlertCircleIcon /></span>
              <p style={{ margin: 0, fontSize: 12, color: '#DC2626', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              position: 'relative', width: '100%', height: 50,
              border: 'none', borderRadius: 12,
              background: btnHover && !loading
                ? 'linear-gradient(135deg, #c93509 0%, #b02e07 100%)'
                : 'linear-gradient(135deg, #E84010 0%, #c93509 100%)',
              boxShadow: btnHover && !loading
                ? '0 6px 24px rgba(232,64,16,0.44)'
                : '0 4px 16px rgba(232,64,16,0.32)',
              color: '#fff', fontSize: 14.5, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
              transform: btnHover && !loading ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 17, height: 17,
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'lb-spin 0.75s linear infinite',
                }} />
                Signing in&hellip;
              </span>
            ) : (
              <>
                <span>Sign in</span>
                <span style={{ position: 'absolute', right: 18, display: 'flex', alignItems: 'center' }}>
                  <ArrowRightIcon />
                </span>
              </>
            )}
          </button>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 12.5, color: '#94A3B8' }}>
            Don&apos;t have an account?{' '}
            <a
              href="https://app.leadsbuddy.ai/register"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12.5, fontWeight: 700, color: '#E84010', textDecoration: 'none' }}
            >
              Sign up free
            </a>
          </p>
        </form>

        {/* ── Trust box ─────────────────────────────────────────────────── */}
        <div style={{
          margin: '0 20px 20px',
          background: '#F1F5F9', border: '1px solid #E2E8F0',
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: '50%',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(15,23,42,0.08)', color: '#10B981',
          }}>
            <ShieldIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: '#1E293B', lineHeight: 1.4 }}>
              Your data is secure with LeadsBuddy.ai
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#94A3B8', lineHeight: 1.4 }}>
              We never share your information with third parties.
            </p>
          </div>
          <div style={{ position: 'absolute', right: 10, bottom: 6, opacity: 0.22, pointerEvents: 'none' }}>
            <DotGrid cols={4} rows={3} color="#64748B" gap={6} />
          </div>
        </div>

      </div>
    </div>
  );
}
