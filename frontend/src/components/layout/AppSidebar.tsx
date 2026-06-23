"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { href: "/search/people", label: "People", icon: <Users className="h-5 w-5 shrink-0" /> },
  { href: "/search/companies", label: "Companies", icon: <Building2 className="h-5 w-5 shrink-0" /> },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Toggle button — sits on the vertical border line, centered in header height */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-[22px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-100 px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-bold">
          LB
        </div>
        {!collapsed && (
          <span className="mx-2 flex-1 truncate text-sm font-bold text-gray-900">leadsbuddy.ai</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={active ? "text-purple-600" : "text-gray-400"}>{item.icon}</span>
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "??"}
          </div>
          {!collapsed && (
            <>
              <div className="flex flex-1 flex-col leading-tight overflow-hidden">
                <span className="truncate text-xs font-semibold text-gray-800">{user?.name ?? "—"}</span>
                <span className="truncate text-[10px] text-gray-400 capitalize">{user?.role ?? "User"}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
