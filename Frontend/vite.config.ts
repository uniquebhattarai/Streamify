import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(),
     tailwindcss()
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@features": resolve(__dirname, "src/features"),
      "@utils": resolve(__dirname, "src/utils"),
      "@assets": resolve(__dirname, "src/assets"),
      "@pages": resolve(__dirname, "src/Pages"),
      "@layout": resolve(__dirname, "src/layouts"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@routes": resolve(__dirname, "src/routes"),
      "@context": resolve(__dirname, "src/context"),
      "@api": resolve(__dirname, "src/api"),
      "@styles": resolve(__dirname, "src/styles"),
      "@services": resolve(__dirname, "src/services"),
    },
  },
})
