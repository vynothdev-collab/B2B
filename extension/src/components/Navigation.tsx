import React from 'react';

export type AppTab = 'prospect' | 'lists';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const PersonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export function Navigation({ activeTab, onTabChange }: Props) {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'prospect', label: 'Prospect', icon: <PersonIcon /> },
    { id: 'lists', label: 'Lists', icon: <ListIcon /> },
  ];

  return (
    <nav className="flex-shrink-0 px-3 py-2 bg-white border-b border-gray-100">
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[13px] font-semibold transition-all ${
                isActive
                  ? 'bg-white shadow-sm text-[#E84010]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
