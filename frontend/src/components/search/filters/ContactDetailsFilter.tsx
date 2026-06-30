"use client";
import { Mail, Phone, BadgeCheck } from "lucide-react";

interface Props {
  requireWorkEmail: boolean;
  requireMobile: boolean;
  contactLogic: "and" | "or";
  onChange: (patch: { requireWorkEmail?: boolean; requireMobile?: boolean; contactLogic?: "and" | "or" }) => void;
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

export default function ContactDetailsFilter({
  requireWorkEmail,
  requireMobile,
  contactLogic,
  onChange,
}: Props) {
  const bothActive = requireWorkEmail && requireMobile;

  return (
    <div className="space-y-1.5">
      <Checkbox
        icon={<Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
        label="Work email"
        checked={requireWorkEmail}
        onChange={(v) => onChange({ requireWorkEmail: v })}
      />

      <div className="flex items-center justify-center gap-1">
        <span className="h-px flex-1 bg-gray-200" />
        <div className="flex overflow-hidden rounded-full border border-gray-200">
          <button
            type="button"
            disabled={!bothActive}
            onClick={() => onChange({ contactLogic: "and" })}
            className={`px-2 py-0.5 text-[9px] font-semibold transition-colors sm:px-2.5 sm:text-[10px] ${
              contactLogic === "and"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } ${!bothActive ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            AND
          </button>
          <button
            type="button"
            disabled={!bothActive}
            onClick={() => onChange({ contactLogic: "or" })}
            className={`px-2 py-0.5 text-[9px] font-semibold transition-colors sm:px-2.5 sm:text-[10px] ${
              contactLogic === "or"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } ${!bothActive ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            OR
          </button>
        </div>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <Checkbox
        icon={<Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
        label="Mobile phone"
        checked={requireMobile}
        onChange={(v) => onChange({ requireMobile: v })}
      />


    </div>
  );
}
