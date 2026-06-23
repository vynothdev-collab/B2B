"use client";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Building2, ListPlus, Mail, ExternalLink, Users, Globe } from "lucide-react";
import type { CompanyResult } from "@/types/search";

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
  "educational": "bg-purple-50 text-purple-600",
  "government": "bg-gray-100 text-gray-600",
  "self employed": "bg-orange-50 text-orange-600",
};

function ActionMenu() {
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

  const items = [
    { icon: <Building2 className="h-3.5 w-3.5" />, label: "View company" },
    { icon: <ExternalLink className="h-3.5 w-3.5" />, label: "Push to CRM" },
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
  data: CompanyResult[];
  selected: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
}

export default function CompanyTable({ data, selected, onSelect, onSelectAll }: Props) {
  const allSelected = data.length > 0 && data.every((r) => selected.has(r.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="w-8 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 accent-purple-600 text-purple-600 focus:ring-purple-400"
              />
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[200px]">Company ↓</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Industry</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Employees</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Website</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Location</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((company) => {
            const name = company.display_name ?? company.name ?? "—";
            const color = avatarColor(name);
            const checked = selected.has(company.id);
            const country = company.location?.country ?? "";
            const city = company.location?.locality ?? "";
            const typeKey = (company.type ?? "").toLowerCase();
            const typeBadgeClass = TYPE_COLORS[typeKey] ?? "bg-gray-100 text-gray-500";

            return (
              <tr
                key={company.id}
                className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${checked ? "bg-purple-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onSelect(company.id)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-purple-600 text-purple-600 focus:ring-purple-400"
                  />
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-white text-sm font-bold ${color}`}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 text-sm">{name}</p>
                      {company.type && (
                        <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize mt-0.5 ${typeBadgeClass}`}>
                          {company.type}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  {company.industry ? (
                    <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 capitalize">
                      {company.industry}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  {company.size ? (
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <Users className="h-3 w-3 text-gray-400 shrink-0" />
                      {SIZE_LABEL[company.size] ?? company.size}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  {company.website ? (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline max-w-[120px] truncate"
                    >
                      <Globe className="h-3 w-3 shrink-0" />
                      {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{flag(country)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-gray-700 capitalize">{country || "—"}</p>
                      {city && <p className="truncate text-[10px] text-gray-400 capitalize">{city}</p>}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <ActionMenu />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
