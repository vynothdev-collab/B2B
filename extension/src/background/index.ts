import { buildTabInfo } from '../utils/urlDetector';
import { MESSAGE_TYPES } from '../constants';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: true });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  chrome.sidePanel.open({ tabId: tab.id });
});

function notifySidepanel(payload: ReturnType<typeof buildTabInfo>) {
  // Callback form: reading runtime.lastError inside the callback suppresses
  // Chrome's "Unchecked runtime.lastError" warning when no receiver is open.
  chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TAB_UPDATED, payload }, () => {
    void chrome.runtime.lastError;
  });
}

// Notify sidepanel whenever active tab URL changes
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    notifySidepanel(buildTabInfo(tab.url));
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    notifySidepanel(buildTabInfo(tab.url));
  }
});

// Respond to sidepanel requests for current tab info
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.GET_TAB_INFO) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.url) {
        sendResponse({ type: MESSAGE_TYPES.TAB_INFO, payload: buildTabInfo(tab.url) });
      } else {
        sendResponse({ type: MESSAGE_TYPES.TAB_INFO, payload: null });
      }
    });
    return true; // Keep message channel open
  }
});

export {};
