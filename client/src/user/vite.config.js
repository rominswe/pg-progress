import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  server: {
    port: 5173,
    host: "0.0.0.0",
  },

  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
}));