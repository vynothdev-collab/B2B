"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CreditCard, Clock, Infinity, CheckCircle2, AlertCircle,
  Loader2, ListOrdered, Zap, CalendarDays, ChevronLeft, ChevronRight,
  Receipt, Users, Building2, PlusCircle,
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAvailablePlans,
  getMyPlans,
  getMyBillingHistory,
  purchasePlan,
  type Plan,
  type MyPlansResponse,
  type UserPlanOut,
  type BillingHistoryItem,
  type BillingHistoryFilter,
} from "@/lib/plansApi";

// ── Theme ──────────────────────────────────────────────────────────────────────

const RED = "#dc2626";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price_cents: number): string {
  if (price_cents === 0) return "$0";
  return `$${Math.round(price_cents / 100)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86400000));
}

// ── Current Plan Card ────────────────────────────────────────────────────────────

function CurrentPlanCard({ plan }: { plan: UserPlanOut }) {
  const used = Math.max(0, plan.credits_total - plan.credits_remaining);
  const pctUsed = plan.credits_total > 0 ? Math.round((used / plan.credits_total) * 100) : 0;
  const days = plan.expires_at ? daysUntil(plan.expires_at) : null;

  return (
    <div className="rounded-2xl border border-red-100 bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <Zap className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
              Current Plan
            </span>
            <p className="mt-1 text-base font-bold text-gray-900">{plan.plan_name}</p>
            <p className="text-xs text-gray-400">Validity Plan</p>
          </div>
        </div>

        {plan.starts_at && plan.expires_at && (
          <div className="sm:border-l sm:border-gray-100 sm:pl-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarDays className="h-3.5 w-3.5" /> Validity
            </div>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {formatDate(plan.starts_at)} – {formatDate(plan.expires_at)}
            </p>
            {days !== null && (
              <p className="text-xs font-medium text-red-600">{days} days remaining</p>
            )}
          </div>
        )}

        <div className="sm:min-w-[180px] sm:border-l sm:border-gray-100 sm:pl-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CreditCard className="h-3.5 w-3.5" /> Credits Used
          </div>
          <p className="mt-0.5 text-lg font-bold">
            <span style={{ color: RED }}>{used.toLocaleString()}</span>
            <span className="text-sm font-medium text-gray-400"> / {plan.credits_total.toLocaleString()}</span>
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full transition-all" style={{ width: `${pctUsed}%`, background: RED }} />
          </div>
          <p className="mt-1 text-[11px] text-gray-400">{pctUsed}% used</p>
        </div>
      </div>
    </div>
  );
}

// ── PAYG Plan Card ─────────────────────────────────────────────────────────────

function PaygPlanCard({ plan }: { plan: UserPlanOut }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pay As You Go</p>
          <p className="mt-0.5 font-semibold text-gray-900">{plan.plan_name}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
          <Infinity className="h-3.5 w-3.5" /> No expiry
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{plan.credits_remaining.toLocaleString()}</p>
      <p className="text-xs text-gray-400">of {plan.credits_total.toLocaleString()} credits remaining</p>
    </div>
  );
}

// ── Queued Plan Row ────────────────────────────────────────────────────────────

function QueuedPlanRow({ plan }: { plan: UserPlanOut }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
        {plan.queue_position}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{plan.plan_name}</p>
        <p className="text-xs text-gray-400">{plan.credits_total.toLocaleString()} credits · activates when current plan ends</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Clock className="h-3.5 w-3.5" /> Queued
      </span>
    </div>
  );
}

// ── Pricing Card ───────────────────────────────────────────────────────────────

function PricingCard({
  plan,
  onBuy,
  buying,
  isCurrent,
}: {
  plan: Plan;
  onBuy: (plan: Plan) => void;
  buying: boolean;
  isCurrent: boolean;
}) {
  const isFree = plan.price_cents === 0;

  const creditsLine =
    plan.plan_type === "payg"
      ? `${plan.credits.toLocaleString()} credits`
      : `${plan.credits.toLocaleString()} credits${plan.validity_days ? ` · ${plan.validity_days} days` : ""}`;

  return (
    <div
      className={`relative flex w-64 shrink-0 snap-start flex-col rounded-2xl border p-5 pt-6 transition-shadow ${
        isCurrent ? "border-red-300 bg-red-50/40 shadow-sm" : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {isCurrent && (
        <span className="absolute top-3 right-3 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
          Current
        </span>
      )}

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
        {plan.plan_type === "payg"
          ? <Zap className="h-6 w-6 text-red-600" />
          : <Clock className="h-6 w-6 text-red-600" />}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
      {plan.description && (
        <p className="mt-1 text-xs leading-snug text-gray-400">{plan.description}</p>
      )}

      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-3xl font-extrabold text-gray-900">{formatPrice(plan.price_cents)}</span>
        {!isFree && <span className="mb-1 text-xs text-gray-400">one-time</span>}
      </div>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {creditsLine}
      </p>

      <button
        type="button"
        onClick={() => onBuy(plan)}
        disabled={buying}
        className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
          isCurrent
            ? "bg-red-600 text-white hover:bg-red-700"
            : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
        }`}
      >
        {buying && <Loader2 className="h-4 w-4 animate-spin" />}
        {isCurrent && <CheckCircle2 className="h-4 w-4" />}
        {isCurrent ? "Renew / Queue Plan" : isFree ? "Get started free" : "Select Plan"}
      </button>
    </div>
  );
}

// ── Plan Carousel ──────────────────────────────────────────────────────────────

function PlanCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 288, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 sm:flex"
      >
        <ChevronLeft className="h-4 w-4 text-gray-600" />
      </button>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 sm:flex"
      >
        <ChevronRight className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
}

// ── Skeletons ──────────────────────────────────────────────────────────────────

function CurrentPlanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-full bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-100" />
          </div>
        </div>
        <div className="sm:border-l sm:border-gray-100 sm:pl-6 space-y-2">
          <div className="h-3 w-14 rounded bg-gray-100" />
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
        <div className="sm:min-w-[180px] sm:border-l sm:border-gray-100 sm:pl-6 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-5 w-24 rounded bg-gray-200" />
          <div className="h-1.5 w-full rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

function PricingCardSkeleton() {
  return (
    <div className="flex w-64 shrink-0 snap-start flex-col rounded-2xl border border-gray-200 bg-white p-5 pt-6 animate-pulse">
      <div className="mb-4 h-12 w-12 rounded-2xl bg-gray-200" />
      <div className="h-4 w-28 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-full rounded bg-gray-100" />
      <div className="mt-1 h-3 w-3/4 rounded bg-gray-100" />
      <div className="mt-4 h-7 w-16 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
      <div className="mt-6 h-10 w-full rounded-xl bg-gray-200" />
    </div>
  );
}

// ── Plan Type Toggle ───────────────────────────────────────────────────────────

function PlanTypeToggle({
  value,
  onChange,
}: {
  value: "validity" | "payg";
  onChange: (v: "validity" | "payg") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-gray-100 bg-white p-1.5 shadow-md gap-0.5">
      {(["validity", "payg"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`inline-flex items-center rounded-full px-6 py-2 text-sm font-semibold transition-all ${
            value === t
              ? "text-white shadow-sm"
              : "text-gray-400 hover:text-gray-700"
          }`}
          style={value === t ? { background: RED } : {}}
        >
          {t === "validity" ? "Validity Plans" : "Pay As You Go"}
        </button>
      ))}
    </div>
  );
}

// ── Billing & Credit History ────────────────────────────────────────────────────

type HistoryKind = BillingHistoryItem["kind"];

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function HistoryKindBadge({ kind }: { kind: HistoryKind }) {
  const map: Record<HistoryKind, { icon: React.ReactNode; classes: string; label: string }> = {
    purchase: {
      icon: <PlusCircle className="h-3 w-3" />,
      classes: "border-red-100 bg-red-50 text-red-700",
      label: "Plan Purchase",
    },
    person: {
      icon: <Users className="h-3 w-3" />,
      classes: "border-emerald-100 bg-emerald-50 text-emerald-700",
      label: "People Search",
    },
    company: {
      icon: <Building2 className="h-3 w-3" />,
      classes: "border-amber-100 bg-amber-50 text-amber-700",
      label: "Company Search",
    },
    agentic: {
      icon: <Zap className="h-3 w-3" />,
      classes: "border-violet-100 bg-violet-50 text-violet-700",
      label: "Agentic Search",
    },
  };
  const m = map[kind];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${m.classes}`}>
      {m.icon} {m.label}
    </span>
  );
}

function HistoryTableSkeleton() {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
              <th className="px-4 py-2.5 text-left">Date &amp; Time</th>
              <th className="px-4 py-2.5 text-left">Event</th>
              <th className="px-4 py-2.5 text-left">Details</th>
              <th className="px-4 py-2.5 text-right">Credits</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3"><div className="h-3.5 w-28 animate-pulse rounded bg-gray-100" /></td>
                <td className="px-4 py-3"><div className="h-5 w-28 animate-pulse rounded-full bg-gray-100" /></td>
                <td className="px-4 py-3"><div className="h-3.5 w-36 animate-pulse rounded bg-gray-100" /></td>
                <td className="px-4 py-3 text-right"><div className="ml-auto h-3.5 w-12 animate-pulse rounded bg-gray-100" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
        <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PlansClient() {
  const { user } = useAuth();
  const [myPlans, setMyPlans] = useState<MyPlansResponse | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<"validity" | "payg">("validity");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const [billingItems, setBillingItems] = useState<BillingHistoryItem[]>([]);
  const [billingTotal, setBillingTotal] = useState(0);
  // historyInitialLoading: true only until the first billing-history fetch ever completes — drives the skeleton.
  // historyFetching: true for every fetch (incl. filter/page changes) — drives a subtle stale-content dim.
  const [historyInitialLoading, setHistoryInitialLoading] = useState(true);
  const [historyFetching, setHistoryFetching] = useState(true);
  const [historyFilter, setHistoryFilter] = useState<BillingHistoryFilter>("all");
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 10;
  const historyAbortRef = useRef<AbortController | null>(null);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mp, ap] = await Promise.all([getMyPlans(), getAvailablePlans()]);
      setMyPlans(mp);
      setAvailablePlans(ap);
    } catch {
      showToast("err", "Failed to load plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (filter: BillingHistoryFilter, page: number) => {
    historyAbortRef.current?.abort();
    const ctrl = new AbortController();
    historyAbortRef.current = ctrl;
    setHistoryFetching(true);
    try {
      const res = await getMyBillingHistory(filter, page, HISTORY_PAGE_SIZE, ctrl.signal);
      setBillingItems(res.items);
      setBillingTotal(res.total);
      setHistoryFetching(false);
      setHistoryInitialLoading(false);
    } catch {
      // an aborted (superseded) request must not clear the fetching flag — the request
      // that replaced it owns that responsibility. A genuine failure should stop the spinner.
      if (!ctrl.signal.aborted) {
        setHistoryFetching(false);
        setHistoryInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { void loadHistory(historyFilter, historyPage); }, [loadHistory, historyFilter, historyPage]);
  useEffect(() => { setHistoryPage(1); }, [historyFilter]);

  const handleBuy = async (plan: Plan) => {
    setBuyingId(plan.id);
    setConfirmPlan(null);
    try {
      await purchasePlan(plan.id);
      showToast("ok", `Plan "${plan.name}" purchased successfully!`);
      await Promise.all([load(), loadHistory(historyFilter, historyPage)]);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Purchase failed.")
          : "Purchase failed.";
      showToast("err", typeof detail === "string" ? detail : "Purchase failed.");
    } finally {
      setBuyingId(null);
    }
  };

  if (user?.role === "enterprise_user") {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Plans" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
          <AlertCircle className="h-10 w-10 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">Plans not available</p>
          <p className="text-sm text-gray-400 max-w-sm">
            Your credits are allocated by your Enterprise Admin. Contact them to request more credits.
          </p>
        </div>
      </div>
    );
  }

  const hasActivePlans =
    myPlans && (myPlans.active_validity || myPlans.active_payg.length > 0 || myPlans.queued_validity.length > 0);

  const validityPlans = availablePlans.filter((p) => p.plan_type === "validity");
  const paygPlans = availablePlans.filter((p) => p.plan_type === "payg");

  // Filtering and pagination for billing history are handled server-side.
  const historyPageCount = Math.max(1, Math.ceil(billingTotal / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, historyPageCount);
  const pagedHistory = billingItems;

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Plans" />

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          style={{ background: toast.type === "ok" ? "#10b981" : "#dc2626", color: "white" }}
        >
          {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <p className="text-base font-semibold text-gray-900">Confirm purchase</p>
            <p className="text-sm text-gray-600">
              Buy <strong>{confirmPlan.name}</strong> for{" "}
              <strong>{formatPrice(confirmPlan.price_cents)}</strong>?
              {confirmPlan.plan_type === "validity" && myPlans?.active_validity && (
                <span className="block mt-2 text-amber-600 text-xs">
                  You already have an active validity plan. This plan will be queued and activate when the current one ends.
                </span>
              )}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBuy(confirmPlan)}
                disabled={buyingId === confirmPlan.id}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {buyingId === confirmPlan.id ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-10">

        {/* My Plans */}
        <section>
          {loading && (
            <div className="space-y-3">
              <CurrentPlanCardSkeleton />
            </div>
          )}

          {!loading && !hasActivePlans && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
              <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No active plans. Choose one below to get started.</p>
            </div>
          )}

          {!loading && myPlans?.active_validity && (
            <div className="mb-3">
              <CurrentPlanCard plan={myPlans.active_validity} />
            </div>
          )}

          {!loading && myPlans && myPlans.active_payg.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {myPlans.active_payg.map((p) => (
                <PaygPlanCard key={p.id} plan={p} />
              ))}
            </div>
          )}
        </section>

        {/* Queued Plans */}
        {!loading && myPlans && myPlans.queued_validity.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Queued Plans</h2>
            </div>
            <div className="space-y-2">
              {myPlans.queued_validity.map((p) => (
                <QueuedPlanRow key={p.id} plan={p} />
              ))}
            </div>
          </section>
        )}

        {/* Available Plans */}
        <section>
          <div className="mt-6 flex justify-center">
            <PlanTypeToggle value={planType} onChange={setPlanType} />
          </div>

          {loading && (
            <div className="flex snap-x gap-5 overflow-x-auto px-1 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <PricingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && availablePlans.length === 0 && (
            <p className="py-4 text-sm text-gray-400">No plans available at this time.</p>
          )}

          {!loading && availablePlans.length > 0 && (() => {
            const shown = planType === "validity" ? validityPlans : paygPlans;
            if (shown.length === 0) {
              return <p className="py-4 text-sm text-gray-400">No plans available in this category.</p>;
            }
            return (
              <PlanCarousel>
                {shown.map((plan) => {
                  const isCurrent =
                    plan.plan_type === "validity"
                      ? myPlans?.active_validity?.plan_id === plan.id
                      : !!myPlans?.active_payg.some((p) => p.plan_id === plan.id);
                  return (
                    <PricingCard
                      key={plan.id}
                      plan={plan}
                      onBuy={(p: Plan) => setConfirmPlan(p)}
                      buying={buyingId === plan.id}
                      isCurrent={isCurrent}
                    />
                  );
                })}
              </PlanCarousel>
            );
          })()}
        </section>

        {/* Billing & Credit History */}
        <section>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Billing & Credit History</h3>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Every plan purchase (credits added) and every search (credits deducted), with date &amp; time.
                  </p>
                </div>
                {historyFetching && !historyInitialLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1">
                {([
                  { key: "all", label: "All" },
                  { key: "purchase", label: "Purchases" },
                  { key: "usage", label: "Usage" },
                ] as const).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setHistoryFilter(f.key)}
                    disabled={historyFetching}
                    className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                    style={
                      historyFilter === f.key
                        ? { background: "#fff", color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                        : { background: "transparent", color: "#9ca3af" }
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {historyInitialLoading ? (
              <HistoryTableSkeleton />
            ) : billingTotal === 0 && !historyFetching ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">
                {historyFilter === "all"
                  ? "No billing or usage history yet. Purchase a plan or run a search to see it here."
                  : "No history matches this filter."}
              </p>
            ) : (
              <div className={`transition-opacity ${historyFetching ? "pointer-events-none opacity-40" : "opacity-100"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                        <th className="px-4 py-2.5 text-left">Date &amp; Time</th>
                        <th className="px-4 py-2.5 text-left">Event</th>
                        <th className="px-4 py-2.5 text-left">Details</th>
                        <th className="px-4 py-2.5 text-right">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedHistory.map((h) => (
                        <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">{fmtDateTime(h.date)}</td>
                          <td className="px-4 py-3"><HistoryKindBadge kind={h.kind} /></td>
                          <td className="px-4 py-3 text-gray-600">{h.detail}</td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: h.credits > 0 ? "#10b981" : "#dc2626" }}>
                            {h.credits > 0 ? `+${h.credits.toLocaleString()}` : h.credits.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                  <p className="text-xs text-gray-400">
                    Showing {(safeHistoryPage - 1) * HISTORY_PAGE_SIZE + 1}-
                    {Math.min(safeHistoryPage * HISTORY_PAGE_SIZE, billingTotal)} of {billingTotal}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={safeHistoryPage <= 1 || historyFetching}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                    <span className="text-xs text-gray-400">Page {safeHistoryPage} / {historyPageCount}</span>
                    <button
                      type="button"
                      onClick={() => setHistoryPage((p) => Math.min(historyPageCount, p + 1))}
                      disabled={safeHistoryPage >= historyPageCount || historyFetching}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
