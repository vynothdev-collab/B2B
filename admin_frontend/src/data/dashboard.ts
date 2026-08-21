import { Users, Banknote, CreditCard, Zap, Ticket } from "lucide-react";

// NOTE: `value`/`trend` below are placeholder fallbacks shown only while the
// live dashboard fetch is loading or if a field fails to populate — real
// numbers come from the API calls in dashboard/page.tsx (see `overview` state).
export const OVERVIEW_STATS = [
  {
    label: "Total Platform Users",
    value: "—",
    sub: "Individual + Enterprise",
    icon: Users,
    iconBg: "var(--forest)",
    iconColor: "#EFEAD9",
  },
  {
    label: "Revenue This Month",
    value: "—",
    sub: "Paid plan purchases",
    icon: Banknote,
    iconBg: "var(--sage)",
    iconColor: "#F4FBF1",
  },
  {
    label: "Active Subscriptions",
    value: "—",
    sub: "Individual paid plans",
    icon: CreditCard,
    iconBg: "var(--gold)",
    iconColor: "#3C2400",
  },
  {
    label: "Searches This Month",
    value: "—",
    sub: "Individual + Enterprise",
    icon: Zap,
    iconBg: "var(--rust)",
    iconColor: "#FFF0EB",
  },
];

export const ALERTS = [
  {
    type: "urgent",
    icon: Ticket,
    label: "4 urgent tickets unresolved",
    sub: "Tickets #1042, #1040, #1036, #1035",
    alertColor: "var(--rose)",
    alertBg: "var(--rose-dim)",
    alertBorder: "var(--rose)",
    action: "View Tickets",
    href: "/tickets",
  },
  {
    type: "warning",
    icon: CreditCard,
    label: "7 failed payments this month",
    sub: "Requires manual follow-up",
    alertColor: "#8A6222",
    alertBg: "var(--gold-dim)",
    alertBorder: "var(--gold)",
    action: "View Payments",
    href: "/payments",
  },
  {
    type: "info",
    icon: Users,
    label: "6 pending invitations",
    sub: "2 enterprise + 4 individual",
    alertColor: "#8A6222",
    alertBg: "var(--gold-dim)",
    alertBorder: "var(--gold)",
    action: "View Invitations",
    href: "/users",
  },
];

export const RECENT_TICKETS_PREVIEW = [
  { id: "#1042", subject: "Unable to login after password reset",           by: "John Carter",   priority: "urgent",  status: "open",        updated: "5 min ago"  },
  { id: "#1041", subject: "Invoice amount incorrect after offer code",      by: "DataSync Ltd",  priority: "pending", status: "in_progress", updated: "2 hr ago"   },
  { id: "#1040", subject: "Search results returning empty for all filters", by: "Priya Patel",   priority: "urgent",  status: "open",        updated: "4 hr ago"   },
  { id: "#1039", subject: "Request to increase monthly credit limit",       by: "Vantage Capital",priority:"pending", status: "open",        updated: "Yesterday"  },
];

export const RECENT_ACTIVITY = [
  { type: "signup",     dotColor: "var(--forest)", text: "New signup: john.carter@example.com",                          time: "2 min ago"  },
  { type: "payment",    dotColor: "var(--sage)",   text: "Payment received: $299 — Acme Corp (Business)",                time: "11 min ago" },
  { type: "enterprise", dotColor: "var(--gold)",   text: "Enterprise account created: Nexus Technologies",               time: "34 min ago" },
  { type: "ticket",     dotColor: "var(--rose)",   text: "Urgent ticket #1042 opened — Login issue (John Carter)",       time: "1 hr ago"   },
  { type: "signup",     dotColor: "var(--forest)", text: "New signup: sarah.kim@startup.io",                             time: "1 hr ago"   },
  { type: "plan",       dotColor: "var(--gold)",   text: "Plan upgraded: DataSync Ltd → Business Plan",                  time: "2 hr ago"   },
  { type: "payment",    dotColor: "var(--sage)",   text: "Payment received: $49 — Marcus Webb (Pro)",                    time: "3 hr ago"   },
  { type: "suspend",    dotColor: "var(--ink-faint)", text: "User account suspended: spammer123@mail.com",               time: "4 hr ago"   },
  { type: "ticket",     dotColor: "var(--rose)",   text: "Ticket #1040 opened — Search not working (Priya Patel)",       time: "4 hr ago"   },
  { type: "payment",    dotColor: "var(--rust)",   text: "Payment failed: $49 — Ryan Nguyen (Pro renewal)",              time: "6 hr ago"   },
];

