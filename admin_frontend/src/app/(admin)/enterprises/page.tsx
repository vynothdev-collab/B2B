"use client";

import { useState } from "react";
import { Search, Plus, Send, Building2, CreditCard, Users, Globe, Phone, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import SlidePanel from "@/components/ui/SlidePanel";
import { ENTERPRISES, ENT_USERS, ENT_INVITATIONS, type Enterprise } from "@/data/enterprises";

const TABS = ["Enterprise Admins", "Enterprise Users", "Invitations"];

const totalEnterprises  = ENTERPRISES.length;
const activeEnterprises = ENTERPRISES.filter((e) => e.status === "active").length;
const totalEntUsers     = ENTERPRISES.reduce((sum, e) => sum + e.users, 0);
const pendingEntInvs    = ENT_INVITATIONS.filter((i) => i.status === "pending").length;

function EnterpriseDetail({ ent }: { ent: Enterprise }) {
  return (
    <div className="divide-y divide-slate-100">
      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold"
            style={{ background: "var(--gold-dim)", color: "#8A6222" }}
          >
            {ent.initials}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{ent.name}</h3>
            <p className="text-sm text-slate-500">{ent.industry}</p>
            <div className="mt-1"><Badge status={ent.status} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Country</p><p className="text-slate-700 font-medium">{ent.country}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Company Size</p><p className="text-slate-700 font-medium">{ent.size}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Website</p><p className="text-slate-700 font-medium truncate">{ent.website}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Created</p><p className="text-slate-700 font-medium">{ent.created}</p></div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
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

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-700">Plan & Usage</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
            style={{ background: "var(--gold)", color: "#3C2400" }}
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
          {ent.status === "active" ? (
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

export default function EnterprisesPage() {
  const [activeTab, setActiveTab] = useState("Enterprise Admins");
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const ENT_PER_PAGE = 8;
  const [entPage, setEntPage] = useState(1);
  const [euPage, setEuPage] = useState(1);
  const [invPage2, setInvPage2] = useState(1);

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
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--gold-dim)" }}>
            <Building2 className="h-5 w-5" style={{ color: "#8A6222" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Enterprises</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "#8A6222" }}>{totalEnterprises}</p>
            <p className="text-xs text-slate-400 mt-0.5">All company accounts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Active Enterprises</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>{activeEnterprises}</p>
            <p className="text-xs text-slate-400 mt-0.5">Currently active accounts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--rust-dim)" }}>
            <Users className="h-5 w-5" style={{ color: "var(--rust)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Enterprise Users</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--rust)" }}>{totalEntUsers}</p>
            <p className="text-xs text-slate-400 mt-0.5">Across all companies</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(23,50,41,.08)" }}>
            <Send className="h-5 w-5" style={{ color: "var(--forest)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Pending Invitations</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--forest)" }}>{pendingEntInvs}</p>
            <p className="text-xs text-slate-400 mt-0.5">Awaiting acceptance</p>
          </div>
        </div>
      </div>

      {/* ── Enterprise Admins ─────────────────────────────────────────── */}
      {activeTab === "Enterprise Admins" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">Enterprise Admins</p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--gold)", color: "#3C2400" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              <Plus className="h-4 w-4" /> Add Enterprise
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search enterprises..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
              />
            </div>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Statuses</option><option>Active</option><option>Suspended</option><option>Inactive</option>
            </select>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Plans</option><option>Pro</option><option>Business</option><option>Enterprise</option>
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
                  <th className="px-4 py-2.5 text-left">Credits Used</th>
                  <th className="px-4 py-2.5 text-left">Created</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENTERPRISES.slice((entPage - 1) * ENT_PER_PAGE, entPage * ENT_PER_PAGE).map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedEnterprise(e)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ background: "var(--gold-dim)", color: "#8A6222" }}
                        >
                          {e.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{e.name}</p>
                          <p className="text-xs text-slate-400">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.admin}</td>
                    <td className="px-4 py-3 text-slate-500">{e.industry}</td>
                    <td className="px-4 py-3"><Badge status={e.status} /></td>
                    <td className="px-4 py-3 font-medium text-slate-700">{e.plan}</td>
                    <td className="px-4 py-3 text-slate-600">{e.users}</td>
                    <td className="px-4 py-3 text-slate-600">{e.credits.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{e.created}</td>
                    <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEnterprise(e)}
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                          onMouseEnter={(ev) => { (ev.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                          onMouseLeave={(ev) => { (ev.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                          onMouseEnter={(ev) => { (ev.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                          onMouseLeave={(ev) => { (ev.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
                          onMouseEnter={(ev) => { (ev.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
                          onMouseLeave={(ev) => { (ev.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
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
          <Pagination total={ENTERPRISES.length} perPage={ENT_PER_PAGE} page={entPage} onChange={setEntPage} itemLabel="enterprises" />
        </div>
      )}

      {/* ── Enterprise Users ──────────────────────────────────────────── */}
      {activeTab === "Enterprise Users" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">Enterprise Users</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search users..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
              />
            </div>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Companies</option><option>Nexus Technologies</option><option>Acme Corp</option><option>Vantage Capital</option>
            </select>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Roles</option><option>Admin</option><option>Member</option>
            </select>
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors"
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <option>All Statuses</option><option>Active</option><option>Suspended</option><option>Inactive</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5 text-left">Name</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">Company</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Date Added</th>
                  <th className="px-4 py-2.5 text-left">Last Login</th>
                  <th className="px-4 py-2.5 text-left">Searches</th>
                  <th className="px-4 py-2.5 text-left">Reveals</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENT_USERS.slice((euPage - 1) * ENT_PER_PAGE, euPage * ENT_PER_PAGE).map((u, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: "var(--gold-dim)", color: "#8A6222" }}
                        >
                          {u.initials}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.company}</td>
                    <td className="px-4 py-3"><Badge status={u.status} /></td>
                    <td className="px-4 py-3 text-slate-500">{u.added}</td>
                    <td className="px-4 py-3 text-slate-500">{u.lastLogin}</td>
                    <td className="px-4 py-3 text-slate-600">{u.searches}</td>
                    <td className="px-4 py-3 text-slate-600">{u.reveals}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
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
          <Pagination total={ENT_USERS.length} perPage={ENT_PER_PAGE} page={euPage} onChange={setEuPage} itemLabel="users" />
        </div>
      )}

      {/* ── Invitations ──────────────────────────────────────────────── */}
      {activeTab === "Invitations" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Enterprise Invitations</p>
              <p className="text-xs text-slate-400 mt-0.5">Pending and sent invitations for enterprise team members</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--gold)", color: "#3C2400" }}
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
                  <th className="px-4 py-2.5 text-left">Role</th>
                  <th className="px-4 py-2.5 text-left">Company</th>
                  <th className="px-4 py-2.5 text-left">Invited By</th>
                  <th className="px-4 py-2.5 text-left">Date Sent</th>
                  <th className="px-4 py-2.5 text-left">Expiry</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ENT_INVITATIONS.slice((invPage2 - 1) * ENT_PER_PAGE, invPage2 * ENT_PER_PAGE).map((inv, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.email}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.role}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.company}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.invitedBy}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.sent}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.expiry}</td>
                    <td className="px-4 py-3"><Badge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
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
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={ENT_INVITATIONS.length} perPage={ENT_PER_PAGE} page={invPage2} onChange={setInvPage2} itemLabel="invitations" />
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
