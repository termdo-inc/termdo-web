import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "out",
  },
  plugins: [react()],
  server: {
    port: 8080,
  },
});
