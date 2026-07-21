"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRightLeft, Building2, Check, Globe,
  Loader2, MoreHorizontal, Trash2, Users, X,
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import ColumnSettingsPanel from "@/components/search/ColumnSettingsPanel";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import {
  Avatar,
  ChipList,
  CompanyLogo,
  Dash,
  fmtDate,
  fmtDuration,
  fmtMoney,
  SIZE_LABEL,
  STATUS_COLORS,
  normalizeSizeRange,
  toStringArr,
  TYPE_COLORS,
} from "@/components/common/tableHelpers";
import { addToList, getListItems, getLists, removeListItem, type ListItemRecord, type ListRecord } from "@/lib/listsApi";
import { useColumnSettings, COMPANY_COLUMNS, PEOPLE_COLUMNS } from "@/hooks/useColumnSettings";
import { toast } from "@/lib/toast";

// ---------------------------------------------------------------------------
// ActionMenu / MoveToListModal
// ---------------------------------------------------------------------------

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
// Company columns
// ---------------------------------------------------------------------------

function buildCompanyListColumns(visibleColumns: Record<string, boolean>): DataTableColumn<ListItemRecord>[] {
  const isCol = (key: string) => visibleColumns[key] !== false;

  const rawCols: DataTableColumn<ListItemRecord>[] = [
    {
      key: "company",
      label: "Company",
      minWidth: 200,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const name = (d.company_name as string) ?? "—";
        const typeLabel = d.is_public === true ? "public" : d.is_public === false ? "private" : ((d.type as string) ?? "");
        const typeBadgeClass = TYPE_COLORS[typeLabel.toLowerCase()] ?? "bg-gray-100 text-gray-500";
        return (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <CompanyLogo
              name={name}
              logoUrl={d.logo_url as string | undefined}
              website={d.website as string | undefined}
            />
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-[13px] font-semibold text-gray-900" title={name}>{name}</p>
              {!isCol("type") && typeLabel && (
                <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize ${typeBadgeClass}`}>
                  {typeLabel}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "industry",
      label: "Industry",
      minWidth: 140,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.industry ? (
          <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
            {d.industry as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "employees",
      label: "Employees",
      minWidth: 90,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
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
      },
    },
    {
      key: "website",
      label: "Website",
      minWidth: 150,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.website ? (
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
        ) : <Dash />;
      },
    },
    {
      key: "location",
      label: "Location",
      minWidth: 120,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const country = (d.hq_country as string) ?? "";
        const city = (d.hq_city as string) ?? "";
        return (
          <div className="min-w-0">
              <p className="truncate text-[13px] capitalize text-gray-700">{country || "—"}</p>
              {city && <p className="truncate text-xs capitalize text-gray-400">{city}</p>}
            </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const typeLabel = d.is_public === true ? "public" : d.is_public === false ? "private" : ((d.type as string) ?? "");
        const typeBadgeClass = TYPE_COLORS[typeLabel.toLowerCase()] ?? "bg-gray-100 text-gray-500";
        return typeLabel ? (
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${typeBadgeClass}`}>
            {typeLabel}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "co_status",
      label: "Status",
      minWidth: 80,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const statusBadgeClass = STATUS_COLORS[((d.company_status as string) ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-500";
        return d.company_status ? (
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${statusBadgeClass}`}>
            {d.company_status as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "founded",
      label: "Founded",
      minWidth: 70,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const founded = (d.founded ?? d.founded_year) as string | number | undefined;
        return founded ? <span className="text-[13px] text-gray-800">{String(founded)}</span> : <Dash />;
      },
    },
    {
      key: "legal_name",
      label: "Legal Name",
      minWidth: 140,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.company_legal_name ? (
          <span className="block max-w-[160px] truncate text-[13px] text-gray-800">{d.company_legal_name as string}</span>
        ) : <Dash />;
      },
    },
    {
      key: "co_country",
      label: "Country",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const country = (d.hq_country as string) ?? "";
        return (
          <span className="text-[13px] capitalize text-gray-700">{country || "—"}</span>
        );
      },
    },
    {
      key: "co_city",
      label: "City",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const city = (d.hq_city as string) ?? "";
        return <span className="text-[13px] capitalize text-gray-700">{city || "—"}</span>;
      },
    },
    {
      key: "state",
      label: "State",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <span className="text-[13px] text-gray-800">{(d.hq_state as string) ?? "—"}</span>;
      },
    },
    {
      key: "co_address",
      label: "Address",
      minWidth: 140,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.hq_location ? (
          <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={d.hq_location as string}>
            {d.hq_location as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "co_keywords",
      label: "Keywords",
      minWidth: 160,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.categories_and_keywords as string | string[] | undefined)} />;
      },
    },
    {
      key: "products_services",
      label: "Products & Services",
      minWidth: 170,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.categories_and_keywords as string | string[] | undefined)} />;
      },
    },
    {
      key: "awards_certs",
      label: "Awards & Certs",
      minWidth: 155,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.awards_certifications as string | string[] | undefined)} />;
      },
    },
    {
      key: "growth",
      label: "HC Growth",
      minWidth: 80,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const empChange = d.employees_count_change as Record<string, number> | null;
        return empChange?.change_yearly_percentage != null ? (
          <span className="text-[13px] font-medium text-gray-800">
            {empChange.change_yearly_percentage >= 0 ? "+" : ""}{empChange.change_yearly_percentage.toFixed(1)}%
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "web_traffic",
      label: "Web Traffic",
      minWidth: 90,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.total_website_visits_monthly != null ? (
          <span className="text-[13px] text-gray-800">
            {(d.total_website_visits_monthly as number) >= 1_000_000
              ? `${((d.total_website_visits_monthly as number) / 1_000_000).toFixed(1)}M`
              : (d.total_website_visits_monthly as number) >= 1_000
                ? `${Math.round((d.total_website_visits_monthly as number) / 1_000)}K`
                : String(d.total_website_visits_monthly)}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "traffic_growth",
      label: "Traffic Growth",
      minWidth: 90,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const visitChange = d.total_website_visits_change as Record<string, number> | null;
        return visitChange?.change_yearly_percentage != null ? (
          <span className="text-[13px] font-medium text-gray-800">
            {visitChange.change_yearly_percentage >= 0 ? "+" : ""}{visitChange.change_yearly_percentage.toFixed(1)}%
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "revenue",
      label: "Revenue",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const revenue = d.revenue_annual_range as Record<string, unknown> | null;
        if (!revenue) return <Dash />;
        const src = (revenue["source_4_annual_revenue_range"] ?? revenue["source_6_annual_revenue_range"]) as Record<string, number> | undefined;
        if (!src) return <Dash />;
        const lo = src.annual_revenue_range_from;
        const hi = src.annual_revenue_range_to;
        if (lo != null && hi != null) return <span className="text-[13px] text-gray-800 whitespace-nowrap">{fmtMoney(lo)} – {fmtMoney(hi)}</span>;
        if (lo != null) return <span className="text-[13px] text-gray-800">&gt;{fmtMoney(lo)}</span>;
        if (hi != null) return <span className="text-[13px] text-gray-800">&lt;{fmtMoney(hi)}</span>;
        return <Dash />;
      },
    },
    {
      key: "funding",
      label: "Last Funding",
      minWidth: 120,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const funding = d.last_funding_round as Record<string, unknown> | null;
        return funding ? (
          <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
            {funding.type != null && (
              <span className="shrink-0 inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 whitespace-nowrap">
                {String(funding.type)}
              </span>
            )}
            {funding.amount_raised != null && (
              <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">{fmtMoney(funding.amount_raised as number)}</span>
            )}
          </div>
        ) : <Dash />;
      },
    },
    {
      key: "rating",
      label: "Rating",
      minWidth: 70,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.company_employee_reviews_aggregate_score != null ? (
          <span className="text-[13px] text-gray-800">★ {(d.company_employee_reviews_aggregate_score as number).toFixed(1)}</span>
        ) : <Dash />;
      },
    },
    {
      key: "open_jobs",
      label: "Open Jobs",
      minWidth: 70,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_job_postings != null ? (
          <span className="text-[13px] text-gray-800">
            {Array.isArray(d.active_job_postings) ? d.active_job_postings.length : "—"}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "technologies",
      label: "Technologies",
      minWidth: 160,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const techs = ((d.technologies_used as unknown[]) ?? [])
          .map((t) => typeof t === "string" ? t : ((t as Record<string, string>)?.technology ?? ""))
          .filter(Boolean);
        return <ChipList items={techs} />;
      },
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      minWidth: 80,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.canonical_linkedin_url ? (
          <a
            href={`https://${(d.canonical_linkedin_url as string).replace(/^https?:\/\//, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3 shrink-0" />LinkedIn
          </a>
        ) : <Dash />;
      },
    },
  ];

  return rawCols.map((col) => ({
    ...col,
    visible: col.key === "company" ? true : visibleColumns[col.key] !== false,
  }));
}

// ---------------------------------------------------------------------------
// People columns
// ---------------------------------------------------------------------------

function buildPeopleListColumns(visibleColumns: Record<string, boolean>): DataTableColumn<ListItemRecord>[] {
  const isCol = (key: string) => visibleColumns[key] !== false;

  const rawCols: DataTableColumn<ListItemRecord>[] = [
    {
      key: "name",
      label: "Name",
      minWidth: 200,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const name = (d.full_name as string) || `${(d.first_name as string) ?? ""} ${(d.last_name as string) ?? ""}`.trim() || "—";
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar name={name} pictureUrl={d.picture_url as string | undefined} size="sm" />
            <p className="truncate text-[13px] font-semibold text-gray-900" title={name}>{name}</p>
          </div>
        );
      },
    },
    {
      key: "company",
      label: "Company",
      minWidth: 170,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const companyName = d.active_experience_company_name as string | undefined;
        if (!companyName) return <Dash />;
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <CompanyLogo
              name={companyName}
              logoUrl={d.active_experience_company_logo_url as string | undefined}
              website={d.active_experience_company_website as string | undefined}
              size="sm"
            />
            <p className="truncate text-[13px] font-medium text-gray-800" title={companyName}>
              {companyName}
            </p>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      minWidth: 160,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const jobTitle = d.active_experience_title as string | undefined;
        const jobDepartment = d.active_experience_department as string | undefined;
        return jobTitle ? (
          <div>
            <p className="truncate text-[13px] text-gray-800 max-w-[140px]" title={jobTitle}>{jobTitle}</p>
            {!isCol("department") && jobDepartment && (
              <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium capitalize text-gray-600">
                {jobDepartment}
              </span>
            )}
          </div>
        ) : <Dash />;
      },
    },
    {
      key: "email",
      label: "Email",
      minWidth: 160,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const email = (d.email as string) ?? (d.primary_professional_email as string) ?? "";
        return email ? (
          <span className="text-[13px] font-medium text-gray-800">{email}</span>
        ) : <Dash />;
      },
    },
    {
      key: "location",
      label: "Location",
      minWidth: 120,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const country = (d.location_country as string) ?? "";
        const city = (d.location_city as string) ?? "";
        return (
          <div className="min-w-0">
              <p className="truncate text-[13px] capitalize text-gray-700">{country || "—"}</p>
              {city && <p className="truncate text-xs capitalize text-gray-400">{city}</p>}
            </div>
        );
      },
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 120,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.mobile_phone ? (
          <span className="text-[13px] text-gray-800">{d.mobile_phone as string}</span>
        ) : <Dash />;
      },
    },
    {
      key: "person_country",
      label: "Country",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const country = (d.location_country as string) ?? "";
        return (
          <span className="text-[13px] capitalize text-gray-700">{country || "—"}</span>
        );
      },
    },
    {
      key: "person_city",
      label: "City",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const city = (d.location_city as string) ?? "";
        return <span className="text-[13px] capitalize text-gray-700">{city || "—"}</span>;
      },
    },
    {
      key: "state",
      label: "State",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <span className="text-[13px] text-gray-800">{(d.location_state as string) ?? "—"}</span>;
      },
    },
    {
      key: "department",
      label: "Department",
      minWidth: 110,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const raw = (d.active_experience_department as string) ?? "";
        const dept = raw.split(/[·,]/)[0].trim();
        return dept ? (
          <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">
            {dept}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "seniority",
      label: "Seniority",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_experience_management_level ? (
          <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium capitalize text-gray-600">
            {d.active_experience_management_level as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "job_started",
      label: "Job Started",
      minWidth: 85,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return (
          <span className="text-[13px] text-gray-800 whitespace-nowrap">
            {fmtDate(d.active_experience_start_date as string | undefined)}
          </span>
        );
      },
    },
    {
      key: "time_in_role",
      label: "In Role",
      minWidth: 80,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return (
          <span className="text-[13px] font-medium text-gray-700">
            {fmtDuration(d.active_experience_start_date as string | undefined)}
          </span>
        );
      },
    },
    {
      key: "exp_years",
      label: "Exp.",
      minWidth: 70,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const expMonths = d.total_experience_duration_months as number | undefined;
        return expMonths != null
          ? <span className="text-[13px] font-medium text-gray-700">{Math.floor(expMonths / 12)} yrs</span>
          : <Dash />;
      },
    },
    {
      key: "headline",
      label: "Headline",
      minWidth: 160,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.headline ? (
          <span className="block max-w-[180px] truncate text-[13px] text-gray-600" title={d.headline as string}>
            {d.headline as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "skills",
      label: "Skills",
      minWidth: 150,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.inferred_skills as string | string[] | undefined)} />;
      },
    },
    {
      key: "awards_certs",
      label: "Awards & Certs",
      minWidth: 140,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.awards_certifications as string | string[] | undefined)} />;
      },
    },
    {
      key: "connections",
      label: "Connections",
      minWidth: 90,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.connections_count != null
          ? <span className="text-[13px] text-gray-800">{(d.connections_count as number).toLocaleString()}</span>
          : <Dash />;
      },
    },
    {
      key: "followers",
      label: "Followers",
      minWidth: 80,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.followers_count != null
          ? <span className="text-[13px] text-gray-800">{(d.followers_count as number).toLocaleString()}</span>
          : <Dash />;
      },
    },
    {
      key: "salary",
      label: "Est. Salary",
      minWidth: 85,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.projected_base_salary_median != null
          ? <span className="text-[13px] font-semibold text-gray-700">{(d.projected_base_salary_currency ?? "USD") === "USD" ? "$" : ""}{Math.round((d.projected_base_salary_median as number) / 1000)}K</span>
          : <Dash />;
      },
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.linkedin_url ? (
          <a
            href={`https://${(d.linkedin_url as string).replace(/^https?:\/\//, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3 shrink-0" />LinkedIn
          </a>
        ) : <Dash />;
      },
    },
    {
      key: "co_website",
      label: "Company Website",
      minWidth: 150,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const website = d.active_experience_company_website as string | undefined;
        if (!website) return <Dash />;
        const href = website.startsWith("http") ? website : `https://${website}`;
        const display = website.replace(/^https?:\/\//, "").replace(/\/$/, "");
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 max-w-[140px] truncate text-[13px] text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3 shrink-0" />
            {display}
          </a>
        );
      },
    },
    {
      key: "co_industry",
      label: "Co. Industry",
      minWidth: 120,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_experience_company_industry ? (
          <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
            {d.active_experience_company_industry as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "co_employees",
      label: "Co. Employees",
      minWidth: 90,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_experience_company_employees_count != null || d.active_experience_company_size ? (
          <div className="flex items-center gap-1 text-[13px] text-gray-800">
            <Users className="h-3 w-3 shrink-0 text-gray-400" />
            {d.active_experience_company_size
              ? (SIZE_LABEL[d.active_experience_company_size as string] ?? d.active_experience_company_size as string)
              : String(d.active_experience_company_employees_count)}
          </div>
        ) : <Dash />;
      },
    },
    {
      key: "co_type",
      label: "Co. Type",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const coTypeLabel = d.active_experience_company_type as string | undefined;
        const coTypeClass = TYPE_COLORS[(coTypeLabel ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-500";
        return coTypeLabel ? (
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${coTypeClass}`}>
            {coTypeLabel}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "co_status",
      label: "Co. Status",
      minWidth: 80,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        const coStatusLabel = d.active_experience_company_status as string | undefined;
        const coStatusClass = STATUS_COLORS[(coStatusLabel ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-500";
        return coStatusLabel ? (
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${coStatusClass}`}>
            {coStatusLabel}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "co_founded",
      label: "Co. Founded",
      minWidth: 70,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_experience_company_founded != null ? (
          <span className="text-[13px] text-gray-800">{String(d.active_experience_company_founded)}</span>
        ) : <Dash />;
      },
    },
    {
      key: "co_country",
      label: "Co. Country",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return (
          <span className="text-[13px] capitalize text-gray-700">{(d.active_experience_company_hq_country as string) ?? "—"}</span>
        );
      },
    },
    {
      key: "co_city",
      label: "Co. City",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <span className="text-[13px] capitalize text-gray-700">{(d.active_experience_company_hq_city as string) ?? "—"}</span>;
      },
    },
    {
      key: "co_state",
      label: "Co. State",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <span className="text-[13px] text-gray-800">{(d.active_experience_company_hq_region as string) ?? "—"}</span>;
      },
    },
    {
      key: "co_address",
      label: "Co. Address",
      minWidth: 140,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_experience_company_hq_location ? (
          <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={d.active_experience_company_hq_location as string}>
            {d.active_experience_company_hq_location as string}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "co_keywords",
      label: "Keywords",
      minWidth: 160,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.active_experience_company_categories_and_keywords as string | string[] | undefined)} />;
      },
    },
    {
      key: "products_services",
      label: "Products & Services",
      minWidth: 170,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return <ChipList items={toStringArr(d.active_experience_company_categories_and_keywords as string | string[] | undefined)} />;
      },
    },
    {
      key: "co_revenue",
      label: "Revenue",
      minWidth: 100,
      render: (item) => {
        const d = item.data as Record<string, unknown>;
        return d.active_experience_company_annual_revenue != null ? (
          <span className="text-[13px] text-gray-800">{fmtMoney(d.active_experience_company_annual_revenue as number)}</span>
        ) : <Dash />;
      },
    },
  ];

  return rawCols.map((col) => ({
    ...col,
    visible: col.key === "name" ? true : visibleColumns[col.key] !== false,
  }));
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
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
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

  const toggleSelect = (itemId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });

  const toggleSelectAll = (all: boolean) =>
    setSelected(all ? new Set(items.map((i) => i.id)) : new Set());

  async function handleRemove(itemId: string) {
    setRemoving(itemId);
    try {
      await removeListItem(id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setSelected((prev) => { const next = new Set(prev); next.delete(itemId); return next; });
      toast.success("Removed from list");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  }

  async function handleBulkRemove() {
    if (selected.size === 0) return;
    setBulkRemoving(true);
    try {
      await Promise.all([...selected].map((itemId) => removeListItem(id, itemId)));
      setItems((prev) => prev.filter((i) => !selected.has(i.id)));
      toast.success(`${selected.size} item${selected.size !== 1 ? "s" : ""} removed`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to remove items");
    } finally {
      setBulkRemoving(false);
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

  const tableColumns = isPeople
    ? buildPeopleListColumns(visibleColumns)
    : buildCompanyListColumns(visibleColumns);

  return (
    <>
      <AppHeader title={list?.name ?? "List"} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">

          {/* Toolbar */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
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
              <span className="min-w-0 truncate text-[13px] font-semibold text-gray-900">{list?.name ?? "—"}</span>
            </div>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {items.length} {isPeople ? "people" : "companies"}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <DataTable
              columns={tableColumns}
              data={loading ? [] : items}
              rowKey={(item) => item.id}
              minTableWidth={580}
              loading={loading}
              onOpenColumnSettings={() => setColSettingsOpen(true)}
              emptyMessage="No records in this list yet."
              selection={{ selected, onSelect: toggleSelect, onSelectAll: toggleSelectAll }}
              actions={{
                render: (item) => (
                  <ActionMenu
                    removing={removing === item.id}
                    onRemove={() => handleRemove(item.id)}
                    onMoveToList={() => handleOpenMoveToList(item)}
                  />
                ),
              }}
            />

            {/* Floating bulk action bar */}
            {selected.size > 0 && (
              <div className="absolute bottom-2 left-2 right-2 z-30 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:flex-nowrap sm:px-4">
                <span className="whitespace-nowrap text-[11px] font-semibold text-white sm:text-xs">
                  {selected.size} selected
                </span>
                <div className="mx-1 h-4 w-px bg-gray-600" />
                <button
                  type="button"
                  disabled={bulkRemoving}
                  onClick={handleBulkRemove}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-gray-700 disabled:opacity-60 sm:px-3 sm:text-xs"
                >
                  {bulkRemoving
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />}
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
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
