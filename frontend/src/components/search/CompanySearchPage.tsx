"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { ListPlus, SlidersHorizontal, X } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import FilterPanelShell from "./FilterPanelShell";
import CompanyFilterPanel from "./filters/CompanyFilterPanel";
import CompanyTable from "./CompanyTable";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import ActiveFilterChips from "./ActiveFilterChips";
import AddToListModal from "./AddToListModal";
import { searchCompanies } from "@/lib/searchApi";
import { buildCompanyChips } from "@/lib/filterChips";
import { toast } from "@/lib/toast";
import type { ListItemPayload } from "@/lib/listsApi";
import {
  DEFAULT_COMPANY_FILTERS,
  type CompanyFilters,
  type CompanyResult,
  type SearchMeta,
  type SearchResponse,
} from "@/types/search";

const PAGE_SIZE = 10;

export default function CompanySearchPage() {
  const [filters, setFilters] = useState<CompanyFilters>(DEFAULT_COMPANY_FILTERS);
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
      const res = await searchCompanies(filters, scrollToken);
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
  }, [filters]);

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

  const handleReset = () => {
    setFilters(DEFAULT_COMPANY_FILTERS);
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

  const openListModal = (companies: CompanyResult[]) => {
    setListModalItems(
      companies.map((c) => ({ pdl_id: c.id, item_type: "company" as const, data: c as unknown as Record<string, unknown> }))
    );
  };

  const totalCount = meta?.total ?? 0;
  const totalLabel = hasSearched ? totalCount.toLocaleString() : "0";
  const showTable = hasSearched && !loading && results && results.data.length > 0;
  const showEmpty = !hasSearched || (!loading && results?.data.length === 0);

  const removeFilter = useCallback((patch: Partial<CompanyFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const chips = useMemo(
    () => buildCompanyChips(filters, removeFilter),
    [filters, removeFilter]
  );

  const selectedCompanies = results
    ? (results.data as CompanyResult[]).filter((r) => selected.has(r.id))
    : [];

  return (
    <>
      <AppHeader title="Company search" />
      <div className="flex flex-1 gap-2 overflow-hidden px-3 py-2">
        <FilterPanelShell onReset={handleReset} onApply={startSearch} open={filtersOpen} onClose={() => setFiltersOpen(false)}>
          <CompanyFilterPanel
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          />
        </FilterPanelShell>

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">All companies</span>
                {hasSearched && totalCount > 0 ? (
                  <span className="text-sm font-semibold text-red-600">{totalLabel}</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{totalLabel}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCompanies.length > 0) openListModal(selectedCompanies);
                    else if (results) openListModal(results.data as CompanyResult[]);
                  }}
                  className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  Add to list
                </button>
              </div>
            </div>
            <ActiveFilterChips chips={chips} />

            {loading && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />
                  <p className="text-xs text-gray-400">Searching…</p>
                </div>
              </div>
            )}

            {!loading && showEmpty && <EmptyState onQuery={startSearch} />}

            {!loading && showTable && (
              <div className="relative flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <CompanyTable
                    data={results!.data as CompanyResult[]}
                    selected={selected}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                    onAddToList={(company) => openListModal([company])}
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
                  <div className="absolute bottom-14 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 shadow-2xl">
                    <span className="whitespace-nowrap text-xs font-semibold text-white">
                      {selected.size} selected
                    </span>
                    <div className="mx-1 h-4 w-px bg-gray-600" />
                    <button
                      type="button"
                      onClick={() => openListModal(selectedCompanies)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700"
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
        itemType="company"
      />
    </>
  );
}
