"use client";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Globe, Mail, Phone } from "lucide-react";
import type { PersonResult } from "@/types/search";
import { PEOPLE_COLUMNS } from "@/hooks/useColumnSettings";

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

function initials(name = ""): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// Shows picture_url when available; falls back to colour + initials on error or absence.
function Avatar({ name, pictureUrl, size = "md" }: { name: string; pictureUrl?: string; size?: "sm" | "md" }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-xs";
  if (pictureUrl && !imgError) {
    return (
      <img
        src={pictureUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${dim} shrink-0 flex items-center justify-center rounded-full font-semibold text-white ${avatarColor(name)}`}>
      {initials(name)}
    </div>
  );
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDuration(iso?: string): string {
  if (!iso) return "—";
  const start = new Date(iso);
  if (isNaN(start.getTime())) return "—";
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 1) return "<1m";
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  return [yrs > 0 ? `${yrs}y` : "", mo > 0 ? `${mo}m` : ""].filter(Boolean).join(" ");
}

function toStringArr(v: string | string[] | undefined | null): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function Dash() {
  return <span className="text-gray-400">—</span>;
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-0 align-middle ${className}`}>
      <div className="flex h-[64px] items-center overflow-hidden">{children}</div>
    </td>
  );
}

const PTH = "border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600";

function SortTh({
  label, sortKey, current, dir, onSort, className = "",
}: {
  label: string; sortKey: string; current: string | null;
  dir: "asc" | "desc"; onSort: (k: string) => void; className?: string;
}) {
  const active = current === sortKey;
  return (
    <th
      className={`${PTH} cursor-pointer select-none whitespace-nowrap hover:bg-gray-100 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active
          ? dir === "asc"
            ? <ChevronUp className="h-3.5 w-3.5 text-red-500" />
            : <ChevronDown className="h-3.5 w-3.5 text-red-500" />
          : <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />}
      </div>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function PeopleTableSkeleton({
  rows = 8,
  visibleColumns,
}: {
  rows?: number;
  visibleColumns?: Record<string, boolean>;
}) {
  const isCol = (key: string) => {
    if (visibleColumns) return visibleColumns[key] !== false;
    return PEOPLE_COLUMNS.find((c) => c.key === key)?.defaultVisible !== false;
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className="w-9 border-b border-gray-100 px-3 py-2.5" />
            <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[200px]">Name</th>
            {isCol("company")        && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[160px]">Company</th>}
            {isCol("title")          && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[150px]">Title</th>}
            {isCol("email")          && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[130px]">Email</th>}
            {isCol("location")       && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[130px]">Location</th>}
            {isCol("mobile")         && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[120px]">Mobile</th>}
            {isCol("person_country") && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Country</th>}
            {isCol("person_city")    && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">City</th>}
            {isCol("state")          && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">State</th>}
            {isCol("department")     && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[120px]">Department</th>}
            {isCol("seniority")      && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Seniority</th>}
            {isCol("job_started")    && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Job Started</th>}
            {isCol("time_in_role")   && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[80px]">In Role</th>}
            {isCol("exp_years")      && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[70px]">Exp.</th>}
            {isCol("headline")       && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[180px]">Headline</th>}
            {isCol("skills")         && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[150px]">Skills</th>}
            {isCol("awards_certs")   && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[140px]">Awards & Certs</th>}
            {isCol("connections")    && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[90px]">Connections</th>}
            {isCol("followers")      && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[80px]">Followers</th>}
            {isCol("salary")         && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[90px]">Est. Salary</th>}
            {isCol("linkedin")       && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[80px]">LinkedIn</th>}
            {isCol("co_industry")    && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[130px]">Co. Industry</th>}
            {isCol("co_employees")   && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[90px]">Employees</th>}
            {isCol("co_type")        && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Co. Type</th>}
            {isCol("co_status")      && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[90px]">Co. Status</th>}
            {isCol("co_founded")     && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[80px]">Founded</th>}
            {isCol("co_country")     && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Co. Country</th>}
            {isCol("co_city")        && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Co. City</th>}
            {isCol("co_state")       && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Co. State</th>}
            {isCol("co_address")     && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[160px]">Co. Address</th>}
            {isCol("co_keywords")    && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[160px]">Keywords</th>}
            {isCol("products_services") && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[160px]">Products & Services</th>}
            {isCol("co_revenue")     && <th className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 min-w-[100px]">Revenue</th>}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-3 py-2.5"><div className="mx-auto h-3.5 w-3.5 rounded bg-gray-200" /></td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="h-2 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              </td>
              {isCol("company")        && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("title")          && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("email")          && <td className="px-3 py-2.5"><div className="h-3 w-32 rounded bg-gray-200" /></td>}
              {isCol("location")       && <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("mobile")         && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("person_country") && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("person_city")    && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("state")          && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("department")     && <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("seniority")      && <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("job_started")    && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("time_in_role")   && <td className="px-3 py-2.5"><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("exp_years")      && <td className="px-3 py-2.5"><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("headline")       && <td className="px-3 py-2.5"><div className="h-3 w-32 rounded bg-gray-200" /></td>}
              {isCol("skills")         && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("awards_certs")   && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("connections")    && <td className="px-3 py-2.5"><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("followers")      && <td className="px-3 py-2.5"><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("salary")         && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("linkedin")       && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_industry")    && <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("co_employees")   && <td className="px-3 py-2.5"><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("co_type")        && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_status")      && <td className="px-3 py-2.5"><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("co_founded")     && <td className="px-3 py-2.5"><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("co_country")     && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_city")        && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_state")       && <td className="px-3 py-2.5"><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("co_address")     && <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("co_keywords")    && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("products_services") && <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("co_revenue")     && <td className="px-3 py-2.5"><div className="h-3 w-16 rounded bg-gray-200" /></td>}
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
  data: PersonResult[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  visibleColumns: Record<string, boolean>;
  revealedEmails: Map<string, string | null>;
  onRevealEmail: (recordId: string) => void;
  revealingIds: Set<string>;
}

export default function PeopleTable({
  data,
  selected,
  onSelect,
  onSelectAll,
  visibleColumns,
  revealedEmails,
  onRevealEmail,
  revealingIds,
}: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    setSortDir((prev) => sortKey === key ? (prev === "asc" ? "desc" : "asc") : "asc");
    setSortKey(key);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      const ap = a as unknown as Record<string, unknown>;
      const bp = b as unknown as Record<string, unknown>;
      switch (sortKey) {
        case "name":         av = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(); bv = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim(); break;
        case "company":      av = (a.active_experience_company_name as string) ?? ""; bv = (b.active_experience_company_name as string) ?? ""; break;
        case "title":        av = (a.active_experience_title as string) ?? ""; bv = (b.active_experience_title as string) ?? ""; break;
        case "location":     av = a.location_country ?? ""; bv = b.location_country ?? ""; break;
        case "country":      av = a.location_country ?? ""; bv = b.location_country ?? ""; break;
        case "city":         av = a.location_city ?? ""; bv = b.location_city ?? ""; break;
        case "state":        av = (ap.location_region as string) ?? ""; bv = (bp.location_region as string) ?? ""; break;
        case "department":   av = (a.active_experience_department as string) ?? ""; bv = (b.active_experience_department as string) ?? ""; break;
        case "seniority":    av = (a.active_experience_seniority as string) ?? ""; bv = (b.active_experience_seniority as string) ?? ""; break;
        case "job_started":  av = (a.active_experience_start_date as string) ?? ""; bv = (b.active_experience_start_date as string) ?? ""; break;
        case "time_in_role": av = (ap.active_experience_duration_months as number) ?? -1; bv = (bp.active_experience_duration_months as number) ?? -1; break;
        case "exp_years":    av = (ap.total_experience_duration_months as number) ?? -1; bv = (bp.total_experience_duration_months as number) ?? -1; break;
        case "connections":  av = a.connections_count ?? -1; bv = b.connections_count ?? -1; break;
        case "followers":    av = a.followers_count ?? -1; bv = b.followers_count ?? -1; break;
        case "salary":       av = a.projected_base_salary_median ?? -1; bv = b.projected_base_salary_median ?? -1; break;
        case "co_employees": av = Number(a.active_experience_company_size) || -1; bv = Number(b.active_experience_company_size) || -1; break;
        case "co_founded":   av = Number(a.active_experience_company_founded ?? a.active_experience_company_founded_year) || 0; bv = Number(b.active_experience_company_founded ?? b.active_experience_company_founded_year) || 0; break;
      }
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [data, sortKey, sortDir]);

  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const isCol = (key: string) => visibleColumns[key] !== false;
  const S = { current: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className="w-9 border-b border-gray-100 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-red-600"
              />
            </th>
            <SortTh label="Name"              sortKey="name"         className="min-w-[200px]" {...S} />
            {isCol("company")           && <SortTh label="Company"        sortKey="company"      className="min-w-[160px]" {...S} />}
            {isCol("title")             && <SortTh label="Title"          sortKey="title"        className="min-w-[150px]" {...S} />}
            {isCol("email")             && <th className={`${PTH} min-w-[130px]`}>Email</th>}
            {isCol("location")          && <SortTh label="Location"       sortKey="location"     className="min-w-[130px]" {...S} />}
            {isCol("mobile")            && <th className={`${PTH} min-w-[120px]`}>Mobile</th>}
            {isCol("person_country")    && <SortTh label="Country"        sortKey="country"      className="min-w-[100px]" {...S} />}
            {isCol("person_city")       && <SortTh label="City"           sortKey="city"         className="min-w-[100px]" {...S} />}
            {isCol("state")             && <SortTh label="State"          sortKey="state"        className="min-w-[100px]" {...S} />}
            {isCol("department")        && <SortTh label="Department"     sortKey="department"   className="min-w-[120px]" {...S} />}
            {isCol("seniority")         && <SortTh label="Seniority"      sortKey="seniority"    className="min-w-[100px]" {...S} />}
            {isCol("job_started")       && <SortTh label="Job Started"    sortKey="job_started"  className="min-w-[100px]" {...S} />}
            {isCol("time_in_role")      && <SortTh label="In Role"        sortKey="time_in_role" className="min-w-[80px]"  {...S} />}
            {isCol("exp_years")         && <SortTh label="Exp."           sortKey="exp_years"    className="min-w-[70px]"  {...S} />}
            {isCol("headline")          && <th className={`${PTH} min-w-[180px]`}>Headline</th>}
            {isCol("skills")            && <th className={`${PTH} min-w-[150px]`}>Skills</th>}
            {isCol("awards_certs")      && <th className={`${PTH} min-w-[140px]`}>Awards & Certs</th>}
            {isCol("connections")       && <SortTh label="Connections"    sortKey="connections"  className="min-w-[90px]"  {...S} />}
            {isCol("followers")         && <SortTh label="Followers"      sortKey="followers"    className="min-w-[80px]"  {...S} />}
            {isCol("salary")            && <SortTh label="Est. Salary"    sortKey="salary"       className="min-w-[90px]"  {...S} />}
            {isCol("linkedin")          && <th className={`${PTH} min-w-[80px]`}>LinkedIn</th>}
            {isCol("co_industry")       && <th className={`${PTH} min-w-[130px]`}>Co. Industry</th>}
            {isCol("co_employees")      && <SortTh label="Employees"      sortKey="co_employees" className="min-w-[90px]"  {...S} />}
            {isCol("co_type")           && <th className={`${PTH} min-w-[100px]`}>Co. Type</th>}
            {isCol("co_status")         && <th className={`${PTH} min-w-[90px]`}>Co. Status</th>}
            {isCol("co_founded")        && <SortTh label="Founded"        sortKey="co_founded"   className="min-w-[80px]"  {...S} />}
            {isCol("co_country")        && <SortTh label="Co. Country"    sortKey="country"      className="min-w-[100px]" {...S} />}
            {isCol("co_city")           && <SortTh label="Co. City"       sortKey="city"         className="min-w-[100px]" {...S} />}
            {isCol("co_state")          && <th className={`${PTH} min-w-[100px]`}>Co. State</th>}
            {isCol("co_address")        && <th className={`${PTH} min-w-[160px]`}>Co. Address</th>}
            {isCol("co_keywords")       && <th className={`${PTH} min-w-[160px]`}>Keywords</th>}
            {isCol("products_services") && <th className={`${PTH} min-w-[160px]`}>Products & Services</th>}
            {isCol("co_revenue")        && <th className={`${PTH} min-w-[100px]`}>Revenue</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((person) => {
            const fullName = person.full_name || `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
            const name = fullName || "—";
            const checked = selected.has(person.id);
            const companyName = person.active_experience_company_name;
            const jobTitle = person.active_experience_title;
            const jobDepartment = person.active_experience_department;
            const revealedEmail = revealedEmails.get(person.id);
            const isRevealing = revealingIds.has(person.id);
            const coEmployees = person.active_experience_company_employees_count;
            const coSize = person.active_experience_company_size;
            const coFounded = person.active_experience_company_founded ?? person.active_experience_company_founded_year;
            const coKeywords = toStringArr(person.active_experience_company_categories_and_keywords);
            const awardsList = toStringArr(person.awards_certifications);

            return (
              <tr
                key={person.id}
                className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${checked ? "bg-red-50/40" : ""}`}
              >
                {/* Checkbox */}
                <Cell>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(person.id)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-red-600"
                  />
                </Cell>

                {/* Name — always visible */}
                <Cell className="max-w-[220px]">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Avatar name={name} pictureUrl={person.picture_url} size="md" />
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-[13px] font-semibold text-gray-900" title={name}>{name}</p>
                      {!isCol("linkedin") && person.linkedin_url ? (
                        <a
                          href={`https://${person.linkedin_url.replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-xs text-blue-500 hover:underline"
                        >
                          <Globe className="h-2.5 w-2.5" />
                          LinkedIn
                        </a>
                      ) : person.headline ? (
                        <p className="truncate text-xs text-gray-500 max-w-[160px]">{person.headline}</p>
                      ) : null}
                    </div>
                  </div>
                </Cell>

                {/* Company */}
                {isCol("company") && (
                  <Cell>
                    {companyName ? (
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 shrink-0 flex items-center justify-center rounded text-xs font-bold text-white ${avatarColor(companyName)}`}>
                          {companyName[0]?.toUpperCase()}
                        </div>
                        <p className="truncate text-[13px] font-medium text-gray-800 max-w-[130px]">{companyName}</p>
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Title */}
                {isCol("title") && (
                  <Cell>
                    {jobTitle ? (
                      <div>
                        <p className="truncate text-[13px] text-gray-800 max-w-[140px]" title={jobTitle}>{jobTitle}</p>
                        {!isCol("department") && jobDepartment && (
                          <span className="mt-0.5 inline-block rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-medium capitalize text-red-600">
                            {jobDepartment}
                          </span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Email */}
                {isCol("email") && (
                  <Cell>
                    {revealedEmails.has(person.id) ? (
                      revealedEmail
                        ? <span className="block max-w-[160px] truncate text-[13px] font-medium text-gray-800">{revealedEmail}</span>
                        : <span className="text-xs text-gray-500">No email</span>
                    ) : person.has_email ? (
                      <button
                        type="button"
                        disabled={isRevealing}
                        onClick={() => onRevealEmail(person.id)}
                        className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-50"
                      >
                        <Mail className="h-3 w-3" />
                        {isRevealing ? "Revealing…" : "Reveal"}
                      </button>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Location */}
                {isCol("location") && (
                  <Cell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{flag(person.location_country)}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-gray-800">{person.location_country ?? "—"}</p>
                        {person.location_city && (
                          <p className="truncate text-xs text-gray-500">{person.location_city}</p>
                        )}
                      </div>
                    </div>
                  </Cell>
                )}

                {/* Mobile */}
                {isCol("mobile") && (
                  <Cell>
                    {person.mobile_phone
                      ? <span className="flex items-center gap-1 text-[13px] text-gray-800 whitespace-nowrap"><Phone className="h-3 w-3 shrink-0 text-gray-400" />{person.mobile_phone}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Person Country */}
                {isCol("person_country") && (
                  <Cell>
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{flag(person.location_country)}</span>
                      <span className="text-[13px] capitalize text-gray-700">{person.location_country ?? "—"}</span>
                    </div>
                  </Cell>
                )}

                {/* Person City */}
                {isCol("person_city") && (
                  <Cell>
                    <span className="text-[13px] capitalize text-gray-700">{person.location_city ?? "—"}</span>
                  </Cell>
                )}

                {/* Person State */}
                {isCol("state") && (
                  <Cell>
                    <span className="text-[13px] text-gray-800">{person.location_state ?? "—"}</span>
                  </Cell>
                )}

                {/* Department */}
                {isCol("department") && (
                  <Cell>
                    {jobDepartment
                      ? <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium capitalize text-red-600 whitespace-nowrap">{jobDepartment}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Seniority */}
                {isCol("seniority") && (
                  <Cell>
                    {person.active_experience_management_level
                      ? <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">{String(person.active_experience_management_level)}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Job Started */}
                {isCol("job_started") && (
                  <Cell>
                    <span className="text-[13px] text-gray-800 whitespace-nowrap">{fmtDate(person.active_experience_start_date)}</span>
                  </Cell>
                )}

                {/* Time in Role */}
                {isCol("time_in_role") && (
                  <Cell>
                    <span className="text-[13px] font-medium text-gray-700">{fmtDuration(person.active_experience_start_date)}</span>
                  </Cell>
                )}

                {/* Experience years */}
                {isCol("exp_years") && (
                  <Cell>
                    {person.total_experience_duration_months != null
                      ? <span className="text-[13px] font-medium text-gray-700">{Math.floor(person.total_experience_duration_months / 12)} yrs</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Headline */}
                {isCol("headline") && (
                  <Cell>
                    {person.headline
                      ? <span className="block max-w-[180px] truncate text-[13px] text-gray-600" title={person.headline}>{person.headline}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Skills */}
                {isCol("skills") && (
                  <Cell>
                    {person.inferred_skills && person.inferred_skills.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {person.inferred_skills.slice(0, 2).map((s) => (
                          <span key={s} className="shrink-0 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600">{s}</span>
                        ))}
                        {person.inferred_skills.length > 2 && (
                          <span className="shrink-0 text-xs text-gray-500">+{person.inferred_skills.length - 2}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Awards & Certs */}
                {isCol("awards_certs") && (
                  <Cell>
                    {awardsList.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {awardsList.slice(0, 2).map((a) => (
                          <span key={a} className="shrink-0 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">{a}</span>
                        ))}
                        {awardsList.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{awardsList.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Connections */}
                {isCol("connections") && (
                  <Cell>
                    {person.connections_count != null
                      ? <span className="text-[13px] text-gray-800">{person.connections_count.toLocaleString()}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Followers */}
                {isCol("followers") && (
                  <Cell>
                    {person.followers_count != null
                      ? <span className="text-[13px] text-gray-800">{person.followers_count.toLocaleString()}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Estimated Salary */}
                {isCol("salary") && (
                  <Cell>
                    {person.projected_base_salary_median != null
                      ? <span className="text-[13px] font-semibold text-gray-700">{(person.projected_base_salary_currency ?? "USD") === "USD" ? "$" : ""}{Math.round(person.projected_base_salary_median / 1000)}K</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* LinkedIn */}
                {isCol("linkedin") && (
                  <Cell>
                    {person.linkedin_url ? (
                      <a
                        href={`https://${person.linkedin_url.replace(/^https?:\/\//, "")}`}
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

                {/* Co. Industry */}
                {isCol("co_industry") && (
                  <Cell>
                    {person.active_experience_company_industry
                      ? <span className="inline-block max-w-[120px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">{String(person.active_experience_company_industry)}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Employees */}
                {isCol("co_employees") && (
                  <Cell>
                    {coEmployees != null
                      ? <span className="text-[13px] text-gray-800">{coEmployees.toLocaleString()}</span>
                      : coSize
                        ? <span className="text-[13px] text-gray-800">{coSize}</span>
                        : <Dash />}
                  </Cell>
                )}

                {/* Co. Type */}
                {isCol("co_type") && (
                  <Cell>
                    {person.active_experience_company_type
                      ? <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">{String(person.active_experience_company_type)}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Co. Status */}
                {isCol("co_status") && (
                  <Cell>
                    {person.active_experience_company_status
                      ? <span className="inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium capitalize text-green-700 whitespace-nowrap">{String(person.active_experience_company_status)}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Founded */}
                {isCol("co_founded") && (
                  <Cell>
                    {coFounded != null
                      ? <span className="text-[13px] text-gray-800">{coFounded}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Co. Country */}
                {isCol("co_country") && (
                  <Cell>
                    <div className="flex items-center gap-1">
                      {person.active_experience_company_hq_country && (
                        <span className="text-base leading-none">{flag(person.active_experience_company_hq_country)}</span>
                      )}
                      <span className="text-[13px] capitalize text-gray-700">{person.active_experience_company_hq_country ?? "—"}</span>
                    </div>
                  </Cell>
                )}

                {/* Co. City */}
                {isCol("co_city") && (
                  <Cell>
                    <span className="text-[13px] capitalize text-gray-700">{person.active_experience_company_hq_city ?? "—"}</span>
                  </Cell>
                )}

                {/* Co. State */}
                {isCol("co_state") && (
                  <Cell>
                    <span className="text-[13px] text-gray-800">{person.active_experience_company_hq_region ?? "—"}</span>
                  </Cell>
                )}

                {/* Co. Address */}
                {isCol("co_address") && (
                  <Cell>
                    {person.active_experience_company_hq_location
                      ? <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={String(person.active_experience_company_hq_location)}>{String(person.active_experience_company_hq_location)}</span>
                      : <Dash />}
                  </Cell>
                )}

                {/* Keywords */}
                {isCol("co_keywords") && (
                  <Cell>
                    {coKeywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {coKeywords.slice(0, 2).map((k) => (
                          <span key={k} className="shrink-0 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{k}</span>
                        ))}
                        {coKeywords.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{coKeywords.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Products & Services */}
                {isCol("products_services") && (
                  <Cell>
                    {coKeywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {coKeywords.slice(0, 2).map((k) => (
                          <span key={k} className="shrink-0 inline-block rounded bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700">{k}</span>
                        ))}
                        {coKeywords.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{coKeywords.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {/* Revenue */}
                {isCol("co_revenue") && (
                  <Cell>
                    {person.active_experience_company_annual_revenue != null
                      ? <span className="text-[13px] text-gray-800">{String(person.active_experience_company_annual_revenue)}</span>
                      : <Dash />}
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
