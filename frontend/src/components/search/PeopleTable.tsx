"use client";
import { useRef, useState } from "react";
import {
  Globe, ListPlus, Mail, MoreHorizontal, Phone, Settings, UserRound,
} from "lucide-react";
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

const FLAG: Record<string, string> = {
  "united states": "🇺🇸", "united kingdom": "🇬🇧", canada: "🇨🇦",
  france: "🇫🇷", germany: "🇩🇪", india: "🇮🇳", portugal: "🇵🇹",
  ireland: "🇮🇪", australia: "🇦🇺", singapore: "🇸🇬", brazil: "🇧🇷",
  netherlands: "🇳🇱", spain: "🇪🇸", italy: "🇮🇹", sweden: "🇸🇪",
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
  return <span className="text-xs text-gray-400">—</span>;
}

function ActionMenu({ onAddToList }: { id: string; onAddToList: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

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
            {[
              { icon: <UserRound className="h-3.5 w-3.5" />, label: "View profile", action: () => {} },
              { icon: <ListPlus className="h-3.5 w-3.5" />, label: "Add to list", action: onAddToList },
            ].map((item) => (
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
      <table className="w-full min-w-[640px] text-xs [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-2.5">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-8" />
            <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[180px]">Name ↓</th>
            {isCol("company")        && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[160px]">Company</th>}
            {isCol("title")          && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[130px]">Title</th>}
            {isCol("email")          && <th className="text-left text-[11px] font-semibold text-gray-500">Email</th>}
            {isCol("location")       && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[110px]">Location</th>}
            {isCol("mobile")         && <th className="text-left text-[11px] font-semibold text-gray-500">Mobile</th>}
            {isCol("person_country") && <th className="text-left text-[11px] font-semibold text-gray-500">Country</th>}
            {isCol("person_city")    && <th className="text-left text-[11px] font-semibold text-gray-500">City</th>}
            {isCol("state")          && <th className="text-left text-[11px] font-semibold text-gray-500">State</th>}
            {isCol("department")     && <th className="text-left text-[11px] font-semibold text-gray-500">Department</th>}
            {isCol("seniority")      && <th className="text-left text-[11px] font-semibold text-gray-500">Seniority</th>}
            {isCol("job_started")    && <th className="text-left text-[11px] font-semibold text-gray-500">Job Started</th>}
            {isCol("time_in_role")   && <th className="text-left text-[11px] font-semibold text-gray-500">In Role</th>}
            {isCol("exp_years")      && <th className="text-left text-[11px] font-semibold text-gray-500">Exp.</th>}
            {isCol("headline")       && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[150px]">Headline</th>}
            {isCol("skills")         && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[130px]">Skills</th>}
            {isCol("awards_certs")   && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[120px]">Awards & Certs</th>}
            {isCol("connections")    && <th className="text-left text-[11px] font-semibold text-gray-500">Connections</th>}
            {isCol("followers")      && <th className="text-left text-[11px] font-semibold text-gray-500">Followers</th>}
            {isCol("salary")         && <th className="text-left text-[11px] font-semibold text-gray-500">Est. Salary</th>}
            {isCol("linkedin")       && <th className="text-left text-[11px] font-semibold text-gray-500">LinkedIn</th>}
            {isCol("co_industry")    && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[110px]">Co. Industry</th>}
            {isCol("co_employees")   && <th className="text-left text-[11px] font-semibold text-gray-500">Employees</th>}
            {isCol("co_type")        && <th className="text-left text-[11px] font-semibold text-gray-500">Co. Type</th>}
            {isCol("co_status")      && <th className="text-left text-[11px] font-semibold text-gray-500">Co. Status</th>}
            {isCol("co_founded")     && <th className="text-left text-[11px] font-semibold text-gray-500">Founded</th>}
            {isCol("co_country")     && <th className="text-left text-[11px] font-semibold text-gray-500">Co. Country</th>}
            {isCol("co_city")        && <th className="text-left text-[11px] font-semibold text-gray-500">Co. City</th>}
            {isCol("co_state")       && <th className="text-left text-[11px] font-semibold text-gray-500">Co. State</th>}
            {isCol("co_address")     && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Co. Address</th>}
            {isCol("co_keywords")    && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Keywords</th>}
            {isCol("products_services") && <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Products & Services</th>}
            {isCol("co_revenue")     && <th className="text-left text-[11px] font-semibold text-gray-500">Revenue</th>}
            <th className="text-left text-[11px] font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse border-b border-gray-50">
              <td><div className="mx-auto h-3.5 w-3.5 rounded bg-gray-200" /></td>
              <td>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="h-2.5 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              </td>
              {isCol("company")        && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("title")          && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("email")          && <td><div className="h-3 w-32 rounded bg-gray-200" /></td>}
              {isCol("location")       && <td><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("mobile")         && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("person_country") && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("person_city")    && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("state")          && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("department")     && <td><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("seniority")      && <td><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("job_started")    && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("time_in_role")   && <td><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("exp_years")      && <td><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("headline")       && <td><div className="h-3 w-32 rounded bg-gray-200" /></td>}
              {isCol("skills")         && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("awards_certs")   && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("connections")    && <td><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("followers")      && <td><div className="h-3 w-12 rounded bg-gray-200" /></td>}
              {isCol("salary")         && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("linkedin")       && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_industry")    && <td><div className="h-3 w-20 rounded bg-gray-200" /></td>}
              {isCol("co_employees")   && <td><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("co_type")        && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_status")      && <td><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("co_founded")     && <td><div className="h-3 w-10 rounded bg-gray-200" /></td>}
              {isCol("co_country")     && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_city")        && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
              {isCol("co_state")       && <td><div className="h-3 w-14 rounded bg-gray-200" /></td>}
              {isCol("co_address")     && <td><div className="h-3 w-28 rounded bg-gray-200" /></td>}
              {isCol("co_keywords")    && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("products_services") && <td><div className="h-3 w-24 rounded bg-gray-200" /></td>}
              {isCol("co_revenue")     && <td><div className="h-3 w-16 rounded bg-gray-200" /></td>}
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
  data: PersonResult[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onAddToList: (person: PersonResult) => void;
  visibleColumns: Record<string, boolean>;
  onOpenColumnSettings: () => void;
  revealedEmails: Map<string, string | null>;
  onRevealEmail: (recordId: string) => void;
  revealingIds: Set<string>;
}

export default function PeopleTable({
  data,
  selected,
  onSelect,
  onSelectAll,
  onAddToList,
  visibleColumns,
  onOpenColumnSettings,
  revealedEmails,
  onRevealEmail,
  revealingIds,
}: Props) {
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const isCol = (key: string) => visibleColumns[key] !== false;

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs sm:text-sm [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:py-2 [&_th]:text-[11px] sm:[&_td]:px-3 sm:[&_td]:py-3 sm:[&_th]:px-3 sm:[&_th]:py-2.5 sm:[&_th]:text-xs">
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
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[180px]">Name ↓</th>
            {isCol("company")        && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[160px]">Company</th>}
            {isCol("title")          && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[130px]">Title</th>}
            {isCol("email")          && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Email</th>}
            {isCol("location")       && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[110px]">Location</th>}
            {isCol("mobile")         && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Mobile</th>}
            {isCol("person_country") && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Country</th>}
            {isCol("person_city")    && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">City</th>}
            {isCol("state")          && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">State</th>}
            {isCol("department")     && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Department</th>}
            {isCol("seniority")      && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Seniority</th>}
            {isCol("job_started")    && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Job Started</th>}
            {isCol("time_in_role")   && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">In Role</th>}
            {isCol("exp_years")      && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Exp.</th>}
            {isCol("headline")       && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[150px]">Headline</th>}
            {isCol("skills")         && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[130px]">Skills</th>}
            {isCol("awards_certs")   && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[120px]">Awards & Certs</th>}
            {isCol("connections")    && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Connections</th>}
            {isCol("followers")      && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Followers</th>}
            {isCol("salary")         && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Est. Salary</th>}
            {isCol("linkedin")       && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">LinkedIn</th>}
            {isCol("co_industry")    && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[110px]">Co. Industry</th>}
            {isCol("co_employees")   && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Employees</th>}
            {isCol("co_type")        && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Co. Type</th>}
            {isCol("co_status")      && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Co. Status</th>}
            {isCol("co_founded")     && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Founded</th>}
            {isCol("co_country")     && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Co. Country</th>}
            {isCol("co_city")        && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Co. City</th>}
            {isCol("co_state")       && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Co. State</th>}
            {isCol("co_address")     && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[140px]">Co. Address</th>}
            {isCol("co_keywords")    && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[140px]">Keywords</th>}
            {isCol("products_services") && <th className="px-3 py-2.5 text-left font-semibold text-gray-500 min-w-[140px]">Products & Services</th>}
            {isCol("co_revenue")     && <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Revenue</th>}
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">
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
          {data.map((person) => {
            const fullName = person.full_name || `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
            const name = fullName || "—";
            const color = avatarColor(name);
            const checked = selected.has(person.id);
            const companyName = person.active_experience_company_name;
            const companyIdStr = person.active_experience_company_id != null ? String(person.active_experience_company_id) : "";
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
                className={`border-b border-gray-50 transition-colors hover:bg-gray-50/60 ${checked ? "bg-red-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(person.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600 text-red-600 focus:ring-red-400"
                  />
                </td>

                {/* Name — always visible */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white sm:h-8 sm:w-8 sm:text-xs ${color}`}>
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">{name}</p>
                      {!isCol("linkedin") && person.linkedin_url && (
                        <a
                          href={`https://${person.linkedin_url.replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-[10px] text-blue-500 hover:underline"
                        >
                          <Globe className="h-2.5 w-2.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </td>

                {/* Company */}
                {isCol("company") && (
                  <td className="px-3 py-3">
                    {companyName ? (
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white sm:h-7 sm:w-7 sm:text-xs ${avatarColor(companyName)}`}>
                          {companyName[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-gray-800 sm:text-xs">{companyName}</p>
                          {companyIdStr && (
                            <span className="text-[10px] text-gray-400">{companyIdStr.slice(0, 8)}</span>
                          )}
                        </div>
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Title */}
                {isCol("title") && (
                  <td className="px-3 py-3">
                    {jobTitle
                      ? <p className="truncate text-[11px] text-gray-700 sm:text-xs">{jobTitle}</p>
                      : <Dash />}
                    {!isCol("department") && jobDepartment && (
                      <span className="mt-0.5 inline-block rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium capitalize text-red-600">
                        {jobDepartment}
                      </span>
                    )}
                  </td>
                )}

                {/* Email with Reveal */}
                {isCol("email") && (
                  <td className="px-3 py-3">
                    {revealedEmails.has(person.id) ? (
                      revealedEmail
                        ? <span className="block max-w-[160px] truncate text-xs font-medium text-gray-800">{revealedEmail}</span>
                        : <span className="text-xs text-gray-400">No email</span>
                    ) : person.has_email ? (
                      <button
                        type="button"
                        disabled={isRevealing}
                        onClick={() => onRevealEmail(person.id)}
                        className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-50"
                      >
                        <Mail className="h-3 w-3" />
                        {isRevealing ? "Revealing…" : "Reveal"}
                      </button>
                    ) : <Dash />}
                  </td>
                )}

                {/* Location (combined) */}
                {isCol("location") && (
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{flag(person.location_country)}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-gray-700">{person.location_country ?? "—"}</p>
                        {person.location_city && <p className="truncate text-[10px] text-gray-400">{person.location_city}</p>}
                      </div>
                    </div>
                  </td>
                )}

                {/* Mobile */}
                {isCol("mobile") && (
                  <td className="px-3 py-3">
                    {person.mobile_phone
                      ? <span className="flex items-center gap-1 text-xs text-gray-700"><Phone className="h-3 w-3 text-gray-400" />{person.mobile_phone}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Person Country (standalone) */}
                {isCol("person_country") && (
                  <td className="px-3 py-3">
                    <span className="text-xs capitalize text-gray-700">{person.location_country ?? "—"}</span>
                  </td>
                )}

                {/* Person City (standalone) */}
                {isCol("person_city") && (
                  <td className="px-3 py-3">
                    <span className="text-xs capitalize text-gray-700">{person.location_city ?? "—"}</span>
                  </td>
                )}

                {/* Person State */}
                {isCol("state") && (
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-700">{person.location_state ?? "—"}</span>
                  </td>
                )}

                {/* Department */}
                {isCol("department") && (
                  <td className="px-3 py-3">
                    {jobDepartment
                      ? <span className="inline-block rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium capitalize text-red-600">{jobDepartment}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Seniority */}
                {isCol("seniority") && (
                  <td className="px-3 py-3">
                    {person.active_experience_management_level
                      ? <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-gray-600">{String(person.active_experience_management_level)}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Job Started (date) */}
                {isCol("job_started") && (
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-700">{fmtDate(person.active_experience_start_date)}</span>
                  </td>
                )}

                {/* Time in Role (duration) */}
                {isCol("time_in_role") && (
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-700">{fmtDuration(person.active_experience_start_date)}</span>
                  </td>
                )}

                {/* Experience years */}
                {isCol("exp_years") && (
                  <td className="px-3 py-3">
                    {person.total_experience_duration_months != null
                      ? <span className="text-xs text-gray-700">{Math.floor(person.total_experience_duration_months / 12)} yrs</span>
                      : <Dash />}
                  </td>
                )}

                {/* Headline */}
                {isCol("headline") && (
                  <td className="px-3 py-3">
                    {person.headline
                      ? <span className="block max-w-[180px] truncate text-xs text-gray-600" title={person.headline}>{person.headline}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Skills */}
                {isCol("skills") && (
                  <td className="px-3 py-3">
                    {person.inferred_skills && person.inferred_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {person.inferred_skills.slice(0, 3).map((s) => (
                          <span key={s} className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">{s}</span>
                        ))}
                        {person.inferred_skills.length > 3 && <span className="text-[10px] text-gray-400">+{person.inferred_skills.length - 3}</span>}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Awards & Certs */}
                {isCol("awards_certs") && (
                  <td className="px-3 py-3">
                    {awardsList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {awardsList.slice(0, 2).map((a) => (
                          <span key={a} className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">{a}</span>
                        ))}
                        {awardsList.length > 2 && <span className="text-[10px] text-gray-400">+{awardsList.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Connections */}
                {isCol("connections") && (
                  <td className="px-3 py-3">
                    {person.connections_count != null
                      ? <span className="text-xs text-gray-700">{person.connections_count.toLocaleString()}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Followers */}
                {isCol("followers") && (
                  <td className="px-3 py-3">
                    {person.followers_count != null
                      ? <span className="text-xs text-gray-700">{person.followers_count.toLocaleString()}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Estimated Salary */}
                {isCol("salary") && (
                  <td className="px-3 py-3">
                    {person.projected_base_salary_median != null
                      ? <span className="text-xs font-medium text-gray-700">{(person.projected_base_salary_currency ?? "USD") === "USD" ? "$" : ""}{Math.round(person.projected_base_salary_median / 1000)}K</span>
                      : <Dash />}
                  </td>
                )}

                {/* LinkedIn (standalone) */}
                {isCol("linkedin") && (
                  <td className="px-3 py-3">
                    {person.linkedin_url ? (
                      <a href={`https://${person.linkedin_url.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                        <Globe className="h-3 w-3 shrink-0" />LinkedIn
                      </a>
                    ) : <Dash />}
                  </td>
                )}

                {/* Company Industry */}
                {isCol("co_industry") && (
                  <td className="px-3 py-3">
                    {person.active_experience_company_industry
                      ? <span className="inline-block max-w-[120px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600">{String(person.active_experience_company_industry)}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Employee Count */}
                {isCol("co_employees") && (
                  <td className="px-3 py-3">
                    {coEmployees != null
                      ? <span className="text-xs text-gray-700">{coEmployees.toLocaleString()}</span>
                      : coSize
                        ? <span className="text-xs text-gray-700">{coSize}</span>
                        : <Dash />}
                  </td>
                )}

                {/* Company Type */}
                {isCol("co_type") && (
                  <td className="px-3 py-3">
                    {person.active_experience_company_type
                      ? <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-gray-600">{String(person.active_experience_company_type)}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Company Status */}
                {isCol("co_status") && (
                  <td className="px-3 py-3">
                    {person.active_experience_company_status
                      ? <span className="inline-block rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium capitalize text-green-700">{String(person.active_experience_company_status)}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Company Founded */}
                {isCol("co_founded") && (
                  <td className="px-3 py-3">
                    {coFounded != null
                      ? <span className="text-xs text-gray-700">{coFounded}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Company Country */}
                {isCol("co_country") && (
                  <td className="px-3 py-3">
                    <span className="text-xs capitalize text-gray-700">{person.active_experience_company_hq_country ?? "—"}</span>
                  </td>
                )}

                {/* Company City */}
                {isCol("co_city") && (
                  <td className="px-3 py-3">
                    <span className="text-xs capitalize text-gray-700">{person.active_experience_company_hq_city ?? "—"}</span>
                  </td>
                )}

                {/* Company State */}
                {isCol("co_state") && (
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-700">{person.active_experience_company_hq_region ?? "—"}</span>
                  </td>
                )}

                {/* Company Address */}
                {isCol("co_address") && (
                  <td className="px-3 py-3">
                    {person.active_experience_company_hq_location
                      ? <span className="block max-w-[160px] truncate text-xs text-gray-700">{String(person.active_experience_company_hq_location)}</span>
                      : <Dash />}
                  </td>
                )}

                {/* Company Keywords */}
                {isCol("co_keywords") && (
                  <td className="px-3 py-3">
                    {coKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {coKeywords.slice(0, 3).map((k) => (
                          <span key={k} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">{k}</span>
                        ))}
                        {coKeywords.length > 3 && <span className="text-[10px] text-gray-400">+{coKeywords.length - 3}</span>}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Products & Services (same source as keywords) */}
                {isCol("products_services") && (
                  <td className="px-3 py-3">
                    {coKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {coKeywords.slice(0, 3).map((k) => (
                          <span key={k} className="inline-block rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{k}</span>
                        ))}
                        {coKeywords.length > 3 && <span className="text-[10px] text-gray-400">+{coKeywords.length - 3}</span>}
                      </div>
                    ) : <Dash />}
                  </td>
                )}

                {/* Revenue */}
                {isCol("co_revenue") && (
                  <td className="px-3 py-3">
                    {person.active_experience_company_annual_revenue != null
                      ? <span className="text-xs text-gray-700">{String(person.active_experience_company_annual_revenue)}</span>
                      : <Dash />}
                  </td>
                )}

                <td className="px-3 py-3">
                  <ActionMenu id={person.id} onAddToList={() => onAddToList(person)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
