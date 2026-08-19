import { defineConfig, type Plugin } from "vite";

/**
 * UMD 构建钩子:向 dist/umd 输出一个 package.json,声明 commonjs,
 * 保证 require('./dist/umd/index.umd.js') 时走 CommonJS 分支返回导出对象。
 */
function umdCommonjsFlag(): Plugin {
  return {
    name: "umd-commonjs-flag",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "package.json",
        source: JSON.stringify({ type: "commonjs" }, null, 2),
      });
    },
  };
}

// UMD 构建:自包含(无 external),全局名 FE_utils,esbuild 压缩,不产出 dts
export default defineConfig({
  build: {
    outDir: "dist/umd",
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: "src/index.ts",
      name: "FE_utils",
      formats: ["umd"],
      fileName: () => "index.umd.js",
    },
    rollupOptions: {
      external: [],
      output: {
        extend: true,
      },
    },
  },
  plugins: [umdCommonjsFlag()],
});
