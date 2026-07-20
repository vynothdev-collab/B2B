"use client";
import { useState } from "react";

export const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
  "bg-teal-500", "bg-cyan-500",
];

export function avatarColor(name = ""): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function initials(name = ""): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({
  name,
  pictureUrl,
  size = "md",
}: { name: string; pictureUrl?: string; size?: "sm" | "md" }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-xs";
  if (pictureUrl && !imgError) {
    return (
      <img
        src={pictureUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${dim} shrink-0 flex items-center justify-center rounded-full font-semibold text-white ${avatarColor(name)}`}>
      {initials(name)}
    </div>
  );
}

export const FLAG: Record<string, string> = {
  "united states": "🇺🇸", "united kingdom": "🇬🇧", canada: "🇨🇦",
  france: "🇫🇷", germany: "🇩🇪", india: "🇮🇳", portugal: "🇵🇹",
  ireland: "🇮🇪", australia: "🇦🇺", singapore: "🇸🇬", brazil: "🇧🇷",
  netherlands: "🇳🇱", spain: "🇪🇸", italy: "🇮🇹", sweden: "🇸🇪",
  "sri lanka": "🇱🇰", indonesia: "🇮🇩", malaysia: "🇲🇾",
  "united arab emirates": "🇦🇪", pakistan: "🇵🇰", philippines: "🇵🇭",
};
export const flag = (c = "") => FLAG[c.toLowerCase()] ?? "🌍";

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDuration(iso?: string): string {
  if (!iso) return "—";
  const start = new Date(iso);
  if (isNaN(start.getTime())) return "—";
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 1) return "<1m";
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  return [yrs > 0 ? `${yrs}y` : "", mo > 0 ? `${mo}m` : ""].filter(Boolean).join(" ");
}

export function toStringArr(v: string | string[] | undefined | null): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function toArr(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

export function Dash() {
  return <span className="text-gray-400">—</span>;
}

export function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${Math.round(n / 1_000)}K`;
}

export const SIZE_LABEL: Record<string, string> = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1K", "1001-5000": "1–5K",
  "5001-10000": "5–10K", "10001+": "10K+",
};

export function normalizeSizeRange(raw: string): string {
  const cleaned = raw.replace(/\s*employees?/gi, "").replace(/,/g, "").trim();
  const lc = cleaned.toLowerCase();
  if (lc === "myself only" || lc === "self employed" || lc === "1") return "Solo";
  if (lc === "0" || lc === "") return "—";
  const normalised = cleaned.replace(/\s*-\s*/g, "-");
  return SIZE_LABEL[normalised] ?? cleaned;
}

export const TYPE_COLORS: Record<string, string> = {
  "privately held": "bg-blue-50 text-blue-600",
  "public": "bg-green-50 text-green-600",
  "nonprofit": "bg-amber-50 text-amber-600",
  "educational": "bg-red-50 text-red-600",
  "government": "bg-gray-100 text-gray-600",
  "self employed": "bg-orange-50 text-orange-600",
};

export const STATUS_COLORS: Record<string, string> = {
  "active": "bg-emerald-50 text-emerald-600",
  "acquired": "bg-blue-50 text-blue-600",
  "closed": "bg-red-50 text-red-500",
  "ipo": "bg-violet-50 text-violet-600",
};
