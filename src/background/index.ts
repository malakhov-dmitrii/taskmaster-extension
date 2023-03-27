import { updateTasksBadge } from '../lib/updateTasksBadge';

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  updateTasksBadge(tabs[0].url);
});

chrome.history.onVisited.addListener(async (result) => {
  await updateTasksBadge(result.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await updateTasksBadge(tab.url);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    await updateTasksBadge(tab.url);
  });
});
