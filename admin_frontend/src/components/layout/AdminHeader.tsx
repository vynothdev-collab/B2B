"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users":     "User Management",
  "/enterprises": "Enterprise Management",
  "/plans":     "Plans",
  "/credits":   "Credits & Usage",
  "/offers":    "Offers & Discounts",
  "/payments":  "Payments & Invoices",
  "/live-chat": "Live Chat",
  "/tickets":   "Submitted Tickets",
  "/reports":   "Activity & Reports",
  "/settings":  "Settings",
};

const ROUTE_SUBTITLES: Record<string, string> = {
  "/dashboard":   "Platform overview and key metrics",
  "/users":       "Manage individual user accounts",
  "/enterprises": "Manage company accounts and teams",
  "/plans":       "Subscription plans and pricing",
  "/credits":     "Credit allocation and usage tracking",
  "/offers":      "Discount codes and promotions",
  "/payments":    "Transactions, invoices, and refunds",
  "/live-chat":   "Real-time customer conversations",
  "/tickets":     "Support ticket queue",
  "/reports":     "Activity logs and analytics",
  "/settings":    "Platform configuration",
};

export default function AdminHeader() {
  const pathname  = usePathname();
  const title     = ROUTE_TITLES[pathname] ?? "Admin Portal";
  const subtitle  = ROUTE_SUBTITLES[pathname];

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-6 gap-4 bg-card"
      style={{ borderColor: "var(--line)" }}
    >
      {/* Page title */}
      <div className="flex flex-col justify-center min-w-0">
        <h1
          className="text-[15px] font-semibold leading-tight"
          style={{ fontFamily: "var(--font-fraunces)", color: "var(--ink)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs leading-tight mt-0.5 hidden sm:block" style={{ color: "var(--ink-faint)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--ink-faint)" }}
          />
          <input
            placeholder="Search…"
            className="h-9 w-full rounded-[10px] border pl-8 pr-10 text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              background: "var(--paper)",
              borderColor: "var(--line)",
              color: "var(--ink)",
              "--tw-ring-color": "rgba(206,154,62,.25)",
            } as React.CSSProperties}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
          />
          <kbd
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] hidden sm:flex items-center px-1.5 py-0.5 rounded border"
            style={{ background: "var(--line-soft)", borderColor: "var(--line)", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors"
          style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-dim)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-faint)"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.color = "var(--ink-dim)"; }}
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-[7px] right-[7px] h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--rust)", boxShadow: "0 0 0 2px var(--card)" }}
          />
        </button>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-[10px] text-xs font-bold select-none cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--sage), #3E6A44)",
            color: "#F4FBF1",
            fontFamily: "var(--font-fraunces)",
          }}
        >
          SA
        </div>
      </div>
    </header>
  );
}
