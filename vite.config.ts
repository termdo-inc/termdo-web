import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const APP_PORT = parseInt(env["APP_PORT"]!, 10);

  return {
    build: {
      emptyOutDir: true,
      outDir: "out",
      minify: true,
    },
    plugins: [react()],
    server: {
      port: APP_PORT,
      strictPort: true,
    },
    preview: {
      port: APP_PORT,
      strictPort: true,
    },
    envPrefix: ["PUBLIC_"],
  };
});
