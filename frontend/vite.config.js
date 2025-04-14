import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import path from "path";

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    port: 5173,
  },
  resolve: {
    alias: [
      { find: '/src/assets', replacement: '/assets' }
    ]
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep gif files in a separate exercises directory
          if (assetInfo.name.endsWith('.gif')) {
            const pathParts = assetInfo.name.split('/');
            // Preserve folder structure for exercises
            if (pathParts.includes('exercises')) {
              const exerciseType = pathParts[pathParts.length - 2]; // Get the exercise type folder
              return `assets/exercises/${exerciseType}/[name]-[hash][extname]`;
            }
            return 'assets/gifs/[name]-[hash][extname]';
          }
          // Other assets
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    assetsInlineLimit: 0, // Don't inline GIFs regardless of size
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:8000"
    ),
  }
});
