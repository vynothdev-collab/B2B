"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Coins,
  Tag,
  Receipt,
  MessageSquare,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "User Management", href: "/users", icon: Users },
  { label: "Enterprise Management", href: "/enterprises", icon: Building2 },
  { label: "Plans", href: "/plans", icon: CreditCard },
  { label: "Credits & Usage", href: "/credits", icon: Coins },
  { label: "Offers & Discounts", href: "/offers", icon: Tag },
  { label: "Payments & Invoices", href: "/payments", icon: Receipt },
  { label: "Live Chat", href: "/live-chat", icon: MessageSquare, badge: 3 },
  { label: "Submitted Tickets", href: "/tickets", icon: Ticket, badge: 5 },
  { label: "Activity & Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[#0f172a] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white leading-tight tracking-tight">leadsbuddy.ai</span>
          <span className="mt-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Admin Console</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100 font-normal"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="flex-1 truncate">{label}</span>
              {badge != null && (
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-white/8 text-slate-400"
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">Super Admin</p>
            <p className="truncate text-xs text-slate-500">admin@leadsbuddy.ai</p>
          </div>
          <button
            type="button"
            title="Logout"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
