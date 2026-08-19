/**
 * plain.html 入口：按 ?ex= 参数动态加载 src/html/{id}.ts 并渲染。
 * 运行时依赖 window.FE_utils（UMD 全局，由 plain.html 中 <script> 标签加载），
 * 模块内仅保留类型引用（import type），不会打包 @ym/map-tools。
 */
import "../shared/demo.css";
import type { ExampleRender } from "../shared/demo";
import { createToolbar } from "../shared/toolbar";
import { resolveToken } from "../shared/loadMinemap";
import { renderErrorPanel } from "../shared/demo";
import { getExampleMeta, DEFAULT_EXAMPLE } from "../registry";

const params = new URLSearchParams(window.location.search);
const exId = params.get("ex") ?? DEFAULT_EXAMPLE;
const meta = getExampleMeta(exId);
const token = resolveToken() ?? undefined;

createToolbar(document.getElementById("toolbar")!, meta, "HTML · FE_utils");

const container = document.getElementById("app")!;
let dispose: (() => void) | null = null;

if (typeof (window as any).FE_utils === "undefined") {
  renderErrorPanel(
    container,
    "window.FE_utils 未定义：UMD 脚本 vendor/fe-utils.umd.js 加载失败。"
  );
} else {
  const modules = import.meta.glob<{ default: ExampleRender }>("../html/*.ts");
  const loader =
    modules[`../html/${exId}.ts`] ?? modules[`../html/${DEFAULT_EXAMPLE}.ts`];
  loader().then((mod) => {
    dispose = mod.default(container, { token });
  });
}

window.addEventListener("beforeunload", () => {
  dispose?.();
});
