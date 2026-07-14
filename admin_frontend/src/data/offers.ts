export const OFFERS = [
  { name: "Summer Launch 20%", accountType: "Individual", code: "SUMMER20", type: "Percentage Off", value: "20%", plans: "Pro, Business", from: "Jul 1, 2025", until: "Jul 31, 2025", used: 84, limit: 500, status: "active" },
  { name: "Enterprise Welcome", accountType: "Enterprise", code: "ENT-WELCOME", type: "Fixed Amount", value: "$100 off", plans: "Enterprise", from: "Jan 1, 2025", until: "Dec 31, 2025", used: 12, limit: 50, status: "active" },
  { name: "14-Day Free Trial", accountType: "Individual", code: "FREETRIAL14", type: "Free Trial", value: "14 days", plans: "Pro", from: "Jun 1, 2025", until: "Aug 31, 2025", used: 218, limit: 1000, status: "active" },
  { name: "Referral Bonus Credits", accountType: "All", code: "REFCREDIT", type: "Bonus Credits", value: "+200 credits", plans: "All Plans", from: "Apr 1, 2025", until: "Sep 30, 2025", used: 143, limit: 2000, status: "active" },
  { name: "Enterprise Annual Deal", accountType: "Enterprise", code: "ENT-ANNUAL", type: "Percentage Off", value: "25%", plans: "Enterprise, Enterprise Custom", from: "Jan 1, 2025", until: "Dec 31, 2025", used: 8, limit: 30, status: "active" },
  { name: "Black Friday 2024", accountType: "All", code: "BF2024", type: "Percentage Off", value: "30%", plans: "Pro, Business, Enterprise", from: "Nov 28, 2024", until: "Nov 30, 2024", used: 392, limit: 500, status: "expired" },
  { name: "New Year Special", accountType: "Individual", code: "NY2025", type: "Percentage Off", value: "15%", plans: "Business", from: "Jan 1, 2025", until: "Jan 7, 2025", used: 67, limit: 100, status: "expired" },
];

export const INDIVIDUAL_OFFERS = OFFERS.filter((o) => o.accountType === "Individual" || o.accountType === "All");
export const ENTERPRISE_OFFERS = OFFERS.filter((o) => o.accountType === "Enterprise" || o.accountType === "All");

export const REDEMPTION_HISTORY = [
  { account: "Marcus Webb", type: "Individual", offer: "14-Day Free Trial", code: "FREETRIAL14", discount: "14 days free", plan: "Pro", date: "Jul 12, 2025", invoice: "INV-20250712-0041" },
  { account: "DataSync Ltd", type: "Enterprise", offer: "Summer Launch 20%", code: "SUMMER20", discount: "$29.80 off", plan: "Business", date: "Jul 10, 2025", invoice: "INV-20250710-0039" },
  { account: "Priya Patel", type: "Individual", offer: "Referral Bonus Credits", code: "REFCREDIT", discount: "+200 credits", plan: "Pro", date: "Jul 8, 2025", invoice: "INV-20250708-0037" },
  { account: "Nexus Technologies", type: "Enterprise", offer: "Enterprise Welcome", code: "ENT-WELCOME", discount: "$100 off", plan: "Enterprise", date: "Jul 3, 2025", invoice: "INV-20250703-0034" },
  { account: "Emma Laurent", type: "Individual", offer: "Summer Launch 20%", code: "SUMMER20", discount: "$9.80 off", plan: "Pro", date: "Jul 1, 2025", invoice: "INV-20250701-0031" },
  { account: "Vantage Capital", type: "Enterprise", offer: "Enterprise Welcome", code: "ENT-WELCOME", discount: "$100 off", plan: "Enterprise", date: "Jun 28, 2025", invoice: "INV-20250628-0028" },
  { account: "John Carter", type: "Individual", offer: "Referral Bonus Credits", code: "REFCREDIT", discount: "+200 credits", plan: "Pro", date: "Jun 25, 2025", invoice: "INV-20250625-0025" },
  { account: "BrightPath EDU", type: "Enterprise", offer: "Summer Launch 20%", code: "SUMMER20", discount: "$29.80 off", plan: "Business", date: "Jun 22, 2025", invoice: "INV-20250622-0022" },
];

export const INDIVIDUAL_REDEMPTIONS = REDEMPTION_HISTORY.filter((r) => r.type === "Individual");
export const ENTERPRISE_REDEMPTIONS = REDEMPTION_HISTORY.filter((r) => r.type === "Enterprise");
