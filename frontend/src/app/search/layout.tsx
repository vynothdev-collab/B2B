import AppSidebar from "@/components/layout/AppSidebar";
import { MobileSidebarProvider } from "@/contexts/MobileSidebarContext";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </MobileSidebarProvider>
  );
}
