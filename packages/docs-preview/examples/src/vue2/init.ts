/**
 * 示例：底图初始化与销毁（Vue 2.7 变体）
 * 核心 API：destroyMap
 * 说明：vue2 变体使用 npm 别名包 vue2（npm:vue@2.7.16），渲染函数 new Vue({ render })
 */
import Vue from "vue2";
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

  // vue2 变体：new Vue({ render }) 挂载载体
  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = new Vue({ render: (h) => h("div") });
  app.$mount(carrier);

  return () => {
    disposed = true;
    app.$destroy();
    if (app.$el?.parentNode) app.$el.parentNode.removeChild(app.$el);
    if (map) destroyMap(map);
    container.innerHTML = "";
  };
}
