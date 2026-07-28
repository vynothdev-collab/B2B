"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Clock, Infinity, CheckCircle2, AlertCircle, Loader2, ShoppingCart, ListOrdered } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAvailablePlans,
  getMyPlans,
  purchasePlan,
  type Plan,
  type MyPlansResponse,
  type UserPlanOut,
} from "@/lib/plansApi";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price_cents: number): string {
  if (price_cents === 0) return "Free";
  return `$${(price_cents / 100).toFixed(2)}`;
}

function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// ── Active Validity Plan Card ──────────────────────────────────────────────────

function ValidityPlanCard({ plan }: { plan: UserPlanOut }) {
  const pct = plan.credits_total > 0
    ? Math.round((plan.credits_remaining / plan.credits_total) * 100)
    : 0;
  const days = plan.expires_at ? daysUntil(plan.expires_at) : null;
  const barColor = pct > 40 ? "#10b981" : pct > 15 ? "#f59e0b" : "#dc2626";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Validity Plan</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">{plan.plan_name}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Active
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{plan.credits_remaining.toLocaleString()}</p>
          <p className="text-xs text-gray-400">of {plan.credits_total.toLocaleString()} credits remaining</p>
        </div>
        {days !== null && (
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: days <= 3 ? "#dc2626" : days <= 7 ? "#f59e0b" : "#374151" }}>
              {days}
            </p>
            <p className="text-xs text-gray-400">days left</p>
          </div>
        )}
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <p className="text-xs text-gray-400">{pct}% remaining</p>
    </div>
  );
}

// ── PAYG Plan Card ─────────────────────────────────────────────────────────────

function PaygPlanCard({ plan }: { plan: UserPlanOut }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pay-as-you-go</p>
          <p className="mt-0.5 font-semibold text-gray-900">{plan.plan_name}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
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

// ── Available Plan Purchase Card ───────────────────────────────────────────────

function PlanPurchaseCard({
  plan,
  onBuy,
  buying,
}: {
  plan: Plan;
  onBuy: (plan: Plan) => void;
  buying: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
          {plan.plan_type === "payg" ? (
            <Infinity className="h-5 w-5 text-red-600" />
          ) : (
            <Clock className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{plan.name}</p>
          {plan.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{plan.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex justify-between">
          <span className="text-gray-400">Credits</span>
          <span className="font-medium text-gray-900">{plan.credits.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Validity</span>
          <span className="font-medium text-gray-900">
            {plan.plan_type === "payg" ? "Lifetime" : `${plan.validity_days} days`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Type</span>
          <span className="font-medium text-gray-900 capitalize">{plan.plan_type === "payg" ? "Pay-as-you-go" : "Validity"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="text-xl font-bold text-gray-900">{formatPrice(plan.price_cents)}</span>
        <button
          type="button"
          onClick={() => onBuy(plan)}
          disabled={buying}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
          Buy
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PlansClient() {
  const { user } = useAuth();
  const [myPlans, setMyPlans] = useState<MyPlansResponse | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

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

  useEffect(() => { load(); }, [load]);

  const handleBuy = async (plan: Plan) => {
    setBuyingId(plan.id);
    setConfirmPlan(null);
    try {
      await purchasePlan(plan.id);
      showToast("ok", `Plan "${plan.name}" purchased successfully!`);
      await load();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Purchase failed.")
          : "Purchase failed.";
      showToast("err", typeof msg === "string" ? msg : "Purchase failed.");
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
                  You already have an active validity plan. This plan will be added to the queue and activate automatically when the current one ends.
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

      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Credit summary banner */}
        {myPlans && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Validity Credits", value: myPlans.summary.validity_credits_remaining, color: "#f59e0b" },
              { label: "PAYG Credits", value: myPlans.summary.payg_credits_remaining, color: "#3b82f6" },
              { label: "Admin Credits", value: myPlans.summary.legacy_credits_remaining, color: "#6b7280" },
              { label: "Total Remaining", value: myPlans.summary.total_remaining, color: "#10b981" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-0.5 text-2xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* My Plans */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">My Active Plans</h2>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your plans…
            </div>
          )}

          {!loading && !hasActivePlans && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No active plans. Purchase one below to get started.</p>
            </div>
          )}

          {!loading && myPlans?.active_validity && (
            <div className="mb-3">
              <ValidityPlanCard plan={myPlans.active_validity} />
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
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Queued Plans</h2>
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
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Available Plans</h2>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading plans…
            </div>
          )}

          {!loading && availablePlans.length === 0 && (
            <p className="text-sm text-gray-400 py-4">No plans available at this time.</p>
          )}

          {!loading && availablePlans.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availablePlans.map((plan) => (
                <PlanPurchaseCard
                  key={plan.id}
                  plan={plan}
                  onBuy={(p) => setConfirmPlan(p)}
                  buying={buyingId === plan.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
