"use client";
import { useCallback, useRef, useState } from "react";
import { ListPlus, SearchX, SlidersHorizontal, X } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import FilterPanelShell from "./FilterPanelShell";
import CompanyFilterPanel from "./filters/CompanyFilterPanel";
import CompanyTable, { CompanyTableSkeleton } from "./CompanyTable";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import AddToListModal from "./AddToListModal";
import ColumnSettingsPanel from "./ColumnSettingsPanel";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { searchCompanies, agenticSearch } from "@/lib/searchApi";
import { useColumnSettings, COMPANY_COLUMNS } from "@/hooks/useColumnSettings";
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
  const isAgenticRef = useRef(false);
  const agenticPromptRef = useRef<string>("");
  const [noDataDialog, setNoDataDialog] = useState(false);

  const { visible: visibleColumns, toggle, reset, cols } = useColumnSettings("b2b:col:companies", COMPANY_COLUMNS);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);

  const runSearch = useCallback(async (page: number, scrollToken?: string) => {
    const cached = pageCacheRef.current.get(page);
    if (cached) {
      setResults(cached);
      setMeta(cached.meta ?? null);
      setCurrentPage(page);
      setSelected(new Set());
      return;
    }
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await searchCompanies(filters, scrollToken, PAGE_SIZE);
      setResults(res);
      setMeta(res.meta ?? null);
      setHasSearched(true);
      setCurrentPage(page);
      pageCacheRef.current.set(page, res);
      if ((res.data?.length ?? 0) === 0) setNoDataDialog(true);
      setTokenHistory((prev) => {
        const next = prev.slice(0, page - 1);
        if (res.meta?.scroll_token) next.push(res.meta.scroll_token);
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
    isAgenticRef.current = false;
    agenticPromptRef.current = "";
    setResults(null);
    setMeta(null);
    setHasSearched(false);
    setSelected(new Set());
    setCurrentPage(1);
    setTokenHistory([]);
  };

  const startSearch = useCallback(() => {
    pageCacheRef.current = new Map();
    isAgenticRef.current = false;
    agenticPromptRef.current = "";
    setTokenHistory([]);
    setCurrentPage(1);
    runSearch(1, undefined);
  }, [runSearch, filters]);

  const runAgenticPage = useCallback(async (page: number, scrollToken?: string) => {
    const cached = pageCacheRef.current.get(page);
    if (cached) {
      setResults(cached);
      setMeta(cached.meta ?? null);
      setCurrentPage(page);
      setSelected(new Set());
      return;
    }
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await agenticSearch(agenticPromptRef.current, "company", scrollToken, PAGE_SIZE);
      setResults(res);
      setMeta(res.meta ?? null);
      setCurrentPage(page);
      pageCacheRef.current.set(page, res);
      setTokenHistory((prev) => {
        const next = prev.slice(0, page - 1);
        if (res.meta?.scroll_token) next.push(res.meta.scroll_token);
        return next;
      });
    } catch (e: unknown) {
      toast.apiError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAgenticQuery = useCallback(async (prompt: string) => {
    pageCacheRef.current = new Map();
    isAgenticRef.current = true;
    agenticPromptRef.current = prompt;
    setTokenHistory([]);
    setCurrentPage(1);
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await agenticSearch(prompt, "company", undefined, PAGE_SIZE);
      setResults(res);
      setMeta(res.meta ?? null);
      setHasSearched(true);
      setCurrentPage(1);
      pageCacheRef.current.set(1, res);
      if ((res.data?.length ?? 0) === 0) setNoDataDialog(true);
      setTokenHistory(res.meta?.scroll_token ? [res.meta.scroll_token] : []);
    } catch (e: unknown) {
      toast.apiError(e);
    } finally {
      setLoading(false);
    }
  }, []);

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
    setSelected(all ? new Set((results.data ?? []).map((r) => r.id)) : new Set());
  };

  const openListModal = (companies: CompanyResult[]) => {
    setListModalItems(
      companies.map((c) => ({ record_id: c.id, item_type: "company" as const, data: c as unknown as Record<string, unknown> }))
    );
  };

  const totalCount = meta?.total ?? 0;
  const totalLabel = hasSearched ? totalCount.toLocaleString() : "0";
  const showTable = hasSearched && !loading && results && (results.data?.length ?? 0) > 0;
  const showEmpty = !hasSearched || (!loading && (results?.data?.length ?? 0) === 0);

  const selectedCompanies = results
    ? ((results.data ?? []) as CompanyResult[]).filter((r) => selected.has(r.id))
    : [];

  return (
    <>
      <AppHeader title="Company search" />
      <div className="flex min-w-0 flex-1 gap-2 overflow-hidden px-2 py-2 sm:px-3">
        <FilterPanelShell onReset={handleReset} onApply={startSearch} open={filtersOpen} onClose={() => setFiltersOpen(false)}>
          <CompanyFilterPanel
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          />
        </FilterPanelShell>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xs font-semibold text-gray-900 sm:text-sm">All companies</span>
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
                  disabled={selected.size === 0}
                  onClick={() => openListModal(selectedCompanies)}
                  className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  Add to list
                </button>
              </div>
            </div>

            {loading && !showEmpty && (
              <div className="flex-1 overflow-y-auto">
                <CompanyTableSkeleton rows={8} visibleColumns={visibleColumns} />
              </div>
            )}

            {showEmpty && <EmptyState onQuery={handleAgenticQuery} loading={loading} />}

            {!loading && showTable && (
              <div className="relative flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <CompanyTable
                    data={(results!.data ?? []) as CompanyResult[]}
                    selected={selected}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                    visibleColumns={visibleColumns}
                    onOpenColumnSettings={() => setColumnSettingsOpen(true)}
                  />
                </div>
                {meta && (
                  <div className="shrink-0 border-t border-gray-100">
                    <Pagination
                      page={currentPage}
                      total={meta.total}
                      pageSize={PAGE_SIZE}
                      count={results!.data?.length ?? 0}
                      totalPages={meta.total_pages}
                      hasNext={!!meta.scroll_token}
                      onPage={(p) => {
                        if (p === currentPage) return;
                        const token = p === 1 ? undefined : tokenHistory[p - 2];
                        if (isAgenticRef.current) {
                          runAgenticPage(p, token);
                        } else {
                          runSearch(p, token);
                        }
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
                    <button
                      type="button"
                      onClick={() => openListModal(selectedCompanies)}
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

      <ColumnSettingsPanel
        open={columnSettingsOpen}
        onClose={() => setColumnSettingsOpen(false)}
        cols={cols}
        visible={visibleColumns}
        onToggle={toggle}
        onReset={reset}
      />

      <AddToListModal
        open={listModalItems.length > 0}
        onClose={() => setListModalItems([])}
        items={listModalItems}
        itemType="company"
      />

      <ConfirmDialog
        open={noDataDialog}
        title="No results found"
        message="No data available for your current search. Try adjusting your filters or search criteria."
        icon={<SearchX className="h-4 w-4 text-gray-400" />}
        confirmLabel="OK"
        onClose={() => setNoDataDialog(false)}
      />
    </>
  );
}
