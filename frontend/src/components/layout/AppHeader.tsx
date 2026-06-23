"use client";
import { Bell, ChevronDown, HelpCircle, Search, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CREDITS = 258;

export default function AppHeader({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-5 shadow-sm">
      <h1 className="text-sm font-semibold text-gray-900">{title}</h1>

      <div className="ml-4 flex max-w-[280px] flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs text-gray-400">Search…</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
        <Zap className="h-3.5 w-3.5 text-yellow-500" />
        <span className="text-xs font-bold text-gray-800">{CREDITS}</span>
        <span className="text-xs text-gray-500">credits</span>
      </div>

      <button type="button" className="flex items-center gap-1.5 rounded-full bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
        <Zap className="h-3 w-3" />
        Upgrade
      </button>

      <button type="button" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
        <HelpCircle className="h-4 w-4" />
      </button>
      <button type="button" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
        <Bell className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 rounded-lg px-2 py-1">
        <div className="flex flex-col leading-tight text-right">
          <span className="text-xs font-semibold text-gray-800">{user?.name ?? "—"}</span>
          <span className="text-[10px] text-gray-400 capitalize">{user?.role ?? ""}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </div>
    </header>
  );
}
