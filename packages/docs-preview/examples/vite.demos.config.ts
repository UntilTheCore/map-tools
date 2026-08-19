/**
 * demos 主构建配置（默认 vue3 解析）：
 * 构建 vue3.html + react.html + plain.html -> public/demos
 *
 * - react .tsx 由 vite esbuild 原生处理（jsx: automatic），无需 @vitejs/plugin-react
 * - plain.html 依赖 publicDir(vendor/fe-utils.umd.js) 中的 UMD，运行时全局 FE_utils
 * - base: './' 保证产物被 VitePress 服务在 /demos/ 下时资源相对引用可用
 */
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url)); // examples/

export default defineConfig({
  root,
  publicDir: resolve(root, "public"),
  base: "./",
  build: {
    outDir: resolve(root, "../public/demos"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        vue3: resolve(root, "vue3.html"),
        react: resolve(root, "react.html"),
        plain: resolve(root, "plain.html"),
      },
    },
  },
});
