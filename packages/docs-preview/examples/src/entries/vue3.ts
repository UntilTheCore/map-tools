/**
 * vue3.html 入口：按 ?ex= 参数动态加载 src/vue3/{id}.ts 并渲染。
 * 页面顶部工具条展示示例名与 token 状态。
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

createToolbar(document.getElementById("toolbar")!, meta, "Vue 3");

const modules = import.meta.glob<{ default: ExampleRender }>("../vue3/*.ts");
const loader = modules[`../vue3/${exId}.ts`] ?? modules[`../vue3/${DEFAULT_EXAMPLE}.ts`];

const container = document.getElementById("app")!;
let dispose: (() => void) | null = null;

loader().then((mod) => {
  dispose = mod.default(container, { token });
});

window.addEventListener("beforeunload", () => {
  dispose?.();
});
