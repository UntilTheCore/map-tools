/**
 * demos vue2 专用构建配置：仅构建 vue2.html -> public/demos
 *
 * alias 'vue' -> Vue 2.7 运行时的绝对路径（npm:vue@2.7.16 的 vue.runtime.esm.js）：
 * 使 @ym/map-tools/vue2 产物（其直接 import "vue"）与示例代码均解析到 Vue 2.7。
 * 必须用绝对路径——map-tools 产物经软链解析，裸 "vue2" 从 map-tools 目录无法解析到
 * docs-preview 下的 vue2 依赖（os error 2），Vite 亦提示应 resolve 到绝对路径。
 *
 * outDir 与主构建相同，emptyOutDir: false 避免覆盖主构建产物
 * （两次构建按内容 hash 命名 chunk，共享 chunk 内容一致可安全覆盖）。
 */
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url)); // examples/
const require = createRequire(import.meta.url);
const vue2Runtime = require.resolve("vue2"); // -> vue@2.7.16/dist/vue.runtime.esm.js

export default defineConfig({
  root,
  publicDir: resolve(root, "public"),
  base: "./",
  resolve: {
    alias: {
      vue: vue2Runtime,
    },
  },
  build: {
    outDir: resolve(root, "../public/demos"),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        vue2: resolve(root, "vue2.html"),
      },
    },
  },
});
