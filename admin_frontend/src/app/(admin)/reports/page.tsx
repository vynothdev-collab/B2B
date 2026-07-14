"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Badge from "@/components/ui/Badge";

const TABS = ["Search Activity", "Email Reveals", "Login History", "Exported Reports"];

const SEARCH_ACTIVITY = [
  { user: "Laura Chen", type: "Enterprise", company: "Nexus Technologies", searchType: "Company Search", filters: "Industry: SaaS, Country: US", results: 142, datetime: "Jul 13, 2025 9:02 AM" },
  { user: "John Carter", type: "Individual", company: "—", searchType: "People Search", filters: "Title: CEO, Country: UK", results: 58, datetime: "Jul 13, 2025 8:48 AM" },
  { user: "James Okafor", type: "Enterprise", company: "Vantage Capital", searchType: "Company Search", filters: "Revenue: >$10M, Country: NG", results: 204, datetime: "Jul 13, 2025 8:30 AM" },
  { user: "Priya Patel", type: "Individual", company: "—", searchType: "People Search", filters: "Dept: Engineering, Size: 50–200", results: 37, datetime: "Jul 13, 2025 8:15 AM" },
  { user: "Tom Richards", type: "Enterprise", company: "Nexus Technologies", searchType: "People Search", filters: "Title: VP Sales, Country: US", results: 178, datetime: "Jul 12, 2025 5:10 PM" },
  { user: "Emma Laurent", type: "Individual", company: "—", searchType: "Company Search", filters: "Country: FR, Industry: Marketing", results: 92, datetime: "Jul 12, 2025 3:00 PM" },
  { user: "Kevin Zhou", type: "Enterprise", company: "Vantage Capital", searchType: "People Search", filters: "Title: CFO, Country: SG", results: 196, datetime: "Jul 12, 2025 1:45 PM" },
  { user: "Amara Diallo", type: "Individual", company: "—", searchType: "People Search", filters: "Dept: HR, Country: GH", results: 14, datetime: "Jul 12, 2025 11:30 AM" },
  { user: "Mark Ellis", type: "Enterprise", company: "DataSync Ltd", searchType: "Company Search", filters: "Industry: Analytics, Country: UK", results: 56, datetime: "Jul 12, 2025 10:00 AM" },
  { user: "Ryan Nguyen", type: "Individual", company: "—", searchType: "People Search", filters: "Title: CTO, Country: AU", results: 28, datetime: "Jul 11, 2025 4:30 PM" },
];

const EMAIL_REVEALS = [
  { user: "Laura Chen", type: "Enterprise", company: "Nexus Technologies", contact: "Michael Bauer", datetime: "Jul 13, 2025 9:10 AM" },
  { user: "James Okafor", type: "Enterprise", company: "Vantage Capital", contact: "Chioma Eze", datetime: "Jul 13, 2025 8:35 AM" },
  { user: "John Carter", type: "Individual", company: "—", contact: "Sarah Thompson", datetime: "Jul 13, 2025 8:52 AM" },
  { user: "Tom Richards", type: "Enterprise", company: "Nexus Technologies", contact: "David Park", datetime: "Jul 12, 2025 5:20 PM" },
  { user: "Priya Patel", type: "Individual", company: "—", contact: "Liam O'Brien", datetime: "Jul 12, 2025 2:45 PM" },
  { user: "Kevin Zhou", type: "Enterprise", company: "Vantage Capital", contact: "Mei Lin", datetime: "Jul 12, 2025 1:50 PM" },
  { user: "Emma Laurent", type: "Individual", company: "—", contact: "François Dubois", datetime: "Jul 12, 2025 3:05 PM" },
  { user: "Mark Ellis", type: "Enterprise", company: "DataSync Ltd", contact: "Alice Johnson", datetime: "Jul 12, 2025 10:15 AM" },
];

const LOGIN_HISTORY = [
  { user: "Super Admin", email: "admin@leadsbuddy.ai", type: "Admin", datetime: "Jul 13, 2025 8:00 AM", status: "successful" },
  { user: "Laura Chen", email: "laura@nexustech.io", type: "Enterprise", datetime: "Jul 13, 2025 9:00 AM", status: "successful" },
  { user: "John Carter", email: "john.carter@example.com", type: "Individual", datetime: "Jul 13, 2025 9:14 AM", status: "successful" },
  { user: "David Osei", email: "d.osei@innovate.gh", type: "Individual", datetime: "Jul 13, 2025 7:30 AM", status: "failed" },
  { user: "Priya Patel", email: "priya.patel@techco.in", type: "Individual", datetime: "Jul 13, 2025 11:30 AM", status: "successful" },
  { user: "James Okafor", email: "james@vantagecap.ng", type: "Enterprise", datetime: "Jul 13, 2025 8:28 AM", status: "successful" },
  { user: "Emma Laurent", email: "emma.laurent@agence.fr", type: "Individual", datetime: "Jul 13, 2025 8:55 AM", status: "successful" },
  { user: "Unknown", email: "hacker@bad.com", type: "—", datetime: "Jul 12, 2025 11:59 PM", status: "failed" },
  { user: "Amara Diallo", email: "amara@datasuite.co", type: "Individual", datetime: "Jul 13, 2025 7:40 AM", status: "successful" },
  { user: "Ryan Nguyen", email: "ryan.n@devshop.io", type: "Individual", datetime: "Jul 12, 2025 6:20 PM", status: "successful" },
];

const EXPORTED_REPORTS = [
  { name: "User Activity Report", description: "Comprehensive activity log for all users", contents: "Searches, reveals, logins, date range filters" },
  { name: "Revenue Report", description: "Complete payment and revenue analytics", contents: "Transactions, refunds, plan breakdown, MRR" },
  { name: "Enterprise Usage Report", description: "Usage metrics for all enterprise accounts", contents: "Team usage, credit consumption, search activity" },
  { name: "Support & Tickets Report", description: "Ticket volume, resolution times, SLA compliance", contents: "Ticket status, priority, category, response times" },
  { name: "Plan & Subscription Report", description: "Subscription health and plan distribution", contents: "Plan counts, upgrades, downgrades, churn" },
  { name: "Credit Consumption Report", description: "Credit allocation and usage across all accounts", contents: "Allocated, used, remaining, exceeded accounts" },
  { name: "Login & Security Report", description: "Authentication logs and failed login attempts", contents: "Login success/fail, IP, device, timestamps" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Search Activity");

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

      {activeTab === "Search Activity" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Time</option><option>Today</option><option>This Week</option><option>This Month</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Search Types</option><option>People Search</option><option>Company Search</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Account Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Company</th>
                  <th className="px-5 py-3 text-left font-semibold">Search Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Filters Applied</th>
                  <th className="px-5 py-3 text-left font-semibold">Results</th>
                  <th className="px-5 py-3 text-left font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {SEARCH_ACTIVITY.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.user}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{row.company}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.searchType}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{row.filters}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{row.results}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{row.datetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Email Reveals" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Time</option><option>Today</option><option>This Week</option><option>This Month</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Account Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Company</th>
                  <th className="px-5 py-3 text-left font-semibold">Contact Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {EMAIL_REVEALS.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.user}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{row.company}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{row.contact}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{row.datetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Login History" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Time</option><option>Today</option><option>This Week</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Account Types</option><option>Individual</option><option>Enterprise</option><option>Admin</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none">
              <option>All Statuses</option><option>Successful</option><option>Failed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Email</th>
                  <th className="px-5 py-3 text-left font-semibold">Account Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Login Date & Time</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {LOGIN_HISTORY.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 ${row.status === "failed" ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{row.user}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.type === "Enterprise" ? "bg-violet-50 text-violet-700 border border-violet-200"
                          : row.type === "Admin" ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : row.type === "—" ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{row.datetime}</td>
                    <td className="px-5 py-3.5"><Badge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Exported Reports" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXPORTED_REPORTS.map((report, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{report.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{report.description}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Contains</p>
                <p className="text-xs text-slate-600 leading-relaxed">{report.contents}</p>
              </div>
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
