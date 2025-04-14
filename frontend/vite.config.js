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
            
            // List of problematic files that need special handling
            const criticalExerciseFiles = [
              'dumbbell-russian-twist.gif',
              // Add other critical files here if needed
            ];
            
            // Special handling for known problematic files
            if (criticalExerciseFiles.includes(filename)) {
              console.log(`Special handling for critical file: ${filename} during build`);
              // Create multiple copies in different paths for maximum compatibility
              return `assets/exercises/male/${filename}`;
            }
            
            // For all exercise GIFs, we'll copy them to both paths:
            // 1. With gender structure (if applicable)
            // 2. Without gender structure (for fallback)
            
            // First determine if we have gender information
            if (parts.includes('male') || parts.includes('female')) {
              const gender = parts.includes('male') ? 'male' : 'female';
              
              // Copy the file to the gender-specific path
              // We'll handle the non-gender path in a separate setup
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
