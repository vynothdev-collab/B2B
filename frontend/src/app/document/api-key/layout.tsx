import { DocsHeader, DocsSidebar } from "./_lib/docs-ui";

export const metadata = {
  title: "leadsbuddy.ai: Developer API Documentation",
  robots: "noindex",
};

export default function ApiKeyDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white">
      <DocsHeader />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-6 sm:gap-8 sm:px-10 sm:py-10 lg:flex-row lg:px-16">
        <DocsSidebar />
        <main className="w-full min-w-0 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
