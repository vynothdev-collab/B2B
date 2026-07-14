"use client";

import { useState } from "react";
import { Plus, Check, Pencil, Ban } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { PLANS, ASSIGNMENT_HISTORY } from "@/data/plans";

const TABS = ["All Plans", "Plan Assignment History"];

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState("All Plans");

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

      {activeTab === "All Plans" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none">
              <option>All Plan Types</option><option>Individual</option><option>Enterprise</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Active</option><option>Disabled</option>
            </select>
            <button type="button" className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Plus className="h-4 w-4" /> Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {PLANS.map((plan) => (
              <div key={plan.name} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-400 text-sm">{plan.period}</span>
                    </div>
                  </div>
                  <Badge status={plan.status} />
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.limits.map((limit) => (
                    <li key={limit} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.color}`}>
                        <Check className={`h-3 w-3 ${plan.iconColor}`} />
                      </div>
                      {limit}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <Ban className="h-3.5 w-3.5" /> Disable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "Plan Assignment History" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Account Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Account Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Previous Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">New Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Changed By</th>
                  <th className="px-5 py-3 text-left font-semibold">Date Changed</th>
                  <th className="px-5 py-3 text-left font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {ASSIGNMENT_HISTORY.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.account}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{row.prev}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{row.next}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.changedBy}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.reason}</td>
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
