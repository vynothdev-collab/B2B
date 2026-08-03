"use client";

import { useState } from "react";
import { Search, Plus, Send, Users, Building2, Ticket, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SlidePanel from "@/components/ui/SlidePanel";
import { TICKETS, CATEGORIES, REPORT_CARDS, CATEGORY_STATS, type Ticket as TicketType } from "@/data/tickets";

const TABS = ["All Tickets", "Individual", "Enterprise", "Ticket Categories", "Reports"];

const INDIVIDUAL_TICKETS = TICKETS.filter((t) => t.type === "Individual");
const ENTERPRISE_TICKETS = TICKETS.filter((t) => t.type === "Enterprise");

const totalTickets   = TICKETS.length;
const openTickets    = TICKETS.filter((t) => t.status === "open").length;
const inProgTickets  = TICKETS.filter((t) => t.status === "in_progress").length;
const resolvedTickets = TICKETS.filter((t) => t.status === "resolved").length;

const focusWarm = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--forest)";
    e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(23,50,41,.10)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "";
    e.currentTarget.style.boxShadow   = "";
  },
};

function TicketDetail({ ticket }: { ticket: TicketType }) {
  return (
    <div className="flex flex-col h-full divide-y divide-slate-100">
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">{ticket.id}</p>
            <h3 className="text-sm font-semibold text-slate-900">{ticket.subject}</h3>
          </div>
          <Badge status={ticket.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge status={ticket.priority} />
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={ticket.type === "Enterprise"
              ? { background: "var(--gold-dim)", color: "#8A6222", border: "1px solid var(--gold)" }
              : { background: "rgba(23,50,41,.06)", color: "var(--forest)", border: "1px solid rgba(23,50,41,.20)" }
            }
          >
            {ticket.type}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{ticket.category}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Submitted By</p><p className="font-medium text-slate-800">{ticket.by}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Assigned To</p><p className="font-medium text-slate-800">{ticket.assigned}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Submitted</p><p className="text-slate-600">{ticket.submitted}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Last Updated</p><p className="text-slate-600">{ticket.updated}</p></div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-slate-500 mb-2">Description</p>
        <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
      </div>
      <div className="px-5 py-4 flex-1">
        <p className="text-xs font-medium text-slate-500 mb-3">Conversation</p>
        <div className="space-y-3">
          {ticket.replies.map((reply, i) => (
            <div key={i} className={`flex gap-3 ${reply.role === "admin" ? "flex-row-reverse" : ""}`}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={reply.role === "admin"
                  ? { background: "var(--forest)", color: "#EFEAD9" }
                  : { background: "var(--line-soft)", color: "var(--ink-dim)" }
                }
              >
                {reply.from.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div
                className="max-w-[75%] rounded-xl px-4 py-2.5"
                style={reply.role === "admin"
                  ? { background: "var(--forest)", color: "#EFEAD9" }
                  : { background: "var(--paper)", color: "var(--ink)" }
                }
              >
                <p className="text-xs font-semibold mb-1" style={{ color: reply.role === "admin" ? "rgba(239,234,217,.65)" : "var(--ink-faint)" }}>{reply.from}</p>
                <p className="text-sm leading-relaxed">{reply.message}</p>
                <p className="text-xs mt-1.5" style={{ color: reply.role === "admin" ? "rgba(239,234,217,.5)" : "var(--ink-faint)" }}>{reply.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-4">
        <textarea
          rows={3}
          placeholder="Write a reply..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none transition-colors"
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--forest)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,50,41,.10)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
        />
        <div className="flex items-center justify-between mt-2">
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none transition-colors"
            {...focusWarm}
          >
            <option>Mark as Open</option><option>Mark as In Progress</option><option>Mark as Resolved</option>
          </select>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
            style={{ background: "var(--forest)", color: "#EFEAD9" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            <Send className="h-3.5 w-3.5" /> Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketTable({ rows, onOpen }: { rows: TicketType[]; onOpen: (t: TicketType) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500">
            <th className="px-4 py-2.5 text-left font-medium">Ticket #</th>
            <th className="px-4 py-2.5 text-left font-medium">Subject</th>
            <th className="px-4 py-2.5 text-left font-medium">Submitted By</th>
            <th className="px-4 py-2.5 text-left font-medium">Type</th>
            <th className="px-4 py-2.5 text-left font-medium">Category</th>
            <th className="px-4 py-2.5 text-left font-medium">Priority</th>
            <th className="px-4 py-2.5 text-left font-medium">Status</th>
            <th className="px-4 py-2.5 text-left font-medium">Assigned To</th>
            <th className="px-4 py-2.5 text-left font-medium">Submitted</th>
            <th className="px-4 py-2.5 text-left font-medium">Last Updated</th>
            <th className="px-4 py-2.5 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onOpen(t)}>
              <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: "var(--forest)" }}>{t.id}</td>
              <td className="px-4 py-3 max-w-[200px]"><p className="truncate font-medium text-slate-800">{t.subject}</p></td>
              <td className="px-4 py-3 text-slate-600">{t.by}</td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={t.type === "Enterprise"
                    ? { background: "var(--gold-dim)", color: "#8A6222", border: "1px solid var(--gold)" }
                    : { background: "rgba(23,50,41,.06)", color: "var(--forest)", border: "1px solid rgba(23,50,41,.20)" }
                  }
                >
                  {t.type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{t.category}</td>
              <td className="px-4 py-3"><Badge status={t.priority} /></td>
              <td className="px-4 py-3"><Badge status={t.status} /></td>
              <td className="px-4 py-3 text-slate-600">{t.assigned}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{t.submitted}</td>
              <td className="px-4 py-3 text-slate-500">{t.updated}</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpen(t)}
                    className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    Assign
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TypeBanner({ type }: { type: "Individual" | "Enterprise" }) {
  return type === "Individual" ? (
    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
      <Users className="h-4 w-4 text-slate-400" />
      <span className="text-sm text-slate-500">Individual / Personal Account Tickets</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
      <Building2 className="h-4 w-4 text-slate-400" />
      <span className="text-sm text-slate-500">Enterprise / Company Account Tickets</span>
    </div>
  );
}

function FilterHeader() {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search tickets..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
          {...focusWarm}
        />
      </div>
      <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
        <option>All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
      </select>
      <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
        <option>All Priorities</option><option>Urgent</option><option>Pending</option><option>Low</option>
      </select>
      <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
        <option>All Categories</option><option>Billing</option><option>Account</option><option>Technical</option>
      </select>
    </div>
  );
}

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState("All Tickets");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  return (
    <div className="space-y-5">

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="shrink-0 px-4 py-2.5 text-sm font-medium transition-colors"
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
            <Ticket className="h-5 w-5" style={{ color: "var(--forest)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Total Tickets</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--forest)" }}>{totalTickets}</p>
            <p className="text-xs text-slate-400 mt-0.5">All support tickets</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--rust-dim)" }}>
            <AlertCircle className="h-5 w-5" style={{ color: "var(--rust)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Open Tickets</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--rust)" }}>{openTickets}</p>
            <p className="text-xs text-slate-400 mt-0.5">Awaiting response</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--gold-dim)" }}>
            <Clock className="h-5 w-5" style={{ color: "#8A6222" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>In Progress</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "#8A6222" }}>{inProgTickets}</p>
            <p className="text-xs text-slate-400 mt-0.5">Being worked on</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sage-dim)" }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--sage-dark, #3E6A44)" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>Resolved</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--sage-dark, #3E6A44)" }}>{resolvedTickets}</p>
            <p className="text-xs text-slate-400 mt-0.5">Closed this period</p>
          </div>
        </div>
      </div>

      {activeTab === "All Tickets" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search tickets..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none transition-colors"
                {...focusWarm}
              />
            </div>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
              <option>All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
              <option>All Priorities</option><option>Urgent</option><option>Pending</option><option>Low</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
              <option>All Categories</option><option>Billing</option><option>Account</option><option>Technical</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none transition-colors" {...focusWarm}>
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option>
            </select>
          </div>
          <TicketTable rows={TICKETS} onOpen={setSelectedTicket} />
        </div>
      )}

      {activeTab === "Individual" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <TypeBanner type="Individual" />
          <FilterHeader />
          <TicketTable rows={INDIVIDUAL_TICKETS} onOpen={setSelectedTicket} />
        </div>
      )}

      {activeTab === "Enterprise" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <TypeBanner type="Enterprise" />
          <FilterHeader />
          <TicketTable rows={ENTERPRISE_TICKETS} onOpen={setSelectedTicket} />
        </div>
      )}

      {activeTab === "Ticket Categories" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Manage support ticket categories.</p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              style={{ background: "var(--forest)", color: "#EFEAD9" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500">
                  <th className="px-4 py-2.5 text-left font-medium">Category Name</th>
                  <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  <th className="px-4 py-2.5 text-left font-medium">Open Tickets</th>
                  <th className="px-4 py-2.5 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{cat.name}</td>
                    <td className="px-4 py-3 text-slate-500">{cat.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                        style={cat.open > 0
                          ? { background: "var(--gold-dim)", color: "#8A6222" }
                          : { background: "var(--line-soft)", color: "var(--ink-faint)" }
                        }
                      >
                        {cat.open}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--line)", color: "var(--ink-dim)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: "var(--rose)", color: "var(--rose)", background: "transparent" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_CARDS.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border p-5"
                style={card.highlight
                  ? { borderColor: "var(--rose)", background: "var(--rose-dim)" }
                  : { borderColor: "#E2E8F0", background: "white" }
                }
              >
                <p className="text-xs font-medium text-slate-500 mb-2">{card.label}</p>
                <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4" style={{ color: "var(--forest)" }} />
                <h3 className="text-sm font-semibold text-slate-800">Individual Tickets This Month</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Open",        count: 4, color: "var(--gold)" },
                  { label: "In Progress", count: 2, color: "var(--forest)" },
                  { label: "Resolved",    count: 3, color: "var(--sage-dark, #3E6A44)" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-slate-600">{s.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(s.count / 9) * 100}%`, background: s.color }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-4 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" style={{ color: "#8A6222" }} />
                <h3 className="text-sm font-semibold text-slate-800">Enterprise Tickets This Month</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Open",        count: 3, color: "var(--gold)" },
                  { label: "In Progress", count: 2, color: "var(--forest)" },
                  { label: "Resolved",    count: 2, color: "var(--sage-dark, #3E6A44)" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-slate-600">{s.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(s.count / 7) * 100}%`, background: s.color }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-4 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Tickets by Category — This Month</h3>
            <div className="space-y-4">
              {CATEGORY_STATS.map((cat) => {
                const pct = Math.round((cat.count / 89) * 100);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ background: cat.color }} />
                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{cat.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <SlidePanel isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.id ?? ""} subtitle={selectedTicket?.subject} width="xl">
        {selectedTicket && <TicketDetail ticket={selectedTicket} />}
      </SlidePanel>
    </div>
  );
}
