// Native App Wrapper for PWA
// This script hides browser UI elements to make the app feel more native

(function() {
  'use strict';
  
  // Hide browser UI elements
  function hideBrowserUI() {
    // Hide address bar on mobile
    if (window.innerHeight < 500) {
      window.scrollTo(0, 1);
    }
    
    // Hide browser chrome elements
    const style = document.createElement('style');
    style.textContent = `
      /* Hide browser UI elements */
      .browser-chrome {
        display: none !important;
      }
      
      /* Make app fullscreen */
      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      
      /* Hide scrollbars */
      ::-webkit-scrollbar {
        display: none;
      }
      
      /* Full viewport height */
      #root {
        height: 100vh;
        height: 100dvh; /* Dynamic viewport height */
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add native app features
  function addNativeFeatures() {
    // Add touch feedback
    document.addEventListener('touchstart', function() {}, true);
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // Add haptic feedback for buttons
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach(button => {
      button.addEventListener('touchstart', function() {
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      hideBrowserUI();
      addNativeFeatures();
    });
  } else {
    hideBrowserUI();
    addNativeFeatures();
  }
  
  // Handle orientation changes
  window.addEventListener('orientationchange', function() {
    setTimeout(hideBrowserUI, 100);
  });
  
  // Handle resize events
  window.addEventListener('resize', function() {
    hideBrowserUI();
  });
})();
