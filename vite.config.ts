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
      fileName: (format) => format === 'es' ? 'vue3-router-tab.js' : 'vue3-router-tab.umd.cjs',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        exports: 'named', 
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
