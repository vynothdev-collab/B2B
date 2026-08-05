import React, { useState, useCallback, useEffect } from 'react';
import type { TabInfo, PersonResult, CompanyResult, LeadsList } from '../types';
import { searchApi } from '../api/search';
import { extensionApi } from '../api/extension';
import { listsApi } from '../api/lists';
import { SkeletonCard } from '../components/ui/Skeleton';
import { CompanyCard } from '../components/CompanyCard';
import { PersonCard } from '../components/PersonCard';
import { RevealSection } from '../components/RevealSection';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { EmployeeCard } from '../components/EmployeeCard';
import { useAuthStore } from '../store/authStore';

interface Props {
  tabInfo: TabInfo;
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'person'; result: PersonResult }
  | { status: 'company'; result: CompanyResult };

type CompanyTab = 'details' | 'employees';

const PAGE_CONFIG = {
  linkedin_person: {
    label: 'LinkedIn Profile',
    searchLabel: 'Search Profile',
    description: 'Find work email, phone number & professional data',
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
    typeBadgeBg: '#EFF6FF',
    typeBadgeText: '#1D4ED8',
  },
  linkedin_company: {
    label: 'LinkedIn Company',
    searchLabel: 'Search Company',
    description: 'Find company info, employees & contact details',
    iconBg: '#FFF7F5',
    iconColor: '#E84010',
    typeBadgeBg: '#FFF7F5',
    typeBadgeText: '#C43009',
  },
  company_website: {
    label: 'Company Website',
    searchLabel: 'Search Company',
    description: 'Find company info, employees & contact details',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    typeBadgeBg: '#ECFDF5',
    typeBadgeText: '#047857',
  },
} as const;

function getDisplayUrl(tabInfo: TabInfo): string {
  if (tabInfo.pageType === 'linkedin_person' && tabInfo.linkedinUrl) {
    return tabInfo.linkedinUrl.replace(/^https?:\/\//, '');
  }
  if (tabInfo.pageType === 'linkedin_company' && (tabInfo.linkedinUrl || tabInfo.companyName)) {
    return (tabInfo.linkedinUrl ?? `https://www.linkedin.com/company/${tabInfo.companyName}`)
      .replace(/^https?:\/\//, '');
  }
  return tabInfo.domain || tabInfo.companyName || tabInfo.url.replace(/^https?:\/\//, '').split('/')[0];
}



/* ─── Idle / Detection state ─────────────────────────────────────────────── */
function IdleState({ tabInfo, onSearch }: { tabInfo: TabInfo; onSearch: () => void }) {
  const config = PAGE_CONFIG[tabInfo.pageType as keyof typeof PAGE_CONFIG] ?? PAGE_CONFIG.company_website;
  const displayUrl = getDisplayUrl(tabInfo);

  return (
    <div style={{
      minHeight: 'calc(100vh - 170px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '16px 16px', gap: '12px',
    }}>

      {/* ── Detection card ─────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        overflow: 'visible',   /* no overflow-hidden so badge is never clipped */
      }}>

        {/* Card body */}
        <div style={{ padding: '16px 16px 14px' }}>

          {/* Row: icon block + detected badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>

            {/* Icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: config.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={config.iconColor} strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
              >
                {tabInfo.pageType === 'linkedin_person' ? (
                  <>
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    <path d="M4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </>
                ) : tabInfo.pageType === 'linkedin_company' ? (
                  <>
                    <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18" />
                    <path d="M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3c2.485 0 4.5 4.03 4.5 9S14.485 21 12 21m0-18c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9m-9-9h18" />
                  </>
                )}
              </svg>
            </div>

            {/* Detected badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '999px',
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#16A34A' }}>Detected</span>
            </div>
          </div>

          {/* Type label */}
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>
            {config.label}
          </p>

          {/* URL */}
          <p style={{
            fontSize: '11px', fontFamily: 'ui-monospace, monospace',
            color: '#94A3B8', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={tabInfo.url}>
            {displayUrl}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#F1F5F9', margin: '0 16px' }} />

        {/* Credit info row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="9" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
            <text x="10" y="14" textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="700" fontFamily="sans-serif">$</text>
          </svg>
          <span style={{ fontSize: '11.5px', color: '#64748B' }}>
            Uses <strong style={{ color: '#374151', fontWeight: 600 }}>1 credit</strong> per search
          </span>
        </div>
      </div>

      {/* ── Primary CTA ────────────────────────────────────────────────── */}
      <button
        onClick={onSearch}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '14px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.01em',
          background: 'linear-gradient(135deg, #E84010 0%, #FF6535 100%)',
          boxShadow: '0 4px 18px rgba(232,64,16,0.3)',
          transition: 'opacity 0.15s, transform 0.1s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.92'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.985)'; }}
        onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
        </svg>
        {config.searchLabel}
      </button>

      {/* Helper text */}
      <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#94A3B8', margin: 0 }}>
        {config.description}
      </p>
    </div>
  );
}

/* ─── Employee list ──────────────────────────────────────────────────────── */
function EmployeeList({ company, lists }: { company: CompanyResult; lists: LeadsList[] }) {
  const [employees, setEmployees] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const filters = company.canonical_linkedin_url
        ? { companyLinkedinUrl: company.canonical_linkedin_url }
        : { companyName: company.company_name };
      const res = await searchApi.searchEmployees(filters, 1, 20);
      setEmployees(res.data);
      setTotal(res.meta.total);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [company]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (loading) {
    return (
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-2/5" />
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (searched && employees.length === 0) {
    return (
      <EmptyState
        message="No employees found"
        description="We couldn't find employees for this company in our database."
      />
    );
  }

  return (
    <div>
      {total > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/70">
          <p className="text-[11.5px]" style={{ color: '#64748B' }}>
            Showing <span className="font-semibold text-gray-700">{employees.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> employees
          </p>
        </div>
      )}
      {employees.map((emp) => (
        <EmployeeCard key={emp.id} person={emp} lists={lists} />
      ))}
    </div>
  );
}

/* ─── Company result with sub-tabs ──────────────────────────────────────── */
function CompanyResult({ company, lists }: { company: CompanyResult; lists: LeadsList[] }) {
  const [activeTab, setActiveTab] = useState<CompanyTab>('details');
  const employeeCount = company.employees_count;

  return (
    <div>
      {/* Sub-tabs — pill style */}
      <div className="px-3 py-2 bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['details', 'employees'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'details' ? 'Company Details' : 'All Employees';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#1A3D5C' : '#6B7280',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {label}
                {tab === 'employees' && employeeCount ? (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? '#EFF6FF' : '#E5E7EB',
                      color: isActive ? '#1D4ED8' : '#9CA3AF',
                    }}
                  >
                    {employeeCount > 999 ? `${Math.round(employeeCount / 1000)}k` : employeeCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'details' ? (
        <CompanyCard company={company} />
      ) : (
        <EmployeeList company={company} lists={lists} />
      )}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function ResultsPage({ tabInfo }: Props) {
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const [lists, setLists] = useState<LeadsList[]>([]);
  const { refreshUser } = useAuthStore();

  const fetchLists = useCallback(async () => {
    try {
      const data = await listsApi.getLists();
      setLists(data);
    } catch { /* ignore */ }
  }, []);

  const runSearch = useCallback(async () => {
    setState({ status: 'loading' });
    fetchLists();
    try {
      if (tabInfo.pageType === 'linkedin_person' && tabInfo.linkedinUrl) {
        const res = await extensionApi.searchPerson(tabInfo.linkedinUrl);
        if (res.data.length === 0) { setState({ status: 'empty' }); return; }
        try {
          const detail = await searchApi.getPersonDetail(res.data[0].id);
          setState({ status: 'person', result: { ...res.data[0], ...detail } });
        } catch {
          setState({ status: 'person', result: res.data[0] });
        }
      } else if (tabInfo.pageType === 'linkedin_company') {
        const res = await extensionApi.searchCompany({
          linkedinUrl: tabInfo.linkedinUrl,
        });
        if (res.data.length === 0) { setState({ status: 'empty' }); return; }
        try {
          const detail = await searchApi.getCompanyDetail(res.data[0].id);
          setState({ status: 'company', result: { ...res.data[0], ...detail } });
        } catch {
          setState({ status: 'company', result: res.data[0] });
        }
      } else if (tabInfo.pageType === 'company_website') {
        const res = await extensionApi.searchCompany({
          website: tabInfo.domain,
          companyName: tabInfo.companyName,
        });
        if (res.data.length === 0) { setState({ status: 'empty' }); return; }
        try {
          const detail = await searchApi.getCompanyDetail(res.data[0].id);
          setState({ status: 'company', result: { ...res.data[0], ...detail } });
        } catch {
          setState({ status: 'company', result: res.data[0] });
        }
      } else {
        setState({ status: 'empty' });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.detail || axiosErr?.message || 'Failed to fetch data.';
      setState({ status: 'error', message: msg });
    }
  }, [tabInfo, fetchLists]);

  if (state.status === 'idle') return <IdleState tabInfo={tabInfo} onSearch={runSearch} />;
  if (state.status === 'loading') return <SkeletonCard />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={runSearch} />;
  if (state.status === 'empty') {
    return (
      <EmptyState
        message="No results found"
        description="We couldn't find data for this page in our database."
        action={{ label: 'Search on LeadsBuddy', href: 'https://app.leadsbuddy.ai' }}
      />
    );
  }
  if (state.status === 'company') {
    return <CompanyResult company={state.result} lists={lists} />;
  }
  return (
    <div>
      <PersonCard person={state.result} />
      <RevealSection person={state.result} onRefreshUser={refreshUser} />
    </div>
  );
}
