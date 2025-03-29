
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    strictPort: false,
    cors: true,
    hmr: {
      // Explicitly configure HMR to prevent WebSocket token issues
      clientPort: 443,
      protocol: 'wss',
    },
  },
  define: {
    // Define the WS_TOKEN to prevent the "not defined" error
    __WS_TOKEN__: JSON.stringify("development-token"),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'lucide-react',
      'date-fns',
    ],
  },
}));
