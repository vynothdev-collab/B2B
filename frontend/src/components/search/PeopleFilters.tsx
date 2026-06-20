"use client";
import { useState } from "react";
import FilterSection from "./FilterSection";
import AutocompleteInput from "./AutocompleteInput";
import MultiChipAutocomplete from "./MultiChipAutocomplete";
import MultiChipSelect from "./MultiChipSelect";
import LocationMultiSelect from "./LocationMultiSelect";
import type { PersonFilters } from "@/types/search";
import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  DEGREE_OPTIONS,
  FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  REVENUE_OPTIONS,
  SENIORITY_OPTIONS,
} from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
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



const SECTIONS = [
  "name", "profile", "title", "company", "location", "hq",
] as const;
type Section = typeof SECTIONS[number];

export default function PeopleFilters({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("name");

  const toggle = (s: Section) => setOpen((prev) => (prev === s ? ("" as Section) : s));

  return (
    <>
      <FilterSection title="Name & LinkedIn" isOpen={open === "name"} onToggle={() => toggle("name")}>
        <TextInput label="Name" placeholder="e.g. Joshua Parker" value={filters.name} onChange={(v) => onChange({ name: v })} />
        <MultiChipAutocomplete label="LinkedIn URL(s)" placeholder="linkedin.com/in/… (press Enter)" values={filters.linkedinUrls} onChange={(v) => onChange({ linkedinUrls: v })} />
      </FilterSection>

      <FilterSection title="Profile Details" isOpen={open === "profile"} onToggle={() => toggle("profile")}>
        <MultiChipAutocomplete label="Languages" placeholder="e.g. English (press Enter)" values={filters.languages} onChange={(v) => onChange({ languages: v })} />
        <MultiChipAutocomplete label="Skills" placeholder="e.g. Python, React" field="skill" values={filters.skills} onChange={(v) => onChange({ skills: v })} />
        <TextInput label="Certifications" placeholder="e.g. AWS Certified" value={filters.certifications} onChange={(v) => onChange({ certifications: v })} />
        <MultiChipSelect label="Degree" placeholder="Select degree(s)" options={DEGREE_OPTIONS} values={filters.degree} onChange={(v) => onChange({ degree: v })} />
        <AutocompleteInput label="School" placeholder="University name" value={filters.school} onChange={(v) => onChange({ school: v })} field="school" />
        <AutocompleteInput label="Field of study" placeholder="e.g. Computer Science" value={filters.fieldOfStudy} onChange={(v) => onChange({ fieldOfStudy: v })} field="major" />
      </FilterSection>

      <FilterSection title="Title & Seniority" isOpen={open === "title"} onToggle={() => toggle("title")}>
        <MultiChipAutocomplete label="Job title" placeholder="e.g. Software Engineer" field="title" values={filters.jobTitle} onChange={(v) => onChange({ jobTitle: v })} />
        <MultiChipSelect label="Seniority level" placeholder="Select seniority levels" options={SENIORITY_OPTIONS} values={filters.seniority} onChange={(v) => onChange({ seniority: v })} />
        <MultiChipSelect label="Department" placeholder="Select department(s)" options={FUNCTION_OPTIONS} values={filters.department} onChange={(v) => onChange({ department: v })} />
        <Field label="Years of experience">
          <div className="flex gap-1.5">
            <input type="number" placeholder="Min" value={filters.yearsExperienceMin}
              onChange={(e) => onChange({ yearsExperienceMin: e.target.value })} className={inputCls} />
            <input type="number" placeholder="Max" value={filters.yearsExperienceMax}
              onChange={(e) => onChange({ yearsExperienceMax: e.target.value })} className={inputCls} />
          </div>
        </Field>
      </FilterSection>

      <FilterSection title="Current Company" isOpen={open === "company"} onToggle={() => toggle("company")}>
        <MultiChipAutocomplete label="Company name" placeholder="e.g. Stripe" field="company" values={filters.companyName} onChange={(v) => onChange({ companyName: v })} />
        <MultiChipAutocomplete label="Company LinkedIn URL(s)" placeholder="linkedin.com/company/… (press Enter)" values={filters.companyLinkedinUrls} onChange={(v) => onChange({ companyLinkedinUrls: v })} />
        <AutocompleteInput label="Company domain" placeholder="e.g. stripe.com" value={filters.companyDomain} onChange={(v) => onChange({ companyDomain: v })} field="website" />
        <MultiChipSelect label="Industry" placeholder="Select industry…" options={INDUSTRY_OPTIONS} values={filters.industry} onChange={(v) => onChange({ industry: v })} />
        <MultiChipSelect label="Company size" placeholder="Select headcount" options={COMPANY_SIZE_OPTIONS} values={filters.companySize} onChange={(v) => onChange({ companySize: v })} />
        <MultiChipSelect label="Company type" placeholder="Select type" options={COMPANY_TYPE_OPTIONS} values={filters.companyType} onChange={(v) => onChange({ companyType: v })} />
        <MultiChipSelect label="Company revenue" placeholder="Select revenue range" options={REVENUE_OPTIONS} values={filters.companyRevenue} onChange={(v) => onChange({ companyRevenue: v })} />
      </FilterSection>

      <FilterSection title="Person Location" isOpen={open === "location"} onToggle={() => toggle("location")}>
        <LocationMultiSelect label="Country" placeholder="Search country…" type="country" values={filters.country} onChange={(v) => onChange({ country: v })} />
        <LocationMultiSelect label="State / Province" placeholder="Search state…" type="state" selectedCountries={filters.country} values={filters.state} onChange={(v) => onChange({ state: v })} />
        <TextInput label="City" placeholder="e.g. San Francisco" value={filters.city} onChange={(v) => onChange({ city: v })} />
      </FilterSection>

      <FilterSection title="Company HQ Location" isOpen={open === "hq"} onToggle={() => toggle("hq")}>
        <LocationMultiSelect label="HQ Country" placeholder="Search country…" type="country" values={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v })} />
        <LocationMultiSelect label="HQ State / Province" placeholder="Search state…" type="state" selectedCountries={filters.hqCountry} values={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        <TextInput label="HQ City" placeholder="e.g. New York City" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} />
      </FilterSection>
    </>
  );
}
