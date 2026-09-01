/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves this repository below its repository name. Keep the
  // development and test servers at the origin root so existing local flows
  // continue to use http://127.0.0.1:4173/.
  base: mode === "production" ? "/intent-for-sale-webmcp/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
