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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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

          // Special handling for exercise GIFs
          if (ext === 'gif' && assetInfo.name.includes('/exercises/')) {
            const parts = assetInfo.name.split('/exercises/');
            return `assets/exercises/${parts[1]}`; // Preserve the full path after 'exercises/'
          }

          // Keep other assets in their original structure
          if (assetInfo.name.includes('src/assets/')) {
            const parts = assetInfo.name.split('src/assets/');
            return `assets/${parts[1]}`;
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
