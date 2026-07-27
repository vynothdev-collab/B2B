"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, Wallet, TrendingUp, Coins, BarChart3, Loader2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  listCreditTransactions,
  type PagedCreditTransactions,
  type CreditTransactionRecord,
  type CreditStats,
} from "@/services/credits";
import AddCreditsModal from "@/components/modals/AddCreditsModal";

const TABS = ["Individual Credits", "Enterprise Credits"] as const;
type Tab = typeof TABS[number];

function makeFocusHandlers(isIndividual: boolean) {
  const ring   = isIndividual ? "rgba(23,50,41,.10)"  : "var(--gold-dim)";
  const border = isIndividual ? "var(--forest)"       : "var(--gold)";
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    allocation: { bg: "#DCFCE7", color: "#16A34A", label: "Allocation" },
    deduction:  { bg: "#FEE2E2", color: "#DC2626", label: "Deduction"  },
  };
  const s = styles[type] ?? { bg: "#F1F5F9", color: "#475569", label: type };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
      {reason}
    </span>
  );
}

function RefBadge({ refType }: { refType: string | null }) {
  if (!refType) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 font-mono">
      {refType}
    </span>
  );
}

export default function CreditsPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("Individual Credits");
  const TX_PER_PAGE = 20;
  const [txPage, setTxPage] = useState(1);

  const isIndividual = activeTab === "Individual Credits";

  const [query, setQuery] = useState("");
  const [txType, setTxType] = useState("all");

  const dQuery = useDebounce(query, 300);

  const [txData, setTxData] = useState<PagedCreditTransactions | null>(null);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [addCreditsOpen, setAddCreditsOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchTx = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    try {
      const accountType = isIndividual ? "individual" : "enterprise";
      const data = await listCreditTransactions(
        {
          page: txPage,
          page_size: TX_PER_PAGE,
          q: dQuery || undefined,
          account_type: accountType,
          type: txType !== "all" ? txType : undefined,
        },
        ctrl.signal,
      );
      setTxData(data);
      setStats(data.stats);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      toast.error("Failed to load transactions", "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isIndividual, txPage, dQuery, txType, toast]);

  useEffect(() => {
    void fetchTx();
  }, [fetchTx]);

  const outstanding = stats?.total_remaining ?? 0;
  const used        = stats?.total_used      ?? 0;
  const allocated   = stats?.total_allocated ?? 0;
  const usageRate   = allocated > 0 ? Math.round((used / allocated) * 100) : 0;

  const accent = isIndividual
    ? { bg: "var(--forest)", dimBg: "rgba(23,50,41,.08)", text: "var(--forest)" }
    : { bg: "var(--gold)",   dimBg: "var(--gold-dim)",   text: "#8A6222"        };

  const focus = makeFocusHandlers(isIndividual);

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Credits & Usage</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor credit usage, assignments, and transactions.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddCreditsOpen(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: accent.bg }}
        >
          + Add Credits
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isInd    = tab === "Individual Credits";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setTxPage(1); setQuery(""); setTxType("all"); }}
                className="px-4 py-2.5 text-sm font-medium transition-colors"
                style={
                  isActive
                    ? { borderBottom: `2px solid ${isInd ? "var(--forest)" : "var(--gold)"}`, color: isInd ? "var(--forest)" : "#8A6222" }
                    : { color: "var(--ink-faint)" }
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: accent.dimBg }}>
            <Wallet className="h-5 w-5" style={{ color: accent.bg }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Outstanding Balance</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{outstanding.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Credits remaining to use</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--rust-dim)" }}>
            <TrendingUp className="h-5 w-5" style={{ color: "var(--rust)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Lifetime Used</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{used.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total consumed to date</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <Coins className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Allocated</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{allocated.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Credits allocated overall</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--gold-dim)" }}>
              <BarChart3 className="h-5 w-5" style={{ color: "#8A6222" }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Usage Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{usageRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Of total allocation</p>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${usageRate}%`, background: "#8A6222" }} />
          </div>
        </div>
      </div>

      {/* ── Transaction Table Card ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex-1 min-w-[200px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
              Search account / description
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setTxPage(1); }}
                placeholder="Name, reason, or description..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                {...focus}
              />
            </div>
          </div>
          <div className="min-w-[160px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
              Transaction Type
            </p>
            <select
              value={txType}
              onChange={(e) => { setTxType(e.target.value); setTxPage(1); }}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none transition-colors"
              {...focus}
            >
              <option value="all">All Types</option>
              <option value="allocation">Allocation</option>
              <option value="deduction">Deduction</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">When</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Reason</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Delta</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Balance After</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading && !txData && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && txData?.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              )}
              {txData?.items.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          total={txData?.total ?? 0}
          perPage={TX_PER_PAGE}
          page={txPage}
          onChange={setTxPage}
          itemLabel="transactions"
        />
      </div>

      <AddCreditsModal
        open={addCreditsOpen}
        target={null}
        onClose={() => setAddCreditsOpen(false)}
        onSuccess={() => {
          setAddCreditsOpen(false);
          void fetchTx();
        }}
      />
    </div>
  );
}

function TxRow({ tx }: { tx: CreditTransactionRecord }) {
  const isCredit = tx.delta > 0;
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(tx.created_at)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: tx.account_type === "individual" ? "rgba(23,50,41,.08)" : "var(--gold-dim)",
              color: tx.account_type === "individual" ? "var(--forest)" : "#8A6222",
              fontFamily: "var(--font-fraunces)",
            }}
          >
            {initials(tx.account_name)}
          </div>
          <div>
            <p className="font-medium text-slate-800 leading-tight">{tx.account_name}</p>
            <p className="text-xs text-slate-400 leading-tight capitalize">
              {tx.account_type === "individual" ? "Individual" : "Enterprise"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <TypeBadge type={tx.transaction_type} />
      </td>
      <td className="px-4 py-3">
        <ReasonBadge reason={tx.reason} />
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums">
        <span style={{ color: isCredit ? "#16A34A" : "#DC2626" }}>
          {isCredit ? "+" : ""}{tx.delta.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
        {tx.balance_after.toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <RefBadge refType={tx.reference_type} />
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">
        {tx.description ?? "—"}
      </td>
    </tr>
  );
}
