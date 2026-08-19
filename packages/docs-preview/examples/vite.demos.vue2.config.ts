/**
 * demos vue2 专用构建配置：仅构建 vue2.html -> public/demos
 *
 * vue-demi 版本冲突解决：
 * - alias 'vue' -> 'vue2'（npm 别名包，npm:vue@2.7.16）：使 vue-demi 与示例代码均解析到 vue2
 * - alias 'vue-demi' -> 'vue-demi/lib/v2.7/index.mjs'：强制 vue-demi 走 v2.7 实现，
 *   保证 @ym/map-tools/vue2（其产物 external vue-demi）在运行时按 vue2 模式工作
 *
 * outDir 与主构建相同，emptyOutDir: false 避免覆盖主构建产物
 * （两次构建按内容 hash 命名 chunk，共享 chunk 内容一致可安全覆盖）。
 */
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url)); // examples/

export default defineConfig({
  root,
  publicDir: resolve(root, "public"),
  base: "./",
  resolve: {
    alias: {
      vue: "vue2",
      "vue-demi": "vue-demi/lib/v2.7/index.mjs",
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
