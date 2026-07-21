"use client";
import { useCallback, useEffect, useState } from "react";

export interface ColumnDef {
  key: string;
  label: string;
  locked?: boolean;
  defaultVisible: boolean;
}

export const PEOPLE_COLUMNS: ColumnDef[] = [
  // ── Always-on ──────────────────────────────────────────────────────────────
  { key: "name",              label: "Name",               locked: true, defaultVisible: true  },
  { key: "company",           label: "Company",                          defaultVisible: true  },
  { key: "title",             label: "Title",                            defaultVisible: true  },
  { key: "email",             label: "Email",                            defaultVisible: true  },
  { key: "location",          label: "Location",                         defaultVisible: true  },
  // ── Person fields ──────────────────────────────────────────────────────────
  { key: "mobile",            label: "Mobile",                           defaultVisible: false },
  { key: "person_country",    label: "Person Country",                   defaultVisible: false },
  { key: "person_city",       label: "Person City",                      defaultVisible: false },
  { key: "state",             label: "Person State",                     defaultVisible: false },
  { key: "department",        label: "Department",                       defaultVisible: false },
  { key: "seniority",         label: "Seniority",                       defaultVisible: false },
  { key: "job_started",       label: "Job Started",                      defaultVisible: false },
  { key: "time_in_role",      label: "Time in Role",                     defaultVisible: false },
  { key: "exp_years",         label: "Experience (yrs)",                 defaultVisible: false },
  { key: "headline",          label: "Headline",                         defaultVisible: false },
  { key: "skills",            label: "Skills",                           defaultVisible: false },
  { key: "awards_certs",      label: "Awards & Certs",                   defaultVisible: false },
  { key: "connections",       label: "Connections",                      defaultVisible: false },
  { key: "followers",         label: "Followers",                        defaultVisible: false },
  { key: "salary",            label: "Est. Salary",                      defaultVisible: false },
  { key: "linkedin",          label: "LinkedIn",                         defaultVisible: true  },
  { key: "co_website",        label: "Company Website",                  defaultVisible: true  },
  // ── Company fields (from person's active experience) ──────────────────────
  { key: "co_industry",       label: "Company Industry",                 defaultVisible: false },
  { key: "co_employees",      label: "Employee Count",                   defaultVisible: false },
  { key: "co_type",           label: "Company Type",                     defaultVisible: false },
  { key: "co_status",         label: "Company Status",                   defaultVisible: false },
  { key: "co_founded",        label: "Company Founded",                  defaultVisible: false },
  { key: "co_country",        label: "Company Country",                  defaultVisible: false },
  { key: "co_city",           label: "Company City",                     defaultVisible: false },
  { key: "co_state",          label: "Company State",                    defaultVisible: false },
  { key: "co_address",        label: "Company Address",                  defaultVisible: false },
  { key: "co_keywords",       label: "Company Keywords",                 defaultVisible: false },
  { key: "products_services", label: "Products & Services",              defaultVisible: false },
  { key: "co_revenue",        label: "Revenue",                          defaultVisible: false },
];

export const COMPANY_COLUMNS: ColumnDef[] = [
  // ── Always-on ──────────────────────────────────────────────────────────────
  { key: "company",         label: "Company",          locked: true, defaultVisible: true  },
  { key: "industry",        label: "Company Industry",               defaultVisible: true  },
  { key: "employees",       label: "Employee Count",                 defaultVisible: true  },
  { key: "website",         label: "Website",                        defaultVisible: true  },
  { key: "location",        label: "Location",                       defaultVisible: true  },
  // ── Company identity ───────────────────────────────────────────────────────
  { key: "type",            label: "Company Type",                   defaultVisible: false },
  { key: "co_status",       label: "Company Status",                 defaultVisible: false },
  { key: "founded",         label: "Company Founded",                defaultVisible: false },
  { key: "legal_name",      label: "Legal Name",                     defaultVisible: false },
  // ── Location breakdown ─────────────────────────────────────────────────────
  { key: "co_country",      label: "Company Country",                defaultVisible: false },
  { key: "co_city",         label: "Company City",                   defaultVisible: false },
  { key: "state",           label: "Company State",                  defaultVisible: false },
  { key: "co_address",      label: "Company Address",                defaultVisible: false },
  // ── Content / description ──────────────────────────────────────────────────
  { key: "co_keywords",     label: "Company Keywords",               defaultVisible: false },
  { key: "products_services",label: "Products & Services",           defaultVisible: false },
  { key: "awards_certs",    label: "Awards & Certs",                 defaultVisible: false },
  // ── Growth & traffic ───────────────────────────────────────────────────────
  { key: "growth",          label: "Headcount Growth",               defaultVisible: false },
  { key: "web_traffic",     label: "Web Traffic / mo",               defaultVisible: false },
  { key: "traffic_growth",  label: "Traffic Growth (yr)",            defaultVisible: false },
  // ── Financials ─────────────────────────────────────────────────────────────
  { key: "revenue",         label: "Revenue",                        defaultVisible: false },
  { key: "funding",         label: "Last Funding",                   defaultVisible: false },
  // ── Other ──────────────────────────────────────────────────────────────────
  { key: "rating",          label: "Employee Rating",                defaultVisible: false },
  { key: "open_jobs",       label: "Open Jobs",                      defaultVisible: false },
  { key: "technologies",    label: "Technologies",                   defaultVisible: false },
  { key: "linkedin",        label: "LinkedIn",                       defaultVisible: false },
];

function getDefaults(cols: ColumnDef[]): Record<string, boolean> {
  return Object.fromEntries(cols.map((c) => [c.key, c.defaultVisible]));
}

function readStorage(storageKey: string, cols: ColumnDef[]): Record<string, boolean> {
  const defaults = getDefaults(cols);
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return {
      ...defaults,
      ...Object.fromEntries(Object.entries(parsed).filter(([k]) => k in defaults)),
    };
  } catch {
    return defaults;
  }
}

export function useColumnSettings(storageKey: string, cols: ColumnDef[]) {
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    readStorage(storageKey, cols),
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(visible));
    } catch {
      // ignore storage errors
    }
  }, [storageKey, visible]);

  const toggle = useCallback(
    (key: string) => {
      const col = cols.find((c) => c.key === key);
      if (!col || col.locked) return;
      setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [cols],
  );

  const reset = useCallback(() => {
    setVisible(getDefaults(cols));
  }, [cols]);

  const isVisible = useCallback(
    (key: string): boolean => {
      const col = cols.find((c) => c.key === key);
      if (!col) return false;
      if (col.locked) return true;
      return visible[key] ?? col.defaultVisible;
    },
    [cols, visible],
  );

  return { visible, toggle, reset, isVisible, cols };
}
