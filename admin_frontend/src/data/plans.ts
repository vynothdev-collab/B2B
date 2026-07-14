export const PLANS = [
  { name: "Free", price: "$0", period: "/mo", status: "active", color: "bg-slate-100", iconColor: "text-slate-600", limits: ["50 searches / month", "10 email reveals / month", "1 user seat", "Basic filters", "Email support"] },
  { name: "Pro", price: "$49", period: "/mo", status: "active", color: "bg-blue-50", iconColor: "text-blue-600", limits: ["500 searches / month", "100 email reveals / month", "1 user seat", "Advanced filters", "Priority email support"] },
  { name: "Business", price: "$149", period: "/mo", status: "active", color: "bg-violet-50", iconColor: "text-violet-600", limits: ["2,000 searches / month", "500 email reveals / month", "Up to 5 user seats", "Team management", "Live chat support"] },
  { name: "Enterprise", price: "$399", period: "/mo", status: "active", color: "bg-emerald-50", iconColor: "text-emerald-600", limits: ["Unlimited searches", "2,000 email reveals / month", "Up to 25 user seats", "Dedicated account manager", "SLA & priority support"] },
];

export const ASSIGNMENT_HISTORY = [
  { account: "DataSync Ltd", type: "Enterprise", prev: "Pro", next: "Business", changedBy: "Super Admin", date: "Jul 10, 2025", reason: "Upgraded by request" },
  { account: "Marcus Webb", type: "Individual", prev: "Free", next: "Pro", changedBy: "Super Admin", date: "Jul 8, 2025", reason: "Trial conversion" },
  { account: "Nexus Technologies", type: "Enterprise", prev: "Business", next: "Enterprise", changedBy: "Super Admin", date: "Jul 3, 2025", reason: "Team expansion" },
  { account: "Emma Laurent", type: "Individual", prev: "Pro", next: "Business", changedBy: "Super Admin", date: "Jun 28, 2025", reason: "User-initiated upgrade" },
  { account: "PrimeReach Agency", type: "Enterprise", prev: "Business", next: "Pro", changedBy: "Super Admin", date: "Jun 20, 2025", reason: "Downgrade request" },
  { account: "Priya Patel", type: "Individual", prev: "Free", next: "Pro", changedBy: "Super Admin", date: "Jun 15, 2025", reason: "Offer redemption" },
  { account: "BrightPath EDU", type: "Enterprise", prev: "Pro", next: "Business", changedBy: "Super Admin", date: "Jun 10, 2025", reason: "Edu plan upgrade" },
  { account: "Ryan Nguyen", type: "Individual", prev: "Pro", next: "Free", changedBy: "Super Admin", date: "Jun 5, 2025", reason: "Non-renewal" },
];
