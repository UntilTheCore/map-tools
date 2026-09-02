import { fileURLToPath, URL } from "node:url";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

function writePublicTypeEntry(file: string, reference: string): void {
  const target = fileURLToPath(new URL(`./dist/types/${file}`, import.meta.url));
  writeFileSync(target, `/// <reference path="${reference}" />\n\nexport {};\n`);
}

function getDeclarationFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return getDeclarationFiles(path);
    return path.endsWith(".d.ts") ? [path] : [];
  });
}

function toNodeNextSpecifier(declarationFile: string, specifier: string): string {
  if (!specifier.startsWith(".") || /\.(?:[cm]?[jt]sx?|json|d\.ts)$/u.test(specifier)) {
    return specifier;
  }

  const resolved = resolve(dirname(declarationFile), specifier);
  if (existsSync(`${resolved}.d.ts`)) return `${specifier}.js`;
  if (existsSync(join(resolved, "index.d.ts"))) {
    return `${specifier.replace(/\/$/u, "")}/index.js`;
  }
  return specifier;
}

/**
 * vite-plugin-dts preserves TypeScript's extensionless relative specifiers.
 * They work with moduleResolution: bundler, but fail in published packages
 * consumed through NodeNext. Keep the declaration graph NodeNext-compatible.
 */
function rewriteDeclarationSpecifiersForNodeNext(): void {
  const typesDirectory = fileURLToPath(new URL("dist/types/", import.meta.url));
  for (const declarationFile of getDeclarationFiles(typesDirectory)) {
    const source = readFileSync(declarationFile, "utf8");
    const rewritten = source
      .replace(/\bfrom\s+(["'])(\.{1,2}\/[^'"]*?)\1/gu, (match, quote: string, specifier: string) =>
        match.replace(specifier, toNodeNextSpecifier(declarationFile, specifier)),
      )
      .replace(
        /\bimport\(\s*(["'])(\.{1,2}\/[^'"]*?)\1\s*\)/gu,
        (match, quote: string, specifier: string) =>
          match.replace(specifier, toNodeNextSpecifier(declarationFile, specifier)),
      );
    if (rewritten !== source) writeFileSync(declarationFile, rewritten);
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
        resources: "src/resources.ts",
        layers: "src/layers.ts",
        query: "src/query.ts",
        viewport: "src/viewport.ts",
        geometry: "src/geometry.ts",
        overlays: "src/overlays.ts",
        popup: "src/popup.ts",
        events: "src/events.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => (format === "es" ? `${entryName}.js` : `${entryName}.cjs`),
    },
    rollupOptions: {
      external,
    },
  },
  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist/types",
      tsconfigPath: fileURLToPath(new URL("tsconfig.json", import.meta.url)),
      include: ["src"],
      copyDtsFiles: true,
      afterBuild: () => {
        writePublicTypeEntry("minemap.d.ts", "./types/minemap.d.ts");
        writePublicTypeEntry("umd.d.ts", "./types/umd.d.ts");
        rewriteDeclarationSpecifiersForNodeNext();
      },
    }),
  ],
});
