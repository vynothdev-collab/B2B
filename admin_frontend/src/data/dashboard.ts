import { Users, Search, DollarSign, Ticket, MessageSquare, CreditCard } from "lucide-react";

export const OVERVIEW_STATS = [
  {
    label: "Total Platform Users",
    value: "1,916",
    sub: "Individual + Enterprise",
    trend: "+30 this week",
    trendUp: true,
    icon: Users,
    iconBg: "bg-blue-600",
    border: "border-blue-100",
  },
  {
    label: "Revenue This Month",
    value: "$18,420",
    sub: "↑ 9.6% vs last month",
    trend: "+$1,620 vs Jun",
    trendUp: true,
    icon: DollarSign,
    iconBg: "bg-emerald-600",
    border: "border-emerald-100",
  },
  {
    label: "Active Subscriptions",
    value: "608",
    sub: "Pro + Business + Enterprise",
    trend: "+14 this month",
    trendUp: true,
    icon: CreditCard,
    iconBg: "bg-violet-600",
    border: "border-violet-100",
  },
  {
    label: "Searches This Month",
    value: "24,381",
    sub: "↑ 8% vs last month",
    trend: "+1,811 vs Jun",
    trendUp: true,
    icon: Search,
    iconBg: "bg-cyan-600",
    border: "border-cyan-100",
  },
];

export const INDIVIDUAL_STATS = {
  total: 1284,
  newThisWeek: 12,
  newThisMonth: 48,
  activeThisMonth: 659,
  inactiveCount: 625,
  freeCount: 680,
  paidCount: 604,
  searchesThisMonth: 18240,
  revealsThisMonth: 2180,
  plans: [
    { name: "Free", count: 680, pct: 53, color: "bg-slate-300", textColor: "text-slate-500" },
    { name: "Pro", count: 412, pct: 32, color: "bg-blue-500", textColor: "text-blue-600" },
    { name: "Business", count: 148, pct: 12, color: "bg-violet-500", textColor: "text-violet-600" },
    { name: "Other", count: 44, pct: 3, color: "bg-slate-400", textColor: "text-slate-400" },
  ],
};

export const ENTERPRISE_STATS = {
  totalAccounts: 48,
  totalUsers: 632,
  newAccountsThisMonth: 2,
  newUsersThisWeek: 18,
  activeAccounts: 44,
  suspendedAccounts: 4,
  searchesThisMonth: 6141,
  revealsThisMonth: 962,
  revenueThisMonth: 9200,
  topAccounts: [
    { name: "Vantage Capital", initials: "VC", plan: "Enterprise", users: 35, status: "active" },
    { name: "Nexus Technologies", initials: "NT", plan: "Enterprise", users: 28, status: "active" },
    { name: "Acme Corp", initials: "AC", plan: "Business", users: 12, status: "active" },
    { name: "DataSync Ltd", initials: "DS", plan: "Business", users: 7, status: "active" },
    { name: "BrightPath EDU", initials: "BP", plan: "Business", users: 5, status: "inactive" },
  ],
};

export const ALERTS = [
  { type: "urgent", icon: Ticket, label: "4 urgent tickets unresolved", sub: "Tickets #1042, #1040, #1036, #1035", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", action: "View Tickets", href: "/tickets" },
  { type: "warning", icon: CreditCard, label: "7 failed payments this month", sub: "Requires manual follow-up", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", action: "View Payments", href: "/payments" },
  { type: "info", icon: MessageSquare, label: "3 unread live chats", sub: "Waiting for admin response", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", action: "Open Chats", href: "/live-chat" },
  { type: "info", icon: Users, label: "6 pending invitations", sub: "2 enterprise + 4 individual", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", action: "View Invitations", href: "/users" },
];

export const RECENT_SIGNUPS = [
  { name: "John Carter", email: "john.carter@example.com", initials: "JC", plan: "Pro", type: "Individual", time: "2 min ago" },
  { name: "Sarah Kim", email: "sarah.kim@startup.io", initials: "SK", plan: "Business", type: "Individual", time: "1 hr ago" },
  { name: "Nexus Technologies", email: "laura@nexustech.io", initials: "NT", plan: "Enterprise", type: "Enterprise", time: "34 min ago" },
  { name: "David Osei", email: "d.osei@innovate.gh", initials: "DO", plan: "Free", type: "Individual", time: "3 hr ago" },
  { name: "Amara Diallo", email: "amara@datasuite.co", initials: "AD", plan: "Free", type: "Individual", time: "5 hr ago" },
];

export const RECENT_TICKETS_PREVIEW = [
  { id: "#1042", subject: "Unable to login after password reset", by: "John Carter", priority: "urgent", status: "open", updated: "5 min ago" },
  { id: "#1041", subject: "Invoice amount incorrect after offer code", by: "DataSync Ltd", priority: "pending", status: "in_progress", updated: "2 hr ago" },
  { id: "#1040", subject: "Search results returning empty for all filters", by: "Priya Patel", priority: "urgent", status: "open", updated: "4 hr ago" },
  { id: "#1039", subject: "Request to increase monthly credit limit", by: "Vantage Capital", priority: "pending", status: "open", updated: "Yesterday" },
];

export const RECENT_CHATS_PREVIEW = [
  { id: "CHT-001", user: "John Carter", initials: "JC", subject: "Can't access my account dashboard", unread: 2, status: "open", last: "5 min ago" },
  { id: "CHT-002", user: "Laura Chen", initials: "LC", subject: "How to add team members to our plan", unread: 1, status: "open", last: "22 min ago" },
  { id: "CHT-005", user: "James Okafor", initials: "JO", subject: "Request for custom plan pricing", unread: 3, status: "open", last: "Yesterday" },
];

export const RECENT_ACTIVITY = [
  { type: "signup", color: "bg-blue-500", text: "New signup: john.carter@example.com", time: "2 min ago" },
  { type: "payment", color: "bg-emerald-500", text: "Payment received: $299 — Acme Corp (Business)", time: "11 min ago" },
  { type: "enterprise", color: "bg-violet-500", text: "Enterprise account created: Nexus Technologies", time: "34 min ago" },
  { type: "ticket", color: "bg-red-500", text: "Urgent ticket #1042 opened — Login issue (John Carter)", time: "1 hr ago" },
  { type: "signup", color: "bg-blue-500", text: "New signup: sarah.kim@startup.io", time: "1 hr ago" },
  { type: "plan", color: "bg-amber-500", text: "Plan upgraded: DataSync Ltd → Business Plan", time: "2 hr ago" },
  { type: "payment", color: "bg-emerald-500", text: "Payment received: $49 — Marcus Webb (Pro)", time: "3 hr ago" },
  { type: "suspend", color: "bg-slate-400", text: "User account suspended: spammer123@mail.com", time: "4 hr ago" },
  { type: "ticket", color: "bg-red-500", text: "Ticket #1040 opened — Search not working (Priya Patel)", time: "4 hr ago" },
  { type: "payment", color: "bg-red-400", text: "Payment failed: $49 — Ryan Nguyen (Pro renewal)", time: "6 hr ago" },
];

export const PLATFORM_USAGE = [
  { label: "Searches", individual: 18240, enterprise: 6141, color: "bg-blue-500" },
  { label: "Reveals", individual: 2180, enterprise: 962, color: "bg-violet-500" },
];
