"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { ALL_TRANSACTIONS, INDIVIDUAL_TXN, ENTERPRISE_TXN, REFUNDS, REVENUE_PLANS, REVENUE_CARDS } from "@/data/payments";

const TABS = ["All Transactions", "Individual", "Enterprise", "Refunds", "Revenue Summary"];

function TransactionTable({ rows }: { rows: typeof ALL_TRANSACTIONS }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 text-left font-semibold">Invoice #</th>
            <th className="px-5 py-3 text-left font-semibold">Account</th>
            <th className="px-5 py-3 text-left font-semibold">Type</th>
            <th className="px-5 py-3 text-left font-semibold">Plan</th>
            <th className="px-5 py-3 text-left font-semibold">Amount</th>
            <th className="px-5 py-3 text-left font-semibold">Discount</th>
            <th className="px-5 py-3 text-left font-semibold">Final</th>
            <th className="px-5 py-3 text-left font-semibold">Method</th>
            <th className="px-5 py-3 text-left font-semibold">Date</th>
            <th className="px-5 py-3 text-left font-semibold">Status</th>
            <th className="px-5 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-5 py-3.5 text-xs font-mono text-slate-600">{row.inv}</td>
              <td className="px-5 py-3.5 font-medium text-slate-800">{row.account}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {row.type}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-700">{row.plan}</td>
              <td className="px-5 py-3.5 text-slate-600">{row.amount}</td>
              <td className="px-5 py-3.5 text-emerald-600">{row.discount !== "$0" ? row.discount : <span className="text-slate-400">—</span>}</td>
              <td className="px-5 py-3.5 font-semibold text-slate-900">{row.final}</td>
              <td className="px-5 py-3.5 text-slate-500">{row.method}</td>
              <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
              <td className="px-5 py-3.5"><Badge status={row.status} /></td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">View</button>
                  <button type="button" className="rounded-md border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Refund</button>
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
  const [activeTab, setActiveTab] = useState("All Transactions");

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {(activeTab === "All Transactions" || activeTab === "Individual" || activeTab === "Enterprise") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search by account or invoice..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            {activeTab === "All Transactions" && (
              <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
                <option>All Account Types</option><option>Individual</option><option>Enterprise</option>
              </select>
            )}
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Paid</option><option>Pending</option><option>Failed</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Time</option><option>This Month</option><option>Last Month</option><option>This Year</option>
            </select>
          </div>
          <TransactionTable
            rows={
              activeTab === "Individual"
                ? INDIVIDUAL_TXN
                : activeTab === "Enterprise"
                ? ENTERPRISE_TXN
                : ALL_TRANSACTIONS
            }
          />
        </div>
      )}

      {activeTab === "Refunds" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Refund Ref</th>
                  <th className="px-5 py-3 text-left font-semibold">Original Invoice</th>
                  <th className="px-5 py-3 text-left font-semibold">Account</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Amount</th>
                  <th className="px-5 py-3 text-left font-semibold">Reason</th>
                  <th className="px-5 py-3 text-left font-semibold">Refunded By</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {REFUNDS.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-600">{r.ref}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{r.invoice}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{r.account}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.amount}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.reason}</td>
                    <td className="px-5 py-3.5 text-slate-600">{r.by}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.date}</td>
                    <td className="px-5 py-3.5"><Badge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Revenue Summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVENUE_CARDS.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
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
                    <div className="h-2.5 w-full rounded-full bg-slate-100">
                      <div className={`h-2.5 rounded-full ${plan.color}`} style={{ width: `${pct}%` }} />
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
