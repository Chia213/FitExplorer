import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import path from "path";

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  base: '/',
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Copy all exercise GIFs to a predictable location
    assetsInlineLimit: 0, // Don't inline any assets as data URLs
    copyPublicDir: true, // Ensure public directory is copied
    // Ensure no hashing for GIF files to make paths predictable
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          // Special handling for icons
          if (assetInfo.name.includes('/icons/')) {
            return `assets/icons/${path.basename(assetInfo.name)}`;
          }

          // Special handling for exercise GIFs
          if (ext === 'gif' && assetInfo.name.includes('/exercises/')) {
            const parts = assetInfo.name.split('/exercises/');
            // Ensure the path is exactly as expected
            return `assets/exercises/${parts[1].toLowerCase()}`;
          }

          // For other assets, preserve their original structure
          return `assets/${assetInfo.name}`;
        },
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      }
    }
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:8000"
    ),
  }
});
