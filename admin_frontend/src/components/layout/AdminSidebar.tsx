"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, CreditCard, Coins,
  Tag, Receipt, MessageSquare, Ticket, BarChart3, Settings, LogOut, Activity,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard",             href: "/dashboard",   icon: LayoutDashboard, badge: undefined },
      { label: "User Management",       href: "/users",       icon: Users,            badge: undefined },
      { label: "Enterprise Management", href: "/enterprises", icon: Building2,        badge: undefined },
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
      className="flex h-screen w-60 shrink-0 flex-col"
      style={{
        background: "#173229",
        backgroundImage: "radial-gradient(ellipse 420px 260px at 100% 0%, rgba(206,154,62,.10), transparent 60%)",
        borderRight: "1px solid #243D31",
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-[18px]">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-bold"
          style={{
            background: "linear-gradient(135deg, #CE9A3E, #A9762A)",
            boxShadow: "0 6px 16px -6px rgba(206,154,62,.55)",
            color: "#173229",
            fontFamily: "var(--font-fraunces)",
          }}
        >
          L
        </div>
        <span
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 600,
            fontSize: "17px",
            color: "#FFFDF6",
            letterSpacing: "-0.01em",
          }}
        >
          leads<span style={{ color: "#CE9A3E" }}>buddy</span>
          <span style={{ color: "#CE9A3E" }}>.</span>
        </span>
      </div>

      {/* Divider under brand */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, #2C5344 0%, rgba(44,83,68,0) 100%)", margin: "0 16px" }} />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "pt-3" : ""}>
            {/* Section divider for groups after the first */}
            {gi > 0 && (
              <div style={{ height: "1px", background: "#1F3B2C", marginBottom: "10px" }} />
            )}
            <p
              className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[.12em]"
              style={{ color: "#4E7060" }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center gap-2.5 rounded-[8px] px-2.5 py-[9px] text-[13px] font-medium transition-all duration-150"
                    style={
                      isActive
                        ? { background: "rgba(206,154,62,0.13)", color: "#CE9A3E" }
                        : { color: "#8DADA0" }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.color = "#EFEAD9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "";
                        (e.currentTarget as HTMLElement).style.color = "#8DADA0";
                      }
                    }}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                        style={{ width: "3px", height: "20px", background: "#CE9A3E", boxShadow: "2px 0 8px rgba(206,154,62,.35)" }}
                      />
                    )}

                    {/* Icon wrapper */}
                    <span
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px]"
                      style={isActive
                        ? { background: "rgba(206,154,62,0.15)" }
                        : { background: "transparent" }
                      }
                    >
                      <Icon className="h-[15px] w-[15px]" style={{ opacity: isActive ? 1 : 0.7 }} />
                    </span>

                    <span className="flex-1 truncate">{label}</span>

                    {badge != null && (
                      <span
                        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums"
                        style={{ background: "rgba(177,81,105,.20)", color: "#E7A9B7" }}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-3 pb-4 pt-3 space-y-2" style={{ borderTop: "1px solid #1F3B2C" }}>

        {/* System status pill */}
        <div
          className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5"
          style={{ background: "#1A3429", border: "1px solid #243D31" }}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: "#CE9A3E" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#CE9A3E" }} />
          </span>
          <span className="flex-1 text-[11px] font-medium" style={{ color: "#6E8878" }}>All systems operational</span>
          <Activity className="h-3.5 w-3.5 shrink-0" style={{ color: "#4E7060" }} />
        </div>

        {/* Admin role chip */}
        <div
          className="flex items-center gap-2.5 rounded-[8px] p-2"
          style={{ background: "#1A3429", border: "1px solid #243D31" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #BC5A34, #8F4426)",
              color: "#FFF7EC",
              fontFamily: "var(--font-fraunces)",
            }}
          >
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[12.5px] font-semibold leading-tight" style={{ color: "#FFFDF6" }}>Super Admin</p>
            <p className="truncate text-[10px] leading-tight mt-0.5" style={{ color: "#4E7060", fontFamily: "var(--font-mono)" }}>
              SUPER_ADMIN
            </p>
          </div>
          <button
            type="button"
            title="Logout"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] transition-colors"
            style={{ color: "#4E7060" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(177,81,105,.15)";
              (e.currentTarget as HTMLElement).style.color = "#E7A9B7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color = "#4E7060";
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
