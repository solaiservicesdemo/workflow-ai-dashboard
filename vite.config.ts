import { defineConfig, Plugin } from "vite";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const { default: react } = await import("@vitejs/plugin-react-swc");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      outDir: "dist/spa",
    },
    plugins: [react(), expressPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
