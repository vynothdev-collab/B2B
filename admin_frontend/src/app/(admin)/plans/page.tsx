"use client";

import { useState } from "react";
import { Plus, Check, Pencil, Ban, Users, Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { INDIVIDUAL_PLANS, ENTERPRISE_PLANS, ASSIGNMENT_HISTORY, INDIVIDUAL_HISTORY, ENTERPRISE_HISTORY } from "@/data/plans";

const TABS = ["Individual Plans", "Enterprise Plans", "Assignment History"];

function PlanCard({ plan }: { plan: typeof INDIVIDUAL_PLANS[number] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
            {plan.period && <span className="text-slate-400 text-sm">{plan.period}</span>}
          </div>
        </div>
        <Badge status={plan.status} />
      </div>
      <ul className="space-y-2 mb-5">
        {plan.limits.map((limit) => (
          <li key={limit} className="flex items-center gap-2 text-sm text-slate-600">
            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${plan.color}`}>
              <Check className={`h-2.5 w-2.5 ${plan.iconColor}`} />
            </div>
            {limit}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
          <Ban className="h-3 w-3" /> Disable
        </button>
      </div>
    </div>
  );
}

function HistoryTable({ rows }: { rows: typeof ASSIGNMENT_HISTORY }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-medium text-slate-500">
            <th className="px-4 py-2.5 text-left">Account Name</th>
            <th className="px-4 py-2.5 text-left">Account Type</th>
            <th className="px-4 py-2.5 text-left">Previous Plan</th>
            <th className="px-4 py-2.5 text-left">New Plan</th>
            <th className="px-4 py-2.5 text-left">Changed By</th>
            <th className="px-4 py-2.5 text-left">Date Changed</th>
            <th className="px-4 py-2.5 text-left">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{row.account}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {row.type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{row.prev}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.next}</td>
              <td className="px-4 py-3 text-slate-600">{row.changedBy}</td>
              <td className="px-4 py-3 text-slate-500">{row.date}</td>
              <td className="px-4 py-3 text-slate-500">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState("Individual Plans");
  const [historyFilter, setHistoryFilter] = useState<"All" | "Individual" | "Enterprise">("All");

  const historyRows = historyFilter === "Individual" ? INDIVIDUAL_HISTORY : historyFilter === "Enterprise" ? ENTERPRISE_HISTORY : ASSIGNMENT_HISTORY;

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Individual Plans ─────────────────────────────────────────── */}
      {activeTab === "Individual Plans" && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Individual / Personal Account Plans</p>
                <p className="text-xs text-slate-400">Free, Pro & Business plans for single users</p>
              </div>
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Create Plan
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {INDIVIDUAL_PLANS.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </>
      )}

      {/* ── Enterprise Plans ─────────────────────────────────────────── */}
      {activeTab === "Enterprise Plans" && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Enterprise / Company Account Plans</p>
                <p className="text-xs text-slate-400">Multi-seat plans for teams and organisations</p>
              </div>
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              <Plus className="h-4 w-4" /> Create Plan
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ENTERPRISE_PLANS.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </>
      )}

      {/* ── Assignment History ───────────────────────────────────────── */}
      {activeTab === "Assignment History" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">All plan changes across individual and enterprise accounts.</p>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {(["All", "Individual", "Enterprise"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setHistoryFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${historyFilter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <HistoryTable rows={historyRows} />
        </div>
      )}
    </div>
  );
}
