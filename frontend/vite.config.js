import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],

  // ✅ Important for Azure Static Web Apps
  build: {
    outDir: "dist",       // ensures Vite outputs to /dist
    assetsDir: "assets",  // keeps your current folder structure
    emptyOutDir: true     // clears old builds
  },

  preview: {
    port: 5173,
    strictPort: true,
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
