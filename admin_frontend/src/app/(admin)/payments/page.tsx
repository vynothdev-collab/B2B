"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { INDIVIDUAL_TXN, ENTERPRISE_TXN, REVENUE_PLANS, REVENUE_CARDS } from "@/data/payments";

const TABS = ["Individual", "Enterprise", "Revenue Summary"] as const;
type Tab = typeof TABS[number];

function TransactionTable({ rows }: { rows: typeof INDIVIDUAL_TXN }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-medium text-slate-500">
            <th className="px-4 py-2.5 text-left">Invoice #</th>
            <th className="px-4 py-2.5 text-left">Account</th>
            <th className="px-4 py-2.5 text-left">Type</th>
            <th className="px-4 py-2.5 text-left">Plan</th>
            <th className="px-4 py-2.5 text-left">Amount</th>
            <th className="px-4 py-2.5 text-left">Discount</th>
            <th className="px-4 py-2.5 text-left">Final</th>
            <th className="px-4 py-2.5 text-left">Method</th>
            <th className="px-4 py-2.5 text-left">Date</th>
            <th className="px-4 py-2.5 text-left">Status</th>
            <th className="px-4 py-2.5 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-xs font-mono text-slate-600">{row.inv}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{row.account}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {row.type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.plan}</td>
              <td className="px-4 py-3 text-slate-600">{row.amount}</td>
              <td className="px-4 py-3 text-emerald-600">{row.discount !== "$0" ? row.discount : <span className="text-slate-400">—</span>}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{row.final}</td>
              <td className="px-4 py-3 text-slate-500">{row.method}</td>
              <td className="px-4 py-3 text-slate-500">{row.date}</td>
              <td className="px-4 py-3"><Badge status={row.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">View</button>
                  <button type="button" className="rounded-md border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors">Refund</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual");
  const isIndividual = activeTab === "Individual";

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? `border-b-2 ${tab === "Enterprise" ? "border-violet-600 text-violet-600" : "border-blue-600 text-blue-600"}`
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {(activeTab === "Individual" || activeTab === "Enterprise") && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder={`Search by account or invoice...`}
                className={`w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${isIndividual ? "focus:border-blue-500 focus:ring-blue-50" : "focus:border-violet-500 focus:ring-violet-50"}`}
              />
            </div>
            <select className={`h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 ${isIndividual ? "focus:border-blue-500 focus:ring-blue-50" : "focus:border-violet-500 focus:ring-violet-50"}`}>
              <option>All Statuses</option><option>Paid</option><option>Pending</option><option>Failed</option>
            </select>
            <select className={`h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 ${isIndividual ? "focus:border-blue-500 focus:ring-blue-50" : "focus:border-violet-500 focus:ring-violet-50"}`}>
              <option>All Time</option><option>This Month</option><option>Last Month</option><option>This Year</option>
            </select>
          </div>
          <TransactionTable rows={isIndividual ? INDIVIDUAL_TXN : ENTERPRISE_TXN} />
        </div>
      )}

      {activeTab === "Revenue Summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVENUE_CARDS.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-medium text-slate-500 mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Revenue by Plan — This Month</h3>
            <div className="space-y-5">
              {REVENUE_PLANS.map((plan) => {
                const pct = Math.round((plan.revenue / 25000) * 100);
                return (
                  <div key={plan.plan} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-sm ${plan.color}`} />
                        <span className="text-sm font-medium text-slate-700">{plan.plan}</span>
                        <span className="text-xs text-slate-400">({plan.count} accounts)</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">${plan.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${plan.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
