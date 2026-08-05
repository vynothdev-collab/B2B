import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ListItem, PersonResult } from '../types';
import { searchApi } from '../api/search';
import { useAuthStore } from '../store/authStore';

/* ─── Extended detail types ───────────────────────────────────────────────── */
interface WorkEntry {
  company_name: string | null; company_logo_url: string | null;
  company_website: string | null; company_linkedin_url: string | null;
  title: string | null; start_date: string | null; end_date: string | null;
  is_current: boolean; duration: string | null; location: string | null;
  description: string | null;
}
interface EducationEntry {
  school: string | null; school_logo_url: string | null;
  degree: string | null; field: string | null;
  start_year: string | null; end_year: string | null; activities: string | null;
}
interface ProjectEntry { name: string | null; url: string | null; description: string | null; }
interface PublicationEntry { title: string | null; publisher: string | null; }
interface PatentEntry { title: string | null; patent_number: string | null; }

interface PersonDetail extends Omit<PersonResult, 'summary'> {
  summary?: string | null;
  email?: string | null;
  work_history?: WorkEntry[];
  education?: EducationEntry[];
  total_experience?: string | null;
  projects?: ProjectEntry[];
  publications?: PublicationEntry[];
  patents?: PatentEntry[];
}

interface Props { item: ListItem; listName?: string; onClose: () => void; }

type ContactStatus =
  | { status: 'hidden' }
  | { status: 'loading' }
  | { status: 'revealed'; value: string }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

type SectionKey = 'contact' | 'skills' | 'experience' | 'education' | 'company' | 'summary' | 'projects';

/* ─── Avatar colors ───────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: '#FEE2E2', text: '#EF4444' }, { bg: '#DBEAFE', text: '#2563EB' },
  { bg: '#D1FAE5', text: '#059669' }, { bg: '#EDE9FE', text: '#7C3AED' },
  { bg: '#FFEDD5', text: '#EA580C' }, { bg: '#FCE7F3', text: '#DB2777' },
  { bg: '#CCFBF1', text: '#0D9488' },
];

/* ─── Icons ───────────────────────────────────────────────────────────────── */
function LinkedInSVG() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <mask id="li-dp-ext" fill="white"><path d="M0 10C0 4.477 4.477 0 10 0h20C35.523 0 40 4.477 40 10v20C40 35.523 35.523 40 30 40H10C4.477 40 0 35.523 0 30V10z" /></mask>
      <path d="M0 10C0 4.477 4.477 0 10 0h20C35.523 0 40 4.477 40 10v20C40 35.523 35.523 40 30 40H10C4.477 40 0 35.523 0 30V10z" fill="white" />
      <path d="M10 0v1h20V0v-1H10V0zM40 10h-1v20h1 1V10H40zM30 40v-1H10v1 1h20V40zM0 30h1V10H0h-1v20H0zM10 40v-1C5.03 39 1 34.97 1 30H0h-1C-1 36.075 3.925 41 10 41V40zM40 30h-1C39 34.97 34.97 39 30 39v1 1C36.075 41 41 36.075 41 30H40zM30 0V1C34.97 1 39 5.03 39 10h1 1C41 3.925 36.075-1 30-1V0zM10 0V-1C3.925-1-1 3.925-1 10H0h1C1 5.03 5.03 1 10 1V0z" fill="#ECEBF2" mask="url(#li-dp-ext)" />
      <path d="M14.387 26.5V18.31H16.637V26.5H14.387zM14.387 17.575V15.325H16.637V17.575H14.387zM18.284 26.5V18.31h2.1v1.62l-.12-.36c.19-.49.494-.85.914-1.08.43-.24.93-.36 1.5-.36.62 0 1.16.13 1.62.39.47.26.834.625 1.094 1.095.26.46.39 1 .39 1.62V26.5h-2.25v-4.785c0-.32-.065-.595-.195-.825-.12-.23-.295-.41-.525-.54-.22-.13-.48-.195-.78-.195-.29 0-.55.065-.78.195-.23.13-.41.31-.54.54-.12.23-.18.505-.18.825V26.5h-2.25z" fill="#0A66C2" />
    </svg>
  );
}

const IcoBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const IcoChevL = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
const IcoChevR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;
const IcoChevDown = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.22s ease', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IcoPin = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const IcoClock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
const IcoEmail = () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IcoPhone = () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IcoLock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const IcoCheckGreen = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcoCopySmall = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const IcoAward = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;
const IcoBriefcase = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
const IcoGradCap = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
const IcoFolder = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
const IcoBuilding = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h6" /></svg>;
const IcoExtLink = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
const IcoLinkSmall = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmtMo(d?: string | null) {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
function PersonAvatar({ name, src }: { name: string; src?: string | null }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [src]);
  if (src && !err) {
    return <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: '2px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />;
  }
  const letters = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const c = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <div style={{ width: 72, height: 72, borderRadius: 14, flexShrink: 0, background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, border: '2px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {letters}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function Empty({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 10 }}>
      {icon && <div style={{ borderRadius: 14, background: '#F9FAFB', padding: 14, color: '#D1D5DB' }}>{icon}</div>}
      <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500, margin: 0 }}>{text}</p>
    </div>
  );
}

/* ─── Collapsible section wrapper ────────────────────────────────────────── */
function CollapsibleSection({ sectionRef, title, badge, isOpen, onToggle, children }: {
  sectionRef?: React.RefObject<HTMLDivElement>;
  title: string;
  badge?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div ref={sectionRef} style={{ borderRadius: 14, border: '1px solid #E8ECF0', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 16px', background: isOpen ? '#FAFBFF' : '#fff',
        border: 'none', borderBottom: isOpen ? '1px solid #F1F5F9' : 'none',
        cursor: 'pointer', transition: 'background 0.15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{title}</span>
          {badge != null && badge > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 18, minWidth: 18, borderRadius: 20, background: '#EF4444', padding: '0 5px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
              {badge}
            </span>
          )}
        </div>
        <IcoChevDown open={isOpen} />
      </button>
      {/* Animated content */}
      <div style={{
        maxHeight: isOpen ? '3000px' : '0px',
        overflow: 'hidden',
        transition: isOpen ? 'max-height 0.3s ease' : 'max-height 0.22s ease',
      }}>
        <div style={{ padding: '14px 16px 16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Premium contact card (same as PersonCard) ──────────────────────────── */
function ContactCard({ icon, label, state, credits, onReveal }: {
  icon: React.ReactNode;
  label: string;
  state: ContactStatus;
  credits: number;
  onReveal: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const isRevealed = state.status === 'revealed';
  const isNotFound = state.status === 'not_found';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: isRevealed ? '#F0FDF4' : isNotFound ? '#FAFAFA' : '#F8FAFF',
      border: `1.5px solid ${isRevealed ? '#BBF7D0' : isNotFound ? '#E9ECEF' : '#DBEAFE'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isRevealed ? '#DCFCE7' : isNotFound ? '#F3F4F6' : '#EFF6FF',
        border: `1px solid ${isRevealed ? '#86EFAC' : isNotFound ? '#E5E7EB' : '#BFDBFE'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isRevealed ? '#15803D' : isNotFound ? '#D1D5DB' : '#2563EB',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1, color: isNotFound ? '#D1D5DB' : '#6B7280' }}>
          {label}
        </p>
        {state.status === 'hidden' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ color: '#94A3B8' }}><IcoLock /></span>
            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>Hidden · {credits} credit{credits !== 1 ? 's' : ''}</span>
          </div>
        )}
        {state.status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, border: '1.5px solid #DBEAFE', borderTopColor: '#2563EB', display: 'inline-block', animation: 'lb-spin 0.7s linear infinite' }} />
            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>Revealing...</span>
          </div>
        )}
        {state.status === 'revealed' && (
          <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {state.value}
          </p>
        )}
        {state.status === 'not_found' && <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#D1D5DB' }}>Not available</p>}
        {state.status === 'error' && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#EF4444', lineHeight: 1.3 }}>{state.message}</p>}
      </div>
      {state.status === 'hidden' && (
        <button onClick={onReveal} style={{
          flexShrink: 0, padding: '5px 11px', borderRadius: 7,
          fontSize: 11, fontWeight: 700, color: '#2563EB',
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DBEAFE'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; }}
        >
          Reveal
        </button>
      )}
      {state.status === 'revealed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <IcoCheckGreen />
          <button onClick={() => copy(state.value)} style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600,
            color: copied ? '#15803D' : '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
          }}>
            <IcoCopySmall /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Timeline entry ─────────────────────────────────────────────────────── */
function TimelineEntry({ title, subtitle, subtitleHref, locationText, startDate, endDate, isCurrent, description, isLast, highlight }: {
  title: string; subtitle?: string | null; subtitleHref?: string | null;
  locationText?: string | null; startDate?: string | null; endDate?: string | null;
  isCurrent?: boolean; description?: string | null; isLast?: boolean; highlight?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginTop: 4, width: 12, height: 12, borderRadius: '50%', border: '2px solid #EF4444', background: highlight ? '#EF4444' : '#fff', flexShrink: 0 }} />
        {!isLast && <div style={{ width: 1, flex: 1, marginTop: 4, marginBottom: 4, minHeight: 20, background: '#FCA5A5' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 4 : 20 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{title}</p>
        {subtitle && (subtitleHref ? (
          <a href={subtitleHref.startsWith('http') ? subtitleHref : `https://${subtitleHref}`} target="_blank" rel="noopener noreferrer"
            style={{ marginTop: 2, display: 'block', fontSize: 12.5, fontWeight: 600, color: '#EF4444', textDecoration: 'none' }}>{subtitle}</a>
        ) : (
          <p style={{ margin: '2px 0 0', fontSize: 12.5, fontWeight: 600, color: '#EF4444' }}>{subtitle}</p>
        ))}
        {locationText !== undefined && <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#6B7280' }}>{locationText ?? 'Location not specified'}</p>}
        {(startDate || endDate || isCurrent) && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {fmtMo(startDate) && <span style={{ borderRadius: 20, background: '#FEE2E2', padding: '2px 10px', fontSize: 11.5, fontWeight: 600, color: '#DC2626' }}>{fmtMo(startDate)}</span>}
            <span style={{ fontSize: 12, color: '#FCA5A5' }}>–</span>
            <span style={{ borderRadius: 20, background: isCurrent ? '#EF4444' : '#FEE2E2', padding: '2px 10px', fontSize: 11.5, fontWeight: 600, color: isCurrent ? '#fff' : '#DC2626' }}>{isCurrent ? 'Current' : fmtMo(endDate) || 'Present'}</span>
          </div>
        )}
        {description && (
          <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.6, color: '#374151', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Education row ──────────────────────────────────────────────────────── */
function EduRow({ entry, isLast }: { entry: EducationEntry; isLast: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginTop: 4, width: 12, height: 12, borderRadius: '50%', border: '2px solid #EF4444', background: '#fff', flexShrink: 0 }} />
        {!isLast && <div style={{ width: 1, flex: 1, marginTop: 4, marginBottom: 4, minHeight: 20, background: '#FCA5A5' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 4 : 20 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>{entry.school ?? 'Unknown School'}</p>
        {(entry.degree || entry.field) && (
          <p style={{ margin: '2px 0 0', fontSize: 12.5, fontWeight: 600, color: '#EF4444' }}>
            {[entry.degree, entry.field].filter(Boolean).join(', ')}
          </p>
        )}
        {(entry.start_year || entry.end_year) && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {entry.start_year && <span style={{ borderRadius: 20, background: '#FEE2E2', padding: '2px 10px', fontSize: 11.5, fontWeight: 600, color: '#DC2626' }}>{entry.start_year}</span>}
            {entry.start_year && entry.end_year && <span style={{ fontSize: 12, color: '#FCA5A5' }}>–</span>}
            {entry.end_year && <span style={{ borderRadius: 20, background: '#FEE2E2', padding: '2px 10px', fontSize: 11.5, fontWeight: 600, color: '#DC2626' }}>{entry.end_year}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Skills section ─────────────────────────────────────────────────────── */
function SkillChips({ skills }: { skills: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 8;
  const visible = showAll ? skills : skills.slice(0, VISIBLE);
  const remaining = skills.length - VISIBLE;
  if (skills.length === 0) return <Empty icon={<IcoAward />} text="No skills listed" />;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {visible.map((s, i) => (
        <span key={i} style={{ borderRadius: 8, border: '1px solid #E5E7EB', padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: '#111827', background: '#fff' }}>{s}</span>
      ))}
      {!showAll && remaining > 0 && (
        <button onClick={() => setShowAll(true)} style={{ borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>
          +{remaining} more
        </button>
      )}
      {showAll && skills.length > VISIBLE && (
        <button onClick={() => setShowAll(false)} style={{ borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>
          Show less
        </button>
      )}
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
function LoadingSkeleton() {
  const Bone = ({ w, h = 12, r = 6 }: { w?: string | number; h?: number; r?: number }) => (
    <div style={{ height: h, width: w ?? '100%', borderRadius: r, background: 'linear-gradient(90deg, #F1F5F9 0%, #E8EEF4 50%, #F1F5F9 100%)', backgroundSize: '200% 100%', animation: 'lb-shimmer 1.4s ease infinite' }} />
  );
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Contact skeleton */}
      <div style={{ borderRadius: 14, border: '1px solid #E8ECF0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', background: '#FAFBFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Bone w={120} h={14} />
          <Bone w={14} h={14} r={3} />
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#F8FAFF', border: '1.5px solid #DBEAFE' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Bone w={70} h={8} r={4} />
                <Bone w={110} h={10} r={5} />
              </div>
              <Bone w={52} h={26} r={7} />
            </div>
          ))}
        </div>
      </div>
      {/* Skills skeleton */}
      <div style={{ borderRadius: 14, border: '1px solid #E8ECF0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', background: '#FAFBFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
          <Bone w={60} h={14} />
          <Bone w={14} h={14} r={3} />
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {[64, 80, 52, 92, 68, 76, 56, 84].map((w, i) => <div key={i} style={{ height: 34, width: w, borderRadius: 8, background: 'linear-gradient(90deg, #F1F5F9 0%, #E8EEF4 50%, #F1F5F9 100%)', backgroundSize: '200% 100%', animation: 'lb-shimmer 1.4s ease infinite' }} />)}
        </div>
      </div>
      {/* Experience skeleton */}
      <div style={{ borderRadius: 14, border: '1px solid #E8ECF0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', background: '#FAFBFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
          <Bone w={110} h={14} />
          <Bone w={14} h={14} r={3} />
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E8EEF4', marginTop: 4 }} />
                {i < 1 && <div style={{ width: 1, flex: 1, background: '#E8EEF4', marginTop: 4, minHeight: 50 }} />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Bone w="60%" h={14} />
                <Bone w="40%" h={12} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ height: 22, width: 72, borderRadius: 20, background: '#E8EEF4' }} />
                  <div style={{ height: 22, width: 60, borderRadius: 20, background: '#E8EEF4' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab button style ───────────────────────────────────────────────────── */
const tabBtn = (active: boolean): React.CSSProperties => ({
  flexShrink: 0, whiteSpace: 'nowrap', padding: '10px 16px', fontSize: 12.5, fontWeight: 700,
  border: 'none', borderBottom: `2px solid ${active ? '#EF4444' : 'transparent'}`,
  cursor: 'pointer', color: active ? '#EF4444' : '#374151',
  background: active ? '#FEF2F2' : 'transparent', transition: 'all 0.15s',
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export function PersonDetailPanel({ item, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Contact');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* Contact reveal state */
  const [contact, setContact] = useState<{
    workEmail: ContactStatus;
    personalEmail: ContactStatus;
    phone: ContactStatus;
  }>({
    workEmail: { status: 'hidden' },
    personalEmail: { status: 'hidden' },
    phone: { status: 'hidden' },
  });

  /* Collapsible sections */
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    contact: true, skills: true, experience: true,
    education: true, company: true, summary: false, projects: false,
  });

  const { refreshUser } = useAuthStore();
  const base = item.data as PersonResult;
  const d = (detail ?? base) as PersonDetail;

  /* Refs */
  const contactRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const eduRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  /* Slide-in animation */
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Fetch detail */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchApi.getPersonDetail(base.id)
      .then(r => { if (!cancelled) { setDetail(r as PersonDetail); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [base.id]);

  /* Scroll → active tab */
  useEffect(() => {
    const refs = [
      { label: 'Contact', ref: contactRef }, { label: 'Skills', ref: skillsRef },
      { label: 'Work Experience', ref: expRef }, { label: 'Education', ref: eduRef },
      { label: 'Company Info', ref: companyRef }, { label: 'Summary', ref: summaryRef },
      { label: 'Projects', ref: projRef },
    ];
    const container = scrollContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      const threshold = container.getBoundingClientRect().top + container.clientHeight * 0.25;
      for (let i = refs.length - 1; i >= 0; i--) {
        const el = refs[i].ref.current;
        if (el && el.getBoundingClientRect().top <= threshold) { setActiveTab(refs[i].label); return; }
      }
      setActiveTab('Contact');
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [detail]);

  /* Tab nav arrows */
  const updateArrows = useCallback(() => {
    const el = tabNavRef.current;
    if (!el) return;
    setCanScrollLeft(Math.floor(el.scrollLeft) > 0);
    setCanScrollRight(Math.ceil(el.scrollLeft) + el.clientWidth < el.scrollWidth);
  }, []);

  useEffect(() => {
    const el = tabNavRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, [updateArrows]);

  /* Auto-scroll active tab into view */
  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const btn = nav.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (!btn) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const left = btnRect.left - navRect.left + nav.scrollLeft;
    const right = btnRect.right - navRect.left + nav.scrollLeft;
    if (left < nav.scrollLeft) nav.scrollTo({ left, behavior: 'smooth' });
    else if (right > nav.scrollLeft + nav.clientWidth) nav.scrollTo({ left: right - nav.clientWidth, behavior: 'smooth' });
  }, [activeTab]);

  const scrollTabNav = (dir: 'left' | 'right') =>
    tabNavRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });

  const scrollTo = (label: string, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(label);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  /* Toggle helpers */
  const toggle = (key: SectionKey) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  const expandAll = () => setOpen({ contact: true, skills: true, experience: true, education: true, company: true, summary: true, projects: true });
  const collapseAll = () => setOpen({ contact: false, skills: false, experience: false, education: false, company: false, summary: false, projects: false });

  /* Reveal contact */
  async function revealContact(type: 'workEmail' | 'personalEmail' | 'phone') {
    setContact(prev => ({ ...prev, [type]: { status: 'loading' } }));
    try {
      if (type === 'workEmail') {
        const r = await searchApi.revealWorkEmail(d.id);
        setContact(prev => ({ ...prev, workEmail: r.email ? { status: 'revealed', value: r.email } : { status: 'not_found' } }));
      } else if (type === 'personalEmail') {
        const r = await searchApi.revealPersonalEmail(d.id);
        setContact(prev => ({ ...prev, personalEmail: r.email ? { status: 'revealed', value: r.email } : { status: 'not_found' } }));
      } else {
        const r = await searchApi.revealPhone(d.id);
        setContact(prev => ({ ...prev, phone: r.phone ? { status: 'revealed', value: r.phone } : { status: 'not_found' } }));
      }
      refreshUser();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed — check your credits';
      setContact(prev => ({ ...prev, [type]: { status: 'error', message: msg } }));
    }
  }

  /* Derived values */
  const fullName = d.full_name || [d.first_name, d.last_name].filter(Boolean).join(' ') || 'Unknown';
  const titleLine = d.active_experience_title || d.headline || '';
  const companyLine = d.active_experience_company_name || '';
  const location = [d.location_city, d.location_state, d.location_country].filter(Boolean).join(', ');
  const personLinkedIn = d.linkedin_url || null;
  const skills = (d.inferred_skills ?? []) as string[];
  const workHistory = detail?.work_history ?? [];
  const education = detail?.education ?? [];
  const summary = detail?.summary ?? (d as PersonDetail).summary ?? null;
  const totalExperience = detail?.total_experience ?? null;
  const projects = detail?.projects ?? [];
  const publications = detail?.publications ?? [];
  const patents = detail?.patents ?? [];
  const projCount = projects.length + publications.length + patents.length;
  const currentWork = workHistory.find(w => w.is_current) ?? workHistory[0] ?? null;
  const companyWebsite = currentWork?.company_website ?? d.active_experience_company_website ?? null;
  const companyLinkedIn = currentWork?.company_linkedin_url ?? d.active_experience_company_linkedin_url ?? null;

  const NAV = [
    { label: 'Contact', ref: contactRef },
    { label: 'Skills', ref: skillsRef, count: skills.length },
    { label: 'Work Experience', ref: expRef, count: workHistory.length },
    { label: 'Education', ref: eduRef, count: education.length },
    { label: 'Company Info', ref: companyRef },
    { label: 'Summary', ref: summaryRef },
    { label: 'Projects', ref: projRef, count: projCount },
  ];

  const arrowBtn = (show: boolean, dir: 'left' | 'right'): React.CSSProperties => ({
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, background: '#fff', border: 'none',
    borderRight: dir === 'left' ? '1px solid #F3F4F6' : 'none',
    borderLeft: dir === 'right' ? '1px solid #F3F4F6' : 'none',
    cursor: 'pointer', color: '#9CA3AF', visibility: show ? 'visible' : 'hidden',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#F8FAFC', display: 'flex', flexDirection: 'column',
      transform: visible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>Profile</span>
          </div>
          <button onClick={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #F1F5F9', cursor: 'pointer', background: '#FAFAFA', color: '#6B7280' }}>
            <IcoBack />
          </button>
        </div>

        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '0 16px 12px' }}>
          <PersonAvatar name={fullName} src={d.picture_url as string | null} />
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 2px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{fullName}</h2>
            {titleLine && <p style={{ margin: '0 0 2px', fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>{titleLine}</p>}
            {companyLine && <p style={{ margin: '0 0 5px', fontSize: 12.5, fontWeight: 600, color: '#2563EB', lineHeight: 1.4 }}>{companyLine}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 10px' }}>
              {location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94A3B8' }}><IcoPin />{location}</span>}
              {totalExperience && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94A3B8' }}><IcoClock />{totalExperience}</span>}
            </div>
          </div>
        </div>

        {/* Social links */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
          {personLinkedIn ? (
            <a href={`https://${personLinkedIn.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"><LinkedInSVG /></a>
          ) : (
            <span style={{ opacity: 0.3, cursor: 'not-allowed' }} title="LinkedIn not available"><LinkedInSVG /></span>
          )}
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'stretch', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => scrollTabNav('left')} style={arrowBtn(canScrollLeft, 'left')}><IcoChevL /></button>
        <div ref={tabNavRef} style={{ display: 'flex', overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {NAV.map(nav => (
            <button key={nav.label} data-tab={nav.label} onClick={() => scrollTo(nav.label, nav.ref)} style={tabBtn(activeTab === nav.label)}>
              {nav.label}
              {nav.count != null && nav.count > 0 && (
                <span style={{ marginLeft: 5, display: 'inline-flex', height: 16, minWidth: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 20, background: '#EF4444', padding: '0 4px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  {nav.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => scrollTabNav('right')} style={arrowBtn(canScrollRight, 'right')}><IcoChevR /></button>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────── */}
      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div style={{ padding: '12px 5px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Expand / Collapse all controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px' }}>
              <button onClick={expandAll} style={{ fontSize: 11.5, fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                Expand All
              </button>
              <span style={{ color: '#E5E7EB', fontSize: 14 }}>|</span>
              <button onClick={collapseAll} style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                Collapse All
              </button>
            </div>

            {/* ── Contact Information ────────────────────────────────── */}
            <CollapsibleSection sectionRef={contactRef} title="Contact Information" isOpen={open.contact} onToggle={() => toggle('contact')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <ContactCard icon={<IcoEmail />} label="Work Email" state={contact.workEmail} credits={1} onReveal={() => revealContact('workEmail')} />
                <ContactCard icon={<IcoEmail />} label="Personal Email" state={contact.personalEmail} credits={1} onReveal={() => revealContact('personalEmail')} />
                <ContactCard icon={<IcoPhone />} label="Mobile Number" state={contact.phone} credits={10} onReveal={() => revealContact('phone')} />
              </div>
            </CollapsibleSection>

            {/* ── Skills ────────────────────────────────────────────── */}
            <CollapsibleSection sectionRef={skillsRef} title="Skills" badge={skills.length} isOpen={open.skills} onToggle={() => toggle('skills')}>
              <SkillChips skills={skills} />
            </CollapsibleSection>

            {/* ── Work Experience ────────────────────────────────────── */}
            <CollapsibleSection sectionRef={expRef} title="Work Experience" badge={workHistory.length} isOpen={open.experience} onToggle={() => toggle('experience')}>
              {workHistory.length === 0 ? (
                <Empty icon={<IcoBriefcase />} text="No work experience listed" />
              ) : (
                workHistory.map((w, i) => (
                  <TimelineEntry key={i} title={w.title ?? 'Unknown Role'} subtitle={w.company_name}
                    subtitleHref={w.company_linkedin_url ?? undefined} locationText={w.location}
                    startDate={w.start_date} endDate={w.end_date} isCurrent={w.is_current}
                    description={w.description} isLast={i === workHistory.length - 1} highlight={w.is_current} />
                ))
              )}
            </CollapsibleSection>

            {/* ── Education ─────────────────────────────────────────── */}
            <CollapsibleSection sectionRef={eduRef} title="Education" badge={education.length} isOpen={open.education} onToggle={() => toggle('education')}>
              {education.length === 0 ? (
                <Empty icon={<IcoGradCap />} text="No education listed" />
              ) : (
                education.map((edu, i) => <EduRow key={i} entry={edu} isLast={i === education.length - 1} />)
              )}
            </CollapsibleSection>

            {/* ── Company Info ───────────────────────────────────────── */}
            <CollapsibleSection sectionRef={companyRef} title="Company Info" isOpen={open.company} onToggle={() => toggle('company')}>
              {!companyLine && !d.active_experience_company_employees_count && !companyWebsite ? (
                <Empty icon={<IcoBuilding />} text="No company info available" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {companyLine && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {d.active_experience_company_logo_url && (
                        <img src={d.active_experience_company_logo_url as string} alt={companyLine}
                          style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', border: '1px solid #E5E7EB' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#2563EB', margin: 0 }}>{companyLine}</p>
                        {d.active_experience_company_industry && <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{d.active_experience_company_industry}</p>}
                      </div>
                    </div>
                  )}
                  {(d.active_experience_company_employees_count || d.active_experience_company_size) && (
                    <span style={{ fontSize: 12.5, color: '#374151' }}>
                      <span style={{ color: '#9CA3AF' }}>Employees: </span>
                      {d.active_experience_company_employees_count?.toLocaleString() ?? d.active_experience_company_size}
                    </span>
                  )}
                  {[d.active_experience_company_hq_city, d.active_experience_company_hq_country].filter(Boolean).join(', ') && (
                    <span style={{ fontSize: 12.5, color: '#374151' }}>
                      <span style={{ color: '#9CA3AF' }}>HQ: </span>
                      {[d.active_experience_company_hq_city, d.active_experience_company_hq_country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {companyWebsite && (
                    <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
                      <IcoExtLink />{companyWebsite.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  )}
                  {companyLinkedIn && (
                    <a href={companyLinkedIn.startsWith('http') ? companyLinkedIn : `https://${companyLinkedIn}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#0A66C2', textDecoration: 'none', fontWeight: 500 }}>
                      <IcoLinkSmall /> Company LinkedIn
                    </a>
                  )}
                </div>
              )}
            </CollapsibleSection>

            {/* ── Summary ───────────────────────────────────────────── */}
            <CollapsibleSection sectionRef={summaryRef} title="Summary" isOpen={open.summary} onToggle={() => toggle('summary')}>
              {summary ? (
                <p style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{summary}</p>
              ) : (
                <Empty text="No summary available" />
              )}
            </CollapsibleSection>

            {/* ── Projects ──────────────────────────────────────────── */}
            <CollapsibleSection sectionRef={projRef} title="Projects" badge={projCount} isOpen={open.projects} onToggle={() => toggle('projects')}>
              {projCount === 0 ? (
                <Empty icon={<IcoFolder />} text="No projects listed" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {projects.map((p, i) => (
                    <div key={`p${i}`} style={{ borderRadius: 10, border: '1px solid #E8ECF0', background: '#FAFBFF', padding: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{p.name ?? 'Untitled Project'}</p>
                      {p.description && <p style={{ fontSize: 12.5, color: '#6B7280', margin: '5px 0 0', lineHeight: 1.5 }}>{p.description}</p>}
                      {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563EB', marginTop: 6, display: 'block' }}>View Project →</a>}
                    </div>
                  ))}
                  {publications.map((p, i) => (
                    <div key={`pub${i}`} style={{ borderRadius: 10, border: '1px solid #E8ECF0', background: '#FAFBFF', padding: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{p.title ?? 'Untitled Publication'}</p>
                      {p.publisher && <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>{p.publisher}</p>}
                    </div>
                  ))}
                  {patents.map((p, i) => (
                    <div key={`pat${i}`} style={{ borderRadius: 10, border: '1px solid #E8ECF0', background: '#FAFBFF', padding: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{p.title ?? 'Untitled Patent'}</p>
                      {p.patent_number && <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>Patent #{p.patent_number}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>

          </div>
        )}
      </div>
    </div>
  );
}
