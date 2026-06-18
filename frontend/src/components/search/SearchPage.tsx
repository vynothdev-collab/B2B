"use client";
import { useState, useCallback } from "react";
import { Bell, ChevronDown, Eye, HelpCircle, ListPlus, Search, X, Zap } from "lucide-react";
import type { CompanyFilters, PersonFilters, SearchMeta, SearchResponse, TabType } from "@/types/search";
import { DEFAULT_COMPANY_FILTERS, DEFAULT_PERSON_FILTERS } from "@/types/search";
import { searchCompanies, searchPersons } from "@/lib/searchApi";
import FilterSidebar from "./FilterSidebar";
import PeopleTable from "./PeopleTable";
import CompanyTable from "./CompanyTable";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import ActiveFilters from "./ActiveFilters";
import type { PersonResult, CompanyResult } from "@/types/search";

const CREDITS = 258;
const PAGE_SIZE = 10;

export default function SearchPage() {
  const [tab, setTab] = useState<TabType>("people");
  const [personFilters, setPersonFilters] = useState<PersonFilters>(DEFAULT_PERSON_FILTERS);
  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>(DEFAULT_COMPANY_FILTERS);

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Cursor-based pagination state
  // tokenHistory[i] = scroll_token returned when on page i+1, used to fetch page i+2
  // tokenHistory[0] = token from page 1 → used to fetch page 2
  const [currentPage, setCurrentPage] = useState(1);
  const [tokenHistory, setTokenHistory] = useState<string[]>([]);

  const runSearch = useCallback(async (page: number, scrollToken?: string) => {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    try {
      const res =
        tab === "people"
          ? await searchPersons(personFilters, scrollToken)
          : await searchCompanies(companyFilters, scrollToken);

      setResults(res);
      setMeta(res.meta);
      setHasSearched(true);
      setCurrentPage(page);

      // Store the returned scroll_token so we can fetch page+1 later
      if (res.meta.scroll_token) {
        setTokenHistory((prev) => {
          const next = [...prev];
          next[page - 1] = res.meta.scroll_token!;
          return next;
        });
      }
    } catch (e: unknown) {
      const axiosDetail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      const msg = axiosDetail ?? (e instanceof Error ? e.message : "Search failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [tab, personFilters, companyFilters]);

  // Fresh search — always page 1, no token
  const startSearch = useCallback(() => {
    setTokenHistory([]);
    setCurrentPage(1);
    runSearch(1, undefined);
  }, [runSearch]);

  const handleTabChange = (t: TabType) => {
    setTab(t);
    setResults(null);
    setMeta(null);
    setHasSearched(false);
    setSelected(new Set());
    setCurrentPage(1);
    setTokenHistory([]);
  };

  const handleReset = () => {
    setPersonFilters(DEFAULT_PERSON_FILTERS);
    setCompanyFilters(DEFAULT_COMPANY_FILTERS);
    setResults(null);
    setMeta(null);
    setHasSearched(false);
    setSelected(new Set());
    setCurrentPage(1);
    setTokenHistory([]);
  };


  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (all: boolean) => {
    if (!results) return;
    setSelected(all ? new Set(results.data.map((r) => r.id)) : new Set());
  };

  const totalCount = meta?.total ?? 0;
  const totalLabel = hasSearched ? totalCount.toLocaleString() : "0";
  const showTable = hasSearched && !loading && results && results.data.length > 0;
  const showEmpty = !hasSearched || (!loading && results?.data.length === 0);

  return (
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">

      {/* ── Top nav ── */}
      <header className="flex h-16 shrink-0 items-center gap-3 bg-white border-b border-gray-200 px-5 shadow-sm">
        {/* Logo */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs shrink-0">
          B2B
        </div>

        {/* Search */}
        <div className="flex flex-1 max-w-[300px] items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="text-xs text-gray-400">Search people, companies...</span>
        </div>

        <div className="flex-1" />

        {/* Credits */}
        <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs font-bold text-gray-800">{CREDITS}</span>
          <span className="text-xs text-gray-500">credits</span>
        </div>

        {/* Upgrade */}
        <button type="button" className="flex items-center gap-1.5 rounded-full bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
          <Zap className="h-3 w-3" />
          Upgrade
        </button>

        {/* Help */}
        <button type="button" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
          <HelpCircle className="h-4.5 w-4.5" />
        </button>

        {/* Bell */}
        <button type="button" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
            SY
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-gray-800">Shyed</span>
            <span className="text-[10px] text-gray-400">Admin</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 flex-col overflow-hidden">



        {/* Content row: filter card + results */}
        <div className="flex flex-1 gap-4 overflow-hidden px-5 py-4">

          {/* Filter card */}
          <FilterSidebar
            tab={tab}
            onTabChange={handleTabChange}
            personFilters={personFilters}
            companyFilters={companyFilters}
            onPersonChange={(patch) => setPersonFilters((f) => ({ ...f, ...patch }))}
            onCompanyChange={(patch) => setCompanyFilters((f) => ({ ...f, ...patch }))}
            onApply={startSearch}
            onReset={handleReset}
          />

          {/* Results card */}
          <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              {/* Results header — always visible */}
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {tab === "people" ? "All people" : "All companies"}
                  </span>
                  {hasSearched && totalCount > 0 ? (
                    <span className="text-sm font-semibold text-purple-600">{totalLabel}</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{totalLabel}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <span className="text-gray-400">↑↓</span> Sort
                  </button>
                  <button type="button" className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-400 hover:bg-gray-50 transition-colors">
                    <Search className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
                    <ListPlus className="h-3.5 w-3.5" />
                    + Add to list
                  </button>
                </div>
              </div>

              {/* Active filter chips — single scrollable row */}
              <ActiveFilters
                tab={tab}
                personFilters={personFilters}
                companyFilters={companyFilters}
                onPersonChange={(patch) => setPersonFilters((f) => ({ ...f, ...patch }))}
                onCompanyChange={(patch) => setCompanyFilters((f) => ({ ...f, ...patch }))}
              />

              {/* Error */}
              {error && (
                <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
                    <p className="text-xs text-gray-400">Searching…</p>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && showEmpty && (
                <EmptyState onQuery={startSearch} />
              )}

              {/* Table + pagination */}
              {!loading && showTable && (
                <div className="relative flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    {tab === "people" ? (
                      <PeopleTable
                        data={results!.data as PersonResult[]}
                        selected={selected}
                        onSelect={toggleSelect}
                        onSelectAll={toggleSelectAll}
                      />
                    ) : (
                      <CompanyTable
                        data={results!.data as CompanyResult[]}
                        selected={selected}
                        onSelect={toggleSelect}
                        onSelectAll={toggleSelectAll}
                      />
                    )}
                  </div>

                  {/* Pagination */}
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

                  {/* Bulk action — bottom overlay */}
                  {selected.size > 0 && (
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 shadow-2xl">
                      <span className="text-xs font-semibold text-white whitespace-nowrap">
                        {selected.size} selected
                      </span>
                      <div className="mx-1 h-4 w-px bg-gray-600" />
                      <button type="button" className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
                        <Eye className="h-3 w-3" />
                        Reveal contacts
                      </button>
                      <button type="button" className="flex items-center gap-1.5 rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-800 transition-colors">
                        Push to CRM
                      </button>
                      <button type="button" onClick={() => setSelected(new Set())} className="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
