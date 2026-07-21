"use client";
import { Globe, Users } from "lucide-react";
import type { CompanyResult } from "@/types/search";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import {
  avatarColor,
  ChipList,
  Dash,
  fmtMoney,
  normalizeSizeRange,
  STATUS_COLORS,
  toStringArr,
  TYPE_COLORS,
} from "@/components/common/tableHelpers";

interface BuildColsArgs {
  visibleColumns: Record<string, boolean>;
}

function buildCompanyColumns({ visibleColumns }: BuildColsArgs): DataTableColumn<CompanyResult>[] {
  const isCol = (key: string) => visibleColumns[key] !== false;

  const rawCols: DataTableColumn<CompanyResult>[] = [
    {
      key: "company",
      label: "Company",
      minWidth: 200,
      render: (company) => {
        const name = company.company_name ?? "—";
        const color = avatarColor(name);
        const typeLabel = company.is_public === true
          ? "public"
          : company.is_public === false
            ? "private"
            : (company.type ?? "");
        const typeKey = typeLabel.toLowerCase();
        const typeBadgeClass = TYPE_COLORS[typeKey] ?? "bg-gray-100 text-gray-500";
        return (
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
        );
      },
    },
    {
      key: "industry",
      label: "Industry",
      minWidth: 140,
      render: (company) => company.industry ? (
        <span className="inline-block max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
          {company.industry}
        </span>
      ) : <Dash />,
    },
    {
      key: "employees",
      label: "Employees",
      minWidth: 100,
      render: (company) => {
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
      },
    },
    {
      key: "website",
      label: "Website",
      minWidth: 150,
      render: (company) => company.website ? (
        <a
          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 max-w-[120px] truncate text-[13px] text-blue-500 hover:underline"
        >
          <Globe className="h-3 w-3 shrink-0" />
          {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      ) : <Dash />,
    },
    {
      key: "location",
      label: "Location",
      minWidth: 130,
      render: (company) => {
        const country = company.hq_country ?? "";
        const city = company.hq_city ?? "";
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
      minWidth: 90,
      render: (company) => {
        const typeLabel = company.is_public === true
          ? "public"
          : company.is_public === false
            ? "private"
            : (company.type ?? "");
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
      minWidth: 90,
      render: (company) => {
        const statusBadgeClass = STATUS_COLORS[(company.company_status ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-500";
        return company.company_status ? (
          <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${statusBadgeClass}`}>
            {company.company_status}
          </span>
        ) : <Dash />;
      },
    },
    {
      key: "founded",
      label: "Founded",
      minWidth: 70,
      render: (company) => company.founded ? (
        <span className="text-[13px] text-gray-800">{company.founded}</span>
      ) : <Dash />,
    },
    {
      key: "legal_name",
      label: "Legal Name",
      minWidth: 160,
      render: (company) => company.company_legal_name ? (
        <span className="block max-w-[160px] truncate text-[13px] text-gray-800">
          {company.company_legal_name}
        </span>
      ) : <Dash />,
    },
    {
      key: "co_country",
      label: "Country",
      minWidth: 135,
      render: (company) => {
        const country = company.hq_country ?? "";
        return (
          <span className="text-[13px] capitalize text-gray-700">{country || "—"}</span>
        );
      },
    },
    {
      key: "co_city",
      label: "City",
      minWidth: 140,
      render: (company) => {
        const city = company.hq_city ?? "";
        return <span className="text-[13px] capitalize text-gray-700">{city || "—"}</span>;
      },
    },
    {
      key: "state",
      label: "State",
      minWidth: 150,
      render: (company) => (
        <span className="text-[13px] text-gray-800">{company.hq_state ?? "—"}</span>
      ),
    },
    {
      key: "co_address",
      label: "Address",
      minWidth: 180,
      render: (company) => company.hq_location ? (
        <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={company.hq_location}>
          {company.hq_location}
        </span>
      ) : <Dash />,
    },
    {
      key: "co_keywords",
      label: "Keywords",
      minWidth: 160,
      render: (company) => <ChipList items={toStringArr(company.categories_and_keywords)} />,
    },
    {
      key: "products_services",
      label: "Products & Services",
      minWidth: 170,
      render: (company) => <ChipList items={toStringArr(company.categories_and_keywords)} />,
    },
    {
      key: "awards_certs",
      label: "Awards & Certs",
      minWidth: 155,
      render: (company) => <ChipList items={toStringArr(company.awards_certifications)} />,
    },
    {
      key: "growth",
      label: "HC Growth",
      minWidth: 80,
      render: (company) => company.employees_count_change?.change_yearly_percentage != null ? (
        <span className="text-[13px] font-medium text-gray-800">
          {company.employees_count_change.change_yearly_percentage >= 0 ? "+" : ""}
          {company.employees_count_change.change_yearly_percentage.toFixed(1)}%
        </span>
      ) : <Dash />,
    },
    {
      key: "web_traffic",
      label: "Web Traffic",
      minWidth: 85,
      render: (company) => company.total_website_visits_monthly != null ? (
        <span className="text-[13px] text-gray-800">
          {company.total_website_visits_monthly >= 1_000_000
            ? `${(company.total_website_visits_monthly / 1_000_000).toFixed(1)}M`
            : company.total_website_visits_monthly >= 1_000
              ? `${Math.round(company.total_website_visits_monthly / 1_000)}K`
              : String(company.total_website_visits_monthly)}
        </span>
      ) : <Dash />,
    },
    {
      key: "traffic_growth",
      label: "Traffic Growth",
      minWidth: 90,
      render: (company) => company.total_website_visits_change?.change_yearly_percentage != null ? (
        <span className="text-[13px] font-medium text-gray-800">
          {company.total_website_visits_change.change_yearly_percentage >= 0 ? "+" : ""}
          {company.total_website_visits_change.change_yearly_percentage.toFixed(1)}%
        </span>
      ) : <Dash />,
    },
    {
      key: "revenue",
      label: "Revenue",
      minWidth: 150,
      render: (company) => {
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
      },
    },
    {
      key: "funding",
      label: "Last Funding",
      minWidth: 140,
      render: (company) => company.last_funding_round ? (
        <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
          {company.last_funding_round.type && (
            <span className="shrink-0 inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 whitespace-nowrap">
              {company.last_funding_round.type}
            </span>
          )}
          {company.last_funding_round.amount_raised != null && (
            <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
              {fmtMoney(company.last_funding_round.amount_raised)}
            </span>
          )}
        </div>
      ) : <Dash />,
    },
    {
      key: "rating",
      label: "Rating",
      minWidth: 70,
      render: (company) => company.company_employee_reviews_aggregate_score != null ? (
        <span className="text-[13px] text-gray-800">
          ★ {company.company_employee_reviews_aggregate_score.toFixed(1)}
        </span>
      ) : <Dash />,
    },
    {
      key: "open_jobs",
      label: "Open Jobs",
      minWidth: 70,
      render: (company) => company.active_job_postings != null ? (
        <span className="text-[13px] text-gray-800">
          {Array.isArray(company.active_job_postings) ? company.active_job_postings.length : "—"}
        </span>
      ) : <Dash />,
    },
    {
      key: "technologies",
      label: "Technologies",
      minWidth: 160,
      render: (company) => <ChipList items={(company.technologies_used ?? []).map((t) => typeof t === "string" ? t : (t?.technology ?? "")).filter(Boolean)} />,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      minWidth: 80,
      render: (company) => company.canonical_linkedin_url ? (
        <a
          href={`https://${company.canonical_linkedin_url.replace(/^https?:\/\//, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
        >
          <Globe className="h-3 w-3 shrink-0" />
          LinkedIn
        </a>
      ) : <Dash />,
    },
  ];

  return rawCols.map((col) => ({
    ...col,
    visible: col.key === "company" ? true : visibleColumns[col.key] !== false,
  }));
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
  const cols = buildCompanyColumns({ visibleColumns: visibleColumns ?? {} });
  return (
    <DataTable
      columns={cols}
      data={[]}
      rowKey={(c: CompanyResult) => c.id}
      minTableWidth={580}
      loading
      loadingRows={rows}
    />
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
  onOpenColumnSettings?: () => void;
}

export default function CompanyTable({
  data,
  selected,
  onSelect,
  onSelectAll,
  visibleColumns,
  onOpenColumnSettings,
}: Props) {
  const cols = buildCompanyColumns({ visibleColumns });
  return (
    <DataTable
      columns={cols}
      data={data}
      rowKey={(c) => c.id}
      minTableWidth={580}
      selection={{ selected, onSelect, onSelectAll }}
      onOpenColumnSettings={onOpenColumnSettings}
    />
  );
}
