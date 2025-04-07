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

console.log("Using Google Client ID:", clientId);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider 
      clientId={clientId}
      onScriptLoadSuccess={() => console.log("Google API script loaded successfully")}
      onScriptLoadError={(error) => console.error("Google API script failed to load:", error)}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
