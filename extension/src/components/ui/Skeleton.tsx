import React from 'react';

interface Props {
  className?: string;
}

export function Skeleton({ className = '' }: Props) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="p-3 space-y-2">
      {/* Main card skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-4 w-3/5 rounded-md" />
              <Skeleton className="h-3 w-2/5 rounded-md" />
              <div className="flex gap-1 pt-1">
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-5 w-12 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-50 px-4 py-3 space-y-2.5">
          <Skeleton className="h-3 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-3/5 rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
      </div>

      {/* Reveal section skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <div className="p-3 space-y-2">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
