document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const excludeSiteBtn = document.getElementById('excludeSiteBtn');
  let currentUrl = '';

  // Get the current tab's URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      currentUrl = new URL(tabs[0].url).hostname;
      
      // Check if the current site is excluded
      chrome.storage.sync.get(['excludedSites'], function(result) {
        const excludedSites = result.excludedSites || [];
        if (excludedSites.includes(currentUrl)) {
          excludeSiteBtn.textContent = 'Include This Website';
        }
      });

      // Check the current dark mode state for this site
      chrome.storage.sync.get(['darkModeState'], function(result) {
        const darkModeState = result.darkModeState || {};
        darkModeToggle.checked = darkModeState[currentUrl] === true;
      });
    }
  });

  // Toggle dark mode
  darkModeToggle.addEventListener('change', function() {
    const isEnabled = this.checked;
    
    // Save the state for this site
    chrome.storage.sync.get(['darkModeState'], function(result) {
      const darkModeState = result.darkModeState || {};
      darkModeState[currentUrl] = isEnabled;
      
      chrome.storage.sync.set({darkModeState: darkModeState}, function() {
        // Send message to content script to apply/remove dark mode
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: isEnabled ? 'enableDarkMode' : 'disableDarkMode'
            });
          }
        });
      });
    });
  });

  // Exclude/Include site button
  excludeSiteBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['excludedSites'], function(result) {
      let excludedSites = result.excludedSites || [];
      
      if (excludedSites.includes(currentUrl)) {
        // Remove from excluded sites
        excludedSites = excludedSites.filter(site => site !== currentUrl);
        excludeSiteBtn.textContent = 'Exclude This Website';
      } else {
        // Add to excluded sites
        excludedSites.push(currentUrl);
        excludeSiteBtn.textContent = 'Include This Website';
        
        // Disable dark mode for this site
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'disableDarkMode'});
            darkModeToggle.checked = false;
            
            // Update dark mode state
            chrome.storage.sync.get(['darkModeState'], function(result) {
              const darkModeState = result.darkModeState || {};
              darkModeState[currentUrl] = false;
              chrome.storage.sync.set({darkModeState: darkModeState});
            });
          }
        });
      }
      
      chrome.storage.sync.set({excludedSites: excludedSites});
    });
  });
});
