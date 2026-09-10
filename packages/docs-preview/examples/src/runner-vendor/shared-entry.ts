/**
 * runner vendor 共享模块入口：把示例公共依赖预打包为单文件 ESM，
 * 供 runner.html 的 import map 通过 `@shared/loadMinemap`、`@shared/demo` 引用。
 * 仅运行时 API（不含类型-only 引用与样式注入）。
 */
export {
  MINEMAP_CDN_MAIN,
  MINEMAP_CSS,
  SYSTEM_MINEMAP_KEY,
  createMinemapMap,
  createMinemapMapHandle,
  loadMinemap,
  setupMinemapGlobals,
} from "../shared/loadMinemap";
export {
  addButton,
  createControlBar,
  createLogPanel,
  createMapHost,
  createStatusBar,
  renderErrorPanel,
  styleHost,
  type ExampleRender,
  type RenderOptions,
} from "../shared/demo";
import "../shared/demo.css";
