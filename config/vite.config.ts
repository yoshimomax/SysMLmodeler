import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// configディレクトリから見た相対パスを調整
const rootDir = path.resolve(import.meta.dirname, "..");

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src", "client"),
      "@shared": path.resolve(rootDir, "src", "shared"),
      "@assets": path.resolve(rootDir, "public", "assets"),
      "@model": path.resolve(rootDir, "src", "model"),
      "@store": path.resolve(rootDir, "src", "store"),
      "@components": path.resolve(rootDir, "src", "components"),
      "@services": path.resolve(rootDir, "src", "services"),
      "@validators": path.resolve(rootDir, "src", "validators"),
      "@adapters": path.resolve(rootDir, "src", "adapters"),
    },
  },
  root: path.resolve(rootDir, "public"),
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
  },
});
