"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total:       number;
  perPage:     number;
  page:        number;
  onChange:    (page: number) => void;
  itemLabel?:  string;
}

function getPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
  if (page < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export default function Pagination({ total, perPage, page, onChange, itemLabel = "items" }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from       = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to         = Math.min(page * perPage, total);
  const pages      = getPages(page, totalPages);

  const base    = "min-w-[30px] h-[30px] px-2 flex items-center justify-center rounded-lg text-[12.5px] font-semibold border transition-colors select-none";
  const inactive = `${base} bg-card`;
  const active   = `${base} bg-forest border-forest text-[#FFFDF6]`;

  return (
    <div
      className="flex items-center justify-between gap-4 flex-wrap px-[18px] py-3.5 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      {/* Record count */}
      <span className="text-[12px]" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
        Showing{" "}
        <strong style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{from}–{to}</strong>
        {" "}of{" "}
        <strong style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{total}</strong>
        {" "}{itemLabel}
      </span>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`${base} disabled:opacity-40`}
          style={{ borderColor: "var(--line)", color: "var(--ink-faint)" }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`el-${i}`}
              className="min-w-[30px] h-[30px] flex items-center justify-center text-[12.5px]"
              style={{ color: "var(--ink-faint)" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p as number)}
              className={p === page ? active : inactive}
              style={p !== page ? { borderColor: "var(--line)", color: "var(--ink-dim)" } : {}}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`${base} disabled:opacity-40`}
          style={{ borderColor: "var(--line)", color: "var(--ink-faint)" }}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
