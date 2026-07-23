"use client";
import { useEffect, useRef, useState } from "react";
import {
  X, MapPin, Mail, Phone, Globe, Briefcase,
  GraduationCap, Loader2, ExternalLink, Award, Clock,
  BookOpen, FlaskConical, FolderGit2, Heart, Building, Quote,
  Trophy, FileText, ChevronDown,
} from "lucide-react";

import { apiClient } from "@/lib/api";
import type { PersonResult } from "@/types/search";

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

const AVATAR_COLOR_SETS = [
  { bg: "bg-red-100",     text: "text-red-500"     },
  { bg: "bg-blue-100",    text: "text-blue-600"    },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-purple-100",  text: "text-purple-600"  },
  { bg: "bg-orange-100",  text: "text-orange-500"  },
  { bg: "bg-pink-100",    text: "text-pink-600"    },
  { bg: "bg-teal-100",    text: "text-teal-600"    },
];

function Avatar({ name, src }: { name: string; src?: string | null }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [src]);
  if (src && !err)
    return (
      <img src={src} alt={name}
        className="h-[60px] w-[60px] shrink-0 rounded-xl object-cover"
        onError={() => setErr(true)} />
    );
  const letters = name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colorSet = AVATAR_COLOR_SETS[(name.charCodeAt(0) || 0) % AVATAR_COLOR_SETS.length];
  return (
    <div className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl text-[20px] font-bold ${colorSet.bg} ${colorSet.text}`}>
      {letters}
    </div>
  );
}

function LinkedInSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="path-1-inside-1_481_86" fill="white">
        <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z"/>
      </mask>
      <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z" fill="white"/>
      <path d="M10 0V1H30V0V-1H10V0ZM40 10H39V30H40H41V10H40ZM30 40V39H10V40V41H30V40ZM0 30H1V10H0H-1V30H0ZM10 40V39C5.02944 39 1 34.9706 1 30H0H-1C-1 36.0751 3.92487 41 10 41V40ZM40 30H39C39 34.9706 34.9706 39 30 39V40V41C36.0751 41 41 36.0751 41 30H40ZM30 0V1C34.9706 1 39 5.02944 39 10H40H41C41 3.92487 36.0751 -1 30 -1V0ZM10 0V-1C3.92487 -1 -1 3.92487 -1 10H0H1C1 5.02944 5.02944 1 10 1V0Z" fill="#ECEBF2" mask="url(#path-1-inside-1_481_86)"/>
      <path d="M14.387 26.5V18.31H16.637V26.5H14.387ZM14.387 17.575V15.325H16.637V17.575H14.387ZM18.2835 26.5V18.31H20.3835V19.93L20.2635 19.57C20.4535 19.08 20.7585 18.72 21.1785 18.49C21.6085 18.25 22.1085 18.13 22.6785 18.13C23.2985 18.13 23.8385 18.26 24.2985 18.52C24.7685 18.78 25.1335 19.145 25.3935 19.615C25.6535 20.075 25.7835 20.615 25.7835 21.235V26.5H23.5335V21.715C23.5335 21.395 23.4685 21.12 23.3385 20.89C23.2185 20.66 23.0435 20.48 22.8135 20.35C22.5935 20.22 22.3335 20.155 22.0335 20.155C21.7435 20.155 21.4835 20.22 21.2535 20.35C21.0235 20.48 20.8435 20.66 20.7135 20.89C20.5935 21.12 20.5335 21.395 20.5335 21.715V26.5H18.2835Z" fill="#0A66C2"/>
    </svg>
  );
}

function WebsiteSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="path-1-inside-1_481_89" fill="white">
        <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z"/>
      </mask>
      <path d="M0 10C0 4.47715 4.47715 0 10 0H30C35.5228 0 40 4.47715 40 10V30C40 35.5228 35.5228 40 30 40H10C4.47715 40 0 35.5228 0 30V10Z" fill="white"/>
      <path d="M10 0V1H30V0V-1H10V0ZM40 10H39V30H40H41V10H40ZM30 40V39H10V40V41H30V40ZM0 30H1V10H0H-1V30H0ZM10 40V39C5.02944 39 1 34.9706 1 30H0H-1C-1 36.0751 3.92487 41 10 41V40ZM40 30H39C39 34.9706 34.9706 39 30 39V40V41C36.0751 41 41 36.0751 41 30H40ZM30 0V1C34.9706 1 39 5.02944 39 10H40H41C41 3.92487 36.0751 -1 30 -1V0ZM10 0V-1C3.92487 -1 -1 3.92487 -1 10H0H1C1 5.02944 5.02944 1 10 1V0Z" fill="#ECEBF2" mask="url(#path-1-inside-1_481_89)"/>
      <path d="M20 26.375C23.5208 26.375 26.375 23.5208 26.375 20C26.375 16.4792 23.5208 13.625 20 13.625C16.4792 13.625 13.625 16.4792 13.625 20C13.625 23.5208 16.4792 26.375 20 26.375Z" stroke="#5A5964" strokeWidth="1.275"/>
      <path d="M13.625 20H26.375M20 13.625C21.7708 15.3958 21.7708 24.25 20 26.375C18.2292 24.25 18.2292 15.3958 20 13.625Z" stroke="#5A5964" strokeWidth="1.275" strokeLinecap="round"/>
    </svg>
  );
}

function SeeMoreContacts({ workEmail }: { workEmail: string | null }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-[13px] font-semibold text-red-500 hover:text-red-600 transition-colors mt-1"
      >
        See more contacts (1)
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="mt-2 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
          {workEmail ? (
            <a href={`mailto:${workEmail}`} className="text-[13px] text-gray-700 hover:text-red-500 transition-colors">
              {workEmail}
            </a>
          ) : (
            <span className="text-[13px] text-gray-400">—</span>
          )}
        </div>
      )}
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

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-gray-300">
      <div className="rounded-2xl bg-gray-50 p-4">{icon}</div>
      <p className="text-[13px] text-gray-400 font-medium">{text}</p>
    </div>
  );
}

function TimelineEntry({
  dot = "outline", title, subtitle, subtitleHref, locationText,
  startDate, endDate, isCurrent, description, isLast,
}: {
  dot?: "filled" | "outline"; title: string; subtitle?: string | null;
  subtitleHref?: string | null; locationText?: string | null;
  startDate?: string | null; endDate?: string | null;
  isCurrent?: boolean; description?: string | null; isLast?: boolean;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex-shrink-0 ${
          dot === "filled" ? "bg-red-500 border-red-500" : "bg-white border-gray-300"
        }`} />
        {!isLast && <div className="w-px bg-gray-200 flex-1 mt-1.5 mb-1.5 min-h-[20px]" />}
      </div>
      <div className={`flex-1 min-w-0 ${!isLast ? "pb-5" : "pb-1"}`}>
        <p className="text-[14px] font-bold text-gray-900 leading-tight">{title}</p>
        {subtitle && (
          subtitleHref ? (
            <a href={subtitleHref.startsWith("http") ? subtitleHref : `https://${subtitleHref}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-0.5 block text-[13px] font-semibold text-red-500 hover:underline">
              {subtitle}
            </a>
          ) : (
            <p className="mt-0.5 text-[13px] font-semibold text-red-500">{subtitle}</p>
          )
        )}
        {locationText !== undefined && (
          <p className="mt-0.5 text-[12px] text-gray-400">{locationText ?? "Location not specified"}</p>
        )}
        {(startDate || endDate || isCurrent) && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {fmtMo(startDate) && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                {fmtMo(startDate)}
              </span>
            )}
            <span className="text-gray-400 text-[11px]">–</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
              {isCurrent ? "Current" : (fmtMo(endDate) || "Present")}
            </span>
          </div>
        )}
        {description && (
          <p className="mt-2 text-[12px] leading-relaxed text-gray-500 line-clamp-3">{description}</p>
        )}
      </div>
    </div>
  );
}

function YearRange({ start, end }: { start?: string | null; end?: string | null }) {
  if (!start && !end) return null;
  return (
    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
      {start && <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">{start}</span>}
      {start && end && <span className="text-gray-400 text-[11px]">–</span>}
      {end && <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">{end}</span>}
    </div>
  );
}

function SkillsSection({ skills }: { skills: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  const visible = showAll ? skills : skills.slice(0, VISIBLE);
  const remaining = skills.length - VISIBLE;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <p className="text-[15px] font-bold text-gray-900 mb-4">Skills</p>
      {skills.length === 0 ? (
        <Empty icon={<Award className="h-7 w-7" />} text="No skills listed" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((s, i) => (
            <span key={i} className="rounded-full bg-gray-100 px-4 py-2 text-[13px] font-medium text-gray-700">{s}</span>
          ))}
          {!showAll && remaining > 0 && (
            <button type="button" onClick={() => setShowAll(true)}
              className="rounded-full bg-red-50 border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-100 transition-colors">
              +{remaining} more
            </button>
          )}
          {showAll && skills.length > VISIBLE && (
            <button type="button" onClick={() => setShowAll(false)}
              className="rounded-full bg-gray-100 px-4 py-2 text-[13px] font-medium text-gray-500 hover:bg-gray-200 transition-colors">
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
          {meta && meta.filter(Boolean).length > 0 && (
            <p className="mt-1 text-[11px] text-gray-400">{meta.filter(Boolean).join(" · ")}</p>
          )}
          {description && <p className="mt-1.5 text-[11.5px] leading-relaxed text-gray-500 line-clamp-3">{description}</p>}
          {extra}
        </div>
      </div>
    </div>
  );
}

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

  const skillsRef   = useRef<HTMLDivElement>(null);
  const expRef      = useRef<HTMLDivElement>(null);
  const eduRef      = useRef<HTMLDivElement>(null);
  const companyRef  = useRef<HTMLDivElement>(null);
  const summaryRef  = useRef<HTMLDivElement>(null);
  const projRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!person) { setDetail(null); return; }
    setDetail(null);
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

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isOpen = !!person;
  const d = detail ?? person;
  const fullName = d ? d.full_name || `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || "—" : "";
  const titleLine = (d?.active_experience_title ?? "") as string;
  const companyLine = (d?.active_experience_company_name ?? "") as string;

  const projCount = (detail?.projects.length ?? 0) + (detail?.publications.length ?? 0) + (detail?.patents.length ?? 0);
  const skillCount = Array.isArray(d?.inferred_skills) ? (d!.inferred_skills as string[]).length : 0;

  const personEmail = (detail as PersonDetail | null)?.email ?? null;
  const personPhone = d?.mobile_phone as string | null ?? null;
  const personLinkedIn = d?.linkedin_url as string | null ?? null;

  const currentWork = detail?.work_history?.find((w) => w.is_current) ?? detail?.work_history?.[0] ?? null;
  const companyLinkedIn = currentWork?.company_linkedin_url ?? null;
  const companyWebsite = currentWork?.company_website ?? null;

  const NAV: { label: string; ref: React.RefObject<HTMLDivElement | null>; count?: number }[] = [
    { label: "Skills",         ref: skillsRef,  count: skillCount },
    { label: "Work Experience",ref: expRef      },
    { label: "Education",      ref: eduRef      },
    { label: "Company Info",   ref: companyRef  },
    { label: "Summary",        ref: summaryRef  },
    { label: "Job Projects",   ref: projRef,    count: projCount  },
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

          {/* Profile identity row */}
          <div className="flex items-start gap-4 px-5 pb-4">
            <Avatar name={fullName} src={d?.picture_url as string | null} />
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[16px] font-bold text-gray-900 leading-tight tracking-tight">{fullName}</h2>
                {d?.has_email && (
                  <span className="rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                    Revealed
                  </span>
                )}
              </div>
              {titleLine && (
                <p className="mt-0.5 text-[12.5px] text-gray-500 leading-snug">{titleLine}</p>
              )}
              {companyLine && (
                <p className="mt-0.5 text-[12.5px] font-semibold text-red-500 leading-snug">{companyLine}</p>
              )}
              {!titleLine && d?.headline && (
                <p className="mt-0.5 text-[12.5px] text-gray-500 line-clamp-2 leading-snug">{d.headline as string}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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
            </div>
          </div>

          {/* Contact rows – inline style */}
          <div className="px-5 pb-3 space-y-2.5">
            {/* Email */}
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              {personEmail ? (
                <>
                  <a href={`mailto:${personEmail}`}
                    className="text-[13px] text-gray-700 hover:text-red-500 transition-colors truncate">
                    {personEmail}
                  </a>
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </>
              ) : (
                <span className="text-[13px] text-gray-400">—</span>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              {personPhone ? (
                <a href={`tel:${personPhone}`}
                  className="text-[13px] text-gray-700 hover:text-red-500 transition-colors">
                  {personPhone}
                </a>
              ) : (
                <span className="text-[13px] text-gray-400">—</span>
              )}
            </div>

            {/* See more contacts → work email */}
            <SeeMoreContacts workEmail={null} />
          </div>

          {/* Social icon buttons */}
          <div className="flex items-center gap-2 px-5 pb-4">
            {personLinkedIn ? (
              <a
                href={`https://${personLinkedIn.replace(/^https?:\/\//, "")}`}
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
          </div>
        </div>

        {/* ══════════ SECTION NAV ══════════ */}
        <div className="shrink-0 flex bg-white border-b border-gray-200 overflow-x-auto">
          {NAV.map((item) => (
            <button key={item.label} type="button" onClick={() => scrollTo(item.ref)}
              className="shrink-0 whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-all">
              {item.label}
              {item.count != null && item.count > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {item.count}
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
            <div className="px-4 py-5 space-y-5">

              {/* ── SKILLS ── */}
              <div ref={skillsRef}>
                <SkillsSection skills={Array.isArray(d.inferred_skills) ? (d.inferred_skills as string[]) : []} />
              </div>

              {/* ── WORK EXPERIENCE ── */}
              <div ref={expRef}>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-gray-900">Work Experience</span>
                      {detail?.total_experience && (
                        <span className="text-[13px] font-normal text-gray-400">· {detail.total_experience}</span>
                      )}
                    </div>
                  </div>
                  {!detail?.work_history?.length ? (
                    <Empty icon={<Briefcase className="h-7 w-7" />} text="No work experience listed" />
                  ) : (
                    detail.work_history.map((w, i) => (
                      <TimelineEntry key={i}
                        dot={w.is_current ? "filled" : "outline"}
                        title={w.title ?? "—"}
                        subtitle={w.company_name}
                        subtitleHref={w.company_website}
                        locationText={w.location}
                        startDate={w.start_date}
                        endDate={w.end_date}
                        isCurrent={w.is_current}
                        description={w.description}
                        isLast={i === detail.work_history.length - 1}
                      />
                    ))
                  )}
                </div>

                {detail?.volunteering && detail.volunteering.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-[15px] font-bold text-gray-900">Volunteering</span>
                    </div>
                    {detail.volunteering.map((v, i) => (
                      <TimelineEntry key={i}
                        title={v.role ?? "Volunteer"}
                        subtitle={v.organization}
                        locationText={v.cause ?? undefined}
                        startDate={v.start_date}
                        endDate={v.end_date}
                        description={v.description}
                        isLast={i === detail.volunteering.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── EDUCATION ── */}
              <div ref={eduRef}>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <GraduationCap className="h-4 w-4 text-blue-400" />
                    <span className="text-[15px] font-bold text-gray-900">Education</span>
                  </div>
                  {!detail?.education?.length ? (
                    <Empty icon={<GraduationCap className="h-7 w-7" />} text="No education listed" />
                  ) : (
                    detail.education.map((e, i) => (
                      <div key={i} className="flex gap-3.5">
                        <div className="flex flex-col items-center">
                          <div className="mt-0.5 h-5 w-5 rounded-full border-2 bg-white border-gray-300 flex-shrink-0" />
                          {i < detail.education.length - 1 && (
                            <div className="w-px bg-gray-200 flex-1 mt-1.5 mb-1.5 min-h-[20px]" />
                          )}
                        </div>
                        <div className={`flex-1 min-w-0 ${i < detail.education.length - 1 ? "pb-5" : "pb-1"}`}>
                          <p className="text-[14px] font-bold text-gray-900 leading-tight">{e.school ?? "—"}</p>
                          {(e.degree || e.field) && (
                            <p className="mt-0.5 text-[13px] font-semibold text-red-500">
                              {[e.degree, e.field].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          <YearRange start={e.start_year} end={e.end_year} />
                          {e.activities && <p className="mt-2 text-[12px] text-gray-500 line-clamp-2">{e.activities}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {detail?.organizations && detail.organizations.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Building className="h-4 w-4 text-indigo-400" />
                      <span className="text-[15px] font-bold text-gray-900">Organizations</span>
                    </div>
                    {detail.organizations.map((o, i) => (
                      <TimelineEntry key={i}
                        title={o.name ?? "Organization"}
                        subtitle={o.position}
                        startDate={o.start_date}
                        endDate={o.end_date}
                        description={o.description}
                        isLast={i === detail.organizations.length - 1}
                      />
                    ))}
                  </div>
                )}

                {detail?.test_scores && detail.test_scores.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Test Scores</p>
                    <div className="divide-y divide-gray-50">
                      {detail.test_scores.map((ts, i) => (
                        <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
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
              </div>

              {/* ── COMPANY INFO ── */}
              <div ref={companyRef}>
                {d?.active_experience_company_name ? (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Company Info</p>
                    <div className="flex items-center gap-3 mb-4">
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
                    {/* Company social links */}
                    <div className="flex items-center gap-2">
                      {companyLinkedIn ? (
                        <a
                          href={`https://${companyLinkedIn.replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Company LinkedIn"
                        >
                          <LinkedInSVG />
                        </a>
                      ) : (
                        <span className="opacity-30 cursor-not-allowed" title="Company LinkedIn not available">
                          <LinkedInSVG />
                        </span>
                      )}
                      {companyWebsite ? (
                        <a
                          href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Company Website"
                        >
                          <WebsiteSVG />
                        </a>
                      ) : (
                        <span className="opacity-30 cursor-not-allowed" title="Company website not available">
                          <WebsiteSVG />
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Company Info</p>
                    <Empty icon={<Building className="h-7 w-7" />} text="No company info available" />
                  </div>
                )}

                {/* Certifications under company info area */}
                {detail?.certifications && detail.certifications.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-[15px] font-bold text-gray-900">Certifications</span>
                    </div>
                    {detail.certifications.map((c, i) => (
                      <TimelineEntry key={i}
                        title={c.title ?? "Certificate"}
                        subtitle={c.issuer}
                        subtitleHref={c.url}
                        startDate={c.date}
                        isLast={i === detail.certifications.length - 1}
                      />
                    ))}
                  </div>
                )}

                {detail?.courses && detail.courses.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-4 w-4 text-teal-500" />
                      <span className="text-[15px] font-bold text-gray-900">Courses</span>
                    </div>
                    <div className="space-y-3">
                      {detail.courses.map((c, i) => (
                        <div key={i} className={`flex items-start gap-3 ${i < detail.courses.length - 1 ? "pb-3 border-b border-gray-50" : ""}`}>
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 border border-teal-100 mt-0.5">
                            <BookOpen className="h-3.5 w-3.5 text-teal-500" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900">{c.title}</p>
                            {c.organizer && <p className="text-[12px] text-gray-500 mt-0.5">{c.organizer}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail?.awards && detail.awards.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-[15px] font-bold text-gray-900">Awards</span>
                    </div>
                    <div className="space-y-3">
                      {detail.awards.map((a, i) => (
                        <div key={i} className={`flex items-start gap-3 ${i < detail.awards.length - 1 ? "pb-3 border-b border-gray-50" : ""}`}>
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-100 mt-0.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900">{a.title}</p>
                            {a.issuer && <p className="text-[12px] font-medium text-red-500 mt-0.5">{a.issuer}</p>}
                            {a.date && (
                              <div className="mt-1.5">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">{fmtMo(a.date)}</span>
                              </div>
                            )}
                            {a.description && <p className="mt-1.5 text-[12px] text-gray-500">{a.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SUMMARY / ABOUT ── */}
              <div ref={summaryRef} className="space-y-4">
                {detail?.summary ? (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-3">Summary</p>
                    <p className="text-[13px] leading-relaxed text-gray-700 whitespace-pre-line">{detail.summary}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Summary</p>
                    <Empty icon={<Globe className="h-7 w-7" />} text="No summary available" />
                  </div>
                )}

                {detail?.languages && detail.languages.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Languages</p>
                    <div className="grid grid-cols-2 gap-2">
                      {detail.languages.map((l, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
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

                {detail?.recommendations && detail.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[15px] font-bold text-gray-900 px-1">Recommendations</p>
                    {detail.recommendations.map((r, i) => (
                      <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
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
              </div>

              {/* ── JOB PROJECTS ── */}
              <div ref={projRef}>
                {detail?.projects && detail.projects.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <FolderGit2 className="h-4 w-4 text-violet-500" />
                      <span className="text-[15px] font-bold text-gray-900">Projects</span>
                    </div>
                    <div className="space-y-2.5">
                      {detail.projects.map((p, i) => (
                        <InfoCard key={i}
                          icon={<FolderGit2 className="h-4 w-4" />} iconColor="text-violet-600" iconBg="bg-violet-50"
                          title={p.name ?? "—"} meta={[fmtRange(p.start_date, p.end_date)]}
                          description={p.description} actionUrl={p.url} actionLabel="View"
                          extra={<PillRow items={p.members} color="gray" />}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {detail?.publications && detail.publications.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span className="text-[15px] font-bold text-gray-900">Publications</span>
                    </div>
                    <div className="space-y-2.5">
                      {detail.publications.map((p, i) => (
                        <InfoCard key={i}
                          icon={<FileText className="h-4 w-4" />} iconColor="text-emerald-600" iconBg="bg-emerald-50"
                          title={p.title ?? "—"}
                          subtitle={metaStr([p.publisher, p.date ? fmtMo(p.date) : null]) || null}
                          description={p.description} actionUrl={p.url} actionLabel="Read"
                          extra={<PillRow items={p.authors} color="emerald" />}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {detail?.patents && detail.patents.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <FlaskConical className="h-4 w-4 text-orange-500" />
                      <span className="text-[15px] font-bold text-gray-900">Patents</span>
                    </div>
                    <div className="space-y-2.5">
                      {detail.patents.map((p, i) => (
                        <InfoCard key={i}
                          icon={<FlaskConical className="h-4 w-4" />} iconColor="text-orange-500" iconBg="bg-orange-50"
                          title={p.title ?? "—"}
                          subtitle={metaStr([p.patent_number, p.date ? fmtMo(p.date) : null]) || null}
                          description={p.description} actionUrl={p.url} actionLabel="View"
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
                  </div>
                )}

                {!detail?.projects?.length && !detail?.publications?.length && !detail?.patents?.length && (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <p className="text-[15px] font-bold text-gray-900 mb-4">Job Projects</p>
                    <Empty icon={<FolderGit2 className="h-7 w-7" />} text="No projects, publications or patents" />
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
