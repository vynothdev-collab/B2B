"use client";
import { Menu } from "lucide-react";
import { useMobileSidebar } from "@/contexts/MobileSidebarContext";

export default function AppHeader({ title }: { title: string }) {
  const { open } = useMobileSidebar();
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 md:px-6">
      <button
        type="button"
        onClick={open}
        aria-label="Open navigation"
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
