"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Plus, Save, MailWarning, Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Modal, { Field, FieldInput, FieldSelect, FieldRow } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  listAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  setAdminAccountStatus,
  type AdminAccountRecord,
} from "@/services/adminUsers";
import { getPlatformSettings, updatePlatformSettings } from "@/services/platformSettings";

const TABS = ["General Settings", "Email & Notifications", "Admin Accounts"];

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: on ? "#173229" : "#CBD5E1" }}
    >
      <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

interface EmailNotification {
  name: string;
  description: string;
  on: boolean;
  extra: { label: string; value: string } | null;
}

const EMAIL_NOTIFICATIONS: EmailNotification[] = [
  { name: "New User Registration", description: "Alert when a new individual user signs up", on: true, extra: null },
  { name: "New Enterprise Registration", description: "Alert when a new enterprise account is created", on: true, extra: null },
  { name: "Subscription Renewal", description: "Notify when a subscription renews successfully", on: true, extra: null },
  { name: "Payment Failed", description: "Alert when a payment fails for any account", on: true, extra: null },
  { name: "Credit Limit Warning", description: "Alert when an account exceeds 80% of credit limit", on: true, extra: { label: "% threshold", value: "80" } },
  { name: "Subscription Expiry Warning", description: "Notify before a subscription expires", on: true, extra: { label: "Days before expiry", value: "7" } },
  { name: "New Support Ticket", description: "Alert when a new support ticket is submitted", on: false, extra: null },
  { name: "Ticket Escalation", description: "Alert when a ticket is marked as urgent", on: true, extra: null },
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type AdminLevel = "admin" | "super_admin";

const levelLabel = (role: AdminLevel) => (role === "super_admin" ? "Super Admin" : "Admin");

export default function SettingsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "SUPER_ADMIN";
  const [activeTab, setActiveTab] = useState("General Settings");

  /* ── General Settings (persisted via /admin/settings) ──────────────── */
  const [general, setGeneral] = useState({
    platformName: "LeadsBuddy",
    supportEmail: "support@leadsbuddy.ai",
    defaultPlan: "Free",
    newRegistrations: true,
    maintenanceMode: false,
  });
  const [generalLoading, setGeneralLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await getPlatformSettings(controller.signal);
        setGeneral({
          platformName: data.platform_name,
          supportEmail: data.support_email,
          defaultPlan: data.default_plan,
          newRegistrations: data.new_registrations,
          maintenanceMode: data.maintenance_mode,
        });
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        toast.error("Failed to load settings", "Please try again.");
      } finally {
        setGeneralLoading(false);
      }
    })();
    return () => controller.abort();
  }, [toast]);

  const saveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const data = await updatePlatformSettings({
        platform_name: general.platformName,
        support_email: general.supportEmail,
        default_plan: general.defaultPlan,
        new_registrations: general.newRegistrations,
        maintenance_mode: general.maintenanceMode,
      });
      setGeneral({
        platformName: data.platform_name,
        supportEmail: data.support_email,
        defaultPlan: data.default_plan,
        newRegistrations: data.new_registrations,
        maintenanceMode: data.maintenance_mode,
      });
      toast.success("Settings saved", "General platform settings have been updated.");
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Please try again.";
      toast.error("Couldn't save settings", message);
    } finally {
      setSavingGeneral(false);
    }
  };

  /* ── Email & Notifications (static — integrated later) ─────────────── */
  const [notifications, setNotifications] = useState(EMAIL_NOTIFICATIONS);

  const toggleNotification = (name: string) => {
    setNotifications((prev) => prev.map((n) => (n.name === name ? { ...n, on: !n.on } : n)));
  };

  const updateNotificationExtra = (name: string, value: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.name === name && n.extra ? { ...n, extra: { ...n.extra, value } } : n))
    );
  };

  const saveNotifications = () => {
    toast.success("Notification preferences saved", "These rules will take effect once email delivery is wired up.");
  };

  /* ── Admin Accounts (wired to the backend AdminUser table) ─────────── */
  const [admins, setAdmins] = useState<AdminAccountRecord[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccountRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", level: "admin" as AdminLevel });

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const data = await listAdminAccounts();
      setAdmins(data);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      toast.error("Failed to load admin accounts", "Please try again.");
    } finally {
      setAdminsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  const openAdd = () => {
    setForm({ name: "", email: "", password: "", level: "admin" });
    setShowAddAdmin(true);
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submitAdd = async () => {
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !EMAIL_RE.test(email)) {
      toast.warning("Missing information", "Enter a valid name and email address.");
      return;
    }
    if (form.password.length < 8) {
      toast.warning("Weak password", "Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      await createAdminAccount({ name, email, password: form.password, role: form.level });
      toast.success("Admin added", `${name} has been added to Admin Accounts.`);
      setShowAddAdmin(false);
      void fetchAdmins();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Please try again.";
      toast.error("Couldn't add admin", message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (admin: AdminAccountRecord) => {
    setForm({ name: admin.name, email: admin.email, password: "", level: admin.role });
    setEditingAdmin(admin);
  };

  const submitEdit = async () => {
    if (!editingAdmin) return;
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !EMAIL_RE.test(email)) {
      toast.warning("Missing information", "Enter a valid name and email address.");
      return;
    }
    setSaving(true);
    try {
      await updateAdminAccount(editingAdmin.id, { name, email, role: form.level });
      toast.success("Admin updated", `Changes to ${name} have been saved.`);
      setEditingAdmin(null);
      void fetchAdmins();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Please try again.";
      toast.error("Couldn't update admin", message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDeactivate = async (admin: AdminAccountRecord) => {
    const nextActive = !admin.is_active;
    try {
      await setAdminAccountStatus(admin.id, nextActive);
      toast.info(
        nextActive ? "Admin reactivated" : "Admin deactivated",
        `${admin.name} is now ${nextActive ? "active" : "inactive"}.`
      );
      void fetchAdmins();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Please try again.";
      toast.error("Couldn't update status", message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab ? "border-b-2 text-[#173229]" : "text-slate-500 hover:text-slate-700"
              }`}
              style={activeTab === tab ? { borderColor: "#173229" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "General Settings" && (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {generalLoading && (
            <div className="flex items-center justify-center px-6 py-12">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          )}
          {!generalLoading && general.maintenanceMode && (
            <div
              className="flex items-start gap-2.5 px-6 py-3 text-xs"
              style={{ background: "#FDEEEE", color: "#B42318" }}
            >
              <MailWarning className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Maintenance Mode is currently ON. All users are being shown the maintenance page.</p>
            </div>
          )}
          {!generalLoading && !isSuperAdmin && (
            <div
              className="flex items-start gap-2.5 px-6 py-3 text-xs"
              style={{ background: "#FDF8EC", color: "#8A6222" }}
            >
              <MailWarning className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Only Super Admins can change these settings. You can view the current values below.</p>
            </div>
          )}
          {!generalLoading && (
          <>
          {/* Platform Name */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Platform Name</p>
              <p className="text-xs text-slate-500 mt-0.5">Displayed throughout the admin portal.</p>
            </div>
            <input
              value={general.platformName}
              disabled={!isSuperAdmin}
              onChange={(e) => setGeneral((g) => ({ ...g, platformName: e.target.value }))}
              className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)] disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Support Email */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Support Email</p>
              <p className="text-xs text-slate-500 mt-0.5">Email address shown to users for support queries.</p>
            </div>
            <input
              type="email"
              value={general.supportEmail}
              disabled={!isSuperAdmin}
              onChange={(e) => setGeneral((g) => ({ ...g, supportEmail: e.target.value }))}
              className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)] disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Default Plan */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Default Plan for New Sign-ups</p>
              <p className="text-xs text-slate-500 mt-0.5">Plan assigned automatically on new registration.</p>
            </div>
            <select
              value={general.defaultPlan}
              disabled={!isSuperAdmin}
              onChange={(e) => setGeneral((g) => ({ ...g, defaultPlan: e.target.value }))}
              className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)] disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option>Free</option>
              <option>Pro</option>
              <option>Business</option>
            </select>
          </div>

          {/* New Registrations */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">New Registrations</p>
              <p className="text-xs text-slate-500 mt-0.5">Allow new users to register on the platform.</p>
            </div>
            <Toggle
              on={general.newRegistrations}
              disabled={!isSuperAdmin}
              onChange={() => setGeneral((g) => ({ ...g, newRegistrations: !g.newRegistrations }))}
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Maintenance Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Temporarily disables the platform for all users.</p>
            </div>
            <Toggle
              on={general.maintenanceMode}
              disabled={!isSuperAdmin}
              onChange={() => setGeneral((g) => ({ ...g, maintenanceMode: !g.maintenanceMode }))}
            />
          </div>

          {/* Save */}
          {isSuperAdmin && (
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-xs text-slate-400">Changes apply immediately to all users on the customer app.</p>
              <button
                type="button"
                disabled={savingGeneral}
                onClick={saveGeneral}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                style={{ background: "#173229", color: "#EFEAD9" }}
              >
                {savingGeneral ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingGeneral ? "Saving…" : "Save Settings"}
              </button>
            </div>
          )}
          </>
          )}
        </div>
      )}

      {activeTab === "Email & Notifications" && (
        <div className="space-y-5">
          {/* Notification rules */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Notification Rules</p>
              <p className="text-xs text-slate-500 mt-0.5">Choose which system events trigger a notification email.</p>
            </div>
            {notifications.map((notif) => (
              <div key={notif.name} className="px-6 py-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{notif.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.description}</p>
                    {notif.extra && notif.on && (
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs text-slate-500">{notif.extra.label}:</label>
                        <input
                          value={notif.extra.value}
                          onChange={(e) => updateNotificationExtra(notif.name, e.target.value)}
                          className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
                        />
                      </div>
                    )}
                  </div>
                  <Toggle on={notif.on} onChange={() => toggleNotification(notif.name)} />
                </div>
              </div>
            ))}
            <div className="flex justify-end px-6 py-4">
              <button
                type="button"
                onClick={saveNotifications}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
                style={{ background: "#173229", color: "#EFEAD9" }}
              >
                <Save className="h-4 w-4" /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Admin Accounts" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Manage admin users and their access levels.</p>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "#173229", color: "#EFEAD9" }}
            >
              <Plus className="h-4 w-4" /> Add Admin
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5 text-left">Name</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">Access Level</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Date Added</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminsLoading && admins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                    </td>
                  </tr>
                )}
                {!adminsLoading && admins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                      No admin accounts found.
                    </td>
                  </tr>
                )}
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    style={admin.is_you ? { background: "rgba(23,50,41,.04)" } : {}}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgba(23,50,41,.10)", color: "#173229" }}>
                          {initialsOf(admin.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{admin.name}</p>
                          {admin.is_you && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#173229" }}>You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
                        style={
                          admin.role === "super_admin"
                            ? { background: "rgba(23,50,41,.08)", color: "#173229", borderColor: "rgba(23,50,41,.18)" }
                            : { background: "#F6ECD4", color: "#8A6222", borderColor: "#E8D5A3" }
                        }
                      >
                        {levelLabel(admin.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge status={admin.is_active ? "active" : "inactive"} /></td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(admin.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(admin)}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </button>
                        {!admin.is_you && (
                          <button
                            type="button"
                            onClick={() => toggleDeactivate(admin)}
                            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{ borderColor: "#E0C0C8", color: "#B15169" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(177,81,105,.07)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                          >
                            {admin.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={showAddAdmin}
        onClose={() => setShowAddAdmin(false)}
        eyebrow="Admin Accounts · new record"
        title="Add Admin"
        submitLabel={saving ? "Adding…" : "Add Admin"}
        onSubmit={submitAdd}
      >
        <Field label="Full name">
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Doe"
            autoFocus
          />
        </Field>
        <FieldRow>
          <Field label="Email">
            <FieldInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jane@leadsbuddy.ai"
            />
          </Field>
          <Field label="Access Level">
            <FieldSelect
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as AdminLevel }))}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </FieldSelect>
          </Field>
        </FieldRow>
        <Field label="Temporary password" hint="At least 8 characters">
          <FieldInput
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
          />
        </Field>
      </Modal>

      <Modal
        open={!!editingAdmin}
        onClose={() => setEditingAdmin(null)}
        eyebrow="Admin Accounts · edit"
        title="Edit Admin"
        submitLabel={saving ? "Saving…" : "Save Changes"}
        onSubmit={submitEdit}
      >
        <Field label="Full name">
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
        </Field>
        <FieldRow>
          <Field label="Email">
            <FieldInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field label="Access Level">
            <FieldSelect
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as AdminLevel }))}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </FieldSelect>
          </Field>
        </FieldRow>
      </Modal>
    </div>
  );
}
