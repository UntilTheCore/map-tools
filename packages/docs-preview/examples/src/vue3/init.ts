/**
 * 示例：底图初始化与销毁（Vue 3 变体）
 * 核心 API：destroyMap
 */
import { createApp, h } from "vue";
import { destroyMap } from "@ym/map-tools";
import {
  styleHost,
  createMapHost,
  createControlBar,
  addButton,
  createStatusBar,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "底图初始化与销毁");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const status = createStatusBar(container);

  let map: minemap.Map | null = null;
  let disposed = false;
  let seq = 0;

  function initMap() {
    const current = ++seq;
    status.info("地图初始化中…（createMinemapMap → minemap.Map）");
    createMinemapMap(host, token!)
      .then((m) => {
        if (disposed || current !== seq) {
          m.remove();
          return;
        }
        map = m;
        status.info(
          "地图已初始化。点击「销毁地图」将调用 destroyMap(map) → map.remove()"
        );
      })
      .catch((err) => {
        if (disposed) return;
        status.error("初始化失败：" + String(err?.message ?? err));
      });
  }

  addButton(bar, "销毁地图 destroyMap", () => {
    if (map) {
      destroyMap(map);
      map = null;
      host.innerHTML = "";
      status.info("destroyMap 已执行：地图实例已销毁（map.remove()）");
    } else {
      status.info("当前没有地图实例");
    }
  });

  addButton(bar, "重新初始化", initMap);

  initMap();

  // vue3 变体：创建载体 app（承载生命周期），业务逻辑基于 DOM 工具共享层
  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = createApp({ render: () => h("div") });
  app.mount(carrier);

  return () => {
    disposed = true;
    app.unmount();
    if (map) destroyMap(map);
    container.innerHTML = "";
  };
}
