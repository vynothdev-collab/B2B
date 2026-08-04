import React from 'react';
import type { PersonResult } from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { InfoRow } from './InfoRow';

interface Props {
  person: PersonResult;
}

const BriefcaseIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
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

const LinkedInIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

function locationString(p: PersonResult): string {
  return [p.location_city, p.location_state, p.location_country].filter(Boolean).join(', ');
}

export function PersonCard({ person }: Props) {
  const name =
    person.full_name ||
    [person.first_name, person.last_name].filter(Boolean).join(' ') ||
    'Unknown';
  const loc = locationString(person);

  const hasCompanyMeta =
    person.active_experience_company_industry || person.active_experience_company_employees_count;

  return (
    <div className="p-3 pb-0">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Identity */}
        <div className="p-4 flex items-start gap-3">
          <Avatar src={person.picture_url} name={name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">{name}</h2>
            {person.active_experience_title && (
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                {person.active_experience_title}
              </p>
            )}
            {person.active_experience_company_name && (
              <p className="text-xs text-primary-600 font-medium mt-0.5">
                {person.active_experience_company_name}
              </p>
            )}
            {person.headline && !person.active_experience_title && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{person.headline}</p>
            )}
          </div>
        </div>

        {/* Company meta */}
        {hasCompanyMeta && (
          <div className="px-4 pb-3 flex flex-wrap gap-1">
            {person.active_experience_company_industry && (
              <Badge variant="blue">{person.active_experience_company_industry}</Badge>
            )}
            {person.active_experience_company_employees_count && (
              <Badge variant="gray">
                {person.active_experience_company_employees_count.toLocaleString()} employees
              </Badge>
            )}
          </div>
        )}

        {/* Info rows */}
        {(person.active_experience_company_name || loc || person.linkedin_url) && (
          <div className="border-t border-gray-50 px-4 py-3 space-y-0.5">
            {person.active_experience_company_name && (
              <InfoRow
                icon={<BriefcaseIcon />}
                value={`${person.active_experience_title || 'Employee'} at ${person.active_experience_company_name}`}
                href={person.active_experience_company_website}
              />
            )}
            {loc && <InfoRow icon={<MapPinIcon />} value={loc} />}
            {person.linkedin_url && (
              <InfoRow
                icon={<LinkedInIcon />}
                value="LinkedIn Profile"
                href={person.linkedin_url}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
