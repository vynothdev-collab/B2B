"use client";
import { createContext, useContext, useState } from "react";

interface MobileSidebarContextType {
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  mobileOpen: false,
  open: () => {},
  close: () => {},
});

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <MobileSidebarContext.Provider
      value={{
        mobileOpen,
        open: () => setMobileOpen(true),
        close: () => setMobileOpen(false),
      }}
    >
      {children}
    </MobileSidebarContext.Provider>
  );
}

export const useMobileSidebar = () => useContext(MobileSidebarContext);
