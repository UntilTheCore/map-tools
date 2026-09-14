/**
 * 预打包 runner 运行时 vendor（全部 ESM 单文件、命名导出）到 public/runner/vendor/。
 *
 * 用途：playground 编辑后的示例代码在 /runner.html 中经 import map 解析
 * `vue` / `vue2` / `react` / `react-dom/client` / `react/jsx-runtime` /
 * `react/jsx-dev-runtime` / `@ym/map-tools/vue3` / `@ym/map-tools/track` /
 * `@ym/map-tools/react` /
 * `@shared/loadMinemap` / `@shared/demo` / `@shared/trackData`，不依赖外网。
 *
 * 为何用 esbuild 而非 vite（rolldown）：
 * react/vue2 等包的入口是 CJS。rolldown 对 CJS 入口只产出
 * `export default require_x()` 的 default-only interop，且会把 wrapper 中
 * `export const X = D.X` 的命名 re-export 误树摇掉（rolldown 1.2.4 实测）；
 * esbuild 对「import C from cjs + export const X = C.X」的 wrapper 保留命名导出。
 *
 * react 实例共享（关键）：react-dom 与 jsx-runtime/jsx-dev-runtime 是 CJS，内部 `require("react")`。
 * 若分成三个 bundle，esbuild 对 CJS 内 require(external) 只能输出运行时 `__require`
 * （浏览器无 require，必然失败）。因此 **react / react-dom/client / react/jsx-runtime
 * 合并打进同一个 react.esm.js**：内部 require 在打包期就地解析，全 bundle 只有一份
 * react 实例。runner 的 import map 把四个裸名都映射到该文件：
 *   "react" / "react-dom/client" / "react/jsx-runtime" / "react/jsx-dev-runtime" → ./vendor/react.esm.js
 * 导出名取并集：react 全部 named + createRoot/hydrateRoot + jsx/jsxs（Fragment 两处
 * 同引用，只导出一次）。
 *
 * vue2 必须用 createRequire.resolve 取绝对路径（npm alias vue2 的软链上下文
 * 无法从依赖目录解析裸 "vue2"）。process.env.NODE_ENV 统一替换为 production。
 */
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(here, "../examples");
const outDir = path.resolve(here, "../public/runner/vendor");
const wrappersDir = path.join(examplesDir, ".vendor-wrappers");

const vue2Runtime = require.resolve("vue2/dist/vue.runtime.esm.js");
const reactCjs = require.resolve("react");
const reactDomClientCjs = require.resolve("react-dom/client");
const reactJsxRuntimeCjs = require.resolve("react/jsx-runtime");
const reactJsxDevRuntimeCjs = require.resolve("react/jsx-dev-runtime");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(wrappersDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const PROD = { "process.env.NODE_ENV": JSON.stringify("production") };

/**
 * 用 node 动态 import 读出 CJS 包的导出名（node 的 CJS named-interop 基于同样的
 * 静态分析），生成 esbuild 友好的 ESM wrapper：
 *   import C from "<cjs-abs-path>"; export const X = C.X; …
 * esbuild 会保留全部命名导出，并内嵌 CJS 打包成真 ESM。
 */
async function cjsExportNames(resolvedPath) {
  const { pathToFileURL } = await import("node:url");
  const mod = await import(pathToFileURL(resolvedPath).href);
  return Object.keys(mod).filter(
    (k) => !k.startsWith("_") && k !== "default" && k !== "module.exports",
  );
}

async function esbuildBundle({ stdinFile, outName, loader, external }) {
  await build({
    entryPoints: [stdinFile],
    bundle: true,
    format: "esm",
    platform: "browser",
    minify: false,
    define: PROD,
    absWorkingDir: examplesDir,
    outfile: path.join(outDir, outName),
    loader,
    external,
  });
}

async function writeWrapper(name, source) {
  const file = path.join(wrappersDir, name);
  fs.writeFileSync(file, source);
  return file;
}

/* ---------- 1. vue3（本身是 ESM） ---------- */
{
  // require.resolve("vue") 走 require 条件得到 CJS 的 index.js；ESM 入口需从
  // package.json 的 exports["."].import.default（esm-bundler）显式读取。
  const vuePkgRoot = path.dirname(require.resolve("vue/package.json"));
  const vueExports = JSON.parse(fs.readFileSync(path.join(vuePkgRoot, "package.json"), "utf8"))
    .exports["."];
  const vue3Entry = path.join(vuePkgRoot, vueExports.import.default).replace(/\\/g, "/");
  await esbuildBundle({
    stdinFile: await writeWrapper(
      "vue3-wrapper.mjs",
      // esm-bundler 仅有命名导出（无 default），default 语义取整个命名空间
      `import * as V from "${vue3Entry}";\nexport * from "${vue3Entry}";\nexport default V;\n`,
    ),
    outName: "vue3.esm.js",
  });
}

/* ---------- 2. vue2（wrapper + named exports） ---------- */
{
  const names = await cjsExportNames(vue2Runtime);
  const p = vue2Runtime.replace(/\\/g, "/");
  await esbuildBundle({
    stdinFile: await writeWrapper(
      "vue2-wrapper.mjs",
      [
        `import V from "${p}";`,
        ...names.map((k) => `export const ${k} = V.${k};`),
        `export default V;`,
      ].join("\n"),
    ),
    outName: "vue2.esm.js",
  });
}

/* ---------- 3. react 合并 bundle：react + react-dom/client + react/jsx-runtime ---------- */
{
  const reactNames = await cjsExportNames(reactCjs);
  const domClientNames = await cjsExportNames(reactDomClientCjs);
  const jsxRuntimeNames = await cjsExportNames(reactJsxRuntimeCjs);
  const jsxDevRuntimeNames = await cjsExportNames(reactJsxDevRuntimeCjs);

  // Fragment（react 与 jsx-runtime 同引用）与 version（react-dom/client 与 react 等值）
  // 只从 react 导出一次，避免命名冲突
  const jsxPart = jsxRuntimeNames
    .filter((k) => k !== "Fragment" && k !== "version" && !reactNames.includes(k))
    .map((k) => `export const ${k} = J.${k};`)
    .join("\n");
  const jsxDevPart = jsxDevRuntimeNames
    .filter((k) => !reactNames.includes(k) && !jsxRuntimeNames.includes(k))
    .map((k) => `export const ${k} = JD.${k};`)
    .join("\n");
  const domPart = domClientNames
    .filter((k) => k !== "version" || !reactNames.includes(k))
    .map((k) => `export const ${k} = D.${k};`)
    .join("\n");
  const reactPart = reactNames.map((k) => `export const ${k} = R.${k};`).join("\n");

  const source = [
    `import R from "${reactCjs.replace(/\\/g, "/")}";`,
    `import D from "${reactDomClientCjs.replace(/\\/g, "/")}";`,
    `import J from "${reactJsxRuntimeCjs.replace(/\\/g, "/")}";`,
    `import JD from "${reactJsxDevRuntimeCjs.replace(/\\/g, "/")}";`,
    reactPart,
    domPart,
    jsxPart,
    jsxDevPart,
  ].join("\n");

  await esbuildBundle({
    stdinFile: await writeWrapper("react-wrapper.mjs", source),
    outName: "react.esm.js",
  });
}

/* ---------- 4. map-tools vue3 适配层（useMap 等；teaching: playground vue3 示例直接使用） ----------
 * external "vue" 保持裸名，运行时由 runner 的裸名重写解析到 vue3.esm.js，
 * 与示例编译产物共用同一份 vue 实例。
 * 注意只 vendor vue3 子路径入口（useMap/createPopupDom 所在 chunk 图），
 * 该 chunk 图不引 @turf/turf；不能 vendor 主入口 "."（会把 turf 全量内联）。
 */
{
  const vue3Entry = require
    .resolve("@ym/map-tools/package.json")
    .replace(/package\.json$/, "dist/vue3.js");
  await esbuildBundle({
    stdinFile: await writeWrapper(
      "maptools-vue3-wrapper.mjs",
      `import * as M from "${vue3Entry.replace(/\\/g, "/")}";\nexport * from "${vue3Entry.replace(/\\/g, "/")}";\nexport default M;\n`,
    ),
    outName: "maptools-vue3.esm.js",
    external: ["vue"],
  });
}

/* ---------- 4b. map-tools track 子路径(轨迹回放;纯 core,无框架依赖) ----------
 * dist/track.js 的 chunk 图只含 errors/ids/lifecycle/player/fleet,不引 vue/react/turf,
 * 可整体内联打包为单文件。playground html/vue2/fleet 示例直接 import { createTrackPlayer, ... } from "@ym/map-tools/track"。
 */
{
  const trackEntry = require
    .resolve("@ym/map-tools/package.json")
    .replace(/package\.json$/, "dist/track.js");
  await esbuildBundle({
    stdinFile: await writeWrapper(
      "maptools-track-wrapper.mjs",
      `import * as M from "${trackEntry.replace(/\\/g, "/")}";\nexport * from "${trackEntry.replace(/\\/g, "/")}";\nexport default M;\n`,
    ),
    outName: "maptools-track.esm.js",
  });
}

/* ---------- 4c. map-tools react 适配层(useMap/useTrackPlayer 等) ----------
 * react / react-dom/client / react/jsx-runtime 保持裸名 external,运行时由
 * runner 的 rewriteVendor 别名解析到 react.esm.js(react 实例唯一)。
 */
{
  const reactEntry = require
    .resolve("@ym/map-tools/package.json")
    .replace(/package\.json$/, "dist/react.js");
  await esbuildBundle({
    stdinFile: await writeWrapper(
      "maptools-react-wrapper.mjs",
      `import * as M from "${reactEntry.replace(/\\/g, "/")}";\nexport * from "${reactEntry.replace(/\\/g, "/")}";\nexport default M;\n`,
    ),
    outName: "maptools-react.esm.js",
    external: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  });
}

/* ---------- 5. 示例共享模块（loadMinemap / demo / demo.css） ---------- */
{
  await esbuildBundle({
    stdinFile: path.join(examplesDir, "src/runner-vendor/shared-entry.ts"),
    outName: "shared.esm.js",
    // esbuild 会把 demo.css 拆分为 shared.esm.css 旁车文件，runner.html 手动引入
    loader: { ".css": "css" },
  });
}

console.log(`[runner-vendor] 构建完成 → ${outDir}`);
