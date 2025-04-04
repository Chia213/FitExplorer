import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }), 
    tailwindcss()
  ],
  server: {
    port: 5173,
  },
  define: {
    "import.meta.env.VITE_BACKEND_URL": JSON.stringify(
      process.env.VITE_BACKEND_URL || "http://localhost:8000"
    ),
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
});
