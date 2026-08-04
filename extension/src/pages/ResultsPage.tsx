import React, { useState, useCallback } from 'react';
import type { TabInfo, PersonResult, CompanyResult, LeadsList } from '../types';
import { searchApi } from '../api/search';
import { listsApi } from '../api/lists';
import { SkeletonCard } from '../components/ui/Skeleton';
import { CompanyCard } from '../components/CompanyCard';
import { PersonCard } from '../components/PersonCard';
import { RevealSection } from '../components/RevealSection';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { EmployeeCard } from '../components/EmployeeCard';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';

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
    label: 'LinkedIn Person',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    pillBg: 'bg-blue-50',
    pillText: 'text-blue-700',
  },
  linkedin_company: {
    label: 'LinkedIn Company',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    pillBg: 'bg-orange-50',
    pillText: 'text-orange-700',
  },
  company_website: {
    label: 'Company Website',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-700',
  },
} as const;

function getDisplayUrl(tabInfo: TabInfo): string {
  if (tabInfo.pageType === 'linkedin_person' && tabInfo.linkedinUrl) {
    return tabInfo.linkedinUrl.replace(/^https?:\/\//, '');
  }
  if (tabInfo.pageType === 'linkedin_company' && tabInfo.companyName) {
    return `linkedin.com/company/${tabInfo.companyName}`;
  }
  return tabInfo.domain || tabInfo.companyName || tabInfo.url.replace(/^https?:\/\//, '').split('/')[0];
}

function PersonIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
    </svg>
  );
}

function getPageIcon(pageType: string) {
  if (pageType === 'linkedin_person') return <PersonIcon />;
  if (pageType === 'linkedin_company') return <BuildingIcon />;
  return <GlobeIcon />;
}

/* ─── Idle state ─────────────────────────────────────────────────────────── */
function IdleState({ tabInfo, onSearch }: { tabInfo: TabInfo; onSearch: () => void }) {
  const config = PAGE_CONFIG[tabInfo.pageType as keyof typeof PAGE_CONFIG] ?? PAGE_CONFIG.company_website;
  const displayUrl = getDisplayUrl(tabInfo);

  return (
    <div className="flex flex-col items-center justify-center px-6 text-center" style={{ minHeight: 'calc(100vh - 148px)' }}>
      <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center mb-4`}>
        <div className={`w-7 h-7 ${config.iconColor}`}>{getPageIcon(tabInfo.pageType)}</div>
      </div>

      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2 ${config.pillBg} ${config.pillText}`}>
        {config.label}
      </span>

      <p className="text-[11px] text-gray-400 mb-6 font-mono truncate max-w-full px-1" title={tabInfo.url}>
        {displayUrl}
      </p>

      <Button variant="brand" size="md" onClick={onSearch} className="w-full">
        <SearchIcon />
        Search
      </Button>

      <p className="text-[11px] text-gray-400 mt-2.5">Uses 1 credit per search</p>
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
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <p className="text-[11.5px] text-gray-500">Showing {employees.length} of {total.toLocaleString()} employees</p>
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
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-1.5 px-2 py-2.5 text-[12.5px] font-semibold border-b-2 transition-colors mr-3 ${
            activeTab === 'details'
              ? 'border-[#1A3D5C] text-[#1A3D5C]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Company Details
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-1.5 px-2 py-2.5 text-[12.5px] font-semibold border-b-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-[#1A3D5C] text-[#1A3D5C]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          All Employees
          {employeeCount && (
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {employeeCount > 999 ? `${Math.round(employeeCount / 1000)}k` : employeeCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
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
        const res = await searchApi.searchPersons([tabInfo.linkedinUrl], 1);
        if (res.data.length === 0) { setState({ status: 'empty' }); return; }
        try {
          const detail = await searchApi.getPersonDetail(res.data[0].id);
          setState({ status: 'person', result: { ...res.data[0], ...detail } });
        } catch {
          setState({ status: 'person', result: res.data[0] });
        }
      } else if (
        (tabInfo.pageType === 'company_website' || tabInfo.pageType === 'linkedin_company') &&
        tabInfo.companyName
      ) {
        const res = await searchApi.searchCompanies([tabInfo.companyName], 1);
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
        description="We couldn't find data for this page. Try navigating to a company website or a LinkedIn profile."
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
