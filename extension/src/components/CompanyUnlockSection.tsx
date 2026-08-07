import React, { useState } from 'react';
import type { CompanyResult } from '../types';
import { Button } from './ui/Button';

interface Props {
  company: CompanyResult;
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

export function CompanyUnlockSection({ company }: Props) {
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [phoneNotFound, setPhoneNotFound] = useState(false);

  function unlockEmail() {
    if (company.email) {
      setShowEmail(true);
    } else {
      setEmailNotFound(true);
    }
  }

  function unlockPhone() {
    if (company.phone) {
      setShowPhone(true);
    } else {
      setPhoneNotFound(true);
    }
  }

  const hasAnyContact = company.email || company.phone;

  return (
    <div style={{ padding: '0 20px 12px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
        Contact Information
      </p>

      {/* Email */}
      {showEmail && company.email ? (
        <UnlockedRow icon={<EmailIcon />} label="Email" value={company.email} verified />
      ) : emailNotFound ? (
        <EmptyRow icon={<EmailIcon />} label="Email" />
      ) : (
        <div style={{ paddingBottom: 6 }}>
          <Button variant="primary" size="sm" onClick={unlockEmail} className="w-full">
            <EmailIcon /> Unlock Email
          </Button>
        </div>
      )}

      {/* Phone / Mobile */}
      {showPhone && company.phone ? (
        <UnlockedRow icon={<PhoneIcon />} label="Phone" value={company.phone} />
      ) : phoneNotFound ? (
        <EmptyRow icon={<PhoneIcon />} label="Phone" />
      ) : (
        <div style={{ paddingTop: 6, paddingBottom: 6, borderBottom: '1px solid #F3F4F6' }}>
          <Button variant="secondary" size="sm" onClick={unlockPhone} className="w-full">
            <PhoneIcon /> Unlock Phone Number
          </Button>
        </div>
      )}

      {!hasAnyContact && (
        <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#9CA3AF', textAlign: 'center' }}>
          No contact info available for this company
        </p>
      )}
    </div>
  );
}
