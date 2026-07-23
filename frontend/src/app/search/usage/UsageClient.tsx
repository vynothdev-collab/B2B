"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, TrendingUp, Wallet, Loader2, Briefcase, ArrowRight, Users, Building2, Zap } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetMe, apiGetUsageHistory, type DailyUsage, type RecentSearch, type UserInfo } from "@/lib/authApi";

// ── Credit colour helper ──────────────────────────────────────────────────────

function creditColor(remaining: number, allocated: number): string {
  if (remaining <= 0) return "#dc2626";
  if (allocated > 0 && remaining / allocated < 0.2) return "#f59e0b";
  return "#10b981";
}

// ── Tiny SVG bar chart ────────────────────────────────────────────────────────

function BarChart({ data }: { data: DailyUsage[] }) {
  const maxCount = Math.max(...data.map((d) => d.total), 1);
  const W = 600;
  const H = 120;
  const barW = Math.max(4, Math.floor((W - data.length * 2) / data.length));
  const gap = Math.floor((W - data.length * barW) / (data.length + 1));

  // Show only the last 14 label dates to avoid clutter
  const labelStep = data.length > 14 ? Math.ceil(data.length / 7) : 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 24}`}
      className="w-full"
      aria-label="Daily credit usage bar chart"
    >
      {data.map((d, i) => {
        const barH = Math.max(2, Math.round((d.total / maxCount) * H));
        const x = gap + i * (barW + gap);
        const y = H - barH;
        const showLabel = i % labelStep === 0;
        const label = d.date.slice(5); // MM-DD

        const personH = Math.round((d.person / maxCount) * H);
        const companyH = Math.round((d.company / maxCount) * H);
        const agenticH = Math.max(0, barH - personH - companyH);

        return (
          <g key={d.date}>
            {/* agentic (top) */}
            {agenticH > 0 && (
              <rect x={x} y={y} width={barW} height={agenticH} fill="#8b5cf6" rx="1" />
            )}
            {/* company (middle) */}
            {companyH > 0 && (
              <rect x={x} y={y + agenticH} width={barW} height={companyH} fill="#f59e0b" rx="1" />
            )}
            {/* person (bottom) */}
            {personH > 0 && (
              <rect x={x} y={y + agenticH + companyH} width={barW} height={personH} fill="#10b981" rx="1" />
            )}
            {/* empty bar placeholder */}
            {d.total === 0 && (
              <rect x={x} y={H - 2} width={barW} height={2} fill="#e5e7eb" rx="1" />
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
          </g>
        );
      })}
    </svg>
  );
}

// ── Search type badge ─────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  if (type === "person")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <Users className="h-2.5 w-2.5" /> People
      </span>
    );
  if (type === "company")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        <Building2 className="h-2.5 w-2.5" /> Company
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
      <Zap className="h-2.5 w-2.5" /> Agentic
    </span>
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

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold" style={{ color: color ?? "#111827" }}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UsageClient() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [credits, setCredits] = useState<UserInfo | null>(null);
  const [history, setHistory] = useState<{ daily: DailyUsage[]; recent: RecentSearch[]; total: number } | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [days, setDays] = useState(30);

  const abortRef = useRef<AbortController | null>(null);

  const fetchHistory = useCallback(async (d: number) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setHistoryLoading(true);
    try {
      const h = await apiGetUsageHistory(d, ctrl.signal);
      setHistory({ daily: h.daily_usage, recent: h.recent, total: h.total_logs });
    } catch {
      // cancelled or network error — silently ignore
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) { router.replace("/login"); return; }

    // Fetch credits and history in parallel for fast load
    apiGetMe()
      .then(setCredits)
      .catch(() => setCredits(authUser))
      .finally(() => setCreditsLoading(false));

    void fetchHistory(days);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser, router]);

  useEffect(() => {
    if (!authLoading && authUser) void fetchHistory(days);
  }, [days, fetchHistory, authLoading, authUser]);

  if (authLoading || creditsLoading) {
    return (
      <>
        <AppHeader title="Credit Usage" />
        <div className="flex flex-1 items-center justify-center py-24 text-sm text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
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

  // Chart totals by type
  const totalPerson  = daily.reduce((s, d) => s + d.person, 0);
  const totalCompany = daily.reduce((s, d) => s + d.company, 0);
  const totalAgentic = daily.reduce((s, d) => s + d.agentic, 0);
  const hasActivity  = daily.some((d) => d.total > 0);

  return (
    <>
      <AppHeader title="Credit Usage" />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-2 py-4 sm:px-4">
        <div className="mx-auto w-full max-w-3xl space-y-5">

          {/* ── Credit balance card ─────────────────────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">Search Credits</h2>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                {isEnterpriseUser
                  ? "Credits allocated to you by your Enterprise Admin"
                  : isEnterpriseAdmin
                  ? "Your personal credit allocation"
                  : "Your credit balance for People & Company searches"}
              </p>
            </div>

            <div className="px-6 py-5">
              {allocated === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Wallet className="h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No credits allocated yet</p>
                  <p className="text-xs text-gray-400">
                    {isEnterpriseUser
                      ? "Your Enterprise Admin hasn't allocated any credits to your account."
                      : "Contact your administrator to have credits added."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-end gap-3">
                    <span className="text-4xl font-bold" style={{ color: barColor }}>
                      {remaining.toLocaleString()}
                    </span>
                    <span className="mb-1 text-sm text-gray-400">credits remaining</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${pctUsed}%`, background: barColor }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {used.toLocaleString()} used of {allocated.toLocaleString()} allocated ({pctUsed}% consumed)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Stat cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Allocated"
              value={allocated.toLocaleString()}
              sub={isEnterpriseUser ? "by Enterprise Admin" : "total credits"}
              icon={<Wallet className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              label="Used"
              value={used.toLocaleString()}
              sub="searches performed"
              icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              label="Remaining"
              value={remaining.toLocaleString()}
              sub="available to use"
              color={barColor}
              icon={<CreditCard className="h-5 w-5" style={{ color: barColor }} />}
            />
          </div>

          {/* ── Activity chart ──────────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Search Activity</h3>
                <p className="mt-0.5 text-xs text-gray-400">Credits consumed per day</p>
              </div>
              <div className="flex items-center gap-1">
                {([7, 30, 90] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDays(n)}
                    className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
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
              {historyLoading ? (
                <div className="flex h-[144px] items-center justify-center text-sm text-gray-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading activity…
                </div>
              ) : !hasActivity ? (
                <div className="flex h-[144px] items-center justify-center text-sm text-gray-400">
                  No search activity in the last {days} days.
                </div>
              ) : (
                <BarChart data={daily} />
              )}
            </div>

            {/* Legend */}
            {hasActivity && (
              <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 px-6 py-3">
                <LegendDot color="#10b981" label={`People (${totalPerson.toLocaleString()})`} />
                <LegendDot color="#f59e0b" label={`Company (${totalCompany.toLocaleString()})`} />
                <LegendDot color="#8b5cf6" label={`Agentic (${totalAgentic.toLocaleString()})`} />
                <span className="ml-auto text-xs text-gray-400">
                  {(totalPerson + totalCompany + totalAgentic).toLocaleString()} searches in {days}d
                </span>
              </div>
            )}
          </div>

          {/* ── Recent searches table ───────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Searches</h3>
              <p className="mt-0.5 text-xs text-gray-400">
                {history ? `${history.total.toLocaleString()} total searches` : "Last 20 searches"}
              </p>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : recent.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">
                No searches yet. Start by searching for People or Companies.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                      <th className="px-4 py-2.5 text-left">#</th>
                      <th className="px-4 py-2.5 text-left">Type</th>
                      <th className="px-4 py-2.5 text-left">Date & Time</th>
                      <th className="px-4 py-2.5 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3"><TypeBadge type={r.search_type} /></td>
                        <td className="px-4 py-3 text-gray-600">{fmtDate(r.created_at)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">−1</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Context notes ───────────────────────────────────────────── */}
          {isEnterpriseUser && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
              <p className="font-medium">How your credits work</p>
              <p className="mt-1 text-xs text-blue-600 leading-relaxed">
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
                  <p className="mt-1 text-xs text-amber-600 leading-relaxed">
                    Allocate credits from your enterprise pool to team members so they can
                    perform searches.
                  </p>
                </div>
                <Link
                  href="/search/enterprise"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
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
