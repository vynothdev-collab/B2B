import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTabStore } from '../store/tabStore';
import { MESSAGE_TYPES } from '../constants';
import type { TabInfo } from '../types';
import { Header } from '../components/Header';
import { Navigation, type AppTab } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { UnsupportedState } from '../components/UnsupportedState';
import { LoginPage } from '../pages/LoginPage';
import { ResultsPage } from '../pages/ResultsPage';
import { ListsTab } from '../pages/ListsTab';
import { Spinner } from '../components/ui/Spinner';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, initialized, initialize, refreshUser } = useAuthStore();
  const { tabInfo, setTabInfo } = useTabStore();
  const [activeTab, setActiveTab] = useState<AppTab>('prospect');
  const [detecting, setDetecting] = useState(false);
  const windowIdRef = React.useRef<number | undefined>(undefined);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    chrome.windows.getCurrent((win) => {
      windowIdRef.current = win.id;
      chrome.runtime.sendMessage({ type: MESSAGE_TYPES.GET_TAB_INFO, windowId: win.id }, (response) => {
        if (response?.payload) setTabInfo(response.payload as TabInfo);
      });
    });
  }, [setTabInfo]);

  useEffect(() => {
    const handler = (message: { type: string; payload?: unknown }) => {
      if (message.type === MESSAGE_TYPES.TAB_UPDATED && message.payload) {
        const incoming = message.payload as TabInfo;
        if (incoming.windowId !== undefined && incoming.windowId !== windowIdRef.current) return;
        if (useTabStore.getState().tabInfo?.url === incoming.url) return;
        setDetecting(true);
        setTabInfo(incoming);
        setActiveTab('prospect');
        setTimeout(() => setDetecting(false), 260);
      }
      if (message.type === 'AUTH_EXPIRED') {
        useAuthStore.getState().logout();
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [setTabInfo]);

  const handleRefresh = useCallback(() => {
    refreshUser();
    chrome.runtime.sendMessage({ type: MESSAGE_TYPES.GET_TAB_INFO, windowId: windowIdRef.current }, (response) => {
      if (response?.payload) setTabInfo(response.payload as TabInfo);
    });
  }, [refreshUser, setTabInfo]);

  if (!initialized || authLoading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  const isUnsupported = !tabInfo || tabInfo.pageType === 'unsupported';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F7F9FC' }}>
      {/* Sticky header */}
      <Header user={user} onRefresh={handleRefresh} />

      {/* Sticky tab navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin" style={{ background: '#FFFFFF', position: 'relative' }}>
        {detecting && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(1px)',
            animation: 'lb-fade-in 0.15s ease both',
          }}>
            <Spinner size="sm" />
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>Detecting page…</span>
          </div>
        )}
        {activeTab === 'prospect' ? (
          isUnsupported ? (
            <UnsupportedState />
          ) : (
            <ResultsPage key={tabInfo.url} tabInfo={tabInfo} />
          )
        ) : (
          <ListsTab />
        )}
      </main>

      {/* Sticky footer */}
      <Footer user={user} />
    </div>
  );
}
