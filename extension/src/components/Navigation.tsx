import React from 'react';

export type AppTab = 'prospect' | 'lists';

interface Props {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const PersonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    <path d="M4.501 20.118a7.5 7.5 0 0114.998 0" />
  </svg>
);

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12" />
    <circle cx="3.75" cy="6.75" r=".5" fill="currentColor" />
    <circle cx="3.75" cy="12" r=".5" fill="currentColor" />
    <circle cx="3.75" cy="17.25" r=".5" fill="currentColor" />
  </svg>
);

const TABS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  { id: 'prospect', label: 'Prospect', icon: <PersonIcon /> },
  { id: 'lists',   label: 'Lists',    icon: <ListIcon /> },
];

export function Navigation({ activeTab, onTabChange }: Props) {
  return (
    <nav style={{
      flexShrink: 0,
      padding: '10px 14px 12px',
      background: '#F7F9FC',
      borderBottom: '1px solid #EEF2F7',
    }}>
      {/* Pill container */}
      <div style={{
        display: 'flex',
        background: '#E8ECF0',
        borderRadius: '12px',
        padding: '3px',
        gap: '3px',
      }}>
        {TABS.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px 12px',
                borderRadius: '9px',
                fontSize: '13px', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.18s ease',
                outline: 'none',
                /* Active / inactive */
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#E84010' : '#6B7280',
                boxShadow: isActive
                  ? '0 1px 5px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#6B7280';
              }}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
