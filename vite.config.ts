import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    transformer: "postcss", // 👈 disable lightningcss, fallback to PostCSS
     lightningcss: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})
