"use client";
import { useState } from "react";
import { Mail, Smartphone, BadgeCheck } from "lucide-react";

interface Props {
  requireWorkEmail: boolean;
  onChange: (patch: { requireWorkEmail?: boolean }) => void;
}

function Checkbox({
  icon, label, checked, onChange,
}: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 has-[:checked]:border-red-300 has-[:checked]:bg-red-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600 text-red-600 focus:ring-red-400"
      />
      <span className="text-red-500">{icon}</span>
      <span className="text-[12px] font-medium text-gray-700">{label}</span>
      <BadgeCheck className="ml-auto h-3.5 w-3.5 text-emerald-500" />
    </label>
  );
}

export default function ContactDetailsFilter({ requireWorkEmail, onChange }: Props) {
  const [hasEmail, setHasEmail] = useState(false);
  const [hasMobile, setHasMobile] = useState(false);

  return (
    <div className="space-y-1.5">
      <Checkbox
        icon={<Mail className="h-3.5 w-3.5" />}
        label="Work email"
        checked={requireWorkEmail}
        onChange={(v) => onChange({ requireWorkEmail: v })}
      />
      <Checkbox
        icon={<Mail className="h-3.5 w-3.5" />}
        label="Email"
        checked={hasEmail}
        onChange={setHasEmail}
      />
      <Checkbox
        icon={<Smartphone className="h-3.5 w-3.5" />}
        label="Mobile"
        checked={hasMobile}
        onChange={setHasMobile}
      />
    </div>
  );
}
