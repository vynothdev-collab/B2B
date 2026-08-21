"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Users, Building2, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/components/ui/Toast";
import { SkeletonBar, StatCardSkeleton } from "@/components/ui/Skeleton";
import { initialsOf, timeAgo } from "@/lib/time";
import { getCustomerStats, getCustomerPlanBreakdown, listCustomers, type CustomerRole } from "@/services/customers";
import { getEnterpriseStats, listEnterprises, type Enterprise } from "@/services/enterprises";
import { listSearchActivity, listUnlocks } from "@/services/reports";
import { getRevenueSummary } from "@/services/plans";
import {
  OVERVIEW_STATS,
  ALERTS,
  RECENT_TICKETS_PREVIEW,
  RECENT_ACTIVITY,
} from "@/data/dashboard";

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  urgent:  { background: "var(--rose-dim)",  color: "var(--rose)",      border: "1px solid var(--rose)"  },
  pending: { background: "var(--gold-dim)",  color: "#8A6222",           border: "1px solid var(--gold)"  },
  low:     { background: "var(--line-soft)", color: "var(--ink-dim)",    border: "1px solid var(--line)"  },
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open:        { background: "var(--gold-dim)",  color: "#8A6222",        border: "1px solid var(--gold)"  },
  in_progress: { background: "rgba(23,50,41,.07)", color: "var(--forest)", border: "1px solid var(--forest-line)" },
  resolved:    { background: "var(--sage-dim)",  color: "var(--sage-dark)", border: "1px solid var(--sage)" },
};

const ROLE_LABEL: Record<CustomerRole, string> = {
  individual: "Individual",
  enterprise_admin: "Enterprise Admin",
  enterprise_user: "Enterprise User",
};

const PLAN_COLORS = ["var(--forest)", "var(--gold)", "var(--sage)", "var(--rust)", "var(--line)"];

function PlanBadge({ plan }: { plan: string }) {
  const s: React.CSSProperties =
    plan === "Enterprise" ? { background: "var(--gold-dim)",          color: "#8A6222"           } :
    plan === "Business"   ? { background: "rgba(23,50,41,.07)",        color: "var(--forest)"     } :
    plan === "Pro"        ? { background: "var(--sage-dim)",           color: "var(--sage-dark)"  } :
                            { background: "var(--line-soft)",          color: "var(--ink-faint)"  };
  return (
    <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={s}>
      {plan}
    </span>
  );
}

function SectionHeader({ title, href, label = "View all" }: { title: string; href: string; label?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-medium transition-colors"
        style={{ color: "var(--gold-dark, #93691F)" }}
      >
        {label} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

interface SignupItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  planLabel: string;
  type: "Individual" | "Enterprise";
  created_at: string;
}

interface PlanBreakdownRow {
  name: string;
  count: number;
  pct: number;
  barColor: string;
}

interface IndividualLive {
  total: number;
  newThisWeek: number;
  activeThisMonth: number;
  inactiveCount: number;
  searchesThisMonth: number;
  unlocksThisMonth: number;
  freeCount: number;
  paidCount: number;
  plans: PlanBreakdownRow[];
}

interface EnterpriseLive {
  totalAccounts: number;
  totalUsers: number;
  newThisMonth: number;
  activeAccounts: number;
  suspendedAccounts: number;
  searchesThisMonth: number;
  unlocksThisMonth: number;
  totalCredits: number;
  topAccounts: Enterprise[];
}

export default function DashboardPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Record<string, string>>({});
  const [individual, setIndividual] = useState<IndividualLive | null>(null);
  const [enterprise, setEnterprise] = useState<EnterpriseLive | null>(null);
  const [signups, setSignups] = useState<SignupItem[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDashboard = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const [
        allCustomerStats,
        individualCustomerStats,
        individualNewThisWeek,
        planBreakdown,
        enterpriseStats,
        suspendedEnterprises,
        individualSearches,
        enterpriseSearches,
        individualEmailUnlocks,
        individualMobileUnlocks,
        enterpriseEmailUnlocks,
        enterpriseMobileUnlocks,
        recentCustomers,
        recentEnterprises,
        revenueSummary,
      ] = await Promise.all([
        getCustomerStats({}, ctrl.signal),
        getCustomerStats({ role: "individual" }, ctrl.signal),
        getCustomerStats({ role: "individual", period: "week" }, ctrl.signal),
        getCustomerPlanBreakdown(ctrl.signal),
        getEnterpriseStats({ period: "month" }, ctrl.signal),
        listEnterprises({ status: "suspended", page_size: 1 }, ctrl.signal),
        listSearchActivity({ period: "month", account_type: "individual", page_size: 1 }, ctrl.signal),
        listSearchActivity({ period: "month", account_type: "enterprise", page_size: 1 }, ctrl.signal),
        listUnlocks({ field: "email", period: "month", account_type: "individual", page_size: 1 }, ctrl.signal),
        listUnlocks({ field: "mobile", period: "month", account_type: "individual", page_size: 1 }, ctrl.signal),
        listUnlocks({ field: "email", period: "month", account_type: "enterprise", page_size: 1 }, ctrl.signal),
        listUnlocks({ field: "mobile", period: "month", account_type: "enterprise", page_size: 1 }, ctrl.signal),
        listCustomers({ page_size: 5 }, ctrl.signal),
        listEnterprises({ page_size: 100 }, ctrl.signal),
        getRevenueSummary("month", ctrl.signal),
      ]);

      const searchesThisMonth = individualSearches.total + enterpriseSearches.total;

      setOverview({
        "Total Platform Users": allCustomerStats.total.toLocaleString(),
        "Searches This Month": searchesThisMonth.toLocaleString(),
        "Revenue This Month": `$${(revenueSummary.revenue_cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        "Active Subscriptions": revenueSummary.active_subscriptions.toLocaleString(),
      });

      const freeItem = planBreakdown.items.find((i) => i.name === "Free");
      const freeCount = freeItem?.count ?? 0;
      const paidCount = planBreakdown.total - freeCount;
      let paletteIdx = 0;
      const plans: PlanBreakdownRow[] = planBreakdown.items.map((item) => {
        const barColor = item.name === "Free" ? "var(--ink-faint)" : PLAN_COLORS[paletteIdx++ % PLAN_COLORS.length];
        return {
          name: item.name,
          count: item.count,
          pct: planBreakdown.total > 0 ? Math.round((item.count / planBreakdown.total) * 100) : 0,
          barColor,
        };
      });

      setIndividual({
        total: individualCustomerStats.total,
        newThisWeek: individualNewThisWeek.new_count,
        activeThisMonth: individualCustomerStats.active,
        inactiveCount: individualCustomerStats.suspended,
        searchesThisMonth: individualSearches.total,
        unlocksThisMonth: individualEmailUnlocks.total + individualMobileUnlocks.total,
        freeCount,
        paidCount,
        plans,
      });

      const topAccounts = [...recentEnterprises.items]
        .sort((a, b) => b.user_count - a.user_count)
        .slice(0, 5);

      setEnterprise({
        totalAccounts: enterpriseStats.total,
        totalUsers: enterpriseStats.total_users,
        newThisMonth: enterpriseStats.new_count,
        activeAccounts: enterpriseStats.active,
        suspendedAccounts: suspendedEnterprises.total,
        searchesThisMonth: enterpriseSearches.total,
        unlocksThisMonth: enterpriseEmailUnlocks.total + enterpriseMobileUnlocks.total,
        totalCredits: enterpriseStats.total_credits,
        topAccounts,
      });

      const customerItems: SignupItem[] = recentCustomers.items.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        initials: initialsOf(c.name),
        planLabel: ROLE_LABEL[c.role] ?? c.role,
        type: c.role === "individual" ? "Individual" : "Enterprise",
        created_at: c.created_at,
      }));
      const enterpriseItems: SignupItem[] = recentEnterprises.items.slice(0, 5).map((e) => ({
        id: e.id,
        name: e.name,
        email: e.admin_email ?? "—",
        initials: initialsOf(e.name),
        planLabel: e.plan,
        type: "Enterprise",
        created_at: e.created_at,
      }));
      const merged = [...customerItems, ...enterpriseItems]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setSignups(merged);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      toast.error("Failed to load dashboard data", "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchDashboard();
    return () => abortRef.current?.abort();
  }, [fetchDashboard]);

  const enterpriseHealthTotal = enterprise?.totalAccounts ?? 0;
  const enterpriseHealthActive = enterprise?.activeAccounts ?? 0;

  return (
    <div className="space-y-5">

      {/* ── Row 1: Overview Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : OVERVIEW_STATS.map((card) => {
              const Icon = card.icon;
              const value = overview[card.label] ?? card.value;
              return (
                <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: card.iconBg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: card.iconColor }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              );
            })}
      </div>

      {/* ── Row 2: Individual vs Enterprise ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Individual Users */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "var(--forest)" }}
            >
              <Users className="h-4 w-4" style={{ color: "#EFEAD9" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Individual Users</h2>
              <p className="text-xs text-slate-400">Personal accounts</p>
            </div>
            {loading ? (
              <SkeletonBar className="h-6 w-14" />
            ) : (
              <span className="text-xl font-bold text-slate-900">{(individual?.total ?? 0).toLocaleString()}</span>
            )}
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">New This Week</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold" style={{ color: "var(--forest)" }}>+{(individual?.newThisWeek ?? 0).toLocaleString()}</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Active This Month</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold" style={{ color: "var(--sage)" }}>{(individual?.activeThisMonth ?? 0).toLocaleString()}</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Searches (Month)</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold text-slate-800">{(individual?.searchesThisMonth ?? 0).toLocaleString()}</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Unlocks (Month)</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold text-slate-800">{(individual?.unlocksThisMonth ?? 0).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Free vs Paid</p>
                {loading ? (
                  <SkeletonBar className="h-3 w-28" />
                ) : (
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--line)" }} />
                      Free: {individual?.freeCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--forest)" }} />
                      Paid: {individual?.paidCount ?? 0}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: "var(--line-soft)" }}>
                <div
                  className="h-full rounded-l-full"
                  style={{
                    width: `${individual && individual.total > 0 ? Math.round((individual.freeCount / individual.total) * 100) : 0}%`,
                    background: "var(--line)",
                  }}
                />
                <div className="h-full rounded-r-full flex-1" style={{ background: "var(--forest)" }} />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-500">Plan Breakdown</p>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBar className="h-3 w-14" />
                    <SkeletonBar className="flex-1 h-1.5 rounded-full" />
                    <SkeletonBar className="h-3 w-8" />
                  </div>
                ))}
              {!loading && individual?.plans.map((plan) => (
                <div key={plan.name} className="flex items-center gap-3">
                  <span className="w-14 text-xs text-slate-600 font-medium truncate">{plan.name}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line-soft)" }}>
                    <div className="h-full rounded-full" style={{ width: `${plan.pct}%`, background: plan.barColor }} />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-500">{plan.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Panel */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "var(--gold)" }}
            >
              <Building2 className="h-4 w-4" style={{ color: "#3C2400" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Enterprise Accounts</h2>
              <p className="text-xs text-slate-400">Company accounts & teams</p>
            </div>
            {loading ? (
              <SkeletonBar className="h-6 w-10" />
            ) : (
              <span className="text-xl font-bold text-slate-900">{enterprise?.totalAccounts ?? 0}</span>
            )}
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Total Ent. Users</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold" style={{ color: "#8A6222" }}>{(enterprise?.totalUsers ?? 0).toLocaleString()}</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Credits Allocated</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold" style={{ color: "var(--sage)" }}>{(enterprise?.totalCredits ?? 0).toLocaleString()}</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Searches (Month)</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold text-slate-800">{(enterprise?.searchesThisMonth ?? 0).toLocaleString()}</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">New This Month</p>
                {loading ? (
                  <SkeletonBar className="h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold text-slate-800">+{(enterprise?.newThisMonth ?? 0).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Account Health</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" style={{ color: "var(--sage)" }} />
                    Active: {enterprise?.activeAccounts ?? "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" style={{ color: "var(--rose)" }} />
                    Suspended: {enterprise?.suspendedAccounts ?? "—"}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: "var(--line-soft)" }}>
                <div
                  className="h-full rounded-l-full"
                  style={{
                    width: `${enterpriseHealthTotal > 0 ? Math.round((enterpriseHealthActive / enterpriseHealthTotal) * 100) : 0}%`,
                    background: "var(--sage)",
                  }}
                />
                <div className="h-full rounded-r-full flex-1" style={{ background: "var(--rose)" }} />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-500">Top Accounts</p>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-lg skeleton-shimmer" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <SkeletonBar className="h-3 w-24" />
                      <SkeletonBar className="h-2 w-16" style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                ))}
              {!loading && enterprise?.topAccounts.length === 0 && (
                <p className="text-xs text-slate-400">No enterprise accounts yet.</p>
              )}
              {!loading && enterprise?.topAccounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{ background: "var(--gold-dim)", color: "#8A6222" }}
                  >
                    {initialsOf(acc.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-400">{acc.plan} · {acc.user_count} users</p>
                  </div>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={acc.status === "active"
                      ? { background: "var(--sage-dim)", color: "var(--sage-dark)" }
                      : { background: "var(--line-soft)", color: "var(--ink-faint)" }
                    }
                  >
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Alerts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ALERTS.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.label}
              className="flex items-start gap-3 rounded-xl border px-4 py-3.5"
              style={{ background: alert.alertBg, borderColor: alert.alertBorder }}
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(255,255,255,.7)" }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: alert.alertColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: alert.alertColor }}>{alert.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{alert.sub}</p>
                <Link
                  href={alert.href}
                  className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold hover:underline"
                  style={{ color: alert.alertColor }}
                >
                  {alert.action} <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Row 4: Recent Signups | Tickets ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <SectionHeader title="Recent Signups" href="/users" />
          </div>
          <div className="divide-y divide-slate-50">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-8 w-8 shrink-0 rounded-full skeleton-shimmer" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <SkeletonBar className="h-3 w-28" />
                    <SkeletonBar className="h-2 w-36" style={{ opacity: 0.6 }} />
                  </div>
                  <SkeletonBar className="h-4 w-12" />
                </div>
              ))}
            {!loading && signups?.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No recent signups.</p>
            )}
            {!loading && signups?.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={
                    u.type === "Enterprise"
                      ? { background: "var(--gold-dim)", color: "#8A6222" }
                      : { background: "rgba(23,50,41,.08)", color: "var(--forest)" }
                  }
                >
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <PlanBadge plan={u.planLabel} />
                  <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(u.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <SectionHeader title="Recent Tickets" href="/tickets" />
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_TICKETS_PREVIEW.map((t, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[11px] font-semibold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--forest)" }}
                  >
                    {t.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={PRIORITY_STYLE[t.priority] ?? { background: "var(--line-soft)", color: "var(--ink-dim)" }}
                    >
                      {t.priority}
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={STATUS_STYLE[t.status] ?? { background: "var(--line-soft)", color: "var(--ink-dim)" }}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-800 truncate">{t.subject}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[11px] text-slate-400">{t.by}</p>
                  <p className="text-[11px] text-slate-400">{t.updated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 5: Recent Activity ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          <span className="text-xs text-slate-400">Last 24 hours</span>
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-2.5">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: item.dotColor }}
              />
              <p className="flex-1 text-sm text-slate-600">{item.text}</p>
              <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap pt-0.5">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
