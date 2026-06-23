"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { href: "/search/people", label: "People", icon: <Users className="h-5 w-5" /> },
  { href: "/search/companies", label: "Companies", icon: <Building2 className="h-5 w-5" /> },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white text-xs font-bold">
          LB
        </div>
        <span className="text-base font-bold text-gray-900">leadsbuddy.ai</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Search
        </p>
        <div className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={active ? "text-purple-600" : "text-gray-400"}>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "??"}
          </div>
          <div className="flex flex-1 flex-col leading-tight overflow-hidden">
            <span className="truncate text-sm font-semibold text-gray-800">{user?.name ?? "—"}</span>
            <span className="truncate text-[11px] text-gray-400 capitalize">{user?.role ?? "User"}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
