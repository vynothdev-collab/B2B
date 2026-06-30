"use client";
import { Menu } from "lucide-react";
import { useMobileSidebar } from "@/contexts/MobileSidebarContext";

export default function AppHeader({ title }: { title: string }) {
  const { open } = useMobileSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 sm:h-16 sm:px-6">
      <button
        type="button"
        onClick={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>
      <h1 className="min-w-0 truncate text-lg font-semibold text-gray-900 sm:text-xl">{title}</h1>
    </header>
  );
}
