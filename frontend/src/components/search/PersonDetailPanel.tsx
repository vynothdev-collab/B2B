"use client";
import { useEffect, useState } from "react";
import {
  X, MapPin, Mail, Phone, Globe, Briefcase,
  GraduationCap, Loader2, ExternalLink, Award, Users, Clock,
  BookOpen, FlaskConical, FolderGit2, Heart, Building, Quote,
  Trophy, FileText,
} from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

import { apiClient } from "@/lib/api";
import type { PersonResult } from "@/types/search";

type Tab = "experience" | "skills" | "education" | "certifications" | "projects" | "about";

interface WorkEntry {
  company_name: string | null; company_logo_url: string | null;
  company_website: string | null; company_linkedin_url: string | null;
  title: string | null; start_date: string | null; end_date: string | null;
  is_current: boolean; duration: string | null; location: string | null; description: string | null;
}
interface EduEntry {
  school: string | null; school_logo_url: string | null; degree: string | null;
  field: string | null; start_year: string | null; end_year: string | null; activities: string | null;
}
interface CertEntry { title: string | null; issuer: string | null; date: string | null; url: string | null; }
interface LangEntry { language: string; proficiency: string | null; }
interface PatentEntry {
  title: string | null; status: string | null; date: string | null;
  url: string | null; description: string | null; patent_number: string | null; inventors: string[];
}
interface ProjectEntry {
  name: string | null; url: string | null; description: string | null;
  start_date: string | null; end_date: string | null; members: string[];
}
interface PublicationEntry {
  title: string | null; publisher: string | null; date: string | null;
  url: string | null; description: string | null; authors: string[];
}
interface VolunteerEntry {
  organization: string | null; role: string | null; cause: string | null;
  start_date: string | null; end_date: string | null; duration: string | null; description: string | null;
}
interface OrgEntry {
  name: string | null; position: string | null; description: string | null;
  start_date: string | null; end_date: string | null;
}
interface CourseEntry { title: string | null; organizer: string | null; }
interface AwardEntry { title: string | null; issuer: string | null; date: string | null; description: string | null; }
interface RecommendationEntry { text: string | null; from_name: string | null; from_url: string | null; }
interface TestScoreEntry { title: string | null; score: string | null; date: string | null; description: string | null; }

interface PersonDetail extends PersonResult {
  email: string | null; summary: string | null;
  work_history: WorkEntry[]; education: EduEntry[]; certifications: CertEntry[];
  languages: LangEntry[]; total_experience: string | null;
  patents: PatentEntry[]; projects: ProjectEntry[]; publications: PublicationEntry[];
  volunteering: VolunteerEntry[]; organizations: OrgEntry[]; courses: CourseEntry[];
  awards: AwardEntry[]; recommendations: RecommendationEntry[];
  test_scores: TestScoreEntry[]; websites: string[];
}

interface Props { person: PersonResult | null; onClose: () => void; }

/* ─── palette ─── */
const AVATAR_COLORS = [
  "bg-red-500", "bg-blue-600", "bg-emerald-600",
  "bg-purple-600", "bg-orange-500", "bg-pink-600", "bg-teal-600",
];
const SKILL_CHIPS = [
  "bg-red-50 text-red-700 border-red-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-teal-50 text-teal-700 border-teal-200",
];

/* ─── sub-components ─── */
function Avatar({ name, src }: { name: string; src?: string | null }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [src]);
  if (src && !err)
    return (
      <img src={src} alt={name}
        className="h-[60px] w-[60px] shrink-0 rounded-full object-cover ring-[3px] ring-white shadow-md"
        onError={() => setErr(true)} />
    );
  const letters = name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-white shadow-md ring-[3px] ring-white ${bg}`}>
      {letters}
    </div>
  );
}

function fmtMo(d?: string | null, current?: boolean) {
  if (current) return "Present";
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
function fmtRange(start?: string | null, end?: string | null, current?: boolean) {
  const s = fmtMo(start);
  const e = current ? "Present" : fmtMo(end);
  if (!s && !e) return null;
  return e ? `${s} – ${e}` : s;
}
function metaStr(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join("  ·  ");
}

/* Section label */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">{children}</span>
      <div className="h-px flex-1 bg-gray-100" />
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

/* Meta pills row */
function Meta({ parts }: { parts: (string | null | undefined)[] }) {
  const valid = parts.filter(Boolean) as string[];
  if (!valid.length) return null;
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-gray-400 leading-snug">
      {valid.map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300">·</span>}
          {v}
        </span>
      ))}
    </p>
  );
}

/* Entry row — used for work history, education, etc. */
function EntryRow({
  logo, logoFallback, title, subtitle, subtitleHref, meta, description,
  badge, badgeColor = "blue", isCurrent,
}: {
  logo?: string | null;
  logoFallback: React.ReactNode;
  title: string;
  subtitle?: string | null;
  subtitleHref?: string | null;
  meta?: (string | null | undefined)[];
  description?: string | null;
  badge?: string | null;
  badgeColor?: "blue" | "green" | "red";
  isCurrent?: boolean;
}) {
  const badgeCls = {
    blue: "bg-blue-50 text-blue-600 border border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    red: "bg-red-50 text-red-600 border border-red-200",
  }[badgeColor];

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-b-0">
      {/* Logo */}
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-gray-100 bg-gray-50 ${isCurrent ? "ring-2 ring-red-400/30" : ""}`}>
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).replaceWith(
              Object.assign(document.createElement("span"), { className: "flex h-full w-full items-center justify-center" })
            ); }} />
        ) : logoFallback}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-gray-900 leading-snug">{title}</p>
          {badge && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeCls}`}>{badge}</span>
          )}
        </div>
        {subtitle && (
          subtitleHref ? (
            <a href={subtitleHref.startsWith("http") ? subtitleHref : `https://${subtitleHref}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-0.5 block text-[12px] font-medium text-red-500 hover:text-red-600 hover:underline">
              {subtitle}
            </a>
          ) : (
            <p className="mt-0.5 text-[12px] font-medium text-gray-500">{subtitle}</p>
          )
        )}
        {meta && <Meta parts={meta} />}
        {description && (
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-gray-500 line-clamp-3">{description}</p>
        )}
      </div>
    </div>
  );
}

/* Generic info card */
function InfoCard({ icon, iconColor, iconBg, title, subtitle, meta, description, extra, actionUrl, actionLabel }: {
  icon: React.ReactNode; iconColor: string; iconBg: string;
  title: string; subtitle?: string | null;
  meta?: (string | null | undefined)[];
  description?: string | null;
  extra?: React.ReactNode;
  actionUrl?: string | null;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-gray-900 leading-snug">{title}</p>
            {actionUrl && (
              <a href={actionUrl.startsWith("http") ? actionUrl : `https://${actionUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors">
                <ExternalLink className="h-3 w-3" />{actionLabel ?? "View"}
              </a>
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-[12px] text-gray-500">{subtitle}</p>}
          {meta && <Meta parts={meta} />}
          {description && <p className="mt-1.5 text-[11.5px] leading-relaxed text-gray-500 line-clamp-3">{description}</p>}
          {extra}
        </div>
      </div>
    </div>
  );
}

/* Pill row (members / authors / inventors) */
function PillRow({ items, color = "gray" }: { items: string[]; color?: "gray" | "red" | "blue" | "emerald" | "orange" }) {
  if (!items.length) return null;
  const cls = {
    gray: "bg-gray-100 text-gray-600",
    red: "bg-red-50 text-red-600 border border-red-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    orange: "bg-orange-50 text-orange-700 border border-orange-100",
  }[color];
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {items.map((m, i) => <span key={i} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{m}</span>)}
    </div>
  );
}

/* ═══════════════════════════
   MAIN COMPONENT
═══════════════════════════ */
export default function PersonDetailPanel({ person, onClose }: Props) {
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("experience");

  useEffect(() => {
    if (!person) { setDetail(null); return; }
    setDetail(null);
    setTab("experience");
    setLoading(true);
    apiClient.get<PersonDetail>(`/search/persons/${person.id}/detail`)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail({
        ...person, email: null, summary: null, work_history: [], education: [],
        certifications: [], languages: [], total_experience: null, patents: [], projects: [],
        publications: [], volunteering: [], organizations: [], courses: [], awards: [],
        recommendations: [], test_scores: [], websites: [],
      }))
      .finally(() => setLoading(false));
  }, [person?.id]);

  const isOpen = !!person;
  const d = detail ?? person;
  const fullName = d ? d.full_name || `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || "—" : "";
  const titleLine = (d?.active_experience_title ?? "") as string;
  const companyLine = (d?.active_experience_company_name ?? "") as string;
  const showCompany = companyLine && companyLine.toLowerCase() !== titleLine.toLowerCase();

  const projCount = (detail?.projects.length ?? 0) + (detail?.publications.length ?? 0) + (detail?.patents.length ?? 0);
  const certCount = (detail?.certifications.length ?? 0) + (detail?.courses.length ?? 0) + (detail?.awards.length ?? 0);

  const TABS: { id: Tab; label: string }[] = [
    { id: "experience",     label: "Experience"     },
    { id: "skills",         label: "Skills"         },
    { id: "education",      label: "Education"      },
    { id: "certifications", label: "Certifications" },
    { id: "projects",       label: "Projects"       },
    { id: "about",          label: "About"          },
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
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Profile</span>
            </div>
            <button type="button" onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Identity */}
          <div className="flex items-start gap-4 px-5 pb-4">
            <Avatar name={fullName} src={d?.picture_url as string | null} />
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="text-[16px] font-bold text-gray-900 leading-tight tracking-tight">{fullName}</h2>
              {titleLine ? (
                <p className="mt-0.5 text-[12.5px] text-gray-500 leading-snug">
                  {titleLine}
                  {showCompany && (
                    <> · <span className="font-semibold text-red-500">{companyLine}</span></>
                  )}
                </p>
              ) : d?.headline ? (
                <p className="mt-0.5 text-[12.5px] text-gray-500 line-clamp-2 leading-snug">{d.headline as string}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {(d?.location_city || d?.location_country) && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0 text-red-400" />
                    {[d?.location_city, d?.location_state, d?.location_country].filter(Boolean).join(", ")}
                  </span>
                )}
                {detail?.total_experience && (
                  <span className="flex items-center gap-1 text-[11.5px] text-gray-400">
                    <Clock className="h-3 w-3 shrink-0 text-red-400" />{detail.total_experience}
                  </span>
                )}
              </div>

              {/* Connection stats */}
              {(d?.connections_count != null || d?.follower_count != null) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d?.connections_count != null && (
                    <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                      <Users className="h-3 w-3 text-red-400" />
                      {Number(d.connections_count).toLocaleString("en-US")} connections
                    </span>
                  )}
                  {d?.follower_count != null && (
                    <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                      {Number(d.follower_count).toLocaleString("en-US")} followers
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact info block */}
          <div className="mx-5 mb-4 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
            {/* Email */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-gray-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 border border-red-100">
                <Mail className="h-3.5 w-3.5 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</p>
                {(detail as PersonDetail | null)?.email ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${(detail as PersonDetail).email}`; }}
                    className="block truncate text-[12.5px] font-semibold text-red-500 hover:text-red-600 hover:underline transition-colors text-left w-full">
                    {(detail as PersonDetail).email}
                  </button>
                ) : (
                  <p className="text-[12.5px] font-medium text-gray-400">
                    {d?.has_email ? "Email available — reveal to view" : "—"}
                  </p>
                )}
              </div>
              {(detail as PersonDetail | null)?.email && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${(detail as PersonDetail).email}`; }}
                  className="shrink-0 rounded-lg bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-600 transition-colors">
                  Send
                </button>
              )}
            </div>

            {/* Work Email */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-gray-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                <Briefcase className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Work Email</p>
                <p className="text-[12.5px] font-medium text-gray-400">—</p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-3 px-3.5 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mobile</p>
                {d?.mobile_phone ? (
                  <a href={`tel:${d.mobile_phone as string}`}
                    className="block text-[12.5px] font-semibold text-gray-800 hover:text-emerald-600 transition-colors">
                    {d.mobile_phone as string}
                  </a>
                ) : (
                  <p className="text-[12.5px] font-medium text-gray-400">—</p>
                )}
              </div>
              {d?.mobile_phone && (
                <a href={`tel:${d.mobile_phone as string}`}
                  className="shrink-0 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-600 transition-colors">
                  Call
                </a>
              )}
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex flex-wrap gap-2 px-5 pb-4">
            {d?.linkedin_url && (
              <a href={`https://${(d.linkedin_url as string).replace(/^https?:\/\//, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-[#0A66C2] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#085099] transition-colors">
                <LinkedInIcon className="h-3.5 w-3.5" />LinkedIn
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            )}
            {detail?.websites?.map((url, i) => (
              <a key={i} href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <Globe className="h-3.5 w-3.5 text-gray-400" />Website
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            ))}
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
              {t.id === "projects" && projCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {projCount}
                </span>
              )}
              {t.id === "certifications" && certCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {certCount}
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
              <p className="text-[12px] text-gray-400">Loading profile…</p>
            </div>
          )}

          {!loading && d && (
            <div className="px-4 py-5 space-y-6">

              {/* ══ EXPERIENCE ══ */}
              {tab === "experience" && (
                <>
                  {detail?.work_history && detail.work_history.length > 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Work History</span>
                        {detail.total_experience && (
                          <span className="flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                            <Clock className="h-3 w-3" />{detail.total_experience}
                          </span>
                        )}
                      </div>
                      <div className="px-4 pb-1">
                        {detail.work_history.map((w, i) => (
                          <EntryRow key={i}
                            logo={w.company_logo_url}
                            logoFallback={<Briefcase className="h-4 w-4 text-gray-400" />}
                            title={w.title ?? "—"}
                            subtitle={w.company_name}
                            subtitleHref={w.company_website}
                            meta={[fmtRange(w.start_date, w.end_date, w.is_current), w.duration, w.location]}
                            description={w.description}
                            badge={w.is_current ? "Current" : undefined}
                            badgeColor="red"
                            isCurrent={w.is_current}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Empty icon={<Briefcase className="h-8 w-8" />} text="No work experience listed" />
                  )}

                  {detail?.volunteering && detail.volunteering.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Volunteering</span>
                      </div>
                      <div className="px-4 pb-1">
                        {detail.volunteering.map((v, i) => (
                          <EntryRow key={i}
                            logo={null}
                            logoFallback={<Heart className="h-4 w-4 text-red-400" />}
                            title={v.role ?? "Volunteer"}
                            subtitle={v.organization}
                            meta={[v.cause, fmtRange(v.start_date, v.end_date), v.duration]}
                            description={v.description}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ══ SKILLS ══ */}
              {tab === "skills" && (
                <>
                  {Array.isArray(d.inferred_skills) && (d.inferred_skills as string[]).length > 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Skills</span>
                        <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-500">
                          {(d.inferred_skills as string[]).length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(d.inferred_skills as string[]).map((s, i) => (
                          <span key={i} className={`rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize ${SKILL_CHIPS[i % SKILL_CHIPS.length]}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Empty icon={<Award className="h-8 w-8" />} text="No skills listed" />
                  )}

                </>
              )}

              {/* ══ CERTIFICATIONS ══ */}
              {tab === "certifications" && (
                <>
                  {detail?.certifications && detail.certifications.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Certifications</span>
                        <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-500">
                          {detail.certifications.length}
                        </span>
                      </div>
                      <div className="px-4 pb-1">
                        {detail.certifications.map((c, i) => (
                          <EntryRow key={i}
                            logo={null}
                            logoFallback={<Award className="h-4 w-4 text-yellow-500" />}
                            title={c.title ?? "Certificate"}
                            subtitle={c.issuer}
                            meta={[c.date ? fmtMo(c.date) : null]}
                            subtitleHref={c.url}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {detail?.courses && detail.courses.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Courses</span>
                        <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-500">
                          {detail.courses.length}
                        </span>
                      </div>
                      <div className="px-4 pb-1">
                        {detail.courses.map((c, i) => (
                          <EntryRow key={i}
                            logo={null}
                            logoFallback={<BookOpen className="h-4 w-4 text-teal-500" />}
                            title={c.title ?? "Course"}
                            subtitle={c.organizer}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {detail?.awards && detail.awards.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Awards</span>
                        <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[11px] font-bold text-red-500">
                          {detail.awards.length}
                        </span>
                      </div>
                      <div className="px-4 pb-1">
                        {detail.awards.map((a, i) => (
                          <EntryRow key={i}
                            logo={null}
                            logoFallback={<Trophy className="h-4 w-4 text-amber-500" />}
                            title={a.title ?? "Award"}
                            subtitle={a.issuer}
                            meta={[a.date ? fmtMo(a.date) : null]}
                            description={a.description}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!detail?.certifications?.length && !detail?.courses?.length && !detail?.awards?.length && (
                    <Empty icon={<Award className="h-8 w-8" />} text="No certifications, courses or awards" />
                  )}
                </>
              )}

              {/* ══ EDUCATION ══ */}
              {tab === "education" && (
                <>
                  {detail?.education && detail.education.length > 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Education</span>
                      </div>
                      <div className="px-4 pb-1">
                        {detail.education.map((e, i) => (
                          <EntryRow key={i}
                            logo={e.school_logo_url}
                            logoFallback={<GraduationCap className="h-4 w-4 text-blue-400" />}
                            title={e.school ?? "—"}
                            subtitle={[e.degree, e.field].filter(Boolean).join(" · ") || null}
                            meta={[e.start_year && e.end_year ? `${e.start_year} – ${e.end_year}` : (e.start_year ?? e.end_year)]}
                            description={e.activities}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Empty icon={<GraduationCap className="h-8 w-8" />} text="No education listed" />
                  )}

                  {detail?.organizations && detail.organizations.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Organizations</span>
                      </div>
                      <div className="px-4 pb-1">
                        {detail.organizations.map((o, i) => (
                          <EntryRow key={i}
                            logo={null}
                            logoFallback={<Building className="h-4 w-4 text-indigo-500" />}
                            title={o.name ?? "Organization"}
                            subtitle={o.position}
                            meta={[fmtRange(o.start_date, o.end_date)]}
                            description={o.description}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {detail?.test_scores && detail.test_scores.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 pt-3.5 pb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Test Scores</span>
                      </div>
                      <div className="divide-y divide-gray-50 px-4 pb-1">
                        {detail.test_scores.map((ts, i) => (
                          <div key={i} className="flex items-center justify-between py-3.5">
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-gray-900">{ts.title}</p>
                              {ts.date && <p className="text-[11px] text-gray-400 mt-0.5">{fmtMo(ts.date)}</p>}
                              {ts.description && <p className="mt-1 text-[11.5px] text-gray-500 line-clamp-2">{ts.description}</p>}
                            </div>
                            {ts.score && (
                              <span className="ml-4 shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-[16px] font-bold text-green-600">
                                {ts.score}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ══ PROJECTS ══ */}
              {tab === "projects" && (
                <>
                  {detail?.projects && detail.projects.length > 0 && (
                    <div className="space-y-2.5">
                      <Label>Projects</Label>
                      {detail.projects.map((p, i) => (
                        <InfoCard key={i}
                          icon={<FolderGit2 className="h-4 w-4" />}
                          iconColor="text-violet-600"
                          iconBg="bg-violet-50"
                          title={p.name ?? "—"}
                          meta={[fmtRange(p.start_date, p.end_date)]}
                          description={p.description}
                          actionUrl={p.url}
                          actionLabel="View"
                          extra={<PillRow items={p.members} color="gray" />}
                        />
                      ))}
                    </div>
                  )}

                  {detail?.publications && detail.publications.length > 0 && (
                    <div className="space-y-2.5">
                      <Label>Publications</Label>
                      {detail.publications.map((p, i) => (
                        <InfoCard key={i}
                          icon={<FileText className="h-4 w-4" />}
                          iconColor="text-emerald-600"
                          iconBg="bg-emerald-50"
                          title={p.title ?? "—"}
                          subtitle={metaStr([p.publisher, p.date ? fmtMo(p.date) : null]) || null}
                          description={p.description}
                          actionUrl={p.url}
                          actionLabel="Read"
                          extra={<PillRow items={p.authors} color="emerald" />}
                        />
                      ))}
                    </div>
                  )}

                  {detail?.patents && detail.patents.length > 0 && (
                    <div className="space-y-2.5">
                      <Label>Patents</Label>
                      {detail.patents.map((p, i) => (
                        <InfoCard key={i}
                          icon={<FlaskConical className="h-4 w-4" />}
                          iconColor="text-orange-500"
                          iconBg="bg-orange-50"
                          title={p.title ?? "—"}
                          subtitle={metaStr([p.patent_number, p.date ? fmtMo(p.date) : null]) || null}
                          description={p.description}
                          actionUrl={p.url}
                          actionLabel="View"
                          extra={
                            <>
                              {p.status && (
                                <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status.toLowerCase() === "granted" ? "bg-green-50 border border-green-200 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                  {p.status}
                                </span>
                              )}
                              <PillRow items={p.inventors} color="orange" />
                            </>
                          }
                        />
                      ))}
                    </div>
                  )}

                  {!detail?.projects?.length && !detail?.publications?.length && !detail?.patents?.length && (
                    <Empty icon={<FolderGit2 className="h-8 w-8" />} text="No projects, publications or patents" />
                  )}
                </>
              )}

              {/* ══ ABOUT ══ */}
              {tab === "about" && (
                <>
                  {/* Summary */}
                  {detail?.summary && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Summary</span>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-gray-700 whitespace-pre-line">{detail.summary}</p>
                    </div>
                  )}

                  {/* Current company */}
                  {d?.active_experience_company_name && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Current Company</span>
                      <div className="mt-3 flex items-center gap-3">
                        {d.active_experience_company_logo_url ? (
                          <img src={d.active_experience_company_logo_url as string} alt=""
                            className="h-10 w-10 rounded-lg border border-gray-100 object-contain"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">{d.active_experience_company_name as string}</p>
                          {d.active_experience_company_industry && (
                            <p className="text-[12px] capitalize text-gray-500">{d.active_experience_company_industry as string}</p>
                          )}
                        </div>
                      </div>
                      {(d.active_experience_company_employees_count != null || d.active_experience_company_founded) && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {d.active_experience_company_employees_count != null && (
                            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Employees</p>
                              <p className="mt-0.5 text-[13px] font-bold text-gray-800">
                                {d.active_experience_company_size
                                  ? (d.active_experience_company_size as string)
                                  : Number(d.active_experience_company_employees_count).toLocaleString("en-US")}
                              </p>
                            </div>
                          )}
                          {d.active_experience_company_founded && (
                            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Founded</p>
                              <p className="mt-0.5 text-[13px] font-bold text-gray-800">{String(d.active_experience_company_founded)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {(d.active_experience_company_website || d.active_experience_company_linkedin_url) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {d.active_experience_company_website && (
                            <a href={(d.active_experience_company_website as string).startsWith("http") ? (d.active_experience_company_website as string) : `https://${d.active_experience_company_website}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                              <Globe className="h-3.5 w-3.5 text-gray-400" />Website<ExternalLink className="h-3 w-3 text-gray-400" />
                            </a>
                          )}
                          {d.active_experience_company_linkedin_url && (
                            <a href={`https://${String(d.active_experience_company_linkedin_url).replace(/^https?:\/\//, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 px-3 py-1.5 text-[12px] font-medium text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors">
                              <LinkedInIcon className="h-3.5 w-3.5" />LinkedIn<ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Languages */}
                  {detail?.languages && detail.languages.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Languages</span>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {detail.languages.map((l, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                            <span className="text-[13px] font-semibold text-gray-800">{l.language}</span>
                            {l.proficiency && (
                              <span className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 shadow-sm">
                                {l.proficiency}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {detail?.recommendations && detail.recommendations.length > 0 && (
                    <div className="space-y-2.5">
                      <Label>Recommendations · {detail.recommendations.length}</Label>
                      {detail.recommendations.map((r, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                          <div className="mb-2 flex items-center gap-1.5">
                            <div className="h-px flex-1 bg-red-100" />
                            <Quote className="h-4 w-4 text-red-300" />
                            <div className="h-px flex-1 bg-red-100" />
                          </div>
                          <p className="text-[12.5px] leading-relaxed text-gray-600 italic">{r.text}</p>
                          {r.from_name && (
                            <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-[12px] font-bold text-red-500">
                                {r.from_name.charAt(0).toUpperCase()}
                              </div>
                              {r.from_url ? (
                                <a href={r.from_url.startsWith("http") ? r.from_url : `https://${r.from_url}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="text-[12px] font-semibold text-blue-600 hover:underline">{r.from_name}</a>
                              ) : (
                                <span className="text-[12px] font-semibold text-gray-700">{r.from_name}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!detail?.summary && !d?.active_experience_company_name && !detail?.languages?.length && !detail?.recommendations?.length && (
                    <Empty icon={<Globe className="h-8 w-8" />} text="No additional info available" />
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
