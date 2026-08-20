"use client";

import { useState } from "react";
import { Plus, Save, Pencil, MailWarning } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Modal, { Field, FieldInput, FieldSelect, FieldRow, FieldTextarea } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const TABS = ["General Settings", "Email & Notifications", "Admin Accounts"];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
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

interface EmailTemplate {
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    key: "welcome",
    name: "Welcome Email",
    description: "Sent when a new account finishes registration",
    subject: "Welcome to {{platform_name}}, {{first_name}}!",
    body: "Hi {{first_name}},\n\nYour {{platform_name}} account is ready. Log in to start searching for leads.\n\n— The {{platform_name}} Team",
  },
  {
    key: "password_reset",
    name: "Password Reset",
    description: "Sent when a user requests a password reset",
    subject: "Reset your {{platform_name}} password",
    body: "Hi {{first_name}},\n\nClick the link below to reset your password. This link expires in 30 minutes.\n\n{{reset_link}}\n\nIf you didn't request this, you can ignore this email.",
  },
  {
    key: "payment_receipt",
    name: "Payment Receipt",
    description: "Sent after a successful payment or subscription renewal",
    subject: "Your {{platform_name}} receipt — {{invoice_number}}",
    body: "Hi {{first_name}},\n\nThanks for your payment of {{amount}} for the {{plan_name}} plan.\n\nInvoice: {{invoice_number}}\nDate: {{payment_date}}",
  },
  {
    key: "subscription_expiry",
    name: "Subscription Expiry Warning",
    description: "Sent before a subscription lapses",
    subject: "Your {{platform_name}} plan expires in {{days_left}} days",
    body: "Hi {{first_name}},\n\nYour {{plan_name}} plan expires on {{expiry_date}}. Renew now to avoid interruption to your searches and unlocks.",
  },
  {
    key: "credit_limit_warning",
    name: "Credit Limit Warning",
    description: "Sent when an account crosses the configured credit threshold",
    subject: "You've used {{percent_used}}% of your {{platform_name}} credits",
    body: "Hi {{first_name}},\n\nYou've used {{percent_used}}% of your monthly credit allocation. Consider upgrading your plan to avoid running out mid-month.",
  },
  {
    key: "ticket_confirmation",
    name: "Support Ticket Confirmation",
    description: "Sent when a support ticket is submitted",
    subject: "We've received your ticket #{{ticket_id}}",
    body: "Hi {{first_name}},\n\nThanks for reaching out. Our team will respond to ticket #{{ticket_id}} within 24 hours.",
  },
];

interface AdminAccount {
  name: string;
  initials: string;
  email: string;
  level: "Super Admin" | "Admin" | "Read Only";
  status: "active" | "inactive";
  added: string;
  lastLogin: string;
  isYou: boolean;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  { name: "System Administrator", initials: "SA", email: "admin@leadsbuddy.ai", level: "Super Admin", status: "active", added: "Jan 1, 2025", lastLogin: "Today, 8:00 AM", isYou: true },
  { name: "Ravi Kumar", initials: "RK", email: "ravi@leadsbuddy.ai", level: "Admin", status: "active", added: "Mar 15, 2025", lastLogin: "Yesterday, 5:30 PM", isYou: false },
  { name: "Jessica Moore", initials: "JM", email: "jessica@leadsbuddy.ai", level: "Admin", status: "active", added: "Apr 10, 2025", lastLogin: "Jul 12, 2025", isYou: false },
  { name: "Dev Reviewer", initials: "DR", email: "dev@leadsbuddy.ai", level: "Read Only", status: "inactive", added: "Feb 28, 2025", lastLogin: "Jun 20, 2025", isYou: false },
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("General Settings");

  /* ── General Settings (static — no backend yet) ────────────────────── */
  const [general, setGeneral] = useState({
    platformName: "LeadsBuddy",
    supportEmail: "support@leadsbuddy.ai",
    defaultPlan: "Free",
    newRegistrations: true,
    maintenanceMode: false,
  });

  const saveGeneral = () => {
    toast.success("Settings saved", "General platform settings have been updated.");
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

  /* ── Email Sender Configuration (static — no email provider integrated yet) ── */
  const [sender, setSender] = useState({
    provider: "SMTP",
    fromName: "LeadsBuddy",
    fromEmail: "no-reply@leadsbuddy.ai",
    replyTo: "support@leadsbuddy.ai",
    sendingEnabled: false,
  });

  const saveSender = () => {
    toast.info(
      "Saved locally",
      "Sender details are stored for later — no email provider is connected yet, so no mail will send."
    );
  };

  /* ── Email Templates (static — content only, not wired to a mailer) ── */
  const [templates, setTemplates] = useState(EMAIL_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", body: "" });

  const openEditTemplate = (tpl: EmailTemplate) => {
    setTemplateForm({ subject: tpl.subject, body: tpl.body });
    setEditingTemplate(tpl);
  };

  const submitTemplate = () => {
    if (!editingTemplate) return;
    if (!templateForm.subject.trim() || !templateForm.body.trim()) {
      toast.warning("Missing information", "Both subject and body are required.");
      return;
    }
    setTemplates((prev) =>
      prev.map((t) =>
        t.key === editingTemplate.key ? { ...t, subject: templateForm.subject, body: templateForm.body } : t
      )
    );
    toast.success("Template saved", `${editingTemplate.name} has been updated. It will be used once email sending is enabled.`);
    setEditingTemplate(null);
  };

  /* ── Admin Accounts (local mock — creation isn't wired to a real API) ── */
  const [admins, setAdmins] = useState(ADMIN_ACCOUNTS);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState({ name: "", email: "", level: "Admin" as AdminAccount["level"] });

  const openAdd = () => {
    setForm({ name: "", email: "", level: "Admin" });
    setShowAddAdmin(true);
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submitAdd = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !EMAIL_RE.test(email)) {
      toast.warning("Missing information", "Enter a valid name and email address.");
      return;
    }
    if (admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      toast.error("Already exists", "An admin with this email is already listed.");
      return;
    }
    setAdmins((prev) => [
      ...prev,
      {
        name,
        initials: initialsOf(name),
        email,
        level: form.level,
        status: "active",
        added: todayLabel(),
        lastLogin: "—",
        isYou: false,
      },
    ]);
    toast.success("Admin added", `${name} has been added to Admin Accounts.`);
    setShowAddAdmin(false);
  };

  const openEdit = (admin: AdminAccount) => {
    setForm({ name: admin.name, email: admin.email, level: admin.level });
    setEditingAdmin(admin);
  };

  const submitEdit = () => {
    if (!editingAdmin) return;
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !EMAIL_RE.test(email)) {
      toast.warning("Missing information", "Enter a valid name and email address.");
      return;
    }
    setAdmins((prev) =>
      prev.map((a) => (a.email === editingAdmin.email ? { ...a, name, email, level: form.level } : a))
    );
    toast.success("Admin updated", `Changes to ${name} have been saved.`);
    setEditingAdmin(null);
  };

  const toggleDeactivate = (admin: AdminAccount) => {
    const nextStatus = admin.status === "active" ? "inactive" : "active";
    setAdmins((prev) => prev.map((a) => (a.email === admin.email ? { ...a, status: nextStatus } : a)));
    toast.info(
      nextStatus === "inactive" ? "Admin deactivated" : "Admin reactivated",
      `${admin.name} is now ${nextStatus}.`
    );
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
          {/* Platform Name */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Platform Name</p>
              <p className="text-xs text-slate-500 mt-0.5">Displayed throughout the admin portal.</p>
            </div>
            <input
              value={general.platformName}
              onChange={(e) => setGeneral((g) => ({ ...g, platformName: e.target.value }))}
              className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
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
              onChange={(e) => setGeneral((g) => ({ ...g, supportEmail: e.target.value }))}
              className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
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
              onChange={(e) => setGeneral((g) => ({ ...g, defaultPlan: e.target.value }))}
              className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
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
            <Toggle on={general.newRegistrations} onChange={() => setGeneral((g) => ({ ...g, newRegistrations: !g.newRegistrations }))} />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Maintenance Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Temporarily disables the platform for all users.</p>
            </div>
            <Toggle on={general.maintenanceMode} onChange={() => setGeneral((g) => ({ ...g, maintenanceMode: !g.maintenanceMode }))} />
          </div>

          {/* Save */}
          <div className="flex justify-end px-6 py-4">
            <button
              type="button"
              onClick={saveGeneral}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "#173229", color: "#EFEAD9" }}
            >
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === "Email & Notifications" && (
        <div className="space-y-5">
          {/* Not-integrated banner */}
          <div
            className="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs"
            style={{ background: "#FDF8EC", borderColor: "#E8D5A3", color: "#8A6222" }}
          >
            <MailWarning className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              No email provider is connected yet. Sender details, templates, and notification rules below are saved
              locally in the admin panel so they&apos;re ready to go — nothing here sends real email until an SMTP
              or transactional email service is integrated on the backend.
            </p>
          </div>

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

          {/* Sender configuration */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Email Sender Configuration</p>
              <p className="text-xs text-slate-500 mt-0.5">Who outgoing mail will appear to be from, once a provider is connected.</p>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-800">Email Provider</p>
                <p className="text-xs text-slate-500 mt-0.5">Transactional email service used to send platform emails.</p>
              </div>
              <select
                value={sender.provider}
                onChange={(e) => setSender((s) => ({ ...s, provider: e.target.value }))}
                className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
              >
                <option>SMTP</option>
                <option>SendGrid</option>
                <option>Mailgun</option>
                <option>Amazon SES</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-800">From Name</p>
                <p className="text-xs text-slate-500 mt-0.5">Display name recipients see in their inbox.</p>
              </div>
              <input
                value={sender.fromName}
                onChange={(e) => setSender((s) => ({ ...s, fromName: e.target.value }))}
                className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-800">From Email</p>
                <p className="text-xs text-slate-500 mt-0.5">Sending address used for all outbound notifications.</p>
              </div>
              <input
                type="email"
                value={sender.fromEmail}
                onChange={(e) => setSender((s) => ({ ...s, fromEmail: e.target.value }))}
                className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-800">Reply-To Email</p>
                <p className="text-xs text-slate-500 mt-0.5">Where user replies to platform emails are routed.</p>
              </div>
              <input
                type="email"
                value={sender.replyTo}
                onChange={(e) => setSender((s) => ({ ...s, replyTo: e.target.value }))}
                className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-800">Email Sending</p>
                <p className="text-xs text-slate-500 mt-0.5">Stays off until a provider is connected on the backend.</p>
              </div>
              <Toggle on={sender.sendingEnabled} onChange={() => setSender((s) => ({ ...s, sendingEnabled: !s.sendingEnabled }))} />
            </div>

            <div className="flex justify-end px-6 py-4">
              <button
                type="button"
                onClick={saveSender}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
                style={{ background: "#173229", color: "#EFEAD9" }}
              >
                <Save className="h-4 w-4" /> Save Settings
              </button>
            </div>
          </div>

          {/* Email templates */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Email Templates</p>
              <p className="text-xs text-slate-500 mt-0.5">Subject and body content used once each notification is sent.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {templates.map((tpl) => (
                <div key={tpl.key} className="flex items-start justify-between gap-6 px-6 py-5">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{tpl.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tpl.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Subject: <span className="text-slate-600">{tpl.subject}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditTemplate(tpl)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              ))}
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
                  <th className="px-4 py-2.5 text-left">Last Login</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.email}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    style={admin.isYou ? { background: "rgba(23,50,41,.04)" } : {}}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgba(23,50,41,.10)", color: "#173229" }}>
                          {admin.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{admin.name}</p>
                          {admin.isYou && (
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
                          admin.level === "Super Admin"
                            ? { background: "rgba(23,50,41,.08)", color: "#173229", borderColor: "rgba(23,50,41,.18)" }
                            : admin.level === "Admin"
                            ? { background: "#F6ECD4", color: "#8A6222", borderColor: "#E8D5A3" }
                            : { background: "#F1F5F9", color: "#64748B", borderColor: "#CBD5E1" }
                        }
                      >
                        {admin.level}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge status={admin.status} /></td>
                    <td className="px-4 py-3 text-slate-500">{admin.added}</td>
                    <td className="px-4 py-3 text-slate-500">{admin.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(admin)}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </button>
                        {!admin.isYou && (
                          <button
                            type="button"
                            onClick={() => toggleDeactivate(admin)}
                            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{ borderColor: "#E0C0C8", color: "#B15169" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(177,81,105,.07)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                          >
                            {admin.status === "active" ? "Deactivate" : "Reactivate"}
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
        open={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        eyebrow="Email Templates · edit"
        title={editingTemplate?.name ?? ""}
        submitLabel="Save Template"
        onSubmit={submitTemplate}
        footerHint="Saved locally — won't send until an email provider is connected."
      >
        <Field label="Subject" hint="supports {{placeholders}}">
          <FieldInput
            value={templateForm.subject}
            onChange={(e) => setTemplateForm((f) => ({ ...f, subject: e.target.value }))}
            autoFocus
          />
        </Field>
        <Field label="Body" hint="supports {{placeholders}}">
          <FieldTextarea
            value={templateForm.body}
            onChange={(e) => setTemplateForm((f) => ({ ...f, body: e.target.value }))}
            rows={8}
          />
        </Field>
      </Modal>

      <Modal
        open={showAddAdmin}
        onClose={() => setShowAddAdmin(false)}
        eyebrow="Admin Accounts · new record"
        title="Add Admin"
        submitLabel="Add Admin"
        onSubmit={submitAdd}
        footerHint="This adds a local record only — account creation isn't wired to the backend yet."
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
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as AdminAccount["level"] }))}
            >
              <option>Admin</option>
              <option>Super Admin</option>
              <option>Read Only</option>
            </FieldSelect>
          </Field>
        </FieldRow>
      </Modal>

      <Modal
        open={!!editingAdmin}
        onClose={() => setEditingAdmin(null)}
        eyebrow="Admin Accounts · edit"
        title="Edit Admin"
        submitLabel="Save Changes"
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
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as AdminAccount["level"] }))}
            >
              <option>Admin</option>
              <option>Super Admin</option>
              <option>Read Only</option>
            </FieldSelect>
          </Field>
        </FieldRow>
      </Modal>
    </div>
  );
}
