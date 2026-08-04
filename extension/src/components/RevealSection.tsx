import React, { useState } from 'react';
import type { PersonResult } from '../types';
import { searchApi } from '../api/search';
import { Button } from './ui/Button';

interface Props {
  person: PersonResult;
  onRefreshUser?: () => void;
}

interface RevealedData {
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
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-gray-50 rounded-lg mb-2 last:mb-0">
      <div className="w-7 h-7 rounded-md bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-medium text-gray-800 truncate">{value}</p>
      </div>
      <button
        onClick={copy}
        className="flex-shrink-0 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors px-1"
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}

export function RevealSection({ person, onRefreshUser }: Props) {
  const [revealed, setRevealed] = useState<RevealedData>({
    workEmail: null,
    personalEmail: null,
    phone: null,
  });
  const [loading, setLoading] = useState<LoadingState>({
    workEmail: false,
    personalEmail: false,
    phone: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoadingState, string>>>({});

  async function reveal(type: keyof LoadingState) {
    setLoading((p) => ({ ...p, [type]: true }));
    setErrors((p) => ({ ...p, [type]: undefined }));
    try {
      if (type === 'workEmail') {
        const r = await searchApi.revealWorkEmail(person.id);
        setRevealed((p) => ({ ...p, workEmail: r.email }));
        if (!r.email) setErrors((p) => ({ ...p, workEmail: 'No work email found' }));
      } else if (type === 'personalEmail') {
        const r = await searchApi.revealPersonalEmail(person.id);
        setRevealed((p) => ({ ...p, personalEmail: r.email }));
        if (!r.email) setErrors((p) => ({ ...p, personalEmail: 'No personal email found' }));
      } else {
        const r = await searchApi.revealPhone(person.id);
        setRevealed((p) => ({ ...p, phone: r.phone }));
        if (!r.phone) setErrors((p) => ({ ...p, phone: 'No phone number found' }));
      }
      onRefreshUser?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail || 'Failed to reveal — check your credits';
      setErrors((p) => ({ ...p, [type]: msg }));
    } finally {
      setLoading((p) => ({ ...p, [type]: false }));
    }
  }

  const hasAnyRevealed = revealed.workEmail || revealed.personalEmail || revealed.phone;
  const allRevealed = revealed.workEmail && revealed.personalEmail && revealed.phone;

  return (
    <div className="px-3 pt-2 pb-3">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Contact Information
          </h3>
        </div>

        <div className="p-3">
          {/* Revealed contacts */}
          {hasAnyRevealed && (
            <div className="mb-2">
              {revealed.workEmail && (
                <ContactItem icon={<EmailIcon />} label="Work Email" value={revealed.workEmail} />
              )}
              {revealed.personalEmail && (
                <ContactItem
                  icon={<EmailIcon />}
                  label="Personal Email"
                  value={revealed.personalEmail}
                />
              )}
              {revealed.phone && (
                <ContactItem icon={<PhoneIcon />} label="Phone" value={revealed.phone} />
              )}
            </div>
          )}

          {/* Reveal buttons */}
          {!allRevealed && (
            <div className="space-y-2">
              {!revealed.workEmail && (
                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loading.workEmail}
                    onClick={() => reveal('workEmail')}
                    className="w-full"
                  >
                    <EmailIcon />
                    Get Work Email
                  </Button>
                  {errors.workEmail && (
                    <p className="text-xs text-red-500 mt-1 px-1">{errors.workEmail}</p>
                  )}
                </div>
              )}
              {!revealed.personalEmail && (
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={loading.personalEmail}
                    onClick={() => reveal('personalEmail')}
                    className="w-full"
                  >
                    <EmailIcon />
                    Get Personal Email
                  </Button>
                  {errors.personalEmail && (
                    <p className="text-xs text-red-500 mt-1 px-1">{errors.personalEmail}</p>
                  )}
                </div>
              )}
              {!revealed.phone && (
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={loading.phone}
                    onClick={() => reveal('phone')}
                    className="w-full"
                  >
                    <PhoneIcon />
                    Get Phone Number
                  </Button>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1 px-1">{errors.phone}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
