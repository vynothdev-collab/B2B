"use client";
import { useState } from "react";
import FilterSection from "./FilterSection";
import type { PersonFilters } from "@/types/search";
import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  REVENUE_OPTIONS,
  SENIORITY_OPTIONS,
  US_STATE_OPTIONS,
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

function MultiCheckbox({ label, options, selected, onChange }: {
  label: string; options: { value: string; label: string }[];
  selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)}
              className="h-3 w-3 rounded border-gray-300 text-purple-600 focus:ring-purple-400" />
            <span className="text-[10px] text-gray-600">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
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
        <TextInput label="First name" placeholder="e.g. Joshua" value={filters.firstName} onChange={(v) => onChange({ firstName: v })} />
        <TextInput label="Last name" placeholder="e.g. Parker" value={filters.lastName} onChange={(v) => onChange({ lastName: v })} />
        <TextInput label="LinkedIn URL" placeholder="linkedin.com/in/..." value={filters.linkedinUrl} onChange={(v) => onChange({ linkedinUrl: v })} />
      </FilterSection>

      <FilterSection title="Profile Details" isOpen={open === "profile"} onToggle={() => toggle("profile")}>
        <TextInput label="Headline contains" placeholder="e.g. Growth hacker" value={filters.headline} onChange={(v) => onChange({ headline: v })} />
        <TextInput label="Summary contains" placeholder="Keywords in summary" value={filters.summary} onChange={(v) => onChange({ summary: v })} />
        <TextInput label="Twitter handle" placeholder="e.g. elonmusk" value={filters.twitterHandle} onChange={(v) => onChange({ twitterHandle: v })} />
        <TextInput label="GitHub username / URL" placeholder="e.g. torvalds" value={filters.githubUrl} onChange={(v) => onChange({ githubUrl: v })} />
        <TextInput label="Languages" placeholder="e.g. English, French" value={filters.languages} onChange={(v) => onChange({ languages: v })} />
        <TextInput label="Skills" placeholder="e.g. Python, React" value={filters.skills} onChange={(v) => onChange({ skills: v })} />
        <TextInput label="Interests" placeholder="e.g. AI, Startups" value={filters.interests} onChange={(v) => onChange({ interests: v })} />
        <TextInput label="Certifications" placeholder="e.g. AWS Certified" value={filters.certifications} onChange={(v) => onChange({ certifications: v })} />
        <SelectInput label="Degree" placeholder="Select degree" value={filters.degree} onChange={(v) => onChange({ degree: v })} options={[
          { value: "associate", label: "Associate" },
          { value: "bachelors", label: "Bachelor's" },
          { value: "masters", label: "Master's" },
          { value: "mba", label: "MBA" },
          { value: "phd", label: "PhD / Doctorate" },
          { value: "juris doctor", label: "Juris Doctor" },
        ]} />
        <TextInput label="School" placeholder="University name" value={filters.school} onChange={(v) => onChange({ school: v })} />
        <TextInput label="Field of study" placeholder="e.g. Computer Science" value={filters.fieldOfStudy} onChange={(v) => onChange({ fieldOfStudy: v })} />
        <NumInput label="Min LinkedIn connections" placeholder="e.g. 500" value={filters.linkedinConnectionsMin} onChange={(v) => onChange({ linkedinConnectionsMin: v })} />
      </FilterSection>

      <FilterSection title="Title & Seniority" isOpen={open === "title"} onToggle={() => toggle("title")}>
        <TextInput label="Job title" placeholder="e.g. Software Engineer" value={filters.jobTitle} onChange={(v) => onChange({ jobTitle: v })} />
        <MultiCheckbox label="Seniority level" options={SENIORITY_OPTIONS} selected={filters.seniority} onChange={(v) => onChange({ seniority: v })} />
        <SelectInput label="Function / Role" placeholder="Select function" value={filters.function} onChange={(v) => onChange({ function: v })} options={FUNCTION_OPTIONS} />
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
        <TextInput label="Company name" placeholder="e.g. Stripe" value={filters.companyName} onChange={(v) => onChange({ companyName: v })} />
        <TextInput label="Company LinkedIn URL" placeholder="linkedin.com/company/..." value={filters.companyLinkedinUrl} onChange={(v) => onChange({ companyLinkedinUrl: v })} />
        <TextInput label="Company domain" placeholder="e.g. stripe.com" value={filters.companyDomain} onChange={(v) => onChange({ companyDomain: v })} />
        <Field label="Industry">
          <select value={filters.industry} onChange={(e) => onChange({ industry: e.target.value })} className={inputCls}>
            <option value="">Select industry</option>
            {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
        </Field>
        <SelectInput label="Company size" placeholder="Select headcount" value={filters.companySize} onChange={(v) => onChange({ companySize: v })} options={COMPANY_SIZE_OPTIONS} />
        <SelectInput label="Company type" placeholder="Select type" value={filters.companyType} onChange={(v) => onChange({ companyType: v })} options={COMPANY_TYPE_OPTIONS} />
        <SelectInput label="Company revenue" placeholder="Select revenue range" value={filters.companyRevenue} onChange={(v) => onChange({ companyRevenue: v })} options={REVENUE_OPTIONS} />
      </FilterSection>

      <FilterSection title="Past Roles & Companies" isOpen={open === "past"} onToggle={() => toggle("past")}>
        <TextInput label="Past company" placeholder="Company name" value={filters.pastCompanies} onChange={(v) => onChange({ pastCompanies: v })} />
        <TextInput label="Past job title" placeholder="e.g. VP of Sales" value={filters.pastTitles} onChange={(v) => onChange({ pastTitles: v })} />
        <MultiCheckbox label="Past seniority" options={SENIORITY_OPTIONS} selected={filters.pastSeniority} onChange={(v) => onChange({ pastSeniority: v })} />
        <SelectInput label="Past function" placeholder="Select function" value={filters.pastFunction} onChange={(v) => onChange({ pastFunction: v })} options={FUNCTION_OPTIONS} />
      </FilterSection>

      <FilterSection title="Person Location" isOpen={open === "location"} onToggle={() => toggle("location")}>
        <SelectInput label="Country" placeholder="Select country" value={filters.country} onChange={(v) => onChange({ country: v, state: "" })} options={COUNTRY_OPTIONS} />
        {filters.country === "united states" ? (
          <SelectInput label="State" placeholder="Select state" value={filters.state} onChange={(v) => onChange({ state: v })} options={US_STATE_OPTIONS} />
        ) : (
          <TextInput label="State / Province" placeholder="e.g. ontario" value={filters.state} onChange={(v) => onChange({ state: v })} />
        )}
        <TextInput label="City" placeholder="e.g. san francisco" value={filters.city} onChange={(v) => onChange({ city: v })} />
      </FilterSection>

      <FilterSection title="Company HQ Location" isOpen={open === "hq"} onToggle={() => toggle("hq")}>
        <SelectInput label="HQ Country" placeholder="Select country" value={filters.hqCountry} onChange={(v) => onChange({ hqCountry: v, hqState: "" })} options={COUNTRY_OPTIONS} />
        {filters.hqCountry === "united states" ? (
          <SelectInput label="HQ State" placeholder="Select state" value={filters.hqState} onChange={(v) => onChange({ hqState: v })} options={US_STATE_OPTIONS} />
        ) : (
          <TextInput label="HQ State / Province" placeholder="e.g. new york" value={filters.hqState} onChange={(v) => onChange({ hqState: v })} />
        )}
        <TextInput label="HQ City" placeholder="e.g. new york city" value={filters.hqCity} onChange={(v) => onChange({ hqCity: v })} />
      </FilterSection>
    </>
  );
}
