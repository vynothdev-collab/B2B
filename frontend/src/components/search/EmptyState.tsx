"use client";
import { useState } from "react";
import { ArrowRight, Send } from "lucide-react";

const SUGGESTIONS = [
  { label: "CEOs and CTOs at SaaS startups", icon: "👥" },
  { label: "Marketing managers in healthcare", icon: "✉️" },
  { label: "Heads of Sales at fintech companies", icon: "📊" },
  { label: "Founders at early-stage dev tools", icon: "💻" },
];

interface Props {
  onQuery?: (q: string) => void;
}

export default function EmptyState({ onQuery }: Props) {
  const [query, setQuery] = useState("");

  const submit = () => {
    if (query.trim() && onQuery) onQuery(query.trim());
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-6 text-center sm:px-8 sm:py-16">
      <div className="flex flex-col items-center -mb-4">
        <svg className="h-28 w-28 sm:h-44 sm:w-44" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_dii_280_16168)">
          <path d="M34 54C34 36.3269 48.3269 22 66 22C83.6731 22 98 36.3269 98 54C98 71.6731 83.6731 86 66 86C48.3269 86 34 71.6731 34 54Z" fill="url(#paint0_radial_280_16168)"/>
          </g>
          <defs>
          <filter id="filter0_dii_280_16168" x="0" y="0" width="132" height="132" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="12"/>
          <feGaussianBlur stdDeviation="17"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.909804 0 0 0 0 0.25098 0 0 0 0 0.0627451 0 0 0 0.38 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_280_16168"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_280_16168" result="shape"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dx="7" dy="7"/>
          <feGaussianBlur stdDeviation="7.5"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0"/>
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_280_16168"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dx="-6" dy="-9"/>
          <feGaussianBlur stdDeviation="9"/>
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.909804 0 0 0 0 0.25098 0 0 0 0 0.0627451 0 0 0 0.4 0"/>
          <feBlend mode="normal" in2="effect2_innerShadow_280_16168" result="effect3_innerShadow_280_16168"/>
          </filter>
          <radialGradient id="paint0_radial_280_16168" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(55.76 39.92) rotate(-90) scale(62.5107)">
          <stop stopColor="#FFDCD2"/>
          <stop offset="0.46" stopColor="#FB734C"/>
          <stop offset="0.82" stopColor="#F96A42"/>
          </radialGradient>
          </defs>
        </svg>
      </div>


      <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">Find the right prospects</h2>
      <p className="mt-1 text-xs text-gray-500 sm:text-base">
        Describe them and{" "}
        <span className="font-semibold text-red-600">B2B AI</span> does the rest
      </p>

      <div className="mt-5 w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-sm sm:mt-8 sm:rounded-xl">
        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-red-500 text-base">✦</span>
          <input
            type="text"
            placeholder='Initiate a query — e.g. "Marketing managers in the healthcare industry"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="min-w-0 flex-1 bg-transparent text-[11px] text-gray-700 placeholder-gray-400 focus:outline-none sm:text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-1.5 sm:px-4 sm:py-2">
          <button type="button" className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 sm:text-xs">
            <span>↑↓</span>
            <span>Relevance</span>
          </button>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-500 sm:text-xs">
              <span className="relative inline-flex h-4 w-7 cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <span className="absolute inset-0 rounded-full bg-red-600 peer-checked:bg-red-600" />
                <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-3" />
              </span>
              Verified only
            </label>
            <button
              type="button"
              onClick={submit}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 sm:h-7 sm:w-7"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:mt-8 sm:text-xs">
        Get started with an example below
      </p>
      <div className="mt-3 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => { setQuery(s.label); if (onQuery) onQuery(s.label); }}
            className="flex flex-col items-start rounded-lg border border-gray-200 bg-white p-2.5 text-left shadow-sm transition-all hover:border-red-300 hover:shadow-md sm:rounded-xl sm:p-3"
          >
            <span className="mb-1.5 text-base sm:mb-2 sm:text-lg">{s.icon}</span>
            <span className="text-[11px] font-medium leading-snug text-gray-700 sm:text-xs">{s.label}</span>
            <ArrowRight className="mt-2 h-3 w-3 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
