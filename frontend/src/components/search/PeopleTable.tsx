"use client";
import { useRef, useState } from "react";
import { MoreHorizontal, Eye, UserRound, Building2, ListPlus, Mail, Globe, Users, Loader2 } from "lucide-react";
import type { PersonResult } from "@/types/search";
import { revealPerson, type PersonRevealData } from "@/lib/searchApi";

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
  "201-500": "201–500", "501-1000": "501K", "1001-5000": "1–5K",
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

function ActionMenu({ id }: { id: string }) {
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

  const items = [
    { icon: <UserRound className="h-3.5 w-3.5" />, label: "View profile" },
    { icon: <Building2 className="h-3.5 w-3.5" />, label: "Push to CRM" },
    { icon: <ListPlus className="h-3.5 w-3.5" />, label: "Add to list" },
    { icon: <Mail className="h-3.5 w-3.5" />, label: "Send email" },
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
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setOpen(false)}
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

interface Props {
  data: PersonResult[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
}

export default function PeopleTable({ data, selected, onSelect, onSelectAll }: Props) {
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const [revealed, setRevealed] = useState<Record<string, PersonRevealData>>({});
  const [revealing, setRevealing] = useState<Set<string>>(new Set());

  const handleReveal = async (id: string) => {
    if (revealed[id] || revealing.has(id)) return;
    setRevealing((prev) => new Set(prev).add(id));
    try {
      const data = await revealPerson(id);
      setRevealed((prev) => ({ ...prev, [id]: data }));
    } catch {
      setRevealed((prev) => ({ ...prev, [id]: {} }));
    } finally {
      setRevealing((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-8 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
              />
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Name ↓</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Company</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Title</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Email</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Phone</th>
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

            return (
              <tr
                key={person.id}
                className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${checked ? "bg-purple-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(person.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                  />
                </td>

                {/* Name */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${color}`}>
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 text-sm">{name}</p>
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

                {/* Company */}
                <td className="px-3 py-3">
                  {person.job_company_name ? (
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-white text-xs font-bold ${avatarColor(person.job_company_name)}`}>
                        {person.job_company_name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">{person.job_company_name}</p>
                        {person.job_company_id && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                            {person.job_company_id.slice(0, 2).toUpperCase()}-{person.job_company_id.slice(2, 7)}{" "}
                            <span className="text-gray-300">⊙</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>

                {/* Title */}
                <td className="px-3 py-3">
                  <div className="min-w-0">
                    {person.job_title ? (
                      <p className="truncate text-xs text-gray-700">{person.job_title}</p>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    {person.job_title_role && (
                      <span className="inline-block rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 capitalize mt-0.5">
                        {person.job_title_role}
                      </span>
                    )}
                  </div>
                </td>

                {/* Email */}
                <td className="px-3 py-3">
                  {revealed[person.id] ? (
                    revealed[person.id].work_email || revealed[person.id].recommended_personal_email ? (
                      <span className="block text-xs text-gray-800 font-medium truncate max-w-[160px]">
                        {revealed[person.id].work_email ?? revealed[person.id].recommended_personal_email}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not found</span>
                    )
                  ) : person.work_email !== false ? (
                    <button
                      type="button"
                      onClick={() => handleReveal(person.id)}
                      disabled={revealing.has(person.id)}
                      className="flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-60"
                    >
                      {revealing.has(person.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                      Reveal
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-300 cursor-not-allowed select-none">
                      <Eye className="h-3 w-3" />
                      Reveal
                    </span>
                  )}
                </td>

                {/* Phone */}
                <td className="px-3 py-3">
                  {revealed[person.id] ? (
                    revealed[person.id].mobile_phone || revealed[person.id].phone_numbers?.length ? (
                      <span className="block text-xs text-gray-800 font-medium truncate max-w-[140px]">
                        {revealed[person.id].mobile_phone ?? revealed[person.id].phone_numbers![0]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not found</span>
                    )
                  ) : person.mobile_phone !== false ? (
                    <button
                      type="button"
                      onClick={() => handleReveal(person.id)}
                      disabled={revealing.has(person.id)}
                      className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      {revealing.has(person.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                      Reveal
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-300 cursor-not-allowed select-none">
                      <Eye className="h-3 w-3" />
                      Reveal
                    </span>
                  )}
                </td>

                {/* Location */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{flag(person.location_country)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-gray-700">
                        {person.location_country ?? "—"}
                      </p>
                      {typeof person.location_locality === "string" && (
                        <p className="truncate text-[10px] text-gray-400">
                          {person.location_locality}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <ActionMenu id={person.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
