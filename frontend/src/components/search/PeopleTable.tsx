"use client";
import { Globe, Mail } from "lucide-react";
import type { PersonResult } from "@/types/search";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import {
  avatarColor,
  ChipList,
  Dash,
  fmtDate,
  fmtDuration,
  toStringArr,
} from "@/components/common/tableHelpers";

interface BuildColsArgs {
  visibleColumns: Record<string, boolean>;
  revealedEmails: Map<string, string | null>;
  onRevealEmail: (recordId: string) => void;
  revealingIds: Set<string>;
}

function buildPeopleColumns({
  visibleColumns,
  revealedEmails,
  onRevealEmail,
  revealingIds,
}: BuildColsArgs): DataTableColumn<PersonResult>[] {
  const isCol = (key: string) => visibleColumns[key] !== false;

  const rawCols: DataTableColumn<PersonResult>[] = [
    {
      key: "name",
      label: "Name",
      minWidth: 180,
      render: (person) => {
        const fullName = person.full_name || `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
        const name = fullName || "—";
        return (
          <p className="truncate text-[13px] font-semibold text-gray-900" title={name}>{name}</p>
        );
      },
    },
    {
      key: "company",
      label: "Company",
      minWidth: 170,
      render: (person) => {
        const companyName = person.active_experience_company_name;
        return companyName ? (
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 shrink-0 flex items-center justify-center rounded text-xs font-bold text-white ${avatarColor(companyName)}`}>
              {companyName[0]?.toUpperCase()}
            </div>
            <p className="truncate text-[13px] font-medium text-gray-800 max-w-[130px]">{companyName}</p>
          </div>
        ) : <Dash />;
      },
    },
    {
      key: "title",
      label: "Title",
      minWidth: 160,
      render: (person) => {
        const jobTitle = person.active_experience_title;
        const jobDepartment = person.active_experience_department;
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
      key: "work_email",
      label: "Work Email",
      minWidth: 165,
      render: (person) => {
        const revealedEmail = revealedEmails.get(person.id);
        const isRevealing = revealingIds.has(person.id);
        return revealedEmails.has(person.id) ? (
          revealedEmail
            ? <span className="block max-w-[160px] truncate text-[13px] font-medium text-gray-800">{revealedEmail}</span>
            : <span className="text-xs text-gray-500">No email</span>
        ) : person.has_email ? (
          <button
            type="button"
            disabled={isRevealing}
            onClick={() => onRevealEmail(person.id)}
            className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-50"
          >
            <Mail className="h-3 w-3" />
            {isRevealing ? "Revealing…" : "Reveal"}
          </button>
        ) : <Dash />;
      },
    },
    {
      key: "email",
      label: "Email",
      minWidth: 165,
      render: () => <Dash />,
    },
    {
      key: "location",
      label: "Location",
      minWidth: 130,
      render: (person) => (
        <div className="min-w-0">
            <p className="truncate text-[13px] text-gray-800">{person.location_country ?? "—"}</p>
            {person.location_city && (
              <p className="truncate text-xs text-gray-500">{person.location_city}</p>
            )}
          </div>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 120,
      render: () => <Dash />,
    },
    {
      key: "person_country",
      label: "Country",
      minWidth: 135,
      render: (person) => (
        <span className="text-[13px] capitalize text-gray-700">{person.location_country ?? "—"}</span>
      ),
    },
    {
      key: "person_city",
      label: "City",
      minWidth: 140,
      render: (person) => (
        <span className="text-[13px] capitalize text-gray-700">{person.location_city ?? "—"}</span>
      ),
    },
    {
      key: "state",
      label: "State",
      minWidth: 150,
      render: (person) => (
        <span className="text-[13px] text-gray-800">{person.location_state ?? "—"}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      minWidth: 150,
      render: (person) => {
        const raw = person.active_experience_department ?? "";
        const dept = raw.split(/[·,]/)[0].trim();
        return dept
          ? <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">{dept}</span>
          : <Dash />;
      },
    },
    {
      key: "seniority",
      label: "Seniority",
      minWidth: 100,
      render: (person) => person.active_experience_management_level
        ? <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">{String(person.active_experience_management_level)}</span>
        : <Dash />,
    },
    {
      key: "job_started",
      label: "Job Started",
      minWidth: 85,
      render: (person) => (
        <span className="text-[13px] text-gray-800 whitespace-nowrap">{fmtDate(person.active_experience_start_date)}</span>
      ),
    },
    {
      key: "time_in_role",
      label: "In Role",
      minWidth: 80,
      render: (person) => (
        <span className="text-[13px] font-medium text-gray-700">{fmtDuration(person.active_experience_start_date)}</span>
      ),
    },
    {
      key: "exp_years",
      label: "Exp.",
      minWidth: 70,
      render: (person) => person.total_experience_duration_months != null
        ? <span className="text-[13px] font-medium text-gray-700">{Math.floor(person.total_experience_duration_months / 12)} yrs</span>
        : <Dash />,
    },
    {
      key: "headline",
      label: "Headline",
      minWidth: 180,
      render: (person) => person.headline
        ? <span className="block max-w-[180px] truncate text-[13px] text-gray-600" title={person.headline}>{person.headline}</span>
        : <Dash />,
    },
    {
      key: "skills",
      label: "Skills",
      minWidth: 150,
      render: (person) => <ChipList items={person.inferred_skills ?? []} />,
    },
    {
      key: "awards_certs",
      label: "Awards & Certs",
      minWidth: 140,
      render: (person) => <ChipList items={toStringArr(person.awards_certifications)} />,
    },
    {
      key: "connections",
      label: "Connections",
      minWidth: 90,
      render: (person) => person.connections_count != null
        ? <span className="text-[13px] text-gray-800">{person.connections_count.toLocaleString()}</span>
        : <Dash />,
    },
    {
      key: "followers",
      label: "Followers",
      minWidth: 80,
      render: (person) => person.followers_count != null
        ? <span className="text-[13px] text-gray-800">{person.followers_count.toLocaleString()}</span>
        : <Dash />,
    },
    {
      key: "salary",
      label: "Est. Salary",
      minWidth: 85,
      render: (person) => person.projected_base_salary_median != null
        ? <span className="text-[13px] font-semibold text-gray-700">{(person.projected_base_salary_currency ?? "USD") === "USD" ? "$" : ""}{Math.round(person.projected_base_salary_median / 1000)}K</span>
        : <Dash />,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      minWidth: 80,
      render: (person) => person.linkedin_url ? (
        <a
          href={`https://${person.linkedin_url.replace(/^https?:\/\//, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline whitespace-nowrap"
        >
          <Globe className="h-3 w-3 shrink-0" />
          LinkedIn
        </a>
      ) : <Dash />,
    },
    {
      key: "co_website",
      label: "Company Website",
      minWidth: 160,
      render: (person) => {
        const website = person.active_experience_company_website;
        if (!website) return <Dash />;
        const href = website.startsWith("http") ? website : `https://${website}`;
        const display = website.replace(/^https?:\/\//, "").replace(/\/$/, "");
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 max-w-[140px] truncate text-[13px] text-blue-500 hover:underline"
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
      minWidth: 140,
      render: (person) => person.active_experience_company_industry
        ? <span className="inline-block max-w-[120px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">{String(person.active_experience_company_industry)}</span>
        : <Dash />,
    },
    {
      key: "co_employees",
      label: "Employees",
      minWidth: 90,
      render: (person) => {
        const coEmployees = person.active_experience_company_employees_count;
        const coSize = person.active_experience_company_size;
        return coEmployees != null
          ? <span className="text-[13px] text-gray-800">{coEmployees.toLocaleString()}</span>
          : coSize
            ? <span className="text-[13px] text-gray-800">{coSize}</span>
            : <Dash />;
      },
    },
    {
      key: "co_type",
      label: "Co. Type",
      minWidth: 90,
      render: (person) => person.active_experience_company_type
        ? <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">{String(person.active_experience_company_type)}</span>
        : <Dash />,
    },
    {
      key: "co_status",
      label: "Co. Status",
      minWidth: 90,
      render: (person) => person.active_experience_company_status
        ? <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600 whitespace-nowrap">{String(person.active_experience_company_status)}</span>
        : <Dash />,
    },
    {
      key: "co_founded",
      label: "Founded",
      minWidth: 70,
      render: (person) => {
        const coFounded = person.active_experience_company_founded ?? person.active_experience_company_founded_year;
        return coFounded != null
          ? <span className="text-[13px] text-gray-800">{coFounded}</span>
          : <Dash />;
      },
    },
    {
      key: "co_country",
      label: "Co. Country",
      minWidth: 135,
      render: (person) => (
        <span className="text-[13px] capitalize text-gray-700">{person.active_experience_company_hq_country ?? "—"}</span>
      ),
    },
    {
      key: "co_city",
      label: "Co. City",
      minWidth: 140,
      render: (person) => (
        <span className="text-[13px] capitalize text-gray-700">{person.active_experience_company_hq_city ?? "—"}</span>
      ),
    },
    {
      key: "co_state",
      label: "Co. State",
      minWidth: 150,
      render: (person) => (
        <span className="text-[13px] text-gray-800">{person.active_experience_company_hq_region ?? "—"}</span>
      ),
    },
    {
      key: "co_address",
      label: "Co. Address",
      minWidth: 180,
      render: (person) => person.active_experience_company_hq_location
        ? <span className="block max-w-[160px] truncate text-[13px] text-gray-800" title={String(person.active_experience_company_hq_location)}>{String(person.active_experience_company_hq_location)}</span>
        : <Dash />,
    },
    {
      key: "co_keywords",
      label: "Keywords",
      minWidth: 160,
      render: (person) => <ChipList items={toStringArr(person.active_experience_company_categories_and_keywords)} />,
    },
    {
      key: "products_services",
      label: "Products & Services",
      minWidth: 170,
      render: (person) => <ChipList items={toStringArr(person.active_experience_company_categories_and_keywords)} />,
    },
    {
      key: "co_revenue",
      label: "Revenue",
      minWidth: 120,
      render: (person) => person.active_experience_company_annual_revenue != null
        ? <span className="text-[13px] text-gray-800">{String(person.active_experience_company_annual_revenue)}</span>
        : <Dash />,
    },
  ];

  return rawCols.map((col) => ({
    ...col,
    visible: col.key === "name" ? true : visibleColumns[col.key] !== false,
  }));
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
  const cols = buildPeopleColumns({
    visibleColumns: visibleColumns ?? {},
    revealedEmails: new Map(),
    onRevealEmail: () => {},
    revealingIds: new Set(),
  });
  return (
    <DataTable
      columns={cols}
      data={[]}
      rowKey={(p: PersonResult) => p.id}
      minTableWidth={640}
      loading
      loadingRows={rows}
    />
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
  onOpenColumnSettings?: () => void;
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
  onOpenColumnSettings,
}: Props) {
  const cols = buildPeopleColumns({ visibleColumns, revealedEmails, onRevealEmail, revealingIds });
  return (
    <DataTable
      columns={cols}
      data={data}
      rowKey={(p) => p.id}
      minTableWidth={640}
      selection={{ selected, onSelect, onSelectAll }}
      onOpenColumnSettings={onOpenColumnSettings}
    />
  );
}
