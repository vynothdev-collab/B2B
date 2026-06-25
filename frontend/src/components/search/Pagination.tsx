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

function getWindowed(current: number, total: number, maxReachable: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5);
    if (total > 6) pages.push("...");
    pages.push(total - 2, total - 1, total);
  } else if (current >= total - 3) {
    pages.push(1, "...");
    pages.push(total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

export default function Pagination({ page, total, pageSize, maxReachable, hasNext, onPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && !hasNext) return null;

  const pages = getWindowed(page, Math.min(totalPages, Math.max(maxReachable + 1, page + 2)), maxReachable);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs text-gray-500 hidden sm:block">
        <span className="font-medium text-gray-700">{((page - 1) * pageSize + 1).toLocaleString()}</span>–
        <span className="font-medium text-gray-700">{Math.min(page * pageSize, total).toLocaleString()}</span>
        {" "}of{" "}
        <span className="font-medium text-gray-700">{total.toLocaleString()}</span>
      </p>

      <div className="flex items-center gap-0.5 mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mr-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1.5 py-1.5 text-xs text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p as number)}
              disabled={(p as number) > maxReachable && (p as number) !== 1}
              className={`min-w-[30px] rounded-md px-2 py-1.5 text-xs font-medium transition-colors
                ${p === page
                  ? "bg-purple-600 text-white shadow-sm"
                  : (p as number) <= maxReachable || (p as number) === 1
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-gray-300 cursor-not-allowed"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext}
          className="flex items-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-1"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
