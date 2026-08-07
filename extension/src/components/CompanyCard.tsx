import React, { useState } from 'react';
import type { CompanyResult, LeadsList } from '../types';
import { searchApi } from '../api/search';
import { UNLOCK_COSTS } from '../constants/unlockCosts';
import { AddToListModal } from './AddToListModal';

interface Props {
  company: CompanyResult;
  lists?: LeadsList[];
  onRefreshLists?: () => void;
}

/* ─── Company logo ───────────────────────────────────────────────────────── */
function CompanyLogo({ src, name, website }: { src?: string | null; name: string; website?: string | null }) {
  const domain = website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || '';
  const sources = [src, domain ? `https://logo.clearbit.com/${domain}` : undefined].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const cur = sources[idx];
  const initials = name.slice(0, 2).toUpperCase();
  if (cur) {
    return (
      <img src={cur} alt={name} onError={() => setIdx(i => i + 1)} style={{
        width: 56, height: 56, borderRadius: 12, objectFit: 'contain',
        border: '1.5px solid #E5E7EB', background: '#fff', flexShrink: 0,
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      }} />
    );
  }
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg, #1A3D5C, #2563EB)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
      boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
    }}>
      {initials}
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IcoPin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const IcoUsers = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
const IcoCalendar = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
const IcoDollar = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
const IcoGlobe = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3c2.485 0 4.5 4.03 4.5 9S14.485 21 12 21m0-18c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9M3 12h18" /></svg>;
const IcoLinkedIn = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const IcoListPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 12H3M16 6H3M11 18H3M18 9v6M21 12h-6" /></svg>;
const IcoCopy = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const IcoEmail = () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IcoPhone = () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IcoCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcoLock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;

function fmtEmployees(n?: number, range?: string): string {
  if (!n) return range || '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function parseTechs(raw?: Array<{ technology?: string } | string>): string[] {
  if (!raw?.length) return [];
  return raw.map(t => (typeof t === 'string' ? t : (t?.technology || ''))).filter(Boolean);
}

/* ─── Section label ──────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
      {children}
    </p>
  );
}

/* ─── Contact unlock row ─────────────────────────────────────────────────── */
function ContactUnlockRow({ icon, label, value, hasValue, unlocked, unlocking, credits, onUnlock }: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  hasValue: boolean;
  unlocked: boolean;
  unlocking: boolean;
  credits: number;
  onUnlock: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10,
      background: unlocked && value ? '#F0FDF4' : '#F8FAFF',
      border: `1.5px solid ${unlocked && value ? '#BBF7D0' : '#DBEAFE'}`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        background: unlocked && value ? '#DCFCE7' : '#EFF6FF',
        border: `1px solid ${unlocked && value ? '#86EFAC' : '#BFDBFE'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: unlocked && value ? '#15803D' : '#2563EB',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280' }}>{label}</p>
        {unlocked ? (
          <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'Not available'}</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <span style={{ color: '#94A3B8' }}><IcoLock /></span>
            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
              {unlocking ? 'Unlocking…' : `Hidden · ${credits} credit${credits !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}
      </div>
      {unlocked && value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <IcoCheck />
          <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: copied ? '#15803D' : '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
            <IcoCopy /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : !unlocked && hasValue !== false ? (
        <button onClick={onUnlock} disabled={unlocking} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 11px', borderRadius: 7, fontSize: 11, fontWeight: 700,
          color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE',
          cursor: unlocking ? 'wait' : 'pointer', opacity: unlocking ? 0.6 : 1, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DBEAFE'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; }}
        >
          Unlock
        </button>
      ) : (
        <span style={{ fontSize: 11, color: '#D1D5DB' }}>—</span>
      )}
    </div>
  );
}

/* ─── Info row ───────────────────────────────────────────────────────────── */
function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#94A3B8', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12.5, color: '#374151' }}>{children}</span>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function CompanyCard({ company, onRefreshLists }: Props) {
  const [addListOpen, setAddListOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [techsExpanded, setTechsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(!!company.unlocked?.email);
  const [phoneUnlocked, setPhoneUnlocked] = useState(!!company.unlocked?.phone);
  const [emailValue, setEmailValue] = useState<string | null>(company.email ?? null);
  const [phoneValue, setPhoneValue] = useState<string | null>(company.phone ?? null);
  const [unlockingField, setUnlockingField] = useState<'email' | 'phone' | null>(null);

  const name = company.company_name || company.company_legal_name || 'Unknown Company';
  const location = [company.hq_city, company.hq_state, company.hq_country].filter(Boolean).join(', ') || company.hq_location || '';
  const empStr = fmtEmployees(company.employees_count, company.size_range);
  const techs = parseTechs(company.technologies_used);
  const TECHS_VISIBLE = 6;
  const visibleTechs = techsExpanded ? techs : techs.slice(0, TECHS_VISIBLE);
  const moreTechs = techs.length - TECHS_VISIBLE;
  const domain = company.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') || '';
  const isActive = company.company_status?.toLowerCase() === 'active';
  const hasContact = !!(company.has_email || company.has_phone);

  const unlockField = async (field: 'email' | 'phone') => {
    if (unlockingField) return;
    setUnlockingField(field);
    try {
      if (field === 'email') {
        const r = await searchApi.unlockCompanyEmail(company.id);
        setEmailValue(r.email);
        setEmailUnlocked(true);
      } else {
        const r = await searchApi.unlockCompanyPhone(company.id);
        setPhoneValue(r.phone);
        setPhoneUnlocked(true);
      }
    } catch { /* ignore — button re-enables, user can retry */ }
    finally { setUnlockingField(null); }
  };

  const copyWebsite = async () => {
    if (!company.website) return;
    await navigator.clipboard.writeText(company.website);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ padding: '12px 12px 0' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E8ECF0', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '18px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            <CompanyLogo src={company.logo_url} name={name} website={company.website} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 3px', lineHeight: 1.25, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </h2>
              {company.industry && (
                <p style={{ margin: '0 0 7px', fontSize: 12.5, color: '#475569' }}>{company.industry}</p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {company.company_status && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 700,
                    color: isActive ? '#15803D' : '#6B7280',
                    background: isActive ? '#F0FDF4' : '#F3F4F6',
                    border: `1px solid ${isActive ? '#BBF7D0' : '#E5E7EB'}`,
                    padding: '2px 8px', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />}
                    {company.company_status.charAt(0).toUpperCase() + company.company_status.slice(1)}
                  </span>
                )}
                {company.type && (
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 20 }}>
                    {company.type}
                  </span>
                )}
                {company.is_public !== undefined && (
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 20 }}>
                    {company.is_public ? 'Public' : 'Private'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setAddListOpen(true)} title="Add to list" aria-label="Add to list" style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8,
            fontSize: 11.5, fontWeight: 700, color: '#DC2626', background: '#FEF2F2',
            border: '1.5px solid #FECACA', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#DC2626'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA'; }}
          >
            <IcoListPlus /> Add
          </button>
          </div>
        </div>

        {/* ── Info rows ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {location && <InfoRow icon={<IcoPin />}>{location}</InfoRow>}
          {empStr && <InfoRow icon={<IcoUsers />}>{empStr} employees</InfoRow>}
          {company.founded && <InfoRow icon={<IcoCalendar />}>Founded {company.founded}</InfoRow>}
          {company.revenue_annual_range && <InfoRow icon={<IcoDollar />}>{company.revenue_annual_range}</InfoRow>}
          {domain && (
            <InfoRow icon={<IcoGlobe />}>
              <a href={company.website!.startsWith('http') ? company.website! : `https://${company.website}`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#2563EB', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
              >
                {domain}
              </a>
            </InfoRow>
          )}
          {company.canonical_linkedin_url && (
            <InfoRow icon={<span style={{ color: '#0A66C2' }}><IcoLinkedIn /></span>}>
              <a href={company.canonical_linkedin_url.startsWith('http') ? company.canonical_linkedin_url : `https://${company.canonical_linkedin_url}`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#0A66C2', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
              >
                LinkedIn Page
              </a>
            </InfoRow>
          )}
        </div>

        {/* ── Contact Information ──────────────────────────────────────────── */}
        {hasContact && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '13px 18px' }}>
            <SectionLabel>Contact Information</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {company.has_email && (
                <ContactUnlockRow
                  icon={<IcoEmail />}
                  label="Company Email"
                  value={emailValue}
                  hasValue={company.has_email}
                  unlocked={emailUnlocked}
                  unlocking={unlockingField === 'email'}
                  credits={UNLOCK_COSTS.companyEmail}
                  onUnlock={() => unlockField('email')}
                />
              )}
              {company.has_phone && (
                <ContactUnlockRow
                  icon={<IcoPhone />}
                  label="Company Phone"
                  value={phoneValue}
                  hasValue={company.has_phone}
                  unlocked={phoneUnlocked}
                  unlocking={unlockingField === 'phone'}
                  credits={UNLOCK_COSTS.companyPhone}
                  onUnlock={() => unlockField('phone')}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Description ─────────────────────────────────────────────────── */}
        {company.description && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '13px 18px' }}>
            <SectionLabel>About</SectionLabel>
            <p style={{
              fontSize: 12.5, color: '#374151', lineHeight: 1.65, margin: 0,
              display: '-webkit-box', WebkitLineClamp: descExpanded ? 'unset' : 4,
              WebkitBoxOrient: 'vertical', overflow: descExpanded ? 'visible' : 'hidden',
            } as React.CSSProperties}>
              {company.description}
            </p>
            {company.description.length > 220 && (
              <button onClick={() => setDescExpanded(v => !v)} style={{ marginTop: 5, fontSize: 11.5, fontWeight: 600, color: '#E84010', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {descExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* ── Technologies ────────────────────────────────────────────────── */}
        {techs.length > 0 && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '13px 18px' }}>
            <SectionLabel>Tech Stack</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {visibleTechs.map((t, i) => (
                <span key={i} style={{ fontSize: 11.5, fontWeight: 500, color: '#374151', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '3px 10px', borderRadius: 8 }}>
                  {t}
                </span>
              ))}
              {!techsExpanded && moreTechs > 0 && (
                <button onClick={() => setTechsExpanded(true)} style={{ fontSize: 11.5, fontWeight: 600, color: '#E84010', background: '#FFF7F5', border: '1px solid #FED7CC', padding: '3px 10px', borderRadius: 8, cursor: 'pointer' }}>
                  +{moreTechs} more
                </button>
              )}
              {techsExpanded && techs.length > TECHS_VISIBLE && (
                <button onClick={() => setTechsExpanded(false)} style={{ fontSize: 11.5, fontWeight: 600, color: '#E84010', background: '#FFF7F5', border: '1px solid #FED7CC', padding: '3px 10px', borderRadius: 8, cursor: 'pointer' }}>
                  Show less
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {domain && (
            <a href={company.website!.startsWith('http') ? company.website! : `https://${company.website}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', background: '#F9FAFB', border: '1.5px solid #E5E7EB', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A3D5C'; (e.currentTarget as HTMLAnchorElement).style.color = '#1A3D5C'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}
            >
              <IcoGlobe /> Website
            </a>
          )}
          {domain && (
            <button onClick={copyWebsite} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              color: copied ? '#15803D' : '#374151',
              background: copied ? '#F0FDF4' : '#F9FAFB',
              border: `1.5px solid ${copied ? '#BBF7D0' : '#E5E7EB'}`,
            }}>
              <IcoCopy /> {copied ? 'Copied!' : 'Copy URL'}
            </button>
          )}
          {company.canonical_linkedin_url && (
            <a href={company.canonical_linkedin_url.startsWith('http') ? company.canonical_linkedin_url : `https://${company.canonical_linkedin_url}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0A66C2', background: '#EFF6FF', border: '1.5px solid #BFDBFE', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#DBEAFE'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#EFF6FF'; }}
            >
              <IcoLinkedIn /> LinkedIn
            </a>
          )}
        </div>

      </div>

      <AddToListModal
        open={addListOpen}
        onClose={() => { setAddListOpen(false); onRefreshLists?.(); }}
        items={[{ record_id: company.id, item_type: 'company' }]}
        itemType="company"
      />
    </div>
  );
}
