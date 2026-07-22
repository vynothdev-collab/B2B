"use client";
import { useEffect, useState } from "react";
import {
  X, MapPin, Globe, Briefcase, Users, TrendingUp, DollarSign,
  Award, Loader2, ExternalLink, Star, Zap, BarChart2, Building2,
  ChevronUp, ChevronDown, Mail, Phone, Layers,
} from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

import { fmtMoney, toStringArr } from "@/components/common/tableHelpers";
import { apiClient } from "@/lib/api";
import type { CompanyResult } from "@/types/search";

interface CompanyDetail extends CompanyResult {
  description: string | null;
  specialties: string | string[] | null;
  phone: string | null;
  email: string | null;
}

type Tab = "overview" | "metrics" | "tech" | "about";

interface Props {
  company: CompanyResult | null;
  onClose: () => void;
}

/* ─── palette ─── */
const LOGO_COLORS = [
  "bg-red-500", "bg-blue-600", "bg-emerald-600",
  "bg-purple-600", "bg-orange-500", "bg-pink-600", "bg-teal-600",
];

const TECH_CHIPS = [
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
];

/* ─── sub-components ─── */
function CompanyAvatar({ name, logoUrl, website }: { name: string; logoUrl?: string | null; website?: string | null }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [logoUrl]);
  const initials = name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const bg = LOGO_COLORS[name.charCodeAt(0) % LOGO_COLORS.length];

  const src = logoUrl || (website ? `https://logo.clearbit.com/${website.replace(/^https?:\/\//, "").split("/")[0]}` : null);

  if (src && !err) {
    return (
      <img src={src} alt={name}
        className="h-[60px] w-[60px] shrink-0 rounded-xl object-contain border border-gray-100 bg-white p-1 shadow-md ring-[3px] ring-white"
        onError={() => setErr(true)} />
    );
  }
  return (
    <div className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl text-[20px] font-bold text-white shadow-md ring-[3px] ring-white ${bg}`}>
      {initials}
    </div>
  );
}

/* Empty state */
function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-gray-300">
      <div className="rounded-2xl bg-gray-50 p-4">{icon}</div>
      <p className="text-[13px] text-gray-400 font-medium">{text}</p>
    </div>
  );
}

/* Label divider */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">{children}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

/* Metric card */
function MetricCard({
  icon, label, value, sub, accent = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${accent ? "border-red-100 bg-red-50" : "border-gray-100 bg-white shadow-sm"}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${accent ? "text-red-400" : "text-gray-400"}`}>
        {icon}{label}
      </div>
      <p className={`mt-1 text-[15px] font-extrabold leading-tight ${accent ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10.5px] text-gray-400">{sub}</p>}
    </div>
  );
}

/* Growth badge */
function GrowthBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-bold ${positive ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-red-50 border border-red-200 text-red-600"}`}>
      {positive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

/* ═══════════════════════════
   MAIN COMPONENT
═══════════════════════════ */
export default function CompanyDetailPanel({ company, onClose }: Props) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!company) { setDetail(null); return; }
    setDetail(null);
    setTab("overview");
    setLoading(true);
    apiClient.get<CompanyDetail>(`/search/companies/${company.id}/detail`)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail({ ...company, description: null, specialties: null, phone: null, email: null }))
      .finally(() => setLoading(false));
  }, [company?.id]);

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

  const hasTech = techArr.length > 0;
  const hasAbout = !!(d?.last_funding_round || awardsArr.length || keywordsArr.length || detail?.email || detail?.phone);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "metrics",  label: "Metrics"  },
    { id: "tech",     label: "Tech"     },
    { id: "about",    label: "About"    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      )}

      <aside className={[
        "fixed right-0 top-0 bottom-0 z-50 flex w-[580px] max-w-full flex-col bg-[#f8f9fb] shadow-2xl border-l border-gray-200",
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

          {/* Identity */}
          <div className="flex items-start gap-4 px-5 pb-4">
            <CompanyAvatar name={name} logoUrl={d?.logo_url} website={d?.website} />
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start gap-2">
                <h2 className="text-[16px] font-bold text-gray-900 leading-tight tracking-tight">{name}</h2>
                {d?.is_public && (
                  <span className="mt-0.5 shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    PUBLIC
                  </span>
                )}
              </div>

              {d?.industry && (
                <p className="mt-0.5 text-[12.5px] capitalize text-gray-500">{d.industry}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {(d?.hq_city || d?.hq_country) && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0 text-red-400" />
                    {[d?.hq_city, d?.hq_state, d?.hq_country].filter(Boolean).join(", ")}
                  </span>
                )}
                {d?.founded && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <Building2 className="h-3 w-3 shrink-0 text-red-400" />
                    Est. {d.founded}
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
                    <Users className="h-3 w-3 shrink-0 text-red-400" />
                    {d.size_range}
                  </span>
                )}
              </div>

              {/* Type badge */}
              {d?.type && (
                <div className="mt-2">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 capitalize">
                    {d.type.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Link row */}
          <div className="flex flex-wrap gap-2 px-5 pb-4">
            {d?.canonical_linkedin_url && (
              <a
                href={`https://${d.canonical_linkedin_url.replace(/^https?:\/\//, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-[#0A66C2] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#085099] transition-colors">
                <LinkedInIcon className="h-3.5 w-3.5" />LinkedIn
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            )}
            {d?.website && (
              <a
                href={d.website.startsWith("http") ? d.website : `https://${d.website}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <Globe className="h-3.5 w-3.5 text-gray-400" />Website
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}
            {detail?.email && (
              <a href={`mailto:${detail.email}`}
                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-red-600 transition-colors">
                <Mail className="h-3.5 w-3.5" />{detail.email}
              </a>
            )}
            {detail?.phone && (
              <a href={`tel:${detail.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <Phone className="h-3.5 w-3.5 text-gray-400" />{detail.phone}
              </a>
            )}
          </div>
        </div>

        {/* ══════════ TABS ══════════ */}
        <div className="shrink-0 flex bg-white border-b border-gray-200 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={[
                "relative shrink-0 whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold transition-all",
                tab === t.id
                  ? "text-red-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-500 after:rounded-t-full"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
              ].join(" ")}>
              {t.label}
              {t.id === "tech" && hasTech && (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {techArr.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════ CONTENT ══════════ */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              </div>
              <p className="text-[12px] text-gray-400">Loading company…</p>
            </div>
          )}

          {!loading && d && (
            <div className="px-4 py-5 space-y-4">

              {/* ══ OVERVIEW ══ */}
              {tab === "overview" && (
                <>
                  {/* Description */}
                  {detail?.description && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">About</span>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-gray-700 whitespace-pre-line">
                        {detail.description}
                      </p>
                    </div>
                  )}

                  {/* Quick stat strip */}
                  {(d.employees_count != null || d.company_employee_reviews_aggregate_score != null || d.active_job_postings != null) && (
                    <div className="grid grid-cols-3 gap-2">
                      {(d.employees_count != null && d.employees_count > 0) && (
                        <MetricCard
                          icon={<Users className="h-3 w-3" />}
                          label="Employees"
                          value={d.employees_count > 999
                            ? `${(d.employees_count / 1000).toFixed(1)}K`
                            : d.employees_count.toLocaleString("en-US")}
                        />
                      )}
                      {(!d.employees_count && d.size_range) && (
                        <MetricCard icon={<Users className="h-3 w-3" />} label="Size" value={d.size_range} />
                      )}
                      {d.company_employee_reviews_aggregate_score != null && (
                        <MetricCard
                          icon={<Star className="h-3 w-3" />}
                          label="Rating"
                          value={`★ ${d.company_employee_reviews_aggregate_score.toFixed(1)}`}
                          accent
                        />
                      )}
                      {d.active_job_postings != null && (
                        <MetricCard
                          icon={<Briefcase className="h-3 w-3" />}
                          label="Open Jobs"
                          value={String(d.active_job_postings)}
                        />
                      )}
                    </div>
                  )}

                  {/* Specialties */}
                  {specialtiesArr.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Specialties</span>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {specialtiesArr.map((s, i) => (
                          <span key={i} className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${TECH_CHIPS[i % TECH_CHIPS.length]}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!detail?.description && specialtiesArr.length === 0 && (
                    <Empty icon={<Building2 className="h-8 w-8" />} text="No overview available" />
                  )}
                </>
              )}

              {/* ══ METRICS ══ */}
              {tab === "metrics" && (
                <>
                  {/* Headcount */}
                  {(d.employees_count != null || d.size_range) && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Headcount</span>
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
                        <p className="mb-1 text-[12px] text-gray-400">employees</p>
                      </div>
                      {d.employees_count_change?.change_yearly_percentage != null && (
                        <p className="mt-1.5 text-[11.5px] text-gray-400">
                          {d.employees_count_change.change_yearly_percentage >= 0 ? "+" : ""}
                          {d.employees_count_change.change_yearly_percentage.toFixed(1)}% year-over-year
                        </p>
                      )}
                    </div>
                  )}

                  {/* Web traffic */}
                  {d.total_website_visits_monthly != null && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Monthly Web Traffic</span>
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
                        <p className="mb-1 text-[12px] text-gray-400">visits / mo</p>
                      </div>
                    </div>
                  )}

                  {/* Revenue + jobs row */}
                  <div className="grid grid-cols-2 gap-2">
                    {revenueLabel && (
                      <MetricCard
                        icon={<DollarSign className="h-3 w-3" />}
                        label="Revenue"
                        value={revenueLabel}
                        accent
                      />
                    )}
                    {d.active_job_postings != null && (
                      <MetricCard
                        icon={<Briefcase className="h-3 w-3" />}
                        label="Open Jobs"
                        value={String(d.active_job_postings)}
                      />
                    )}
                    {d.company_employee_reviews_aggregate_score != null && (
                      <MetricCard
                        icon={<Star className="h-3 w-3" />}
                        label="Employee Rating"
                        value={`★ ${d.company_employee_reviews_aggregate_score.toFixed(1)}`}
                        sub="aggregate score"
                      />
                    )}
                  </div>

                  {!d.employees_count && !d.total_website_visits_monthly && !revenueLabel && d.active_job_postings == null && (
                    <Empty icon={<BarChart2 className="h-8 w-8" />} text="No metrics available" />
                  )}
                </>
              )}

              {/* ══ TECH ══ */}
              {tab === "tech" && (
                <>
                  {techArr.length > 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Tech Stack</span>
                        <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-500">
                          {techArr.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {techArr.map((t, i) => (
                          <span key={i} className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${TECH_CHIPS[i % TECH_CHIPS.length]}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Empty icon={<Zap className="h-8 w-8" />} text="No technologies listed" />
                  )}
                </>
              )}

              {/* ══ ABOUT ══ */}
              {tab === "about" && (
                <>
                  {/* Funding */}
                  {d.last_funding_round && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Last Funding Round</span>
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        {d.last_funding_round.type && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-700">
                            {d.last_funding_round.type}
                          </span>
                        )}
                        {d.last_funding_round.amount_raised != null && (
                          <span className="text-[22px] font-extrabold text-gray-900">
                            {fmtMoney(d.last_funding_round.amount_raised)}
                          </span>
                        )}
                      </div>
                      {d.last_funding_round.date && (
                        <p className="mt-2 text-[12px] text-gray-400">{d.last_funding_round.date}</p>
                      )}
                    </div>
                  )}

                  {/* Awards & Certifications */}
                  {awardsArr.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Awards & Certifications</span>
                      <div className="mt-3 space-y-2">
                        {awardsArr.map((a, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                              <Award className="h-3 w-3 text-amber-500" />
                            </div>
                            <p className="text-[13px] text-gray-700 leading-snug">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {keywordsArr.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Categories & Keywords</span>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {keywordsArr.map((k, i) => (
                          <span key={i} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[12px] font-medium text-gray-600">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company status */}
                  {d.company_status && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</span>
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${d.company_status.toLowerCase() === "active" ? "bg-emerald-400" : "bg-gray-300"}`} />
                        <span className="text-[14px] font-semibold capitalize text-gray-800">{d.company_status}</span>
                      </div>
                    </div>
                  )}

                  {!hasAbout && (
                    <Empty icon={<Layers className="h-8 w-8" />} text="No additional info available" />
                  )}
                </>
              )}

            </div>
          )}
        </div>
      </aside>
    </>
  );
}
