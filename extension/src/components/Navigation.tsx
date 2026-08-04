import React from 'react';

export type AppTab = 'prospect' | 'lists';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const SearchIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
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
    { id: 'prospect', label: 'Prospect', icon: <SearchIcon /> },
    { id: 'lists', label: 'Lists', icon: <ListIcon /> },
  ];

  return (
    <nav className="flex-shrink-0 flex border-b border-gray-200 bg-white px-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-[13px] font-semibold border-b-2 transition-colors mr-1 ${
              isActive
                ? 'border-[#1A3D5C] text-[#1A3D5C]'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
            }`}
          >
            <span className={isActive ? 'text-[#1A3D5C]' : 'text-gray-400'}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
