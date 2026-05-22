import { defineConfig } from "vite";

export default defineConfig({
  build: { rollupOptions: { external: ["electron", /^node:/] }, lib: { entry: "./src/main/index.ts", formats: ["es"] } },
});
