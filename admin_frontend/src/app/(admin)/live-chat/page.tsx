"use client";

import { useState } from "react";
import { Plus, Send, Users, Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SlidePanel from "@/components/ui/SlidePanel";
import { CONVERSATIONS, UNREAD_CONVERSATIONS, TEMPLATES, type Conversation } from "@/data/live-chat";

const TABS = ["All Conversations", "Individual", "Enterprise", "Unread / Waiting", "Quick Reply Templates"];

const INDIVIDUAL_CONVS = CONVERSATIONS.filter((c) => c.type === "Individual");
const ENTERPRISE_CONVS = CONVERSATIONS.filter((c) => c.type === "Enterprise");

function ChatDetail({ conv }: { conv: Conversation }) {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {conv.messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "admin" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.role === "admin" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                {msg.from.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${msg.role === "admin" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className={`text-xs font-semibold mb-1 ${msg.role === "admin" ? "text-blue-200" : "text-slate-500"}`}>{msg.from}</p>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1.5 ${msg.role === "admin" ? "text-blue-300" : "text-slate-400"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 px-5 py-4">
          <textarea rows={3} placeholder="Type a message..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50 resize-none" />
          <div className="flex items-center justify-between mt-2">
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>Quick Replies...</option>
              {TEMPLATES.map((t) => <option key={t.name}>{t.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Resolve</button>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                <Send className="h-3 w-3" /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-52 shrink-0 border-l border-slate-100 bg-slate-50 px-4 py-5 space-y-4 overflow-y-auto">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">{conv.initials}</div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{conv.user}</p>
            {conv.company !== "—" && <p className="text-xs text-slate-400">{conv.company}</p>}
          </div>
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${conv.type === "Enterprise" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>{conv.type}</span>
          </div>
          <Badge status={conv.status} />
        </div>
        <div className="space-y-2 text-xs">
          <div><p className="text-slate-400 mb-0.5">Plan</p><p className="font-medium text-slate-700">{conv.plan}</p></div>
          <div><p className="text-slate-400 mb-0.5">Joined</p><p className="font-medium text-slate-700">{conv.joined}</p></div>
          <div><p className="text-slate-400 mb-0.5">Started</p><p className="font-medium text-slate-700">{conv.started}</p></div>
          <div><p className="text-slate-400 mb-0.5">Assigned To</p><p className="font-medium text-slate-700">{conv.assigned}</p></div>
        </div>
        <div className="space-y-1.5">
          <button type="button" className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">View Profile</button>
          <button type="button" className="w-full rounded-md border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors">Transfer</button>
        </div>
      </div>
    </div>
  );
}

function ConversationTable({ rows, onOpen }: { rows: Conversation[]; onOpen: (c: Conversation) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500">
            <th className="px-4 py-2.5 text-left font-medium">ID</th>
            <th className="px-4 py-2.5 text-left font-medium">User</th>
            <th className="px-4 py-2.5 text-left font-medium">Type</th>
            <th className="px-4 py-2.5 text-left font-medium">Subject</th>
            <th className="px-4 py-2.5 text-left font-medium">Assigned To</th>
            <th className="px-4 py-2.5 text-left font-medium">Status</th>
            <th className="px-4 py-2.5 text-left font-medium">Unread</th>
            <th className="px-4 py-2.5 text-left font-medium">Started</th>
            <th className="px-4 py-2.5 text-left font-medium">Last Msg</th>
            <th className="px-4 py-2.5 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onOpen(row)}>
              <td className="px-4 py-3 text-xs font-mono text-slate-500">{row.id}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{row.user}</p>
                {row.company !== "—" && <p className="text-xs text-slate-400">{row.company}</p>}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {row.type}
                </span>
              </td>
              <td className="px-4 py-3 max-w-[200px]"><p className="truncate text-slate-700">{row.subject}</p></td>
              <td className="px-4 py-3 text-slate-600">{row.assigned}</td>
              <td className="px-4 py-3"><Badge status={row.status} /></td>
              <td className="px-4 py-3">
                {row.unread > 0
                  ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{row.unread}</span>
                  : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">{row.started}</td>
              <td className="px-4 py-3 text-slate-500">{row.last}</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => onOpen(row)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Open</button>
                  <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Resolve</button>
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
      <span className="text-sm text-slate-500">Individual / Personal Account Conversations</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
      <Building2 className="h-4 w-4 text-slate-400" />
      <span className="text-sm text-slate-500">Enterprise / Company Account Conversations</span>
    </div>
  );
}

export default function LiveChatPage() {
  const [activeTab, setActiveTab] = useState("All Conversations");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "All Conversations" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option>
            </select>
          </div>
          <ConversationTable rows={CONVERSATIONS} onOpen={setSelectedConversation} />
        </div>
      )}

      {activeTab === "Individual" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <TypeBanner type="Individual" />
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
          </div>
          <ConversationTable rows={INDIVIDUAL_CONVS} onOpen={setSelectedConversation} />
        </div>
      )}

      {activeTab === "Enterprise" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <TypeBanner type="Enterprise" />
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
            <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50">
              <option>All Companies</option><option>Nexus Technologies</option><option>Vantage Capital</option><option>BrightPath EDU</option>
            </select>
          </div>
          <ConversationTable rows={ENTERPRISE_CONVS} onOpen={setSelectedConversation} />
        </div>
      )}

      {activeTab === "Unread / Waiting" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Conversations with unread messages waiting for a response.</p>
          </div>
          <ConversationTable rows={UNREAD_CONVERSATIONS} onOpen={setSelectedConversation} />
        </div>
      )}

      {activeTab === "Quick Reply Templates" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">Saved quick reply templates for chat support.</p>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Template
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500">
                  <th className="px-4 py-2.5 text-left font-medium">Template Name</th>
                  <th className="px-4 py-2.5 text-left font-medium">Category</th>
                  <th className="px-4 py-2.5 text-left font-medium">Message Preview</th>
                  <th className="px-4 py-2.5 text-left font-medium">Created By</th>
                  <th className="px-4 py-2.5 text-left font-medium">Last Updated</th>
                  <th className="px-4 py-2.5 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {TEMPLATES.map((t, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{t.category}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[280px]"><p className="truncate text-slate-500 text-xs">{t.content}</p></td>
                    <td className="px-4 py-3 text-slate-600">{t.by}</td>
                    <td className="px-4 py-3 text-slate-500">{t.updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                        <button type="button" className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SlidePanel isOpen={!!selectedConversation} onClose={() => setSelectedConversation(null)} title={selectedConversation?.user ?? ""} subtitle={selectedConversation?.subject} width="xl">
        {selectedConversation && <ChatDetail conv={selectedConversation} />}
      </SlidePanel>
    </div>
  );
}
