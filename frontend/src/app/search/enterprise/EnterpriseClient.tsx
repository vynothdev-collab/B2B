"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiAllocateCreditsToMember,
  apiCreateEnterpriseUser,
  apiGetMyEnterprise,
  apiListEnterpriseMembers,
  apiUpdateEnterpriseMemberStatus,
  apiUpdateMyEnterprise,
  type EnterpriseMe,
  type EnterpriseMember,
} from "@/lib/enterpriseApi";
import { toast } from "@/lib/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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

export default function EnterpriseClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [enterprise, setEnterprise] = useState<EnterpriseMe | null>(null);
  const [members, setMembers] = useState<EnterpriseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<EnterpriseMember | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [allocateTarget, setAllocateTarget] = useState<EnterpriseMember | null>(null);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "enterprise_admin") {
      router.replace("/search");
    }
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ent, mem] = await Promise.all([apiGetMyEnterprise(), apiListEnterpriseMembers()]);
      setEnterprise(ent);
      setMembers(mem);
    } catch (e) {
      toast.apiError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "enterprise_admin") void load();
  }, [user, load]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q),
    );
  }, [members, query]);

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.is_active).length;
  const adminCount = members.filter((m) => m.role === "enterprise_admin").length;

  const handleToggleStatus = async (m: EnterpriseMember) => {
    setBusyId(m.id);
    try {
      const updated = await apiUpdateEnterpriseMemberStatus(m.id, !m.is_active);
      setMembers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(
        updated.is_active ? `${updated.name} is now active.` : `${updated.name} has been suspended.`,
      );
    } catch (e) {
      toast.apiError(e);
    } finally {
      setBusyId(null);
      setPendingToggle(null);
    }
  };

  if (authLoading || (user && user.role !== "enterprise_admin")) {
    return (
      <>
        <AppHeader title="My Team" />
        <div className="flex h-full items-center justify-center py-24 text-sm text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> loading…
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="My Team" />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto w-full max-w-7xl space-y-5">

          {/* ── Page intro + primary action ──────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Manage the people at{" "}
              <span className="font-medium text-gray-700">{enterprise?.name ?? "your enterprise"}</span>{" "}
              and how their search credits are allocated.
            </p>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
            >
              <Plus className="h-4 w-4" /> Add Team Member
            </button>
          </div>

          {/* ── Enterprise summary card ──────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {loading && !enterprise ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> loading enterprise…
              </div>
            ) : enterprise ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-800">Company Details</p>
                  <button
                    type="button"
                    onClick={() => setEditCompanyOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Company Details
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Company
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-900">{enterprise.name}</p>
                      <p className="truncate text-xs text-gray-500">{enterprise.industry ?? "—"}</p>
                    </div>
                  </div>
                  <InfoTile label="Plan" value={enterprise.plan} icon={<CreditCard className="h-4 w-4" />} />
                  <InfoTile
                    label="Available Pool"
                    value={`${enterprise.credits.toLocaleString()} credits`}
                    icon={<CreditCard className="h-4 w-4" />}
                  />
                  {enterprise.website && (
                    <InfoTile
                      label="Website"
                      value={enterprise.website}
                      icon={<Globe className="h-4 w-4" />}
                    />
                  )}
                  {enterprise.phone && (
                    <InfoTile label="Phone" value={enterprise.phone} icon={<Phone className="h-4 w-4" />} />
                  )}
                  {enterprise.country && <InfoTile label="Country" value={enterprise.country} />}
                  {enterprise.size && <InfoTile label="Size" value={enterprise.size} />}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Enterprise not found.</p>
            )}
          </div>

          {/* ── Stat strip ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Total Members"
              value={totalMembers}
              icon={<Users className="h-5 w-5" />}
              tint="bg-gray-100 text-gray-600"
              valueColor="text-gray-900"
            />
            <StatCard
              label="Active"
              value={activeMembers}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tint="bg-emerald-50 text-emerald-600"
              valueColor="text-emerald-600"
            />
            <StatCard
              label="Admins"
              value={adminCount}
              icon={<ShieldCheck className="h-5 w-5" />}
              tint="bg-red-50 text-red-600"
              valueColor="text-red-600"
            />
          </div>

          {/* ── Members table ─────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-800">Team Members</p>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
              </div>
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500">
                    <th className="px-4 py-2.5 text-left">Name</th>
                    <th className="px-4 py-2.5 text-left">Email</th>
                    <th className="px-4 py-2.5 text-left">Role</th>
                    <th className="px-4 py-2.5 text-left">Status</th>
                    <th className="px-4 py-2.5 text-right">Allocated</th>
                    <th className="px-4 py-2.5 text-right">Used</th>
                    <th className="px-4 py-2.5 text-right">Remaining</th>
                    <th className="px-4 py-2.5 text-left">Added</th>
                    <th className="px-4 py-2.5 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600">
                            {initials(m.name)}
                          </div>
                          <span className="font-medium text-gray-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            m.role === "enterprise_admin"
                              ? "rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700"
                              : "rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600"
                          }
                        >
                          {m.role === "enterprise_admin" ? "Admin" : "Member"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            m.is_active
                              ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                              : "rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500"
                          }
                        >
                          {m.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        {m.allocated_credits.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {m.used_credits.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            m.remaining_credits <= 0
                              ? "text-sm font-semibold text-red-600"
                              : m.allocated_credits > 0 && m.remaining_credits / m.allocated_credits < 0.2
                              ? "text-sm font-semibold text-amber-600"
                              : "text-sm font-semibold text-emerald-600"
                          }
                        >
                          {m.remaining_credits.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(m.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAllocateTarget(m)}
                            className="rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Allocate Credits
                          </button>
                          {m.id === user?.id ? (
                            <span className="text-xs text-gray-400">You</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingToggle(m)}
                              disabled={busyId === m.id}
                              className={
                                m.is_active
                                  ? "rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                  : "rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                              }
                            >
                              {m.is_active ? "Suspend" : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <p className="text-sm text-gray-400">
                            {query
                              ? "No members match your search."
                              : "No team members yet — click Add Team Member to invite one."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <EditCompanyModal
        open={editCompanyOpen}
        enterprise={enterprise}
        onClose={() => setEditCompanyOpen(false)}
        onUpdated={(updated) => {
          setEnterprise(updated);
          setEditCompanyOpen(false);
        }}
      />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onCreated={(m) => setMembers((prev) => [m, ...prev])}
      />

      <AllocateCreditsModal
        key={allocateTarget?.id ?? ""}
        open={!!allocateTarget}
        member={allocateTarget}
        enterprisePool={enterprise?.credits ?? 0}
        onClose={() => setAllocateTarget(null)}
        onAllocated={(updated, newPool) => {
          setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          setEnterprise((prev) => prev ? { ...prev, credits: newPool } : prev);
          setAllocateTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!pendingToggle}
        title={pendingToggle?.is_active ? "Suspend member?" : "Activate member?"}
        message={
          pendingToggle
            ? pendingToggle.is_active
              ? `${pendingToggle.name} will no longer be able to sign in.`
              : `${pendingToggle.name} will regain access to the app.`
            : ""
        }
        icon={<ShieldCheck className="h-4 w-4 text-red-500" />}
        confirmLabel={pendingToggle?.is_active ? "Suspend" : "Activate"}
        cancelLabel="Cancel"
        variant={pendingToggle?.is_active ? "danger" : "info"}
        loading={!!busyId && !!pendingToggle && busyId === pendingToggle.id}
        onClose={() => setPendingToggle(null)}
        onConfirm={() => pendingToggle && handleToggleStatus(pendingToggle)}
      />
    </>
  );
}

/* ── Small helpers ─────────────────────────────────────────── */

function InfoTile({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-gray-400">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="truncate text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
  valueColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tint: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tint}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

/* ── Invite modal ──────────────────────────────────────────── */

interface InviteProps {
  open: boolean;
  onClose: () => void;
  onCreated: (m: EnterpriseMember) => void;
}

function InviteMemberModal({ open, onClose, onCreated }: InviteProps) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const update = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleClose = () => {
    if (submitting) return;
    setForm({ name: "", email: "", password: "", phone: "" });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.warning("Name, email and password are required.");
      return;
    }
    if (form.password.length < 8) {
      toast.warning("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiCreateEnterpriseUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      toast.success(`${created.name} added to your team.`);
      onCreated(created);
      setForm({ name: "", email: "", password: "", phone: "" });
      onClose();
    } catch (e) {
      toast.apiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900">Add Team Member</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <Field label="Full name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
              autoFocus
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="jane@company.com"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </Field>
          <Field label="Temporary password" hint="min 8 chars">
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </Field>
          <Field label="Phone" hint="optional">
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555-0100"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
            {submitting ? "Adding…" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-700">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Edit Company Details modal ───────────────────────────────── */

interface EditCompanyProps {
  open: boolean;
  enterprise: EnterpriseMe | null;
  onClose: () => void;
  onUpdated: (ent: EnterpriseMe) => void;
}

function EditCompanyModal({ open, enterprise, onClose, onUpdated }: EditCompanyProps) {
  const [form, setForm] = useState({
    name: "",
    industry: "",
    website: "",
    country: "",
    size: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && enterprise) {
      setForm({
        name: enterprise.name ?? "",
        industry: enterprise.industry ?? "",
        website: enterprise.website ?? "",
        country: enterprise.country ?? "",
        size: enterprise.size ?? "",
        phone: enterprise.phone ?? "",
      });
    }
  }, [open, enterprise]);

  if (!open || !enterprise) return null;

  const update = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.warning("Company name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await apiUpdateMyEnterprise({
        name: form.name.trim(),
        industry: form.industry.trim() || null,
        website: form.website.trim() || null,
        country: form.country.trim() || null,
        size: form.size.trim() || null,
        phone: form.phone.trim() || null,
      });
      toast.success("Company details updated.");
      onUpdated(updated);
    } catch (e) {
      toast.apiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900">Edit Company Details</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <Field label="Company name *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Acme Inc."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
              autoFocus
            />
          </Field>
          <Field label="Industry" hint="optional">
            <input
              type="text"
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="e.g. Software"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </Field>
          <Field label="Website" hint="optional">
            <input
              type="text"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </Field>
          <Field label="Phone" hint="optional">
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555-0100"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country" hint="optional">
              <input
                type="text"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="United States"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
              />
            </Field>
            <Field label="Size" hint="optional">
              <input
                type="text"
                value={form.size}
                onChange={(e) => update("size", e.target.value)}
                placeholder="e.g. 50-200"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
              />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Allocate Credits modal ─────────────────────────────────── */

interface AllocateProps {
  open: boolean;
  member: EnterpriseMember | null;
  enterprisePool: number;
  onClose: () => void;
  onAllocated: (updated: EnterpriseMember, newPool: number) => void;
}

function AllocateCreditsModal({ open, member, enterprisePool, onClose, onAllocated }: AllocateProps) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open || !member) return null;

  const handleClose = () => {
    if (submitting) return;
    setAmount("");
    onClose();
  };

  const handleSubmit = async () => {
    const credits = parseInt(amount, 10);
    if (!credits || credits <= 0) {
      toast.warning("Please enter a valid number of credits.");
      return;
    }
    if (credits > enterprisePool) {
      toast.error(`Insufficient enterprise pool. Only ${enterprisePool.toLocaleString()} credits available.`);
      return;
    }
    setSubmitting(true);
    try {
      const updated = await apiAllocateCreditsToMember(member.id, { credits });
      toast.success(`${credits.toLocaleString()} credits allocated to ${member.name}.`);
      onAllocated(updated, enterprisePool - credits);
      setAmount("");
    } catch (e) {
      toast.apiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Allocate Credits</h2>
              <p className="text-xs text-gray-500">to {member.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Available Enterprise Pool</p>
            <p className="mt-0.5 text-lg font-bold text-blue-700">{enterprisePool.toLocaleString()} credits</p>
          </div>
          <Field label="Credits to allocate *">
            <input
              type="number"
              min={1}
              max={enterprisePool}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
            {submitting ? "Allocating…" : "Allocate →"}
          </button>
        </div>
      </div>
    </div>
  );
}
