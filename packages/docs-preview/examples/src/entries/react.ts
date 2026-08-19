/**
 * react.html 入口：按 ?ex= 参数动态加载 src/react/{id}.tsx 并渲染。
 * .tsx 由 vite esbuild 原生支持（jsx: automatic），无需 @vitejs/plugin-react。
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

createToolbar(document.getElementById("toolbar")!, meta, "React");

const modules = import.meta.glob<{ default: ExampleRender }>("../react/*.tsx");
const loader =
  modules[`../react/${exId}.tsx`] ?? modules[`../react/${DEFAULT_EXAMPLE}.tsx`];

const container = document.getElementById("app")!;
let dispose: (() => void) | null = null;

loader().then((mod) => {
  dispose = mod.default(container, { token });
});

window.addEventListener("beforeunload", () => {
  dispose?.();
});
