"use client";
import { useState } from "react";
import { User, Building2 } from "lucide-react";
import LocationAutocomplete from "./LocationAutocomplete";

interface Props {
  personValues: string[];
  hqValues: string[];
  onPersonChange: (v: string[]) => void;
  onHqChange: (v: string[]) => void;
}

type Tab = "people" | "hq";

export default function TabbedLocationFilter({
  personValues,
  hqValues,
  onPersonChange,
  onHqChange,
}: Props) {
  const [tab, setTab] = useState<Tab>("people");

  return (
    <div>
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("people")}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
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
          className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
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

      <div className="pt-3">
        {tab === "people" ? (
          <LocationAutocomplete
            placeholder="Enter location"
            values={personValues}
            onChange={onPersonChange}
          />
        ) : (
          <LocationAutocomplete
            placeholder="Enter HQ location"
            values={hqValues}
            onChange={onHqChange}
          />
        )}
      </div>
    </div>
  );
}
