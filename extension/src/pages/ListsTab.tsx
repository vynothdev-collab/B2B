import React, { useState, useEffect, useCallback } from 'react';
import type { LeadsList, ListItem, PersonResult } from '../types';
import { listsApi } from '../api/lists';
import { ListCard } from '../components/ListCard';
import { CreateListModal } from '../components/CreateListModal';
import { Avatar } from '../components/ui/Avatar';
import { searchApi } from '../api/search';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonList() {
  return (
    <div className="space-y-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
          </div>
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
    } catch {
      // ignore
    } finally {
      setRevealing(false);
    }
  };

  const handleCopy = async () => {
    if (!revealedEmail) return;
    await navigator.clipboard.writeText(revealedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border-b border-gray-100 last:border-0 px-4 py-3 group">
      <div className="flex items-start gap-2.5">
        <Avatar src={person.picture_url} name={name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-gray-900 truncate">{name}</p>
            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {person.linkedin_url && (
                <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="p-1 text-blue-500 hover:text-blue-700">
                  <LinkedInIcon />
                </a>
              )}
              <button onClick={onRemove}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <TrashIcon />
              </button>
            </div>
          </div>
          {(title || company) && (
            <p className="text-[11.5px] text-gray-500 truncate">{title}{company ? ` · ${company}` : ''}</p>
          )}
          {location && <p className="text-[11px] text-gray-400">{location}</p>}

          {/* Email */}
          <div className="mt-2">
            {revealedEmail ? (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2 py-1">
                <span className="text-[11px] text-green-700 font-mono truncate flex-1">{revealedEmail}</span>
                <button onClick={handleCopy} className="text-green-500 hover:text-green-700 flex-shrink-0">
                  {copied ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <button onClick={handleReveal} disabled={revealing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-gray-200 text-gray-500 hover:border-[#1A3D5C] hover:text-[#1A3D5C] transition-colors disabled:opacity-50">
                {revealing ? (
                  <span className="w-3 h-3 border-2 border-gray-300 border-t-[#1A3D5C] rounded-full animate-spin" />
                ) : <EmailIcon />}
                {revealing ? 'Loading…' : 'Get email'}
              </button>
            )}
          </div>
        </div>
      </div>
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
  const filtered = lists.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-0 flex-shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for lists"
            className="w-full h-9 pl-8 pr-3 text-[13px] border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="px-3 pt-2.5 pb-2 flex-shrink-0">
        <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Filter by</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-[12px] text-gray-600 cursor-default select-none">
            Created by me
            <svg className="w-3 h-3 text-gray-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-[12px] text-gray-600 cursor-default select-none">
            People and co...
            <svg className="w-3 h-3 text-gray-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <button
            onClick={onCreateClick}
            className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-colors flex-shrink-0"
            style={{ background: '#E84010' }}
            title="New list"
          >
            <PlusIcon />
            New
          </button>
        </div>
      </div>

      {/* Column headers */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center px-4 py-1.5 border-y border-gray-100 bg-gray-50/80 flex-shrink-0">
          <span className="flex-1 text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">Name</span>
          <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">Records count</span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-700 mb-1">
              {searchQuery ? 'No lists match your search' : 'No lists yet'}
            </p>
            <p className="text-[12px] text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Create your first list to start saving leads'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateClick}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: '#E84010' }}
              >
                <PlusIcon />
                Create list
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <BackIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-bold text-gray-900 truncate">{list.name}</h2>
            <p className="text-[11px] text-gray-400">{list.record_count ?? items.length} people</p>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or title…"
            className="w-full h-9 pl-8 pr-3 text-[13px] border border-gray-200 rounded-xl bg-gray-50 placeholder:text-gray-300 focus:outline-none focus:border-[#1A3D5C] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-gray-700 mb-1">
              {search ? 'No matches found' : 'This list is empty'}
            </p>
            <p className="text-[12px] text-gray-400">
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
          <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
            <button
              onClick={() => fetchItems(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-[12px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            <span className="text-[12px] text-gray-400">{page} / {totalPages}</span>
            <button
              onClick={() => fetchItems(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-[12px] font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
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
        <ListDetail
          list={selectedList}
          onBack={() => setSelectedList(null)}
        />
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
