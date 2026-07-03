import type { FilterChip } from "@/components/search/ActiveFilterChips";
import type { PersonFilters, CompanyFilters } from "@/types/search";
import {
  SENIORITY_OPTIONS, DEPARTMENT_OPTIONS, COMPANY_TYPE_OPTIONS,
  REVENUE_OPTIONS, FUNDING_STAGE_OPTIONS,
} from "@/types/search";

function labelOf(options: { value: string; label: string }[], v: string) {
  return options.find((o) => o.value === v)?.label ?? v;
}

function fmtUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function capitalize(s: string) {
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function rangeLabel(min?: string, max?: string, fmt?: (n: number) => string) {
  const f = fmt ?? ((n: number) => String(n));
  if (min && max) return `${f(Number(min))} – ${f(Number(max))}`;
  if (min) return `≥ ${f(Number(min))}`;
  if (max) return `≤ ${f(Number(max))}`;
  return "";
}

export function buildPersonChips(
  filters: PersonFilters,
  onChange: (patch: Partial<PersonFilters>) => void
): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.name)
    chips.push({ id: "name", label: `Name: ${filters.name}`, onRemove: () => onChange({ name: "" }) });

  filters.jobTitle.forEach((v) =>
    chips.push({ id: `title-${v}`, label: v, onRemove: () => onChange({ jobTitle: filters.jobTitle.filter((x) => x !== v) }) })
  );

  filters.departments.forEach((v) =>
    chips.push({ id: `dept-${v}`, label: labelOf(DEPARTMENT_OPTIONS, v), onRemove: () => onChange({ departments: filters.departments.filter((x) => x !== v) }) })
  );

  filters.seniority.forEach((v) =>
    chips.push({ id: `sen-${v}`, label: labelOf(SENIORITY_OPTIONS, v), onRemove: () => onChange({ seniority: filters.seniority.filter((x) => x !== v) }) })
  );

  filters.companies.forEach((v) =>
    chips.push({ id: `co-${v}`, label: v, onRemove: () => onChange({ companies: filters.companies.filter((x) => x !== v) }) })
  );

  filters.personLocations.forEach((v) =>
    chips.push({ id: `loc-${v}`, label: capitalize(v), onRemove: () => onChange({ personLocations: filters.personLocations.filter((x) => x !== v) }) })
  );

  filters.companyHQLocations.forEach((v) =>
    chips.push({ id: `hq-${v}`, label: `HQ: ${capitalize(v)}`, onRemove: () => onChange({ companyHQLocations: filters.companyHQLocations.filter((x) => x !== v) }) })
  );

  if (filters.requireWorkEmail)
    chips.push({ id: "email", label: "Work Email", onRemove: () => onChange({ requireWorkEmail: false }) });

  filters.companyType.forEach((v) =>
    chips.push({ id: `type-${v}`, label: labelOf(COMPANY_TYPE_OPTIONS, v), onRemove: () => onChange({ companyType: filters.companyType.filter((x) => x !== v) }) })
  );

  filters.technologies.forEach((v) =>
    chips.push({ id: `tech-${v}`, label: v, onRemove: () => onChange({ technologies: filters.technologies.filter((x) => x !== v) }) })
  );

  filters.revenueBuckets.forEach((v) =>
    chips.push({ id: `rev-${v}`, label: labelOf(REVENUE_OPTIONS, v), onRemove: () => onChange({ revenueBuckets: filters.revenueBuckets.filter((x) => x !== v) }) })
  );

  const fundRange = rangeLabel(filters.fundingMin, filters.fundingMax, fmtUsd);
  if (fundRange)
    chips.push({ id: "funding", label: `Funding: ${fundRange}`, onRemove: () => onChange({ fundingMin: "", fundingMax: "" }) });

  const growthRange = rangeLabel(filters.headcountGrowthMin, filters.headcountGrowthMax, (n) => `${n}%`);
  if (growthRange)
    chips.push({ id: "growth", label: `Growth: ${growthRange}`, onRemove: () => onChange({ headcountGrowthMin: "", headcountGrowthMax: "" }) });

  if (filters.headcountByDepartment) {
    const deptLabel = labelOf(DEPARTMENT_OPTIONS, filters.headcountByDepartment);
    const deptRange = rangeLabel(filters.headcountByDepartmentMin, filters.headcountByDepartmentMax);
    chips.push({
      id: "hc-dept",
      label: `${deptLabel} headcount${deptRange ? `: ${deptRange}` : ""}`,
      onRemove: () => onChange({ headcountByDepartment: "", headcountByDepartmentMin: "", headcountByDepartmentMax: "" }),
    });
  }

  if (filters.headcountByLocationCountry) {
    const locRange = rangeLabel(filters.headcountByLocationMin, filters.headcountByLocationMax);
    chips.push({
      id: "hc-loc",
      label: `${capitalize(filters.headcountByLocationCountry)} headcount${locRange ? `: ${locRange}` : ""}`,
      onRemove: () => onChange({ headcountByLocationCountry: "", headcountByLocationMin: "", headcountByLocationMax: "" }),
    });
  }

  const foundRange = rangeLabel(filters.foundedMin, filters.foundedMax);
  if (foundRange)
    chips.push({ id: "founded", label: `Founded: ${foundRange}`, onRemove: () => onChange({ foundedMin: "", foundedMax: "" }) });

  return chips;
}

export function buildCompanyChips(
  filters: CompanyFilters,
  onChange: (patch: Partial<CompanyFilters>) => void
): FilterChip[] {
  const chips: FilterChip[] = [];

  filters.companies.forEach((v) =>
    chips.push({ id: `co-${v}`, label: v, onRemove: () => onChange({ companies: filters.companies.filter((x) => x !== v) }) })
  );

  filters.locations.forEach((v) =>
    chips.push({ id: `loc-${v}`, label: capitalize(v), onRemove: () => onChange({ locations: filters.locations.filter((x) => x !== v) }) })
  );

  filters.type.forEach((v) =>
    chips.push({ id: `type-${v}`, label: labelOf(COMPANY_TYPE_OPTIONS, v), onRemove: () => onChange({ type: filters.type.filter((x) => x !== v) }) })
  );

  const empRange = rangeLabel(filters.employeeCountMin, filters.employeeCountMax);
  if (empRange)
    chips.push({ id: "emp", label: `Employees: ${empRange}`, onRemove: () => onChange({ employeeCountMin: "", employeeCountMax: "" }) });

  filters.industries.forEach((v) =>
    chips.push({ id: `ind-${v}`, label: capitalize(v), onRemove: () => onChange({ industries: filters.industries.filter((x) => x !== v) }) })
  );

  filters.technologies.forEach((v) =>
    chips.push({ id: `tech-${v}`, label: v, onRemove: () => onChange({ technologies: filters.technologies.filter((x) => x !== v) }) })
  );

  filters.revenueBuckets.forEach((v) =>
    chips.push({ id: `rev-${v}`, label: labelOf(REVENUE_OPTIONS, v), onRemove: () => onChange({ revenueBuckets: filters.revenueBuckets.filter((x) => x !== v) }) })
  );

  const fundRange = rangeLabel(filters.fundingMin, filters.fundingMax, fmtUsd);
  if (fundRange)
    chips.push({ id: "funding", label: `Funding: ${fundRange}`, onRemove: () => onChange({ fundingMin: "", fundingMax: "" }) });

  filters.fundingStages.forEach((v) =>
    chips.push({ id: `stage-${v}`, label: labelOf(FUNDING_STAGE_OPTIONS, v), onRemove: () => onChange({ fundingStages: filters.fundingStages.filter((x) => x !== v) }) })
  );

  const growthRange = rangeLabel(filters.headcountGrowthMin, filters.headcountGrowthMax, (n) => `${n}%`);
  if (growthRange)
    chips.push({ id: "growth", label: `Growth: ${growthRange}`, onRemove: () => onChange({ headcountGrowthMin: "", headcountGrowthMax: "" }) });

  if (filters.headcountByDepartment) {
    const deptLabel = labelOf(DEPARTMENT_OPTIONS, filters.headcountByDepartment);
    const deptRange = rangeLabel(filters.headcountByDepartmentMin, filters.headcountByDepartmentMax);
    chips.push({
      id: "hc-dept",
      label: `${deptLabel} headcount${deptRange ? `: ${deptRange}` : ""}`,
      onRemove: () => onChange({ headcountByDepartment: "", headcountByDepartmentMin: "", headcountByDepartmentMax: "" }),
    });
  }

  if (filters.headcountByLocationCountry) {
    const locRange = rangeLabel(filters.headcountByLocationMin, filters.headcountByLocationMax);
    chips.push({
      id: "hc-loc",
      label: `${capitalize(filters.headcountByLocationCountry)} headcount${locRange ? `: ${locRange}` : ""}`,
      onRemove: () => onChange({ headcountByLocationCountry: "", headcountByLocationMin: "", headcountByLocationMax: "" }),
    });
  }

  const foundRange = rangeLabel(filters.foundedMin, filters.foundedMax);
  if (foundRange)
    chips.push({ id: "founded", label: `Founded: ${foundRange}`, onRemove: () => onChange({ foundedMin: "", foundedMax: "" }) });

  return chips;
}
