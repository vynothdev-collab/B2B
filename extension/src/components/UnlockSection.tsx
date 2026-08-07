import React, { useState } from 'react';
import type { PersonResult } from '../types';
import { searchApi } from '../api/search';
import { Button } from './ui/Button';

interface Props {
  person: PersonResult;
  onRefreshUser?: () => void;
}

interface UnlockedData {
  workEmail: string | null;
  personalEmail: string | null;
  phone: string | null;
}

interface LoadingState {
  workEmail: boolean;
  personalEmail: boolean;
  phone: boolean;
}

const EmailIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function IconBox({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 6, flexShrink: 0,
      background: '#F9FAFB', border: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: muted ? '#D1D5DB' : '#6B7280',
    }}>
      {children}
    </div>
  );
}

function UnlockedRow({ icon, label, value, verified }: {
  icon: React.ReactNode;
  label?: string;
  value: string;
  verified?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
      <IconBox>{icon}</IconBox>
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>}
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
      </div>
      {verified && <CheckIcon />}
      <button onClick={copy} style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 600, color: copied ? '#22C55E' : '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function EmptyRow({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
      <IconBox muted>{icon}</IconBox>
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>}
        <p style={{ margin: 0, fontSize: 13, color: '#D1D5DB' }}>—</p>
      </div>
    </div>
  );
}

export function UnlockSection({ person, onRefreshUser }: Props) {
  const [unlocked, setUnlocked] = useState<UnlockedData>({
    workEmail: person.unlocked?.work_email ? (person.work_email ?? null) : null,
    personalEmail: person.unlocked?.personal_email ? (person.personal_email ?? null) : null,
    phone: person.unlocked?.mobile ? (person.mobile_phone ?? null) : null,
  });
  const [loading, setLoading] = useState<LoadingState>({ workEmail: false, personalEmail: false, phone: false });
  const [errors, setErrors] = useState<Partial<Record<keyof LoadingState, string>>>({});
  const [showMore, setShowMore] = useState(false);
  const [phoneNotFound, setPhoneNotFound] = useState(
    !!person.unlocked?.mobile && !person.mobile_phone,
  );

  async function unlock(type: keyof LoadingState) {
    setLoading((p) => ({ ...p, [type]: true }));
    setErrors((p) => ({ ...p, [type]: undefined }));
    try {
      if (type === 'workEmail') {
        const r = await searchApi.unlockWorkEmail(person.id);
        setUnlocked((p) => ({ ...p, workEmail: r.email }));
        if (!r.email) setErrors((p) => ({ ...p, workEmail: 'No work email found' }));
      } else if (type === 'personalEmail') {
        const r = await searchApi.unlockPersonalEmail(person.id);
        setUnlocked((p) => ({ ...p, personalEmail: r.email }));
        if (!r.email) setErrors((p) => ({ ...p, personalEmail: 'No personal email found' }));
      } else {
        const r = await searchApi.unlockMobile(person.id);
        setUnlocked((p) => ({ ...p, phone: r.phone }));
        if (!r.phone) setPhoneNotFound(true);
      }
      onRefreshUser?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail || 'Failed to unlock — check your credits';
      setErrors((p) => ({ ...p, [type]: msg }));
    } finally {
      setLoading((p) => ({ ...p, [type]: false }));
    }
  }

  const moreCount = !unlocked.personalEmail ? 1 : 0;
  const showMoreToggle = !unlocked.personalEmail && (unlocked.workEmail || unlocked.phone !== null || phoneNotFound);

  return (
    <div style={{ padding: '0 20px 4px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
        Contact Information
      </p>

      {/* Work Email */}
      {unlocked.workEmail ? (
        <UnlockedRow icon={<EmailIcon />} label="Work Email" value={unlocked.workEmail} verified />
      ) : (
        <div style={{ paddingBottom: 6 }}>
          <Button variant="primary" size="sm" loading={loading.workEmail} onClick={() => unlock('workEmail')} className="w-full">
            <EmailIcon /> Unlock Work Email
          </Button>
          {errors.workEmail && <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#EF4444' }}>{errors.workEmail}</p>}
        </div>
      )}

      {/* Phone */}
      {unlocked.phone ? (
        <UnlockedRow icon={<PhoneIcon />} label="Phone" value={unlocked.phone} />
      ) : phoneNotFound ? (
        <EmptyRow icon={<PhoneIcon />} label="Phone" />
      ) : (
        <div style={{ paddingTop: 6, paddingBottom: 6, borderBottom: '1px solid #F3F4F6' }}>
          <Button variant="secondary" size="sm" loading={loading.phone} onClick={() => unlock('phone')} className="w-full">
            <PhoneIcon /> Unlock Phone Number
          </Button>
          {errors.phone && <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#EF4444' }}>{errors.phone}</p>}
        </div>
      )}

      {/* See more contacts toggle */}
      {showMoreToggle && (
        <button
          onClick={() => setShowMore((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 0 4px', fontSize: 12.5, fontWeight: 600, color: '#E84010', background: 'none', border: 'none', cursor: 'pointer' }}>
          See more contacts ({moreCount})
          <ChevronDownIcon open={showMore} />
        </button>
      )}

      {/* Personal Email (expandable) */}
      {(showMore || !showMoreToggle) && !unlocked.personalEmail && (
        <div style={{ paddingTop: 6 }}>
          <Button variant="secondary" size="sm" loading={loading.personalEmail} onClick={() => unlock('personalEmail')} className="w-full">
            <EmailIcon /> Unlock Personal Email
          </Button>
          {errors.personalEmail && <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#EF4444' }}>{errors.personalEmail}</p>}
        </div>
      )}
      {unlocked.personalEmail && (
        <UnlockedRow icon={<EmailIcon />} label="Personal Email" value={unlocked.personalEmail} verified />
      )}
    </div>
  );
}
