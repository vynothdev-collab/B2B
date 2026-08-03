// LeadsBuddy.ai — Background Service Worker
// Initializes the extension and opens the side panel when the action icon is clicked.
// Future: messaging hub, auth token refresh, background job orchestration.

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: true });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  chrome.sidePanel.open({ tabId: tab.id });
});

export {};
