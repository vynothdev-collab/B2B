"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { OVERVIEW_CARDS, INDIVIDUAL_CREDITS, ENTERPRISE_CREDITS, ADJUSTMENT_LOG } from "@/data/credits";

const TABS = ["Overview", "Individual Credits", "Enterprise Credits", "Adjustment Log"];

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {OVERVIEW_CARDS.map((card) => (
            <div key={card.label} className={`rounded-xl border ${card.border} ${card.bg} p-5`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Individual Credits" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search users..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Plans</option><option>Free</option><option>Pro</option><option>Business</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Healthy</option><option>Low</option><option>Exceeded</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Monthly Limit</th>
                  <th className="px-5 py-3 text-left font-semibold">Used</th>
                  <th className="px-5 py-3 text-left font-semibold">Remaining</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {INDIVIDUAL_CREDITS.map((u, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{u.initials}</div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{u.plan}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.limit.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.used.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{Math.max(0, u.limit - u.used).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><Badge status={u.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Add Credits</button>
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">History</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Enterprise Credits" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search enterprises..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Company</th>
                  <th className="px-5 py-3 text-left font-semibold">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Monthly Limit</th>
                  <th className="px-5 py-3 text-left font-semibold">Used</th>
                  <th className="px-5 py-3 text-left font-semibold">Remaining</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENTERPRISE_CREDITS.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">{e.initials}</div>
                        <span className="font-medium text-slate-800">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{e.plan}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.limit.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.used.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{Math.max(0, e.limit - e.used).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><Badge status={e.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Add Credits</button>
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">History</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Adjustment Log" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">All manual credit adjustments</p>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Plus className="h-4 w-4" /> Add Adjustment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Account</th>
                  <th className="px-5 py-3 text-left font-semibold">Account Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Adjustment</th>
                  <th className="px-5 py-3 text-left font-semibold">Amount</th>
                  <th className="px-5 py-3 text-left font-semibold">Reason</th>
                  <th className="px-5 py-3 text-left font-semibold">Adjusted By</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {ADJUSTMENT_LOG.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.account}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><Badge status={row.adjType} /></td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{row.adjType === "added" ? "+" : "-"}{row.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.reason}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.by}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
