"use client";
import { useState } from "react";
import { User, Building2 } from "lucide-react";
import LocationAutocomplete from "./LocationAutocomplete";

interface Props {
  personCountries: string[];
  personStates: string[];
  personCities: string[];
  hqCountries: string[];
  hqStates: string[];
  hqCities: string[];
  onPersonCountriesChange: (v: string[]) => void;
  onPersonStatesChange: (v: string[]) => void;
  onPersonCitiesChange: (v: string[]) => void;
  onHqCountriesChange: (v: string[]) => void;
  onHqStatesChange: (v: string[]) => void;
  onHqCitiesChange: (v: string[]) => void;
}

type Tab = "people" | "hq";

export default function TabbedLocationFilter({
  personCountries,
  personStates,
  personCities,
  hqCountries,
  hqStates,
  hqCities,
  onPersonCountriesChange,
  onPersonStatesChange,
  onPersonCitiesChange,
  onHqCountriesChange,
  onHqStatesChange,
  onHqCitiesChange,
}: Props) {
  const [tab, setTab] = useState<Tab>("people");

  return (
    <div>
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("people")}
          className={`relative flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold transition-colors ${
            tab === "people" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          People
          {tab === "people" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gray-900" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("hq")}
          className={`relative flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold transition-colors ${
            tab === "hq" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Companies HQ
          {tab === "hq" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gray-900" />
          )}
        </button>
      </div>

      <div className="pt-2.5 flex flex-col gap-3">
        {tab === "people" ? (
          <>
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">Country</p>
              <LocationAutocomplete kind="country" values={personCountries} onChange={onPersonCountriesChange} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">State / Region</p>
              <LocationAutocomplete kind="state" values={personStates} onChange={onPersonStatesChange} filterCountries={personCountries} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">City</p>
              <LocationAutocomplete kind="city" values={personCities} onChange={onPersonCitiesChange} filterCountries={personCountries} filterStates={personStates} />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">Country</p>
              <LocationAutocomplete kind="country" values={hqCountries} onChange={onHqCountriesChange} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">State / Region</p>
              <LocationAutocomplete kind="state" values={hqStates} onChange={onHqStatesChange} filterCountries={hqCountries} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">City</p>
              <LocationAutocomplete kind="city" values={hqCities} onChange={onHqCitiesChange} filterCountries={hqCountries} filterStates={hqStates} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
