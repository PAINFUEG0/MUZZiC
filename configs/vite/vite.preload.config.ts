/** @format */

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["electron"], output: { entryFileNames: "preload.js" } },
    lib: { entry: "./src/preload/index.ts", formats: ["cjs"] },
  },
});
