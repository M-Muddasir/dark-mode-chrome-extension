// Modularized functions for better readability
function createDarkModeStyle() {
  const style = document.createElement('style');
  style.id = 'simple-dark-mode-styles';
  style.textContent = `
    /* Dark mode styles */
    html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, 
    acronym, address, big, cite, code, del, dfn, em, ins, kbd, q, s, samp, small, strike, strong, 
    sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, 
    caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, 
    footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {
      background-color: #1a1a1a !important;
      color: #e6e6e6 !important;
      border-color: #444 !important;
    }
    
    input, textarea, select, button {
      background-color: #2a2a2a !important;
      color: #e6e6e6 !important;
      border-color: #444 !important;
    }
    
    a {
      color: #8ab4f8 !important;
    }
    
    a:visited {
      color: #c58af9 !important;
    }
    
    /* SVG specific styles */
    svg {
      fill: #e6e6e6 !important;
    }
    
    svg path, svg rect, svg circle, svg ellipse, svg line, svg polyline, svg polygon {
      fill: #e6e6e6 !important;
      stroke: #e6e6e6 !important;
    }
    
    /* Don't invert images and videos */
    img, video, canvas, [style*="background-image"] {
      filter: brightness(0.8) !important;
    }
    
    /* Preserve colored SVGs but adjust brightness */
    svg.colored, .colored svg {
      filter: brightness(0.9) contrast(1.1) !important;
      fill: currentColor !important;
    }
    
    svg.colored path, .colored svg path,
    svg.colored rect, .colored svg rect,
    svg.colored circle, .colored svg circle,
    svg.colored ellipse, .colored svg ellipse,
    svg.colored line, .colored svg line,
    svg.colored polyline, .colored svg polyline,
    svg.colored polygon, .colored svg polygon {
      fill: currentColor !important;
      stroke: currentColor !important;
    }
  `;
  return style;
}

function isExcluded(callback) {
  const hostname = window.location.hostname;
  chrome.storage.sync.get(['excludedSites'], function(result) {
    const excludedSites = result.excludedSites || [];
    callback(excludedSites.includes(hostname));
  });
}

function checkDarkModeState() {
  const hostname = window.location.hostname;
  
  isExcluded(function(excluded) {
    if (excluded) return;
    
    chrome.storage.sync.get(['darkModeState'], function(result) {
      const darkModeState = result.darkModeState || {};
      if (darkModeState[hostname] === true) {
        enableDarkMode();
      }
    });
  });
}

function detectColoredSVGs() {
  // Find SVGs that are likely to be logos or colored icons
  const svgs = document.querySelectorAll('svg');
  
  svgs.forEach(svg => {
    // Check if this SVG is likely a logo or colored icon
    const isLogo = (
      // Check if it's in a header, footer, or navigation
      svg.closest('header, footer, nav') !== null ||
      // Check if it has multiple colors
      svg.querySelectorAll('[fill]:not([fill="none"]):not([fill="#000000"]):not([fill="#000"]):not([fill="black"])').length > 0 ||
      svg.querySelectorAll('[stroke]:not([stroke="none"]):not([stroke="#000000"]):not([stroke="#000"]):not([stroke="black"])').length > 0
    );
    
    if (isLogo) {
      svg.classList.add('colored');
    }
  });
}

function enableDarkMode() {
  const style = createDarkModeStyle();
  if (!document.head.contains(style)) {
    document.head.appendChild(style);
    // Detect and mark colored SVGs
    detectColoredSVGs();
    
    // Set up a mutation observer to handle dynamically added SVGs
    svgObserver = new MutationObserver(mutations => {
      let newSVGsAdded = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'SVG' || (node.nodeType === 1 && node.querySelector('svg'))) {
              newSVGsAdded = true;
            }
          });
        }
      });
      
      if (newSVGsAdded) {
        detectColoredSVGs();
      }
    });
    
    svgObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Store the observer globally so we can disconnect it when needed
let svgObserver = null;

function disableDarkMode() {
  const style = document.getElementById('simple-dark-mode-styles');
  if (style) {
    document.head.removeChild(style);
  }
  
  // Disconnect the observer if it exists
  if (svgObserver) {
    svgObserver.disconnect();
    svgObserver = null;
  }
  
  // Remove colored class from SVGs
  document.querySelectorAll('svg.colored').forEach(svg => {
    svg.classList.remove('colored');
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'enableDarkMode') {
    enableDarkMode();
  } else if (request.action === 'disableDarkMode') {
    disableDarkMode();
  }
});

checkDarkModeState();