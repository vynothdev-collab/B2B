"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Pagination from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import {
  listSearchActivity,
  listUnlocks,
  type PagedSearchActivity,
  type PagedUnlocks,
} from "@/services/reports";

const TABS = ["Search Activity", "Email Unlocks", "Mobile Unlocks", "Login History"] as const;
type Tab = typeof TABS[number];

const PAGE_SIZE = 10;

const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function AccountTypeBadge({ type }: { type: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={
        type === "Enterprise"
          ? { background: "#F6ECD4", color: "#8A6222", borderColor: "#E8D5A3" }
          : { background: "rgba(23,50,41,.07)", color: "#173229", borderColor: "rgba(23,50,41,.18)" }
      }
    >
      {type}
    </span>
  );
}

function LoadingRows({ colSpan, rows = 8 }: { colSpan: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={`sk-${i}`} columns={colSpan} withAvatar={false} />
      ))}
    </>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-400">
        {label}
      </td>
    </tr>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Search Activity");

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab ? "border-b-2 text-[#173229]" : "text-slate-500 hover:text-slate-700"
              }`}
              style={activeTab === tab ? { borderColor: "#173229" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Search Activity" && <SearchActivityTab />}
      {activeTab === "Email Unlocks" && <UnlocksTab field="email" />}
      {activeTab === "Mobile Unlocks" && <UnlocksTab field="mobile" />}
      {activeTab === "Login History" && <LoginHistoryUnavailable />}
    </div>
  );
}

function SearchActivityTab() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("all");
  const [accountType, setAccountType] = useState("all");
  const [searchType, setSearchType] = useState("all");
  const [data, setData] = useState<PagedSearchActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await listSearchActivity(
        {
          page,
          page_size: PAGE_SIZE,
          period: period !== "all" ? period : undefined,
          account_type: accountType !== "all" ? accountType : undefined,
          search_type: searchType !== "all" ? searchType : undefined,
        },
        ctrl.signal,
      );
      setData(res);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      toast.error("Failed to load search activity", "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, period, accountType, searchType, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <select className={SELECT_CLASS} value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select className={SELECT_CLASS} value={accountType} onChange={(e) => { setAccountType(e.target.value); setPage(1); }}>
          <option value="all">All Account Types</option>
          <option value="individual">Individual</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select className={SELECT_CLASS} value={searchType} onChange={(e) => { setSearchType(e.target.value); setPage(1); }}>
          <option value="all">All Search Types</option>
          <option value="person">People Search</option>
          <option value="company">Company Search</option>
          <option value="agentic">AI Search</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-medium text-slate-500">
              <th className="px-4 py-2.5 text-left">User</th>
              <th className="px-4 py-2.5 text-left">Account Type</th>
              <th className="px-4 py-2.5 text-left">Company</th>
              <th className="px-4 py-2.5 text-left">Search Type</th>
              <th className="px-4 py-2.5 text-left">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && <LoadingRows colSpan={5} />}
            {!loading && data?.items.length === 0 && <EmptyRow colSpan={5} label="No search activity found." />}
            {!loading && data?.items.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{row.user_name}</td>
                <td className="px-4 py-3"><AccountTypeBadge type={row.account_type} /></td>
                <td className="px-4 py-3 text-slate-500">{row.company ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{row.search_type}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={data?.total ?? 0} perPage={PAGE_SIZE} page={page} onChange={setPage} itemLabel="searches" />
    </div>
  );
}

function UnlocksTab({ field }: { field: "email" | "mobile" }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("all");
  const [accountType, setAccountType] = useState("all");
  const [data, setData] = useState<PagedUnlocks | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await listUnlocks(
        {
          field,
          page,
          page_size: PAGE_SIZE,
          period: period !== "all" ? period : undefined,
          account_type: accountType !== "all" ? accountType : undefined,
        },
        ctrl.signal,
      );
      setData(res);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      toast.error(`Failed to load ${field === "email" ? "email" : "mobile"} unlocks`, "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [field, page, period, accountType, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // reset paging/filters when switching between the Email/Mobile tabs
  useEffect(() => {
    setPage(1);
    setPeriod("all");
    setAccountType("all");
  }, [field]);

  const valueLabel = field === "email" ? "Unlocked Email" : "Unlocked Number";

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <select className={SELECT_CLASS} value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select className={SELECT_CLASS} value={accountType} onChange={(e) => { setAccountType(e.target.value); setPage(1); }}>
          <option value="all">All Account Types</option>
          <option value="individual">Individual</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-medium text-slate-500">
              <th className="px-4 py-2.5 text-left">User</th>
              <th className="px-4 py-2.5 text-left">Account Type</th>
              <th className="px-4 py-2.5 text-left">Company</th>
              <th className="px-4 py-2.5 text-left">{valueLabel}</th>
              <th className="px-4 py-2.5 text-left">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && <LoadingRows colSpan={5} />}
            {!loading && data?.items.length === 0 && (
              <EmptyRow colSpan={5} label={`No ${field === "email" ? "email" : "mobile"} unlocks found.`} />
            )}
            {!loading && data?.items.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{row.user_name}</td>
                <td className="px-4 py-3"><AccountTypeBadge type={row.account_type} /></td>
                <td className="px-4 py-3 text-slate-500">{row.company ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{row.value ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(row.unlocked_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={data?.total ?? 0} perPage={PAGE_SIZE} page={page} onChange={setPage} itemLabel="unlocks" />
    </div>
  );
}

function LoginHistoryUnavailable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">Login history isn&apos;t tracked yet.</p>
      <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
        The backend doesn&apos;t currently persist login events, so there&apos;s no data to show here.
        This tab will populate once login auditing is added.
      </p>
    </div>
  );
}
