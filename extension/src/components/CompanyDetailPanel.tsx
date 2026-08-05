import React, { useState, useEffect, useRef } from 'react';
import type { ListItem, CompanyResult } from '../types';
import { searchApi } from '../api/search';

/* ─── Extended detail type ────────────────────────────────────────────────── */
interface CompanyDetail extends CompanyResult {
  total_website_visits_monthly?: number | null;
  total_website_visits_change?: { change_monthly_percentage?: number | null } | null;
  employees_count_change?: { change_yearly_percentage?: number | null } | null;
  last_funding_round?: { type?: string | null; amount_raised?: number | null; [k: string]: unknown } | null;
  active_job_postings?: number | null;
  company_employee_reviews_aggregate_score?: number | null;
}

interface Props { item: ListItem; listName?: string; onClose: () => void; }

/* ─── Avatar color sets ───────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: '#FEE2E2', text: '#EF4444' }, { bg: '#DBEAFE', text: '#2563EB' },
  { bg: '#D1FAE5', text: '#059669' }, { bg: '#EDE9FE', text: '#7C3AED' },
  { bg: '#FFEDD5', text: '#EA580C' }, { bg: '#FCE7F3', text: '#DB2777' },
  { bg: '#CCFBF1', text: '#0D9488' },
];

const CHIP_COLORS = [
  { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC' },
];

/* ─── CompanyAvatar ───────────────────────────────────────────────────────── */
function CompanyAvatar({ name, logoUrl, website }: { name: string; logoUrl?: string | null; website?: string | null }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [logoUrl]);
  const initials = name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const c = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const src = logoUrl || (website ? `https://logo.clearbit.com/${website.replace(/^https?:\/\//, '').split('/')[0]}` : null);
  if (src && !err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'contain', border: '1px solid #F3F4F6', background: '#fff', padding: 4, flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: 96, height: 96, borderRadius: 12, flexShrink: 0, background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>
      {initials}
    </div>
  );
}

/* ─── SVG icons ───────────────────────────────────────────────────────────── */
function LinkedInSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <mask id="li-c-ext" fill="white"><path d="M0 10C0 4.477 4.477 0 10 0h20C35.523 0 40 4.477 40 10v20C40 35.523 35.523 40 30 40H10C4.477 40 0 35.523 0 30V10z" /></mask>
      <path d="M0 10C0 4.477 4.477 0 10 0h20C35.523 0 40 4.477 40 10v20C40 35.523 35.523 40 30 40H10C4.477 40 0 35.523 0 30V10z" fill="white" />
      <path d="M10 0v1h20V0v-1H10V0zM40 10h-1v20h1 1V10H40zM30 40v-1H10v1 1h20V40zM0 30h1V10H0h-1v20H0zM10 40v-1C5.03 39 1 34.97 1 30H0h-1C-1 36.075 3.925 41 10 41V40zM40 30h-1C39 34.97 34.97 39 30 39v1 1C36.075 41 41 36.075 41 30H40zM30 0V1C34.97 1 39 5.03 39 10h1 1C41 3.925 36.075-1 30-1V0zM10 0V-1C3.925-1-1 3.925-1 10H0h1C1 5.03 5.03 1 10 1V0z" fill="#ECEBF2" mask="url(#li-c-ext)" />
      <path d="M14.387 26.5V18.31H16.637V26.5H14.387zM14.387 17.575V15.325H16.637V17.575H14.387zM18.284 26.5V18.31h2.1v1.62l-.12-.36c.19-.49.494-.85.914-1.08.43-.24.93-.36 1.5-.36.62 0 1.16.13 1.62.39.47.26.834.625 1.094 1.095.26.46.39 1 .39 1.62V26.5h-2.25v-4.785c0-.32-.065-.595-.195-.825-.12-.23-.295-.41-.525-.54-.22-.13-.48-.195-.78-.195-.29 0-.55.065-.78.195-.23.13-.41.31-.54.54-.12.23-.18.505-.18.825V26.5h-2.25z" fill="#0A66C2" />
    </svg>
  );
}

function WebsiteSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <mask id="web-c-ext" fill="white"><path d="M0 10C0 4.477 4.477 0 10 0h20C35.523 0 40 4.477 40 10v20C40 35.523 35.523 40 30 40H10C4.477 40 0 35.523 0 30V10z" /></mask>
      <path d="M0 10C0 4.477 4.477 0 10 0h20C35.523 0 40 4.477 40 10v20C40 35.523 35.523 40 30 40H10C4.477 40 0 35.523 0 30V10z" fill="white" />
      <path d="M10 0v1h20V0v-1H10V0zM40 10h-1v20h1 1V10H40zM30 40v-1H10v1 1h20V40zM0 30h1V10H0h-1v20H0zM10 40v-1C5.03 39 1 34.97 1 30H0h-1C-1 36.075 3.925 41 10 41V40zM40 30h-1C39 34.97 34.97 39 30 39v1 1C36.075 41 41 36.075 41 30H40zM30 0V1C34.97 1 39 5.03 39 10h1 1C41 3.925 36.075-1 30-1V0zM10 0V-1C3.925-1-1 3.925-1 10H0h1C1 5.03 5.03 1 10 1V0z" fill="#ECEBF2" mask="url(#web-c-ext)" />
      <path d="M20 26.375C23.521 26.375 26.375 23.521 26.375 20C26.375 16.479 23.521 13.625 20 13.625C16.479 13.625 13.625 16.479 13.625 20C13.625 23.521 16.479 26.375 20 26.375Z" stroke="#5A5964" strokeWidth="1.275" />
      <path d="M13.625 20H26.375M20 13.625C21.771 15.396 21.771 24.25 20 26.375C18.229 24.25 18.229 15.396 20 13.625Z" stroke="#5A5964" strokeWidth="1.275" strokeLinecap="round" />
    </svg>
  );
}

const IcoBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const IcoChevL = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
const IcoChevR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;
const IcoChevUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>;
const IcoChevDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>;
const IcoPin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const IcoUsers = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
const IcoBuilding2 = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h6" /></svg>;
const IcoStar = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
const IcoDollar = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
const IcoBriefcase = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
const IcoBarChart = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcoLayers = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 2,7 12,12 22,7" /><polyline points="2,17 12,22 22,17" /><polyline points="2,12 12,17 22,12" /></svg>;
const IcoZap = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" /></svg>;
const IcoAward = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function toStringArr(val: string | string[] | null | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return val.split(',').map((s) => s.trim()).filter(Boolean);
}

function normalizeTechs(techs?: CompanyResult['technologies_used']): string[] {
  if (!techs) return [];
  return techs
    .map((t) => (typeof t === 'string' ? t : (t as { technology?: string }).technology ?? ''))
    .filter((s): s is string => Boolean(s));
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('en-US');
}

/* ─── Shared UI components ────────────────────────────────────────────────── */
function Empty({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 10 }}>
      {icon && <div style={{ borderRadius: 16, background: '#F9FAFB', padding: 16, color: '#D1D5DB' }}>{icon}</div>}
      <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500, margin: 0 }}>{text}</p>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, accent = false }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${accent ? '#FECACA' : '#F3F4F6'}`, padding: '12px', background: accent ? '#FEF2F2' : '#F5F4F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent ? '#F87171' : '#374151' }}>
        {icon}{label}
      </div>
      <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 800, lineHeight: 1.2, color: accent ? '#DC2626' : '#111827' }}>{value}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: 11.5, fontWeight: 600, color: '#374151' }}>{sub}</p>}
    </div>
  );
}

function GrowthBadge({ pct }: { pct: number }) {
  const pos = pct >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 700, border: `1px solid ${pos ? '#A7F3D0' : '#FECDD3'}`, background: pos ? '#ECFDF5' : '#FFF1F2', color: pos ? '#059669' : '#BE123C' }}>
      {pos ? <IcoChevUp /> : <IcoChevDown />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function ChipsSection({ title, items, colorize = false }: { title: string; items: string[]; colorize?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  const visible = showAll ? items : items.slice(0, VISIBLE);
  const remaining = items.length - VISIBLE;
  if (items.length === 0) return null;
  return (
    <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>{title}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {visible.map((s, i) => {
          const c = colorize ? CHIP_COLORS[i % CHIP_COLORS.length] : null;
          return (
            <span key={i} style={{ borderRadius: 20, border: `1px solid ${c ? c.border : '#E5E7EB'}`, padding: '6px 14px', fontSize: 13, fontWeight: 600, background: c ? c.bg : '#fff', color: c ? c.text : '#111827' }}>{s}</span>
          );
        })}
        {!showAll && remaining > 0 && (
          <button onClick={() => setShowAll(true)} style={{ borderRadius: 20, border: '1px solid #FECACA', background: '#FEF2F2', padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>+{remaining} more</button>
        )}
        {showAll && items.length > VISIBLE && (
          <button onClick={() => setShowAll(false)} style={{ borderRadius: 20, border: '1px solid #FECACA', background: '#FEF2F2', padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>Show less</button>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1, 2, 3].map((k) => (
        <div key={k} style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
          <div style={{ height: 16, width: 100, background: '#E5E7EB', borderRadius: 6, marginBottom: 16 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[88, 64, 104, 72, 96].map((w, i) => <div key={i} style={{ height: 36, width: w, background: '#E5E7EB', borderRadius: 20 }} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

const tabBtn = (active: boolean): React.CSSProperties => ({
  flexShrink: 0, whiteSpace: 'nowrap', padding: '10px 16px', fontSize: 13, fontWeight: 700,
  border: 'none', borderBottom: `2px solid ${active ? '#EF4444' : 'transparent'}`,
  cursor: 'pointer', color: active ? '#EF4444' : '#1F2937',
  background: active ? '#FEF2F2' : 'transparent', transition: 'all 0.15s',
});

/* ─── Main component ──────────────────────────────────────────────────────── */
export function CompanyDetailPanel({ item, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const base = item.data as CompanyResult;
  const d = (detail ?? base) as CompanyDetail;

  const overviewRef = useRef<HTMLDivElement>(null);
  const specialtiesRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchApi.getCompanyDetail(base.id)
      .then((r) => { if (!cancelled) { setDetail(r as CompanyDetail); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [base.id]);

  useEffect(() => {
    const refs = [
      { label: 'Overview', ref: overviewRef }, { label: 'Specialties', ref: specialtiesRef },
      { label: 'Tech Stack', ref: techRef }, { label: 'Metrics', ref: metricsRef },
      { label: 'About', ref: aboutRef },
    ];
    const container = scrollContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      const threshold = container.getBoundingClientRect().top + container.clientHeight * 0.25;
      for (let i = refs.length - 1; i >= 0; i--) {
        const el = refs[i].ref.current;
        if (el && el.getBoundingClientRect().top <= threshold) { setActiveTab(refs[i].label); return; }
      }
      setActiveTab(refs[0].label);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [detail]);

  const updateArrows = () => {
    const el = tabNavRef.current;
    if (!el) return;
    setCanScrollLeft(Math.floor(el.scrollLeft) > 0);
    setCanScrollRight(Math.ceil(el.scrollLeft) + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    const el = tabNavRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, []);

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

  /* derived values */
  const name = d.company_name || d.company_legal_name || 'Unknown Company';
  const location = [d.hq_city, d.hq_state, d.hq_country].filter(Boolean).join(', ') || d.hq_location || '';
  const companyLinkedIn = d.canonical_linkedin_url || null;
  const companyWebsite = d.website || null;
  const specialtiesArr = toStringArr(d.specialties);
  const techArr = normalizeTechs(d.technologies_used);
  const keywordsArr = toStringArr(d.categories_and_keywords);
  const awardsArr = toStringArr(d.awards_certifications);
  const description = (d as CompanyDetail & { description?: string | null }).description ?? null;

  const revStr = typeof d.revenue_annual_range === 'string' ? d.revenue_annual_range : null;

  const NAV = [
    { label: 'Overview', ref: overviewRef },
    { label: 'Specialties', ref: specialtiesRef, count: specialtiesArr.length },
    { label: 'Tech Stack', ref: techRef, count: techArr.length },
    { label: 'Metrics', ref: metricsRef },
    { label: 'About', ref: aboutRef },
  ];

  const arrowBtn = (show: boolean, dir: 'left' | 'right'): React.CSSProperties => ({
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, background: '#fff', border: 'none',
    borderRight: dir === 'left' ? '1px solid #F3F4F6' : 'none',
    borderLeft: dir === 'right' ? '1px solid #F3F4F6' : 'none',
    cursor: 'pointer', color: '#9CA3AF', visibility: show ? 'visible' : 'hidden',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#fff', display: 'flex', flexDirection: 'column',
      transform: visible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>Company</span>
          </div>
          <button onClick={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent', color: '#9CA3AF' }}>
            <IcoBack />
          </button>
        </div>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '0 20px 16px' }}>
          <CompanyAvatar name={name} logoUrl={d.logo_url} website={d.website} />
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{name}</h2>
              {d.is_public && <span style={{ borderRadius: 20, border: '1px solid #BFDBFE', background: '#EFF6FF', padding: '1px 8px', fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>PUBLIC</span>}
            </div>
            {d.industry && <p style={{ margin: '2px 0 6px', fontSize: 13, fontWeight: 600, color: '#2563EB', textTransform: 'capitalize' }}>{d.industry}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px' }}>
              {location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#9CA3AF' }}><IcoPin />{location}</span>}
              {d.founded && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#9CA3AF' }}><IcoBuilding2 />Est. {d.founded}</span>}
              {d.employees_count != null && d.employees_count > 0
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#9CA3AF' }}><IcoUsers />{d.employees_count.toLocaleString('en-US')} employees</span>
                : d.size_range
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#9CA3AF' }}><IcoUsers />{d.size_range}</span>
                  : null
              }
            </div>
            {d.type && (
              <div style={{ marginTop: 6 }}>
                <span style={{ borderRadius: 20, border: '1px solid #E5E7EB', background: '#F9FAFB', padding: '2px 10px', fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'capitalize' }}>
                  {d.type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Social links ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
          {companyLinkedIn ? (
            <a href={`https://${companyLinkedIn.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"><LinkedInSVG /></a>
          ) : (
            <span style={{ opacity: 0.3, cursor: 'not-allowed' }} title="LinkedIn not available"><LinkedInSVG /></span>
          )}
          {companyWebsite ? (
            <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noopener noreferrer" title="Website"><WebsiteSVG /></a>
          ) : (
            <span style={{ opacity: 0.3, cursor: 'not-allowed' }} title="Website not available"><WebsiteSVG /></span>
          )}
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'stretch', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => scrollTabNav('left')} style={arrowBtn(canScrollLeft, 'left')}><IcoChevL /></button>
        <div ref={tabNavRef} style={{ display: 'flex', overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {NAV.map((item) => (
            <button key={item.label} data-tab={item.label} onClick={() => scrollTo(item.label, item.ref)} style={tabBtn(activeTab === item.label)}>
              {item.label}
              {item.count != null && item.count > 0 && (
                <span style={{ marginLeft: 6, display: 'inline-flex', height: 16, minWidth: 16, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#EF4444', padding: '0 4px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => scrollTabNav('right')} style={arrowBtn(canScrollRight, 'right')}><IcoChevR /></button>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────── */}
      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <LoadingSkeleton />}
        {!loading && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Overview */}
            <div ref={overviewRef}>
              {description && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20, marginBottom: 16 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>About</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>{description}</p>
                </div>
              )}
              {(d.employees_count != null || d.company_employee_reviews_aggregate_score != null || d.active_job_postings != null) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {d.employees_count != null && d.employees_count > 0 && (
                    <MetricCard icon={<IcoUsers />} label="Employees" value={fmtNum(d.employees_count)} />
                  )}
                  {!d.employees_count && d.size_range && (
                    <MetricCard icon={<IcoUsers />} label="Size" value={d.size_range} />
                  )}
                  {d.company_employee_reviews_aggregate_score != null && (
                    <MetricCard icon={<IcoStar />} label="Rating" value={`★ ${d.company_employee_reviews_aggregate_score.toFixed(1)}`} accent />
                  )}
                  {d.active_job_postings != null && (
                    <MetricCard icon={<IcoBriefcase />} label="Open Jobs" value={String(d.active_job_postings)} />
                  )}
                </div>
              )}
              {!description && d.employees_count == null && d.company_employee_reviews_aggregate_score == null && d.active_job_postings == null && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Overview</p>
                  <Empty icon={<IcoBuilding2 />} text="No overview available" />
                </div>
              )}
            </div>

            {/* Specialties */}
            <div ref={specialtiesRef}>
              {specialtiesArr.length > 0 ? (
                <ChipsSection title="Specialties" items={specialtiesArr} />
              ) : (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Specialties</p>
                  <Empty icon={<IcoLayers />} text="No specialties listed" />
                </div>
              )}
            </div>

            {/* Tech Stack */}
            <div ref={techRef}>
              {techArr.length > 0 ? (
                <ChipsSection title="Tech Stack" items={techArr} colorize />
              ) : (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Tech Stack</p>
                  <Empty icon={<IcoZap />} text="No technologies listed" />
                </div>
              )}
            </div>

            {/* Metrics */}
            <div ref={metricsRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(d.employees_count != null || d.size_range) && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Headcount</p>
                    {d.employees_count_change?.change_yearly_percentage != null && <GrowthBadge pct={d.employees_count_change.change_yearly_percentage} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>
                      {d.employees_count != null && d.employees_count > 0 ? d.employees_count.toLocaleString('en-US') : d.size_range ?? '—'}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 3px' }}>employees</p>
                  </div>
                  {d.employees_count_change?.change_yearly_percentage != null && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                      {d.employees_count_change.change_yearly_percentage >= 0 ? '+' : ''}
                      {d.employees_count_change.change_yearly_percentage.toFixed(1)}% year-over-year
                    </p>
                  )}
                </div>
              )}

              {d.total_website_visits_monthly != null && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Monthly Web Traffic</p>
                    {d.total_website_visits_change?.change_monthly_percentage != null && <GrowthBadge pct={d.total_website_visits_change.change_monthly_percentage} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{fmtNum(d.total_website_visits_monthly)}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 3px' }}>visits / mo</p>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {revStr && <MetricCard icon={<IcoDollar />} label="Revenue" value={revStr} accent />}
                {d.active_job_postings != null && <MetricCard icon={<IcoBriefcase />} label="Open Jobs" value={String(d.active_job_postings)} />}
                {d.company_employee_reviews_aggregate_score != null && (
                  <MetricCard icon={<IcoStar />} label="Employee Rating" value={`★ ${d.company_employee_reviews_aggregate_score.toFixed(1)}`} sub="aggregate score" />
                )}
              </div>

              {!d.employees_count && !d.total_website_visits_monthly && !revStr && d.active_job_postings == null && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Metrics</p>
                  <Empty icon={<IcoBarChart />} text="No metrics available" />
                </div>
              )}
            </div>

            {/* About */}
            <div ref={aboutRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {d.last_funding_round && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Last Funding Round</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {d.last_funding_round.type && <span style={{ borderRadius: 20, border: '1px solid #BFDBFE', background: '#EFF6FF', padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>{d.last_funding_round.type}</span>}
                    {d.last_funding_round.amount_raised != null && <span style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>${fmtNum(d.last_funding_round.amount_raised)}</span>}
                  </div>
                  {d.last_funding_round['date'] != null && <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: '#374151' }}>{String(d.last_funding_round['date'] as string)}</p>}
                </div>
              )}

              {awardsArr.length > 0 && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Awards & Certifications</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {awardsArr.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ marginTop: 2, width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                          <IcoAward />
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4 }}>{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {keywordsArr.length > 0 && <ChipsSection title="Categories & Keywords" items={keywordsArr} />}

              {d.company_status && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.company_status.toLowerCase() === 'active' ? '#34D399' : '#D1D5DB' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', textTransform: 'capitalize' }}>{d.company_status}</span>
                  </div>
                </div>
              )}

              {!d.last_funding_round && !awardsArr.length && !keywordsArr.length && !d.company_status && (
                <div style={{ borderRadius: 16, border: '1px solid #F3F4F6', background: '#F5F4F9', padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>About</p>
                  <Empty icon={<IcoLayers />} text="No additional info available" />
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
