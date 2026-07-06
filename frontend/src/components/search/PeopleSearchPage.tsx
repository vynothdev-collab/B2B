"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { Eye, ListPlus, SlidersHorizontal, X } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import FilterPanelShell from "./FilterPanelShell";
import PeopleFilterPanel from "./filters/PeopleFilterPanel";
import PeopleTable, { PeopleTableSkeleton } from "./PeopleTable";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import ActiveFilterChips from "./ActiveFilterChips";
import AddToListModal from "./AddToListModal";
import { searchPersons, agenticSearch } from "@/lib/searchApi";
import type { PersonExclusions } from "@/lib/searchApi";
import { buildPersonChips } from "@/lib/filterChips";
import { toast } from "@/lib/toast";
import { getLists, getListItems } from "@/lib/listsApi";
import type { ListItemPayload } from "@/lib/listsApi";
import {
  DEFAULT_PERSON_FILTERS,
  type PersonFilters,
  type PersonResult,
  type SearchMeta,
  type SearchResponse,
} from "@/types/search";

const PAGE_SIZE = 10;

export default function PeopleSearchPage() {
  const [filters, setFilters] = useState<PersonFilters>(DEFAULT_PERSON_FILTERS);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [tokenHistory, setTokenHistory] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listModalItems, setListModalItems] = useState<ListItemPayload[]>([]);
  const pageCacheRef = useRef<Map<number, SearchResponse>>(new Map());

  const resolveExclusions = useCallback(async (): Promise<PersonExclusions> => {
    const { hideAllSavedPeople, hideSavedPeopleListIds, hideAllSavedCompanies, hideSavedCompanyListIds } = filters;
    if (!hideAllSavedPeople && !hideAllSavedCompanies) return {};

    const excludePersonIds: string[] = [];
    const excludeCompanyIds: string[] = [];

    if (hideAllSavedPeople || hideAllSavedCompanies) {
      const allLists = await getLists();
      const peopleLists = allLists.filter((l) => l.list_type === "people");

      // Determine which people lists to use
      const targetPeopleLists = hideSavedPeopleListIds.length
        ? peopleLists.filter((l) => hideSavedPeopleListIds.includes(l.id))
        : peopleLists;

      for (const lst of targetPeopleLists) {
        const items = await getListItems(lst.id);
        for (const item of items) {
          if (hideAllSavedPeople) excludePersonIds.push(item.record_id);
          if (hideAllSavedCompanies) {
            const companyId = (item.data as Record<string, unknown>)?.active_experience_company_id;
            if (companyId) excludeCompanyIds.push(String(companyId));
          }
        }
      }

      if (hideAllSavedCompanies && hideSavedCompanyListIds.length) {
        const companyLists = allLists.filter((l) => l.list_type === "companies" && hideSavedCompanyListIds.includes(l.id));
        for (const lst of companyLists) {
          const items = await getListItems(lst.id);
          for (const item of items) excludeCompanyIds.push(item.record_id);
        }
      }
    }

    return {
      excludePersonIds: [...new Set(excludePersonIds)],
      excludeCompanyIds: [...new Set(excludeCompanyIds)],
    };
  }, [filters]);

  const runSearch = useCallback(async (page: number, scrollToken?: string) => {
    const cached = pageCacheRef.current.get(page);
    if (cached) {
      setResults(cached);
      setMeta(cached.meta);
      setCurrentPage(page);
      setSelected(new Set());
      return;
    }
    setLoading(true);
    setSelected(new Set());
    try {
      const exclusions = await resolveExclusions();
      const res = await searchPersons(filters, scrollToken, exclusions);
      setResults(res);
      setMeta(res.meta);
      setHasSearched(true);
      setCurrentPage(page);
      pageCacheRef.current.set(page, res);
      setTokenHistory((prev) => {
        const next = prev.slice(0, page - 1);
        if (res.meta.scroll_token) next.push(res.meta.scroll_token);
        return next;
      });
    } catch (e: unknown) {
      toast.apiError(e);
    } finally {
      setLoading(false);
    }
  }, [filters, resolveExclusions]);

  const clearState = () => {
    pageCacheRef.current = new Map();
    setResults(null);
    setMeta(null);
    setHasSearched(false);
    setSelected(new Set());
    setCurrentPage(1);
    setTokenHistory([]);
  };

  const startSearch = useCallback(() => {
    pageCacheRef.current = new Map();
    setTokenHistory([]);
    setCurrentPage(1);
    runSearch(1, undefined);
  }, [runSearch, filters]);

  const handleAgenticQuery = useCallback(async (prompt: string) => {
    pageCacheRef.current = new Map();
    setTokenHistory([]);
    setCurrentPage(1);
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await agenticSearch(prompt, "employee", 20);
      setResults(res);
      setMeta(res.meta);
      setHasSearched(true);
      pageCacheRef.current.set(1, res);
    } catch (e: unknown) {
      toast.apiError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    setFilters(DEFAULT_PERSON_FILTERS);
    clearState();
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = (all: boolean) => {
    if (!results) return;
    setSelected(all ? new Set(results.data.map((r) => r.id)) : new Set());
  };

  const openListModal = (people: PersonResult[]) => {
    setListModalItems(
      people.map((p) => ({ record_id: p.id, item_type: "person" as const, data: p as unknown as Record<string, unknown> }))
    );
  };

  const totalCount = meta?.total ?? 0;
  const totalLabel = hasSearched ? totalCount.toLocaleString() : "0";
  const showTable = hasSearched && !loading && results && results.data.length > 0;
  const showEmpty = !hasSearched || (!loading && results?.data.length === 0);

  const removeFilter = useCallback((patch: Partial<PersonFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const chips = useMemo(
    () => buildPersonChips(filters, removeFilter),
    [filters, removeFilter]
  );

  const selectedPeople = results
    ? (results.data as PersonResult[]).filter((r) => selected.has(r.id))
    : [];

  return (
    <>
      <AppHeader title="People search" />
      <div className="flex min-w-0 flex-1 gap-2 overflow-hidden px-2 py-2 sm:px-3">
        <FilterPanelShell onReset={handleReset} onApply={startSearch} open={filtersOpen} onClose={() => setFiltersOpen(false)}>
          <PeopleFilterPanel
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          />
        </FilterPanelShell>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xs font-semibold text-gray-900 sm:text-sm">All people</span>
                {hasSearched && totalCount > 0 ? (
                  <span className="text-xs font-semibold text-red-600 sm:text-sm">{totalLabel}</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 sm:text-xs">{totalLabel}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-50 sm:px-3 sm:text-xs lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPeople.length > 0) openListModal(selectedPeople);
                    else if (results) openListModal(results.data as PersonResult[]);
                  }}
                  className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-500 sm:px-3 sm:text-xs"
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  Add to list
                </button>
              </div>
            </div>
            <ActiveFilterChips chips={chips} />

            {loading && !showEmpty && (
              <div className="flex-1 overflow-y-auto">
                <PeopleTableSkeleton rows={8} />
              </div>
            )}

            {showEmpty && <EmptyState onQuery={handleAgenticQuery} loading={loading} />}

            {!loading && showTable && (
              <div className="relative flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <PeopleTable
                    data={results!.data as PersonResult[]}
                    selected={selected}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                    onAddToList={(person) => openListModal([person])}
                  />
                </div>
                {meta && (
                  <div className="shrink-0 border-t border-gray-100">
                    <Pagination
                      page={currentPage}
                      total={meta.total}
                      pageSize={PAGE_SIZE}
                      maxReachable={tokenHistory.length + 1}
                      hasNext={!!meta.scroll_token}
                      onPage={(p) => {
                        if (p === currentPage) return;
                        const token = p === 1 ? undefined : tokenHistory[p - 2];
                        runSearch(p, token);
                      }}
                    />
                  </div>
                )}

                {selected.size > 0 && (
                  <div className="absolute bottom-14 left-2 right-2 z-30 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:flex-nowrap sm:px-4">
                    <span className="whitespace-nowrap text-[11px] font-semibold text-white sm:text-xs">
                      {selected.size} selected
                    </span>
                    <div className="mx-1 h-4 w-px bg-gray-600" />
                    <button type="button" className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-500 sm:px-3 sm:text-xs">
                      <Eye className="h-3 w-3" />
                      Reveal contacts
                    </button>
                    <button
                      type="button"
                      onClick={() => openListModal(selectedPeople)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-gray-700 sm:px-3 sm:text-xs"
                    >
                      <ListPlus className="h-3 w-3" />
                      Add to list
                    </button>
                    <button type="button" onClick={() => setSelected(new Set())} className="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <AddToListModal
        open={listModalItems.length > 0}
        onClose={() => setListModalItems([])}
        items={listModalItems}
        itemType="person"
      />
    </>
  );
}
