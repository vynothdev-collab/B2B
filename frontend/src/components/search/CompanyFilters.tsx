"use client";
import { useState } from "react";
import FilterSection from "./FilterSection";
import AutocompleteInput from "./AutocompleteInput";
import MultiChipAutocomplete from "./MultiChipAutocomplete";
import MultiChipSelect from "./MultiChipSelect";
import type { CompanyFilters, RoleCompositionRule } from "@/types/search";
import { COMPANY_SIZE_OPTIONS, COMPANY_TYPE_OPTIONS, FUNDING_ROUND_OPTIONS, REVENUE_OPTIONS } from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const inputCls =
  "w-full rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors";
const labelCls = "block text-xs text-gray-500 mb-1";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}

function TextInput({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <input type="text" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </Field>
  );
}


function NumInput({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <input type="number" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </Field>
  );
}

const SECTIONS = ["name", "industry", "hq", "headcount", "funding", "rolemix"] as const;
type Section = typeof SECTIONS[number];

export default function CompanyFilters({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("name");

  const toggle = (s: Section) => setOpen((prev) => (prev === s ? ("" as Section) : s));

  return (
    <>
      <FilterSection title="Company Name & Domain" isOpen={open === "name"} onToggle={() => toggle("name")}>
        <AutocompleteInput label="Company name" placeholder="e.g. Acme Corp" value={filters.companyName} onChange={(v) => onChange({ companyName: v })} field="company" />
        <AutocompleteInput label="Website domain" placeholder="e.g. example.com" value={filters.websiteDomain} onChange={(v) => onChange({ websiteDomain: v })} field="website" />
      </FilterSection>

      <FilterSection title="Industry & Type" isOpen={open === "industry"} onToggle={() => toggle("industry")}>
        <MultiChipAutocomplete label="Industry" placeholder="e.g. Software" field="industry" values={filters.industry} onChange={(v) => onChange({ industry: v })} />
        <MultiChipSelect label="Company type" placeholder="Select type" options={COMPANY_TYPE_OPTIONS} values={filters.type} onChange={(v) => onChange({ type: v })} />
        <TextInput label="Stock exchange" placeholder="e.g. XNAS" value={filters.stockExchange} onChange={(v) => onChange({ stockExchange: v })} />
      </FilterSection>

      <FilterSection title="HQ Location" isOpen={open === "hq"} onToggle={() => toggle("hq")}>
        <MultiChipAutocomplete label="Country" placeholder="e.g. United States" field="country" values={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v })} />
        <MultiChipAutocomplete label="State / Province" placeholder="e.g. California" field="region" values={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        <AutocompleteInput label="City" placeholder="e.g. San Francisco" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} field="location_name" />
        <AutocompleteInput label="Most employees in (Metro)" placeholder="e.g. San Francisco, California" value={filters.hqMetro} onChange={(v) => onChange({ hqMetro: v })} field="location_name" />
      </FilterSection>

      <FilterSection title="Headcount, Revenue & Growth" isOpen={open === "headcount"} onToggle={() => toggle("headcount")}>
        <MultiChipSelect label="Employee count (ranges)" placeholder="Select headcount ranges" options={COMPANY_SIZE_OPTIONS} values={filters.employeeCountRanges} onChange={(v) => onChange({ employeeCountRanges: v })} />
        <Field label="Employee count (min / max)">
          <div className="flex gap-1.5">
            <input type="number" placeholder="Min" value={filters.employeeCountMin}
              onChange={(e) => onChange({ employeeCountMin: e.target.value })} className={inputCls} />
            <input type="number" placeholder="Max" value={filters.employeeCountMax}
              onChange={(e) => onChange({ employeeCountMax: e.target.value })} className={inputCls} />
          </div>
        </Field>
        <MultiChipSelect label="Annual revenue" placeholder="Select range" options={REVENUE_OPTIONS} values={filters.annualRevenue} onChange={(v) => onChange({ annualRevenue: v })} />
        <NumInput label="12-month growth (%)" placeholder="Min growth %" value={filters.employeeGrowthMin} onChange={(v) => onChange({ employeeGrowthMin: v })} />
      </FilterSection>

      <FilterSection title="Founded, Funding & IPO" isOpen={open === "funding"} onToggle={() => toggle("funding")}>
        <Field label="Year founded">
          <div className="flex gap-1.5">
            <input type="number" placeholder="From" value={filters.yearFoundedMin}
              onChange={(e) => onChange({ yearFoundedMin: e.target.value })} className={inputCls} />
            <input type="number" placeholder="To" value={filters.yearFoundedMax}
              onChange={(e) => onChange({ yearFoundedMax: e.target.value })} className={inputCls} />
          </div>
        </Field>
        <MultiChipSelect label="Last funding round" placeholder="Select round" options={FUNDING_ROUND_OPTIONS} values={filters.lastFundingRound} onChange={(v) => onChange({ lastFundingRound: v })} />
        <NumInput label="Min total funding ($)" placeholder="e.g. 1000000" value={filters.totalFundingMin} onChange={(v) => onChange({ totalFundingMin: v })} />
        <Field label="Funded after">
          <input type="date" value={filters.mostRecentFundingAfter}
            onChange={(e) => onChange({ mostRecentFundingAfter: e.target.value })} className={inputCls} />
        </Field>
      </FilterSection>

      <FilterSection title="Role Mix & Hiring Growth" isOpen={open === "rolemix"} onToggle={() => toggle("rolemix")}>
        <p className="text-[10px] text-gray-400 italic mb-1">Requires Premium Insights plan</p>
        <div className="space-y-2">
          {filters.roleCompositionRules.map((rule: RoleCompositionRule, i: number) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Rule {i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const rules = filters.roleCompositionRules.filter((_, j) => j !== i);
                    onChange({ roleCompositionRules: rules });
                  }}
                  className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
              <AutocompleteInput
                placeholder="Search role e.g. Engineering"
                value={rule.role}
                onChange={(v) => {
                  const rules = filters.roleCompositionRules.map((r, j) => j === i ? { ...r, role: v } : r);
                  onChange({ roleCompositionRules: rules });
                }}
                field="role"
              />
              <div>
                <span className="block text-[10px] text-gray-400 mb-1">Min employee count</span>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={rule.minCount}
                  onChange={(e) => {
                    const rules = filters.roleCompositionRules.map((r, j) => j === i ? { ...r, minCount: e.target.value } : r);
                    onChange({ roleCompositionRules: rules });
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 mb-1">Min 12-month growth %</span>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={rule.minGrowth}
                  onChange={(e) => {
                    const rules = filters.roleCompositionRules.map((r, j) => j === i ? { ...r, minGrowth: e.target.value } : r);
                    onChange({ roleCompositionRules: rules });
                  }}
                  className={inputCls}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ roleCompositionRules: [...filters.roleCompositionRules, { role: "", minCount: "", minGrowth: "" }] })}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
          >
            + Add rule
          </button>
        </div>
      </FilterSection>
    </>
  );
}
