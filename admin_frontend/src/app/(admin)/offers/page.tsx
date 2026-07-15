"use client";

import { useState } from "react";
import { Plus, Globe, UserCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import {
  INDIVIDUAL_PLAN_DISCOUNTS,
  INDIVIDUAL_USER_DISCOUNTS,
  ENTERPRISE_PLAN_DISCOUNTS,
  ENTERPRISE_USER_DISCOUNTS,
  type PlanDiscount,
  type UserDiscount,
} from "@/data/offers";

const TABS = ["Individual Offers", "Enterprise Offers"] as const;
type Tab = typeof TABS[number];

type MergedRow =
  | (PlanDiscount & { scope: "plan" })
  | (UserDiscount & { scope: "user" });

function merge(plans: PlanDiscount[], users: UserDiscount[]): MergedRow[] {
  return [
    ...plans.map((p) => ({ ...p, scope: "plan" as const })),
    ...users.map((u) => ({ ...u, scope: "user" as const })),
  ];
}

function CombinedTable({ rows, accent }: { rows: MergedRow[]; accent: "blue" | "violet" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
            <th className="px-4 py-2.5 text-left">Offer Name</th>
            <th className="px-4 py-2.5 text-left">Scope</th>
            <th className="px-4 py-2.5 text-left">Discount Type</th>
            <th className="px-4 py-2.5 text-left">Value</th>
            <th className="px-4 py-2.5 text-left">Applies To</th>
            <th className="px-4 py-2.5 text-left">Valid From</th>
            <th className="px-4 py-2.5 text-left">Valid Until</th>
            <th className="px-4 py-2.5 text-left">Status</th>
            <th className="px-4 py-2.5 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>

              <td className="px-4 py-3">
                {row.scope === "plan" ? (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${accent === "blue" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>
                    <Globe className="h-2.5 w-2.5" /> Plan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <UserCheck className="h-2.5 w-2.5" /> User
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-slate-600">{row.discountType}</td>

              <td className="px-4 py-3 font-mono font-semibold text-emerald-700">{row.value}</td>

              <td className="px-4 py-3">
                {row.scope === "plan" ? (
                  <span className="text-xs text-slate-500">{row.plans}</span>
                ) : (
                  <div>
                    <p className="font-medium text-slate-800">{row.targetUser}</p>
                    <p className="text-xs text-slate-400">{row.targetEmail}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{row.plan}</p>
                  </div>
                )}
              </td>

              <td className="px-4 py-3 text-slate-500">{row.from}</td>
              <td className="px-4 py-3 text-slate-500">{row.until}</td>
              <td className="px-4 py-3"><Badge status={row.status} /></td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                  <button type="button" className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    {row.scope === "plan" ? "Deactivate" : "Revoke"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual Offers");
  const OFF_PER_PAGE = 8;
  const [offPage, setOffPage] = useState(1);

  const isIndividual = activeTab === "Individual Offers";
  const accent = isIndividual ? "blue" : "violet";

  const planDiscounts = isIndividual ? INDIVIDUAL_PLAN_DISCOUNTS : ENTERPRISE_PLAN_DISCOUNTS;
  const userDiscounts = isIndividual ? INDIVIDUAL_USER_DISCOUNTS : ENTERPRISE_USER_DISCOUNTS;
  const rows = merge(planDiscounts, userDiscounts);
  const pageRows = rows.slice((offPage-1)*OFF_PER_PAGE, offPage*OFF_PER_PAGE);

  const activePlan  = planDiscounts.filter((o) => o.status === "active").length;
  const activeUser  = userDiscounts.filter((o) => o.status === "active").length;

  return (
    <div className="space-y-5">

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setOffPage(1); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? `border-b-2 ${tab === "Enterprise Offers" ? "border-violet-600 text-violet-600" : "border-blue-600 text-blue-600"}`
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
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isIndividual ? "bg-blue-100" : "bg-violet-100"}`}>
            <Globe className={`h-5 w-5 ${isIndividual ? "text-blue-600" : "text-violet-600"}`} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{fontFamily:"var(--font-mono)",color:"var(--ink-faint)"}}>Plan Discounts</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{planDiscounts.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <UserCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{fontFamily:"var(--font-mono)",color:"var(--ink-faint)"}}>User Discounts</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{userDiscounts.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-emerald-600 text-base font-bold">✓</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{fontFamily:"var(--font-mono)",color:"var(--ink-faint)"}}>Active Plan Offers</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{activePlan}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-emerald-600 text-base font-bold">✓</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{fontFamily:"var(--font-mono)",color:"var(--ink-faint)"}}>Active User Offers</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeUser}</p>
          </div>
        </div>
      </div>

      {/* ── Combined Table Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">All Offers</p>
            <p className="text-xs text-slate-400">Plan-wide discounts and targeted user discounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${isIndividual ? "border-blue-200 text-blue-700 hover:bg-blue-50" : "border-violet-200 text-violet-700 hover:bg-violet-50"}`}
            >
              <Globe className="h-3.5 w-3.5" /> Create Plan Discount
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors ${isIndividual ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700"}`}
            >
              <Plus className="h-3.5 w-3.5" /> Create User Discount
            </button>
          </div>
        </div>
        <CombinedTable rows={pageRows} accent={accent} />
        <Pagination total={rows.length} perPage={OFF_PER_PAGE} page={offPage} onChange={setOffPage} itemLabel="offers" />
      </div>

    </div>
  );
}
