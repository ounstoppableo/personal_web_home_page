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
      "/api": {
        target: "https://www.unstoppable840.cn",
        changeOrigin: true,
      },
      "/images": {
        target: "https://www.unstoppable840.cn",
        changeOrigin: true,
      },
      "/apiFromMedia": {
        target: "https://www.unstoppable840.cn:5335/api",
        rewrite: (path) => path.replace(/^\/apiFromMedia/, ""),
        changeOrigin: true,
      },
      "/imageFromMedia": {
        target: "https://www.unstoppable840.cn:5335",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/imageFromMedia/, ""),
        autoRewrite: true,
      },
      "/coinLore": {
        target: "https://api.coinlore.net/api/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/coinLore/, ""),
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
