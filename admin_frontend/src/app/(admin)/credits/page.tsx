"use client";

import { useState } from "react";
import { Search, Link2, TrendingUp, Coins, BarChart3 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { INDIVIDUAL_CREDITS, ENTERPRISE_CREDITS } from "@/data/credits";

const TABS = ["Individual Credits", "Enterprise Credits"] as const;
type Tab = typeof TABS[number];

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual Credits");

  const isIndividual = activeTab === "Individual Credits";

  const indOutstanding = INDIVIDUAL_CREDITS.reduce((s, u) => s + Math.max(0, u.limit - u.used), 0);
  const indUsed        = INDIVIDUAL_CREDITS.reduce((s, u) => s + u.used, 0);
  const indLimit       = INDIVIDUAL_CREDITS.reduce((s, u) => s + u.limit, 0);

  const entOutstanding = ENTERPRISE_CREDITS.reduce((s, e) => s + Math.max(0, e.limit - e.used), 0);
  const entUsed        = ENTERPRISE_CREDITS.reduce((s, e) => s + e.used, 0);
  const entLimit       = ENTERPRISE_CREDITS.reduce((s, e) => s + e.limit, 0);

  const outstanding = isIndividual ? indOutstanding : entOutstanding;
  const used        = isIndividual ? indUsed : entUsed;
  const limit       = isIndividual ? indLimit : entLimit;
  const usageRate   = limit > 0 ? Math.round((used / limit) * 100) : 0;

  const accent = isIndividual ? "blue" : "violet";

  return (
    <div className="space-y-5">

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? `border-b-2 ${isIndividual ? "border-blue-600 text-blue-600" : "border-violet-600 text-violet-600"}`
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent === "blue" ? "bg-blue-100" : "bg-violet-100"}`}>
            <Link2 className={`h-5 w-5 ${accent === "blue" ? "text-blue-600" : "text-violet-600"}`} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Outstanding Balance</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{outstanding.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100">
            <TrendingUp className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Lifetime Used</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{used.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Coins className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Allocated</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{limit.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <BarChart3 className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Usage Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{usageRate}%</p>
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
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
                />
              </div>
              <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
                <option>All Plans</option><option>Free</option><option>Pro</option><option>Business</option>
              </select>
              <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
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
                  {INDIVIDUAL_CREDITS.map((u, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{u.initials}</div>
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
                          <button type="button" className="rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Add Credits</button>
                          <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">History</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-50"
                />
              </div>
              <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-50">
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
                  {ENTERPRISE_CREDITS.map((e, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">{e.initials}</div>
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
                          <button type="button" className="rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Add Credits</button>
                          <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">History</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
