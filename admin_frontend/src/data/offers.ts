export type PlanDiscount = {
  name: string;
  code: string;
  discountType: string;
  value: string;
  plans: string;
  from: string;
  until: string;
  used: number;
  limit: number;
  status: string;
};

export type UserDiscount = {
  name: string;
  code: string;
  discountType: string;
  value: string;
  plan: string;
  targetUser: string;
  targetEmail: string;
  from: string;
  until: string;
  status: string;
};

export const INDIVIDUAL_PLAN_DISCOUNTS: PlanDiscount[] = [
  { name: "Summer Launch 20%", code: "SUMMER20", discountType: "Percentage Off", value: "20%", plans: "Pro, Business", from: "Jul 1, 2025", until: "Jul 31, 2025", used: 84, limit: 500, status: "active" },
  { name: "14-Day Free Trial", code: "FREETRIAL14", discountType: "Free Trial", value: "14 days", plans: "Pro", from: "Jun 1, 2025", until: "Aug 31, 2025", used: 218, limit: 1000, status: "active" },
  { name: "Referral Bonus Credits", code: "REFCREDIT", discountType: "Bonus Credits", value: "+200 credits", plans: "All Plans", from: "Apr 1, 2025", until: "Sep 30, 2025", used: 143, limit: 2000, status: "active" },
  { name: "New Year Special", code: "NY2025", discountType: "Percentage Off", value: "15%", plans: "Business", from: "Jan 1, 2025", until: "Jan 7, 2025", used: 67, limit: 100, status: "expired" },
  { name: "Black Friday 2024", code: "BF2024", discountType: "Percentage Off", value: "30%", plans: "Pro, Business", from: "Nov 28, 2024", until: "Nov 30, 2024", used: 312, limit: 400, status: "expired" },
];

export const INDIVIDUAL_USER_DISCOUNTS: UserDiscount[] = [
  { name: "Loyalty Reward – Marcus", code: "LOYAL-MW", discountType: "Percentage Off", value: "25%", plan: "Pro", targetUser: "Marcus Webb", targetEmail: "marcus.webb@email.com", from: "Jul 1, 2025", until: "Jul 31, 2025", status: "active" },
  { name: "Win-back Offer – Emma", code: "WINBACK-EL", discountType: "Fixed Amount", value: "$20 off", plan: "Business", targetUser: "Emma Laurent", targetEmail: "emma.laurent@email.com", from: "Jul 5, 2025", until: "Aug 5, 2025", status: "active" },
  { name: "Trial Extension – Priya", code: "EXT-PP", discountType: "Free Trial", value: "7 days", plan: "Pro", targetUser: "Priya Patel", targetEmail: "priya.patel@email.com", from: "Jun 15, 2025", until: "Jun 22, 2025", status: "expired" },
  { name: "Referral Reward – Ryan", code: "REF-RN", discountType: "Bonus Credits", value: "+500 credits", plan: "Pro", targetUser: "Ryan Nguyen", targetEmail: "ryan.nguyen@email.com", from: "Jun 5, 2025", until: "Jul 5, 2025", status: "expired" },
];

export const ENTERPRISE_PLAN_DISCOUNTS: PlanDiscount[] = [
  { name: "Enterprise Welcome", code: "ENT-WELCOME", discountType: "Fixed Amount", value: "$100 off", plans: "Enterprise", from: "Jan 1, 2025", until: "Dec 31, 2025", used: 12, limit: 50, status: "active" },
  { name: "Annual Contract Deal", code: "ENT-ANNUAL", discountType: "Percentage Off", value: "25%", plans: "Enterprise, Enterprise Custom", from: "Jan 1, 2025", until: "Dec 31, 2025", used: 8, limit: 30, status: "active" },
  { name: "Black Friday 2024", code: "BF-ENT24", discountType: "Percentage Off", value: "30%", plans: "Enterprise", from: "Nov 28, 2024", until: "Nov 30, 2024", used: 80, limit: 100, status: "expired" },
];

export const ENTERPRISE_USER_DISCOUNTS: UserDiscount[] = [
  { name: "Growth Incentive – DataSync", code: "GROW-DS", discountType: "Percentage Off", value: "15%", plan: "Enterprise Custom", targetUser: "DataSync Ltd", targetEmail: "billing@datasync.io", from: "Jul 1, 2025", until: "Sep 30, 2025", status: "active" },
  { name: "Renewal Deal – Nexus", code: "RENEW-NT", discountType: "Fixed Amount", value: "$200 off", plan: "Enterprise", targetUser: "Nexus Technologies", targetEmail: "accounts@nexus.tech", from: "Jul 3, 2025", until: "Aug 3, 2025", status: "active" },
  { name: "Downgrade Credit – PrimeReach", code: "DG-PR", discountType: "Bonus Credits", value: "+1000 credits", plan: "Enterprise", targetUser: "PrimeReach Agency", targetEmail: "finance@primereach.co", from: "Jun 20, 2025", until: "Jul 20, 2025", status: "expired" },
];

// Legacy exports kept for any other consumers
export const OFFERS = [
  ...INDIVIDUAL_PLAN_DISCOUNTS.map((o) => ({ ...o, accountType: "Individual", type: o.discountType, plans: o.plans, used: o.used, limit: o.limit })),
  ...ENTERPRISE_PLAN_DISCOUNTS.map((o) => ({ ...o, accountType: "Enterprise", type: o.discountType, plans: o.plans, used: o.used, limit: o.limit })),
];
export const INDIVIDUAL_OFFERS = INDIVIDUAL_PLAN_DISCOUNTS;
export const ENTERPRISE_OFFERS = ENTERPRISE_PLAN_DISCOUNTS;
export const REDEMPTION_HISTORY: never[] = [];
export const INDIVIDUAL_REDEMPTIONS: never[] = [];
export const ENTERPRISE_REDEMPTIONS: never[] = [];
