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
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-tight">leadsbuddy.ai</span>
          <span className="mt-0.5 w-fit rounded-md bg-blue-500/20 border border-blue-400/30 px-1.5 py-px text-[9px] font-semibold text-blue-300 uppercase tracking-widest">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="flex-1 truncate">{label}</span>
              {badge != null && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">Super Admin</p>
            <p className="truncate text-xs text-slate-500">admin@leadsbuddy.ai</p>
          </div>
          <button
            type="button"
            title="Logout"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
