"use client";

import { useState } from "react";
import { Search, UserPlus, ChevronLeft, ChevronRight, Send, X, Mail, ShieldCheck, CreditCard, List } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SlidePanel from "@/components/ui/SlidePanel";
import { USERS, INVITATIONS, type User } from "@/data/users";

const TABS = ["All Users", "Invitations"];

function UserDetail({ user }: { user: User }) {
  return (
    <div className="divide-y divide-slate-100">
      {/* Personal Info */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {user.initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-1"><Badge status={user.status} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Date Joined</p><p className="text-slate-700 font-medium">{user.joined}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Last Login</p><p className="text-slate-700 font-medium">{user.lastLogin}</p></div>
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Plan & Usage</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><p className="text-xs text-slate-400 mb-0.5">Current Plan</p><p className="font-semibold text-slate-900">{user.plan}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Credits Remaining</p><p className="font-semibold text-slate-900">{user.credits}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Plan Start</p><p className="text-slate-700">{user.planStart}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Plan Expiry</p><p className="text-slate-700">{user.planExpiry}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Searches (All Time)</p><p className="text-slate-700">{user.totalSearches.toLocaleString()}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Reveals (All Time)</p><p className="text-slate-700">{user.totalReveals.toLocaleString()}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Searches This Month</p><p className="text-slate-700">{user.searchesThisMonth}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Reveals This Month</p><p className="text-slate-700">{user.revealsThisMonth}</p></div>
        </div>
      </div>

      {/* Lists */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <List className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Lists ({user.lists.length})</h4>
        </div>
        <div className="space-y-2">
          {user.lists.map((l) => (
            <div key={l.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{l.name}</p>
                <p className="text-xs text-slate-400">{l.type}</p>
              </div>
              <span className="text-sm font-semibold text-slate-700">{l.count} contacts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Password & Security</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Mail className="h-3.5 w-3.5" /> Send Password Reset
          </button>
          <button type="button" className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            Force Logout
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Account Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">Edit Profile</button>
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Change Plan</button>
          <button type="button" className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Add Credits</button>
          {user.status === "active"
            ? <button type="button" className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">Suspend</button>
            : <button type="button" className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">Activate</button>
          }
          <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">Delete Account</button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("All Users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "All Users" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search users..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Active</option><option>Inactive</option><option>Suspended</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Plans</option><option>Free</option><option>Pro</option><option>Business</option>
            </select>
            <button type="button" className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <UserPlus className="h-4 w-4" /> Invite User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Credits Rem.</th>
                  <th className="px-5 py-3 text-left font-semibold">Date Joined</th>
                  <th className="px-5 py-3 text-left font-semibold">Last Login</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{u.initials}</div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5"><Badge status={u.status} /></td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{u.plan}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.credits}</td>
                    <td className="px-5 py-3.5 text-slate-500">{u.joined}</td>
                    <td className="px-5 py-3.5 text-slate-500">{u.lastLogin}</td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setSelectedUser(u)} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">View</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
            <p className="text-sm text-slate-500">Showing 1–8 of 1,284 users</p>
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 opacity-40" disabled>
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Invitations" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Manage pending and sent invitations.</p>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Send className="h-4 w-4" /> Send Invitation
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Invited Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Invited By</th>
                  <th className="px-5 py-3 text-left font-semibold">Date Sent</th>
                  <th className="px-5 py-3 text-left font-semibold">Expiry Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {INVITATIONS.map((inv, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{inv.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inv.invitedBy}</td>
                    <td className="px-5 py-3.5 text-slate-500">{inv.dateSent}</td>
                    <td className="px-5 py-3.5 text-slate-500">{inv.expiry}</td>
                    <td className="px-5 py-3.5"><Badge status={inv.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Resend</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"><X className="h-3 w-3" /></button>
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
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name ?? ""}
        subtitle={selectedUser?.email}
      >
        {selectedUser && <UserDetail user={selectedUser} />}
      </SlidePanel>
    </div>
  );
}
