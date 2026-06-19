"use client";
import { useState } from "react";
import FilterSection from "./FilterSection";
import AutocompleteInput from "./AutocompleteInput";
import MultiChipAutocomplete from "./MultiChipAutocomplete";
import MultiChipSelect from "./MultiChipSelect";
import type { PersonFilters } from "@/types/search";
import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  DEGREE_OPTIONS,
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

const SECTIONS = [
  "name", "profile", "title", "company", "past", "location", "hq",
] as const;
type Section = typeof SECTIONS[number];

export default function PeopleFilters({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("name");

  const toggle = (s: Section) => setOpen((prev) => (prev === s ? ("" as Section) : s));

  return (
    <>
      <FilterSection title="Name & LinkedIn" isOpen={open === "name"} onToggle={() => toggle("name")}>
        <TextInput label="Name" placeholder="e.g. Joshua Parker" value={filters.name} onChange={(v) => onChange({ name: v })} />
        <TextInput label="LinkedIn URL" placeholder="linkedin.com/in/..." value={filters.linkedinUrl} onChange={(v) => onChange({ linkedinUrl: v })} />
      </FilterSection>

      <FilterSection title="Profile Details" isOpen={open === "profile"} onToggle={() => toggle("profile")}>
        <TextInput label="Headline contains" placeholder="e.g. Growth hacker" value={filters.headline} onChange={(v) => onChange({ headline: v })} />
        <TextInput label="Summary contains" placeholder="Keywords in summary" value={filters.summary} onChange={(v) => onChange({ summary: v })} />
        <TextInput label="Twitter handle" placeholder="e.g. elonmusk" value={filters.twitterHandle} onChange={(v) => onChange({ twitterHandle: v })} />
        <TextInput label="GitHub username / URL" placeholder="e.g. torvalds" value={filters.githubUrl} onChange={(v) => onChange({ githubUrl: v })} />
        <MultiChipAutocomplete label="Languages" placeholder="e.g. English (press Enter)" values={filters.languages} onChange={(v) => onChange({ languages: v })} />
        <MultiChipAutocomplete label="Skills" placeholder="e.g. Python, React" field="skill" values={filters.skills} onChange={(v) => onChange({ skills: v })} />
        <MultiChipAutocomplete label="Interests" placeholder="e.g. AI (press Enter)" values={filters.interests} onChange={(v) => onChange({ interests: v })} />
        <TextInput label="Certifications" placeholder="e.g. AWS Certified" value={filters.certifications} onChange={(v) => onChange({ certifications: v })} />
        <MultiChipSelect label="Degree" placeholder="Select degree(s)" options={DEGREE_OPTIONS} values={filters.degree} onChange={(v) => onChange({ degree: v })} />
        <AutocompleteInput label="School" placeholder="University name" value={filters.school} onChange={(v) => onChange({ school: v })} field="school" />
        <AutocompleteInput label="Field of study" placeholder="e.g. Computer Science" value={filters.fieldOfStudy} onChange={(v) => onChange({ fieldOfStudy: v })} field="major" />
        <NumInput label="Min LinkedIn connections" placeholder="e.g. 500" value={filters.linkedinConnectionsMin} onChange={(v) => onChange({ linkedinConnectionsMin: v })} />
      </FilterSection>

      <FilterSection title="Title & Seniority" isOpen={open === "title"} onToggle={() => toggle("title")}>
        <MultiChipAutocomplete label="Job title" placeholder="e.g. Software Engineer" field="title" values={filters.jobTitle} onChange={(v) => onChange({ jobTitle: v })} />
        <MultiChipSelect label="Seniority level" placeholder="Select seniority levels" options={SENIORITY_OPTIONS} values={filters.seniority} onChange={(v) => onChange({ seniority: v })} />
        <MultiChipAutocomplete label="Department" placeholder="e.g. Engineering" field="role" values={filters.department} onChange={(v) => onChange({ department: v })} />
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
        <TextInput label="Company LinkedIn URL" placeholder="linkedin.com/company/..." value={filters.companyLinkedinUrl} onChange={(v) => onChange({ companyLinkedinUrl: v })} />
        <AutocompleteInput label="Company domain" placeholder="e.g. stripe.com" value={filters.companyDomain} onChange={(v) => onChange({ companyDomain: v })} field="website" />
        <MultiChipAutocomplete label="Industry" placeholder="e.g. Information Technology" field="industry" values={filters.industry} onChange={(v) => onChange({ industry: v })} />
        <MultiChipSelect label="Company size" placeholder="Select headcount" options={COMPANY_SIZE_OPTIONS} values={filters.companySize} onChange={(v) => onChange({ companySize: v })} />
        <MultiChipSelect label="Company type" placeholder="Select type" options={COMPANY_TYPE_OPTIONS} values={filters.companyType} onChange={(v) => onChange({ companyType: v })} />
        <MultiChipSelect label="Company revenue" placeholder="Select revenue range" options={REVENUE_OPTIONS} values={filters.companyRevenue} onChange={(v) => onChange({ companyRevenue: v })} />
      </FilterSection>

      <FilterSection title="Past Roles & Companies" isOpen={open === "past"} onToggle={() => toggle("past")}>
        <MultiChipAutocomplete label="Past company" placeholder="e.g. Google" field="company" values={filters.pastCompanies} onChange={(v) => onChange({ pastCompanies: v })} />
        <MultiChipAutocomplete label="Past job title" placeholder="e.g. VP of Sales" field="title" values={filters.pastTitles} onChange={(v) => onChange({ pastTitles: v })} />
        <MultiChipSelect label="Past seniority" placeholder="Select seniority levels" options={SENIORITY_OPTIONS} values={filters.pastSeniority} onChange={(v) => onChange({ pastSeniority: v })} />
        <MultiChipAutocomplete label="Past department" placeholder="e.g. Sales" field="role" values={filters.pastDepartment} onChange={(v) => onChange({ pastDepartment: v })} />
      </FilterSection>

      <FilterSection title="Person Location" isOpen={open === "location"} onToggle={() => toggle("location")}>
        <MultiChipAutocomplete label="Country" placeholder="e.g. United States" field="country" values={filters.country} onChange={(v) => onChange({ country: v })} />
        <MultiChipAutocomplete label="State / Province" placeholder="e.g. California" field="region" values={filters.state} onChange={(v) => onChange({ state: v })} />
        <AutocompleteInput label="City" placeholder="e.g. San Francisco" value={filters.city} onChange={(v) => onChange({ city: v })} field="location" />
      </FilterSection>

      <FilterSection title="Company HQ Location" isOpen={open === "hq"} onToggle={() => toggle("hq")}>
        <MultiChipAutocomplete label="HQ Country" placeholder="e.g. United States" field="country" values={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v })} />
        <MultiChipAutocomplete label="HQ State / Province" placeholder="e.g. New York" field="region" values={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        <AutocompleteInput label="HQ City" placeholder="e.g. New York City" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} field="location" />
      </FilterSection>
    </>
  );
}
