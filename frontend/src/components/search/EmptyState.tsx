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
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      {/* Orb */}
      <div className="mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 opacity-90 shadow-lg" />

      <h2 className="text-2xl font-bold text-gray-900">Find the right prospects</h2>
      <p className="mt-1 text-base text-gray-500">
        Describe them and{" "}
        <span className="font-semibold text-purple-600">B2B AI</span> does the rest
      </p>

      {/* AI query box */}
      <div className="mt-8 w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="text-purple-500 text-base">✦</span>
          <input
            type="text"
            placeholder='Initiate a query — e.g. "Marketing managers in the healthcare industry"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
          <button type="button" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <span>↑↓</span>
            <span>Relevance</span>
          </button>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="relative inline-flex h-4 w-7 cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <span className="absolute inset-0 rounded-full bg-purple-600 peer-checked:bg-purple-600" />
                <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-3" />
              </span>
              Verified only
            </label>
            <button
              type="button"
              onClick={submit}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion chips */}
      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Get started with an example below
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => { setQuery(s.label); if (onQuery) onQuery(s.label); }}
            className="flex flex-col items-start rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
          >
            <span className="text-lg mb-2">{s.icon}</span>
            <span className="text-xs font-medium text-gray-700 leading-snug">{s.label}</span>
            <ArrowRight className="mt-2 h-3 w-3 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
