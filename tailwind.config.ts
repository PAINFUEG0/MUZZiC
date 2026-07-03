/** @format */

import type { Config } from "tailwindcss";

export default {
  plugins: [],
  theme: { extend: {} },
  content: ["./index.html", "./src/renderer/**/*.{ts,tsx}"],
} satisfies Config;
