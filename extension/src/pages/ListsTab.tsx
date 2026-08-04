import React, { useState, useEffect, useCallback } from 'react';
import type { LeadsList, ListItem, PersonResult } from '../types';
import { listsApi } from '../api/lists';
import { ListCard } from '../components/ListCard';
import { CreateListModal } from '../components/CreateListModal';
import { Avatar } from '../components/ui/Avatar';
import { searchApi } from '../api/search';

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
  chevronDown: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
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

/* ─── Lead item card ─────────────────────────────────────────────────────── */
function LeadItemCard({ item, onRemove }: { item: ListItem; onRemove: () => void }) {
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (item.item_type !== 'person') return null;
  const person = item.data as PersonResult;

  const name = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown';
  const title = person.active_experience_title || person.headline || '';
  const company = person.active_experience_company_name || '';
  const location = [person.location_city, person.location_country].filter(Boolean).join(', ');

  const handleReveal = async () => {
    if (revealedEmail || revealing) return;
    setRevealing(true);
    try {
      const r = await searchApi.revealWorkEmail(person.id);
      setRevealedEmail(r.email);
    } catch { /* ignore */ }
    finally { setRevealing(false); }
  };

  const handleCopy = async () => {
    if (!revealedEmail) return;
    await navigator.clipboard.writeText(revealedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid #F1F5F9',
        padding: '12px 16px',
        background: hovered ? '#F8FAFD' : '#fff',
        transition: 'background 0.12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Avatar src={person.picture_url} name={name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
              {person.linkedin_url && (
                <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '4px', color: '#3B82F6', display: 'flex' }}>
                  {Ico.linkedin}
                </a>
              )}
              <button onClick={onRemove}
                style={{ padding: '4px', color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1'; }}>
                {Ico.trash}
              </button>
            </div>
          </div>
          {(title || company) && (
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}{company ? ` · ${company}` : ''}
            </p>
          )}
          {location && (
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '1px 0 0' }}>{location}</p>
          )}

          {/* Email reveal */}
          <div style={{ marginTop: '8px' }}>
            {revealedEmail ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: '8px', padding: '5px 8px',
              }}>
                <span style={{ fontSize: '11px', color: '#15803D', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {revealedEmail}
                </span>
                <button onClick={handleCopy}
                  style={{ color: copied ? '#16A34A' : '#4ADE80', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                  {copied ? Ico.check : Ico.copy}
                </button>
              </div>
            ) : (
              <button onClick={handleReveal} disabled={revealing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '8px',
                  fontSize: '11.5px', fontWeight: 500,
                  border: '1px solid #E2E8F0',
                  color: '#374151', background: '#fff', cursor: 'pointer',
                  transition: 'all 0.12s', opacity: revealing ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A3D5C';
                  (e.currentTarget as HTMLButtonElement).style.color = '#1A3D5C';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                  (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                }}
              >
                {revealing
                  ? <span style={{ width: '11px', height: '11px', border: '2px solid #CBD5E1', borderTopColor: '#1A3D5C', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  : Ico.email
                }
                {revealing ? 'Loading…' : 'Get email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
  const filtered = lists.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalLeads = lists.reduce((sum, l) => sum + (l.record_count ?? 0), 0);
  const defaultCount = lists.filter((l) => l.is_default).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Top toolbar ──────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 0', flexShrink: 0 }}>

        {/* Search + Create row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          {/* Search input */}
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
                borderRadius: '10px',
                outline: 'none',
                boxShadow: searchFocused ? '0 0 0 3px rgba(26,61,92,0.08)' : 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Create list CTA */}
          <button
            onClick={onCreateClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '0 12px', height: '38px', flexShrink: 0,
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1A3D5C 0%, #2563AB 100%)',
              color: '#fff', fontSize: '12.5px', fontWeight: 600,
              boxShadow: '0 2px 8px rgba(26,61,92,0.25)',
              transition: 'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {Ico.plus}
            Create List
          </button>
        </div>

        {/* Filter dropdowns row */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {['Created by me', 'People & Companies'].map((label) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '0 10px', height: '32px',
              border: '1px solid #E2E8F0', borderRadius: '8px',
              background: '#FFFFFF', cursor: 'default',
              fontSize: '11.5px', color: '#374151', flexShrink: 0,
              userSelect: 'none',
            }}>
              {label}
              <span style={{ color: '#94A3B8' }}>{Ico.chevronDown}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats summary strip ───────────────────────────────────────── */}
      {!loading && lists.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '8px 16px',
          background: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          borderBottom: '1px solid #F1F5F9',
          flexShrink: 0,
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

      {/* ── Column header ─────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '6px 16px',
          borderBottom: '1px solid #F1F5F9',
          flexShrink: 0,
        }}>
          <span style={{ flex: 1, fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            List Name
          </span>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Records
          </span>
        </div>
      )}

      {/* ── List items ────────────────────────────────────────────────── */}
      <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
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
          filtered.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onClick={() => onOpen(list)}
              onDelete={!list.is_default ? () => onDelete(list) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── List detail ────────────────────────────────────────────────────────── */
function ListDetail({ list, onBack }: { list: LeadsList; onBack: () => void }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await listsApi.getListItems(list.id, p, 20);
      setItems(res.items ?? []);
      setTotalPages(Math.ceil(res.total / res.page_size) || 1);
      setPage(p);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [list.id]);

  useEffect(() => { fetchItems(1); }, [fetchItems]);

  const handleRemoveItem = async (item: ListItem) => {
    try {
      await listsApi.removeItem(list.id, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch { /* ignore */ }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    if (item.item_type !== 'person') return false;
    const person = item.data as PersonResult;
    const name = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
    return name.toLowerCase().includes(search.toLowerCase()) ||
      (person.active_experience_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (person.active_experience_company_name || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Detail header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #F1F5F9',
        background: '#fff',
        flexShrink: 0,
      }}>
        {/* Back + title row */}
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
            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '1px 0 0' }}>
              {list.record_count ?? items.length} {(list.record_count ?? items.length) === 1 ? 'record' : 'records'}
            </p>
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

        {/* Search in list */}
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
            placeholder="Search by name, title or company…"
            style={{
              width: '100%', height: '36px',
              paddingLeft: '32px', paddingRight: '10px',
              fontSize: '12.5px', color: '#0F172A',
              background: '#F8FAFC',
              border: `1.5px solid ${searchFocused ? '#1A3D5C' : '#E8ECF0'}`,
              borderRadius: '9px', outline: 'none',
              boxShadow: searchFocused ? '0 0 0 3px rgba(26,61,92,0.08)' : 'none',
              transition: 'all 0.15s',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '48%', marginBottom: '7px' }} />
                  <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '6px', width: '65%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
          filtered.map((item) => (
            <LeadItemCard
              key={item.id}
              item={item}
              onRemove={() => handleRemoveItem(item)}
            />
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 16px', borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={() => fetchItems(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                border: '1px solid #E2E8F0', borderRadius: '8px',
                color: '#374151', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.4 : 1, transition: 'all 0.12s',
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{page} / {totalPages}</span>
            <button
              onClick={() => fetchItems(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                border: '1px solid #E2E8F0', borderRadius: '8px',
                color: '#374151', background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.4 : 1, transition: 'all 0.12s',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
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

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listsApi.getLists();
      setLists(data);
    } catch {
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

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
