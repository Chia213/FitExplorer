import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./hooks/useAuth.jsx";

const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "917960701094-3448boe93v2n4bru03t0t71n6016lbao.apps.googleusercontent.com";

// Detect if we're running on mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
              window.navigator.standalone === true;

console.log("App initialization - Environment:", {
  isMobile,
  isPwa,
  clientId,
  userAgent: navigator.userAgent
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check if we're in standalone mode (installed PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone === true;
        
        if (isStandalone) {
          // Apply special classes for standalone mode
          document.body.classList.add('pwa-standalone-mode');
          
          // Inform the service worker we're in standalone mode
          if (registration.active) {
            registration.active.postMessage({
              type: 'STANDALONE_MODE'
            });
          }
          
          // Set a small timeout to ensure styles are applied after render
          setTimeout(() => {
            const workoutLogContainer = document.querySelector('.workout-log-container');
            if (workoutLogContainer) {
              workoutLogContainer.classList.add('standalone-layout');
            }
          }, 100);
        }
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'APPLY_STANDALONE_STYLES') {
            document.body.classList.add('pwa-standalone-mode');
          }
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Add CSS media query listener for standalone mode
const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
const handleStandaloneChange = (event) => {
  if (event.matches) {
    document.body.classList.add('pwa-standalone-mode');
  } else {
    document.body.classList.remove('pwa-standalone-mode');
  }
};
standaloneMediaQuery.addListener(handleStandaloneChange);
handleStandaloneChange(standaloneMediaQuery);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId={clientId}
      onScriptLoadError={() => console.error("Google API script failed to load")}
      onScriptLoadSuccess={() => console.log("Google API script loaded successfully")}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
