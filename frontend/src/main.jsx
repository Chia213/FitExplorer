import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
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
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
  </StrictMode>
);
