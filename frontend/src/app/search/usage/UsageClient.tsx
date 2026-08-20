"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, Briefcase, ArrowRight, Users, Building2, Zap,
  ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiGetMe, apiGetUsageHistory,
  type DailyUsage, type RecentSearch, type SearchTypeFilter, type UserInfo,
} from "@/lib/authApi";

function creditColor(remaining: number, allocated: number): string {
  if (remaining <= 0) return "#dc2626";
  if (allocated > 0 && remaining / allocated < 0.2) return "#f59e0b";
  return "#10b981";
}

function BarChart({ data }: { data: DailyUsage[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.total), 1);
  const niceMax = Math.max(4, Math.ceil(maxCount / 4) * 4);
  const W = 600;
  const H = 140;
  const padLeft = 26;
  const chartW = W - padLeft;
  const barW = Math.max(4, Math.floor((chartW - data.length * 2) / data.length));
  const gap = Math.floor((chartW - data.length * barW) / (data.length + 1));

  const labelStep = data.length > 14 ? Math.ceil(data.length / 7) : 2;

  const gridFractions = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 24}`}
      className="w-full overflow-visible"
      aria-label="Daily credit usage bar chart"
    >
      {gridFractions.map((f) => {
        const y = H - f * H;
        return (
          <g key={f}>
            <line x1={padLeft} x2={W} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#cbd5e1">
              {Math.round(niceMax * f)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = Math.max(2, Math.round((d.total / niceMax) * H));
        const x = padLeft + gap + i * (barW + gap);
        const y = H - barH;
        const showLabel = i % labelStep === 0;
        const label = d.date.slice(5); // MM-DD

        const personH = Math.round((d.person / niceMax) * H);
        const companyH = Math.round((d.company / niceMax) * H);
        const agenticH = Math.max(0, barH - personH - companyH);

        return (
          <g
            key={d.date}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
          >
            <rect x={x - gap / 2} y={0} width={barW + gap} height={H} fill="transparent" />
            {hoverIdx === i && (
              <rect x={x - gap / 2} y={0} width={barW + gap} height={H} fill="#111827" opacity="0.04" />
            )}
            {agenticH > 0 && (
              <rect x={x} y={y} width={barW} height={agenticH} fill="#8b5cf6" rx="1.5" />
            )}
            {companyH > 0 && (
              <rect x={x} y={y + agenticH} width={barW} height={companyH} fill="#f59e0b" rx="1.5" />
            )}
            {personH > 0 && (
              <rect x={x} y={y + agenticH + companyH} width={barW} height={personH} fill="#10b981" rx="1.5" />
            )}
            {d.total === 0 && (
              <rect x={x} y={H - 1.5} width={barW} height={1.5} fill="#e5e7eb" rx="1" />
            )}
            {showLabel && (
              <text
                x={x + barW / 2}
                y={H + 16}
                textAnchor="middle"
                fontSize="9"
                fill="#9ca3af"
              >
                {label}
              </text>
            )}
            <title>
              {`${d.date} — ${d.total} search${d.total === 1 ? "" : "es"} (People ${d.person}, Company ${d.company}, Agentic ${d.agentic})`}
            </title>
          </g>
        );
      })}
    </svg>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === "person")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <Users className="h-3 w-3" /> People
      </span>
    );
  if (type === "company")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Building2 className="h-3 w-3" /> Company
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
      <Zap className="h-3 w-3" /> Agentic
    </span>
  );
}

function StatCardSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-100" />
      </div>
      <div className="mt-3 h-8 w-20 rounded bg-gray-200" />
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100" />
      <div className="mt-2 h-3 w-36 rounded bg-gray-100" />
    </div>
  );
}

function UsageChartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading usage chart" className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-40 rounded bg-gray-100" />
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-50 p-1">
          <div className="h-7 w-9 rounded-md bg-gray-200" />
          <div className="h-7 w-9 rounded-md bg-gray-100" />
          <div className="h-7 w-9 rounded-md bg-gray-100" />
        </div>
      </div>
      <div className="flex h-[176px] items-end gap-1 px-6 py-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gray-100"
            style={{ height: `${20 + ((i * 37) % 76)}%` }}
          />
        ))}
      </div>
      <div className="flex gap-4 border-t border-gray-100 px-6 py-3">
        <div className="h-3 w-20 rounded bg-gray-100" />
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-24 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function UsageLogTableSkeleton() {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-4 py-2.5 text-left">#</th>
              <th className="px-4 py-2.5 text-left">Type</th>
              <th className="px-4 py-2.5 text-left">Date &amp; Time</th>
              <th className="px-4 py-2.5 text-right">Credits</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 odd:bg-white even:bg-gray-50/40">
                <td className="px-4 py-3"><div className="h-3.5 w-4 animate-pulse rounded bg-gray-100" /></td>
                <td className="px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" /></td>
                <td className="px-4 py-3"><div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" /></td>
                <td className="px-4 py-3 text-right"><div className="ml-auto h-5 w-9 animate-pulse rounded-full bg-gray-100" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-100" />
      </div>
    </>
  );
}

function UsageLogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading usage log" className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-100" />
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-50 p-1">
          <div className="h-7 w-10 rounded-md bg-gray-200" />
          <div className="h-7 w-14 rounded-md bg-gray-100" />
          <div className="h-7 w-16 rounded-md bg-gray-100" />
          <div className="h-7 w-16 rounded-md bg-gray-100" />
        </div>
      </div>
      <UsageLogTableSkeleton />
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatCard({
  label, value, sub, color, icon, iconBg, pct,
}: {
  label: string; value: string; sub?: string; color?: string; icon: React.ReactNode; iconBg?: string; pct?: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconBg ?? "#f9fafb" }}
        >
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-400">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums" style={{ color: color ?? "#111827" }}>{value}</p>
      {typeof pct === "number" && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, pct)}%`, background: color ?? "#111827" }}
          />
        </div>
      )}
      {sub && <p className="mt-1.5 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}

export default function UsageClient() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [credits, setCredits] = useState<UserInfo | null>(null);
  const [history, setHistory] = useState<{
    daily: DailyUsage[]; recent: RecentSearch[]; total: number; recentTotal: number;
  } | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [historyInitialLoading, setHistoryInitialLoading] = useState(true);
  const [historyFetching, setHistoryFetching] = useState(true);
  const [days, setDays] = useState(30);
  const [logFilter, setLogFilter] = useState<"all" | SearchTypeFilter>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const abortRef = useRef<AbortController | null>(null);

  const fetchHistory = useCallback(async (d: number, filter: "all" | SearchTypeFilter, p: number) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setHistoryFetching(true);
    try {
      const h = await apiGetUsageHistory(d, ctrl.signal, filter === "all" ? undefined : filter, p, PAGE_SIZE);
      setHistory({ daily: h.daily_usage, recent: h.recent, total: h.total_logs, recentTotal: h.recent_total });
      setHistoryFetching(false);
      setHistoryInitialLoading(false);
    } catch {
      if (!ctrl.signal.aborted) {
        setHistoryFetching(false);
        setHistoryInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) { router.replace("/login"); return; }

    apiGetMe()
      .then(setCredits)
      .catch(() => setCredits(authUser))
      .finally(() => setCreditsLoading(false));
  }, [authLoading, authUser, router]);

  useEffect(() => {
    if (!authLoading && authUser) void fetchHistory(days, logFilter, page);
  }, [days, logFilter, page, fetchHistory, authLoading, authUser]);

  useEffect(() => {
    setPage(1);
  }, [logFilter, days]);

  if (authLoading || creditsLoading) {
    return (
      <>
        <AppHeader title="Usage" />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <UsageChartSkeleton />
            <UsageLogSkeleton />
          </div>
        </div>
      </>
    );
  }

  const u = credits ?? authUser!;
  const allocated = u.allocated_credits ?? 0;
  const used = u.used_credits ?? 0;
  const remaining = u.remaining_credits ?? (allocated - used);
  const pctUsed = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;
  const barColor = creditColor(remaining, allocated);

  const isEnterpriseUser = u.role === "enterprise_user";
  const isEnterpriseAdmin = u.role === "enterprise_admin";

  const daily = history?.daily ?? [];
  const recent = history?.recent ?? [];

  const totalPerson  = daily.reduce((s, d) => s + d.person, 0);
  const totalCompany = daily.reduce((s, d) => s + d.company, 0);
  const totalAgentic = daily.reduce((s, d) => s + d.agentic, 0);
  const hasActivity  = daily.some((d) => d.total > 0);
  const totalSearches = totalPerson + totalCompany + totalAgentic;

  const recentTotal = history?.recentTotal ?? 0;
  const pageCount = Math.max(1, Math.ceil(recentTotal / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedRecent = recent;

  return (
    <>
      <AppHeader title="Usage" />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto w-full max-w-7xl space-y-5">

          {allocated === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white py-10 text-center shadow-sm">
              <Wallet className="h-8 w-8 text-gray-300" />
              <p className="text-base font-medium text-gray-500">No credits allocated yet</p>
              <p className="text-sm text-gray-400">
                {isEnterpriseUser
                  ? "Your Enterprise Admin hasn't allocated any credits to your account."
                  : "Contact your administrator to have credits added."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Credit Balance"
                value={remaining.toLocaleString()}
                sub={`${used.toLocaleString()} used · ${pctUsed}% consumed`}
                color={barColor}
                pct={pctUsed}
                icon={<Wallet className="h-5 w-5" style={{ color: barColor }} />}
                iconBg="#eff6ff"
              />
              <StatCard
                label="People Searches"
                value={totalPerson.toLocaleString()}
                sub={totalSearches > 0 ? `${Math.round((totalPerson / totalSearches) * 100)}% of total this period` : "no activity yet"}
                color="#10b981"
                pct={totalSearches > 0 ? (totalPerson / totalSearches) * 100 : 0}
                icon={<Users className="h-5 w-5 text-emerald-500" />}
                iconBg="#ecfdf5"
              />
              <StatCard
                label="Company Searches"
                value={totalCompany.toLocaleString()}
                sub={totalSearches > 0 ? `${Math.round((totalCompany / totalSearches) * 100)}% of total this period` : "no activity yet"}
                color="#f59e0b"
                pct={totalSearches > 0 ? (totalCompany / totalSearches) * 100 : 0}
                icon={<Building2 className="h-5 w-5 text-amber-500" />}
                iconBg="#fffbeb"
              />
              <StatCard
                label="Agentic Searches"
                value={totalAgentic.toLocaleString()}
                sub={totalSearches > 0 ? `${Math.round((totalAgentic / totalSearches) * 100)}% of total this period` : "no activity yet"}
                color="#8b5cf6"
                pct={totalSearches > 0 ? (totalAgentic / totalSearches) * 100 : 0}
                icon={<Zap className="h-5 w-5 text-violet-500" />}
                iconBg="#f5f3ff"
              />
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Usage Over Time</h3>
                  <p className="mt-0.5 text-sm text-gray-400">Daily searches — last {days} days</p>
                </div>
                {historyFetching && !historyInitialLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-1">
                {([7, 30, 90] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDays(n)}
                    className="rounded-md px-2.5 py-1 text-sm font-medium transition-colors"
                    style={
                      days === n
                        ? { background: "#111827", color: "#fff" }
                        : { background: "transparent", color: "#9ca3af" }
                    }
                  >
                    {n}d
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4">
              {historyInitialLoading ? (
                <div className="flex h-[144px] animate-pulse items-end gap-1">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gray-100"
                      style={{ height: `${20 + ((i * 37) % 100)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className={`transition-opacity ${historyFetching ? "opacity-40" : "opacity-100"}`}>
                  {!hasActivity ? (
                    <div className="flex h-[144px] items-center justify-center text-sm text-gray-400">
                      No search activity in the last {days} days.
                    </div>
                  ) : (
                    <BarChart data={daily} />
                  )}
                </div>
              )}
            </div>

            {hasActivity && (
              <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 px-6 py-3">
                <LegendDot color="#10b981" label={`People (${totalPerson.toLocaleString()})`} />
                <LegendDot color="#f59e0b" label={`Company (${totalCompany.toLocaleString()})`} />
                <LegendDot color="#8b5cf6" label={`Agentic (${totalAgentic.toLocaleString()})`} />
                <span className="ml-auto text-sm text-gray-400">
                  {(totalPerson + totalCompany + totalAgentic).toLocaleString()} searches in {days}d
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Usage Log</h3>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {history ? `${history.total.toLocaleString()} total searches` : "Last 20 searches"}
                  </p>
                </div>
                {historyFetching && !historyInitialLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1">
                {([
                  { key: "all", label: "All" },
                  { key: "person", label: "People" },
                  { key: "company", label: "Company" },
                  { key: "agentic", label: "Agentic" },
                ] as const).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setLogFilter(f.key)}
                    disabled={historyFetching}
                    className="rounded-md px-2.5 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed"
                    style={
                      logFilter === f.key
                        ? { background: "#fff", color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                        : { background: "transparent", color: "#9ca3af" }
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {historyInitialLoading ? (
              <UsageLogTableSkeleton />
            ) : recentTotal === 0 && !historyFetching ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">
                {(history?.total ?? 0) === 0
                  ? "No searches yet. Start by searching for People or Companies."
                  : "No searches match this filter."}
              </p>
            ) : (
              <div className={`transition-opacity ${historyFetching ? "pointer-events-none opacity-40" : "opacity-100"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-400">
                        <th className="px-4 py-2.5 text-left">#</th>
                        <th className="px-4 py-2.5 text-left">Type</th>
                        <th className="px-4 py-2.5 text-left">Date &amp; Time</th>
                        <th className="px-4 py-2.5 text-right">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRecent.map((r, i) => (
                        <tr
                          key={r.id}
                          className="border-b border-gray-50 transition-colors odd:bg-white even:bg-gray-50/40 hover:bg-blue-50/40"
                        >
                          <td className="px-4 py-3 tabular-nums text-gray-400">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                          <td className="px-4 py-3"><TypeBadge type={r.search_type} /></td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.created_at)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-red-600">
                              −1
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-400">
                    Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, recentTotal)} of {recentTotal}
                  </p>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1 || historyFetching}
                      aria-label="Previous page"
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                    <span className="px-2 text-sm font-medium text-gray-500">Page {safePage} / {pageCount}</span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      disabled={safePage >= pageCount || historyFetching}
                      aria-label="Next page"
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEnterpriseUser && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
              <p className="font-medium">How your credits work</p>
              <p className="mt-1 text-sm text-blue-600 leading-relaxed">
                Credits are allocated by your Enterprise Admin. Each People or Company search
                consumes 1 credit. When credits run out, searches are paused until your admin
                allocates more.
              </p>
            </div>
          )}

          {isEnterpriseAdmin && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Manage your team's credits</p>
                  <p className="mt-1 text-sm text-amber-600 leading-relaxed">
                    Allocate credits from your enterprise pool to team members so they can
                    perform searches.
                  </p>
                </div>
                <Link
                  href="/search/enterprise"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-colors"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  My Team
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
