"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, Wallet, TrendingUp, Coins, BarChart3, Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  listIndividualCredits,
  listEnterpriseCredits,
  type PagedIndividualCredits,
  type PagedEnterpriseCredits,
} from "@/services/credits";
import AddCreditsModal from "@/components/modals/AddCreditsModal";

const TABS = ["Individual Credits", "Enterprise Credits"] as const;
type Tab = typeof TABS[number];

/* Warm focus handler reused on inputs/selects */
function makeFocusHandlers(isIndividual: boolean) {
  const ring   = isIndividual ? "rgba(23,50,41,.10)"  : "var(--gold-dim)";
  const border = isIndividual ? "var(--forest)"       : "var(--gold)";
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = border;
      e.currentTarget.style.boxShadow  = `0 0 0 3px ${ring}`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = "";
      e.currentTarget.style.boxShadow   = "";
    },
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export default function CreditsPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("Individual Credits");
  const CR_PER_PAGE = 8;
  const [indPage, setIndPage] = useState(1);
  const [entPage, setEntPage] = useState(1);

  const isIndividual = activeTab === "Individual Credits";

  // filters
  const [indQuery, setIndQuery] = useState("");
  const [indStatus, setIndStatus] = useState("all");
  const [entQuery, setEntQuery] = useState("");
  const [entStatus, setEntStatus] = useState("all");

  const dIndQuery = useDebounce(indQuery, 300);
  const dEntQuery = useDebounce(entQuery, 300);

  // data
  const [indData, setIndData] = useState<PagedIndividualCredits | null>(null);
  const [entData, setEntData] = useState<PagedEnterpriseCredits | null>(null);
  const [loading, setLoading] = useState(false);

  // modal
  const [addCreditsTarget, setAddCreditsTarget] = useState<{
    type: "individual" | "enterprise";
    id: string;
    name: string;
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    try {
      if (isIndividual) {
        const data = await listIndividualCredits(
          {
            page: indPage,
            page_size: CR_PER_PAGE,
            q: dIndQuery || undefined,
            status: indStatus !== "all" ? indStatus : undefined,
          },
          ctrl.signal,
        );
        setIndData(data);
      } else {
        const data = await listEnterpriseCredits(
          {
            page: entPage,
            page_size: CR_PER_PAGE,
            q: dEntQuery || undefined,
            status: entStatus !== "all" ? entStatus : undefined,
          },
          ctrl.signal,
        );
        setEntData(data);
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      toast.error("Failed to load credits", "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isIndividual, indPage, entPage, dIndQuery, dEntQuery, indStatus, entStatus, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // derive stats
  const stats = isIndividual ? indData?.stats : entData?.stats;
  const outstanding = stats?.total_remaining ?? 0;
  const used        = stats?.total_used      ?? 0;
  const allocated   = stats?.total_allocated ?? 0;
  const usageRate   = allocated > 0 ? Math.round((used / allocated) * 100) : 0;

  /* per-tab accent */
  const accent = isIndividual
    ? { bg: "var(--forest)", dimBg: "rgba(23,50,41,.08)", text: "var(--forest)",  label: "var(--forest)"  }
    : { bg: "var(--gold)",   dimBg: "var(--gold-dim)",   text: "#8A6222",         label: "#8A6222"        };

  const focus = makeFocusHandlers(isIndividual);

  return (
    <div className="space-y-5">

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isInd    = tab === "Individual Credits";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setIndPage(1); setEntPage(1); }}
                className="px-4 py-2.5 text-sm font-medium transition-colors"
                style={
                  isActive
                    ? { borderBottom: `2px solid ${isInd ? "var(--forest)" : "var(--gold)"}`, color: isInd ? "var(--forest)" : "#8A6222" }
                    : { color: "var(--ink-faint)" }
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: accent.dimBg }}>
            <Wallet className="h-5 w-5" style={{ color: accent.bg }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Outstanding Balance</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{outstanding.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Credits remaining to use</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--rust-dim)" }}>
            <TrendingUp className="h-5 w-5" style={{ color: "var(--rust)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Lifetime Used</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{used.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total consumed to date</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <Coins className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Allocated</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{allocated.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Credits allocated overall</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--gold-dim)" }}>
              <BarChart3 className="h-5 w-5" style={{ color: "#8A6222" }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Usage Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{usageRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Of total allocation</p>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${usageRate}%`, background: "#8A6222" }} />
          </div>
        </div>
      </div>

      {/* ── Table Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        {/* Individual Credits */}
        {activeTab === "Individual Credits" && (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={indQuery}
                  onChange={(e) => { setIndQuery(e.target.value); setIndPage(1); }}
                  placeholder="Search users..."
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                  {...focus}
                />
              </div>
              <select
                value={indStatus}
                onChange={(e) => { setIndStatus(e.target.value); setIndPage(1); }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors"
                {...focus}
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="low">Low</option>
                <option value="exceeded">Exceeded</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">User</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Allocated</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Used</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Remaining</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !indData && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!loading && indData?.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                        No individual users found.
                      </td>
                    </tr>
                  )}
                  {indData?.items.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)", fontFamily: "var(--font-fraunces)" }}
                          >
                            {initials(u.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{u.allocated_credits.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{u.used_credits.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{u.remaining_credits.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge status={u.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setAddCreditsTarget({ type: "individual", id: u.id, name: u.name })}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dim)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Add Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              total={indData?.total ?? 0}
              perPage={CR_PER_PAGE}
              page={indPage}
              onChange={setIndPage}
              itemLabel="users"
            />
          </>
        )}

        {/* Enterprise Credits */}
        {activeTab === "Enterprise Credits" && (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={entQuery}
                  onChange={(e) => { setEntQuery(e.target.value); setEntPage(1); }}
                  placeholder="Search enterprises..."
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                  {...focus}
                />
              </div>
              <select
                value={entStatus}
                onChange={(e) => { setEntStatus(e.target.value); setEntPage(1); }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors"
                {...focus}
              >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="low">Low</option>
                <option value="exceeded">Exceeded</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Company</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Plan</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Pool</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Allocated</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Used</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Remaining</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !entData && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!loading && entData?.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                        No enterprises found.
                      </td>
                    </tr>
                  )}
                  {entData?.items.map((ent) => (
                    <tr key={ent.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                            style={{ background: "var(--gold-dim)", color: "#8A6222", fontFamily: "var(--font-fraunces)" }}
                          >
                            {initials(ent.name)}
                          </div>
                          <span className="font-medium text-slate-800">{ent.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{ent.plan}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{ent.pool_credits.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{ent.total_allocated.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{ent.total_used.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{ent.total_remaining.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge status={ent.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setAddCreditsTarget({ type: "enterprise", id: ent.id, name: ent.name })}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dim)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Add Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              total={entData?.total ?? 0}
              perPage={CR_PER_PAGE}
              page={entPage}
              onChange={setEntPage}
              itemLabel="enterprises"
            />
          </>
        )}
      </div>

      <AddCreditsModal
        open={!!addCreditsTarget}
        target={addCreditsTarget}
        onClose={() => setAddCreditsTarget(null)}
        onSuccess={() => {
          setAddCreditsTarget(null);
          void fetchData();
        }}
      />
    </div>
  );
}
