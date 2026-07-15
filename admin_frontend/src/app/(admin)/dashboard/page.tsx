"use client";

import { TrendingUp, Users, Building2, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  OVERVIEW_STATS,
  INDIVIDUAL_STATS,
  ENTERPRISE_STATS,
  ALERTS,
  RECENT_SIGNUPS,
  RECENT_TICKETS_PREVIEW,
  RECENT_CHATS_PREVIEW,
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

export default function DashboardPage() {
  return (
    <div className="space-y-5">

      {/* ── Row 1: Overview Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OVERVIEW_STATS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: card.iconBg }}
                >
                  <Icon className="h-4 w-4" style={{ color: card.iconColor }} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--sage)" }}>
                  <TrendingUp className="h-3 w-3" />
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
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
            <span className="text-xl font-bold text-slate-900">{INDIVIDUAL_STATS.total.toLocaleString()}</span>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">New This Week</p>
                <p className="text-lg font-bold" style={{ color: "var(--forest)" }}>+{INDIVIDUAL_STATS.newThisWeek}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Active This Month</p>
                <p className="text-lg font-bold" style={{ color: "var(--sage)" }}>{INDIVIDUAL_STATS.activeThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Searches (Month)</p>
                <p className="text-lg font-bold text-slate-800">{INDIVIDUAL_STATS.searchesThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Reveals (Month)</p>
                <p className="text-lg font-bold text-slate-800">{INDIVIDUAL_STATS.revealsThisMonth.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Free vs Paid</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--line)" }} />
                    Free: {INDIVIDUAL_STATS.freeCount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--forest)" }} />
                    Paid: {INDIVIDUAL_STATS.paidCount}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: "var(--line-soft)" }}>
                <div
                  className="h-full rounded-l-full"
                  style={{ width: `${Math.round((INDIVIDUAL_STATS.freeCount / INDIVIDUAL_STATS.total) * 100)}%`, background: "var(--line)" }}
                />
                <div className="h-full rounded-r-full flex-1" style={{ background: "var(--forest)" }} />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-500">Plan Breakdown</p>
              {INDIVIDUAL_STATS.plans.map((plan) => (
                <div key={plan.name} className="flex items-center gap-3">
                  <span className="w-14 text-xs text-slate-600 font-medium">{plan.name}</span>
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
            <span className="text-xl font-bold text-slate-900">{ENTERPRISE_STATS.totalAccounts}</span>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Total Ent. Users</p>
                <p className="text-lg font-bold" style={{ color: "#8A6222" }}>{ENTERPRISE_STATS.totalUsers.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Revenue (Month)</p>
                <p className="text-lg font-bold" style={{ color: "var(--sage)" }}>${ENTERPRISE_STATS.revenueThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Searches (Month)</p>
                <p className="text-lg font-bold text-slate-800">{ENTERPRISE_STATS.searchesThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">New This Month</p>
                <p className="text-lg font-bold text-slate-800">+{ENTERPRISE_STATS.newAccountsThisMonth}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Account Health</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" style={{ color: "var(--sage)" }} />
                    Active: {ENTERPRISE_STATS.activeAccounts}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" style={{ color: "var(--rose)" }} />
                    Suspended: {ENTERPRISE_STATS.suspendedAccounts}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: "var(--line-soft)" }}>
                <div
                  className="h-full rounded-l-full"
                  style={{
                    width: `${Math.round((ENTERPRISE_STATS.activeAccounts / ENTERPRISE_STATS.totalAccounts) * 100)}%`,
                    background: "var(--sage)",
                  }}
                />
                <div className="h-full rounded-r-full flex-1" style={{ background: "var(--rose)" }} />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-500">Top Accounts</p>
              {ENTERPRISE_STATS.topAccounts.map((acc) => (
                <div key={acc.name} className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{ background: "var(--gold-dim)", color: "#8A6222" }}
                  >
                    {acc.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-400">{acc.plan} · {acc.users} users</p>
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* ── Row 4: Recent Signups | Tickets | Chats ─────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <SectionHeader title="Recent Signups" href="/users" />
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_SIGNUPS.map((u, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
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
                  <PlanBadge plan={u.plan} />
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.time}</p>
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

        {/* Unread Chats */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <SectionHeader title="Unread Live Chats" href="/live-chat" />
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_CHATS_PREVIEW.map((c, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <div className="relative shrink-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)" }}
                  >
                    {c.initials}
                  </div>
                  {c.unread > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: "var(--rose)" }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800">{c.user}</p>
                    <p className="text-[10px] text-slate-400 shrink-0">{c.last}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.subject}</p>
                  <span
                    className="mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: "var(--gold-dim)", color: "#8A6222", border: "1px solid var(--gold)" }}
                  >
                    waiting
                  </span>
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
