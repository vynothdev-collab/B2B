"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

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

export default function AdminHeader() {
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname] ?? "Admin Portal";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white select-none">
          SA
        </div>
      </div>
    </header>
  );
}
