/**
 * 示例：Popup 弹窗（Vue 2.7 变体）
 * 核心 API：getPopupDom（@ym/map-tools/vue2 框架版，经 vue-demi 自动切换 vue2.7）
 */
import Vue from "vue2";
import { getPopupDom } from "@ym/map-tools/vue2";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
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
import { markerPoints } from "../shared/data";

/** 渲染函数组件（禁止 .vue SFC）：作为 popup 内容 */
const PopupContent = Vue.extend({
  props: {
    title: { type: String, default: "" },
    lngLat: {
      type: Object as Vue.PropType<{ lng: number; lat: number } | null>,
      default: null,
    },
  },
  render(h) {
    return h(
      "div",
      {
        style: {
          padding: "8px 12px",
          minWidth: "180px",
          background: "#0d1a15",
          border: "1px solid rgba(77,224,139,.5)",
          borderRadius: "8px",
          color: "#eafff5",
          fontSize: "12px",
          fontFamily: "ui-monospace, Consolas, monospace",
        },
      },
      [
        h("div", { style: { fontWeight: "700", color: "#4de08b" } }, this.title),
        h(
          "div",
          { style: { marginTop: "4px", color: "#b9f6d5" } },
          `经度: ${this.lngLat?.lng ?? "-"}  纬度: ${this.lngLat?.lat ?? "-"}`
        ),
        h(
          "div",
          { style: { marginTop: "4px", color: "#5e8c77" } },
          "内容由 Vue 2.7 渲染函数组件挂载（getPopupDom）"
        ),
      ]
    );
  },
});

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "Popup 弹窗");
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
  let clickHandler: ((e: any) => void) | null = null;
  const openPopups: minemap.Popup[] = [];

  const sourceId = setSourceIdName("demo", "popupPoints");
  const layerId = setLayerIdName("demo", "popupPoints");

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      setSourceData(
        m,
        sourceId,
        {
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
        },
        markerPoints as any
      );

      clickHandler = (e: any) => {
        const dom = getPopupDom(PopupContent, {
          title: "Popup 弹窗",
          lngLat: e.lngLat,
        });
        const popup = new minemap.Popup({
          closeOnClick: false,
          closeButton: true,
          offset: [0, -10],
        });
        popup
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setDOMContent(dom)
          .addTo(m);
        openPopups.push(popup);
        status.info(
          `getPopupDom(组件, props) → minemap.Popup 已打开（当前 ${openPopups.length} 个）`
        );
      };
      m.on("click", clickHandler);
      status.info("点击地图任意位置弹出 Popup（内容为 Vue 2.7 渲染函数组件）");
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  addButton(bar, "清理全部 Popup", () => {
    openPopups.forEach((p) => p.remove());
    openPopups.length = 0;
    status.info("已关闭全部 Popup");
  });

  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = new Vue({ render: (h) => h("div") });
  app.$mount(carrier);

  return () => {
    disposed = true;
    if (map && clickHandler) map.off("click", clickHandler);
    openPopups.forEach((p) => p.remove());
    app.$destroy();
    if (app.$el?.parentNode) app.$el.parentNode.removeChild(app.$el);
    container.innerHTML = "";
  };
}
