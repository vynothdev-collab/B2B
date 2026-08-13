"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
        <Link href="/document/api-key" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leadsbuddy-logo.svg" alt="leadsbuddy.ai" className="h-6 w-auto sm:h-7" />
          <span className="hidden text-sm font-semibold text-gray-400 sm:inline">Developer API</span>
        </Link>
        <a href="/login" className="text-sm font-semibold text-red-600 hover:underline">
          Sign in to get an API key
        </a>
      </div>
    </header>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full shrink-0 lg:w-56">
      <div className="space-y-6 lg:sticky lg:top-24">
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
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
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
    <section id={id} className="scroll-mt-24 border-t border-gray-100 py-8 first:border-0 first:pt-0">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{children}</code>;
}

export function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      {label && (
        <div className="border-b border-gray-800 bg-gray-800 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function FieldTable({ fields }: { fields: FieldDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{f.name}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{f.type}</td>
              <td className="px-4 py-2.5 text-gray-600">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FilterGroupTable({ groups }: { groups: FilterGroup[] }) {
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.section}>
          <h3 className="text-sm font-bold text-gray-900">{g.section}</h3>
          {g.note && <p className="mt-0.5 text-xs text-gray-500">{g.note}</p>}
          <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2">Field</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {g.fields.map((f) => (
                  <tr key={f.name} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 font-mono text-xs text-gray-900">{f.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{f.type}</td>
                    <td className="px-4 py-2 text-gray-600">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
