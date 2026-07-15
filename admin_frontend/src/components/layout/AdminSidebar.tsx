"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, CreditCard, Coins,
  Tag, Receipt, MessageSquare, Ticket, BarChart3, Settings, LogOut,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard",            href: "/dashboard",   icon: LayoutDashboard, badge: undefined },
      { label: "User Management",      href: "/users",       icon: Users,            badge: undefined },
      { label: "Enterprise Management",href: "/enterprises", icon: Building2,        badge: undefined },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Plans",               href: "/plans",    icon: CreditCard, badge: undefined },
      { label: "Credits & Usage",     href: "/credits",  icon: Coins,      badge: undefined },
      { label: "Offers & Discounts",  href: "/offers",   icon: Tag,        badge: undefined },
      { label: "Payments & Invoices", href: "/payments", icon: Receipt,    badge: undefined },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Live Chat",         href: "/live-chat", icon: MessageSquare, badge: 3 as number | undefined },
      { label: "Submitted Tickets", href: "/tickets",   icon: Ticket,        badge: 5 as number | undefined },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Activity & Reports", href: "/reports",  icon: BarChart3, badge: undefined },
      { label: "Settings",           href: "/settings", icon: Settings,  badge: undefined },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-60 shrink-0 flex-col border-r border-forest-line"
      style={{
        background: "#173229",
        backgroundImage: "radial-gradient(ellipse 420px 260px at 100% 0%, rgba(206,154,62,.10), transparent 60%)",
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-bold text-[13px]"
          style={{
            background: "linear-gradient(135deg, #CE9A3E, #A9762A)",
            boxShadow: "0 6px 16px -6px rgba(206,154,62,.55)",
            color: "#173229",
            fontFamily: "var(--font-fraunces)",
          }}
        >
          L
        </div>
        <span style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "17px", color: "#FFFDF6", letterSpacing: "-0.01em" }}>
          leads<span style={{ color: "#CE9A3E" }}>buddy</span>
          <span style={{ color: "#CE9A3E" }}>.</span>
        </span>
      </div>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-1 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p
              className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[.09em]"
              style={{ color: "#6E8478" }}
            >
              {group.label}
            </p>
            {group.items.map(({ label, href, icon: Icon, badge }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] font-medium transition-colors"
                  style={
                    isActive
                      ? { background: "rgba(206,154,62,0.16)", color: "#CE9A3E" }
                      : { color: "#A9BBAE" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "#1F3F32";
                      (e.currentTarget as HTMLElement).style.color = "#EFEAD9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "";
                      (e.currentTarget as HTMLElement).style.color = "#A9BBAE";
                    }
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[18px] w-[3px] rounded-r-sm"
                      style={{ background: "#CE9A3E" }}
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" style={{ opacity: isActive ? 1 : 0.75 }} />
                  <span className="flex-1 truncate">{label}</span>
                  {badge != null && (
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
                      style={{ background: "rgba(177,81,105,.22)", color: "#E7A9B7" }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="border-t px-3.5 py-4 space-y-2" style={{ borderColor: "#2C5344" }}>
        {/* Pulse status */}
        <div className="rounded-[9px] border p-2.5" style={{ background: "#1F3F32", borderColor: "#2C5344" }}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#CE9A3E", boxShadow: "0 0 0 3px rgba(206,154,62,.25)" }}
            />
            <span className="text-[11px]" style={{ color: "#A9BBAE" }}>All systems operational</span>
          </div>
          <div className="flex items-end gap-0.5 h-4">
            {[35, 55, 40, 70, 50, 85, 60, 75, 45, 65, 90, 58].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: "linear-gradient(180deg, #CE9A3E, rgba(206,154,62,.15))" }}
              />
            ))}
          </div>
        </div>

        {/* Role chip */}
        <div className="flex items-center gap-2.5 rounded-[9px] p-2" style={{ background: "#1F3F32" }}>
          <div
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #BC5A34, #8F4426)", color: "#FFF7EC", fontFamily: "var(--font-fraunces)" }}
          >
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[12.5px] font-semibold" style={{ color: "#FFFDF6" }}>Super Admin</p>
            <p className="truncate text-[10.5px]" style={{ color: "#6E8478", fontFamily: "var(--font-mono)" }}>SUPER_ADMIN</p>
          </div>
          <button
            type="button"
            title="Logout"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
            style={{ color: "#6E8478" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#A9BBAE"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6E8478"; }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
