"use client";

import { useState } from "react";
import { Plus, Users, Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { OFFERS, INDIVIDUAL_OFFERS, ENTERPRISE_OFFERS, REDEMPTION_HISTORY, INDIVIDUAL_REDEMPTIONS, ENTERPRISE_REDEMPTIONS } from "@/data/offers";

const TABS = ["All Offers", "Individual Offers", "Enterprise Offers", "Redemption History"];

function TypeBadge({ accountType }: { accountType: string }) {
  if (accountType === "Individual") return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><Users className="h-2.5 w-2.5" />Individual</span>;
  if (accountType === "Enterprise") return <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-semibold text-violet-700"><Building2 className="h-2.5 w-2.5" />Enterprise</span>;
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">All Users</span>;
}

function OffersTable({ rows, showType = false }: { rows: typeof OFFERS; showType?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-medium text-slate-500">
            <th className="px-4 py-2.5 text-left">Offer Name</th>
            {showType && <th className="px-4 py-2.5 text-left">For</th>}
            <th className="px-4 py-2.5 text-left">Code</th>
            <th className="px-4 py-2.5 text-left">Type</th>
            <th className="px-4 py-2.5 text-left">Value</th>
            <th className="px-4 py-2.5 text-left">Plans</th>
            <th className="px-4 py-2.5 text-left">Valid From</th>
            <th className="px-4 py-2.5 text-left">Valid Until</th>
            <th className="px-4 py-2.5 text-left">Usage</th>
            <th className="px-4 py-2.5 text-left">Status</th>
            <th className="px-4 py-2.5 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((offer, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{offer.name}</td>
              {showType && <td className="px-4 py-3"><TypeBadge accountType={offer.accountType} /></td>}
              <td className="px-4 py-3">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">{offer.code}</code>
              </td>
              <td className="px-4 py-3 text-slate-600">{offer.type}</td>
              <td className="px-4 py-3 font-semibold text-emerald-700">{offer.value}</td>
              <td className="px-4 py-3 text-slate-500">{offer.plans}</td>
              <td className="px-4 py-3 text-slate-500">{offer.from}</td>
              <td className="px-4 py-3 text-slate-500">{offer.until}</td>
              <td className="px-4 py-3 text-slate-600">{offer.used} / {offer.limit}</td>
              <td className="px-4 py-3"><Badge status={offer.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                  <button type="button" className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Deactivate</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RedemptionTable({ rows }: { rows: typeof REDEMPTION_HISTORY }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-medium text-slate-500">
            <th className="px-4 py-2.5 text-left">Account</th>
            <th className="px-4 py-2.5 text-left">Type</th>
            <th className="px-4 py-2.5 text-left">Offer Name</th>
            <th className="px-4 py-2.5 text-left">Code</th>
            <th className="px-4 py-2.5 text-left">Discount Applied</th>
            <th className="px-4 py-2.5 text-left">Plan</th>
            <th className="px-4 py-2.5 text-left">Date</th>
            <th className="px-4 py-2.5 text-left">Invoice</th>
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
              <td className="px-4 py-3 text-slate-700">{row.offer}</td>
              <td className="px-4 py-3">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">{row.code}</code>
              </td>
              <td className="px-4 py-3 font-medium text-emerald-700">{row.discount}</td>
              <td className="px-4 py-3 text-slate-600">{row.plan}</td>
              <td className="px-4 py-3 text-slate-500">{row.date}</td>
              <td className="px-4 py-3 text-slate-500 text-xs font-mono">{row.invoice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("All Offers");
  const [redemptionFilter, setRedemptionFilter] = useState<"All" | "Individual" | "Enterprise">("All");

  const redemptionRows = redemptionFilter === "Individual" ? INDIVIDUAL_REDEMPTIONS : redemptionFilter === "Enterprise" ? ENTERPRISE_REDEMPTIONS : REDEMPTION_HISTORY;

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── All Offers ───────────────────────────────────────────────── */}
      {activeTab === "All Offers" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option><option>All Users</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Statuses</option><option>Active</option><option>Expired</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Offer Types</option><option>Percentage Off</option><option>Fixed Amount</option><option>Free Trial</option><option>Bonus Credits</option>
            </select>
            <button type="button" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Create Offer
            </button>
          </div>
          <OffersTable rows={OFFERS} showType />
        </div>
      )}

      {/* ── Individual Offers ────────────────────────────────────────── */}
      {activeTab === "Individual Offers" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Individual Offers</p>
                <p className="text-xs text-slate-400">Discounts and promotions for personal accounts</p>
              </div>
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Create Individual Offer
            </button>
          </div>
          <OffersTable rows={INDIVIDUAL_OFFERS} />
        </div>
      )}

      {/* ── Enterprise Offers ────────────────────────────────────────── */}
      {activeTab === "Enterprise Offers" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Enterprise Offers</p>
                <p className="text-xs text-slate-400">Deals and promotions for company accounts</p>
              </div>
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              <Plus className="h-4 w-4" /> Create Enterprise Offer
            </button>
          </div>
          <OffersTable rows={ENTERPRISE_OFFERS} />
        </div>
      )}

      {/* ── Redemption History ───────────────────────────────────────── */}
      {activeTab === "Redemption History" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">All offer redemptions across individual and enterprise accounts.</p>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {(["All", "Individual", "Enterprise"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setRedemptionFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${redemptionFilter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <RedemptionTable rows={redemptionRows} />
        </div>
      )}
    </div>
  );
}
