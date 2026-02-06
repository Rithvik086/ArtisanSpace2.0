import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  // Force optimizeDeps to include recharts to avoid stale pre-bundled cache issues
  optimizeDeps: {
    include: ["recharts", "ogl"]
  },
});
