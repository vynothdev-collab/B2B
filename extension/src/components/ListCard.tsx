import React, { useState } from 'react';
import type { LeadsList } from '../types';

interface Props {
  list: LeadsList;
  onClick: () => void;
  onDelete?: () => void;
}

export function ListCard({ list, onClick, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);
  const count = list.record_count ?? 0;
  const isDefault = list.is_default;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 16px',
        borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#F8FAFD' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'background 0.12s',
        outline: 'none',
      }}
    >
      {/* List icon */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: hovered ? '#DBEAFE' : '#EFF6FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.12s',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#3B82F6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{
            fontSize: '13px', fontWeight: 600, color: '#0F172A',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {list.name}
          </span>
          {isDefault && (
            <span style={{
              fontSize: '10px', fontWeight: 600, color: '#1D4ED8',
              background: '#DBEAFE', padding: '2px 7px',
              borderRadius: '20px', flexShrink: 0, whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}>
              Default
            </span>
          )}
        </div>
        <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
          {count === 0 ? 'No records' : `${count.toLocaleString()} ${count === 1 ? 'record' : 'records'}`}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={hovered ? '#1A3D5C' : '#CBD5E1'} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 0.12s', flexShrink: 0 }}>
          <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>

        {/* Delete — only for non-default, shown on hover */}
        {!isDefault && onDelete && hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete list"
            style={{
              width: '26px', height: '26px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: '#FEF2F2', color: '#EF4444',
              transition: 'all 0.12s',
              flexShrink: 0,
              marginLeft: '2px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
