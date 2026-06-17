"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, total, pageSize, hasNext, onPrev, onNext }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{start}–{end}</span> of{" "}
        <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 1}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        <div className="flex items-center gap-0.5 px-1">
          <span className="min-w-[28px] rounded-md bg-purple-600 px-2 py-1.5 text-center text-xs font-semibold text-white">
            {page}
          </span>
          {totalPages > 1 && (
            <span className="px-1 text-xs text-gray-400">of ~{totalPages.toLocaleString()}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
