import React, { useState, useEffect, useRef, useCallback } from 'react';
import { listsApi } from '../api/lists';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const ListIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12" />
    <circle cx="3.75" cy="6.75" r=".75" fill="currentColor" stroke="none" />
    <circle cx="3.75" cy="12" r=".75" fill="currentColor" stroke="none" />
    <circle cx="3.75" cy="17.25" r=".75" fill="currentColor" stroke="none" />
  </svg>
);

const CloseIco = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIco = () => (
  <span style={{
    display: 'inline-block',
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'lb-spin 0.65s linear infinite',
  }} />
);

export function CreateListModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [closeHover, setCloseHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);
  const [visible, setVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  /* Fade-in on mount */
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    inputRef.current?.focus();
    return () => cancelAnimationFrame(t);
  }, []);

  /* ESC to close */
  const handleClose = useCallback(() => {
    if (loading) return;
    setVisible(false);
    setTimeout(onClose, 180);
  }, [loading, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  /* Focus trap */
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'input, button:not([disabled])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('List name is required'); return; }
    setLoading(true);
    setError('');
    try {
      await listsApi.createList(name.trim());
      onCreated();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || 'Failed to create list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !loading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: `rgba(10,20,40,${visible ? '0.55' : '0'})`,
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background 0.2s ease, backdrop-filter 0.2s ease',
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%', maxWidth: '356px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(10px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.2s cubic-bezier(0.34,1.3,0.64,1), opacity 0.18s ease',
        }}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12" />
                <circle cx="3.75" cy="6.75" r=".75" fill="#3B82F6" stroke="none" />
                <circle cx="3.75" cy="12" r=".75" fill="#3B82F6" stroke="none" />
                <circle cx="3.75" cy="17.25" r=".75" fill="#3B82F6" stroke="none" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" style={{
                fontSize: '16px', fontWeight: 700, color: '#0F172A',
                margin: 0, lineHeight: 1.25,
              }}>
                Create New List
              </h2>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '2px 0 0', lineHeight: 1 }}>
                Organize your saved leads
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close dialog"
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            style={{
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: closeHover ? '#F1F5F9' : 'transparent',
              color: closeHover ? '#374151' : '#94A3B8',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0,
            }}
          >
            <CloseIco />
          </button>
        </div>

        {/* ── Form body ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>

          {/* Label */}
          <label
            htmlFor="list-name"
            style={{
              display: 'block',
              fontSize: '12.5px', fontWeight: 600, color: '#374151',
              marginBottom: '8px', letterSpacing: '0.01em',
            }}
          >
            List Name <span style={{ color: '#EF4444' }}>*</span>
          </label>

          {/* Input */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: inputFocused ? '#3B82F6' : (error ? '#EF4444' : '#CBD5E1'),
              display: 'flex', pointerEvents: 'none',
              transition: 'color 0.15s',
            }}>
              <ListIco />
            </span>
            <input
              id="list-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="e.g. Prospect Q1 2025"
              maxLength={80}
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? 'name-error' : 'name-hint'}
              style={{
                width: '100%', height: '48px',
                paddingLeft: '42px', paddingRight: '14px',
                fontSize: '13.5px', color: '#0F172A',
                background: loading ? '#F8FAFC' : '#FFFFFF',
                border: `1.5px solid ${error ? '#FCA5A5' : inputFocused ? '#3B82F6' : '#E2E8F0'}`,
                borderRadius: '12px',
                outline: 'none',
                boxShadow: error
                  ? '0 0 0 3px rgba(239,68,68,0.08)'
                  : inputFocused
                    ? '0 0 0 3px rgba(59,130,246,0.12)'
                    : 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                boxSizing: 'border-box',
                opacity: loading ? 0.7 : 1,
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <p id="name-error" style={{
              fontSize: '11.5px', color: '#EF4444',
              margin: '6px 0 0',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </p>
          )}

          {/* Helper text */}
          {!error && (
            <p id="name-hint" style={{
              fontSize: '11.5px', color: '#94A3B8',
              margin: '7px 0 0', lineHeight: 1.5,
            }}>
              Choose a descriptive name to organize your saved leads.
            </p>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: '#F1F5F9', margin: '20px 0 0' }} />

          {/* ── Buttons ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {/* Cancel */}
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
              style={{
                flex: 1, height: '46px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px',
                border: `1.5px solid ${cancelHover ? '#CBD5E1' : '#E2E8F0'}`,
                background: cancelHover ? '#F8FAFC' : '#FFFFFF',
                color: '#4B5563',
                fontSize: '13.5px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              Cancel
            </button>

            {/* Create list */}
            <button
              type="submit"
              disabled={!canSubmit}
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
              style={{
                flex: 1, height: '46px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                borderRadius: '12px', border: 'none',
                background: canSubmit
                  ? submitHover
                    ? 'linear-gradient(135deg, #15345C 0%, #1D4ED8 100%)'
                    : 'linear-gradient(135deg, #1A3D5C 0%, #2563EB 100%)'
                  : 'linear-gradient(135deg, #94A3B8, #94A3B8)',
                color: '#FFFFFF',
                fontSize: '13.5px', fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit
                  ? submitHover
                    ? '0 4px 16px rgba(26,61,92,0.35)'
                    : '0 2px 10px rgba(26,61,92,0.25)'
                  : 'none',
                transition: 'all 0.15s',
                transform: submitHover && canSubmit ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              {loading ? (
                <>
                  <SpinnerIco />
                  Creating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Create List
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
