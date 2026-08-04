import React from 'react';

interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'orange' | 'green' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: Props) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
    gray: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
