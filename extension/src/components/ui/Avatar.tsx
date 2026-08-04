import React, { useState } from 'react';

interface Props {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: Props) {
  const [imgError, setImgError] = useState(false);
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-xl object-cover flex-shrink-0 ${sizes[size]} ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-xl flex-shrink-0 flex items-center justify-center font-semibold bg-brand-navy text-white ${sizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
