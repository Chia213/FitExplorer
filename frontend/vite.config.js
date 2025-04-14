import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";

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
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Ensure no hashing for GIF files to make paths predictable
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep GIFs with their original name for better predictability
          if (assetInfo.name.endsWith('.gif')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:8000"
    ),
  }
});
