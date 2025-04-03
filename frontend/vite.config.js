import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  define: {
    "import.meta.env.VITE_BACKEND_URL": JSON.stringify(
      process.env.VITE_BACKEND_URL || "http://localhost:8000"
    ),
  },
});
