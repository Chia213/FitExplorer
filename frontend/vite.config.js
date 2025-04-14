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
    alias: {
      '/assets': '/src/assets'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Copy all exercise GIFs to a predictable location
    assetsInlineLimit: 0, // Don't inline any assets as data URLs
    // Ensure no hashing for GIF files to make paths predictable
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (ext === 'gif' && assetInfo.name.includes('exercises')) {
            const parts = assetInfo.name.split('/');
            const filename = parts[parts.length - 1];
            
            // For exercise GIFs, maintain the exact same structure as source
            if (assetInfo.name.includes('/male/')) {
              return `assets/exercises/male/${filename}`;
            }
            if (assetInfo.name.includes('/female/')) {
              return `assets/exercises/female/${filename}`;
            }
            return `assets/exercises/${filename}`;
          }
          
          return `assets/[name]-[hash][extname]`;
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
