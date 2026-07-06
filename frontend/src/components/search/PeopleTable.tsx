"use client";
import { useRef, useState } from "react";
import { MoreHorizontal, UserRound, Building2, ListPlus, Mail, Globe, Users } from "lucide-react";
import type { PersonResult } from "@/types/search";

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

const SIZE_LABEL: Record<string, string> = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1K", "1001-5000": "1–5K",
  "5001-10000": "5–10K", "10001+": "10K+",
};

function SizeBadge({ size }: { size?: string }) {
  if (!size) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
      <Users className="h-2.5 w-2.5" />
      {SIZE_LABEL[size] ?? size}
    </span>
  );
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

  const menuItems = [
    { icon: <UserRound className="h-3.5 w-3.5" />, label: "View profile", action: () => {} },
    { icon: <Building2 className="h-3.5 w-3.5" />, label: "Push to CRM", action: () => {} },
    { icon: <ListPlus className="h-3.5 w-3.5" />, label: "Add to list", action: onAddToList },
    { icon: <Mail className="h-3.5 w-3.5" />, label: "Send email", action: () => {} },
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
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
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

export function PeopleTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs sm:min-w-[700px] [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-2.5">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-8" />
            <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[180px]">Name ↓</th>
            <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[180px]">Company</th>
            <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[140px]">Title</th>
            <th className="text-left text-[11px] font-semibold text-gray-500">Email</th>
            <th className="text-left text-[11px] font-semibold text-gray-500 min-w-[120px]">Location</th>
            <th className="text-left text-[11px] font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-gray-50 animate-pulse">
              <td><div className="h-3.5 w-3.5 rounded bg-gray-200 mx-auto" /></td>
              <td>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="h-3 w-28 rounded bg-gray-200" />
                    <div className="h-2.5 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              </td>
              <td>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-2.5 w-16 rounded bg-gray-100" />
                </div>
              </td>
              <td>
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                  <div className="h-2.5 w-16 rounded bg-gray-100" />
                </div>
              </td>
              <td><div className="h-3 w-32 rounded bg-gray-200" /></td>
              <td>
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-2.5 w-12 rounded bg-gray-100" />
                </div>
              </td>
              <td><div className="h-6 w-6 rounded bg-gray-200 mx-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  data: PersonResult[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onAddToList: (person: PersonResult) => void;
}

export default function PeopleTable({ data, selected, onSelect, onSelectAll, onAddToList }: Props) {
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs sm:min-w-[700px] sm:text-sm [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:py-2 [&_th]:text-[11px] sm:[&_td]:px-3 sm:[&_td]:py-3 sm:[&_th]:px-3 sm:[&_th]:py-2.5 sm:[&_th]:text-xs">
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
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Name ↓</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Company</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Title</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Email</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Location</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((person) => {
            const fullName = person.full_name || `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
            const name = fullName || "—";
            const color = avatarColor(name);
            const checked = selected.has(person.id);
            const companyName = person.active_experience_company_name;
            const companyIdStr = person.active_experience_company_id != null
              ? String(person.active_experience_company_id)
              : "";
            const jobTitle = person.active_experience_title;
            const jobDepartment = person.active_experience_department;
            const city = person.location_city;
            const email = person.primary_professional_email;

            return (
              <tr
                key={person.id}
                className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${checked ? "bg-red-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(person.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600 text-red-600 focus:ring-red-400"
                  />
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white sm:h-8 sm:w-8 sm:text-xs ${color}`}>
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">{name}</p>
                      {person.linkedin_url && (
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

                <td className="px-3 py-3">
                  {companyName ? (
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white sm:h-7 sm:w-7 sm:text-xs ${avatarColor(companyName)}`}>
                        {companyName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-gray-800 sm:text-xs">{companyName}</p>
                        {companyIdStr && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                            {companyIdStr.slice(0, 2).toUpperCase()}-{companyIdStr.slice(2, 7)}{" "}
                            <span className="text-gray-300">⊙</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>

                <td className="px-3 py-3">
                  <div className="min-w-0">
                    {jobTitle ? (
                      <p className="truncate text-[11px] text-gray-700 sm:text-xs">{jobTitle}</p>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    {jobDepartment && (
                      <span className="inline-block rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 capitalize mt-0.5">
                        {jobDepartment}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-3 py-3">
                  {email ? (
                    <span className="block text-xs text-gray-800 font-medium truncate max-w-[160px]">{email}</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{flag(person.location_country)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-gray-700">
                        {person.location_country ?? "—"}
                      </p>
                      {city && (
                        <p className="truncate text-[10px] text-gray-400">
                          {city}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

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
