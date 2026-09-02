/**
 * 将 packages/map-tools 的 UMD 产物复制到 examples/public/vendor/fe-utils.umd.js，
 * 供 plain.html(原生 HTML) 示例通过 <script> 标签加载全局 FE_utils。
 *
 * 注意 Windows 路径：统一使用 node:path resolve，避免反斜杠转义问题。
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// packages/docs-preview/scripts -> packages/map-tools/dist/umd/index.umd.js
const src = resolve(__dirname, "../../map-tools/dist/umd/index.umd.js");
// packages/docs-preview/examples/public/vendor
const destDir = resolve(__dirname, "../examples/public/vendor");
const dest = resolve(destDir, "fe-utils.umd.js");

if (!existsSync(src)) {
  console.error(
    `[copy-umd] 未找到 UMD 产物: ${src}\n` +
      `请先在 packages/map-tools 下执行 pnpm build 生成 dist/umd/index.umd.js`,
  );
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

const { size } = statSync(dest);
console.log(`[copy-umd] OK: ${src} -> ${dest} (${(size / 1024).toFixed(1)} KB)`);
