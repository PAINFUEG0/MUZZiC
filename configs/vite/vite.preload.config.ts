import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["electron"], output: { entryFileNames: "preload.cjs" } },
    lib: { entry: "./src/preload/index.cts", formats: ["cjs"], fileName: () => "preload.cjs" },
  },
});
