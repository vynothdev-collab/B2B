import React from 'react';

interface Props {
  message?: string;
  description?: string;
}

export function EmptyState({ message = 'No results found', description }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{message}</p>
      {description && (
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
