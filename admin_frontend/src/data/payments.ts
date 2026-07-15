export const ALL_TRANSACTIONS = [
  { inv: "INV-20250713-0045", account: "Nexus Technologies", type: "Enterprise", plan: "Enterprise", amount: "$399.00", discount: "$0", final: "$399.00", method: "Card", date: "Jul 13, 2025", status: "paid" },
  { inv: "INV-20250712-0044", account: "John Carter", type: "Individual", plan: "Pro", amount: "$49.00", discount: "$9.80", final: "$39.20", method: "Card", date: "Jul 12, 2025", status: "paid" },
  { inv: "INV-20250711-0043", account: "Vantage Capital", type: "Enterprise", plan: "Enterprise", amount: "$399.00", discount: "$100.00", final: "$299.00", method: "Bank Transfer", date: "Jul 11, 2025", status: "paid" },
  { inv: "INV-20250710-0042", account: "Sarah Kim", type: "Individual", plan: "Business", amount: "$149.00", discount: "$29.80", final: "$119.20", method: "Card", date: "Jul 10, 2025", status: "paid" },
  { inv: "INV-20250710-0041", account: "DataSync Ltd", type: "Enterprise", plan: "Business", amount: "$149.00", discount: "$0", final: "$149.00", method: "Card", date: "Jul 10, 2025", status: "paid" },
  { inv: "INV-20250709-0040", account: "Emma Laurent", type: "Individual", plan: "Pro", amount: "$49.00", discount: "$9.80", final: "$39.20", method: "Card", date: "Jul 9, 2025", status: "paid" },
  { inv: "INV-20250708-0039", account: "Ryan Nguyen", type: "Individual", plan: "Pro", amount: "$49.00", discount: "$0", final: "$49.00", method: "Card", date: "Jul 8, 2025", status: "failed" },
  { inv: "INV-20250707-0038", account: "Acme Corp", type: "Enterprise", plan: "Business", amount: "$149.00", discount: "$0", final: "$149.00", method: "Bank Transfer", date: "Jul 7, 2025", status: "paid" },
  { inv: "INV-20250706-0037", account: "Priya Patel", type: "Individual", plan: "Pro", amount: "$49.00", discount: "$0", final: "$49.00", method: "Card", date: "Jul 6, 2025", status: "paid" },
  { inv: "INV-20250705-0036", account: "BrightPath EDU", type: "Enterprise", plan: "Business", amount: "$149.00", discount: "$29.80", final: "$119.20", method: "Card", date: "Jul 5, 2025", status: "pending" },
];

export const INDIVIDUAL_TXN = ALL_TRANSACTIONS.filter((t) => t.type === "Individual");
export const ENTERPRISE_TXN = ALL_TRANSACTIONS.filter((t) => t.type === "Enterprise");

export const REFUNDS = [
  { ref: "REF-20250711-001", invoice: "INV-20250620-0018", account: "Marcus Webb", type: "Individual", amount: "$49.00", reason: "Duplicate charge", by: "Super Admin", date: "Jul 11, 2025", status: "successful" },
  { ref: "REF-20250705-002", invoice: "INV-20250601-0010", account: "PrimeReach Agency", type: "Enterprise", amount: "$149.00", reason: "Account suspended", by: "Super Admin", date: "Jul 5, 2025", status: "successful" },
  { ref: "REF-20250628-003", invoice: "INV-20250520-0005", account: "David Osei", type: "Individual", amount: "$49.00", reason: "User request", by: "Super Admin", date: "Jun 28, 2025", status: "successful" },
  { ref: "REF-20250620-004", invoice: "INV-20250510-0002", account: "Amara Diallo", type: "Individual", amount: "$0.00", reason: "Credit note issued", by: "Super Admin", date: "Jun 20, 2025", status: "pending" },
];

export const REVENUE_PLANS = [
  { plan: "Pro", count: 412, revenue: 20188, max: 25000, color: "var(--forest)" },
  { plan: "Business", count: 148, revenue: 22052, max: 25000, color: "var(--gold)" },
  { plan: "Enterprise", count: 48, revenue: 19152, max: 25000, color: "var(--sage-dark, #3E6A44)" },
  { plan: "Free", count: 680, revenue: 0, max: 25000, color: "var(--line)" },
];

export const REVENUE_CARDS = [
  { label: "Revenue This Month", value: "$18,420", sub: "As of today", color: "var(--sage-dark, #3E6A44)" },
  { label: "Revenue Last Month", value: "$16,800", sub: "June 2025", color: "var(--ink)" },
  { label: "Revenue This Year", value: "$142,300", sub: "Jan–Jul 2025", color: "var(--ink)" },
  { label: "Active Paid Subscriptions", value: "608", sub: "Pro + Business + Enterprise", color: "var(--forest)" },
  { label: "Failed Payments This Month", value: "7", sub: "Requires attention", color: "var(--rose)" },
  { label: "Total Refunds This Month", value: "$1,240", sub: "3 transactions", color: "#8A6222" },
];
