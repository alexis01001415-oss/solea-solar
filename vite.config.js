import { defineConfig } from "vite";
import { seoPlugin } from "./scripts/seo.mjs";

export default defineConfig({
  base: "/solea-solar/",
  plugins: [seoPlugin()],
  server: { watch: { ignored: ["**/tmp/**", "**/output/**"] } },
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
        },
      },
    },
  },
});
