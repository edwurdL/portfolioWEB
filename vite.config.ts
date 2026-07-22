import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/",
  build: { outDir: 'docs' },
  define: {
    __BUILD_DATE__: JSON.stringify(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    ),
  },
});

