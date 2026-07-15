"use client";

import { useState } from "react";
import { Search, Banknote, CheckCircle2, AlertCircle, Receipt } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { INDIVIDUAL_TXN, ENTERPRISE_TXN, REVENUE_PLANS, REVENUE_CARDS } from "@/data/payments";

const TABS = ["Individual", "Enterprise", "Revenue Summary"] as const;
type Tab = typeof TABS[number];

function makeFocusHandlers(isIndividual: boolean) {
  const ring   = isIndividual ? "rgba(23,50,41,.10)" : "var(--gold-dim)";
  const border = isIndividual ? "var(--forest)"      : "var(--gold)";
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = border;
      e.currentTarget.style.boxShadow  = `0 0 0 3px ${ring}`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = "";
      e.currentTarget.style.boxShadow   = "";
    },
  };
}

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
              <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--ink-dim)" }}>{row.inv}</td>
              <td className="px-4 py-3 font-medium" style={{ color: "var(--ink)" }}>{row.account}</td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={row.type === "Enterprise"
                    ? { background: "var(--gold-dim)", color: "#8A6222", border: "1px solid var(--gold)" }
                    : { background: "rgba(23,50,41,.06)", color: "var(--forest)", border: "1px solid rgba(23,50,41,.20)" }
                  }
                >
                  {row.type}
                </span>
              </td>
              <td className="px-4 py-3" style={{ color: "var(--ink-dim)" }}>{row.plan}</td>
              <td className="px-4 py-3 font-mono text-sm" style={{ color: "var(--ink-dim)" }}>{row.amount}</td>
              <td className="px-4 py-3 font-mono text-sm">
                {row.discount !== "$0" ? (
                  <span style={{ color: "var(--sage-dark, #3E6A44)" }}>{row.discount}</span>
                ) : (
                  <span style={{ color: "var(--ink-faint)" }}>—</span>
                )}
              </td>
              <td className="px-4 py-3 font-mono font-semibold text-sm" style={{ color: "var(--ink)" }}>{row.final}</td>
              <td className="px-4 py-3 text-sm" style={{ color: "var(--ink-faint)" }}>{row.method}</td>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--ink-faint)" }}>{row.date}</td>
              <td className="px-4 py-3"><Badge status={row.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    Refund
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

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Individual");
  const TXN_PER_PAGE = 8;
  const [txnPage, setTxnPage] = useState(1);
  const isIndividual = activeTab === "Individual";

  const accent = isIndividual
    ? { bg: "var(--forest)", dimBg: "rgba(23,50,41,.08)", text: "var(--forest)" }
    : { bg: "var(--gold)",   dimBg: "var(--gold-dim)",   text: "#8A6222"        };

  const focus = makeFocusHandlers(isIndividual);

  const txnRows   = isIndividual ? INDIVIDUAL_TXN : ENTERPRISE_TXN;
  const totalRevenue = txnRows
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + parseFloat(t.final.replace(/[$,]/g, "")), 0);
  const paidCount   = txnRows.filter((t) => t.status === "paid").length;
  const failedCount = txnRows.filter((t) => t.status !== "paid").length;

  return (
    <div className="space-y-5">
      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isInd    = tab === "Individual";
            const isEnt    = tab === "Enterprise";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setTxnPage(1); }}
                className="shrink-0 px-4 py-2.5 text-sm font-medium transition-colors"
                style={
                  isActive
                    ? {
                        borderBottom: `2px solid ${isInd ? "var(--forest)" : isEnt ? "var(--gold)" : "var(--ink-dim)"}`,
                        color: isInd ? "var(--forest)" : isEnt ? "#8A6222" : "var(--ink-dim)",
                      }
                    : { color: "var(--ink-faint)" }
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stat Cards (Individual / Enterprise tabs only) ───────────── */}
      {(activeTab === "Individual" || activeTab === "Enterprise") && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: accent.dimBg }}>
              <Receipt className="h-5 w-5" style={{ color: accent.bg }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Transactions</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: accent.text }}>{txnRows.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">All time records</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
              <Banknote className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Revenue Collected</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-slate-400 mt-0.5">From paid invoices</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Paid</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>{paidCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Successful payments</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--rust-dim)" }}>
              <AlertCircle className="h-5 w-5" style={{ color: "var(--rust)" }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Failed / Pending</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--rust)" }}>{failedCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Require attention</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction Table ─────────────────────────────────────────── */}
      {(activeTab === "Individual" || activeTab === "Enterprise") && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by account or invoice..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                {...focus}
              />
            </div>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focus}>
              <option>All Statuses</option><option>Paid</option><option>Pending</option><option>Failed</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focus}>
              <option>All Time</option><option>This Month</option><option>Last Month</option><option>This Year</option>
            </select>
          </div>
          {(() => {
            const pageRows = txnRows.slice((txnPage - 1) * TXN_PER_PAGE, txnPage * TXN_PER_PAGE);
            return (
              <>
                <TransactionTable rows={pageRows} />
                <Pagination total={txnRows.length} perPage={TXN_PER_PAGE} page={txnPage} onChange={setTxnPage} itemLabel="transactions" />
              </>
            );
          })()}
        </div>
      )}

      {/* ── Revenue Summary ───────────────────────────────────────────── */}
      {activeTab === "Revenue Summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVENUE_CARDS.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{card.label}</p>
                <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{card.sub}</p>
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
                        <span className="h-3 w-3 rounded-sm" style={{ background: plan.color }} />
                        <span className="text-sm font-medium text-slate-700">{plan.plan}</span>
                        <span className="text-xs text-slate-400">({plan.count} accounts)</span>
                      </div>
                      <span className="font-mono font-semibold text-sm" style={{ color: "var(--ink)" }}>${plan.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: plan.color }} />
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
