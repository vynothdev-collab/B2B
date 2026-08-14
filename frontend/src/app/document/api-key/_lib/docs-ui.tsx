"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
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
    title: "Unlock Contacts",
    items: [{ href: "/document/api-key/unlock", label: "Endpoints" }],
  },
  {
    title: "Reference",
    items: [{ href: "/document/api-key/errors", label: "Errors" }],
  },
];

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/document/api-key" className="flex items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leadsbuddy-logo.svg" alt="leadsbuddy.ai" className="h-5 w-auto sm:h-7" />
          <span className="hidden text-sm font-semibold text-gray-400 sm:inline">Developer API</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
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
