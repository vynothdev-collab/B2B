import React, { useState } from 'react';
import type { PersonResult, LeadsList } from '../types';
import { listsApi } from '../api/lists';
import { searchApi } from '../api/search';
import { UNLOCK_COSTS } from '../constants/unlockCosts';

interface Props {
  person: PersonResult;
  lists?: LeadsList[];
  onRefreshLists?: () => void;
  onRefreshUser?: () => void;
}

const AV_COLORS = [
  { bg: '#DBEAFE', text: '#1D4ED8' }, { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#EDE9FE', text: '#6D28D9' }, { bg: '#FFEDD5', text: '#C2410C' },
  { bg: '#FCE7F3', text: '#9D174D' }, { bg: '#CCFBF1', text: '#0F766E' },
  { bg: '#FEF9C3', text: '#A16207' },
];

type ContactStatus =
  | { status: 'hidden' }
  | { status: 'loading' }
  | { status: 'unlocked'; value: string }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

interface ContactState {
  workEmail: ContactStatus;
  personalEmail: ContactStatus;
  phone: ContactStatus;
}

function fmtExp(months?: number): string {
  if (!months) return '';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}mo`;
  if (m === 0) return `${y}yr`;
  return `${y}yr ${m}mo`;
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
function PersonAvatar({ name, src }: { name: string; src?: string | null }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)} style={{
        width: 64, height: 64, borderRadius: 14, objectFit: 'cover', flexShrink: 0,
        border: '2.5px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }} />
    );
  }
  const letters = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const c = AV_COLORS[(name.charCodeAt(0) || 0) % AV_COLORS.length];
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 14, flexShrink: 0,
      background: c.bg, color: c.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, fontWeight: 800,
      border: '2.5px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      {letters}
    </div>
  );
}

function SmallCompanyLogo({ src, name }: { src?: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)} style={{
        width: 16, height: 16, borderRadius: 3, objectFit: 'contain',
        border: '1px solid #E5E7EB', background: '#fff', flexShrink: 0,
      }} />
    );
  }
  return null;
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const IcoPin = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const IcoBriefcase = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
const IcoClock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>;
const IcoUsers = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
const IcoLinkedIn = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const IcoGlobe = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3c2.485 0 4.5 4.03 4.5 9S14.485 21 12 21m0-18c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9M3 12h18" /></svg>;
const IcoBookmark = ({ filled }: { filled: boolean }) => <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>;
const IcoChevron = ({ open }: { open: boolean }) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>;
const IcoEmail = () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IcoPhone = () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IcoLock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const IcoCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcoCopySmall = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;

/* ─── Section label ──────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
      {children}
    </p>
  );
}

/* ─── Premium contact status card ────────────────────────────────────────── */
function ContactCard({ icon, label, state, credits, onUnlock }: {
  icon: React.ReactNode;
  label: string;
  state: ContactStatus;
  credits: number;
  onUnlock: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUnlocked = state.status === 'unlocked';
  const isNotFound = state.status === 'not_found';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: isUnlocked ? '#F0FDF4' : isNotFound ? '#FAFAFA' : '#F8FAFF',
      border: `1.5px solid ${isUnlocked ? '#BBF7D0' : isNotFound ? '#E9ECEF' : '#DBEAFE'}`,
      transition: 'all 0.2s',
    }}>
      {/* Icon box */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isUnlocked ? '#DCFCE7' : isNotFound ? '#F3F4F6' : '#EFF6FF',
        border: `1px solid ${isUnlocked ? '#86EFAC' : isNotFound ? '#E5E7EB' : '#BFDBFE'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isUnlocked ? '#15803D' : isNotFound ? '#D1D5DB' : '#2563EB',
      }}>
        {icon}
      </div>

      {/* Label + value/status */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', lineHeight: 1,
          color: isNotFound ? '#D1D5DB' : '#6B7280',
        }}>
          {label}
        </p>

        {state.status === 'hidden' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ color: '#94A3B8' }}><IcoLock /></span>
            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
              Hidden · {credits} credit{credits !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {state.status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              border: '1.5px solid #DBEAFE', borderTopColor: '#2563EB',
              display: 'inline-block', animation: 'lb-spin 0.7s linear infinite',
            }} />
            <span style={{ fontSize: 11.5, color: '#94A3B8' }}>Unlocking...</span>
          </div>
        )}

        {state.status === 'unlocked' && (
          <p style={{
            margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#111827',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {state.value}
          </p>
        )}

        {state.status === 'not_found' && (
          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#D1D5DB' }}>Not available</p>
        )}

        {state.status === 'error' && (
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#EF4444', lineHeight: 1.3 }}>
            {state.message}
          </p>
        )}
      </div>

      {/* Action button */}
      {state.status === 'hidden' && (
        <button onClick={onUnlock} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 11px', borderRadius: 7,
          fontSize: 11, fontWeight: 700, color: '#2563EB',
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#DBEAFE'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; }}
        >
          Unlock
        </button>
      )}

      {state.status === 'unlocked' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <IcoCheck />
          <button onClick={() => copy(state.value)} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 600, padding: '2px 4px',
            color: copied ? '#15803D' : '#94A3B8',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <IcoCopySmall /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Save dropdown ──────────────────────────────────────────────────────── */
function SaveDropdown({ personId, lists, onSaved }: { personId: string; lists: LeadsList[]; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (list: LeadsList) => {
    if (saving) return;
    setSaving(list.id);
    try {
      await listsApi.addItems(list.id, [{ record_id: personId, item_type: 'person' }]);
      setSaved(list.id);
      onSaved?.();
    } catch { /* ignore */ }
    finally { setSaving(null); setOpen(false); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
        fontSize: 12, fontWeight: 600, border: '1.5px solid #E5E7EB',
        background: saved ? '#F0FDF4' : '#fff', color: saved ? '#15803D' : '#374151',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { if (!saved) (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A3D5C'; }}
        onMouseLeave={e => { if (!saved) (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
      >
        <IcoBookmark filled={!!saved} />
        {saved ? 'Saved' : 'Save'}
        {!saved && <IcoChevron open={open} />}
      </button>
      {open && !saved && lists.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 50,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden',
        }}>
          <p style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, borderBottom: '1px solid #F3F4F6' }}>
            Save to list
          </p>
          {lists.map(list => (
            <button key={list.id} onClick={() => save(list)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: 'none', border: 'none',
              cursor: saving ? 'default' : 'pointer', fontSize: 12.5, color: '#111827',
              textAlign: 'left', transition: 'background 0.1s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{list.name}</span>
              {saving === list.id && <span style={{ width: 10, height: 10, border: '1.5px solid #E5E7EB', borderTopColor: '#1A3D5C', borderRadius: '50%', flexShrink: 0, display: 'inline-block', animation: 'lb-spin 0.7s linear infinite' }} />}
              {list.is_default && <span style={{ fontSize: 9, fontWeight: 700, color: '#1D4ED8', background: '#DBEAFE', padding: '1px 6px', borderRadius: 20, flexShrink: 0, marginLeft: 6 }}>Default</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function PersonCard({ person, lists = [], onRefreshLists, onRefreshUser }: Props) {
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [contact, setContact] = useState<ContactState>({
    workEmail: { status: 'hidden' },
    personalEmail: { status: 'hidden' },
    phone: { status: 'hidden' },
  });

  const name = person.full_name || [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unknown';
  const title = person.active_experience_title || '';
  const company = person.active_experience_company_name || '';
  const location = [person.location_city, person.location_state, person.location_country].filter(Boolean).join(', ');
  const dept = person.active_experience_department || '';
  const level = person.active_experience_management_level || '';
  const expStr = fmtExp(person.total_experience_duration_months);
  const skills = (person.inferred_skills ?? []) as string[];
  const SKILLS_VISIBLE = 4;
  const visibleSkills = skillsExpanded ? skills : skills.slice(0, SKILLS_VISIBLE);
  const moreSkills = skills.length - SKILLS_VISIBLE;
  const linkedinUrl = person.linkedin_url;
  const companyWebsite = person.active_experience_company_website;
  const companyLinkedIn = person.active_experience_company_linkedin_url;
  const hasCompanyInfo = !!(company && (person.active_experience_company_industry || person.active_experience_company_employees_count));

  async function unlockContact(type: keyof ContactState) {
    setContact(prev => ({ ...prev, [type]: { status: 'loading' } }));
    try {
      if (type === 'workEmail') {
        const r = await searchApi.unlockWorkEmail(person.id);
        setContact(prev => ({ ...prev, workEmail: r.email ? { status: 'unlocked', value: r.email } : { status: 'not_found' } }));
      } else if (type === 'personalEmail') {
        const r = await searchApi.unlockPersonalEmail(person.id);
        setContact(prev => ({ ...prev, personalEmail: r.email ? { status: 'unlocked', value: r.email } : { status: 'not_found' } }));
      } else {
        const r = await searchApi.unlockMobile(person.id);
        setContact(prev => ({ ...prev, phone: r.phone ? { status: 'unlocked', value: r.phone } : { status: 'not_found' } }));
      }
      onRefreshUser?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed — check your credits';
      setContact(prev => ({ ...prev, [type]: { status: 'error', message: msg } }));
    }
  }

  return (
    <div style={{ padding: '12px 12px 0' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E8ECF0', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div style={{ padding: '18px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <PersonAvatar name={name} src={person.picture_url as string | null} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 2px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                {name}
              </h2>
              {title && (
                <p style={{ margin: '0 0 5px', fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>{title}</p>
              )}
              {company && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <SmallCompanyLogo src={person.active_experience_company_logo_url as string | null} name={company} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2563EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {company}
                  </span>
                </div>
              )}
              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8' }}>
                  <IcoPin />
                  <span style={{ fontSize: 11.5 }}>{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional meta chips */}
          {(dept || level || expStr) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {dept && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#1D4ED8', background: '#EFF6FF', padding: '3px 9px', borderRadius: 20 }}>
                  <IcoBriefcase />{dept}
                </span>
              )}
              {level && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', background: '#EDE9FE', padding: '3px 9px', borderRadius: 20 }}>
                  {level}
                </span>
              )}
              {expStr && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#0F766E', background: '#CCFBF1', padding: '3px 9px', borderRadius: 20 }}>
                  <IcoClock />{expStr} exp
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Contact Information ──────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 18px' }}>
          <SectionLabel>Contact Information</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <ContactCard
              icon={<IcoEmail />}
              label="Work Email"
              state={contact.workEmail}
              credits={UNLOCK_COSTS.workEmail}
              onUnlock={() => unlockContact('workEmail')}
            />
            <ContactCard
              icon={<IcoEmail />}
              label="Personal Email"
              state={contact.personalEmail}
              credits={UNLOCK_COSTS.personalEmail}
              onUnlock={() => unlockContact('personalEmail')}
            />
            <ContactCard
              icon={<IcoPhone />}
              label="Mobile Number"
              state={contact.phone}
              credits={UNLOCK_COSTS.mobile}
              onUnlock={() => unlockContact('phone')}
            />
          </div>
        </div>

        {/* ── Skills ──────────────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '13px 18px' }}>
            <SectionLabel>Skills</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {visibleSkills.map((s, i) => (
                <span key={i} style={{ fontSize: 11.5, fontWeight: 500, color: '#374151', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '3px 10px', borderRadius: 8 }}>
                  {s}
                </span>
              ))}
              {!skillsExpanded && moreSkills > 0 && (
                <button onClick={() => setSkillsExpanded(true)} style={{ fontSize: 11.5, fontWeight: 600, color: '#E84010', background: '#FFF7F5', border: '1px solid #FED7CC', padding: '3px 10px', borderRadius: 8, cursor: 'pointer' }}>
                  +{moreSkills} more
                </button>
              )}
              {skillsExpanded && skills.length > SKILLS_VISIBLE && (
                <button onClick={() => setSkillsExpanded(false)} style={{ fontSize: 11.5, fontWeight: 600, color: '#E84010', background: '#FFF7F5', border: '1px solid #FED7CC', padding: '3px 10px', borderRadius: 8, cursor: 'pointer' }}>
                  Show less
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Company Summary ──────────────────────────────────────────────── */}
        {hasCompanyInfo && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '13px 18px' }}>
            <SectionLabel>Company</SectionLabel>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: '#FAFBFF', border: '1.5px solid #E8EEFF',
            }}>
              {person.active_experience_company_logo_url && (
                <img
                  src={person.active_experience_company_logo_url as string}
                  alt={company}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain', border: '1px solid #E5E7EB', background: '#fff', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{company}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                  {person.active_experience_company_industry && (
                    <span style={{ fontSize: 11, color: '#64748B' }}>{person.active_experience_company_industry}</span>
                  )}
                  {person.active_experience_company_employees_count && (
                    <>
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#64748B' }}>
                        <IcoUsers />
                        {person.active_experience_company_employees_count.toLocaleString()} emp
                      </span>
                    </>
                  )}
                  {(person.active_experience_company_hq_city || person.active_experience_company_hq_country) && (
                    <>
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#64748B' }}>
                        <IcoPin />
                        {[person.active_experience_company_hq_city, person.active_experience_company_hq_country].filter(Boolean).join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {linkedinUrl && (
            <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0A66C2', background: '#EFF6FF', border: '1.5px solid #BFDBFE', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#DBEAFE'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#EFF6FF'; }}
            >
              <IcoLinkedIn /> LinkedIn
            </a>
          )}
          {(companyWebsite || companyLinkedIn) && (
            <a href={(companyWebsite || companyLinkedIn)!.startsWith('http') ? (companyWebsite || companyLinkedIn)! : `https://${companyWebsite || companyLinkedIn}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', background: '#F9FAFB', border: '1.5px solid #E5E7EB', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A3D5C'; (e.currentTarget as HTMLAnchorElement).style.color = '#1A3D5C'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}
            >
              <IcoGlobe /> Website
            </a>
          )}
          {lists.length > 0 && (
            <div style={{ marginLeft: 'auto' }}>
              <SaveDropdown personId={person.id} lists={lists} onSaved={onRefreshLists} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
