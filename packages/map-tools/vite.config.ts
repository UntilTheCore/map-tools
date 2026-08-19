import { fileURLToPath, URL } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * 为指定产物 d.ts 文件顶部补充 minemap 全局类型引用。
 * ts-morph 打印声明时不保留源文件中的三斜线 reference,这里构建后补上,
 * 保证消费者拿到声明产物时 minemap.Map / MapLayer / MapSource 等全局类型可解析。
 * 基准目录基于 import.meta.url(配置文件所在目录),与执行构建时的 cwd 无关。
 * @param file - 相对 dist/types 的文件路径
 * @param ref - reference 的相对路径(相对该文件所在目录)
 */
function prependMinemapReference(file: string, ref: string) {
    const target = fileURLToPath(new URL(`./dist/types/${file}`, import.meta.url));
    const content = readFileSync(target, "utf8");
    if (!content.includes("minemap.d.ts")) {
        writeFileSync(target, `/// <reference path="${ref}" />\n\n${content}`);
    }
}

/**
 * 主构建需要 external 的框架包(含子路径,如 react-dom/client)。
 * vue-demi 是 dependency,由消费者侧根据 vue2/vue3 切换,必须 external;
 * @turf/turf 保持内联,不进该列表。
 */
const EXTERNAL_PACKAGES = ["vue", "vue-demi", "react", "react-dom"];

const external = (id: string) =>
  EXTERNAL_PACKAGES.some((dep) => id === dep || id.startsWith(`${dep}/`));

// 主构建:es + cjs 多入口(index / vue2 / vue3 / react);UMD 构建见 vite.umd.config.ts
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: {
        index: "src/index.ts",
        vue2: "src/vue2/index.ts",
        vue3: "src/vue3/index.ts",
        react: "src/react/index.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external,
    },
  },
  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist/types",
      tsconfigPath: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
      include: ["src"],
      copyDtsFiles: true,
      afterBuild: () => {
        prependMinemapReference("index.d.ts", "./types/minemap.d.ts");
        prependMinemapReference("core/index.d.ts", "../types/minemap.d.ts");
        prependMinemapReference("vue/index.d.ts", "../types/minemap.d.ts");
        prependMinemapReference("vue2/index.d.ts", "../types/minemap.d.ts");
        prependMinemapReference("vue3/index.d.ts", "../types/minemap.d.ts");
        prependMinemapReference("react/index.d.ts", "../types/minemap.d.ts");
      },
    }),
  ],
});
