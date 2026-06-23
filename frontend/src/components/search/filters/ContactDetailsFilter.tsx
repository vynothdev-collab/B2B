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
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 has-[:checked]:border-purple-300 has-[:checked]:bg-purple-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
      />
      <span className="text-purple-500">{icon}</span>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <BadgeCheck className="ml-auto h-3.5 w-3.5 text-emerald-500" />
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
        icon={<Mail className="h-3.5 w-3.5" />}
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
            className={`px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
              contactLogic === "and"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } ${!bothActive ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            AND
          </button>
          <button
            type="button"
            disabled={!bothActive}
            onClick={() => onChange({ contactLogic: "or" })}
            className={`px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
              contactLogic === "or"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } ${!bothActive ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            OR
          </button>
        </div>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <Checkbox
        icon={<Phone className="h-3.5 w-3.5" />}
        label="Mobile phone"
        checked={requireMobile}
        onChange={(v) => onChange({ requireMobile: v })}
      />

      <p className="px-1 pt-1 text-[10px] text-gray-400 leading-snug">
        Only records that match the selected contact rule will appear.
      </p>
    </div>
  );
}
