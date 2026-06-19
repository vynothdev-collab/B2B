"use client";
import AutocompleteInput from "./AutocompleteInput";
import MultiChipAutocomplete from "./MultiChipAutocomplete";
import MultiChipSelect from "./MultiChipSelect";
import type { CompanyFilters } from "@/types/search";
import { COMPANY_SIZE_OPTIONS, REVENUE_OPTIONS } from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const inputCls =
  "w-full rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors";

function Row({ children }: { children: React.ReactNode }) {
  return <div className="px-4 pb-2">{children}</div>;
}

export default function CompanyFilters({ filters, onChange }: Props) {
  return (
    <div className="pt-4 pb-4">
      <Row>
        <AutocompleteInput
          placeholder="Company name"
          value={filters.companyName}
          onChange={(v) => onChange({ companyName: v })}
          field="company"
        />
      </Row>

      <Row>
        <MultiChipAutocomplete
          placeholder="Company Location"
          field="country"
          values={filters.hqCountry}
          onChange={(v) => onChange({ hqCountry: v })}
        />
      </Row>

      <Row>
        <MultiChipAutocomplete
          placeholder="Industry"
          field="industry"
          values={filters.industry}
          onChange={(v) => onChange({ industry: v })}
        />
      </Row>

      <Row>
        <MultiChipSelect
          placeholder="Employee Count"
          options={COMPANY_SIZE_OPTIONS}
          values={filters.employeeCountRanges}
          onChange={(v) => onChange({ employeeCountRanges: v })}
        />
      </Row>

      <Row>
        <MultiChipSelect
          placeholder="Revenue"
          options={REVENUE_OPTIONS}
          values={filters.annualRevenue}
          onChange={(v) => onChange({ annualRevenue: v })}
        />
      </Row>

      <Row>
        <p className="text-[10px] text-gray-400 mb-1.5">Year Founded</p>
        <div className="flex gap-1.5">
          <input
            type="number"
            placeholder="From"
            value={filters.yearFoundedMin}
            onChange={(e) => onChange({ yearFoundedMin: e.target.value })}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="To"
            value={filters.yearFoundedMax}
            onChange={(e) => onChange({ yearFoundedMax: e.target.value })}
            className={inputCls}
          />
        </div>
      </Row>

      <Row>
        <input
          type="text"
          placeholder="Keywords"
          value={filters.keywords}
          onChange={(e) => onChange({ keywords: e.target.value })}
          className={inputCls}
        />
      </Row>
    </div>
  );
}
