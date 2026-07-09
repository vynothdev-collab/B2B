"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRightLeft, Building2, Check, ExternalLink, Globe,
  Loader2, MoreHorizontal, Settings, Trash2, Users,
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import ColumnSettingsPanel from "@/components/search/ColumnSettingsPanel";
import { addToList, getListItems, getLists, removeListItem, type ListItemRecord, type ListRecord } from "@/lib/listsApi";
import { useColumnSettings, COMPANY_COLUMNS, PEOPLE_COLUMNS } from "@/hooks/useColumnSettings";
import { toast } from "@/lib/toast";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
  "bg-teal-500", "bg-cyan-500",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Avatar({ name, pictureUrl }: { name: string; pictureUrl?: string }) {
  const [imgError, setImgError] = useState(false);
  if (pictureUrl && !imgError) {
    return (
      <img
        src={pictureUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(name)}`}>
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

const SIZE_LABEL: Record<string, string> = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1K", "1001-5000": "1–5K",
  "5001-10000": "5–10K", "10001+": "10K+",
};

function normalizeSizeRange(raw: string): string {
  const cleaned = raw.replace(/\s*employees?/gi, "").replace(/,/g, "").trim();
  const lc = cleaned.toLowerCase();
  if (lc === "myself only" || lc === "self employed" || lc === "1") return "Solo";
  if (lc === "0" || lc === "") return "—";
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

function Dash() {
  return <span className="text-gray-400">—</span>;
}
function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${Math.round(n / 1_000)}K`;
}
function toArr(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

const TH = "border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600";

function Cell({ children, className = "", overflowVisible = false }: { children: React.ReactNode; className?: string; overflowVisible?: boolean }) {
  return (
    <td className={`px-4 py-0 align-middle ${className}`}>
      <div className={`flex h-[64px] items-center ${overflowVisible ? "overflow-visible" : "overflow-hidden"}`}>{children}</div>
    </td>
  );
}

function ActionMenu({
  removing,
  onRemove,
  onMoveToList,
}: {
  removing: boolean;
  onRemove: () => void;
  onMoveToList: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.closest("[data-action-menu]")?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  return (
    <div data-action-menu="">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        disabled={removing}
        title="Actions"
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all disabled:opacity-50"
      >
        {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
      </button>
      {open && createPortal(
        <div
          style={{ position: "fixed", top: dropPos.top, right: dropPos.right }}
          className="z-[9999] w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-xl"
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onMoveToList(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400" />
            Move to another list
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => { setOpen(false); onRemove(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove from list
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

function MoveToListModal({
  open,
  availableLists,
  movingToList,
  onClose,
  onMove,
}: {
  open: boolean;
  availableLists: ListRecord[];
  movingToList: string | null;
  onClose: () => void;
  onMove: (targetListId: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-gray-900">Move to another list</p>
          <p className="text-xs text-gray-500 mt-0.5">Select a destination list</p>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {availableLists.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-gray-500">No other lists available.</p>
          )}
          {availableLists.map((lst) => (
            <button
              key={lst.id}
              type="button"
              disabled={movingToList === lst.id}
              onClick={() => onMove(lst.id)}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <span className="truncate font-medium">{lst.name}</span>
              <span className="shrink-0 text-gray-400">{lst.record_count} items</span>
              {movingToList === lst.id && <Check className="h-3.5 w-3.5 shrink-0 text-red-500" />}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Company table
// ---------------------------------------------------------------------------

function CompanyListTable({
  items,
  visibleColumns,
  onRemove,
  onMoveToList,
  removing,
}: {
  items: ListItemRecord[];
  visibleColumns: Record<string, boolean>;
  onRemove: (id: string) => void;
  onMoveToList: (item: ListItemRecord) => void;
  removing: string | null;
}) {
  const isCol = (key: string) => visibleColumns[key] !== false;

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[580px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-gray-50">
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
            <th className={TH}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const d = item.data as Record<string, unknown>;
            const name = (d.company_name as string) ?? "—";
            const color = avatarColor(name);
            const country = (d.hq_country as string) ?? "";
            const city = (d.hq_city as string) ?? "";
            const typeLabel = d.is_public === true ? "public" : d.is_public === false ? "private" : ((d.type as string) ?? "");
            const typeKey = typeLabel.toLowerCase();
            const typeBadgeClass = TYPE_COLORS[typeKey] ?? "bg-gray-100 text-gray-500";
            const statusKey = ((d.company_status as string) ?? "").toLowerCase();
            const statusBadgeClass = STATUS_COLORS[statusKey] ?? "bg-gray-100 text-gray-500";
            const keywords = toArr(d.categories_and_keywords);
            const awards = toArr(d.awards_certifications);
            const empChange = d.employees_count_change as Record<string, number> | null;
            const visitChange = d.total_website_visits_change as Record<string, number> | null;
            const revenue = d.revenue_annual_range as Record<string, unknown> | null;
            const funding = d.last_funding_round as Record<string, unknown> | null;
            const techs = (d.technologies_used as unknown[]) ?? [];
            const founded = (d.founded ?? d.founded_year) as string | number | undefined;

            return (
              <tr key={item.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/70 group">
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

                {isCol("industry") && (
                  <Cell>
                    {d.industry ? (
                      <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {d.industry as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("employees") && (
                  <Cell>
                    {(() => {
                      const raw = d.size_range as string | undefined;
                      const count = d.employees_count as number | undefined;
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

                {isCol("website") && (
                  <Cell>
                    {d.website ? (
                      <a
                        href={(d.website as string).startsWith("http") ? (d.website as string) : `https://${d.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 max-w-[120px] truncate text-[13px] text-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        {(d.website as string).replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    ) : <Dash />}
                  </Cell>
                )}

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

                {isCol("type") && (
                  <Cell>
                    {typeLabel ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${typeBadgeClass}`}>
                        {typeLabel}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_status") && (
                  <Cell>
                    {d.company_status ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${statusBadgeClass}`}>
                        {d.company_status as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("founded") && (
                  <Cell>
                    {founded ? <span className="text-[13px] text-gray-800">{String(founded)}</span> : <Dash />}
                  </Cell>
                )}

                {isCol("legal_name") && (
                  <Cell>
                    {d.company_legal_name ? (
                      <span className="block max-w-[160px] truncate text-[13px] text-gray-800">{d.company_legal_name as string}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_country") && (
                  <Cell>
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{flag(country)}</span>
                      <span className="text-[13px] capitalize text-gray-700">{country || "—"}</span>
                    </div>
                  </Cell>
                )}

                {isCol("co_city") && (
                  <Cell><span className="text-[13px] capitalize text-gray-700">{city || "—"}</span></Cell>
                )}

                {isCol("state") && (
                  <Cell><span className="text-[13px] text-gray-800">{(d.hq_state as string) ?? "—"}</span></Cell>
                )}

                {isCol("co_address") && (
                  <Cell>
                    {d.hq_location ? (
                      <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={d.hq_location as string}>
                        {d.hq_location as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_keywords") && (
                  <Cell>
                    {keywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {keywords.slice(0, 2).map((k, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{k}</span>
                        ))}
                        {keywords.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{keywords.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("products_services") && (
                  <Cell>
                    {keywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {keywords.slice(0, 2).map((k, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700">{k}</span>
                        ))}
                        {keywords.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{keywords.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("awards_certs") && (
                  <Cell>
                    {awards.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {awards.slice(0, 2).map((a, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">{a}</span>
                        ))}
                        {awards.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{awards.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("growth") && (
                  <Cell>
                    {empChange?.change_yearly_percentage != null ? (
                      <span className={`text-[13px] font-medium ${empChange.change_yearly_percentage >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {empChange.change_yearly_percentage >= 0 ? "+" : ""}{empChange.change_yearly_percentage.toFixed(1)}%
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("web_traffic") && (
                  <Cell>
                    {d.total_website_visits_monthly != null ? (
                      <span className="text-[13px] text-gray-800">
                        {(d.total_website_visits_monthly as number) >= 1_000_000
                          ? `${((d.total_website_visits_monthly as number) / 1_000_000).toFixed(1)}M`
                          : (d.total_website_visits_monthly as number) >= 1_000
                            ? `${Math.round((d.total_website_visits_monthly as number) / 1_000)}K`
                            : String(d.total_website_visits_monthly)}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("traffic_growth") && (
                  <Cell>
                    {visitChange?.change_yearly_percentage != null ? (
                      <span className={`text-[13px] font-medium ${visitChange.change_yearly_percentage >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {visitChange.change_yearly_percentage >= 0 ? "+" : ""}{visitChange.change_yearly_percentage.toFixed(1)}%
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("revenue") && (
                  <Cell>
                    {(() => {
                      if (!revenue) return <Dash />;
                      const src = (revenue["source_4_annual_revenue_range"] ?? revenue["source_6_annual_revenue_range"]) as Record<string, number> | undefined;
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

                {isCol("funding") && (
                  <Cell>
                    {funding ? (
                      <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
                        {funding.type != null && (
                          <span className="shrink-0 inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 whitespace-nowrap">
                            {String(funding.type)}
                          </span>
                        )}
                        {funding.amount_raised != null && (
                          <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">{fmtMoney(funding.amount_raised as number)}</span>
                        )}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("rating") && (
                  <Cell>
                    {d.company_employee_reviews_aggregate_score != null ? (
                      <span className="text-[13px] text-gray-800">★ {(d.company_employee_reviews_aggregate_score as number).toFixed(1)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("open_jobs") && (
                  <Cell>
                    {d.active_job_postings != null ? (
                      <span className="text-[13px] text-gray-800">
                        {Array.isArray(d.active_job_postings) ? d.active_job_postings.length : "—"}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("technologies") && (
                  <Cell>
                    {techs.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {techs.slice(0, 2).map((t, i) => {
                          const label = typeof t === "string" ? t : ((t as Record<string, string>)?.technology ?? "");
                          return label ? (
                            <span key={i} className="shrink-0 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{label}</span>
                          ) : null;
                        })}
                        {techs.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{techs.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("linkedin") && (
                  <Cell>
                    {d.canonical_linkedin_url ? (
                      <a
                        href={`https://${(d.canonical_linkedin_url as string).replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-3 w-3 shrink-0" />LinkedIn
                      </a>
                    ) : <Dash />}
                  </Cell>
                )}

                <Cell overflowVisible>
                  <ActionMenu
                    removing={removing === item.id}
                    onRemove={() => onRemove(item.id)}
                    onMoveToList={() => onMoveToList(item)}
                  />
                </Cell>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={99} className="px-4 py-16 text-center text-[13px] text-gray-400">No records in this list yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// People table
// ---------------------------------------------------------------------------

function PeopleListTable({
  items,
  visibleColumns,
  onRemove,
  onMoveToList,
  removing,
}: {
  items: ListItemRecord[];
  visibleColumns: Record<string, boolean>;
  onRemove: (id: string) => void;
  onMoveToList: (item: ListItemRecord) => void;
  removing: string | null;
}) {
  const isCol = (key: string) => visibleColumns[key] !== false;

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[580px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className={`${TH} min-w-[200px]`}>Name</th>
            {isCol("company")           && <th className={`${TH} min-w-[160px]`}>Company</th>}
            {isCol("title")             && <th className={`${TH} min-w-[140px]`}>Title</th>}
            {isCol("email")             && <th className={`${TH} min-w-[160px]`}>Email</th>}
            {isCol("location")          && <th className={`${TH} min-w-[120px]`}>Location</th>}
            {isCol("mobile")            && <th className={`${TH} min-w-[120px]`}>Mobile</th>}
            {isCol("person_country")    && <th className={`${TH} min-w-[100px]`}>Country</th>}
            {isCol("person_city")       && <th className={`${TH} min-w-[100px]`}>City</th>}
            {isCol("state")             && <th className={`${TH} min-w-[100px]`}>State</th>}
            {isCol("department")        && <th className={`${TH} min-w-[110px]`}>Department</th>}
            {isCol("seniority")         && <th className={`${TH} min-w-[100px]`}>Seniority</th>}
            {isCol("job_started")       && <th className={`${TH} min-w-[90px]`}>Job Started</th>}
            {isCol("time_in_role")      && <th className={`${TH} min-w-[90px]`}>Time in Role</th>}
            {isCol("exp_years")         && <th className={`${TH} min-w-[80px]`}>Exp (yrs)</th>}
            {isCol("headline")          && <th className={`${TH} min-w-[160px]`}>Headline</th>}
            {isCol("skills")            && <th className={`${TH} min-w-[140px]`}>Skills</th>}
            {isCol("awards_certs")      && <th className={`${TH} min-w-[140px]`}>Awards & Certs</th>}
            {isCol("connections")       && <th className={`${TH} min-w-[80px]`}>Connections</th>}
            {isCol("followers")         && <th className={`${TH} min-w-[80px]`}>Followers</th>}
            {isCol("salary")            && <th className={`${TH} min-w-[90px]`}>Est. Salary</th>}
            {isCol("linkedin")          && <th className={`${TH} min-w-[80px]`}>LinkedIn</th>}
            {isCol("co_industry")       && <th className={`${TH} min-w-[120px]`}>Co. Industry</th>}
            {isCol("co_employees")      && <th className={`${TH} min-w-[90px]`}>Co. Employees</th>}
            {isCol("co_type")           && <th className={`${TH} min-w-[100px]`}>Co. Type</th>}
            {isCol("co_status")         && <th className={`${TH} min-w-[80px]`}>Co. Status</th>}
            {isCol("co_founded")        && <th className={`${TH} min-w-[70px]`}>Co. Founded</th>}
            {isCol("co_country")        && <th className={`${TH} min-w-[100px]`}>Co. Country</th>}
            {isCol("co_city")           && <th className={`${TH} min-w-[100px]`}>Co. City</th>}
            {isCol("co_state")          && <th className={`${TH} min-w-[100px]`}>Co. State</th>}
            {isCol("co_address")        && <th className={`${TH} min-w-[140px]`}>Co. Address</th>}
            {isCol("co_keywords")       && <th className={`${TH} min-w-[140px]`}>Co. Keywords</th>}
            {isCol("products_services") && <th className={`${TH} min-w-[140px]`}>Products & Services</th>}
            {isCol("co_revenue")        && <th className={`${TH} min-w-[100px]`}>Revenue</th>}
            <th className={TH}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const d = item.data as Record<string, unknown>;
            const name = (d.full_name as string) || `${(d.first_name as string) ?? ""} ${(d.last_name as string) ?? ""}`.trim() || "—";
            const color = avatarColor(name);
            const email = (d.email as string) ?? (d.primary_professional_email as string) ?? "";
            const country = (d.location_country as string) ?? "";
            const city = (d.location_city as string) ?? "";
            const skills = toArr(d.inferred_skills);
            const awards = toArr(d.awards_certifications);
            const coKeywords = toArr(d.active_experience_company_categories_and_keywords);
            const expMonths = d.total_experience_duration_months as number | undefined;
            const coTypeLabel = d.active_experience_company_type as string | undefined;
            const coStatusLabel = d.active_experience_company_status as string | undefined;
            const coTypeClass = TYPE_COLORS[(coTypeLabel ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-500";
            const coStatusClass = STATUS_COLORS[(coStatusLabel ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-500";

            return (
              <tr key={item.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/70 group">
                {/* Name — always visible */}
                <Cell className="max-w-[220px]">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Avatar name={name} pictureUrl={d.picture_url as string | undefined} />
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-[13px] font-semibold text-gray-900" title={name}>{name}</p>
                      {!isCol("linkedin") && d.linkedin_url != null && (
                        <a
                          href={`https://${(d.linkedin_url as string).replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-xs text-blue-500 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-2.5 w-2.5" />LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </Cell>

                {isCol("company") && (
                  <Cell>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-gray-800">
                        {(d.active_experience_company_name as string) ?? "—"}
                      </p>
                      {d.active_experience_company_website != null && (
                        <a
                          href={`https://${(d.active_experience_company_website as string).replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-xs text-blue-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {(d.active_experience_company_website as string).replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      )}
                    </div>
                  </Cell>
                )}

                {isCol("title") && (
                  <Cell>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-gray-800">{(d.active_experience_title as string) ?? "—"}</p>
                      {!isCol("headline") && d.headline != null && (
                        <p className="truncate text-xs text-gray-500" title={d.headline as string}>{d.headline as string}</p>
                      )}
                    </div>
                  </Cell>
                )}

                {isCol("email") && (
                  <Cell>
                    {email ? (
                      <span className="text-[13px] font-medium text-gray-800">{email}</span>
                    ) : <Dash />}
                  </Cell>
                )}

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

                {isCol("mobile") && (
                  <Cell>
                    {d.mobile_phone ? (
                      <span className="text-[13px] text-gray-800">{d.mobile_phone as string}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("person_country") && (
                  <Cell>
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{flag(country)}</span>
                      <span className="text-[13px] capitalize text-gray-700">{country || "—"}</span>
                    </div>
                  </Cell>
                )}

                {isCol("person_city") && (
                  <Cell><span className="text-[13px] capitalize text-gray-700">{city || "—"}</span></Cell>
                )}

                {isCol("state") && (
                  <Cell><span className="text-[13px] text-gray-800">{(d.location_state as string) ?? "—"}</span></Cell>
                )}

                {isCol("department") && (
                  <Cell>
                    {d.active_experience_department ? (
                      <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {d.active_experience_department as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("seniority") && (
                  <Cell>
                    {d.active_experience_management_level ? (
                      <span className="inline-block rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                        {d.active_experience_management_level as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("job_started") && (
                  <Cell>
                    {d.active_experience_start_date ? (
                      <span className="text-[13px] text-gray-800">{(d.active_experience_start_date as string).slice(0, 7)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("time_in_role") && (
                  <Cell>
                    {d.active_experience_start_date ? (() => {
                      const months = Math.floor((Date.now() - new Date(d.active_experience_start_date as string).getTime()) / (1000 * 60 * 60 * 24 * 30.4));
                      return <span className="text-[13px] text-gray-800">{months < 12 ? `${months}m` : `${Math.floor(months / 12)}y ${months % 12}m`}</span>;
                    })() : <Dash />}
                  </Cell>
                )}

                {isCol("exp_years") && (
                  <Cell>
                    {expMonths != null ? (
                      <span className="text-[13px] text-gray-800">{(expMonths / 12).toFixed(1)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("headline") && (
                  <Cell>
                    {d.headline ? (
                      <span className="block max-w-[180px] truncate text-[13px] text-gray-600" title={d.headline as string}>
                        {d.headline as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("skills") && (
                  <Cell>
                    {skills.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {skills.slice(0, 2).map((s, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">{s}</span>
                        ))}
                        {skills.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{skills.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("awards_certs") && (
                  <Cell>
                    {awards.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {awards.slice(0, 2).map((a, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">{a}</span>
                        ))}
                        {awards.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{awards.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("connections") && (
                  <Cell>
                    {d.connections_count != null ? (
                      <span className="text-[13px] text-gray-800">{String(d.connections_count)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("followers") && (
                  <Cell>
                    {d.followers_count != null ? (
                      <span className="text-[13px] text-gray-800">{String(d.followers_count)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("salary") && (
                  <Cell>
                    {d.projected_base_salary_median != null ? (
                      <span className="text-[13px] text-gray-800">
                        {fmtMoney(d.projected_base_salary_median as number)}
                        {d.projected_base_salary_currency ? ` ${d.projected_base_salary_currency}` : ""}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("linkedin") && (
                  <Cell>
                    {d.linkedin_url ? (
                      <a
                        href={`https://${(d.linkedin_url as string).replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-3 w-3 shrink-0" />LinkedIn
                      </a>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_industry") && (
                  <Cell>
                    {d.active_experience_company_industry ? (
                      <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {d.active_experience_company_industry as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_employees") && (
                  <Cell>
                    {d.active_experience_company_employees_count != null || d.active_experience_company_size ? (
                      <div className="flex items-center gap-1 text-[13px] text-gray-800">
                        <Users className="h-3 w-3 shrink-0 text-gray-400" />
                        {d.active_experience_company_size
                          ? (SIZE_LABEL[d.active_experience_company_size as string] ?? d.active_experience_company_size as string)
                          : String(d.active_experience_company_employees_count)}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_type") && (
                  <Cell>
                    {coTypeLabel ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${coTypeClass}`}>
                        {coTypeLabel}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_status") && (
                  <Cell>
                    {coStatusLabel ? (
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${coStatusClass}`}>
                        {coStatusLabel}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_founded") && (
                  <Cell>
                    {d.active_experience_company_founded != null ? (
                      <span className="text-[13px] text-gray-800">{String(d.active_experience_company_founded)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_country") && (
                  <Cell>
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{flag((d.active_experience_company_hq_country as string) ?? "")}</span>
                      <span className="text-[13px] capitalize text-gray-700">{(d.active_experience_company_hq_country as string) ?? "—"}</span>
                    </div>
                  </Cell>
                )}

                {isCol("co_city") && (
                  <Cell><span className="text-[13px] capitalize text-gray-700">{(d.active_experience_company_hq_city as string) ?? "—"}</span></Cell>
                )}

                {isCol("co_state") && (
                  <Cell><span className="text-[13px] text-gray-800">{(d.active_experience_company_hq_region as string) ?? "—"}</span></Cell>
                )}

                {isCol("co_address") && (
                  <Cell>
                    {d.active_experience_company_hq_location ? (
                      <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={d.active_experience_company_hq_location as string}>
                        {d.active_experience_company_hq_location as string}
                      </span>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_keywords") && (
                  <Cell>
                    {coKeywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {coKeywords.slice(0, 2).map((k, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{k}</span>
                        ))}
                        {coKeywords.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{coKeywords.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("products_services") && (
                  <Cell>
                    {coKeywords.length > 0 ? (
                      <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
                        {coKeywords.slice(0, 2).map((k, i) => (
                          <span key={i} className="shrink-0 inline-block rounded bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700">{k}</span>
                        ))}
                        {coKeywords.length > 2 && <span className="shrink-0 text-xs text-gray-500">+{coKeywords.length - 2}</span>}
                      </div>
                    ) : <Dash />}
                  </Cell>
                )}

                {isCol("co_revenue") && (
                  <Cell>
                    {d.active_experience_company_annual_revenue != null ? (
                      <span className="text-[13px] text-gray-800">{fmtMoney(d.active_experience_company_annual_revenue as number)}</span>
                    ) : <Dash />}
                  </Cell>
                )}

                <Cell overflowVisible>
                  <ActionMenu
                    removing={removing === item.id}
                    onRemove={() => onRemove(item.id)}
                    onMoveToList={() => onMoveToList(item)}
                  />
                </Cell>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={99} className="px-4 py-16 text-center text-[13px] text-gray-400">No records in this list yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<ListRecord | null>(null);
  const [items, setItems] = useState<ListItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [colSettingsOpen, setColSettingsOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<ListItemRecord | null>(null);
  const [availableLists, setAvailableLists] = useState<ListRecord[]>([]);
  const [movingToList, setMovingToList] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const isPeople = list?.list_type === "people";

  const {
    visible: visibleColumns,
    toggle,
    reset,
    cols,
  } = useColumnSettings(
    isPeople ? "b2b:col:list:people" : "b2b:col:list:companies",
    isPeople ? PEOPLE_COLUMNS : COMPANY_COLUMNS,
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    Promise.all([getLists(), getListItems(id)])
      .then(([allLists, listItems]) => {
        setList(allLists.find((l) => l.id === id) ?? null);
        setItems(listItems);
      })
      .catch(() => toast.error("Failed to load list"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRemove(itemId: string) {
    setRemoving(itemId);
    try {
      await removeListItem(id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Removed from list");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  }

  async function handleOpenMoveToList(item: ListItemRecord) {
    setMoveItem(item);
    try {
      const allLists = await getLists();
      const listType = item.item_type === "person" ? "people" : "companies";
      setAvailableLists(allLists.filter((l) => l.id !== id && l.list_type === listType));
    } catch {
      toast.error("Failed to load lists");
    }
  }

  async function handleMoveToList(targetListId: string) {
    if (!moveItem) return;
    setMovingToList(targetListId);
    try {
      await addToList({
        list_id: targetListId,
        items: [{ record_id: moveItem.record_id, item_type: moveItem.item_type, data: moveItem.data }],
      });
      await removeListItem(id, moveItem.id);
      setItems((prev) => prev.filter((i) => i.id !== moveItem.id));
      toast.success("Moved to list");
      setMoveItem(null);
    } catch {
      toast.error("Failed to move item");
    } finally {
      setMovingToList(null);
    }
  }

  return (
    <>
      <AppHeader title={list?.name ?? "List"} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">

          {/* Toolbar */}
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-100 px-3 py-2.5 sm:px-4">
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
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-900">{list?.name ?? "—"}</span>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {items.length} {isPeople ? "people" : "companies"}
              </span>
            )}
            <button
              type="button"
              onClick={() => setColSettingsOpen(true)}
              title="Column settings"
              className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex-1 overflow-auto animate-pulse">
              <table className="w-full min-w-[580px] border-separate border-spacing-0 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {["Name / Company", "Industry / Title", "Employees / Company", "Website / Email", "Location", "Actions"].map((h, i) => (
                      <th key={i} className={TH}><div className="h-3 w-16 rounded bg-gray-200" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-28 rounded bg-gray-200" />
                            <div className="h-2.5 w-14 rounded bg-gray-100" />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><div className="h-3 w-24 rounded bg-gray-200" /></td>
                      <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>
                      <td className="px-3 py-2.5"><div className="h-3 w-28 rounded bg-gray-200" /></td>
                      <td className="px-3 py-2.5"><div className="h-3 w-20 rounded bg-gray-200" /></td>
                      <td className="px-3 py-2.5"><div className="h-5 w-5 rounded bg-gray-200" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : isPeople ? (
            <div className="flex-1 overflow-auto">
              <PeopleListTable
                items={items}
                visibleColumns={visibleColumns}
                onRemove={handleRemove}
                onMoveToList={handleOpenMoveToList}
                removing={removing}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <CompanyListTable
                items={items}
                visibleColumns={visibleColumns}
                onRemove={handleRemove}
                onMoveToList={handleOpenMoveToList}
                removing={removing}
              />
            </div>
          )}
        </div>
      </div>

      <ColumnSettingsPanel
        open={colSettingsOpen}
        onClose={() => setColSettingsOpen(false)}
        cols={cols}
        visible={visibleColumns}
        onToggle={toggle}
        onReset={reset}
      />

      <MoveToListModal
        open={moveItem !== null}
        availableLists={availableLists}
        movingToList={movingToList}
        onClose={() => setMoveItem(null)}
        onMove={handleMoveToList}
      />
    </>
  );
}
