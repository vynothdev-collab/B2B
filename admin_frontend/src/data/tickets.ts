export interface Ticket {
  id: string;
  subject: string;
  by: string;
  type: string;
  company: string;
  category: string;
  priority: string;
  status: string;
  assigned: string;
  submitted: string;
  updated: string;
  description: string;
  replies: { from: string; role: string; message: string; time: string }[];
}

export const TICKETS: Ticket[] = [
  { id: "#1042", subject: "Unable to login after password reset", by: "John Carter", type: "Individual", company: "—", category: "Account", priority: "urgent", status: "open", assigned: "Super Admin", submitted: "Jul 13, 2025", updated: "5 min ago", description: "I reset my password using the forgot password link but now I cannot login. The system says my credentials are invalid even though I'm using the new password I just set.", replies: [{ from: "John Carter", role: "user", message: "I reset my password but still can't login. Very urgent!", time: "Jul 13, 2025 9:02 AM" }, { from: "Super Admin", role: "admin", message: "Hi John, I can see your account. There may be a cache issue. Please try clearing your browser cookies and try again.", time: "Jul 13, 2025 9:15 AM" }] },
  { id: "#1041", subject: "Invoice amount incorrect after offer code", by: "DataSync Ltd", type: "Enterprise", company: "DataSync Ltd", category: "Billing", priority: "pending", status: "in_progress", assigned: "Super Admin", submitted: "Jul 12, 2025", updated: "2 hr ago", description: "We applied the SUMMER20 offer code at checkout but the invoice shows the full price of $149 instead of $119.20. Please correct this and issue the proper invoice.", replies: [{ from: "Mark Ellis", role: "user", message: "The discount wasn't applied on the invoice we received. Please fix this.", time: "Jul 12, 2025 2:00 PM" }, { from: "Super Admin", role: "admin", message: "I can see the issue. The offer was applied but the invoice PDF wasn't regenerated. I'll fix this now.", time: "Jul 12, 2025 3:00 PM" }] },
  { id: "#1040", subject: "Search results returning empty for all filters", by: "Priya Patel", type: "Individual", company: "—", category: "Technical", priority: "urgent", status: "open", assigned: "Unassigned", submitted: "Jul 12, 2025", updated: "4 hr ago", description: "All my people searches are returning zero results regardless of what filters I use. This started happening this morning. My account has plenty of credits left.", replies: [{ from: "Priya Patel", role: "user", message: "None of my searches are working. Zero results for everything, even broad searches.", time: "Jul 12, 2025 11:00 AM" }] },
  { id: "#1039", subject: "Request to increase monthly credit limit", by: "Vantage Capital", type: "Enterprise", company: "Vantage Capital", category: "Plans & Credits", priority: "pending", status: "open", assigned: "Super Admin", submitted: "Jul 11, 2025", updated: "Yesterday", description: "Our team is consistently hitting our monthly credit limit before the end of each month. We'd like to either upgrade our plan or purchase additional credits. Please advise on options.", replies: [{ from: "James Okafor", role: "user", message: "We need more credits. We're hitting the limit every month and it's blocking our team.", time: "Jul 11, 2025 10:30 AM" }] },
  { id: "#1038", subject: "Team member invitation email not received", by: "Laura Chen", type: "Enterprise", company: "Nexus Technologies", category: "Account", priority: "pending", status: "in_progress", assigned: "Super Admin", submitted: "Jul 11, 2025", updated: "Yesterday", description: "I sent an invitation to three new team members yesterday but none of them received the email. I've checked the email addresses are correct.", replies: [{ from: "Laura Chen", role: "user", message: "Team invitations are not being received. We've checked spam folders too.", time: "Jul 11, 2025 3:00 PM" }, { from: "Super Admin", role: "admin", message: "Hi Laura, there was a brief delay in our email queue. I've manually resent the invitations. They should arrive within 5 minutes.", time: "Jul 11, 2025 3:30 PM" }] },
  { id: "#1037", subject: "Feature request: CSV export for searches", by: "Emma Laurent", type: "Individual", company: "—", category: "Feature Request", priority: "low", status: "open", assigned: "Unassigned", submitted: "Jul 10, 2025", updated: "Jul 10, 2025", description: "It would be very helpful to be able to export search results directly to CSV without having to save them to a list first. This would save a lot of time in my workflow.", replies: [{ from: "Emma Laurent", role: "user", message: "Please add direct CSV export from search results. This is very needed!", time: "Jul 10, 2025 2:00 PM" }] },
  { id: "#1036", subject: "Payment failed but account not updated", by: "Ryan Nguyen", type: "Individual", company: "—", category: "Billing", priority: "urgent", status: "open", assigned: "Super Admin", submitted: "Jul 10, 2025", updated: "Jul 10, 2025", description: "My credit card was charged $49 for the Pro plan renewal but my account still shows as expired. The payment went through on my bank statement.", replies: [{ from: "Ryan Nguyen", role: "user", message: "I was charged but my account is still expired. I can see the charge on my bank app.", time: "Jul 10, 2025 9:00 AM" }] },
  { id: "#1035", subject: "Error 500 on enterprise dashboard", by: "Acme Corp", type: "Enterprise", company: "Acme Corp", category: "Technical", priority: "urgent", status: "in_progress", assigned: "Super Admin", submitted: "Jul 9, 2025", updated: "Jul 9, 2025", description: "Multiple users in our organization are getting a 500 internal server error when trying to access the enterprise dashboard. This is blocking all our work.", replies: [{ from: "Robert Acme", role: "user", message: "Our whole team is getting a 500 error on the dashboard. This is critical.", time: "Jul 9, 2025 10:00 AM" }, { from: "Super Admin", role: "admin", message: "I've escalated this to our engineering team. We've identified the issue and are working on a fix.", time: "Jul 9, 2025 10:30 AM" }] },
  { id: "#1034", subject: "Pro plan renewal not reflecting new features", by: "Marcus Webb", type: "Individual", company: "—", category: "Plans & Credits", priority: "pending", status: "resolved", assigned: "Super Admin", submitted: "Jul 8, 2025", updated: "Jul 8, 2025", description: "I renewed my Pro plan but the advanced filters are still not available to me.", replies: [{ from: "Marcus Webb", role: "user", message: "My Pro renewal doesn't show the advanced filters.", time: "Jul 8, 2025 1:00 PM" }, { from: "Super Admin", role: "admin", message: "Hi Marcus, I've refreshed your account permissions. Please log out and back in — the features should now be available.", time: "Jul 8, 2025 1:30 PM" }, { from: "Marcus Webb", role: "user", message: "That worked! Thank you.", time: "Jul 8, 2025 1:45 PM" }] },
  { id: "#1033", subject: "Cannot download usage report", by: "BrightPath EDU", type: "Enterprise", company: "BrightPath EDU", category: "Technical", priority: "low", status: "resolved", assigned: "Super Admin", submitted: "Jul 7, 2025", updated: "Jul 7, 2025", description: "The download button for the monthly usage report doesn't do anything. I've tried in Chrome and Safari.", replies: [{ from: "Nadia Brooks", role: "user", message: "The usage report download button isn't working.", time: "Jul 7, 2025 11:00 AM" }, { from: "Super Admin", role: "admin", message: "Fixed! There was a browser compatibility issue. The report should now download correctly.", time: "Jul 7, 2025 2:00 PM" }] },
];

export const MY_TICKETS = TICKETS.filter((t) => t.assigned === "Super Admin" && t.status !== "resolved").slice(0, 4);

export const CATEGORIES = [
  { name: "Billing", description: "Payment, invoices, refunds, and subscription issues", open: 3 },
  { name: "Account", description: "Login, profile, password, and access problems", open: 2 },
  { name: "Technical", description: "Bugs, errors, and platform performance issues", open: 4 },
  { name: "Plans & Credits", description: "Plan upgrades, downgrades, and credit adjustments", open: 2 },
  { name: "Feature Request", description: "Suggestions and new feature requests from users", open: 2 },
  { name: "Other", description: "General inquiries and miscellaneous support", open: 1 },
];

export const REPORT_CARDS = [
  { label: "Submitted This Month", value: "89", color: "text-slate-900" },
  { label: "Resolved This Month", value: "71", color: "text-emerald-700" },
  { label: "Avg First Response", value: "2.4h", color: "text-blue-700" },
  { label: "Avg Resolution Time", value: "18h", color: "text-slate-900" },
  { label: "Currently Open", value: "14", color: "text-amber-700" },
  { label: "Urgent & Unresolved", value: "3", color: "text-red-700", highlight: true },
];

export const CATEGORY_STATS = [
  { name: "Technical", count: 31, color: "bg-red-500" },
  { name: "Billing", count: 24, color: "bg-amber-500" },
  { name: "Account", count: 14, color: "bg-blue-500" },
  { name: "Plans & Credits", count: 10, color: "bg-violet-500" },
  { name: "Feature Request", count: 7, color: "bg-emerald-500" },
  { name: "Other", count: 3, color: "bg-slate-400" },
];
