"use client";
import { useEffect, useRef, useState } from "react";
import {
  Building2, ExternalLink, Globe, ListPlus, MoreHorizontal, Settings, Users,
} from "lucide-react";
import type { CompanyResult } from "@/types/search";
import { COMPANY_COLUMNS } from "@/hooks/useColumnSettings";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
  "bg-teal-500", "bg-cyan-500",
];

function avatarColor(name = ""): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const FLAG: Record<string, string> = {
  "united states": "🇺🇸", "united kingdom": "🇬🇧", canada: "🇨🇦",
  france: "🇫🇷", germany: "🇩🇪", india: "🇮🇳", portugal: "🇵🇹",
  ireland: "🇮🇪", australia: "🇦🇺", singapore: "🇸🇬", brazil: "🇧🇷",
  netherlands: "🇳🇱", spain: "🇪🇸", italy: "🇮🇹", sweden: "🇸🇪",
};
const flag = (c = "") => FLAG[c.toLowerCase()] ?? "🌍";

const SIZE_LABEL: Record<string, string> = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1K", "1001-5000": "1–5K",
  "5001-10000": "5–10K", "10001+": "10K+",
};

const TYPE_COLORS: Record<string, string> = {
  "privately held": "bg-blue-50 text-blue-600",
  "public": "bg-green-50 text-green-600",
  "nonprofit": "bg-amber-50 text-amber-600",
  "educational": "bg-red-50 text-red-600",
  "government": "bg-gray-100 text-gray-600",
  "self employed": "bg-orange-50 text-orange-600",
};

const STATUS_COLORS: Record<string, string> = {
  "active": "bg-emerald-50 text-emerald-600",
  "acquired": "bg-blue-50 text-blue-600",
  "closed": "bg-red-50 text-red-500",
  "ipo": "bg-violet-50 text-violet-600",
};

function toStringArr(v: string | string[] | undefined | null): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function Dash() {
  return <span className="text-xs text-gray-400">—</span>;
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${Math.round(n / 1_000)}K`;
}

function ActionMenu({ onAddToList }: { onAddToList: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

  const menuItems = [
    { icon: <Building2 className="h-3.5 w-3.5" />, label: "View company", action: () => {} },
    { icon: <ExternalLink className="h-3.5 w-3.5" />, label: "Push to CRM", action: () => {} },
    { icon: <ListPlus className="h-3.5 w-3.5" />, label: "Add to list", action: onAddToList },
  ];

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            style={{ top: pos.top, right: pos.right }}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => { setOpen(false); item.action(); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function CompanyTableSkeleton({
  rows = 8,
  visibleColumns,
}: {
  rows?: number;
  visibleColumns?: Record<string, boolean>;
}) {
  const isCol = (key: string) => {
    if (visibleColumns) return visibleColumns[key] !== false;
    return COMPANY_COLUMNS.find((c) => c.key === key)?.defaultVisible !== false;
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[580px] text-xs [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-2.5">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-8" />
            <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[200px]">Company ↓</th>
            {isCol("industry") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[120px]">Industry</th>}
            {isCol("employees") && <th className="text-left text-[11px] font-semibold text-gray-500">Employees</th>}
            {isCol("website") && <th className="text-left text-[11px] font-semibold text-gray-500">Website</th>}
            {isCol("location") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[120px]">Location</th>}
            {isCol("type") && <th className="text-left text-[11px] font-semibold text-gray-500">Type</th>}
            {isCol("co_status") && <th className="text-left text-[11px] font-semibold text-gray-500">Status</th>}
            {isCol("founded") && <th className="text-left text-[11px] font-semibold text-gray-500">Founded</th>}
            {isCol("legal_name") && <th className="text-left text-[11px] font-semibold text-gray-500">Legal Name</th>}
            {isCol("co_country") && <th className="text-left text-[11px] font-semibold text-gray-500">Country</th>}
            {isCol("co_city") && <th className="text-left text-[11px] font-semibold text-gray-500">City</th>}
            {isCol("state") && <th className="text-left text-[11px] font-semibold text-gray-500">State</th>}
            {isCol("co_address") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Address</th>}
            {isCol("co_keywords") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Keywords</th>}
            {isCol("products_services") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Products & Services</th>}
            {isCol("awards_certs") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Awards & Certs</th>}
            {isCol("growth") && <th className="text-left text-[11px] font-semibold text-gray-500">HC Growth</th>}
            {isCol("web_traffic") && <th className="text-left text-[11px] font-semibold text-gray-500">Web Traffic</th>}
            {isCol("traffic_growth") && <th className="text-left text-[11px] font-semibold text-gray-500">Traffic Growth</th>}
            {isCol("revenue") && <th className="text-left text-[11px] font-semibold text-gray-500">Revenue</th>}
            {isCol("funding") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[120px]">Last Funding</th>}
            {isCol("rating") && <th className="text-left text-[11px] font-semibold text-gray-500">Rating</th>}
            {isCol("open_jobs") && <th className="text-left text-[11px] font-semibold text-gray-500">Open Jobs</th>}
            {isCol("technologies") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Technologies</th>}
            {isCol("linkedin") && <th className="text-left text-[11px] font-semibold text-gray-500">LinkedIn</th>}
            <th className="text-left text-[11px] font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse border-b border-gray-50">
              <td><div className="mx-auto h-3.5 w-3.5 rounded bg-gray-200" /></td>
              <td>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 shrink-0 rounded bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-gray-200" />
                    <div className="h-2.5 w-14 rounded bg-gray-100" />
                  </div>
                </div>
              </td>
              {isCol("industry") && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("employees") && <td><div className="h-5 w-16 rounded-full bg-gray-200" /></td>}
              {isCol("website") && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("location") && <td><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("type") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_status") && <td><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("founded") && <td><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("legal_name") && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("co_country") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_city") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("state") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_address") && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("co_keywords") && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("products_services") && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("awards_certs") && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("growth") && <td><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("web_traffic") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("traffic_growth") && <td><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("revenue") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("funding") && <td><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("rating") && <td><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("open_jobs") && <td><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("technologies") && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("linkedin") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              <td><div className="mx-auto h-6 w-6 rounded bg-gray-200" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

interface Props {
  data: CompanyResult[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onAddToList: (company: CompanyResult) => void;
  visibleColumns: Record<string, boolean>;
  onOpenColumnSettings: () => void;
}

export default function CompanyTable({
  data,
  selected,
  onSelect,
  onSelectAll,
  onAddToList,
  visibleColumns,
  onOpenColumnSettings,
}: Props) {
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const isCol = (key: string) => visibleColumns[key] !== false;

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[580px] text-xs sm:text-sm [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:py-2 [&_th]:text-[11px] sm:[&_td]:px-3 sm:[&_td]:py-3 sm:[&_th]:px-3 sm:[&_th]:py-2.5 sm:[&_th]:text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-8 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600 text-red-600 focus:ring-red-400"
              />
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[200px]">Company ↓</th>
            {isCol("industry") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Industry</th>
            )}
            {isCol("employees") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Employees</th>
            )}
            {isCol("website") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Website</th>
            )}
            {isCol("location") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Location</th>
            )}
            {isCol("type") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Type</th>
            )}
            {isCol("co_status") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
            )}
            {isCol("founded") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Founded</th>
            )}
            {isCol("legal_name") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Legal Name</th>
            )}
            {isCol("co_country") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Country</th>
            )}
            {isCol("co_city") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">City</th>
            )}
            {isCol("state") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">State</th>
            )}
            {isCol("co_address") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Address</th>
            )}
            {isCol("co_keywords") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Keywords</th>
            )}
            {isCol("products_services") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Products & Services</th>
            )}
            {isCol("awards_certs") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Awards & Certs</th>
            )}
            {isCol("growth") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">HC Growth</th>
            )}
            {isCol("web_traffic") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Web Traffic</th>
            )}
            {isCol("traffic_growth") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Traffic Growth</th>
            )}
            {isCol("revenue") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Revenue</th>
            )}
            {isCol("funding") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Last Funding</th>
            )}
            {isCol("rating") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Rating</th>
            )}
            {isCol("open_jobs") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Open Jobs</th>
            )}
            {isCol("technologies") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Technologies</th>
            )}
            {isCol("linkedin") && (
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">LinkedIn</th>
            )}
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1">
                <span>Actions</span>
                <button
                  type="button"
                  onClick={onOpenColumnSettings}
                  title="Column settings"
                  className="rounded p-0.5 text-gray-300 transition-colors hover:text-gray-500"
                >
                  <Settings className="h-3 w-3" />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((company) => {
            const name = company.company_name ?? "—";
            const color = avatarColor(name);
            const checked = selected.has(company.id);
            const country = company.hq_country ?? "";
            const city = company.hq_city ?? "";
            const typeLabel = company.is_public === true
              ? "public"
              : company.is_public === false
                ? "private"
                : (company.type ?? "");
            const typeKey = typeLabel.toLowerCase();
            const typeBadgeClass = TYPE_COLORS[typeKey] ?? "bg-gray-100 text-gray-500";
            const statusKey = (company.company_status ?? "").toLowerCase();
            const statusBadgeClass = STATUS_COLORS[statusKey] ?? "bg-gray-100 text-gray-500";
            const keywords = toStringArr(company.categories_and_keywords);
            const awards = toStringArr(company.awards_certifications);

            return (
              <tr
                key={company.id}
                className={`border-b border-gray-50 transition-colors hover:bg-gray-50/60 ${checked ? "bg-red-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(company.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600 text-red-600 focus:ring-red-400"
                  />
                </td>

                {/* Company name — always visible */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm ${color}`}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">{name}</p>
                      {!isCol("type") && typeLabel && (
                        <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${typeBadgeClass}`}>
                          {typeLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Industry */}
                {isCol("industry") && (
                  <td className="px-3 py-3">
                    {company.industry ? (
                      <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600">
                        {company.industry}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Employees */}
                {isCol("employees") && (
                  <td className="px-3 py-3">
                    {company.size_range || company.employees_count != null ? (
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <Users className="h-3 w-3 shrink-0 text-gray-400" />
                        {company.size_range
                          ? (SIZE_LABEL[company.size_range] ?? company.size_range)
                          : String(company.employees_count)}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Website */}
                {isCol("website") && (
                  <td className="px-3 py-3">
                    {company.website ? (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 max-w-[120px] truncate text-xs text-blue-500 hover:underline"
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    ) : <Dash />}
                  </td>
                )}

                {/* Location (combined) */}
                {isCol("location") && (
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{flag(country)}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs capitalize text-gray-700">{country || "—"}</p>
                        {city && <p className="truncate text-[10px] capitalize text-gray-400">{city}</p>}
                      </div>
                    </div>
                  </td>
                )}

                {/* Type */}
                {isCol("type") && (
                  <td className="px-3 py-3">
                    {typeLabel ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${typeBadgeClass}`}>
                        {typeLabel}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Company Status */}
                {isCol("co_status") && (
                  <td className="px-3 py-3">
                    {company.company_status ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${statusBadgeClass}`}>
                        {company.company_status}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Founded */}
                {isCol("founded") && (
                  <td className="px-3 py-3">
                    {company.founded ? (
                      <span className="text-xs text-gray-700">{company.founded}</span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Legal Name */}
                {isCol("legal_name") && (
                  <td className="px-3 py-3">
                    {company.company_legal_name ? (
                      <span className="block max-w-[160px] truncate text-xs text-gray-700">
                        {company.company_legal_name}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Company Country */}
                {isCol("co_country") && (
                  <td className="px-3 py-3">
                    {country ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{flag(country)}</span>
                        <span className="text-xs capitalize text-gray-700">{country}</span>
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Company City */}
                {isCol("co_city") && (
                  <td className="px-3 py-3">
                    <span className="text-xs capitalize text-gray-700">{city || "—"}</span>
                  </td>
                )}

                {/* HQ State */}
                {isCol("state") && (
                  <td className="px-3 py-3">
                    <span className="text-xs capitalize text-gray-700">{company.hq_state ?? "—"}</span>
                  </td>
                )}

                {/* Company Address */}
                {isCol("co_address") && (
                  <td className="px-3 py-3">
                    {company.hq_location ? (
                      <span className="block max-w-[160px] truncate text-xs text-gray-700">
                        {company.hq_location}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Keywords (gray) */}
                {isCol("co_keywords") && (
                  <td className="px-3 py-3">
                    {keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {keywords.slice(0, 3).map((k, i) => (
                          <span key={i} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                            {k}
                          </span>
                        ))}
                        {keywords.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{keywords.length - 3}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Products & Services (purple) */}
                {isCol("products_services") && (
                  <td className="px-3 py-3">
                    {keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {keywords.slice(0, 3).map((k, i) => (
                          <span key={i} className="inline-block rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                            {k}
                          </span>
                        ))}
                        {keywords.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{keywords.length - 3}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Awards & Certs (amber) */}
                {isCol("awards_certs") && (
                  <td className="px-3 py-3">
                    {awards.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {awards.slice(0, 2).map((a, i) => (
                          <span key={i} className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            {a}
                          </span>
                        ))}
                        {awards.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{awards.length - 2}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Headcount Growth */}
                {isCol("growth") && (
                  <td className="px-3 py-3">
                    {company.employees_count_change?.change_yearly_percentage != null ? (
                      <span className={`text-xs font-medium ${company.employees_count_change.change_yearly_percentage >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {company.employees_count_change.change_yearly_percentage >= 0 ? "+" : ""}
                        {company.employees_count_change.change_yearly_percentage.toFixed(1)}%
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Web Traffic */}
                {isCol("web_traffic") && (
                  <td className="px-3 py-3">
                    {company.total_website_visits_monthly != null ? (
                      <span className="text-xs text-gray-700">
                        {company.total_website_visits_monthly >= 1_000_000
                          ? `${(company.total_website_visits_monthly / 1_000_000).toFixed(1)}M`
                          : company.total_website_visits_monthly >= 1_000
                            ? `${Math.round(company.total_website_visits_monthly / 1_000)}K`
                            : String(company.total_website_visits_monthly)}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Traffic Growth */}
                {isCol("traffic_growth") && (
                  <td className="px-3 py-3">
                    {company.total_website_visits_change?.change_yearly_percentage != null ? (
                      <span className={`text-xs font-medium ${company.total_website_visits_change.change_yearly_percentage >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {company.total_website_visits_change.change_yearly_percentage >= 0 ? "+" : ""}
                        {company.total_website_visits_change.change_yearly_percentage.toFixed(1)}%
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Revenue */}
                {isCol("revenue") && (
                  <td className="px-3 py-3">
                    {(() => {
                      const r = company.revenue_annual_range;
                      if (!r) return <Dash />;
                      const src = r["source_4_annual_revenue_range"] ?? r["source_6_annual_revenue_range"];
                      if (!src) return <Dash />;
                      const lo = src.annual_revenue_range_from;
                      const hi = src.annual_revenue_range_to;
                      if (lo != null && hi != null) return <span className="text-xs text-gray-700">{fmtMoney(lo)} – {fmtMoney(hi)}</span>;
                      if (lo != null) return <span className="text-xs text-gray-700">&gt;{fmtMoney(lo)}</span>;
                      if (hi != null) return <span className="text-xs text-gray-700">&lt;{fmtMoney(hi)}</span>;
                      return <Dash />;
                    })()}
                  </td>
                )}

                {/* Last Funding */}
                {isCol("funding") && (
                  <td className="px-3 py-3">
                    {company.last_funding_round ? (
                      <div>
                        {company.last_funding_round.type && (
                          <span className="inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                            {company.last_funding_round.type}
                          </span>
                        )}
                        {company.last_funding_round.amount_raised != null && (
                          <p className="mt-0.5 text-[10px] text-gray-500">
                            {fmtMoney(company.last_funding_round.amount_raised)}
                          </p>
                        )}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Employee Rating */}
                {isCol("rating") && (
                  <td className="px-3 py-3">
                    {company.company_employee_reviews_aggregate_score != null ? (
                      <span className="text-xs text-gray-700">
                        ★ {company.company_employee_reviews_aggregate_score.toFixed(1)}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Open Jobs */}
                {isCol("open_jobs") && (
                  <td className="px-3 py-3">
                    {company.active_job_postings != null ? (
                      <span className="text-xs text-gray-700">
                        {Array.isArray(company.active_job_postings) ? company.active_job_postings.length : "—"}
                      </span>
                    ) : <Dash />}
                  </td>
                )}

                {/* Technologies */}
                {isCol("technologies") && (
                  <td className="px-3 py-3">
                    {company.technologies_used && company.technologies_used.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {company.technologies_used.slice(0, 3).map((t, i) => {
                          const label = typeof t === "string" ? t : (t?.technology ?? "");
                          return label ? (
                            <span key={i} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                              {label}
                            </span>
                          ) : null;
                        })}
                        {company.technologies_used.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{company.technologies_used.length - 3}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* LinkedIn */}
                {isCol("linkedin") && (
                  <td className="px-3 py-3">
                    {company.canonical_linkedin_url ? (
                      <a
                        href={`https://${company.canonical_linkedin_url.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        LinkedIn
                      </a>
                    ) : <Dash />}
                  </td>
                )}

                <td className="px-3 py-3">
                  <ActionMenu onAddToList={() => onAddToList(company)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
