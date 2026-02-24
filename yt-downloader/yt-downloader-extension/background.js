// Background service worker for YT Downloader extension

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openPopup') {
    chrome.action.openPopup();
  }
});

// Listen for tab updates to badge the icon on YouTube video pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      const isYTVideo = url.hostname.includes('youtube.com') && url.searchParams.has('v');
      chrome.action.setBadgeText({ text: isYTVideo ? '↓' : '', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#ff2d2d', tabId });
    } catch {}
  }
});
