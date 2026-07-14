"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import Badge from "@/components/ui/Badge";

const TABS = ["General Settings", "Email & Notifications", "Admin Accounts"];

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${on ? "bg-blue-600" : "bg-slate-200"}`}>
      <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  );
}

const EMAIL_NOTIFICATIONS = [
  { name: "New User Registration", description: "Alert when a new individual user signs up", on: true, extra: null },
  { name: "New Enterprise Registration", description: "Alert when a new enterprise account is created", on: true, extra: null },
  { name: "Subscription Renewal", description: "Notify when a subscription renews successfully", on: true, extra: null },
  { name: "Payment Failed", description: "Alert when a payment fails for any account", on: true, extra: null },
  { name: "Credit Limit Warning", description: "Alert when an account exceeds 80% of credit limit", on: true, extra: { label: "% threshold", value: "80" } },
  { name: "Subscription Expiry Warning", description: "Notify before a subscription expires", on: true, extra: { label: "Days before expiry", value: "7" } },
  { name: "New Support Ticket", description: "Alert when a new support ticket is submitted", on: false, extra: null },
  { name: "Ticket Escalation", description: "Alert when a ticket is marked as urgent", on: true, extra: null },
];

const ADMIN_ACCOUNTS = [
  { name: "System Administrator", initials: "SA", email: "admin@leadsbuddy.ai", level: "Super Admin", status: "active", added: "Jan 1, 2025", lastLogin: "Today, 8:00 AM", isYou: true },
  { name: "Ravi Kumar", initials: "RK", email: "ravi@leadsbuddy.ai", level: "Admin", status: "active", added: "Mar 15, 2025", lastLogin: "Yesterday, 5:30 PM", isYou: false },
  { name: "Jessica Moore", initials: "JM", email: "jessica@leadsbuddy.ai", level: "Admin", status: "active", added: "Apr 10, 2025", lastLogin: "Jul 12, 2025", isYou: false },
  { name: "Dev Reviewer", initials: "DR", email: "dev@leadsbuddy.ai", level: "Read Only", status: "inactive", added: "Feb 28, 2025", lastLogin: "Jun 20, 2025", isYou: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "General Settings" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {/* Platform Name */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Platform Name</p>
              <p className="text-xs text-slate-500 mt-0.5">Displayed throughout the admin portal.</p>
            </div>
            <input
              defaultValue="LeadsBuddy"
              className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              defaultValue="support@leadsbuddy.ai"
              className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Default Plan */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Default Plan for New Sign-ups</p>
              <p className="text-xs text-slate-500 mt-0.5">Plan assigned automatically on new registration.</p>
            </div>
            <select className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline-none">
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
            <Toggle on={true} />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex-1 max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Maintenance Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Temporarily disables the platform for all users.</p>
            </div>
            <Toggle on={false} />
          </div>

          {/* Save */}
          <div className="flex justify-end px-6 py-4">
            <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === "Email & Notifications" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {EMAIL_NOTIFICATIONS.map((notif, i) => (
            <div key={i} className="px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{notif.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{notif.description}</p>
                  {notif.extra && notif.on && (
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-xs text-slate-500">{notif.extra.label}:</label>
                      <input
                        defaultValue={notif.extra.value}
                        className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
                <Toggle on={notif.on} />
              </div>
            </div>
          ))}
          <div className="flex justify-end px-6 py-4">
            <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === "Admin Accounts" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Manage admin users and their access levels.</p>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Plus className="h-4 w-4" /> Add Admin
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Access Level</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Date Added</th>
                  <th className="px-5 py-3 text-left font-semibold">Last Login</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_ACCOUNTS.map((admin, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${admin.isYou ? "bg-blue-50/40" : ""}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {admin.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{admin.name}</p>
                          {admin.isYou && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{admin.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        admin.level === "Super Admin"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : admin.level === "Admin"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {admin.level}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><Badge status={admin.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{admin.added}</td>
                    <td className="px-5 py-3.5 text-slate-500">{admin.lastLogin}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                        {!admin.isYou && (
                          <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Deactivate</button>
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
    </div>
  );
}
