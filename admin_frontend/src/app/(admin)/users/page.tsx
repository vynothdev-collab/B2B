"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Mail,
  ShieldCheck,
  Users,
  CheckCircle2,
  UserCog,
  Building2,
  Loader2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import SlidePanel from "@/components/ui/SlidePanel";
import { useToast } from "@/components/ui/Toast";
import ConvertUserModal from "@/components/modals/ConvertUserModal";
import {
  listCustomers,
  updateCustomerStatus,
  type Customer,
} from "@/services/customers";

const USERS_PER_PAGE = 8;

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

function statusLabel(u: Customer): "active" | "suspended" {
  return u.is_active ? "active" : "suspended";
}

function UserDetail({
  user,
  onConvert,
  onToggleStatus,
  busy,
}: {
  user: Customer;
  onConvert: () => void;
  onToggleStatus: () => void;
  busy: boolean;
}) {
  return (
    <div className="divide-y divide-slate-100">
      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
            style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)" }}
          >
            {initials(user.name)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge status={statusLabel(user)} />
              <span className="text-xs uppercase tracking-wider text-slate-400">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Date Joined</p>
            <p className="text-slate-700 font-medium">{formatDate(user.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Phone</p>
            <p className="text-slate-700 font-medium">{user.phone ?? "—"}</p>
          </div>
        </div>
      </div>

      {user.enterprise_name && (
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">Enterprise</h4>
          </div>
          <p className="text-sm text-slate-700">{user.enterprise_name}</p>
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
            onClick={onConvert}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: "var(--forest)", color: "#EFEAD9" }}
          >
            <UserCog className="h-4 w-4" /> Change Role
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={busy}
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
            style={
              user.is_active
                ? { borderColor: "var(--gold)", color: "#8A6222" }
                : { borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)" }
            }
          >
            {user.is_active ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [page, setPage] = useState(1);
  const [convertOpen, setConvertOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const list = await listCustomers({ role: "individual" }, signal);
      setCustomers(list);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not load users.";
      toast.error("Load failed", msg);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((u) => {
      if (statusFilter === "active" && !u.is_active) return false;
      if (statusFilter === "suspended" && u.is_active) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  }, [customers, query, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const totalUsers = customers.length;
  const activeUsers = customers.filter((u) => u.is_active).length;
  const withPhone = customers.filter((u) => u.phone).length;

  const patchLocal = (updated: Customer) => {
    setCustomers((prev) => {
      // if role changed away from individual, drop it from this list
      if (updated.role !== "individual") return prev.filter((u) => u.id !== updated.id);
      return prev.map((u) => (u.id === updated.id ? updated : u));
    });
    setSelected((cur) => (cur && cur.id === updated.id ? updated : cur));
  };

  const handleToggleStatus = async (u: Customer) => {
    setBusyId(u.id);
    try {
      const updated = await updateCustomerStatus(u.id, !u.is_active);
      patchLocal(updated);
      toast.success(
        updated.is_active ? "User activated" : "User suspended",
        `${updated.name} is now ${updated.is_active ? "active" : "suspended"}.`,
      );
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not update status.";
      toast.error("Update failed", msg);
    } finally {
      setBusyId(null);
    }
  };

  const paged = filtered.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  return (
    <div className="space-y-5">
      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Individual Users"
          value={totalUsers}
          hint="Self-signed-up accounts"
          icon={<Users className="h-5 w-5" style={{ color: "var(--forest)" }} />}
          bg="rgba(23,50,41,.08)"
          color="var(--forest)"
        />
        <StatCard
          label="Active Users"
          value={activeUsers}
          hint="Currently active"
          icon={<CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />}
          bg="var(--sage-dim)"
          color="var(--sage-dark, #3E6A44)"
        />
        <StatCard
          label="With Phone"
          value={withPhone}
          hint="Users who added a phone"
          icon={<Mail className="h-5 w-5" style={{ color: "var(--rust)" }} />}
          bg="var(--rust-dim)"
          color="var(--rust)"
        />
      </div>

      {/* ── Individual Users ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-semibold text-slate-800">Individual Users</p>
          {loading && (
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading…
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--forest)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,50,41,.10)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "suspended")
            }
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Email</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-left">Phone</th>
                <th className="px-4 py-2.5 text-left">Date Joined</th>
                <th className="px-4 py-2.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelected(u)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)" }}
                      >
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3"><Badge status={statusLabel(u)} /></td>
                  <td className="px-4 py-3 text-slate-500">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(u);
                          setConvertOpen(true);
                        }}
                        className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                        style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                      >
                        Change Role
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={busyId === u.id}
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
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    No individual users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          total={filtered.length}
          perPage={USERS_PER_PAGE}
          page={page}
          onChange={setPage}
          itemLabel="users"
        />
      </div>

      <SlidePanel
        isOpen={!!selected && !convertOpen}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.email}
      >
        {selected && (
          <UserDetail
            user={selected}
            busy={busyId === selected.id}
            onConvert={() => setConvertOpen(true)}
            onToggleStatus={() => handleToggleStatus(selected)}
          />
        )}
      </SlidePanel>

      <ConvertUserModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        customer={selected}
        onConverted={patchLocal}
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
          {value}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
