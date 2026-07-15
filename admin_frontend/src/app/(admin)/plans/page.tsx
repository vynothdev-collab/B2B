"use client";

import React, { useState } from "react";
import { Plus, Pencil, Ban, Search, Users, Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { PLANS, INDIVIDUAL_PLANS, ENTERPRISE_PLANS } from "@/data/plans";

const TABS = ["Individual Plans", "Enterprise Plans"] as const;
type Tab = typeof TABS[number];

function PlansTable({ plans }: { plans: typeof PLANS }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filtered = plans.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || p.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* Search + filter */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans by name..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
          />
        </div>
        <div className="ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Plan Name</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Price</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Searches / mo</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Reveals / mo</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Seats</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">No plans found.</td>
              </tr>
            )}
            {filtered.map((plan) => {
              const searches = plan.limits.find((l) => l.toLowerCase().includes("search")) ?? "—";
              const reveals = plan.limits.find((l) => l.toLowerCase().includes("reveal")) ?? "—";
              const seats = plan.limits.find((l) => l.toLowerCase().includes("seat") || l.toLowerCase().includes("user seat")) ?? "—";
              return (
                <tr key={plan.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${plan.color}`}>
                        <span className={`text-xs font-bold ${plan.iconColor}`}>{plan.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-slate-900">{plan.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-xs text-slate-400 ml-0.5">{plan.period}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{searches}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{reveals}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{seats}</td>
                  <td className="px-5 py-3.5"><Badge status={plan.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button type="button" className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <Ban className="h-3 w-3" /> Disable
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual Plans");

  const isIndividual = activeTab === "Individual Plans";
  const plans = isIndividual ? INDIVIDUAL_PLANS : ENTERPRISE_PLANS;
  const activePlans = plans.filter((p) => p.status === "active").length;
  const inactivePlans = plans.filter((p) => p.status !== "active").length;

  return (
    <div className="space-y-5">

      {/* ── Tabs + Create button ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? `border-b-2 ${tab === "Individual Plans" ? "border-blue-600 text-blue-600" : "border-violet-600 text-violet-600"}`
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`mb-px inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors ${isIndividual ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700"}`}
        >
          <Plus className="h-4 w-4" /> Create Plan
        </button>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isIndividual ? "bg-blue-100" : "bg-violet-100"}`}>
            {isIndividual
              ? <Users className="h-5 w-5 text-blue-600" />
              : <Building2 className="h-5 w-5 text-violet-600" />}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{isIndividual ? "Individual Plans" : "Enterprise Plans"}</p>
            <p className={`text-2xl font-bold mt-0.5 ${isIndividual ? "text-blue-600" : "text-violet-600"}`}>{plans.length}</p>
            <p className="text-xs text-slate-400">{isIndividual ? "Personal account plans" : "Company account plans"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-emerald-600 text-lg font-bold">✓</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Plans</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{activePlans}</p>
            <p className="text-xs text-slate-400">{activePlans === plans.length ? "100% active" : `${Math.round((activePlans / plans.length) * 100)}% active`}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <span className="text-slate-500 text-lg font-bold">—</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inactive Plans</p>
            <p className="text-2xl font-bold text-slate-700 mt-0.5">{inactivePlans}</p>
            <p className="text-xs text-slate-400">Hidden from users</p>
          </div>
        </div>
      </div>

      {/* ── Table Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <PlansTable plans={plans} />
      </div>

    </div>
  );
}
