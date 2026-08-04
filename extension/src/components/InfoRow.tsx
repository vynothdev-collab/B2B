import React from 'react';

interface Props {
  icon: React.ReactNode;
  label?: string;
  value: string;
  href?: string;
}

export function InfoRow({ icon, label, value, href }: Props) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        {label && <span className="text-xs text-gray-400 block">{label}</span>}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="text-xs text-gray-700 break-words">{value}</span>
        )}
      </div>
    </div>
  );
}
