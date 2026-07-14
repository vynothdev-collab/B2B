import React from "react";

type BadgeProps = {
  status: string;
  label?: string;
};

const STATUS_MAP: Record<string, string> = {
  // green
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  healthy: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  strong: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  successful: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  good: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  added: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  // slate
  inactive: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
  draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
  closed: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
  // red
  suspended: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  failed: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  exceeded: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  urgent: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  expired: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  deducted: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  // amber
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  low: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  open: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  weak: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  scheduled: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  refunded: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  // blue
  in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
};

export default function Badge({ status, label }: BadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const cls = STATUS_MAP[key] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20";
  const display = label ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {display}
    </span>
  );
}
