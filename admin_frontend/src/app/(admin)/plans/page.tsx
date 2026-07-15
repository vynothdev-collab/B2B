"use client";

import React, { useState } from "react";
import { Plus, Pencil, Ban, Search, Users, Building2, CheckCircle2, MinusCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { PLANS, INDIVIDUAL_PLANS, ENTERPRISE_PLANS } from "@/data/plans";

const TABS = ["Individual Plans", "Enterprise Plans"] as const;
type Tab = typeof TABS[number];

function PlansTable({ plans, isIndividual }: { plans: typeof PLANS; isIndividual: boolean }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [planPage, setPlanPage] = useState(1);
  const PER_PAGE = 6;

  const filtered = plans.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || p.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((planPage - 1) * PER_PAGE, planPage * PER_PAGE);

  return (
    <>
      {/* Search + filter */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPlanPage(1); }}
            placeholder="Search plans by name..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = isIndividual ? "var(--forest)" : "var(--gold)";
              e.currentTarget.style.boxShadow = isIndividual
                ? "0 0 0 3px rgba(23,50,41,.10)"
                : "0 0 0 3px var(--gold-dim)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          />
        </div>
        <div className="ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPlanPage(1); }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = isIndividual ? "var(--forest)" : "var(--gold)";
              e.currentTarget.style.boxShadow = isIndividual
                ? "0 0 0 3px rgba(23,50,41,.10)"
                : "0 0 0 3px var(--gold-dim)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
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
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                  No plans found.
                </td>
              </tr>
            )}
            {paginated.map((plan) => {
              const searches = plan.limits.find((l) => l.toLowerCase().includes("search")) ?? "—";
              const reveals  = plan.limits.find((l) => l.toLowerCase().includes("reveal")) ?? "—";
              const seats    = plan.limits.find((l) => l.toLowerCase().includes("seat") || l.toLowerCase().includes("user seat")) ?? "—";
              return (
                <tr key={plan.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: plan.iconBg }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: plan.iconColor, fontFamily: "var(--font-fraunces)" }}
                        >
                          {plan.name.charAt(0)}
                        </span>
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
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                        style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                        style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
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
      <Pagination total={filtered.length} perPage={PER_PAGE} page={planPage} onChange={setPlanPage} itemLabel="plans" />
    </>
  );
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual Plans");

  const isIndividual = activeTab === "Individual Plans";
  const plans = isIndividual ? INDIVIDUAL_PLANS : ENTERPRISE_PLANS;
  const activePlans   = plans.filter((p) => p.status === "active").length;
  const inactivePlans = plans.filter((p) => p.status !== "active").length;

  /* per-tab accent tokens */
  const accent = isIndividual
    ? { bg: "var(--forest)", iconColor: "#EFEAD9", dimBg: "rgba(23,50,41,.08)", textColor: "var(--forest)", ringColor: "rgba(23,50,41,.10)" }
    : { bg: "var(--gold)",   iconColor: "#3C2400",  dimBg: "var(--gold-dim)",   textColor: "#8A6222",        ringColor: "var(--gold-dim)"    };

  return (
    <div className="space-y-5">

      {/* ── Tabs + Create button ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isInd    = tab === "Individual Plans";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-sm font-medium transition-colors"
                style={
                  isActive
                    ? {
                        borderBottom: `2px solid ${isInd ? "var(--forest)" : "var(--gold)"}`,
                        color: isInd ? "var(--forest)" : "#8A6222",
                      }
                    : { color: "var(--ink-faint)" }
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mb-px inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
          style={{ background: accent.bg, color: accent.iconColor }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          }}
        >
          <Plus className="h-4 w-4" /> Create Plan
        </button>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* Total plans card */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: accent.dimBg }}
          >
            {isIndividual
              ? <Users className="h-5 w-5" style={{ color: accent.bg }} />
              : <Building2 className="h-5 w-5" style={{ color: accent.textColor }} />
            }
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
              {isIndividual ? "Individual Plans" : "Enterprise Plans"}
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: accent.textColor }}>{plans.length}</p>
            <p className="text-xs text-slate-400">{isIndividual ? "Personal account plans" : "Company account plans"}</p>
          </div>
        </div>

        {/* Active plans card */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
              Active Plans
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>{activePlans}</p>
            <p className="text-xs text-slate-400">
              {activePlans === plans.length ? "100% active" : `${Math.round((activePlans / plans.length) * 100)}% active`}
            </p>
          </div>
        </div>

        {/* Inactive plans card */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--line-soft)" }}>
            <MinusCircle className="h-5 w-5" style={{ color: "var(--ink-faint)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
              Inactive Plans
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--ink-dim)" }}>{inactivePlans}</p>
            <p className="text-xs text-slate-400">Hidden from users</p>
          </div>
        </div>
      </div>

      {/* ── Table Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <PlansTable plans={plans} isIndividual={isIndividual} />
      </div>

    </div>
  );
}
