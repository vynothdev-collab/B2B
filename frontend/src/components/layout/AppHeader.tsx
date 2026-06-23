"use client";

export default function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
