"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "User Management",
  "/enterprises": "Enterprise Management",
  "/plans": "Plans",
  "/credits": "Credits & Usage",
  "/offers": "Offers & Discounts",
  "/payments": "Payments & Invoices",
  "/live-chat": "Live Chat",
  "/tickets": "Submitted Tickets",
  "/reports": "Activity & Reports",
  "/settings": "Settings",
};

const ROUTE_SUBTITLES: Record<string, string> = {
  "/dashboard": "Platform overview and key metrics",
  "/users": "Manage individual user accounts",
  "/enterprises": "Manage company accounts and teams",
  "/plans": "Subscription plans and pricing",
  "/credits": "Credit allocation and usage tracking",
  "/offers": "Discount codes and promotions",
  "/payments": "Transactions, invoices, and refunds",
  "/live-chat": "Real-time customer conversations",
  "/tickets": "Support ticket queue",
  "/reports": "Activity logs and analytics",
  "/settings": "Platform configuration",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname] ?? "Admin Portal";
  const subtitle = ROUTE_SUBTITLES[pathname];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 gap-4">
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 leading-tight mt-0.5 hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-xs ml-auto">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search..."
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white select-none cursor-pointer">
          SA
        </div>
      </div>
    </header>
  );
}
