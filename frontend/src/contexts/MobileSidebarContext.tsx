"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface MobileSidebarContextValue {
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(null);

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const open = useCallback(() => setMobileOpen(true), []);
  const close = useCallback(() => setMobileOpen(false), []);
  const toggle = useCallback(() => setMobileOpen((current) => !current), []);

  const value = useMemo(
    () => ({ mobileOpen, open, close, toggle }),
    [mobileOpen, open, close, toggle]
  );

  return (
    <MobileSidebarContext.Provider value={value}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext);
  if (!context) {
    throw new Error("useMobileSidebar must be used within MobileSidebarProvider");
  }
  return context;
}
