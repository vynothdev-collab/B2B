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

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const STATUS_COLOR: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

function SectionHeader({ title, href, label = "View All" }: { title: string; href: string; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
        {label} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* ── Row 1: 4 Overview Metric Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OVERVIEW_STATS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-white rounded-xl border ${card.border} shadow-sm p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Row 2: Individual vs Enterprise Breakdown ───────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Individual Users Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Individual Users</h2>
              <p className="text-xs text-slate-400">Personal accounts</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-slate-900">{INDIVIDUAL_STATS.total.toLocaleString()}</span>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Key stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">New This Week</p>
                <p className="text-lg font-bold text-blue-700">+{INDIVIDUAL_STATS.newThisWeek}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Active This Month</p>
                <p className="text-lg font-bold text-emerald-700">{INDIVIDUAL_STATS.activeThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Searches (Month)</p>
                <p className="text-lg font-bold text-slate-800">{INDIVIDUAL_STATS.searchesThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Reveals (Month)</p>
                <p className="text-lg font-bold text-orange-700">{INDIVIDUAL_STATS.revealsThisMonth.toLocaleString()}</p>
              </div>
            </div>

            {/* Free vs Paid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Free vs Paid</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 inline-block" />Free: {INDIVIDUAL_STATS.freeCount}</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />Paid: {INDIVIDUAL_STATS.paidCount}</span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-slate-300 rounded-l-full" style={{ width: `${Math.round((INDIVIDUAL_STATS.freeCount / INDIVIDUAL_STATS.total) * 100)}%` }} />
                <div className="h-full bg-blue-500 rounded-r-full flex-1" />
              </div>
            </div>

            {/* Plan breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan Breakdown</p>
              {INDIVIDUAL_STATS.plans.map((plan) => (
                <div key={plan.name} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-slate-600 font-medium">{plan.name}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${plan.color} rounded-full`} style={{ width: `${plan.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-500">{plan.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Enterprise Accounts</h2>
              <p className="text-xs text-slate-400">Company accounts & teams</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-slate-900">{ENTERPRISE_STATS.totalAccounts}</span>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Key stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Total Ent. Users</p>
                <p className="text-lg font-bold text-violet-700">{ENTERPRISE_STATS.totalUsers.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Revenue (Month)</p>
                <p className="text-lg font-bold text-emerald-700">${ENTERPRISE_STATS.revenueThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Searches (Month)</p>
                <p className="text-lg font-bold text-slate-800">{ENTERPRISE_STATS.searchesThisMonth.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">New This Month</p>
                <p className="text-lg font-bold text-indigo-700">+{ENTERPRISE_STATS.newAccountsThisMonth}</p>
              </div>
            </div>

            {/* Active vs Suspended */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Account Health</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />Active: {ENTERPRISE_STATS.activeAccounts}</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-400" />Suspended: {ENTERPRISE_STATS.suspendedAccounts}</span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${Math.round((ENTERPRISE_STATS.activeAccounts / ENTERPRISE_STATS.totalAccounts) * 100)}%` }} />
                <div className="h-full bg-red-400 rounded-r-full flex-1" />
              </div>
            </div>

            {/* Top enterprise accounts */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Top Accounts</p>
              {ENTERPRISE_STATS.topAccounts.map((acc) => (
                <div key={acc.name} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-700">{acc.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-400">{acc.plan} · {acc.users} users</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${acc.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Alerts ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Alerts & Action Items</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ALERTS.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.label} className={`flex items-start gap-3 rounded-xl border ${alert.border} ${alert.bg} px-4 py-3.5`}>
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/60`}>
                  <Icon className={`h-4 w-4 ${alert.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${alert.color}`}>{alert.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.sub}</p>
                  <Link href={alert.href} className={`mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold ${alert.color} hover:underline`}>
                    {alert.action} <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 4: Recent Signups | Tickets | Chats ─────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <SectionHeader title="Recent Signups" href="/users" />
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_SIGNUPS.map((u, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${u.type === "Enterprise" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${u.plan === "Free" ? "bg-slate-100 text-slate-500" : u.plan === "Pro" ? "bg-blue-100 text-blue-700" : u.plan === "Business" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {u.plan}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <SectionHeader title="Recent Tickets" href="/tickets" />
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_TICKETS_PREVIEW.map((t, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-semibold text-blue-600">{t.id}</span>
                  <div className="flex items-center gap-1">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_COLOR[t.priority] ?? "bg-slate-100 text-slate-500"}`}>{t.priority}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[t.status] ?? "bg-slate-100 text-slate-500"}`}>{t.status.replace("_", " ")}</span>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <SectionHeader title="Unread Live Chats" href="/live-chat" />
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_CHATS_PREVIEW.map((c, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className="relative">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{c.initials}</div>
                  {c.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{c.unread}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800">{c.user}</p>
                    <p className="text-[10px] text-slate-400 shrink-0">{c.last}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.subject}</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">waiting</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 5: Recent Activity ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          <span className="text-xs text-slate-400">Last 24 hours</span>
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
              <p className="flex-1 text-sm text-slate-700">{item.text}</p>
              <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
