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
  { href: "/search/people", label: "People", icon: <Users className="h-4 w-4" /> },
  { href: "/search/companies", label: "Companies", icon: <Building2 className="h-4 w-4" /> },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center border-r border-gray-200 bg-white py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xs">
        B2B
      </div>

      <nav className="mt-6 flex flex-1 flex-col items-center gap-2">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {item.icon}
              <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2">
        <div
          title={user?.name ?? ""}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-[11px] font-bold text-white"
        >
          {user?.name ? user.name.slice(0, 2).toUpperCase() : "??"}
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
