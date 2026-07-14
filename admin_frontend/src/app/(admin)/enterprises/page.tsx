"use client";

import { useState } from "react";
import { Search, Plus, Send, Building2, CreditCard, Users, Globe, Phone, Mail, ShieldCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SlidePanel from "@/components/ui/SlidePanel";
import { ENTERPRISES, ENT_USERS, ENT_INVITATIONS, type Enterprise } from "@/data/enterprises";

const TABS = ["Enterprise Admins", "Enterprise Users", "Invitations"];

function EnterpriseDetail({ ent }: { ent: Enterprise }) {
  return (
    <div className="divide-y divide-slate-100">
      {/* Company Info */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-lg font-bold text-violet-700">
            {ent.initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{ent.name}</h3>
            <p className="text-sm text-slate-500">{ent.industry}</p>
            <div className="mt-1"><Badge status={ent.status} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Country</p><p className="text-slate-700 font-medium">{ent.country}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Company Size</p><p className="text-slate-700 font-medium">{ent.size}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Website</p><p className="text-slate-700 font-medium truncate">{ent.website}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Created</p><p className="text-slate-700 font-medium">{ent.created}</p></div>
        </div>
      </div>

      {/* Admin Contact */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Admin Contact</h4>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-medium text-slate-800">{ent.admin}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-600">{ent.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-600">{ent.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-600">{ent.website}</span>
          </div>
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Plan & Usage</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Current Plan</p><p className="font-semibold text-slate-900">{ent.plan}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Total Users</p><p className="font-semibold text-slate-900">{ent.users}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Plan Start</p><p className="text-slate-700">{ent.planStart}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Plan Expiry</p><p className="text-slate-700">{ent.planExpiry}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Monthly Limit</p><p className="text-slate-700">{ent.monthlyLimit.toLocaleString()}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Credits Used</p><p className="text-slate-700">{ent.credits.toLocaleString()}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Searches This Month</p><p className="text-slate-700">{ent.searchesThisMonth.toLocaleString()}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Reveals This Month</p><p className="text-slate-700">{ent.revealsThisMonth.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Notes */}
      {ent.notes && (
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-700">Notes</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{ent.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Account Actions</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">Edit Profile</button>
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Change Plan</button>
          <button type="button" className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Add Credits</button>
          {ent.status === "active"
            ? <button type="button" className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">Suspend</button>
            : <button type="button" className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Activate</button>
          }
          <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">Delete Account</button>
        </div>
      </div>
    </div>
  );
}

export default function EnterprisesPage() {
  const [activeTab, setActiveTab] = useState("Enterprise Admins");
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

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
                activeTab === tab
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Enterprise Admins" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-violet-50/50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-800">Enterprise Admins</p>
              <p className="text-xs text-violet-500">Company accounts and their designated admin contacts</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search enterprises..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
              <option>All Statuses</option><option>Active</option><option>Suspended</option><option>Inactive</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
              <option>All Plans</option><option>Pro</option><option>Business</option><option>Enterprise</option>
            </select>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
              <Plus className="h-4 w-4" /> Add Enterprise
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Company</th>
                  <th className="px-5 py-3 text-left font-semibold">Admin</th>
                  <th className="px-5 py-3 text-left font-semibold">Industry</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Users</th>
                  <th className="px-5 py-3 text-left font-semibold">Credits Used</th>
                  <th className="px-5 py-3 text-left font-semibold">Created</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENTERPRISES.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedEnterprise(e)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                          {e.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{e.name}</p>
                          <p className="text-xs text-slate-400">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{e.admin}</td>
                    <td className="px-5 py-3.5 text-slate-500">{e.industry}</td>
                    <td className="px-5 py-3.5"><Badge status={e.status} /></td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{e.plan}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.users}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.credits.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-500">{e.created}</td>
                    <td className="px-5 py-3.5" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setSelectedEnterprise(e)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">View</button>
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Enterprise Users" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 bg-violet-50/50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-800">Enterprise Users</p>
              <p className="text-xs text-violet-500">All team members across enterprise accounts</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search users..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
              <option>All Companies</option><option>Nexus Technologies</option><option>Acme Corp</option><option>Vantage Capital</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
              <option>All Roles</option><option>Admin</option><option>Member</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
              <option>All Statuses</option><option>Active</option><option>Suspended</option><option>Inactive</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Company</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Date Added</th>
                  <th className="px-5 py-3 text-left font-semibold">Last Login</th>
                  <th className="px-5 py-3 text-left font-semibold">Searches</th>
                  <th className="px-5 py-3 text-left font-semibold">Reveals</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENT_USERS.map((u, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{u.initials}</div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.company}</td>
                    <td className="px-5 py-3.5"><Badge status={u.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500">{u.added}</td>
                    <td className="px-5 py-3.5 text-slate-500">{u.lastLogin}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.searches}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.reveals}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">View</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Invitations" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Enterprise Invitations</p>
              <p className="text-xs text-slate-400 mt-0.5">Pending and sent invitations for enterprise team members</p>
            </div>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
              <Send className="h-4 w-4" /> Send Invitation
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Invited Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-5 py-3 text-left font-semibold">Company</th>
                  <th className="px-5 py-3 text-left font-semibold">Invited By</th>
                  <th className="px-5 py-3 text-left font-semibold">Date Sent</th>
                  <th className="px-5 py-3 text-left font-semibold">Expiry</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENT_INVITATIONS.map((inv, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{inv.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inv.role}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inv.company}</td>
                    <td className="px-5 py-3.5 text-slate-500">{inv.invitedBy}</td>
                    <td className="px-5 py-3.5 text-slate-500">{inv.sent}</td>
                    <td className="px-5 py-3.5 text-slate-500">{inv.expiry}</td>
                    <td className="px-5 py-3.5"><Badge status={inv.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Resend</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SlidePanel
        isOpen={!!selectedEnterprise}
        onClose={() => setSelectedEnterprise(null)}
        title={selectedEnterprise?.name ?? ""}
        subtitle={selectedEnterprise?.industry}
        width="xl"
      >
        {selectedEnterprise && <EnterpriseDetail ent={selectedEnterprise} />}
      </SlidePanel>
    </div>
  );
}
