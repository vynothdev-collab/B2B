import React, { useState } from 'react';
import type { PersonResult, LeadsList } from '../types';
import { searchApi } from '../api/search';
import { listsApi } from '../api/lists';
import { Avatar } from './ui/Avatar';

interface Props {
  person: PersonResult;
  lists?: LeadsList[];
  onSaved?: () => void;
}

function EmailIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg className="w-3.5 h-3.5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export function EmployeeCard({ person, lists = [], onSaved }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const name = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown';
  const title = person.active_experience_title || person.headline || '';
  const company = person.active_experience_company_name || '';
  const location = [person.location_city, person.location_country].filter(Boolean).join(', ');

  const handleRevealEmail = async () => {
    if (email || loadingEmail) return;
    setLoadingEmail(true);
    try {
      const result = await searchApi.revealWorkEmail(person.id);
      setEmail(result.email);
    } catch {
      setEmail(null);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleCopy = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveToList = async () => {
    if (!lists.length || saved) return;
    try {
      await listsApi.addItems(lists[0].id, [{ record_id: person.id, record_type: 'person' }]);
      setSaved(true);
      onSaved?.();
    } catch {
      // ignore
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <Avatar src={person.picture_url} name={name} size="sm" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{name}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {person.linkedin_url && (
                  <a
                    href={person.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                    title="Open LinkedIn"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                <button
                  onClick={handleSaveToList}
                  className={`p-1 transition-colors ${saved ? 'text-[#1A3D5C]' : 'text-gray-400 hover:text-[#1A3D5C]'}`}
                  title={saved ? 'Saved' : 'Save to list'}
                >
                  <BookmarkIcon filled={saved} />
                </button>
              </div>
            </div>
            {title && <p className="text-[11.5px] text-gray-500 truncate">{title}{company ? ` · ${company}` : ''}</p>}
            {location && <p className="text-[11px] text-gray-400 truncate">{location}</p>}
          </div>
        </div>

        {/* Email reveal row */}
        <div className="flex items-center gap-2 mt-2.5">
          {email ? (
            <div className="flex items-center gap-1.5 flex-1 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5">
              <span className="text-[11.5px] text-green-700 font-mono truncate flex-1">{email}</span>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 transition-colors ${copied ? 'text-green-600' : 'text-green-500 hover:text-green-700'}`}
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <CopyIcon />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleRevealEmail}
              disabled={loadingEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors bg-white border-gray-200 text-gray-600 hover:border-[#1A3D5C] hover:text-[#1A3D5C] disabled:opacity-50"
            >
              {loadingEmail ? (
                <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#1A3D5C] rounded-full animate-spin" />
              ) : (
                <EmailIcon />
              )}
              {loadingEmail ? 'Getting email…' : 'Get email'}
            </button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors ml-auto"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-50 space-y-1">
            {person.active_experience_department && (
              <p className="text-[11px] text-gray-500">Dept: <span className="text-gray-700">{person.active_experience_department}</span></p>
            )}
            {person.active_experience_company_industry && (
              <p className="text-[11px] text-gray-500">Industry: <span className="text-gray-700">{person.active_experience_company_industry}</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
