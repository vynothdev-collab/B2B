import { Users, Building2, UserCheck, Search, Mail, Ticket, MessageSquare, DollarSign } from "lucide-react";

export const STAT_CARDS = [
  { label: "Total Individual Users", value: "1,284", trend: "↑ 12 this week", trendUp: true, icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { label: "Total Enterprise Accounts", value: "48", trend: "↑ 2 this month", trendUp: true, icon: Building2, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { label: "Total Enterprise Users", value: "632", trend: "↑ 18 this week", trendUp: true, icon: UserCheck, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { label: "Active Users This Month", value: "891", trend: "↑ 5% vs last month", trendUp: true, icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "Searches This Month", value: "24,381", trend: "↑ 8% vs last month", trendUp: true, icon: Search, iconBg: "bg-cyan-50", iconColor: "text-cyan-600" },
  { label: "Email Reveals This Month", value: "3,142", trend: "↓ 3% vs last month", trendUp: false, icon: Mail, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  { label: "Open Support Tickets", value: "14", trend: "4 urgent", trendUp: false, highlight: "red", icon: Ticket, iconBg: "bg-red-50", iconColor: "text-red-600" },
  { label: "Unread Live Chats", value: "3", trend: "Waiting for reply", trendUp: null as boolean | null, highlight: "amber", icon: MessageSquare, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { label: "Revenue This Month", value: "$18,420", trend: "↑ 9.6% vs last month", trendUp: true, icon: DollarSign, iconBg: "bg-green-50", iconColor: "text-green-600" },
];

export const RECENT_ACTIVITY = [
  { color: "bg-blue-500", text: "New signup: john.carter@example.com", time: "2 min ago" },
  { color: "bg-emerald-500", text: "Payment received: $299 — Acme Corp (Business)", time: "11 min ago" },
  { color: "bg-violet-500", text: "Enterprise created: Nexus Technologies", time: "34 min ago" },
  { color: "bg-red-500", text: "Ticket #1042 opened — Billing issue", time: "1 hr ago" },
  { color: "bg-blue-500", text: "New signup: sarah.kim@startup.io", time: "1 hr ago" },
  { color: "bg-amber-500", text: "Plan upgraded: DataSync Ltd → Business", time: "2 hr ago" },
  { color: "bg-emerald-500", text: "Payment received: $49 — Marcus Webb (Pro)", time: "3 hr ago" },
  { color: "bg-slate-400", text: "User suspended: spammer123@mail.com", time: "4 hr ago" },
];

export const PLAN_DISTRIBUTION = [
  { plan: "Free", count: 680, total: 1284, color: "bg-slate-400" },
  { plan: "Pro", count: 412, total: 1284, color: "bg-blue-500" },
  { plan: "Business", count: 148, total: 1284, color: "bg-violet-500" },
  { plan: "Enterprise", count: 48, total: 1284, color: "bg-emerald-500" },
];
