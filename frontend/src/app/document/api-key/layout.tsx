import { DocsHeader, DocsSidebar } from "./_lib/docs-ui";

export const metadata = {
  title: "leadsbuddy.ai: Developer API Documentation",
  robots: "noindex",
};

export default function ApiKeyDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white">
      <DocsHeader />
      <div className="flex flex-col gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:px-16">
        <DocsSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
