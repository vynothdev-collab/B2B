export interface Enterprise {
  id: number;
  name: string;
  initials: string;
  admin: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  plan: string;
  users: number;
  credits: number;
  created: string;
  website: string;
  country: string;
  size: string;
  planStart: string;
  planExpiry: string;
  monthlyLimit: number;
  searchesThisMonth: number;
  revealsThisMonth: number;
  notes: string;
}

export interface EnterpriseUser {
  name: string;
  email: string;
  company: string;
  status: string;
  added: string;
  lastLogin: string;
  searches: number;
  reveals: number;
  initials: string;
}

export interface EnterpriseInvitation {
  email: string;
  role: string;
  company: string;
  invitedBy: string;
  sent: string;
  expiry: string;
  status: string;
}

export const ENTERPRISES: Enterprise[] = [
  { id: 1, name: "Acme Corp", initials: "AC", admin: "Robert Acme", email: "r.acme@acmecorp.com", phone: "+1 415 200 3400", industry: "Manufacturing", status: "active", plan: "Business", users: 12, credits: 8420, created: "Jan 5, 2025", website: "acmecorp.com", country: "United States", size: "200–500", planStart: "Jan 5, 2025", planExpiry: "Jan 5, 2026", monthlyLimit: 20000, searchesThisMonth: 4210, revealsThisMonth: 620, notes: "Key manufacturing account. Renewal due Jan 2026." },
  { id: 2, name: "Nexus Technologies", initials: "NT", admin: "Laura Chen", email: "laura@nexustech.io", phone: "+65 6234 5678", industry: "SaaS", status: "active", plan: "Enterprise", users: 28, credits: 45300, created: "Feb 14, 2025", website: "nexustech.io", country: "Singapore", size: "51–200", planStart: "Feb 14, 2025", planExpiry: "Feb 14, 2026", monthlyLimit: 100000, searchesThisMonth: 18420, revealsThisMonth: 2810, notes: "Fast-growing SaaS team. Likely to expand to 50 seats." },
  { id: 3, name: "DataSync Ltd", initials: "DS", admin: "Mark Ellis", email: "m.ellis@datasync.co.uk", phone: "+44 20 7946 0958", industry: "Data & Analytics", status: "active", plan: "Business", users: 7, credits: 3120, created: "Mar 3, 2025", website: "datasync.co.uk", country: "United Kingdom", size: "11–50", planStart: "Mar 3, 2025", planExpiry: "Mar 3, 2026", monthlyLimit: 20000, searchesThisMonth: 17800, revealsThisMonth: 1240, notes: "Heavy usage — approaching credit limit. Consider upgrade." },
  { id: 4, name: "PrimeReach Agency", initials: "PR", admin: "Sophie Martin", email: "sophie@primereach.fr", phone: "+33 1 42 00 90 00", industry: "Marketing", status: "suspended", plan: "Pro", users: 4, credits: 0, created: "Nov 20, 2024", website: "primereach.fr", country: "France", size: "1–10", planStart: "Nov 20, 2024", planExpiry: "Suspended", monthlyLimit: 5000, searchesThisMonth: 0, revealsThisMonth: 0, notes: "Account suspended due to payment failure. Contact: sophie@primereach.fr" },
  { id: 5, name: "Vantage Capital", initials: "VC", admin: "James Okafor", email: "james@vantagecap.ng", phone: "+234 1 460 4000", industry: "Finance", status: "active", plan: "Enterprise", users: 35, credits: 61200, created: "Sep 10, 2024", website: "vantagecap.ng", country: "Nigeria", size: "51–200", planStart: "Sep 10, 2024", planExpiry: "Sep 10, 2025", monthlyLimit: 100000, searchesThisMonth: 28400, revealsThisMonth: 4120, notes: "Top revenue account. Renewal coming Sep 2025 — schedule call." },
  { id: 6, name: "BrightPath EDU", initials: "BP", admin: "Nadia Brooks", email: "nadia@brightpath.edu", phone: "+1 310 555 0199", industry: "Education", status: "inactive", plan: "Business", users: 5, credits: 980, created: "Apr 22, 2025", website: "brightpath.edu", country: "United States", size: "11–50", planStart: "Apr 22, 2025", planExpiry: "Apr 22, 2026", monthlyLimit: 20000, searchesThisMonth: 980, revealsThisMonth: 64, notes: "Low activity. May need onboarding support." },
];

export const ENT_USERS: EnterpriseUser[] = [
  { name: "Laura Chen", email: "laura@nexustech.io", company: "Nexus Technologies", status: "active", added: "Feb 14, 2025", lastLogin: "Today, 9:00 AM", searches: 142, reveals: 28, initials: "LC" },
  { name: "Robert Acme", email: "r.acme@acmecorp.com", company: "Acme Corp", status: "active", added: "Jan 5, 2025", lastLogin: "Today, 10:30 AM", searches: 88, reveals: 14, initials: "RA" },
  { name: "James Okafor", email: "james@vantagecap.ng", company: "Vantage Capital", status: "active", added: "Sep 10, 2024", lastLogin: "Yesterday", searches: 204, reveals: 61, initials: "JO" },
  { name: "Mark Ellis", email: "m.ellis@datasync.co.uk", company: "DataSync Ltd", status: "active", added: "Mar 3, 2025", lastLogin: "Jul 12, 2025", searches: 56, reveals: 9, initials: "ME" },
  { name: "Tom Richards", email: "t.richards@nexustech.io", company: "Nexus Technologies", status: "active", added: "Mar 20, 2025", lastLogin: "Today, 8:15 AM", searches: 178, reveals: 44, initials: "TR" },
  { name: "Sophie Martin", email: "sophie@primereach.fr", company: "PrimeReach Agency", status: "suspended", added: "Nov 20, 2024", lastLogin: "Jun 1, 2025", searches: 12, reveals: 2, initials: "SM" },
  { name: "Nadia Brooks", email: "nadia@brightpath.edu", company: "BrightPath EDU", status: "inactive", added: "Apr 22, 2025", lastLogin: "May 30, 2025", searches: 5, reveals: 0, initials: "NB" },
  { name: "Kevin Zhou", email: "k.zhou@vantagecap.ng", company: "Vantage Capital", status: "active", added: "Oct 4, 2024", lastLogin: "Today, 11:00 AM", searches: 196, reveals: 52, initials: "KZ" },
];

export const ENT_INVITATIONS: EnterpriseInvitation[] = [
  { email: "ceo@globalventures.com", role: "Admin", company: "Global Ventures", invitedBy: "Super Admin", sent: "Jul 13, 2025", expiry: "Jul 20, 2025", status: "pending" },
  { email: "ops@brighttech.co", role: "Member", company: "BrightTech", invitedBy: "Super Admin", sent: "Jul 10, 2025", expiry: "Jul 17, 2025", status: "pending" },
  { email: "info@retailgrow.de", role: "Admin", company: "RetailGrow GmbH", invitedBy: "Super Admin", sent: "Jul 2, 2025", expiry: "Jul 9, 2025", status: "expired" },
  { email: "accounts@innovatex.in", role: "Member", company: "InnovateX", invitedBy: "Super Admin", sent: "Jun 25, 2025", expiry: "Jul 2, 2025", status: "expired" },
];
