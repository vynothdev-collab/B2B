"use client";

import { useState } from "react";
import { Search, Plus, Send } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SlidePanel from "@/components/ui/SlidePanel";
import { TICKETS, MY_TICKETS, CATEGORIES, REPORT_CARDS, CATEGORY_STATS, type Ticket } from "@/data/tickets";

const TABS = ["All Tickets", "My Assigned", "Ticket Categories", "Reports"];

function TicketDetail({ ticket }: { ticket: Ticket }) {
  return (
    <div className="flex flex-col h-full divide-y divide-slate-100">
      {/* Header info */}
      <div className="px-6 py-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">{ticket.id}</p>
            <h3 className="text-sm font-semibold text-slate-900">{ticket.subject}</h3>
          </div>
          <Badge status={ticket.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge status={ticket.priority} />
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
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

      {/* Description */}
      <div className="px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Description</p>
        <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
      </div>

      {/* Reply thread */}
      <div className="px-6 py-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Conversation</p>
        <div className="space-y-3">
          {ticket.replies.map((reply, i) => (
            <div key={i} className={`flex gap-3 ${reply.role === "admin" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${reply.role === "admin" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                {reply.from.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${reply.role === "admin" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className={`text-xs font-semibold mb-1 ${reply.role === "admin" ? "text-blue-200" : "text-slate-500"}`}>{reply.from}</p>
                <p className="text-sm leading-relaxed">{reply.message}</p>
                <p className={`text-xs mt-1.5 ${reply.role === "admin" ? "text-blue-300" : "text-slate-400"}`}>{reply.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply box */}
      <div className="px-6 py-4">
        <textarea
          rows={3}
          placeholder="Write a reply..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 focus:border-blue-400 focus:outline-none">
              <option>Mark as Open</option><option>Mark as In Progress</option><option>Mark as Resolved</option>
            </select>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
            <Send className="h-3.5 w-3.5" /> Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketTable({ rows, onOpen }: { rows: Ticket[]; onOpen: (t: Ticket) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 text-left font-semibold">Ticket #</th>
            <th className="px-5 py-3 text-left font-semibold">Subject</th>
            <th className="px-5 py-3 text-left font-semibold">Submitted By</th>
            <th className="px-5 py-3 text-left font-semibold">Type</th>
            <th className="px-5 py-3 text-left font-semibold">Category</th>
            <th className="px-5 py-3 text-left font-semibold">Priority</th>
            <th className="px-5 py-3 text-left font-semibold">Status</th>
            <th className="px-5 py-3 text-left font-semibold">Assigned To</th>
            <th className="px-5 py-3 text-left font-semibold">Submitted</th>
            <th className="px-5 py-3 text-left font-semibold">Last Updated</th>
            <th className="px-5 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => onOpen(t)}>
              <td className="px-5 py-3.5 font-mono text-sm font-semibold text-blue-600">{t.id}</td>
              <td className="px-5 py-3.5 max-w-[200px]">
                <p className="truncate font-medium text-slate-800">{t.subject}</p>
              </td>
              <td className="px-5 py-3.5 text-slate-600">{t.by}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {t.type}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-500">{t.category}</td>
              <td className="px-5 py-3.5"><Badge status={t.priority} /></td>
              <td className="px-5 py-3.5"><Badge status={t.status} /></td>
              <td className="px-5 py-3.5 text-slate-600">{t.assigned}</td>
              <td className="px-5 py-3.5 text-slate-500 text-xs">{t.submitted}</td>
              <td className="px-5 py-3.5 text-slate-500">{t.updated}</td>
              <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => onOpen(t)} className="rounded-md border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50">Open</button>
                  <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Assign</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState("All Tickets");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "All Tickets" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search tickets..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Priorities</option><option>Urgent</option><option>Pending</option><option>Low</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Categories</option><option>Billing</option><option>Account</option><option>Technical</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option>
            </select>
          </div>
          <TicketTable rows={TICKETS} onOpen={setSelectedTicket} />
        </div>
      )}

      {activeTab === "My Assigned" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Tickets currently assigned to you (Super Admin).</p>
          </div>
          <TicketTable rows={MY_TICKETS} onOpen={setSelectedTicket} />
        </div>
      )}

      {activeTab === "Ticket Categories" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Manage support ticket categories.</p>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">Category Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Description</th>
                  <th className="px-5 py-3 text-left font-semibold">Open Tickets</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{cat.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{cat.description}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${cat.open > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                        {cat.open}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
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
                className={`rounded-xl border p-5 shadow-sm ${card.highlight ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Tickets by Category — This Month</h3>
            <div className="space-y-4">
              {CATEGORY_STATS.map((cat) => {
                const pct = Math.round((cat.count / 89) * 100);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-sm ${cat.color}`} />
                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{cat.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${cat.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <SlidePanel
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.id ?? ""}
        subtitle={selectedTicket?.subject}
        width="xl"
      >
        {selectedTicket && <TicketDetail ticket={selectedTicket} />}
      </SlidePanel>
    </div>
  );
}
