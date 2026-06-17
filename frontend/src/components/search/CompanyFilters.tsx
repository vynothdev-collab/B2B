"use client";
import FilterSection from "./FilterSection";
import type { CompanyFilters } from "@/types/search";
import {
  COMPANY_TYPE_OPTIONS,
  FUNDING_ROUND_OPTIONS,
  FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  REVENUE_OPTIONS,
} from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

function Label({ text }: { text: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{text}</p>;
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
    />
  );
}

export default function CompanyFilters({ filters, onChange }: Props) {
  return (
    <>
      <FilterSection title="Company Name & Domain" defaultOpen>
        <div>
          <Label text="Company name" />
          <Input placeholder="e.g. /tech" value={filters.companyName} onChange={(v) => onChange({ companyName: v })} />
        </div>
        <div>
          <Label text="Website domain" />
          <Input placeholder="e.g. www.example.com" value={filters.websiteDomain} onChange={(v) => onChange({ websiteDomain: v })} />
        </div>
      </FilterSection>

      <FilterSection title="Industry & Type">
        <div>
          <Label text="Industry" />
          <select
            value={filters.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          >
            <option value="">Select industry</option>
            {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <Label text="Company type" />
          <Select value={filters.type} onChange={(v) => onChange({ type: v })} placeholder="Select type" options={COMPANY_TYPE_OPTIONS} />
        </div>
        <div>
          <Label text="Stock exchange" />
          <Input placeholder="e.g. XNAS" value={filters.stockExchange} onChange={(v) => onChange({ stockExchange: v })} />
        </div>
      </FilterSection>

      <FilterSection title="HQ Location">
        <div>
          <Label text="Country" />
          <Input placeholder="e.g. United States" value={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v })} />
        </div>
        <div>
          <Label text="State / Province" />
          <Input placeholder="e.g. California" value={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        </div>
        <div>
          <Label text="City" />
          <Input placeholder="e.g. San Francisco" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} />
        </div>
      </FilterSection>

      <FilterSection title="Headcount, Revenue & Growth">
        <div>
          <Label text="Employee count" />
          <div className="flex gap-1.5">
            <NumInput placeholder="Min" value={filters.employeeCountMin} onChange={(v) => onChange({ employeeCountMin: v })} />
            <NumInput placeholder="Max" value={filters.employeeCountMax} onChange={(v) => onChange({ employeeCountMax: v })} />
          </div>
        </div>
        <div>
          <Label text="Annual revenue" />
          <Select value={filters.annualRevenue} onChange={(v) => onChange({ annualRevenue: v })} placeholder="Select range" options={REVENUE_OPTIONS} />
        </div>
        <div>
          <Label text="12-month growth (%)" />
          <NumInput placeholder="Min growth %" value={filters.employeeGrowthMin} onChange={(v) => onChange({ employeeGrowthMin: v })} />
        </div>
      </FilterSection>

      <FilterSection title="Founded, Funding & IPO">
        <div>
          <Label text="Year founded" />
          <div className="flex gap-1.5">
            <NumInput placeholder="From" value={filters.yearFoundedMin} onChange={(v) => onChange({ yearFoundedMin: v })} />
            <NumInput placeholder="To" value={filters.yearFoundedMax} onChange={(v) => onChange({ yearFoundedMax: v })} />
          </div>
        </div>
        <div>
          <Label text="Last funding round" />
          <Select value={filters.lastFundingRound} onChange={(v) => onChange({ lastFundingRound: v })} placeholder="Select round" options={FUNDING_ROUND_OPTIONS} />
        </div>
        <div>
          <Label text="Min total funding ($)" />
          <NumInput placeholder="e.g. 1000000" value={filters.totalFundingMin} onChange={(v) => onChange({ totalFundingMin: v })} />
        </div>
        <div>
          <Label text="Funded after" />
          <input
            type="date"
            value={filters.mostRecentFundingAfter}
            onChange={(e) => onChange({ mostRecentFundingAfter: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
      </FilterSection>

      <FilterSection title="Role Mix & Hiring Growth">
        <p className="text-[10px] text-gray-400 italic">Requires Premium Insights plan</p>
        <div>
          <Label text="Role" />
          <Select value={filters.roleCompositionRole} onChange={(v) => onChange({ roleCompositionRole: v })} placeholder="Select role" options={FUNCTION_OPTIONS} />
        </div>
        <div>
          <Label text="Min employees in role" />
          <NumInput placeholder="e.g. 10" value={filters.roleCompositionMin} onChange={(v) => onChange({ roleCompositionMin: v })} />
        </div>
      </FilterSection>
    </>
  );
}
