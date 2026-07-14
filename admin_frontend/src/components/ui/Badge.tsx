import React from "react";

type BadgeProps = {
  status: string;
  label?: string;
};

const STATUS_MAP: Record<string, string> = {
  // emerald
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  healthy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  resolved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  strong: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  successful: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  good: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  // slate
  inactive: "bg-slate-100 text-slate-600 border border-slate-200",
  draft: "bg-slate-100 text-slate-600 border border-slate-200",
  closed: "bg-slate-100 text-slate-600 border border-slate-200",
  // red
  suspended: "bg-red-50 text-red-700 border border-red-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
  exceeded: "bg-red-50 text-red-700 border border-red-200",
  urgent: "bg-red-50 text-red-700 border border-red-200",
  expired: "bg-red-50 text-red-700 border border-red-200",
  // amber
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-amber-50 text-amber-700 border border-amber-200",
  open: "bg-amber-50 text-amber-700 border border-amber-200",
  weak: "bg-amber-50 text-amber-700 border border-amber-200",
  scheduled: "bg-amber-50 text-amber-700 border border-amber-200",
  // blue
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  // added
  added: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  deducted: "bg-red-50 text-red-700 border border-red-200",
  refunded: "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function Badge({ status, label }: BadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const cls = STATUS_MAP[key] ?? "bg-slate-100 text-slate-600 border border-slate-200";
  const display = label ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {display}
    </span>
  );
}
