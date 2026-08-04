import { create } from 'zustand';
import type { TabInfo } from '../types';

interface TabStore {
  tabInfo: TabInfo | null;
  setTabInfo: (info: TabInfo | null) => void;
}

export const useTabStore = create<TabStore>((set) => ({
  tabInfo: null,
  setTabInfo: (tabInfo) => set({ tabInfo }),
}));
