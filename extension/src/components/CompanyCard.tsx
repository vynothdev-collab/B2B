import React from 'react';
import type { CompanyResult } from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { InfoRow } from './InfoRow';

interface Props {
  company: CompanyResult;
}

const GlobeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const UsersIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const RevenueIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function formatEmployees(count?: number): string {
  if (!count) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M employees`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K employees`;
  return `${count} employees`;
}

export function CompanyCard({ company }: Props) {
  const location =
    [company.hq_city, company.hq_country].filter(Boolean).join(', ') || company.hq_location;

  const hasInfoRows =
    company.employees_count ||
    location ||
    company.website ||
    company.canonical_linkedin_url ||
    company.revenue_annual_range;

  return (
    <div className="p-3">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <Avatar src={company.logo_url} name={company.company_name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">
              {company.company_name || company.company_legal_name || 'Unknown Company'}
            </h2>
            {company.industry && (
              <p className="text-xs text-gray-500 mt-0.5">{company.industry}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {company.company_status && (
                <Badge variant={company.company_status === 'active' ? 'green' : 'gray'}>
                  {company.company_status}
                </Badge>
              )}
              {company.type && <Badge variant="gray">{company.type}</Badge>}
              {company.founded && <Badge variant="gray">Est. {company.founded}</Badge>}
            </div>
          </div>
        </div>

        {/* Info rows */}
        {hasInfoRows && (
          <div className="border-t border-gray-50 px-4 py-3 space-y-0.5">
            {company.employees_count ? (
              <InfoRow icon={<UsersIcon />} value={formatEmployees(company.employees_count)} />
            ) : null}
            {location ? <InfoRow icon={<MapPinIcon />} value={location} /> : null}
            {company.website ? (
              <InfoRow
                icon={<GlobeIcon />}
                value={company.website.replace(/^https?:\/\//, '')}
                href={company.website}
              />
            ) : null}
            {company.canonical_linkedin_url ? (
              <InfoRow
                icon={<LinkedInIcon />}
                value="LinkedIn"
                href={company.canonical_linkedin_url}
              />
            ) : null}
            {company.revenue_annual_range ? (
              <InfoRow
                icon={<RevenueIcon />}
                label="Revenue"
                value={company.revenue_annual_range}
              />
            ) : null}
          </div>
        )}

        {/* Description */}
        {company.description && (
          <div className="border-t border-gray-50 px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              About
            </p>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
              {company.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
