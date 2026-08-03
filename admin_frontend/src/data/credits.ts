export const OVERVIEW_CARDS = [
  { label: "Total Allocated", value: "248,000", color: "text-slate-900", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Total Consumed", value: "189,420", color: "text-slate-900", bg: "bg-violet-50", border: "border-violet-200" },
  { label: "Total Remaining", value: "58,580", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "Accounts >80% Used", value: "23", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "Accounts Exceeded", value: "4", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
];

export const INDIVIDUAL_CREDITS = [
  { name: "John Carter", initials: "JC", email: "john.carter@example.com", plan: "Pro", limit: 500, used: 248, status: "healthy" },
  { name: "Sarah Kim", initials: "SK", email: "sarah.kim@startup.io", plan: "Business", limit: 2000, used: 1823, status: "low" },
  { name: "Marcus Webb", initials: "MW", email: "marcus.webb@mail.com", plan: "Free", limit: 50, used: 14, status: "healthy" },
  { name: "Priya Patel", initials: "PP", email: "priya.patel@techco.in", plan: "Pro", limit: 500, used: 380, status: "low" },
  { name: "David Osei", initials: "DO", email: "d.osei@innovate.gh", plan: "Free", limit: 50, used: 52, status: "exceeded" },
  { name: "Emma Laurent", initials: "EL", email: "emma.laurent@agence.fr", plan: "Business", limit: 2000, used: 897, status: "healthy" },
  { name: "Ryan Nguyen", initials: "RN", email: "ryan.n@devshop.io", plan: "Pro", limit: 500, used: 92, status: "healthy" },
  { name: "Amara Diallo", initials: "AD", email: "amara@datasuite.co", plan: "Free", limit: 50, used: 31, status: "healthy" },
];

export const ENTERPRISE_CREDITS = [
  { name: "Acme Corp", initials: "AC", plan: "Business", limit: 20000, used: 8420, status: "healthy" },
  { name: "Nexus Technologies", initials: "NT", plan: "Enterprise", limit: 100000, used: 45300, status: "healthy" },
  { name: "DataSync Ltd", initials: "DS", plan: "Business", limit: 20000, used: 17800, status: "low" },
  { name: "PrimeReach Agency", initials: "PR", plan: "Pro", limit: 5000, used: 5200, status: "exceeded" },
  { name: "Vantage Capital", initials: "VC", plan: "Enterprise", limit: 100000, used: 61200, status: "healthy" },
];

export const ADJUSTMENT_LOG = [
  { account: "Sarah Kim", type: "Individual", adjType: "added", amount: 200, reason: "Promotional credit", by: "Super Admin", date: "Jul 12, 2025" },
  { account: "DataSync Ltd", type: "Enterprise", adjType: "added", amount: 5000, reason: "Contract bonus", by: "Super Admin", date: "Jul 10, 2025" },
  { account: "David Osei", type: "Individual", adjType: "deducted", amount: 10, reason: "Policy violation", by: "Super Admin", date: "Jul 8, 2025" },
  { account: "PrimeReach Agency", type: "Enterprise", adjType: "added", amount: 1000, reason: "Support resolution", by: "Super Admin", date: "Jul 5, 2025" },
  { account: "Priya Patel", type: "Individual", adjType: "added", amount: 100, reason: "Referral bonus", by: "Super Admin", date: "Jul 3, 2025" },
  { account: "Nexus Technologies", type: "Enterprise", adjType: "added", amount: 10000, reason: "Annual top-up", by: "Super Admin", date: "Jun 30, 2025" },
  { account: "Marcus Webb", type: "Individual", adjType: "deducted", amount: 5, reason: "Usage correction", by: "Super Admin", date: "Jun 28, 2025" },
  { account: "Acme Corp", type: "Enterprise", adjType: "added", amount: 2000, reason: "Upgrade bonus", by: "Super Admin", date: "Jun 25, 2025" },
];
