"use client";
import { useState } from "react";
import FilterSection from "./FilterSection";
import type { CompanyFilters } from "@/types/search";
import type { RoleCompositionRule } from "@/types/search";
import { COMPANY_TYPE_OPTIONS, COUNTRY_OPTIONS, FUNDING_ROUND_OPTIONS, FUNCTION_OPTIONS, INDUSTRY_OPTIONS, REVENUE_OPTIONS, ROLE_METRIC_OPTIONS, US_STATE_OPTIONS } from "@/types/search";

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

function SelectInput({ label, placeholder, value, onChange, options }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
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
        <TextInput label="Company name" placeholder="e.g. /tech" value={filters.companyName} onChange={(v) => onChange({ companyName: v })} />
        <TextInput label="Website domain" placeholder="e.g. www.example.com" value={filters.websiteDomain} onChange={(v) => onChange({ websiteDomain: v })} />
      </FilterSection>

      <FilterSection title="Industry & Type" isOpen={open === "industry"} onToggle={() => toggle("industry")}>
        <Field label="Industry">
          <select value={filters.industry} onChange={(e) => onChange({ industry: e.target.value })} className={inputCls}>
            <option value="">Select industry</option>
            {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
        </Field>
        <SelectInput label="Company type" placeholder="Select type" value={filters.type} onChange={(v) => onChange({ type: v })} options={COMPANY_TYPE_OPTIONS} />
        <TextInput label="Stock exchange" placeholder="e.g. XNAS" value={filters.stockExchange} onChange={(v) => onChange({ stockExchange: v })} />
      </FilterSection>

      <FilterSection title="HQ Location" isOpen={open === "hq"} onToggle={() => toggle("hq")}>
        <SelectInput label="Country" placeholder="Select country" value={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v, hqState: "" })} options={COUNTRY_OPTIONS} />
        {filters.hqCountry === "united states" ? (
          <SelectInput label="State" placeholder="Select state" value={filters.hqState} onChange={(v) => onChange({ hqState: v })} options={US_STATE_OPTIONS} />
        ) : (
          <TextInput label="State / Province" placeholder="e.g. ontario" value={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        )}
        <TextInput label="City" placeholder="e.g. san francisco" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} />
        <TextInput label="Most employees in (Metro)" placeholder="e.g. san francisco, california" value={filters.hqMetro} onChange={(v) => onChange({ hqMetro: v })} />
      </FilterSection>

      <FilterSection title="Headcount, Revenue & Growth" isOpen={open === "headcount"} onToggle={() => toggle("headcount")}>
        <Field label="Employee count">
          <div className="flex gap-1.5">
            <input type="number" placeholder="Min" value={filters.employeeCountMin}
              onChange={(e) => onChange({ employeeCountMin: e.target.value })} className={inputCls} />
            <input type="number" placeholder="Max" value={filters.employeeCountMax}
              onChange={(e) => onChange({ employeeCountMax: e.target.value })} className={inputCls} />
          </div>
        </Field>
        <SelectInput label="Annual revenue" placeholder="Select range" value={filters.annualRevenue} onChange={(v) => onChange({ annualRevenue: v })} options={REVENUE_OPTIONS} />
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
        <SelectInput label="Last funding round" placeholder="Select round" value={filters.lastFundingRound} onChange={(v) => onChange({ lastFundingRound: v })} options={FUNDING_ROUND_OPTIONS} />
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
              <select
                value={rule.role}
                onChange={(e) => {
                  const rules = filters.roleCompositionRules.map((r, j) => j === i ? { ...r, role: e.target.value } : r);
                  onChange({ roleCompositionRules: rules });
                }}
                className={inputCls}
              >
                <option value="">Select role</option>
                {FUNCTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={rule.metric}
                onChange={(e) => {
                  const rules = filters.roleCompositionRules.map((r, j) => j === i ? { ...r, metric: e.target.value as "count" | "growth", min: "" } : r);
                  onChange({ roleCompositionRules: rules });
                }}
                className={inputCls}
              >
                {ROLE_METRIC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input
                type="number"
                placeholder={rule.metric === "growth" ? "Min growth % e.g. 10" : "Min employees e.g. 50"}
                value={rule.min}
                onChange={(e) => {
                  const rules = filters.roleCompositionRules.map((r, j) => j === i ? { ...r, min: e.target.value } : r);
                  onChange({ roleCompositionRules: rules });
                }}
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ roleCompositionRules: [...filters.roleCompositionRules, { role: "", metric: "count", min: "" }] })}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
          >
            + Add rule
          </button>
        </div>
      </FilterSection>
    </>
  );
}
