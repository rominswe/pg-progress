import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command, mode }) => {
  const isDev = command === "serve";
  const isAdmin = mode === "admin";
  const env = loadEnv(mode, path.resolve(process.cwd(), ".."), "");
  const API_BASE_URL = env.API_BASE_URL;

  return {
    plugins: [
      react(),
      isDev && componentTagger(),
      // history fallback for React Router
      isDev && {
        name: 'html-fallback',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.method === 'GET' && !req.url.includes('.') && !req.url.startsWith('/@') && !req.url.startsWith('/api')) {
              // Force the URL to the specific HTML entry point
              req.url = isAdmin ? '/admin.html' : '/user.html';
            }
            next();
          });
        },
      },

    ].filter(Boolean),

    define: {
      "import.meta.env.API_BASE_URL": JSON.stringify(API_BASE_URL),
    },

    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },

    server: isDev
      ? {
        host: "0.0.0.0",
        port: isAdmin ? 5174 : 5173,
        open: !process.env.DOCKER && (isAdmin ? "/admin.html" : "/user.html"),
        strictPort: true,
        proxy: {
          "/api": {
            target: API_BASE_URL,
            changeOrigin: true,
          },
          "/socket.io": {
            target: API_BASE_URL,
            ws: true,
          },
        },
      }
      : undefined,

    build: {
      rollupOptions: {
        input: {
          admin: path.resolve(process.cwd(), "admin.html"),
          user: path.resolve(process.cwd(), "user.html"),
        },
      },
    },
  };
});