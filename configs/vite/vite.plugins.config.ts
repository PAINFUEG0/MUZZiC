import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: [/^node:/], output: { entryFileNames: "plugins.js" } },
    lib: { entry: "./src/plugins/index.ts", formats: ["cjs"] },
  },
});
