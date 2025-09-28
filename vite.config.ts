import { resolve } from "path"
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import libCss from 'vite-plugin-libcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    libCss()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "vue3-router-tab",
      fileName: (format) => `vue3-router-tab.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ["vue", "pinia"],
      output: {
        exports: 'named', 
        globals: {
          vue: "Vue",
        }
      }
    }
  }
})