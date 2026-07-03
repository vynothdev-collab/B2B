"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Users, Building2, Globe, MapPin } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";

import { getListItems, getLists, type ListItemRecord, type ListRecord } from "@/lib/listsApi";
import { toast } from "@/lib/toast";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function PersonRow({ item }: { item: ListItemRecord }) {
  const d = item.data as Record<string, string>;
  const name = d.full_name || `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || "—";
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${avatarColor(name)}`}>
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
            {d.linkedin_url && (
              <a href={`https://${d.linkedin_url.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[10px] text-blue-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                <Globe className="h-2.5 w-2.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-700">{d.active_experience_title || "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-700">{d.active_experience_company_name || "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {d.primary_professional_email ? (
          <span className="font-medium text-gray-800">{d.primary_professional_email}</span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-gray-300" />
          {d.location_country || "—"}
        </div>
      </td>
    </tr>
  );
}

function CompanyRow({ item }: { item: ListItemRecord }) {
  const d = item.data as Record<string, unknown>;
  const name = (d.company_name as string) || "—";
  const country = (d.hq_country as string) || "—";
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-white text-xs font-bold ${avatarColor(name)}`}>
            {name[0]?.toUpperCase()}
          </div>
          <span className="truncate text-sm font-semibold text-gray-900">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-700 capitalize">{(d.industry as string) || "—"}</td>
      <td className="px-4 py-3 text-xs text-gray-700">{(d.employees_count as number)?.toString() || (d.size_range as string) || "—"}</td>
      <td className="px-4 py-3 text-xs">
        {d.website ? (
          <a href={`https://${(d.website as string).replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline truncate max-w-[120px] block" onClick={(e) => e.stopPropagation()}>
            {(d.website as string).replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-gray-300" />
          {country}
        </div>
      </td>
    </tr>
  );
}

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<ListRecord | null>(null);
  const [items, setItems] = useState<ListItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    Promise.all([getLists(), getListItems(id)])
      .then(([allLists, listItems]) => {
        const found = allLists.find((l) => l.id === id) ?? null;
        setList(found);
        setItems(listItems);
      })
      .catch(() => toast.error("Failed to load list"))
      .finally(() => setLoading(false));
  }, [id]);

  const isPeople = list?.list_type === "people";

  return (
    <>
      <AppHeader title={list?.name ?? "List"} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
            <button
              type="button"
              onClick={() => router.push("/search/lists")}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-400">
              {isPeople ? <Users className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{list?.name ?? "—"}</span>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {items.length} {isPeople ? "people" : "companies"}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
          )}

          {!loading && (
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[580px] text-xs sm:min-w-[640px] sm:text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-[11px] sm:[&_td]:px-4 sm:[&_td]:py-3 sm:[&_th]:px-4 sm:[&_th]:py-2.5 sm:[&_th]:text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">
                      {isPeople ? "Job title" : "Industry"}
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">
                      {isPeople ? "Company" : "Employees"}
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">
                      {isPeople ? "Email" : "Website"}
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) =>
                    item.item_type === "person" ? (
                      <PersonRow key={item.id} item={item} />
                    ) : (
                      <CompanyRow key={item.id} item={item} />
                    )
                  )}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-400">
                        No records in this list yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
