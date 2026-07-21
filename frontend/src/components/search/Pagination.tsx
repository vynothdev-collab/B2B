"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  count: number;
  totalPages?: number;
  hasNext: boolean;
  loading?: boolean;
  onPage: (p: number) => void;
}

export default function Pagination({ page, total, pageSize, count, totalPages, hasNext, loading, onPage }: Props) {
  const computedTotalPages = totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  if (computedTotalPages <= 1 && !hasNext) return null;

  const from = (page - 1) * pageSize + 1;
  const to = from + count - 1;

  return (
    <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
      <p className="text-xs text-gray-500">
        <span className="font-medium text-gray-700">{from.toLocaleString()}</span>
        {"–"}
        <span className="font-medium text-gray-700">{to.toLocaleString()}</span>
        {" of "}
        <span className="font-medium text-gray-700">{total.toLocaleString()}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 1 || loading}
          className="flex items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-gray-700">
          Page {page}{computedTotalPages > 1 ? ` of ${computedTotalPages.toLocaleString()}` : ""}
        </span>

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext || loading}
          className="flex items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
