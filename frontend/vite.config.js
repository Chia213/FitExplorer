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
      '@': path.resolve(__dirname, './src')
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          // Special handling for exercise GIFs
          if (ext === 'gif' && assetInfo.name.includes('/exercises/')) {
            const parts = assetInfo.name.split('/exercises/');
            return `assets/exercises/${parts[1].toLowerCase()}`;
          }

          // For other assets
          return `assets/[name]-[hash].[ext]`;
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
