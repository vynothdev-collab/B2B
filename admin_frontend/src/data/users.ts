export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  plan: string;
  credits: number;
  joined: string;
  lastLogin: string;
  initials: string;
  totalSearches: number;
  totalReveals: number;
  searchesThisMonth: number;
  revealsThisMonth: number;
  planStart: string;
  planExpiry: string;
  lists: { name: string; type: string; count: number }[];
}

export interface Invitation {
  email: string;
  invitedBy: string;
  dateSent: string;
  expiry: string;
  status: string;
}

export const USERS: User[] = [
  { id: 1, name: "John Carter", email: "john.carter@example.com", status: "active", plan: "Pro", credits: 248, joined: "Jan 12, 2025", lastLogin: "Today, 9:14 AM", initials: "JC", totalSearches: 1240, totalReveals: 188, searchesThisMonth: 248, revealsThisMonth: 31, planStart: "Jan 12, 2025", planExpiry: "Aug 12, 2025", lists: [{ name: "All saved people", type: "People", count: 142 }, { name: "Hot leads Q3", type: "People", count: 38 }] },
  { id: 2, name: "Sarah Kim", email: "sarah.kim@startup.io", status: "active", plan: "Business", credits: 1420, joined: "Feb 3, 2025", lastLogin: "Yesterday, 3:02 PM", initials: "SK", totalSearches: 3800, totalReveals: 620, searchesThisMonth: 580, revealsThisMonth: 94, planStart: "Feb 3, 2025", planExpiry: "Aug 3, 2025", lists: [{ name: "All saved people", type: "People", count: 420 }, { name: "Prospect pipeline", type: "People", count: 215 }] },
  { id: 3, name: "Marcus Webb", email: "marcus.webb@mail.com", status: "inactive", plan: "Free", credits: 14, joined: "Mar 20, 2025", lastLogin: "Apr 10, 2025", initials: "MW", totalSearches: 48, totalReveals: 4, searchesThisMonth: 14, revealsThisMonth: 0, planStart: "Mar 20, 2025", planExpiry: "—", lists: [{ name: "All saved people", type: "People", count: 8 }] },
  { id: 4, name: "Priya Patel", email: "priya.patel@techco.in", status: "active", plan: "Pro", credits: 380, joined: "Nov 8, 2024", lastLogin: "Today, 11:30 AM", initials: "PP", totalSearches: 2140, totalReveals: 310, searchesThisMonth: 380, revealsThisMonth: 48, planStart: "Jun 8, 2025", planExpiry: "Jul 8, 2025", lists: [{ name: "All saved people", type: "People", count: 280 }, { name: "Tech leads", type: "People", count: 96 }] },
  { id: 5, name: "David Osei", email: "d.osei@innovate.gh", status: "suspended", plan: "Free", credits: 0, joined: "Oct 1, 2024", lastLogin: "Dec 22, 2024", initials: "DO", totalSearches: 12, totalReveals: 0, searchesThisMonth: 0, revealsThisMonth: 0, planStart: "Oct 1, 2024", planExpiry: "—", lists: [{ name: "All saved people", type: "People", count: 2 }] },
  { id: 6, name: "Emma Laurent", email: "emma.laurent@agence.fr", status: "active", plan: "Business", credits: 897, joined: "Apr 4, 2025", lastLogin: "Today, 8:55 AM", initials: "EL", totalSearches: 1920, totalReveals: 284, searchesThisMonth: 897, revealsThisMonth: 112, planStart: "Apr 4, 2025", planExpiry: "Aug 4, 2025", lists: [{ name: "All saved people", type: "People", count: 360 }, { name: "French market", type: "Companies", count: 88 }] },
  { id: 7, name: "Ryan Nguyen", email: "ryan.n@devshop.io", status: "inactive", plan: "Pro", credits: 92, joined: "Dec 15, 2024", lastLogin: "Jun 2, 2025", initials: "RN", totalSearches: 680, totalReveals: 72, searchesThisMonth: 92, revealsThisMonth: 8, planStart: "Dec 15, 2024", planExpiry: "Expired", lists: [{ name: "All saved people", type: "People", count: 54 }] },
  { id: 8, name: "Amara Diallo", email: "amara@datasuite.co", status: "active", plan: "Free", credits: 31, joined: "May 19, 2025", lastLogin: "Today, 7:40 AM", initials: "AD", totalSearches: 62, totalReveals: 6, searchesThisMonth: 31, revealsThisMonth: 3, planStart: "May 19, 2025", planExpiry: "—", lists: [{ name: "All saved people", type: "People", count: 14 }] },
];

export const INVITATIONS: Invitation[] = [
  { email: "new.admin@leadsbuddy.ai", invitedBy: "Super Admin", dateSent: "Jul 10, 2025", expiry: "Jul 17, 2025", status: "pending" },
  { email: "james.okafor@bigcorp.com", invitedBy: "Super Admin", dateSent: "Jul 8, 2025", expiry: "Jul 15, 2025", status: "pending" },
  { email: "lucy.tan@fintech.sg", invitedBy: "Super Admin", dateSent: "Jul 1, 2025", expiry: "Jul 8, 2025", status: "expired" },
  { email: "pedro.silva@sales.br", invitedBy: "Super Admin", dateSent: "Jun 28, 2025", expiry: "Jul 5, 2025", status: "active" },
  { email: "nina.berg@agency.no", invitedBy: "Super Admin", dateSent: "Jun 20, 2025", expiry: "Jun 27, 2025", status: "expired" },
];
