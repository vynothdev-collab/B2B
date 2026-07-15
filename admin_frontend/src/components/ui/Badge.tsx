import React from "react";

type BadgeProps = {
  status: string;
  label?: string;
};

// Warm-palette badge map (matches Meridian / leadsbuddy design language)
const STATUS_MAP: Record<string, string> = {
  // sage — positive / active
  active:     "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  paid:       "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  healthy:    "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  resolved:   "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  strong:     "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  successful: "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  good:       "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  added:      "bg-[#E3EEE0] text-[#3E6A44] ring-1 ring-[#5C8A61]/20",
  // ink-soft — neutral / inactive
  inactive:   "bg-[#F0E9D8] text-[#736C58] ring-1 ring-[#A79F89]/25",
  draft:      "bg-[#F0E9D8] text-[#736C58] ring-1 ring-[#A79F89]/25",
  closed:     "bg-[#F0E9D8] text-[#736C58] ring-1 ring-[#A79F89]/25",
  // rose — error / expired / suspended
  suspended:  "bg-[#F5E1E6] text-[#B15169] ring-1 ring-[#B15169]/20",
  failed:     "bg-[#F5E1E6] text-[#B15169] ring-1 ring-[#B15169]/20",
  exceeded:   "bg-[#F5E1E6] text-[#B15169] ring-1 ring-[#B15169]/20",
  expired:    "bg-[#F5E1E6] text-[#B15169] ring-1 ring-[#B15169]/20",
  deducted:   "bg-[#F5E1E6] text-[#B15169] ring-1 ring-[#B15169]/20",
  // rust — urgent / warning
  urgent:     "bg-[#F5E1D5] text-[#BC5A34] ring-1 ring-[#BC5A34]/20",
  // gold — pending / low / open
  pending:    "bg-[#F6ECD4] text-[#93691F] ring-1 ring-[#CE9A3E]/25",
  low:        "bg-[#F6ECD4] text-[#93691F] ring-1 ring-[#CE9A3E]/25",
  open:       "bg-[#F6ECD4] text-[#93691F] ring-1 ring-[#CE9A3E]/25",
  weak:       "bg-[#F6ECD4] text-[#93691F] ring-1 ring-[#CE9A3E]/25",
  scheduled:  "bg-[#F6ECD4] text-[#93691F] ring-1 ring-[#CE9A3E]/25",
  refunded:   "bg-[#F6ECD4] text-[#93691F] ring-1 ring-[#CE9A3E]/25",
  // forest — in progress
  in_progress: "bg-[rgba(23,50,41,.07)] text-[#173229] ring-1 ring-[rgba(23,50,41,.20)]",
};

export default function Badge({ status, label }: BadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const cls = STATUS_MAP[key] ?? "bg-[#F0E9D8] text-[#736C58] ring-1 ring-[#A79F89]/25";
  const display = label ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {display}
    </span>
  );
}
