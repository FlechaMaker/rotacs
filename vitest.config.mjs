import path from "path";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

export default defineConfig({
  plugins: [tsConfigPaths(), react()],
  test: {
    environment: "jsdom",
    env: dotenv.config({ path: ".env.test.local" }).parsed,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
