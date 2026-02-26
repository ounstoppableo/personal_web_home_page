import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    proxy: {
      "/apiFromMedia": {
        target: "http://localhost:9999/api",
        rewrite: (path) => path.replace(/^\/apiFromMedia/, ""),
        changeOrigin: true,
      },
      "/imageFromMedia": {
        target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/imageFromMedia/, ""),
        autoRewrite: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
