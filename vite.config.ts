/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static build. base:'./' keeps asset URLs relative so the same /dist works
// at a GitHub-/Cloudflare-Pages subpath and from the local filesystem.
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
