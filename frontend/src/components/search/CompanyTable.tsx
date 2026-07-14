"use client";
import { Globe, Users } from "lucide-react";
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
  "sri lanka": "🇱🇰", indonesia: "🇮🇩", malaysia: "🇲🇾",
  "united arab emirates": "🇦🇪", pakistan: "🇵🇰", philippines: "🇵🇭",
};
const flag = (c = "") => FLAG[c.toLowerCase()] ?? "🌍";

const SIZE_LABEL: Record<string, string> = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1K", "1001-5000": "1–5K",
  "5001-10000": "5–10K", "10001+": "10K+",
};

function normalizeSizeRange(raw: string): string {
  // Strip trailing " employees" (case-insensitive), commas, spaces
  const cleaned = raw.replace(/\s*employees?/gi, "").replace(/,/g, "").trim();
  // Handle special strings
  const lc = cleaned.toLowerCase();
  if (lc === "myself only" || lc === "self employed" || lc === "1") return "Solo";
  if (lc === "0" || lc === "") return "—";
  // Normalise range separators: "5001-10000", "5001-10,000" → key lookup
  const normalised = cleaned.replace(/\s*-\s*/g, "-");
  return SIZE_LABEL[normalised] ?? cleaned;
}

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
  return <span className="text-gray-400">—</span>;
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${Math.round(n / 1_000)}K`;
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-0 align-middle ${className}`}>
      <div className="flex h-[64px] items-center overflow-hidden">{children}</div>
    </td>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

const TH = "border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap";

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
      <table className="w-full min-w-[580px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className={`${TH} w-9`} />
            <th className={`${TH} min-w-[200px]`}>Company</th>
            {isCol("industry")         && <th className={`${TH} min-w-[120px]`}>Industry</th>}
            {isCol("employees")        && <th className={`${TH} min-w-[90px]`}>Employees</th>}
            {isCol("website")          && <th className={`${TH} min-w-[120px]`}>Website</th>}
            {isCol("location")         && <th className={`${TH} min-w-[120px]`}>Location</th>}
            {isCol("type")             && <th className={`${TH} min-w-[100px]`}>Type</th>}
            {isCol("co_status")        && <th className={`${TH} min-w-[80px]`}>Status</th>}
            {isCol("founded")          && <th className={`${TH} min-w-[70px]`}>Founded</th>}
            {isCol("legal_name")       && <th className={`${TH} min-w-[140px]`}>Legal Name</th>}
            {isCol("co_country")       && <th className={`${TH} min-w-[100px]`}>Country</th>}
            {isCol("co_city")          && <th className={`${TH} min-w-[100px]`}>City</th>}
            {isCol("state")            && <th className={`${TH} min-w-[100px]`}>State</th>}
            {isCol("co_address")       && <th className={`${TH} min-w-[140px]`}>Address</th>}
            {isCol("co_keywords")      && <th className={`${TH} min-w-[140px]`}>Keywords</th>}
            {isCol("products_services") && <th className={`${TH} min-w-[140px]`}>Products & Services</th>}
            {isCol("awards_certs")     && <th className={`${TH} min-w-[140px]`}>Awards & Certs</th>}
            {isCol("growth")           && <th className={`${TH} min-w-[80px]`}>HC Growth</th>}
            {isCol("web_traffic")      && <th className={`${TH} min-w-[90px]`}>Web Traffic</th>}
            {isCol("traffic_growth")   && <th className={`${TH} min-w-[90px]`}>Traffic Growth</th>}
            {isCol("revenue")          && <th className={`${TH} min-w-[100px]`}>Revenue</th>}
            {isCol("funding")          && <th className={`${TH} min-w-[120px]`}>Last Funding</th>}
            {isCol("rating")           && <th className={`${TH} min-w-[70px]`}>Rating</th>}
            {isCol("open_jobs")        && <th className={`${TH} min-w-[70px]`}>Open Jobs</th>}
            {isCol("technologies")     && <th className={`${TH} min-w-[140px]`}>Technologies</th>}
            {isCol("linkedin")         && <th className={`${TH} min-w-[80px]`}>LinkedIn</th>}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-3 py-2.5"><div className="mx-auto h-3.5 w-3.5 rounded bg-gray-200" /></td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 shrink-0 rounded bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-gray-200" />
                    <div className="h-2.5 w-14 rounded bg-gray-100" />
                  </div>
                </div>
              </td>
              {isCol("industry")         && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("employees")        && <td className="px-3 py-2.5"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>}
              {isCol("website")          && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("location")         && <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("type")             && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_status")        && <td className="px-3 py-2.5"><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("founded")          && <td className="px-3 py-2.5"><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("legal_name")       && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("co_country")       && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_city")          && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("state")            && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_address")       && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("co_keywords")      && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("products_services") && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("awards_certs")     && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("growth")           && <td className="px-3 py-2.5"><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("web_traffic")      && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("traffic_growth")   && <td className="px-3 py-2.5"><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("revenue")          && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("funding")          && <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("rating")           && <td className="px-3 py-2.5"><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("open_jobs")        && <td className="px-3 py-2.5"><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("technologies")     && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("linkedin")         && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              <td className="px-3 py-2.5"><div className="mx-auto h-6 w-6 rounded bg-gray-200" /></td>
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
  visibleColumns: Record<string, boolean>;
}

export default function CompanyTable({
  data,
  selected,
  onSelect,
  onSelectAll,
  visibleColumns,
}: Props) {
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const isCol = (key: string) => visibleColumns[key] !== false;

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[580px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className={`${TH} w-9`}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-red-600"
              />
            </th>
            <th className={`${TH} min-w-[200px]`}>Company</th>
            {isCol("industry")          && <th className={`${TH} min-w-[120px]`}>Industry</th>}
            {isCol("employees")         && <th className={`${TH} min-w-[90px]`}>Employees</th>}
            {isCol("website")           && <th className={`${TH} min-w-[120px]`}>Website</th>}
            {isCol("location")          && <th className={`${TH} min-w-[120px]`}>Location</th>}
            {isCol("type")              && <th className={`${TH} min-w-[100px]`}>Type</th>}
            {isCol("co_status")         && <th className={`${TH} min-w-[80px]`}>Status</th>}
            {isCol("founded")           && <th className={`${TH} min-w-[70px]`}>Founded</th>}
            {isCol("legal_name")        && <th className={`${TH} min-w-[140px]`}>Legal Name</th>}
            {isCol("co_country")        && <th className={`${TH} min-w-[100px]`}>Country</th>}
            {isCol("co_city")           && <th className={`${TH} min-w-[100px]`}>City</th>}
            {isCol("state")             && <th className={`${TH} min-w-[100px]`}>State</th>}
            {isCol("co_address")        && <th className={`${TH} min-w-[140px]`}>Address</th>}
            {isCol("co_keywords")       && <th className={`${TH} min-w-[140px]`}>Keywords</th>}
            {isCol("products_services") && <th className={`${TH} min-w-[140px]`}>Products & Services</th>}
            {isCol("awards_certs")      && <th className={`${TH} min-w-[140px]`}>Awards & Certs</th>}
            {isCol("growth")            && <th className={`${TH} min-w-[80px]`}>HC Growth</th>}
            {isCol("web_traffic")       && <th className={`${TH} min-w-[90px]`}>Web Traffic</th>}
            {isCol("traffic_growth")    && <th className={`${TH} min-w-[90px]`}>Traffic Growth</th>}
            {isCol("revenue")           && <th className={`${TH} min-w-[100px]`}>Revenue</th>}
            {isCol("funding")           && <th className={`${TH} min-w-[120px]`}>Last Funding</th>}
            {isCol("rating")            && <th className={`${TH} min-w-[70px]`}>Rating</th>}
            {isCol("open_jobs")         && <th className={`${TH} min-w-[70px]`}>Open Jobs</th>}
            {isCol("technologies")      && <th className={`${TH} min-w-[140px]`}>Technologies</th>}
            {isCol("linkedin")          && <th className={`${TH} min-w-[80px]`}>LinkedIn</th>}
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
                className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${checked ? "bg-red-50/40" : ""}`}
              >
                {/* Checkbox */}
                <Cell>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(company.id)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-red-600"
                  />
                </Cell>

                {/* Company name — always visible */}
                <Cell className="max-w-[220px]">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-[13px] font-bold text-white ${color}`}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-[13px] font-semibold text-gray-900" title={name}>{name}</p>
                      {!isCol("type") && typeLabel && (
                        <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize ${typeBadgeClass}`}>
                          {typeLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </Cell>

                {/* Industry */}
                {isCol("industry") && (
                  <Cell>
                    {company.industry ? (
                      <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {company.industry}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Employees */}
                {isCol("employees") && (
                  <Cell>
                    {(() => {
                      const raw = company.size_range;
                      const count = company.employees_count;
                      if (raw) {
                        const label = normalizeSizeRange(raw);
                        if (label === "—") return <Dash />;
                        return (
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-gray-800">
                            <Users className="h-3 w-3 shrink-0 text-gray-400" />
                            {label}
                          </div>
                        );
                      }
                      if (count != null && count > 0) {
                        return (
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-gray-800">
                            <Users className="h-3 w-3 shrink-0 text-gray-400" />
                            {count.toLocaleString()}
                          </div>
                        );
                      }
                      return <Dash />;
                    })()}
                  </Cell>
                )}

                {/* Website */}
                {isCol("website") && (
                  <Cell>
                    {company.website ? (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 max-w-[120px] truncate text-[13px] text-blue-500 hover:underline"
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Location (combined) */}
                {isCol("location") && (
                  <Cell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{flag(country)}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] capitalize text-gray-700">{country || "—"}</p>
                        {city && <p className="truncate text-xs capitalize text-gray-400">{city}</p>}
                      </div>
                    </div>
                  </Cell>
                )}

                {/* Type */}
                {isCol("type") && (
                  <Cell>
                    {typeLabel ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${typeBadgeClass}`}>
                        {typeLabel}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Company Status */}
                {isCol("co_status") && (
                  <Cell>
                    {company.company_status ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${statusBadgeClass}`}>
                        {company.company_status}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Founded */}
                {isCol("founded") && (
                  <Cell>
                    {company.founded ? (
                      <span className="text-[13px] text-gray-800">{company.founded}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Legal Name */}
                {isCol("legal_name") && (
                  <Cell>
                    {company.company_legal_name ? (
                      <span className="block max-w-[160px] truncate text-[13px] text-gray-800">
                        {company.company_legal_name}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Company Country */}
                {isCol("co_country") && (
                  <Cell>
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{flag(country)}</span>
                      <span className="text-[13px] capitalize text-gray-700">{country || "—"}</span>
                    </div>
                  </Cell>
                )}

                {/* Company City */}
                {isCol("co_city") && (
                  <Cell>
                    <span className="text-[13px] capitalize text-gray-700">{city || "—"}</span>
                  </Cell>
                )}

                {/* HQ State */}
                {isCol("state") && (
                  <Cell>
                    <span className="text-[13px] text-gray-800">{company.hq_state ?? "—"}</span>
                  </Cell>
                )}

                {/* Company Address */}
                {isCol("co_address") && (
                  <Cell>
                    {company.hq_location ? (
                      <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={company.hq_location}>
                        {company.hq_location}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Keywords (gray) */}
                {isCol("co_keywords") && (
                  <Cell>
                    {keywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {keywords.slice(0, 2).map((k, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                            {k}
                          </span>
                        ))}
                        {keywords.length > 2 && (
                          <span className="shrink-0 text-xs text-gray-500">+{keywords.length - 2}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Products & Services (purple) */}
                {isCol("products_services") && (
                  <Cell>
                    {keywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {keywords.slice(0, 2).map((k, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700">
                            {k}
                          </span>
                        ))}
                        {keywords.length > 2 && (
                          <span className="shrink-0 text-xs text-gray-500">+{keywords.length - 2}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Awards & Certs (amber) */}
                {isCol("awards_certs") && (
                  <Cell>
                    {awards.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {awards.slice(0, 2).map((a, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                            {a}
                          </span>
                        ))}
                        {awards.length > 2 && (
                          <span className="shrink-0 text-xs text-gray-500">+{awards.length - 2}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Headcount Growth */}
                {isCol("growth") && (
                  <Cell>
                    {company.employees_count_change?.change_yearly_percentage != null ? (
                      <span className={`text-[13px] font-medium ${company.employees_count_change.change_yearly_percentage >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {company.employees_count_change.change_yearly_percentage >= 0 ? "+" : ""}
                        {company.employees_count_change.change_yearly_percentage.toFixed(1)}%
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Web Traffic */}
                {isCol("web_traffic") && (
                  <Cell>
                    {company.total_website_visits_monthly != null ? (
                      <span className="text-[13px] text-gray-800">
                        {company.total_website_visits_monthly >= 1_000_000
                          ? `${(company.total_website_visits_monthly / 1_000_000).toFixed(1)}M`
                          : company.total_website_visits_monthly >= 1_000
                            ? `${Math.round(company.total_website_visits_monthly / 1_000)}K`
                            : String(company.total_website_visits_monthly)}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Traffic Growth */}
                {isCol("traffic_growth") && (
                  <Cell>
                    {company.total_website_visits_change?.change_yearly_percentage != null ? (
                      <span className={`text-[13px] font-medium ${company.total_website_visits_change.change_yearly_percentage >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {company.total_website_visits_change.change_yearly_percentage >= 0 ? "+" : ""}
                        {company.total_website_visits_change.change_yearly_percentage.toFixed(1)}%
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Revenue */}
                {isCol("revenue") && (
                  <Cell>
                    {(() => {
                      const r = company.revenue_annual_range;
                      if (!r) return <Dash />;
                      const src = r["source_4_annual_revenue_range"] ?? r["source_6_annual_revenue_range"];
                      if (!src) return <Dash />;
                      const lo = src.annual_revenue_range_from;
                      const hi = src.annual_revenue_range_to;
                      if (lo != null && hi != null) return <span className="text-[13px] text-gray-800 whitespace-nowrap">{fmtMoney(lo)} – {fmtMoney(hi)}</span>;
                      if (lo != null) return <span className="text-[13px] text-gray-800">&gt;{fmtMoney(lo)}</span>;
                      if (hi != null) return <span className="text-[13px] text-gray-800">&lt;{fmtMoney(hi)}</span>;
                      return <Dash />;
                    })()}
                  </Cell>
                )}

                {/* Last Funding */}
                {isCol("funding") && (
                  <Cell>
                    {company.last_funding_round ? (
                      <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
                        {company.last_funding_round.type && (
                          <span className="shrink-0 inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 whitespace-nowrap">
                            {company.last_funding_round.type}
                          </span>
                        )}
                        {company.last_funding_round.amount_raised != null && (
                          <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
                            {fmtMoney(company.last_funding_round.amount_raised)}
                          </span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Employee Rating */}
                {isCol("rating") && (
                  <Cell>
                    {company.company_employee_reviews_aggregate_score != null ? (
                      <span className="text-[13px] text-gray-800">
                        ★ {company.company_employee_reviews_aggregate_score.toFixed(1)}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Open Jobs */}
                {isCol("open_jobs") && (
                  <Cell>
                    {company.active_job_postings != null ? (
                      <span className="text-[13px] text-gray-800">
                        {Array.isArray(company.active_job_postings) ? company.active_job_postings.length : "—"}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Technologies */}
                {isCol("technologies") && (
                  <Cell>
                    {company.technologies_used && company.technologies_used.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {company.technologies_used.slice(0, 2).map((t, i) => {
                          const label = typeof t === "string" ? t : (t?.technology ?? "");
                          return label ? (
                            <span key={i} className="shrink-0 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                              {label}
                            </span>
                          ) : null;
                        })}
                        {company.technologies_used.length > 2 && (
                          <span className="shrink-0 text-xs text-gray-500">+{company.technologies_used.length - 2}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* LinkedIn */}
                {isCol("linkedin") && (
                  <Cell>
                    {company.canonical_linkedin_url ? (
                      <a
                        href={`https://${company.canonical_linkedin_url.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        LinkedIn
                      </a>
                    ) : <Dash />}
                  </Cell>
                )}

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
