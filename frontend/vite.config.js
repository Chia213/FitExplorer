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
          
          // Special handling for exercise GIFs to maintain folder structure
          if (ext === 'gif' && assetInfo.name.includes('exercises')) {
            // Extract the path structure
            const parts = assetInfo.name.split('/');
            const filename = parts[parts.length - 1];
            
            // Keep both paths - one with structure (for correctness) and one flattened (for fallback)
            if (parts.includes('male') || parts.includes('female')) {
              const gender = parts.includes('male') ? 'male' : 'female';
              
              // Copy to both paths to maximize compatibility
              // 1. This will be the structured path with gender
              return `assets/exercises/${gender}/${filename}`;
            }
            
            // Default flattened path for exercises that don't have gender folders
            return `assets/exercises/${filename}`;
          }
          
          // Default pattern for other assets
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
