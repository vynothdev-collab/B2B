import React from 'react';
import type { TabInfo } from '../types';
import { Badge } from './ui/Badge';

interface Props {
  tabInfo: TabInfo;
}

const PAGE_LABELS: Record<string, { label: string; variant: 'blue' | 'orange' | 'green' | 'gray' }> = {
  company_website: { label: 'Company Website', variant: 'blue' },
  linkedin_person: { label: 'LinkedIn Profile', variant: 'orange' },
  linkedin_company: { label: 'LinkedIn Company', variant: 'orange' },
  unsupported: { label: 'Unsupported Page', variant: 'gray' },
};

export function DetectionBadge({ tabInfo }: Props) {
  const config = PAGE_LABELS[tabInfo.pageType];
  const displayName =
    tabInfo.companyName || tabInfo.domain || (tabInfo.linkedinUrl ? 'LinkedIn' : '');
  return (
    <div className="flex flex-col gap-1 px-4 py-2 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
      {displayName && <p className="text-xs text-gray-500 truncate">{displayName}</p>}
    </div>
  );
}
