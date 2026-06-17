"use client";
import FilterSection from "./FilterSection";
import type { PersonFilters } from "@/types/search";
import {
  COMPANY_SIZE_OPTIONS,
  FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  SENIORITY_OPTIONS,
} from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
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
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function MultiCheckbox({ options, selected, onChange }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  };
  return (
    <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-1">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-1.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(o.value)}
            onChange={() => toggle(o.value)}
            className="h-3 w-3 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
          />
          <span className="text-[10px] text-gray-600 group-hover:text-gray-900">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function PeopleFilters({ filters, onChange }: Props) {
  return (
    <>
      <FilterSection title="Name & LinkedIn" defaultOpen>
        <div>
          <Label text="First name" />
          <Input placeholder="e.g. Joshua" value={filters.firstName} onChange={(v) => onChange({ firstName: v })} />
        </div>
        <div>
          <Label text="Last name" />
          <Input placeholder="e.g. Parker" value={filters.lastName} onChange={(v) => onChange({ lastName: v })} />
        </div>
        <div>
          <Label text="LinkedIn URL" />
          <Input placeholder="linkedin.com/in/..." value={filters.linkedinUrl} onChange={(v) => onChange({ linkedinUrl: v })} />
        </div>
      </FilterSection>

      <FilterSection title="Profile Details">
        <div>
          <Label text="Headline" />
          <Input placeholder="Keywords in headline" value={filters.headline} onChange={(v) => onChange({ headline: v })} />
        </div>
        <div>
          <Label text="Skills" />
          <Input placeholder="e.g. Python, React" value={filters.skills} onChange={(v) => onChange({ skills: v })} />
        </div>
        <div>
          <Label text="Degree" />
          <Select value={filters.degree} onChange={(v) => onChange({ degree: v })} placeholder="Select degree" options={[
            { value: "bachelors", label: "Bachelor's" },
            { value: "masters", label: "Master's" },
            { value: "mba", label: "MBA" },
            { value: "phd", label: "PhD / Doctorate" },
            { value: "associate", label: "Associate" },
            { value: "juris doctor", label: "Juris Doctor" },
          ]} />
        </div>
        <div>
          <Label text="School" />
          <Input placeholder="University name" value={filters.school} onChange={(v) => onChange({ school: v })} />
        </div>
        <div>
          <Label text="Field of study" />
          <Input placeholder="e.g. Computer Science" value={filters.fieldOfStudy} onChange={(v) => onChange({ fieldOfStudy: v })} />
        </div>
        <div>
          <Label text="Min LinkedIn connections" />
          <input
            type="number"
            placeholder="e.g. 500"
            value={filters.linkedinConnectionsMin}
            onChange={(e) => onChange({ linkedinConnectionsMin: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
      </FilterSection>

      <FilterSection title="Title & Seniority">
        <div>
          <Label text="Job title" />
          <Input placeholder="e.g. Software Engineer" value={filters.jobTitle} onChange={(v) => onChange({ jobTitle: v })} />
        </div>
        <div>
          <Label text="Seniority" />
          <MultiCheckbox options={SENIORITY_OPTIONS} selected={filters.seniority} onChange={(v) => onChange({ seniority: v })} />
        </div>
        <div>
          <Label text="Function / Role" />
          <Select value={filters.function} onChange={(v) => onChange({ function: v })} placeholder="Select function" options={FUNCTION_OPTIONS} />
        </div>
        <div>
          <Label text="Years experience" />
          <div className="flex gap-1.5">
            <input type="number" placeholder="Min" value={filters.yearsExperienceMin}
              onChange={(e) => onChange({ yearsExperienceMin: e.target.value })}
              className="w-1/2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400" />
            <input type="number" placeholder="Max" value={filters.yearsExperienceMax}
              onChange={(e) => onChange({ yearsExperienceMax: e.target.value })}
              className="w-1/2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400" />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Current Company">
        <div>
          <Label text="Company name" />
          <Input placeholder="e.g. Stripe" value={filters.companyName} onChange={(v) => onChange({ companyName: v })} />
        </div>
        <div>
          <Label text="Company domain" />
          <Input placeholder="e.g. stripe.com" value={filters.companyDomain} onChange={(v) => onChange({ companyDomain: v })} />
        </div>
        <div>
          <Label text="Industry" />
          <select
            value={filters.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          >
            <option value="">Select industry</option>
            {INDUSTRY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label text="Company size" />
          <Select value={filters.companySize} onChange={(v) => onChange({ companySize: v })} placeholder="Select headcount" options={COMPANY_SIZE_OPTIONS} />
        </div>
      </FilterSection>

      <FilterSection title="Past Roles & Companies">
        <div>
          <Label text="Past company" />
          <Input placeholder="Company name" value={filters.pastCompanies} onChange={(v) => onChange({ pastCompanies: v })} />
        </div>
        <div>
          <Label text="Past job title" />
          <Input placeholder="e.g. VP of Sales" value={filters.pastTitles} onChange={(v) => onChange({ pastTitles: v })} />
        </div>
        <div>
          <Label text="Past seniority" />
          <MultiCheckbox options={SENIORITY_OPTIONS} selected={filters.pastSeniority} onChange={(v) => onChange({ pastSeniority: v })} />
        </div>
        <div>
          <Label text="Past function" />
          <Select value={filters.pastFunction} onChange={(v) => onChange({ pastFunction: v })} placeholder="Select function" options={FUNCTION_OPTIONS} />
        </div>
      </FilterSection>

      <FilterSection title="Person Location">
        <div>
          <Label text="Country" />
          <Input placeholder="e.g. United States" value={filters.country} onChange={(v) => onChange({ country: v })} />
        </div>
        <div>
          <Label text="State / Province" />
          <Input placeholder="e.g. California" value={filters.state} onChange={(v) => onChange({ state: v })} />
        </div>
        <div>
          <Label text="City" />
          <Input placeholder="e.g. San Francisco" value={filters.city} onChange={(v) => onChange({ city: v })} />
        </div>
      </FilterSection>

      <FilterSection title="Company HQ Location">
        <div>
          <Label text="HQ country" />
          <Input placeholder="e.g. United States" value={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v })} />
        </div>
        <div>
          <Label text="HQ state" />
          <Input placeholder="e.g. New York" value={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        </div>
        <div>
          <Label text="HQ city" />
          <Input placeholder="e.g. New York City" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} />
        </div>
      </FilterSection>
    </>
  );
}
