import { buildTabInfo } from '../utils/urlDetector';
import { MESSAGE_TYPES } from '../constants';
import type { TabInfo } from '../types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: true }).catch(() => {});
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('[LeadsBuddy] setPanelBehavior failed', error));
});

function broadcastTabInfo(payload: TabInfo) {
  chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TAB_UPDATED, payload }, () => {
    void chrome.runtime.lastError;
  });
}

function notifyTab(tab: chrome.tabs.Tab) {
  if (!tab.url || tab.windowId === undefined) return;
  broadcastTabInfo({ ...buildTabInfo(tab.url), windowId: tab.windowId });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) return; // tab closed mid-flight
    notifyTab(tab);
  });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (!tab.active) return;
  if (changeInfo.url || changeInfo.status === 'complete') {
    notifyTab(tab);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    if (tabs[0]) notifyTab(tabs[0]);
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.GET_TAB_INFO) {
    const requestedWindowId = typeof message.windowId === 'number' ? message.windowId : undefined;
    const query: chrome.tabs.QueryInfo =
      requestedWindowId !== undefined
        ? { active: true, windowId: requestedWindowId }
        : { active: true, currentWindow: true };

    chrome.tabs.query(query, (tabs) => {
      const tab = tabs[0];
      if (tab?.url && tab.windowId !== undefined) {
        sendResponse({
          type: MESSAGE_TYPES.TAB_INFO,
          payload: { ...buildTabInfo(tab.url), windowId: tab.windowId },
        });
      } else {
        sendResponse({ type: MESSAGE_TYPES.TAB_INFO, payload: null });
      }
    });
    return true; 
  }
});

export {};
