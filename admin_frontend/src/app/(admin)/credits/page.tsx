"use client";

import { useState } from "react";
import { Search, Wallet, TrendingUp, Coins, BarChart3 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { INDIVIDUAL_CREDITS, ENTERPRISE_CREDITS } from "@/data/credits";

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

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual Credits");
  const CR_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const isIndividual = activeTab === "Individual Credits";

  const indOutstanding = INDIVIDUAL_CREDITS.reduce((s, u) => s + Math.max(0, u.limit - u.used), 0);
  const indUsed        = INDIVIDUAL_CREDITS.reduce((s, u) => s + u.used, 0);
  const indLimit       = INDIVIDUAL_CREDITS.reduce((s, u) => s + u.limit, 0);

  const entOutstanding = ENTERPRISE_CREDITS.reduce((s, e) => s + Math.max(0, e.limit - e.used), 0);
  const entUsed        = ENTERPRISE_CREDITS.reduce((s, e) => s + e.used, 0);
  const entLimit       = ENTERPRISE_CREDITS.reduce((s, e) => s + e.limit, 0);

  const outstanding = isIndividual ? indOutstanding : entOutstanding;
  const used        = isIndividual ? indUsed        : entUsed;
  const limit       = isIndividual ? indLimit       : entLimit;
  const usageRate   = limit > 0 ? Math.round((used / limit) * 100) : 0;

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
                onClick={() => { setActiveTab(tab); setPage(1); }}
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

        {/* Outstanding Balance — per-tab accent */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: accent.dimBg }}>
            <Wallet className="h-5 w-5" style={{ color: accent.bg }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Outstanding Balance</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{outstanding.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Credits available to use</p>
          </div>
        </div>

        {/* Lifetime Used — rust */}
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

        {/* Total Allocated — sage */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <Coins className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Allocated</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{limit.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Combined monthly limits</p>
          </div>
        </div>

        {/* Usage Rate — gold, with mini progress bar */}
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
                  placeholder="Search users..."
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                  {...focus}
                />
              </div>
              <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors" {...focus}>
                <option>All Plans</option><option>Free</option><option>Pro</option><option>Business</option>
              </select>
              <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors" {...focus}>
                <option>All Statuses</option><option>Healthy</option><option>Low</option><option>Exceeded</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">User</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Plan</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Monthly Limit</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Used</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Remaining</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {INDIVIDUAL_CREDITS.slice((page - 1) * CR_PER_PAGE, page * CR_PER_PAGE).map((u, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)", fontFamily: "var(--font-fraunces)" }}
                          >
                            {u.initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{u.plan}</td>
                      <td className="px-4 py-3 text-slate-600">{u.limit.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{u.used.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{Math.max(0, u.limit - u.used).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge status={u.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{ borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dim)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                          >
                            Add Credits
                          </button>
                          <button
                            type="button"
                            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={INDIVIDUAL_CREDITS.length} perPage={CR_PER_PAGE} page={page} onChange={setPage} itemLabel="users" />
          </>
        )}

        {/* Enterprise Credits */}
        {activeTab === "Enterprise Credits" && (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search enterprises..."
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                  {...focus}
                />
              </div>
              <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors" {...focus}>
                <option>All Statuses</option><option>Healthy</option><option>Low</option><option>Exceeded</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Company</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Plan</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Monthly Limit</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Used</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Remaining</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ENTERPRISE_CREDITS.slice((page - 1) * CR_PER_PAGE, page * CR_PER_PAGE).map((e, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                            style={{ background: "var(--gold-dim)", color: "#8A6222", fontFamily: "var(--font-fraunces)" }}
                          >
                            {e.initials}
                          </div>
                          <span className="font-medium text-slate-800">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{e.plan}</td>
                      <td className="px-4 py-3 text-slate-600">{e.limit.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{e.used.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{Math.max(0, e.limit - e.used).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge status={e.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{ borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dim)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                          >
                            Add Credits
                          </button>
                          <button
                            type="button"
                            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={ENTERPRISE_CREDITS.length} perPage={CR_PER_PAGE} page={page} onChange={setPage} itemLabel="enterprises" />
          </>
        )}
      </div>
    </div>
  );
}
