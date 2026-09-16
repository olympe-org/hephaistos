import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // No offline support: the app is a client for a rendering backend
      // (FFmpeg, SSE, uploads) that needs a live connection anyway. This is
      // only meant to make the app installable (desktop/mobile icon), so we
      // keep the service worker essentially empty — no asset precaching, no
      // runtime caching, network requests go through untouched.
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: [],
        // No SPA navigation fallback: without it, the service worker never
        // intercepts page loads — every navigation and API call goes straight
        // to the network, exactly like without a service worker.
        navigateFallback: null,
      },
      manifest: {
        name: "Vexia Studio",
        short_name: "Vexia",
        description: "Générateur de vidéos short-form.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0b0d",
        theme_color: "#0b0b0d",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
