import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { LeadsList, ListItem, PersonResult, CompanyResult } from '../types';
import { listsApi } from '../api/lists';
import { ListCard } from '../components/ListCard';
import { CreateListModal } from '../components/CreateListModal';
import { Avatar } from '../components/ui/Avatar';
import { searchApi } from '../api/search';
import { PersonDetailPanel } from '../components/PersonDetailPanel';
import { CompanyDetailPanel } from '../components/CompanyDetailPanel';

/* ─── Inline SVG helpers ─────────────────────────────────────────────────── */
const Ico = {
  search: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16m8-8H4" />
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  ),
  email: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  ),
  linkedin: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  copy: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  ),
  check: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  listEmpty: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonList() {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '13px', background: '#F1F5F9', borderRadius: '6px', width: '55%', marginBottom: '7px' }} />
            <div style={{ height: '11px', background: '#F1F5F9', borderRadius: '6px', width: '30%' }} />
          </div>
          <div style={{ width: '55px', height: '11px', background: '#F1F5F9', borderRadius: '6px' }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Company logo / initials avatar ────────────────────────────────────── */
function CompanyAvatar({ src, name, website }: { src?: string; name: string; website?: string }) {
  const domain = website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || '';
  const sources = [
    src,
    domain ? `https://logo.clearbit.com/${domain}` : undefined,
  ].filter(Boolean) as string[];

  const [idx, setIdx] = useState(0);
  const initials = name.slice(0, 2).toUpperCase();
  const currentSrc = sources[idx];

  if (currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={name}
        onError={() => setIdx((i) => i + 1)}
        style={{
          width: '36px', height: '36px', borderRadius: '9px',
          objectFit: 'contain', border: '1px solid #E2E8F0',
          background: '#fff', flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
      background: 'linear-gradient(135deg, #1A3D5C, #2563EB)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
}

/* ─── Company item card ──────────────────────────────────────────────────── */
function CompanyItemCard({ item, onRemove, onViewDetails }: { item: ListItem; onRemove: () => void; onViewDetails: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const co = item.data as CompanyResult;

  const name = co.company_name || co.company_legal_name || 'Unknown Company';
  const location = [co.hq_city, co.hq_country].filter(Boolean).join(', ') || co.hq_location || '';
  const domain = co.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') || '';
  const empCount = co.employees_count ? (co.employees_count > 999 ? `${Math.round(co.employees_count / 1000)}k` : String(co.employees_count)) : co.size_range || '';

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onViewDetails}
      style={{
        borderBottom: '1px solid #F1F5F9', padding: '12px 16px',
        background: hovered ? '#F8FAFD' : '#fff', transition: 'background 0.12s', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <CompanyAvatar src={co.logo_url} name={name} website={co.website} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
              {co.canonical_linkedin_url && (
                <a href={co.canonical_linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                  style={{ padding: '4px', color: '#0A66C2', display: 'flex', opacity: hovered ? 1 : 0.35, transition: 'opacity 0.15s' }}>
                  {Ico.linkedin}
                </a>
              )}
              <button onClick={onRemove} title="Remove from list"
                style={{ padding: '4px', color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1'; }}>
                {Ico.trash}
              </button>
            </div>
          </div>

          {/* Industry */}
          {co.industry && (
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {co.industry}
            </p>
          )}

          {/* Location · employees · domain row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            {location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#94A3B8' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {location}
              </span>
            )}
            {empCount && (
              <>
                {location && <span style={{ color: '#E2E8F0', fontSize: '10px' }}>·</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#94A3B8' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  {empCount}
                </span>
              </>
            )}
            {domain && (
              <>
                {(location || empCount) && <span style={{ color: '#E2E8F0', fontSize: '10px' }}>·</span>}
                <span style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain}</span>
              </>
            )}
          </div>

          {/* Quick copy chips on hover */}
          {hovered && (co.website || co.canonical_linkedin_url) && (
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
              {co.website && (
                <button onClick={() => copyToClipboard(co.website!, 'website')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, border: '1px solid #E2E8F0', color: '#374151', background: '#fff', cursor: 'pointer', transition: 'all 0.12s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A3D5C'; (e.currentTarget as HTMLButtonElement).style.color = '#1A3D5C'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}>
                  {copiedField === 'website' ? Ico.check : Ico.copy}
                  {copiedField === 'website' ? 'Copied!' : 'Copy website'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Person item card ───────────────────────────────────────────────────── */
function PersonItemCard({ item, onRemove, onViewDetails }: { item: ListItem; onRemove: () => void; onViewDetails: () => void }) {
  const [unlockedEmail, setUnlockedEmail] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const person = item.data as PersonResult;
  const name = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown';
  const title = person.active_experience_title || person.headline || '';
  const company = person.active_experience_company_name || '';
  const department = person.active_experience_department || '';
  const location = [person.location_city, person.location_state, person.location_country].filter(Boolean).join(', ');

  const handleUnlock = async () => {
    if (unlockedEmail || unlocking) return;
    setUnlocking(true);
    try {
      const r = await searchApi.unlockWorkEmail(person.id);
      setUnlockedEmail(r.email);
    } catch { /* ignore */ }
    finally { setUnlocking(false); }
  };

  const handleCopy = async () => {
    if (!unlockedEmail) return;
    await navigator.clipboard.writeText(unlockedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onViewDetails}
      style={{
        borderBottom: '1px solid #F1F5F9', padding: '12px 16px',
        background: hovered ? '#F8FAFD' : '#fff', transition: 'background 0.12s', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Avatar src={person.picture_url} name={name} size="sm" />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
              {person.linkedin_url && (
                <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                  style={{ padding: '4px', color: '#0A66C2', display: 'flex', opacity: hovered ? 1 : 0.35, transition: 'opacity 0.15s' }}>
                  {Ico.linkedin}
                </a>
              )}
              <button onClick={onRemove} title="Remove from list"
                style={{ padding: '4px', color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1'; }}>
                {Ico.trash}
              </button>
            </div>
          </div>

          {/* Title */}
          {title && (
            <p style={{ fontSize: '11.5px', color: '#374151', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </p>
          )}

          {/* Company + department */}
          {(company || department) && (
            <p style={{ fontSize: '11.5px', color: '#2563EB', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {company}{department && company ? ` · ${department}` : department}
            </p>
          )}

          {/* Location */}
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{location}</p>
            </div>
          )}

          {/* Email row — always visible; click stops propagation */}
          <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '7px' }}>
            {unlockedEmail ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '7px', padding: '4px 8px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ fontSize: '11px', color: '#15803D', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {unlockedEmail}
                </span>
                <button onClick={handleCopy} style={{ color: copied ? '#16A34A' : '#86EFAC', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                  {copied ? Ico.check : Ico.copy}
                </button>
              </div>
            ) : (
              <button onClick={handleUnlock} disabled={unlocking}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 500,
                  border: '1px solid #E2E8F0', color: '#374151', background: '#fff',
                  cursor: unlocking ? 'default' : 'pointer', transition: 'all 0.12s', opacity: unlocking ? 0.7 : 1,
                }}
                onMouseEnter={(e) => { if (!unlocking) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A3D5C'; (e.currentTarget as HTMLButtonElement).style.color = '#1A3D5C'; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
              >
                {unlocking
                  ? <span style={{ width: '10px', height: '10px', border: '1.5px solid #CBD5E1', borderTopColor: '#1A3D5C', borderRadius: '50%', display: 'inline-block', animation: 'lb-spin 0.7s linear infinite' }} />
                  : Ico.email
                }
                {unlocking ? 'Loading…' : 'Get email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Unified item card dispatcher ──────────────────────────────────────── */
function LeadItemCard({ item, onRemove, onViewDetails }: { item: ListItem; onRemove: () => void; onViewDetails: () => void }) {
  if (item.item_type === 'company') return <CompanyItemCard item={item} onRemove={onRemove} onViewDetails={onViewDetails} />;
  return <PersonItemCard item={item} onRemove={onRemove} onViewDetails={onViewDetails} />;
}

/* ─── Stat pill ──────────────────────────────────────────────────────────── */
function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1A3D5C' }}>{value}</span>
      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{label}</span>
    </div>
  );
}

/* ─── Lists overview ─────────────────────────────────────────────────────── */
function ListsOverview({
  lists, loading, searchQuery, onSearchChange, onOpen, onDelete, onCreateClick,
}: {
  lists: LeadsList[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onOpen: (list: LeadsList) => void;
  onDelete: (list: LeadsList) => void;
  onCreateClick: () => void;
  onRefresh: () => void;
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [toolbarShadow, setToolbarShadow] = useState(false);
  const totalLeads = lists.reduce((sum, l) => sum + (l.record_count ?? 0), 0);
  const defaultCount = lists.filter((l) => l.is_default).length;

  /* Show toolbar shadow once user scrolls past it */
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const onScroll = () => setToolbarShadow(main.scrollTop > 4);
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* ── Sticky toolbar ────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff',
        boxShadow: toolbarShadow ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ padding: '12px 14px 0' }}>
          {/* Search + Create row */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{
                position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                color: searchFocused ? '#1A3D5C' : '#94A3B8', display: 'flex', pointerEvents: 'none',
                transition: 'color 0.15s',
              }}>
                {Ico.search}
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search your lists…"
                style={{
                  width: '100%', height: '38px',
                  paddingLeft: '33px', paddingRight: '12px',
                  fontSize: '13px', color: '#0F172A',
                  background: '#FFFFFF',
                  border: `1.5px solid ${searchFocused ? '#1A3D5C' : '#E2E8F0'}`,
                  borderRadius: '10px', outline: 'none',
                  boxShadow: searchFocused ? '0 0 0 3px rgba(26,61,92,0.08)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={onCreateClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0 12px', height: '38px', flexShrink: 0,
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1A3D5C 0%, #2563AB 100%)',
                color: '#fff', fontSize: '12.5px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(26,61,92,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {Ico.plus}
              Create List
            </button>
          </div>

        </div>

        {/* Stats strip */}
        {!loading && lists.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8px 16px',
            background: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <StatPill value={lists.length} label={lists.length === 1 ? 'list' : 'lists'} />
            <span style={{ width: '1px', height: '12px', background: '#E2E8F0' }} />
            <StatPill value={totalLeads.toLocaleString()} label="total records" />
            {defaultCount > 0 && (
              <>
                <span style={{ width: '1px', height: '12px', background: '#E2E8F0' }} />
                <StatPill value={defaultCount} label="default" />
              </>
            )}
          </div>
        )}

        {/* Column header */}
        {!loading && lists.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '6px 16px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <span style={{ flex: 1, fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              List Name
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Records
            </span>
          </div>
        )}
      </div>

      {/* ── List cards (natural flow, outer main scrolls) ─────────────── */}
      {loading ? (
        <SkeletonList />
      ) : lists.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px',
          }}>
            {Ico.listEmpty}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
            {searchQuery ? 'No matching lists' : 'No lists yet'}
          </p>
          <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.5 }}>
            {searchQuery
              ? 'Try a different search term or clear the filter.'
              : 'Create your first list to start organizing and saving leads.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1A3D5C, #2563AB)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(26,61,92,0.25)',
              }}
            >
              {Ico.plus}
              Create List
            </button>
          )}
        </div>
      ) : (
        lists.map((list: LeadsList) => (
          <ListCard
            key={list.id}
            list={list}
            onClick={() => onOpen(list)}
            onDelete={!list.is_default ? () => onDelete(list) : undefined}
          />
        ))
      )}
    </div>
  );
}

/* ─── List detail ────────────────────────────────────────────────────────── */
function ListDetail({ list, onBack }: { list: LeadsList; onBack: () => void }) {
  const [allItems, setAllItems] = useState<ListItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [detailItem, setDetailItem] = useState<ListItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);   /* prevents duplicate inflight requests */
  const genRef = useRef(0);        /* generation counter — discards stale responses */
  const searchRef = useRef('');    /* current search term, readable inside observer */

  /* Scroll main to top and attach shadow listener on mount */
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    const onScroll = () => setHeaderShadow((main?.scrollTop ?? 0) > 4);
    main?.addEventListener('scroll', onScroll, { passive: true });
    return () => main?.removeEventListener('scroll', onScroll);
  }, []);

  /* Fetch a page; p=1 resets, p>1 appends.  q is the search term. */
  const fetchPage = useCallback(async (p: number, q = '') => {
    const gen = ++genRef.current;
    if (p === 1) { setInitialLoading(true); setAllItems([]); }
    else setLoadingMore(true);
    try {
      const res = await listsApi.getListItems(list.id, p, 20, q || undefined);
      if (gen !== genRef.current) return; /* stale — newer request superseded this */
      const incoming = res.items ?? [];
      const pages = Math.ceil(res.total / res.page_size) || 1;
      setAllItems((prev) => p === 1 ? incoming : [...prev, ...incoming]);
      setPage(p);
      setTotalPages(pages);
      setTotal(res.total);
    } catch { /* ignore */ }
    finally {
      if (gen === genRef.current) {
        setInitialLoading(false);
        setLoadingMore(false);
      }
      busyRef.current = false;
    }
  }, [list.id]);

  /* Initial load */
  useEffect(() => { fetchPage(1, ''); }, [fetchPage]);

  /* Debounce search → reset and reload from page 1 */
  const isFirstDetailRender = useRef(true);
  useEffect(() => {
    if (isFirstDetailRender.current) { isFirstDetailRender.current = false; return; }
    const t = setTimeout(() => {
      searchRef.current = search;
      busyRef.current = false;
      fetchPage(1, search);
    }, 400);
    return () => clearTimeout(t);
  }, [search, fetchPage]);

  /* IntersectionObserver — triggers next page when sentinel enters viewport */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const root = document.querySelector('main');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !busyRef.current && page < totalPages) {
          busyRef.current = true;
          fetchPage(page + 1, searchRef.current);
        }
      },
      { root, threshold: 0.1, rootMargin: '80px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, fetchPage]);

  const handleRemoveItem = async (item: ListItem) => {
    try {
      await listsApi.removeItem(list.id, item.id);
      setAllItems((prev) => prev.filter((i) => i.id !== item.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch { /* ignore */ }
  };

  const recordLabel = total > 0 ? `${total.toLocaleString()} ${total === 1 ? 'record' : 'records'}` : (list.record_count != null ? `${list.record_count} ${list.record_count === 1 ? 'record' : 'records'}` : 'Loading…');

  return (
    <div>
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff',
        boxShadow: headerShadow ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
          {/* Back + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <button
              onClick={onBack}
              style={{
                width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: '#F1F5F9', color: '#64748B',
                flexShrink: 0, transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E2E8F0'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
            >
              {Ico.back}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {list.name}
              </h2>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '1px 0 0' }}>{recordLabel}</p>
            </div>

            {list.is_default && (
              <span style={{
                fontSize: '10px', fontWeight: 600, color: '#1D4ED8',
                background: '#DBEAFE', padding: '3px 8px',
                borderRadius: '20px', flexShrink: 0,
              }}>
                Default
              </span>
            )}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: searchFocused ? '#1A3D5C' : '#94A3B8', display: 'flex', pointerEvents: 'none',
              transition: 'color 0.15s',
            }}>
              {Ico.search}
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, company or domain…"
              style={{
                width: '100%', height: '36px',
                paddingLeft: '32px', paddingRight: '10px',
                fontSize: '12.5px', color: '#0F172A',
                background: '#F8FAFC',
                border: `1.5px solid ${searchFocused ? '#1A3D5C' : '#E8ECF0'}`,
                borderRadius: '9px', outline: 'none',
                boxShadow: searchFocused ? '0 0 0 3px rgba(26,61,92,0.08)' : 'none',
                transition: 'all 0.15s', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Items (natural flow) ───────────────────────────────────────── */}
      {initialLoading ? (
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#F1F5F9', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '48%', marginBottom: '7px' }} />
                <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '6px', width: '65%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
            {search ? 'No matches found' : 'This list is empty'}
          </p>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            {search ? 'Try a different search term' : 'Save leads from the Prospect tab to see them here'}
          </p>
        </div>
      ) : (
        allItems.map((item) => (
          <LeadItemCard
            key={item.id}
            item={item}
            onRemove={() => handleRemoveItem(item)}
            onViewDetails={() => setDetailItem(item)}
          />
        ))
      )}

      {/* ── Infinite scroll sentinel ───────────────────────────────────── */}
      {!initialLoading && (
        <div ref={sentinelRef} style={{ height: '1px' }} />
      )}

      {/* ── Loading more indicator ─────────────────────────────────────── */}
      {loadingMore && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '16px', color: '#94A3B8', fontSize: '12px',
        }}>
          <span style={{
            width: '14px', height: '14px',
            border: '2px solid #E2E8F0', borderTopColor: '#1A3D5C',
            borderRadius: '50%', display: 'inline-block',
            animation: 'lb-spin 0.65s linear infinite',
          }} />
          Loading more…
        </div>
      )}

      {/* ── End-of-list marker ────────────────────────────────────────── */}
      {!initialLoading && !loadingMore && page >= totalPages && allItems.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '14px',
          fontSize: '11.5px', color: '#CBD5E1',
          borderTop: '1px solid #F8FAFC',
        }}>
          Showing {allItems.length} of {total} records
        </div>
      )}

      {/* ── Detail panels (slide in from right, full-screen overlay) ── */}
      {detailItem && detailItem.item_type === 'person' && (
        <PersonDetailPanel
          item={detailItem}
          listName={list.name}
          onClose={() => setDetailItem(null)}
        />
      )}
      {detailItem && detailItem.item_type === 'company' && (
        <CompanyDetailPanel
          item={detailItem}
          listName={list.name}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function ListsTab() {
  const [lists, setLists] = useState<LeadsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedList, setSelectedList] = useState<LeadsList | null>(null);
  const isFirstListsRender = useRef(true);

  const fetchLists = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const data = await listsApi.getLists(q || undefined);
      setLists(data);
    } catch {
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load — immediate */
  useEffect(() => { fetchLists(''); }, [fetchLists]);

  /* Debounce subsequent search changes (skip first render) */
  useEffect(() => {
    if (isFirstListsRender.current) { isFirstListsRender.current = false; return; }
    const t = setTimeout(() => fetchLists(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery, fetchLists]);

  const handleDelete = async (list: LeadsList) => {
    if (!confirm(`Delete "${list.name}"?`)) return;
    try {
      await listsApi.deleteList(list.id);
      setLists((prev) => prev.filter((l) => l.id !== list.id));
      if (selectedList?.id === list.id) setSelectedList(null);
    } catch { /* ignore */ }
  };

  const handleCreated = () => {
    setShowCreate(false);
    fetchLists();
  };

  if (selectedList) {
    return (
      <>
        <ListDetail list={selectedList} onBack={() => setSelectedList(null)} />
        {showCreate && <CreateListModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      </>
    );
  }

  return (
    <>
      <ListsOverview
        lists={lists}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpen={(list) => setSelectedList(list)}
        onDelete={handleDelete}
        onCreateClick={() => setShowCreate(true)}
        onRefresh={fetchLists}
      />
      {showCreate && <CreateListModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </>
  );
}
