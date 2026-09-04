/**
 * vue2.html 入口：按 ?ex= 参数动态加载 src/vue2/{id}.ts 并渲染。
 * 注意：该入口由 vite.demos.vue2.config.ts 单独构建（alias: vue -> Vue 2.7 运行时绝对路径）。
 */
import "../shared/demo.css";
import type { ExampleRender } from "../shared/demo";
import { createToolbar } from "../shared/toolbar";
import { resolveToken } from "../shared/loadMinemap";
import { getExampleMeta, DEFAULT_EXAMPLE } from "../registry";

const params = new URLSearchParams(window.location.search);
const exId = params.get("ex") ?? DEFAULT_EXAMPLE;
const meta = getExampleMeta(exId);
const token = resolveToken() ?? undefined;

createToolbar(document.getElementById("toolbar")!, meta, "Vue 2.7");

const modules = import.meta.glob<{ default: ExampleRender }>("../vue2/*.ts");
const loader = modules[`../vue2/${exId}.ts`] ?? modules[`../vue2/${DEFAULT_EXAMPLE}.ts`];

const container = document.getElementById("app")!;
let dispose: (() => void) | null = null;

loader().then((mod) => {
  dispose = mod.default(container, { token });
});

window.addEventListener("beforeunload", () => {
  dispose?.();
});
