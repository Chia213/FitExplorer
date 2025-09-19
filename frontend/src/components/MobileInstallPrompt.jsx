import React, { useEffect, useState } from 'react';
import { isPwaMode, isMobileDevice } from '../utils/deviceDetection';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * A component that helps with mobile PWA installation and provides guidance
 * for touch events in PWA mode
 */
const MobileInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPwa, setIsPwa] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if the app is in PWA mode or on a mobile device
    setIsPwa(isPwaMode());
    setIsMobile(isMobileDevice());
    
    // Disable the install prompt - never show it
    setShowPrompt(false);
    
    // Detect orientation changes
    const handleOrientationChange = () => {
      // Force re-render on orientation change to fix layout issues
      setIsMobile(isMobileDevice());
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  // Add an initialization function to fix button touch events on mobile Safari
  useEffect(() => {
    if (isMobile) {
      // Fix for buttons not being touchable on iOS Safari
      const fixTouchEvents = () => {
        document.querySelectorAll('button').forEach(button => {
          button.addEventListener('touchstart', () => {
            // This empty handler ensures the button receives touch events
          }, { passive: true });
        });
      };
      
      fixTouchEvents();
      
      // Re-apply fix after DOM changes
      const observer = new MutationObserver(fixTouchEvents);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      
      return () => observer.disconnect();
    }
  }, [isMobile]);
  
  if (!showPrompt && !isPwa) return null;
  
  return (
    <>
      {showPrompt && (
        <div className="fixed bottom-4 right-4 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-start">
            <FaInfoCircle className="text-xl mr-2 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-1">Add to Home Screen</h3>
              <p className="text-sm">
                For the best experience, add this app to your home screen.
              </p>
              <button 
                className="mt-2 bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium"
                onClick={() => setShowPrompt(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isPwa && (
        <style jsx global>{`
          /* Fix for touch events in PWA mode */
          button, a, .btn, [role="button"] {
            cursor: pointer;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Force button hover/active states to be more responsive */
          button:active, a:active, .btn:active, [role="button"]:active {
            opacity: 0.7;
            transform: scale(0.98);
            transition: transform 0.1s, opacity 0.1s;
          }
        `}</style>
      )}
    </>
  );
};

export default MobileInstallPrompt; 