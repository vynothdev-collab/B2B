"use client";
import { Mail, BadgeCheck } from "lucide-react";

interface Props {
  requireWorkEmail: boolean;
  onChange: (patch: { requireWorkEmail?: boolean }) => void;
}

function Checkbox({
  icon, label, checked, onChange,
}: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 has-[:checked]:border-red-300 has-[:checked]:bg-red-50 sm:gap-2 sm:px-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3 rounded border-gray-300 accent-red-600 text-red-600 focus:ring-red-400 sm:h-3.5 sm:w-3.5"
      />
      <span className="text-red-500">{icon}</span>
      <span className="text-[11px] font-medium text-gray-700 sm:text-xs">{label}</span>
      <BadgeCheck className="ml-auto h-3 w-3 text-emerald-500 sm:h-3.5 sm:w-3.5" />
    </label>
  );
}

export default function ContactDetailsFilter({ requireWorkEmail, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Checkbox
        icon={<Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
        label="Work email"
        checked={requireWorkEmail}
        onChange={(v) => onChange({ requireWorkEmail: v })}
      />
    </div>
  );
}
