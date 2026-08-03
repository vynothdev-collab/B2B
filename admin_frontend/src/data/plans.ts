export const PLANS = [
  {
    name: "Free",
    accountType: "Individual",
    price: "$0",
    period: "/mo",
    status: "active",
    iconBg: "var(--line-soft)",
    iconColor: "var(--ink-dim)",
    limits: ["50 searches / month", "10 email reveals / month", "1 user seat", "Basic filters", "Email support"],
  },
  {
    name: "Pro",
    accountType: "Individual",
    price: "$49",
    period: "/mo",
    status: "active",
    iconBg: "rgba(23,50,41,.10)",
    iconColor: "var(--forest)",
    limits: ["500 searches / month", "100 email reveals / month", "1 user seat", "Advanced filters", "Priority email support"],
  },
  {
    name: "Business",
    accountType: "Individual",
    price: "$149",
    period: "/mo",
    status: "active",
    iconBg: "var(--gold-dim)",
    iconColor: "#8A6222",
    limits: ["2,000 searches / month", "500 email reveals / month", "Up to 5 user seats", "Team management", "Live chat support"],
  },
  {
    name: "Enterprise",
    accountType: "Enterprise",
    price: "$399",
    period: "/mo",
    status: "active",
    iconBg: "var(--sage-dim)",
    iconColor: "var(--sage-dark, #3E6A44)",
    limits: ["Unlimited searches", "2,000 email reveals / month", "Up to 25 user seats", "Dedicated account manager", "SLA & priority support"],
  },
  {
    name: "Enterprise Custom",
    accountType: "Enterprise",
    price: "Custom",
    period: "",
    status: "active",
    iconBg: "var(--rust-dim)",
    iconColor: "var(--rust)",
    limits: ["Custom search volume", "Custom reveal limits", "Unlimited user seats", "Custom integrations & SSO", "Dedicated SLA & TAM"],
  },
];

export const INDIVIDUAL_PLANS = PLANS.filter((p) => p.accountType === "Individual");
export const ENTERPRISE_PLANS = PLANS.filter((p) => p.accountType === "Enterprise");

export const ASSIGNMENT_HISTORY = [
  { account: "DataSync Ltd",        type: "Enterprise", prev: "Pro",      next: "Business",    changedBy: "Super Admin", date: "Jul 10, 2025", reason: "Upgraded by request"    },
  { account: "Marcus Webb",         type: "Individual", prev: "Free",     next: "Pro",         changedBy: "Super Admin", date: "Jul 8, 2025",  reason: "Trial conversion"        },
  { account: "Nexus Technologies",  type: "Enterprise", prev: "Business", next: "Enterprise",  changedBy: "Super Admin", date: "Jul 3, 2025",  reason: "Team expansion"          },
  { account: "Emma Laurent",        type: "Individual", prev: "Pro",      next: "Business",    changedBy: "Super Admin", date: "Jun 28, 2025", reason: "User-initiated upgrade"  },
  { account: "PrimeReach Agency",   type: "Enterprise", prev: "Business", next: "Pro",         changedBy: "Super Admin", date: "Jun 20, 2025", reason: "Downgrade request"       },
  { account: "Priya Patel",         type: "Individual", prev: "Free",     next: "Pro",         changedBy: "Super Admin", date: "Jun 15, 2025", reason: "Offer redemption"        },
  { account: "BrightPath EDU",      type: "Enterprise", prev: "Pro",      next: "Business",    changedBy: "Super Admin", date: "Jun 10, 2025", reason: "Edu plan upgrade"        },
  { account: "Ryan Nguyen",         type: "Individual", prev: "Pro",      next: "Free",        changedBy: "Super Admin", date: "Jun 5, 2025",  reason: "Non-renewal"             },
];

export const INDIVIDUAL_HISTORY = ASSIGNMENT_HISTORY.filter((h) => h.type === "Individual");
export const ENTERPRISE_HISTORY = ASSIGNMENT_HISTORY.filter((h) => h.type === "Enterprise");
