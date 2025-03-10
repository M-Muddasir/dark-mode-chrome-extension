// Initialize storage with default values when extension is installed
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(['darkModeState', 'excludedSites'], function(result) {
    if (!result.darkModeState) {
      chrome.storage.sync.set({darkModeState: {}});
    }
    
    if (!result.excludedSites) {
      chrome.storage.sync.set({excludedSites: []});
    }
  });
});

// Listen for tab updates to apply dark mode when a page is loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const hostname = new URL(tab.url).hostname;
      
      // Check if site is excluded
      chrome.storage.sync.get(['excludedSites'], function(result) {
        const excludedSites = result.excludedSites || [];
        
        if (!excludedSites.includes(hostname)) {
          // Check if dark mode is enabled for this site
          chrome.storage.sync.get(['darkModeState'], function(result) {
            const darkModeState = result.darkModeState || {};
            
            if (darkModeState[hostname] === true) {
              chrome.tabs.sendMessage(tabId, {action: 'enableDarkMode'});
            }
          });
        }
      });
    } catch (e) {
      // Invalid URL, ignore
    }
  }
});
