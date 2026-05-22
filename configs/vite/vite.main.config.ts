import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: { external: ["electron", /^node:/], output: { entryFileNames: "muzzic.js" } },
    lib: { entry: "./src/main/index.ts", formats: ["cjs"] },
  },
});
