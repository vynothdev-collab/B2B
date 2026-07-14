"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { OFFERS, REDEMPTION_HISTORY } from "@/data/offers";

const TABS = ["All Offers", "Redemption History"];

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("All Offers");

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

      {activeTab === "All Offers" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Active</option><option>Expired</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Offer Types</option><option>Percentage Off</option><option>Fixed Amount</option><option>Free Trial</option><option>Bonus Credits</option>
            </select>
            <button type="button" className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Plus className="h-4 w-4" /> Create Offer
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Offer Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Code</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Value</th>
                  <th className="px-5 py-3 text-left font-semibold">Plans</th>
                  <th className="px-5 py-3 text-left font-semibold">Valid From</th>
                  <th className="px-5 py-3 text-left font-semibold">Valid Until</th>
                  <th className="px-5 py-3 text-left font-semibold">Usage</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {OFFERS.map((offer, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{offer.name}</td>
                    <td className="px-5 py-3.5">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">{offer.code}</code>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{offer.type}</td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-700">{offer.value}</td>
                    <td className="px-5 py-3.5 text-slate-500">{offer.plans}</td>
                    <td className="px-5 py-3.5 text-slate-500">{offer.from}</td>
                    <td className="px-5 py-3.5 text-slate-500">{offer.until}</td>
                    <td className="px-5 py-3.5 text-slate-600">{offer.used} / {offer.limit}</td>
                    <td className="px-5 py-3.5"><Badge status={offer.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Deactivate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Redemption History" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Account</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Offer Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Code</th>
                  <th className="px-5 py-3 text-left font-semibold">Discount Applied</th>
                  <th className="px-5 py-3 text-left font-semibold">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {REDEMPTION_HISTORY.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.account}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{row.offer}</td>
                    <td className="px-5 py-3.5">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">{row.code}</code>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-emerald-700">{row.discount}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.plan}</td>
                    <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{row.invoice}</td>
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
