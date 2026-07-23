"use client";
import { useEffect, useRef, useState } from "react";
import {
  X, MapPin, Briefcase, Users, DollarSign,
  Award, Loader2, ExternalLink, Star, Zap, BarChart2, Building2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Layers,
} from "lucide-react";

import { fmtMoney, toStringArr } from "@/components/common/tableHelpers";
import { apiClient } from "@/lib/api";
import type { CompanyResult } from "@/types/search";

interface CompanyDetail extends CompanyResult {
  description: string | null;
  specialties: string | string[] | null;
  phone: string | null;
  email: string | null;
}

interface Props {
  company: CompanyResult | null;
  onClose: () => void;
}

const AVATAR_COLOR_SETS = [
  { bg: "bg-red-100",     text: "text-red-500"     },
  { bg: "bg-blue-100",    text: "text-blue-600"    },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-purple-100",  text: "text-purple-600"  },
  { bg: "bg-orange-100",  text: "text-orange-500"  },
  { bg: "bg-pink-100",    text: "text-pink-600"    },
  { bg: "bg-teal-100",    text: "text-teal-600"    },
];

const CHIP_COLORS = [
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
];

function CompanyAvatar({ name, logoUrl, website }: { name: string; logoUrl?: string | null; website?: string | null }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [logoUrl]);
  const initials = name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colorSet = AVATAR_COLOR_SETS[(name.charCodeAt(0) || 0) % AVATAR_COLOR_SETS.length];
  const src = logoUrl || (website ? `https://logo.clearbit.com/${website.replace(/^https?:\/\//, "").split("/")[0]}` : null);
  if (src && !err) {
    return (
      <img src={src} alt={name}
        className="h-[96px] w-[96px] shrink-0 rounded-xl object-contain border border-gray-100 bg-white p-1"
        onError={() => setErr(true)} />
    );
  }
  return (
    <div className={`flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-xl text-[26px] font-bold ${colorSet.bg} ${colorSet.text}`}>
      {initials}
    </div>
  );
}

function LinkedInSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="li-mask-company" fill="white">
        <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z"/>
      </mask>
      <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z" fill="white"/>
      <path d="M10 0V1H30V0V-1H10V0ZM40 10H39V30H40H41V10H40ZM30 40V39H10V40V41H30V40ZM0 30H1V10H0H-1V30H0ZM10 40V39C5.02944 39 1 34.9706 1 30H0H-1C-1 36.0751 3.92487 41 10 41V40ZM40 30H39C39 34.9706 34.9706 39 30 39V40V41C36.0751 41 41 36.0751 41 30H40ZM30 0V1C34.9706 1 39 5.02944 39 10H40H41C41 3.92487 36.0751 -1 30 -1V0ZM10 0V-1C3.92487 -1 -1 3.92487 -1 10H0H1C1 5.02944 5.02944 1 10 1V0Z" fill="#ECEBF2" mask="url(#li-mask-company)"/>
      <path d="M14.387 26.5V18.31H16.637V26.5H14.387ZM14.387 17.575V15.325H16.637V17.575H14.387ZM18.2835 26.5V18.31H20.3835V19.93L20.2635 19.57C20.4535 19.08 20.7585 18.72 21.1785 18.49C21.6085 18.25 22.1085 18.13 22.6785 18.13C23.2985 18.13 23.8385 18.26 24.2985 18.52C24.7685 18.78 25.1335 19.145 25.3935 19.615C25.6535 20.075 25.7835 20.615 25.7835 21.235V26.5H23.5335V21.715C23.5335 21.395 23.4685 21.12 23.3385 20.89C23.2185 20.66 23.0435 20.48 22.8135 20.35C22.5935 20.22 22.3335 20.155 22.0335 20.155C21.7435 20.155 21.4835 20.22 21.2535 20.35C21.0235 20.48 20.8435 20.66 20.7135 20.89C20.5935 21.12 20.5335 21.395 20.5335 21.715V26.5H18.2835Z" fill="#0A66C2"/>
    </svg>
  );
}

function WebsiteSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="web-mask-company" fill="white">
        <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z"/>
      </mask>
      <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z" fill="white"/>
      <path d="M10 0V1H30V0V-1H10V0ZM40 10H39V30H40H41V10H40ZM30 40V39H10V40V41H30V40ZM0 30H1V10H0H-1V30H0ZM10 40V39C5.02944 39 1 34.9706 1 30H0H-1C-1 36.0751 3.92487 41 10 41V40ZM40 30H39C39 34.9706 34.9706 39 30 39V40V41C36.0751 41 41 36.0751 41 30H40ZM30 0V1C34.9706 1 39 5.02944 39 10H40H41C41 3.92487 36.0751 -1 30 -1V0ZM10 0V-1C3.92487 -1 -1 3.92487 -1 10H0H1C1 5.02944 5.02944 1 10 1V0Z" fill="#ECEBF2" mask="url(#web-mask-company)"/>
      <path d="M20 26.375C23.5208 26.375 26.375 23.5208 26.375 20C26.375 16.4792 23.5208 13.625 20 13.625C16.4792 13.625 13.625 16.4792 13.625 20C13.625 23.5208 16.4792 26.375 20 26.375Z" stroke="#5A5964" strokeWidth="1.275"/>
      <path d="M13.625 20H26.375M20 13.625C21.7708 15.3958 21.7708 24.25 20 26.375C18.2292 24.25 18.2292 15.3958 20 13.625Z" stroke="#5A5964" strokeWidth="1.275" strokeLinecap="round"/>
    </svg>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-gray-300">
      <div className="rounded-2xl bg-gray-50 p-4">{icon}</div>
      <p className="text-[13px] text-gray-400 font-medium">{text}</p>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, accent = false }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${accent ? "border-red-100 bg-red-50" : "border-gray-100 bg-white shadow-md"}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${accent ? "text-red-400" : "text-gray-700"}`}>
        {icon}{label}
      </div>
      <p className={`mt-1 text-[15px] font-extrabold leading-tight ${accent ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11.5px] font-semibold text-gray-700">{sub}</p>}
    </div>
  );
}

function GrowthBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-bold ${positive ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-red-50 border border-red-200 text-red-600"}`}>
      {positive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function ChipsSection({ title, items, colorize = false }: { title: string; items: string[]; colorize?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  const visible = showAll ? items : items.slice(0, VISIBLE);
  const remaining = items.length - VISIBLE;
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
      <p className="text-[15px] font-bold text-gray-900 mb-4">{title}</p>
      <div className="flex flex-wrap gap-2">
        {visible.map((s, i) => (
          <span key={i} className={`rounded-full border px-4 py-2 text-[13px] font-semibold ${colorize ? CHIP_COLORS[i % CHIP_COLORS.length] : "bg-[#ECEBF2] text-gray-900 border-[#ECEBF2]"}`}>
            {s}
          </span>
        ))}
        {!showAll && remaining > 0 && (
          <button type="button" onClick={() => setShowAll(true)}
            className="rounded-full bg-red-50 border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-100 transition-colors">
            +{remaining} more
          </button>
        )}
        {showAll && items.length > VISIBLE && (
          <button type="button" onClick={() => setShowAll(false)}
            className="rounded-full bg-red-50 border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-100 transition-colors">
            Show less
          </button>
        )}
      </div>
    </div>
  );
}

function KeywordsSection({ items }: { items: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  const visible = showAll ? items : items.slice(0, VISIBLE);
  const remaining = items.length - VISIBLE;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
      <p className="text-[15px] font-bold text-gray-900 mb-4">Categories & Keywords</p>
      <div className="flex flex-wrap gap-2">
        {visible.map((k, i) => (
          <span key={i} className="rounded-lg border border-gray-300 px-4 py-2 text-[13px] font-semibold text-gray-900" style={{ backgroundColor: "#ECEBF2" }}>{k}</span>
        ))}
        {!showAll && remaining > 0 && (
          <button type="button" onClick={() => setShowAll(true)}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-100 transition-colors">
            +{remaining} more
          </button>
        )}
        {showAll && items.length > VISIBLE && (
          <button type="button" onClick={() => setShowAll(false)}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-100 transition-colors">
            Show less
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════
   MAIN COMPONENT
═══════════════════════════ */
export default function CompanyDetailPanel({ company, onClose }: Props) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const overviewRef    = useRef<HTMLDivElement>(null);
  const specialtiesRef = useRef<HTMLDivElement>(null);
  const techRef        = useRef<HTMLDivElement>(null);
  const metricsRef     = useRef<HTMLDivElement>(null);
  const aboutRef       = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!company) { setDetail(null); return; }
    setDetail(null);
    setLoading(true);
    apiClient.get<CompanyDetail>(`/search/companies/${company.id}/detail`)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail({ ...company, description: null, specialties: null, phone: null, email: null }))
      .finally(() => setLoading(false));
  }, [company?.id]);

  useEffect(() => {
    const sectionRefs = [
      { label: "Overview",    ref: overviewRef    },
      { label: "Specialties", ref: specialtiesRef },
      { label: "Tech Stack",  ref: techRef        },
      { label: "Metrics",     ref: metricsRef     },
      { label: "About",       ref: aboutRef       },
    ];
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const threshold = container.getBoundingClientRect().top + container.clientHeight * 0.25;
      for (let i = sectionRefs.length - 1; i >= 0; i--) {
        const el = sectionRefs[i].ref.current;
        if (el && el.getBoundingClientRect().top <= threshold) {
          setActiveTab(sectionRefs[i].label);
          return;
        }
      }
      setActiveTab(sectionRefs[0].label);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [detail]);

  const scrollTo = (label: string, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(label);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateTabArrows = () => {
    const el = tabNavRef.current;
    if (!el) return;
    setCanScrollLeft(Math.floor(el.scrollLeft) > 0);
    setCanScrollRight(Math.ceil(el.scrollLeft) + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    const el = tabNavRef.current;
    if (!el) return;
    updateTabArrows();
    el.addEventListener("scroll", updateTabArrows, { passive: true });
    const ro = new ResizeObserver(updateTabArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateTabArrows);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const btn = nav.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (!btn) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const btnLeft = btnRect.left - navRect.left + nav.scrollLeft;
    const btnRight = btnRect.right - navRect.left + nav.scrollLeft;
    const navWidth = nav.clientWidth;
    if (btnLeft < nav.scrollLeft) {
      nav.scrollTo({ left: btnLeft, behavior: "smooth" });
    } else if (btnRight > nav.scrollLeft + navWidth) {
      nav.scrollTo({ left: btnRight - navWidth, behavior: "smooth" });
    }
  }, [activeTab]);

  const scrollTabNav = (dir: "left" | "right") => {
    tabNavRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  const isOpen = !!company;
  const d = detail ?? company;
  const name = d?.company_name ?? "—";

  const revenueRange = d?.revenue_annual_range;
  const revSrc = revenueRange
    ? (revenueRange["source_4_annual_revenue_range"] ?? revenueRange["source_6_annual_revenue_range"])
    : null;
  let revenueLabel: string | null = null;
  if (revSrc) {
    const lo = revSrc.annual_revenue_range_from;
    const hi = revSrc.annual_revenue_range_to;
    if (lo != null && hi != null) revenueLabel = `${fmtMoney(lo)} – ${fmtMoney(hi)}`;
    else if (lo != null) revenueLabel = `>${fmtMoney(lo)}`;
    else if (hi != null) revenueLabel = `<${fmtMoney(hi)}`;
  }

  const specialtiesArr: string[] = detail?.specialties
    ? (Array.isArray(detail.specialties) ? detail.specialties : [detail.specialties])
    : [];

  const techArr: string[] = Array.isArray(d?.technologies_used)
    ? (d!.technologies_used as Array<string | { technology?: string }>).map((t) =>
        typeof t === "string" ? t : (t?.technology ?? "")
      ).filter(Boolean)
    : [];

  const keywordsArr: string[] = d?.categories_and_keywords ? toStringArr(d.categories_and_keywords) : [];
  const awardsArr: string[] = d?.awards_certifications ? toStringArr(d.awards_certifications) : [];

  const companyWebsite = d?.website ?? null;
  const companyLinkedIn = d?.canonical_linkedin_url ?? null;

  const NAV: { label: string; ref: React.RefObject<HTMLDivElement | null>; count?: number }[] = [
    { label: "Overview",    ref: overviewRef    },
    { label: "Specialties", ref: specialtiesRef, count: specialtiesArr.length },
    { label: "Tech Stack",  ref: techRef,        count: techArr.length        },
    { label: "Metrics",     ref: metricsRef     },
    { label: "About",       ref: aboutRef       },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      )}

      <aside className={[
        "fixed right-0 top-0 bottom-0 z-50 flex w-[680px] max-w-full flex-col bg-[#ECEBF2] shadow-2xl border-l border-gray-200 [font-family:var(--font-plus-jakarta-sans)]",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      ].join(" ")}>

        {/* ══════════ HEADER ══════════ */}
        <div className="shrink-0 bg-white border-b border-gray-100">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Company</span>
            </div>
            <button type="button" onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Identity row */}
          <div className="flex items-start gap-4 px-5 pb-4">
            <CompanyAvatar name={name} logoUrl={d?.logo_url} website={d?.website} />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold text-gray-900 leading-tight tracking-tight">{name}</h2>
                {d?.is_public && (
                  <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    PUBLIC
                  </span>
                )}
              </div>
              {d?.industry && (
                <p className="mt-0.5 text-[13px] font-semibold text-blue-600 leading-snug capitalize">{d.industry}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {(d?.hq_city || d?.hq_country) && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0 text-red-400" />
                    {[d?.hq_city, d?.hq_state, d?.hq_country].filter(Boolean).join(", ")}
                  </span>
                )}
                {d?.founded && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <Building2 className="h-3 w-3 shrink-0 text-red-400" />Est. {d.founded}
                  </span>
                )}
                {(d?.employees_count != null && d.employees_count > 0) && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <Users className="h-3 w-3 shrink-0 text-red-400" />
                    {d.employees_count.toLocaleString("en-US")} employees
                  </span>
                )}
                {(!d?.employees_count && d?.size_range) && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <Users className="h-3 w-3 shrink-0 text-red-400" />{d.size_range}
                  </span>
                )}
              </div>
              {d?.type && (
                <div className="mt-1.5">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 capitalize">
                    {d.type.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Social icon buttons – LinkedIn + Website */}
          <div className="flex items-center gap-2 px-5 pb-4">
            {companyLinkedIn ? (
              <a
                href={`https://${companyLinkedIn.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <LinkedInSVG />
              </a>
            ) : (
              <span className="opacity-30 cursor-not-allowed" title="LinkedIn not available">
                <LinkedInSVG />
              </span>
            )}
            {companyWebsite ? (
              <a
                href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Website"
              >
                <WebsiteSVG />
              </a>
            ) : (
              <span className="opacity-30 cursor-not-allowed" title="Website not available">
                <WebsiteSVG />
              </span>
            )}
          </div>
        </div>

        {/* ══════════ SECTION NAV ══════════ */}
        <div className="shrink-0 relative flex items-stretch bg-white border-b border-gray-200">
          <button type="button" onClick={() => scrollTabNav("left")}
            className={`shrink-0 flex items-center justify-center w-7 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors z-10 border-r border-gray-100 ${canScrollLeft ? "" : "invisible pointer-events-none"}`}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div ref={tabNavRef} className="flex overflow-x-auto scrollbar-hide flex-1">
            {NAV.map((item) => (
              <button key={item.label} type="button" data-tab={item.label} onClick={() => scrollTo(item.label, item.ref)}
                className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-[13px] font-bold transition-all border-b-2 ${
                  activeTab === item.label
                    ? "text-red-500 border-red-500 bg-red-50"
                    : "text-gray-800 border-transparent hover:text-red-500 hover:bg-gray-50"
                }`}>
                {item.label}
                {item.count != null && item.count > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => scrollTabNav("right")}
            className={`shrink-0 flex items-center justify-center w-7 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors z-10 border-l border-gray-100 ${canScrollRight ? "" : "invisible pointer-events-none"}`}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ══════════ CONTENT ══════════ */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-md border border-gray-100">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              </div>
              <p className="text-[12px] text-gray-400">Loading company…</p>
            </div>
          )}

          {!loading && d && (
            <div className="px-4 py-5 space-y-5">

              {/* ── OVERVIEW ── */}
              <div ref={overviewRef}>
                {detail?.description && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-3">About</p>
                    <p className="text-[13px] font-medium text-gray-900 whitespace-pre-line">{detail.description}</p>
                  </div>
                )}
                {(d.employees_count != null || d.company_employee_reviews_aggregate_score != null || d.active_job_postings != null) && (
                  <div className={`grid grid-cols-3 gap-2 ${detail?.description ? "mt-4" : ""}`}>
                    {(d.employees_count != null && d.employees_count > 0) && (
                      <MetricCard icon={<Users className="h-3 w-3" />} label="Employees"
                        value={d.employees_count > 999 ? `${(d.employees_count / 1000).toFixed(1)}K` : d.employees_count.toLocaleString("en-US")} />
                    )}
                    {(!d.employees_count && d.size_range) && (
                      <MetricCard icon={<Users className="h-3 w-3" />} label="Size" value={d.size_range} />
                    )}
                    {d.company_employee_reviews_aggregate_score != null && (
                      <MetricCard icon={<Star className="h-3 w-3" />} label="Rating"
                        value={`★ ${d.company_employee_reviews_aggregate_score.toFixed(1)}`} accent />
                    )}
                    {d.active_job_postings != null && (
                      <MetricCard icon={<Briefcase className="h-3 w-3" />} label="Open Jobs" value={String(d.active_job_postings)} />
                    )}
                  </div>
                )}
                {!detail?.description && d.employees_count == null && d.company_employee_reviews_aggregate_score == null && d.active_job_postings == null && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Overview</p>
                    <Empty icon={<Building2 className="h-7 w-7" />} text="No overview available" />
                  </div>
                )}
              </div>

              {/* ── SPECIALTIES ── */}
              <div ref={specialtiesRef}>
                {specialtiesArr.length > 0 ? (
                  <ChipsSection title="Specialties" items={specialtiesArr} />
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Specialties</p>
                    <Empty icon={<Layers className="h-7 w-7" />} text="No specialties listed" />
                  </div>
                )}
              </div>

              {/* ── TECH STACK ── */}
              <div ref={techRef}>
                {techArr.length > 0 ? (
                  <ChipsSection title="Tech Stack" items={techArr} colorize />
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Tech Stack</p>
                    <Empty icon={<Zap className="h-7 w-7" />} text="No technologies listed" />
                  </div>
                )}
              </div>

              {/* ── METRICS ── */}
              <div ref={metricsRef} className="space-y-4">
                {(d.employees_count != null || d.size_range) && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[15px] font-bold text-gray-900">Headcount</p>
                      {d.employees_count_change?.change_yearly_percentage != null && (
                        <GrowthBadge pct={d.employees_count_change.change_yearly_percentage} />
                      )}
                    </div>
                    <div className="flex items-end gap-3">
                      <p className="text-[28px] font-extrabold leading-none text-gray-900">
                        {d.employees_count != null && d.employees_count > 0
                          ? d.employees_count.toLocaleString("en-US")
                          : d.size_range ?? "—"}
                      </p>
                      <p className="mb-1 text-[12px] font-semibold text-gray-800">employees</p>
                    </div>
                    {d.employees_count_change?.change_yearly_percentage != null && (
                      <p className="mt-1.5 text-[12px] font-semibold text-gray-800">
                        {d.employees_count_change.change_yearly_percentage >= 0 ? "+" : ""}
                        {d.employees_count_change.change_yearly_percentage.toFixed(1)}% year-over-year
                      </p>
                    )}
                  </div>
                )}

                {d.total_website_visits_monthly != null && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[15px] font-bold text-gray-900">Monthly Web Traffic</p>
                      {d.total_website_visits_change?.change_monthly_percentage != null && (
                        <GrowthBadge pct={d.total_website_visits_change.change_monthly_percentage} />
                      )}
                    </div>
                    <div className="flex items-end gap-3">
                      <p className="text-[28px] font-extrabold leading-none text-gray-900">
                        {d.total_website_visits_monthly > 1_000_000
                          ? `${(d.total_website_visits_monthly / 1_000_000).toFixed(1)}M`
                          : d.total_website_visits_monthly > 999
                          ? `${(d.total_website_visits_monthly / 1000).toFixed(0)}K`
                          : d.total_website_visits_monthly.toLocaleString("en-US")}
                      </p>
                      <p className="mb-1 text-[12px] font-semibold text-gray-800">visits / mo</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {revenueLabel && (
                    <MetricCard icon={<DollarSign className="h-3 w-3" />} label="Revenue" value={revenueLabel} accent />
                  )}
                  {d.active_job_postings != null && (
                    <MetricCard icon={<Briefcase className="h-3 w-3" />} label="Open Jobs" value={String(d.active_job_postings)} />
                  )}
                  {d.company_employee_reviews_aggregate_score != null && (
                    <MetricCard icon={<Star className="h-3 w-3" />} label="Employee Rating"
                      value={`★ ${d.company_employee_reviews_aggregate_score.toFixed(1)}`} sub="aggregate score" />
                  )}
                </div>

                {!d.employees_count && !d.total_website_visits_monthly && !revenueLabel && d.active_job_postings == null && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Metrics</p>
                    <Empty icon={<BarChart2 className="h-7 w-7" />} text="No metrics available" />
                  </div>
                )}
              </div>

              {/* ── ABOUT ── */}
              <div ref={aboutRef} className="space-y-4">
                {d.last_funding_round && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Last Funding Round</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {d.last_funding_round.type && (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-700">
                          {d.last_funding_round.type}
                        </span>
                      )}
                      {d.last_funding_round.amount_raised != null && (
                        <span className="text-[26px] font-extrabold text-gray-900">
                          {fmtMoney(d.last_funding_round.amount_raised)}
                        </span>
                      )}
                    </div>
                    {!!((d.last_funding_round as Record<string, unknown>)["date"]) && (
                      <p className="mt-2 text-[12px] font-semibold text-gray-800">{String((d.last_funding_round as Record<string, unknown>)["date"])}</p>
                    )}
                  </div>
                )}

                {awardsArr.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Awards & Certifications</p>
                    <div className="space-y-2">
                      {awardsArr.map((a, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                            <Award className="h-3 w-3 text-amber-500" />
                          </div>
                          <p className="text-[13px] font-semibold text-gray-900 leading-snug">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {keywordsArr.length > 0 && (
                  <KeywordsSection items={keywordsArr} />
                )}

                {d.company_status && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-3">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${d.company_status.toLowerCase() === "active" ? "bg-emerald-400" : "bg-gray-300"}`} />
                      <span className="text-[14px] font-semibold capitalize text-gray-800">{d.company_status}</span>
                    </div>
                  </div>
                )}

                {!d.last_funding_round && !awardsArr.length && !keywordsArr.length && !d.company_status && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">About</p>
                    <Empty icon={<Layers className="h-7 w-7" />} text="No additional info available" />
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </aside>
    </>
  );
}
