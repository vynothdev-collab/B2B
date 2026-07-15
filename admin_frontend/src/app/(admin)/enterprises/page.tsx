"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  UserPlus,
  Building2,
  CreditCard,
  Users,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import SlidePanel from "@/components/ui/SlidePanel";
import { useToast } from "@/components/ui/Toast";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import CreateEnterpriseModal from "@/components/modals/CreateEnterpriseModal";
import CreateEnterpriseAdminModal from "@/components/modals/CreateEnterpriseAdminModal";
import {
  getEnterpriseStats,
  listEnterprises,
  updateEnterprise,
  type Enterprise,
  type EnterpriseStats,
} from "@/services/enterprises";
import { listCustomers, updateCustomerStatus, type Customer } from "@/services/customers";

const TABS = ["Enterprise Admins", "Enterprise Users"] as const;
type Tab = (typeof TABS)[number];

const PER_PAGE = 10;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function EnterpriseDetail({
  ent,
  onAddAdmin,
  onToggleStatus,
  busy,
}: {
  ent: Enterprise;
  onAddAdmin: () => void;
  onToggleStatus: () => void;
  busy: boolean;
}) {
  return (
    <div className="divide-y divide-slate-100">
      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold"
            style={{ background: "var(--gold-dim)", color: "#8A6222" }}
          >
            {initials(ent.name)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{ent.name}</h3>
            <p className="text-sm text-slate-500">{ent.industry ?? "—"}</p>
            <div className="mt-1"><Badge status={ent.status} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Country</p><p className="text-slate-700 font-medium">{ent.country ?? "—"}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Company Size</p><p className="text-slate-700 font-medium">{ent.size ?? "—"}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Website</p><p className="text-slate-700 font-medium truncate">{ent.website ?? "—"}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Created</p><p className="text-slate-700 font-medium">{formatDate(ent.created_at)}</p></div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Primary Admin</h4>
        </div>
        {ent.admin_name ? (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-medium text-slate-800">{ent.admin_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-600">{ent.admin_email}</span>
            </div>
            {ent.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-slate-600">{ent.phone}</span>
              </div>
            )}
            {ent.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-slate-600">{ent.website}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No enterprise admin assigned yet.</p>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Plan & Usage</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Current Plan</p><p className="font-semibold text-slate-900">{ent.plan}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Total Users</p><p className="font-semibold text-slate-900">{ent.user_count}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Credits</p><p className="text-slate-700">{ent.credits.toLocaleString()}</p></div>
        </div>
      </div>

      {ent.notes && (
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">Notes</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{ent.notes}</p>
        </div>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Account Actions</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddAdmin}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: "var(--gold)", color: "#3C2400" }}
          >
            <UserPlus className="h-4 w-4" /> Add Admin
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={busy}
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
            style={
              ent.status === "active"
                ? { borderColor: "var(--gold)", color: "#8A6222" }
                : { borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)" }
            }
          >
            {ent.status === "active" ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_STATS: EnterpriseStats = { total: 0, active: 0, total_users: 0, total_credits: 0 };

export default function EnterprisesPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("Enterprise Admins");

  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [entTotal, setEntTotal] = useState(0);
  const [entLoading, setEntLoading] = useState(true);
  const [entQuery, setEntQuery] = useState("");
  const debouncedEntQuery = useDebounce(entQuery, 300);
  const [entStatus, setEntStatus] = useState<"all" | "active" | "suspended" | "inactive">("all");
  const [selected, setSelected] = useState<Enterprise | null>(null);
  const [entPage, setEntPage] = useState(1);

  const [stats, setStats] = useState<EnterpriseStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  const [entUsers, setEntUsers] = useState<Customer[]>([]);
  const [euTotal, setEuTotal] = useState(0);
  const [euLoading, setEuLoading] = useState(false);
  const [euQuery, setEuQuery] = useState("");
  const debouncedEuQuery = useDebounce(euQuery, 300);
  const [euEnterpriseFilter, setEuEnterpriseFilter] = useState<string>("all");
  const [euPage, setEuPage] = useState(1);

  const [enterpriseOptions, setEnterpriseOptions] = useState<Enterprise[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [busyEntId, setBusyEntId] = useState<string | null>(null);

  useEffect(() => {
    setEntPage(1);
  }, [debouncedEntQuery, entStatus]);
  useEffect(() => {
    setEuPage(1);
  }, [debouncedEuQuery, euEnterpriseFilter]);

  const loadEnterprises = useCallback(async (signal?: AbortSignal) => {
    setEntLoading(true);
    try {
      const paged = await listEnterprises(
        {
          page: entPage,
          page_size: PER_PAGE,
          q: debouncedEntQuery.trim() || undefined,
          status: entStatus === "all" ? undefined : entStatus,
        },
        signal,
      );
      setEnterprises(paged.items);
      setEntTotal(paged.total);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not load enterprises.";
      toast.error("Load failed", msg);
    } finally {
      if (!signal?.aborted) setEntLoading(false);
    }
  }, [toast, entPage, debouncedEntQuery, entStatus]);

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    setStatsLoading(true);
    try {
      const s = await getEnterpriseStats(signal);
      setStats(s);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
    } finally {
      if (!signal?.aborted) setStatsLoading(false);
    }
  }, []);

  const loadEnterpriseOptions = useCallback(async (signal?: AbortSignal) => {
    try {
      const paged = await listEnterprises({ page: 1, page_size: 100 }, signal);
      setEnterpriseOptions(paged.items);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
    }
  }, []);

  const loadEnterpriseUsers = useCallback(async (signal?: AbortSignal) => {
    setEuLoading(true);
    try {
      const paged = await listCustomers(
        {
          roles: ["enterprise_admin", "enterprise_user"],
          enterprise_id: euEnterpriseFilter === "all" ? undefined : euEnterpriseFilter,
          q: debouncedEuQuery.trim() || undefined,
          page: euPage,
          page_size: PER_PAGE,
        },
        signal,
      );
      setEntUsers(paged.items);
      setEuTotal(paged.total);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not load enterprise users.";
      toast.error("Load failed", msg);
    } finally {
      if (!signal?.aborted) setEuLoading(false);
    }
  }, [toast, euPage, debouncedEuQuery, euEnterpriseFilter]);

  useEffect(() => {
    const controller = new AbortController();
    void loadEnterprises(controller.signal);
    return () => controller.abort();
  }, [loadEnterprises]);

  useEffect(() => {
    const controller = new AbortController();
    void loadStats(controller.signal);
    return () => controller.abort();
  }, [loadStats]);

  useEffect(() => {
    const controller = new AbortController();
    void loadEnterpriseOptions(controller.signal);
    return () => controller.abort();
  }, [loadEnterpriseOptions]);

  useEffect(() => {
    if (activeTab !== "Enterprise Users") return;
    const controller = new AbortController();
    void loadEnterpriseUsers(controller.signal);
    return () => controller.abort();
  }, [activeTab, loadEnterpriseUsers]);

  const patchEnterprise = (updated: Enterprise) => {
    setEnterprises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelected((cur) => (cur && cur.id === updated.id ? updated : cur));
    void loadStats();
  };

  const handleToggleEntStatus = async (e: Enterprise) => {
    const next = e.status === "active" ? "suspended" : "active";
    setBusyEntId(e.id);
    try {
      const updated = await updateEnterprise(e.id, { status: next });
      patchEnterprise(updated);
      toast.success(
        next === "active" ? "Enterprise activated" : "Enterprise suspended",
        `${updated.name} is now ${next}.`,
      );
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not update enterprise.";
      toast.error("Update failed", msg);
    } finally {
      setBusyEntId(null);
    }
  };

  const [euBusyId, setEuBusyId] = useState<string | null>(null);
  const handleToggleEuStatus = async (u: Customer) => {
    setEuBusyId(u.id);
    try {
      const updated = await updateCustomerStatus(u.id, !u.is_active);
      setEntUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(
        updated.is_active ? "User activated" : "User suspended",
        `${updated.name} is now ${updated.is_active ? "active" : "suspended"}.`,
      );
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not update user status.";
      toast.error("Update failed", msg);
    } finally {
      setEuBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium transition-colors"
              style={
                activeTab === tab
                  ? { borderBottom: "2px solid var(--gold)", color: "#8A6222" }
                  : { color: "var(--ink-faint)" }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Enterprises" value={stats.total} hint="All company accounts" icon={<Building2 className="h-5 w-5" style={{ color: "#8A6222" }} />} bg="var(--gold-dim)" color="#8A6222" />
            <StatCard label="Active Enterprises" value={stats.active} hint="Currently active" icon={<CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />} bg="var(--sage-dim)" color="var(--sage-dark, #3E6A44)" />
            <StatCard label="Enterprise Users" value={stats.total_users} hint="Across all companies" icon={<Users className="h-5 w-5" style={{ color: "var(--rust)" }} />} bg="var(--rust-dim)" color="var(--rust)" />
            <StatCard label="Total Credits" value={stats.total_credits} hint="Provisioned to enterprises" icon={<CreditCard className="h-5 w-5" style={{ color: "var(--forest)" }} />} bg="rgba(23,50,41,.08)" color="var(--forest)" />
          </>
        )}
      </div>

      {/* ── Enterprise Admins Tab ─────────────────────────────────────── */}
      {activeTab === "Enterprise Admins" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-800">Enterprises</p>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--gold)", color: "#3C2400" }}
            >
              <Plus className="h-4 w-4" /> Add Enterprise
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={entQuery}
                onChange={(e) => setEntQuery(e.target.value)}
                placeholder="Search enterprises..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={entStatus}
              onChange={(e) => setEntStatus(e.target.value as typeof entStatus)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5 text-left">Company</th>
                  <th className="px-4 py-2.5 text-left">Admin</th>
                  <th className="px-4 py-2.5 text-left">Industry</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Plan</th>
                  <th className="px-4 py-2.5 text-left">Users</th>
                  <th className="px-4 py-2.5 text-left">Credits</th>
                  <th className="px-4 py-2.5 text-left">Created</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={`sk-ent-${i}`} columns={9} />
                  ))}
                {!entLoading && enterprises.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(e)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ background: "var(--gold-dim)", color: "#8A6222" }}
                        >
                          {initials(e.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{e.name}</p>
                          <p className="text-xs text-slate-400">{e.admin_email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.admin_name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{e.industry ?? "—"}</td>
                    <td className="px-4 py-3"><Badge status={e.status} /></td>
                    <td className="px-4 py-3 font-medium text-slate-700">{e.plan}</td>
                    <td className="px-4 py-3 text-slate-600">{e.user_count}</td>
                    <td className="px-4 py-3 text-slate-600">{e.credits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(e.created_at)}</td>
                    <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(e);
                            setAdminModalOpen(true);
                          }}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                        >
                          Add Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleEntStatus(e)}
                          disabled={busyEntId === e.id}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                          style={
                            e.status === "active"
                              ? { borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }
                              : { borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }
                          }
                        >
                          {e.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!entLoading && enterprises.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                      {entTotal === 0
                        ? <>No enterprises yet — click <span className="font-semibold">Add Enterprise</span> to create one.</>
                        : "No enterprises match your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            total={entTotal}
            perPage={PER_PAGE}
            page={entPage}
            onChange={setEntPage}
            itemLabel="enterprises"
          />
        </div>
      )}

      {/* ── Enterprise Users Tab ──────────────────────────────────────── */}
      {activeTab === "Enterprise Users" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-800">Enterprise Users & Admins</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={euQuery}
                onChange={(e) => setEuQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={euEnterpriseFilter}
              onChange={(e) => setEuEnterpriseFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
            >
              <option value="all">All Enterprises</option>
              {enterpriseOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5 text-left">Name</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">Enterprise</th>
                  <th className="px-4 py-2.5 text-left">Role</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Date Added</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {euLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={`sk-eu-${i}`} columns={7} />
                  ))}
                {!euLoading && entUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: "var(--gold-dim)", color: "#8A6222" }}
                        >
                          {initials(u.name)}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.enterprise_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={
                          u.role === "enterprise_admin"
                            ? { background: "var(--gold-dim)", color: "#8A6222" }
                            : { background: "rgba(23,50,41,.08)", color: "var(--forest)" }
                        }
                      >
                        {u.role === "enterprise_admin" ? "Admin" : "Member"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={u.is_active ? "active" : "suspended"} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleEuStatus(u)}
                          disabled={euBusyId === u.id}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                          style={
                            u.is_active
                              ? { borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }
                              : { borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }
                          }
                        >
                          {u.is_active ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!euLoading && entUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                      {euTotal === 0
                        ? "No enterprise members yet."
                        : "No enterprise members match your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            total={euTotal}
            perPage={PER_PAGE}
            page={euPage}
            onChange={setEuPage}
            itemLabel="users"
          />
        </div>
      )}

      <SlidePanel
        isOpen={!!selected && !adminModalOpen}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.industry ?? undefined}
        width="xl"
      >
        {selected && (
          <EnterpriseDetail
            ent={selected}
            busy={busyEntId === selected.id}
            onAddAdmin={() => setAdminModalOpen(true)}
            onToggleStatus={() => handleToggleEntStatus(selected)}
          />
        )}
      </SlidePanel>

      <CreateEnterpriseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          void loadEnterprises();
          void loadEnterpriseOptions();
          void loadStats();
        }}
      />

      <CreateEnterpriseAdminModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        enterpriseId={selected?.id ?? null}
        enterpriseName={selected?.name ?? null}
        onCreated={() => {
          void loadEnterprises();
          void loadStats();
          if (activeTab === "Enterprise Users") void loadEnterpriseUsers();
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  bg,
  color,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}
        >
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5" style={{ color }}>
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
