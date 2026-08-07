import React, { useEffect, useRef, useState, useCallback } from 'react';
import { listsApi } from '../api/lists';
import { CreateListModal } from './CreateListModal';
import type { LeadsList } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  items: { record_id: string; item_type: 'person' | 'company' }[];
  itemType: 'person' | 'company';
}

type RowStatus = 'idle' | 'adding' | 'added' | 'already' | 'error';

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IcoX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const IcoPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v16m8-8H4" />
  </svg>
);
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IcoAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
  </svg>
);
const IcoList = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IcoBuilding = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="1.5" /><path d="M9 22v-4h6v4M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01" />
  </svg>
);
const IcoSpinner = ({ color = '#fff' }: { color?: string }) => (
  <span style={{
    display: 'inline-block', width: 13, height: 13,
    border: `2px solid ${color === '#fff' ? 'rgba(255,255,255,0.35)' : 'rgba(59,130,246,0.25)'}`,
    borderTopColor: color, borderRadius: '50%',
    animation: 'lb-spin 0.65s linear infinite',
  }} />
);

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = 60_000, hr = 3_600_000, day = 86_400_000;
  if (diffMs < min) return 'Just now';
  if (diffMs < hr) return `${Math.floor(diffMs / min)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hr)}h ago`;
  if (diffMs < day * 2) return 'Yesterday';
  if (diffMs < day * 7) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function AddToListModal({ open, onClose, items, itemType }: Props) {
  const [lists, setLists] = useState<LeadsList[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visible, setVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [closeHover, setCloseHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const [footerHover, setFooterHover] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const listType: 'people' | 'companies' = itemType === 'person' ? 'people' : 'companies';
  const itemLabel = `${items.length} ${itemType === 'person' ? (items.length === 1 ? 'person' : 'people') : (items.length === 1 ? 'company' : 'companies')}`;

  const fetchLists = useCallback(() => {
    setLoading(true);
    listsApi
      .getLists()
      .then(setLists)
      .catch(() => setErrorMsg('Could not load your lists. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) {
      fetchedRef.current = false;
      setQuery('');
      setDebouncedQuery('');
      setSelectedId(null);
      setRowStatus({});
      setErrorMsg('');
      setSuccessMsg('');
      setShowCreateDialog(false);
      setVisible(false);
      return;
    }
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchLists();
    }
    const t = requestAnimationFrame(() => setVisible(true));
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => { cancelAnimationFrame(t); clearTimeout(focusTimer); };
  }, [open, fetchLists]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 160);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  if (!open) return null;

  const userLists = lists.filter((l) => !l.is_default && l.list_type === listType);
  const filtered = userLists.filter((l) => l.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
  const showQuickCreate =
    debouncedQuery.length > 0 &&
    !userLists.some((l) => l.name.toLowerCase() === debouncedQuery.toLowerCase());

  async function handleAdd(listId?: string, listName?: string) {
    const key = listId ?? '__new__';
    if (rowStatus[key] === 'adding' || rowStatus[key] === 'added' || rowStatus[key] === 'already') return;
    setSelectedId(listId ?? null);
    setErrorMsg('');
    setRowStatus((s) => ({ ...s, [key]: 'adding' }));
    try {
      const res = await listsApi.addToList({
        list_id: listId,
        list_name: listName,
        list_type: listType,
        items,
      });
      const wasAdded = res.added > 0;
      setRowStatus((s) => ({ ...s, [key]: wasAdded ? 'added' : 'already' }));
      if (wasAdded) {
        setSuccessMsg(`${itemLabel} added to "${res.list_name}"`);
        if (!listId) fetchLists();
        setTimeout(handleClose, 900);
      }
    } catch {
      setRowStatus((s) => ({ ...s, [key]: 'error' }));
      setErrorMsg('Failed to add. Please try again.');
    }
  }

  const Icon = itemType === 'person' ? IcoList : IcoBuilding;
  const selectedStatus = selectedId ? rowStatus[selectedId] ?? 'idle' : 'idle';
  const footerEnabled = !!selectedId && selectedStatus === 'idle';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="atl-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: `rgba(10,20,40,${visible ? 0.55 : 0})`,
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background 0.2s ease, backdrop-filter 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 380, maxHeight: 560,
          display: 'flex', flexDirection: 'column',
          background: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(10px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.2s cubic-bezier(0.34,1.3,0.64,1), opacity 0.18s ease',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 id="atl-modal-title" style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.25 }}>
                Add {itemType === 'person' ? 'People' : 'Company'} to List
              </h2>
              <p style={{ fontSize: 11.5, color: '#94A3B8', margin: '3px 0 0', lineHeight: 1.4 }}>
                Choose an existing list or create a new one.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            style={{
              width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: closeHover ? '#F1F5F9' : 'transparent',
              color: closeHover ? '#374151' : '#94A3B8',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <IcoX />
          </button>
        </div>

        {/* ── Search + Create ────────────────────────────────────── */}
        <div style={{ padding: '16px 20px 12px', flexShrink: 0 }}>
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
            height: 42, padding: '0 12px', borderRadius: 12,
            border: `1.5px solid ${searchFocused ? '#3B82F6' : '#E2E8F0'}`,
            background: searchFocused ? '#FFFFFF' : '#F8FAFC',
            boxShadow: searchFocused ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          }}>
            <span style={{ color: searchFocused ? '#3B82F6' : '#94A3B8', display: 'flex', flexShrink: 0 }}><IcoSearch /></span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search or create a list..."
              style={{
                flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 13, color: '#0F172A',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && showQuickCreate) handleAdd(undefined, debouncedQuery);
              }}
            />
            {query.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: '50%', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#E2E8F0', color: '#64748B', cursor: 'pointer',
                }}
              >
                <IcoX />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            style={{
              marginTop: 10, width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderRadius: 10, border: '1.5px dashed #CBD5E1', background: 'transparent',
              color: '#3B82F6', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#93C5FD'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1'; }}
          >
            <IcoPlus /> Create New List
          </button>
        </div>

        {errorMsg && (
          <div style={{
            margin: '0 20px 10px', display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '9px 11px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', flexShrink: 0,
          }}>
            <span style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}><IcoAlert /></span>
            <p style={{ fontSize: 11.5, color: '#B91C1C', margin: 0, lineHeight: 1.4 }}>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div style={{
            margin: '0 20px 10px', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 11px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', flexShrink: 0,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%', background: '#22C55E', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><IcoCheck /></span>
            <p style={{ fontSize: 11.5, color: '#15803D', margin: 0, lineHeight: 1.4 }}>{successMsg}</p>
          </div>
        )}

        {/* ── List area ──────────────────────────────────────────── */}
        <p style={{
          margin: 0, padding: '2px 20px 6px', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94A3B8', flexShrink: 0,
        }}>
          Your Lists
        </p>

        <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px', minHeight: 120 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', flexShrink: 0, animation: 'lb-shimmer 1.4s ease infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#F1F5F9 0%,#E8EEF4 50%,#F1F5F9 100%)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: '55%', height: 11, borderRadius: 4, background: '#F1F5F9', animation: 'lb-shimmer 1.4s ease infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#F1F5F9 0%,#E8EEF4 50%,#F1F5F9 100%)' }} />
                    <div style={{ width: '35%', height: 9, borderRadius: 4, background: '#F1F5F9', animation: 'lb-shimmer 1.4s ease infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#F1F5F9 0%,#E8EEF4 50%,#F1F5F9 100%)' }} />
                  </div>
                  <div style={{ width: 56, height: 28, borderRadius: 20, background: '#F1F5F9', flexShrink: 0, animation: 'lb-shimmer 1.4s ease infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#F1F5F9 0%,#E8EEF4 50%,#F1F5F9 100%)' }} />
                </div>
              ))}
            </div>
          )}

          {!loading && showQuickCreate && (
            <ListRow
              key="__new__"
              icon={<IcoPlus />}
              iconBg="#3B82F6"
              name={`Create "${debouncedQuery}"`}
              meta="New list"
              status={rowStatus.__new__ ?? 'idle'}
              selected={false}
              onSelect={() => handleAdd(undefined, debouncedQuery)}
              onAdd={() => handleAdd(undefined, debouncedQuery)}
              addLabel="Create"
            />
          )}

          {!loading && filtered.map((list) => (
            <ListRow
              key={list.id}
              icon={<Icon />}
              iconBg="linear-gradient(135deg,#EFF6FF,#DBEAFE)"
              name={list.name}
              badge={list.is_default ? 'Default' : undefined}
              meta={`${(list.record_count ?? 0).toLocaleString()} record${(list.record_count ?? 0) !== 1 ? 's' : ''}${list.updated_at ? ` · Updated ${timeAgo(list.updated_at)}` : ''}`}
              status={rowStatus[list.id] ?? 'idle'}
              selected={selectedId === list.id}
              onSelect={() => setSelectedId(list.id)}
              onAdd={() => handleAdd(list.id)}
              addLabel="Add"
            />
          ))}

          {!loading && !showQuickCreate && filtered.length === 0 && (
            <div style={{ padding: '28px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 12.5, color: '#94A3B8', margin: 0 }}>
                {userLists.length === 0 ? 'No lists yet — search above to create one' : 'No matching lists found.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid #F1F5F9', flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            style={{
              flex: 1, height: 42, borderRadius: 12,
              border: `1.5px solid ${cancelHover ? '#CBD5E1' : '#E2E8F0'}`,
              background: cancelHover ? '#F8FAFC' : '#FFFFFF',
              color: '#4B5563', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!footerEnabled}
            onClick={() => selectedId && handleAdd(selectedId)}
            onMouseEnter={() => setFooterHover(true)}
            onMouseLeave={() => setFooterHover(false)}
            style={{
              flex: 1.4, height: 42, borderRadius: 12, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: footerEnabled
                ? (footerHover ? 'linear-gradient(135deg, #15345C 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #1A3D5C 0%, #2563EB 100%)')
                : '#CBD5E1',
              color: '#FFFFFF', fontSize: 13, fontWeight: 600,
              cursor: footerEnabled ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {selectedStatus === 'adding' ? <IcoSpinner /> : selectedStatus === 'added' ? <><IcoCheck /> Added</> : 'Add to List'}
          </button>
        </div>
      </div>

      {showCreateDialog && (
        <CreateListModal
          listType={listType}
          onClose={() => setShowCreateDialog(false)}
          onCreated={() => {
            setShowCreateDialog(false);
            fetchLists();
          }}
        />
      )}
    </div>
  );
}

/* ─── List row card ──────────────────────────────────────────────────────── */
function ListRow({
  icon, iconBg, name, meta, badge, status, selected, onSelect, onAdd, addLabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  meta: string;
  badge?: string;
  status: RowStatus;
  selected: boolean;
  onSelect: () => void;
  onAdd: () => void;
  addLabel: string;
}) {
  const [hovered, setHovered] = useState(false);
  const done = status === 'added' || status === 'already';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 12,
        cursor: 'pointer', outline: 'none',
        background: selected ? '#EFF6FF' : hovered ? '#F8FAFC' : 'transparent',
        border: `1.5px solid ${selected ? '#93C5FD' : 'transparent'}`,
        transition: 'background 0.12s, border-color 0.12s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: iconBg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 12.5, fontWeight: 600, color: '#0F172A',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </span>
          {badge && (
            <span style={{
              fontSize: 9.5, fontWeight: 700, color: '#1D4ED8', background: '#DBEAFE',
              padding: '1.5px 6px', borderRadius: 20, flexShrink: 0, letterSpacing: '0.02em',
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10.5, color: '#94A3B8' }}>{meta}</span>
      </div>

      <button
        type="button"
        disabled={status === 'adding' || done}
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        style={{
          flexShrink: 0, minWidth: 64, height: 28, padding: '0 12px', borderRadius: 20, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          fontSize: 11.5, fontWeight: 600,
          cursor: status === 'adding' || done ? 'default' : 'pointer',
          color: status === 'already' ? '#0F172A' : '#fff',
          background:
            status === 'added' ? '#22C55E' :
            status === 'already' ? '#E2E8F0' :
            status === 'error' ? '#EF4444' :
            'linear-gradient(135deg, #1A3D5C 0%, #2563EB 100%)',
          transition: 'background 0.15s, transform 0.1s',
        }}
      >
        {status === 'adding' && <IcoSpinner />}
        {status === 'added' && <><IcoCheck /> Added</>}
        {status === 'already' && <><IcoCheck /> Added</>}
        {status === 'error' && 'Retry'}
        {status === 'idle' && addLabel}
      </button>
    </div>
  );
}
