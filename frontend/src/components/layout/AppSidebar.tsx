"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, List, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileSidebar } from "@/contexts/MobileSidebarContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  soon?: boolean;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Search",
    items: [
      { href: "/search/people", label: "People", icon: <Users className="h-4 w-4 shrink-0" /> },
      { href: "/search/companies", label: "Companies", icon: <Building2 className="h-4 w-4 shrink-0" /> },
      { href: "/search/lists", label: "Lists", icon: <List className="h-4 w-4 shrink-0" /> },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { mobileOpen, close } = useMobileSidebar();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.innerWidth < 1280);
  }, []);

  const showLabels = mobileOpen || !collapsed;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={close} />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "md:relative md:inset-auto md:z-auto",
          "flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-300",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-64 md:w-16" : "w-64 md:w-56",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[22px] z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        <div className="flex h-14 items-center px-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white text-[10px] font-bold">
            LB
          </div>
          {showLabels && (
            <span className="mx-2 flex-1 truncate text-sm font-bold text-gray-900">leadsbuddy.ai</span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              {showLabels && (
                <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {section.title}
                </p>
              )}
              {!showLabels && <div className="mx-2 my-1 h-px bg-gray-100" />}
              <div className="flex flex-col gap-0.5 px-2">
                {section.items.map((item) => {
                  if (item.disabled) {
                    return (
                      <span
                        key={item.label}
                        title={!showLabels ? item.label : undefined}
                        className={[
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium",
                          !showLabels ? "justify-center" : "",
                          "cursor-default text-gray-600",
                        ].join(" ")}
                      >
                        <span className="text-gray-400">{item.icon}</span>
                        {showLabels && <span className="flex-1 truncate">{item.label}</span>}
                        {showLabels && item.soon && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600">
                            Soon
                          </span>
                        )}
                      </span>
                    );
                  }
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      title={!showLabels ? item.label : undefined}
                      className={[
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        !showLabels ? "justify-center" : "",
                        active
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")}
                    >
                      <span className={active ? "text-purple-600" : "text-gray-400"}>
                        {item.icon}
                      </span>
                      {showLabels && <span className="flex-1 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-3 py-3">
          <div className={["flex items-center gap-2.5", !showLabels ? "justify-center" : ""].join(" ")}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "??"}
            </div>
            {showLabels && (
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
    </>
  );
}
