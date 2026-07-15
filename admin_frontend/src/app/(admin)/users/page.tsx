"use client";

import { useState } from "react";
import { Search, UserPlus, Send, X, Mail, ShieldCheck, CreditCard, List, Users, CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import SlidePanel from "@/components/ui/SlidePanel";
import { USERS, INVITATIONS, type User } from "@/data/users";

const TABS = ["Individual Users", "Invitations"];

const totalUsers   = USERS.length;
const activeUsers  = USERS.filter((u) => u.status === "active").length;
const paidUsers    = USERS.filter((u) => u.plan !== "Free").length;
const pendingInvs  = INVITATIONS.filter((i) => i.status === "pending").length;

function UserDetail({ user }: { user: User }) {
  return (
    <div className="divide-y divide-slate-100">
      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
            style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)" }}
          >
            {user.initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-1"><Badge status={user.status} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Date Joined</p><p className="text-slate-700 font-medium">{user.joined}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Last Login</p><p className="text-slate-700 font-medium">{user.lastLogin}</p></div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Plan & Usage</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
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

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
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

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Password & Security</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <Mail className="h-3.5 w-3.5" /> Send Password Reset
          </button>
          <button
            type="button"
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            Force Logout
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-semibold text-slate-700">Account Actions</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
            style={{ background: "var(--forest)", color: "#EFEAD9" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            Change Plan
          </button>
          <button
            type="button"
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dim)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            Add Credits
          </button>
          {user.status === "active" ? (
            <button
              type="button"
              className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{ borderColor: "var(--gold)", color: "#8A6222", background: "transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--gold-dim)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Suspend
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{ borderColor: "var(--sage)", color: "var(--sage-dark, #3E6A44)", background: "transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sage-dim)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Activate
            </button>
          )}
          <button
            type="button"
            className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("Individual Users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const USER_PER_PAGE = 8;
  const [userPage, setUserPage] = useState(1);
  const [invPage, setInvPage] = useState(1);

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
                  ? { borderBottom: "2px solid var(--forest)", color: "var(--forest)" }
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
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(23,50,41,.08)" }}>
            <Users className="h-5 w-5" style={{ color: "var(--forest)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Users</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--forest)" }}>{totalUsers}</p>
            <p className="text-xs text-slate-400 mt-0.5">All registered accounts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Active Users</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>{activeUsers}</p>
            <p className="text-xs text-slate-400 mt-0.5">Currently active accounts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--rust-dim)" }}>
            <CreditCard className="h-5 w-5" style={{ color: "var(--rust)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Paid Users</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--rust)" }}>{paidUsers}</p>
            <p className="text-xs text-slate-400 mt-0.5">On Pro or Business plan</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--gold-dim)" }}>
            <Send className="h-5 w-5" style={{ color: "#8A6222" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Pending Invitations</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "#8A6222" }}>{pendingInvs}</p>
            <p className="text-xs text-slate-400 mt-0.5">Awaiting acceptance</p>
          </div>
        </div>
      </div>

      {/* ── Individual Users ─────────────────────────────────────────── */}
      {activeTab === "Individual Users" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">Individual Users</p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--forest)", color: "#EFEAD9" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              <UserPlus className="h-4 w-4" /> Invite User
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by name or email..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--forest)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,50,41,.10)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
              />
            </div>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--forest)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,50,41,.10)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Statuses</option><option>Active</option><option>Inactive</option><option>Suspended</option>
            </select>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--forest)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,50,41,.10)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Plans</option><option>Free</option><option>Pro</option><option>Business</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5 text-left">Name</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Plan</th>
                  <th className="px-4 py-2.5 text-left">Credits Rem.</th>
                  <th className="px-4 py-2.5 text-left">Date Joined</th>
                  <th className="px-4 py-2.5 text-left">Last Login</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {USERS.slice((userPage - 1) * USER_PER_PAGE, userPage * USER_PER_PAGE).map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: "rgba(23,50,41,.08)", color: "var(--forest)" }}
                        >
                          {u.initials}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3"><Badge status={u.status} /></td>
                    <td className="px-4 py-3 font-medium text-slate-700">{u.plan}</td>
                    <td className="px-4 py-3 text-slate-600">{u.credits}</td>
                    <td className="px-4 py-3 text-slate-500">{u.joined}</td>
                    <td className="px-4 py-3 text-slate-500">{u.lastLogin}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={USERS.length} perPage={USER_PER_PAGE} page={userPage} onChange={setUserPage} itemLabel="users" />
        </div>
      )}

      {/* ── Invitations ──────────────────────────────────────────────── */}
      {activeTab === "Invitations" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Individual User Invitations</p>
              <p className="text-xs text-slate-400 mt-0.5">Pending and sent invitations for personal accounts</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--forest)", color: "#EFEAD9" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              <Send className="h-4 w-4" /> Send Invitation
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5 text-left">Invited Email</th>
                  <th className="px-4 py-2.5 text-left">Invited By</th>
                  <th className="px-4 py-2.5 text-left">Date Sent</th>
                  <th className="px-4 py-2.5 text-left">Expiry Date</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {INVITATIONS.slice((invPage - 1) * USER_PER_PAGE, invPage * USER_PER_PAGE).map((inv, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.email}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.invitedBy}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.dateSent}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.expiry}</td>
                    <td className="px-4 py-3"><Badge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Resend
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={INVITATIONS.length} perPage={USER_PER_PAGE} page={invPage} onChange={setInvPage} itemLabel="invitations" />
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
