"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  maxReachable: number;
  hasNext: boolean;
  onPage: (p: number) => void;
}

export default function Pagination({ page, total, pageSize, hasNext, onPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && !hasNext) return null;

  const from = ((page - 1) * pageSize + 1).toLocaleString();
  const to = Math.min(page * pageSize, total).toLocaleString();

  return (
    <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
      <p className="text-xs text-gray-500">
        <span className="font-medium text-gray-700">{from}</span>
        {"–"}
        <span className="font-medium text-gray-700">{to}</span>
        {" of "}
        <span className="font-medium text-gray-700">{total.toLocaleString()}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-gray-700">
          Page {page}
        </span>

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext}
          className="flex items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
