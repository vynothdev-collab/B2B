"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Ban, CheckCircle, Search, Users, Building2, CheckCircle2, MinusCircle, Clock, Infinity, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import ActionMenu from "@/components/ui/ActionMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CreatePlanModal from "@/components/modals/CreatePlanModal";
import EditPlanModal from "@/components/modals/EditPlanModal";
import { listPlans, togglePlan, deletePlan, type Plan } from "@/services/plans";
import { useToast } from "@/components/ui/Toast";

const TABS = ["Individual Plans", "Enterprise Plans"] as const;
type Tab = typeof TABS[number];

const PER_PAGE = 6;

function formatPrice(price_cents: number): string {
  if (price_cents === 0) return "Free";
  return `$${(price_cents / 100).toFixed(2)}`;
}

function PlanTypeBadge({ type }: { type: "validity" | "payg" }) {
  if (type === "validity") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: "var(--gold-dim)", color: "#8A6222" }}>
        <Clock className="h-3 w-3" /> Validity
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: "rgba(23,50,41,.10)", color: "var(--forest)" }}>
      <Infinity className="h-3 w-3" /> PAYG
    </span>
  );
}

function PlansTable({
  plans,
  isIndividual,
  loading,
  onEdit,
  onToggle,
  onDelete,
}: {
  plans: Plan[];
  isIndividual: boolean;
  loading: boolean;
  onEdit: (plan: Plan) => void;
  onToggle: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [planPage, setPlanPage] = useState(1);

  const filtered = plans.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" ? p.is_active : !p.is_active);
    return matchSearch && matchStatus;
  });
  const paginated = filtered.slice((planPage - 1) * PER_PAGE, planPage * PER_PAGE);

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPlanPage(1); }}
            placeholder="Search plans by name…"
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
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Plan Name</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Type</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Credits</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Validity</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Price</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                  Loading plans…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                  No plans found.
                </td>
              </tr>
            )}
            {!loading && paginated.map((plan) => (
              <tr key={plan.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: plan.plan_type === "payg" ? "rgba(23,50,41,.10)" : "var(--gold-dim)",
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: plan.plan_type === "payg" ? "var(--forest)" : "#8A6222",
                          fontFamily: "var(--font-fraunces)",
                        }}
                      >
                        {plan.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{plan.name}</p>
                      {plan.description && (
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{plan.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <PlanTypeBadge type={plan.plan_type} />
                </td>
                <td className="px-5 py-3.5 text-slate-700 font-medium">
                  {plan.credits.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-slate-600 text-xs">
                  {plan.plan_type === "payg" ? "Lifetime" : `${plan.validity_days} days`}
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-slate-900">{formatPrice(plan.price_cents)}</span>
                </td>
                <td className="px-5 py-3.5">
                  <Badge status={plan.is_active ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3.5">
                  <ActionMenu
                    items={[
                      {
                        label: "Edit",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        onClick: () => onEdit(plan),
                      },
                      {
                        label: plan.is_active ? "Disable" : "Enable",
                        icon: plan.is_active
                          ? <Ban className="h-3.5 w-3.5" />
                          : <CheckCircle className="h-3.5 w-3.5" />,
                        onClick: () => onToggle(plan),
                      },
                      {
                        label: "Delete",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        onClick: () => onDelete(plan),
                        danger: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={filtered.length} perPage={PER_PAGE} page={planPage} onChange={setPlanPage} itemLabel="plans" />
    </>
  );
}

export default function PlansPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("Individual Plans");
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [togglingPlan, setTogglingPlan] = useState<Plan | null>(null);
  const [toggleInProgress, setToggleInProgress] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const isIndividual = activeTab === "Individual Plans";
  const target = isIndividual ? "individual" : "enterprise";

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPlans({ target });
      setAllPlans(result.items);
    } catch {
      toast.error("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  }, [target]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleToggleConfirm = async () => {
    if (!togglingPlan) return;
    setToggleInProgress(true);
    try {
      const updated = await togglePlan(togglingPlan.id);
      setAllPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`Plan "${updated.name}" ${updated.is_active ? "enabled" : "disabled"}.`);
      setTogglingPlan(null);
    } catch {
      toast.error("Failed to update plan status.");
    } finally {
      setToggleInProgress(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    setDeleteInProgress(true);
    try {
      await deletePlan(deletingPlan.id);
      setAllPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      toast.success(`Plan "${deletingPlan.name}" deleted.`);
      setDeletingPlan(null);
    } catch {
      toast.error("Failed to delete plan.");
    } finally {
      setDeleteInProgress(false);
    }
  };

  const activePlans = allPlans.filter((p) => p.is_active).length;
  const inactivePlans = allPlans.filter((p) => !p.is_active).length;

  const accent = isIndividual
    ? { bg: "var(--forest)", iconColor: "#EFEAD9", dimBg: "rgba(23,50,41,.08)", textColor: "var(--forest)", ringColor: "rgba(23,50,41,.10)" }
    : { bg: "var(--gold)", iconColor: "#3C2400", dimBg: "var(--gold-dim)", textColor: "#8A6222", ringColor: "var(--gold-dim)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const isInd = tab === "Individual Plans";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
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
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="mb-px inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
          style={{ background: accent.bg, color: accent.iconColor }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          <Plus className="h-4 w-4" /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: accent.dimBg }}>
            {isIndividual
              ? <Users className="h-5 w-5" style={{ color: accent.bg }} />
              : <Building2 className="h-5 w-5" style={{ color: accent.textColor }} />}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
              {isIndividual ? "Individual Plans" : "Enterprise Plans"}
            </p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: accent.textColor }}>{allPlans.length}</p>
            <p className="text-xs text-slate-400">{isIndividual ? "Personal account plans" : "Company account plans"}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Active Plans</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>{activePlans}</p>
            <p className="text-xs text-slate-400">
              {allPlans.length > 0 ? `${Math.round((activePlans / allPlans.length) * 100)}% active` : "No plans yet"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--line-soft)" }}>
            <MinusCircle className="h-5 w-5" style={{ color: "var(--ink-faint)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Inactive Plans</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--ink-dim)" }}>{inactivePlans}</p>
            <p className="text-xs text-slate-400">Hidden from users</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <PlansTable
          plans={allPlans}
          isIndividual={isIndividual}
          loading={loading}
          onEdit={(plan) => setEditPlan(plan)}
          onToggle={(plan) => setTogglingPlan(plan)}
          onDelete={(plan) => setDeletingPlan(plan)}
        />
      </div>

      <CreatePlanModal
        open={createOpen}
        target={target}
        onClose={() => setCreateOpen(false)}
        onCreated={(plan) => {
          if (plan.target === target) setAllPlans((prev) => [plan, ...prev]);
        }}
      />

      <EditPlanModal
        open={editPlan !== null}
        plan={editPlan}
        onClose={() => setEditPlan(null)}
        onUpdated={(updated) => {
          setAllPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setEditPlan(null);
        }}
      />

      <ConfirmDialog
        open={togglingPlan !== null && !toggleInProgress}
        onClose={() => setTogglingPlan(null)}
        onConfirm={handleToggleConfirm}
        variant={togglingPlan?.is_active ? "warning" : "info"}
        title={togglingPlan?.is_active ? "Disable Plan" : "Enable Plan"}
        description={
          togglingPlan?.is_active ? (
            <>
              Are you sure you want to disable{" "}
              <strong>{togglingPlan?.name}</strong>? Users will no longer be able
              to purchase this plan.
            </>
          ) : (
            <>
              Are you sure you want to enable{" "}
              <strong>{togglingPlan?.name}</strong>? It will become visible and
              purchasable by users.
            </>
          )
        }
        note={
          togglingPlan?.is_active
            ? "Users who already purchased this plan will not be affected."
            : undefined
        }
        confirmLabel={togglingPlan?.is_active ? "Disable Plan" : "Enable Plan"}
      />

      <ConfirmDialog
        open={deletingPlan !== null && !deleteInProgress}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title="Delete Plan"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong>{deletingPlan?.name}</strong>? This action cannot be undone.
          </>
        }
        note="Existing users who purchased this plan will keep their credits. Only new purchases will be blocked."
        confirmLabel="Delete Plan"
      />
    </div>
  );
}
