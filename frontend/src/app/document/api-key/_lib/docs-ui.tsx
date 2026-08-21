"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { FieldDoc, FilterGroup } from "./docs-data";

export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { href: "/document/api-key", label: "Overview" },
      { href: "/document/api-key/pagination", label: "Pagination" },
    ],
  },
  {
    title: "Person Search",
    items: [
      { href: "/document/api-key/persons-search", label: "Introduction" },
      { href: "/document/api-key/persons-search/request", label: "Request Payload" },
      { href: "/document/api-key/persons-search/response", label: "Response" },
    ],
  },
  {
    title: "Company Search",
    items: [
      { href: "/document/api-key/companies-search", label: "Introduction" },
      { href: "/document/api-key/companies-search/request", label: "Request Payload" },
      { href: "/document/api-key/companies-search/response", label: "Response" },
    ],
  },
  {
    title: "AI Search",
    items: [{ href: "/document/api-key/ai-search", label: "Endpoint" }],
  },
  {
    title: "Unlock Contacts",
    items: [{ href: "/document/api-key/unlock", label: "Endpoints" }],
  },
  {
    title: "Autocomplete",
    items: [{ href: "/document/api-key/autocomplete", label: "Endpoint" }],
  },
  {
    title: "Salesforce Integration",
    items: [
      { href: "/document/api-key/salesforce", label: "Overview & Setup" },
      { href: "/document/api-key/salesforce/field-mapping", label: "Field Mapping" },
    ],
  },
  {
    title: "HubSpot Integration",
    items: [
      { href: "/document/api-key/hubspot", label: "Overview & Setup" },
      { href: "/document/api-key/hubspot/field-mapping", label: "Field Mapping" },
    ],
  },
  {
    title: "Zoho CRM Integration",
    items: [
      { href: "/document/api-key/zoho", label: "Overview & Setup" },
      { href: "/document/api-key/zoho/field-mapping", label: "Field Mapping" },
    ],
  },
  {
    title: "Instantly Integration",
    items: [
      { href: "/document/api-key/instantly", label: "Overview & Setup" },
      { href: "/document/api-key/instantly/field-mapping", label: "Field Mapping" },
    ],
  },
  {
    title: "Smartreach Integration",
    items: [
      { href: "/document/api-key/smartreach", label: "Overview & Setup" },
      { href: "/document/api-key/smartreach/field-mapping", label: "Field Mapping" },
    ],
  },
  {
    title: "Reference",
    items: [{ href: "/document/api-key/errors", label: "Errors" }],
  },
];

function DocsSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(
    () => NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.title }))),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q),
    );
  }, [allItems, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (!open && e.key === "/" && !isTyping) {
        e.preventDefault();
        openDropdown();
        inputRef.current?.focus();
      } else if (open && e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openDropdown() {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 320) });
    }
    setOpen(true);
  }

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item.href);
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative z-50 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-400 shadow-sm transition focus-within:border-gray-300 focus-within:shadow hover:border-gray-300 sm:w-64 sm:px-3"
      >
        <Search className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            openDropdown();
          }}
          onFocus={openDropdown}
          onKeyDown={onInputKeyDown}
          placeholder="Search docs..."
          className="hidden w-full text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:inline"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="ml-auto hidden shrink-0 text-gray-400 hover:text-gray-600 sm:inline-block"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="ml-auto hidden rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 sm:inline-block">/</kbd>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="max-h-96 overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-3 py-12 text-center">
                  <Search className="h-6 w-6 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    No pages match &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-gray-400">Try a different search term.</p>
                </div>
              ) : (
                results.map((item, i) => {
                  const prevGroup = i > 0 ? results[i - 1].group : null;
                  const showGroupHeader = item.group !== prevGroup;
                  return (
                    <div key={item.href}>
                      {showGroupHeader && (
                        <p className="mt-2 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 first:mt-0.5">
                          {item.group}
                        </p>
                      )}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => go(item.href)}
                        className={`group flex w-full items-center justify-between rounded-lg border-l-2 px-3 py-2 text-left text-sm transition ${
                          i === activeIndex
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        {i === activeIndex && (
                          <kbd className="rounded border border-red-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-red-500">
                            ↵
                          </kbd>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 shadow-sm">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 shadow-sm">Enter</kbd> open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 shadow-sm">Esc</kbd> close
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/document/api-key" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leadsbuddy-logo.svg" alt="leadsbuddy.ai" className="h-5 w-auto sm:h-7" />
          <span className="hidden text-sm font-semibold text-gray-400 sm:inline">Developer API</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <DocsSearch />
          <a
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-600 hover:text-red-600 sm:text-sm"
          >
            Log in
          </a>
          <a
            href="/register"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 sm:px-3.5 sm:text-sm"
          >
            Sign up
          </a>
        </div>
      </div>
    </header>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeItem = NAV_GROUPS.flatMap((g) => g.items).find((item) => item.href === pathname);

  return (
    <nav className="w-full shrink-0 lg:w-56">
      {/* Mobile-only collapsible toggle — hidden at lg, desktop sidebar below is untouched */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Menu className="h-4 w-4 text-gray-400" />
          {activeItem?.label ?? "Menu"}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`${mobileOpen ? "mt-3 block" : "hidden"} space-y-6 lg:mt-0 lg:block lg:sticky lg:top-24`}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.title}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "bg-red-50 text-red-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function EndpointPageNav({
  basePath,
  current,
}: {
  basePath: string;
  current: "introduction" | "request" | "response";
}) {
  const pages: { key: typeof current; href: string; label: string }[] = [
    { key: "introduction", href: basePath, label: "Introduction" },
    { key: "request", href: `${basePath}/request`, label: "Request Payload" },
    { key: "response", href: `${basePath}/response`, label: "Response" },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-6">
      {pages.map((p) => (
        <Link
          key={p.key}
          href={p.href}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-3.5 ${
            p.key === current
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-gray-100 py-6 first:border-0 first:pt-0 sm:py-8">
      <h2 className="text-base font-bold text-gray-900 sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-xs leading-relaxed text-gray-600 sm:mt-4 sm:space-y-4 sm:text-sm">{children}</div>
    </section>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] sm:text-xs">{children}</code>;
}

export function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      {label && (
        <div className="border-b border-gray-800 bg-gray-800 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto bg-gray-900 p-4 text-[11px] leading-relaxed text-gray-100 sm:text-xs">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function FieldTable({ fields }: { fields: FieldDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[640px] text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{f.name}</td>
              <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{f.type}</td>
              <td className="px-4 py-2.5 text-gray-600">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterFieldsTable({ fields }: { fields: FieldDoc[] }) {
  return (
    <table className="w-full min-w-[560px] text-xs sm:text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
          <th className="px-4 py-2">Field</th>
          <th className="px-4 py-2">Type</th>
          <th className="px-4 py-2">Description</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f) => (
          <tr key={f.name} className="border-b border-gray-100 last:border-0">
            <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">{f.name}</td>
            <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">{f.type}</td>
            <td className="px-4 py-2 text-gray-600">{f.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FilterGroupTable({ groups }: { groups: FilterGroup[] }) {
  return (
    <>
      {/* Desktop / tablet (lg+): original always-expanded layout, unchanged */}
      <div className="hidden lg:block lg:space-y-5">
        {groups.map((g) => (
          <div key={g.section}>
            <h3 className="text-sm font-bold text-gray-900 sm:text-base">{g.section}</h3>
            {g.note && <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{g.note}</p>}
            <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200">
              <FilterFieldsTable fields={g.fields} />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile / tablet (below lg): collapsible accordion */}
      <div className="space-y-2.5 divide-y divide-gray-100 rounded-xl border border-gray-200 lg:hidden">
        {groups.map((g, i) => (
          <details key={g.section} className="group open:pb-3" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 select-none">
              <span className="text-sm font-bold text-gray-900">{g.section}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4">
              {g.note && <p className="mb-2 text-xs text-gray-500">{g.note}</p>}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <FilterFieldsTable fields={g.fields} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
