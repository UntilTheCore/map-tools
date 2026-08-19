/**
 * 示例：useMap 事件监听（Vue 2.7 变体）
 * 核心 API：useMap（@ym/map-tools/vue2，vue-demi 按 vue2.7 模式工作）
 */
import Vue from "vue2";
import { useMap } from "@ym/map-tools/vue2";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
import {
  styleHost,
  createMapHost,
  createLogPanel,
  createControlBar,
  addButton,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { districtA } from "../shared/data";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "useMap 事件监听");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const log = createLogPanel(container, "useMap 事件日志");

  const sourceId = setSourceIdName("demo", "eventPolygon");
  const layerId = setLayerIdName("demo", "eventPolygon");

  let disposed = false;
  let unBind: (() => void) | null = null;

  /** 渲染函数组件：setup 中调用 useMap（vue2.7 原生支持 setup） */
  const App = {
    setup() {
      const {
        mapInitialize,
        onMapLoaded,
        onClickLayerEventDispatcher,
        onClickNoInLayers,
        onMouseMoveLayerEventDispatcher,
        onMoveNoInLayers,
        onZoomLayerEventDispatcher,
        onZoomNoInLayers,
        unBindMapEvent,
      } = useMap({
        bindClickLayers: [layerId],
        bindMouseMoveLayers: [layerId],
        bindZoomLayers: [layerId],
        zoomQueryBy: "mouse",
      });

      onMapLoaded((map) => {
        log.log("onMapLoaded → 地图已就绪，添加演示图层");
        setSourceData(
          map,
          sourceId,
          {
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: { "fill-color": "#4de08b", "fill-opacity": 0.3 },
          },
          districtA as any
        );
        log.log(`已绑定图层 ${layerId}，可点击 / 移动 / 缩放触发事件`);
      });

      onClickLayerEventDispatcher((data) => {
        const props = (data.feature as any)?.properties ?? {};
        log.log(`点击图层：layerId=${data.layerId} name=${props.name ?? "-"}`);
      });
      onClickNoInLayers((e) => {
        log.log(
          `点击空白：lng=${e?.lngLat?.lng?.toFixed?.(4) ?? "-"} lat=${
            e?.lngLat?.lat?.toFixed?.(4) ?? "-"
          }`
        );
      });
      onMouseMoveLayerEventDispatcher((data) => {
        log.log(`悬停图层：layerId=${data.layerId}`);
      });
      onMoveNoInLayers(() => {
        log.log("悬停空白区域");
      });
      onZoomLayerEventDispatcher((data) => {
        log.log(
          `缩放命中图层：zoom=${data.zoom} layerId=${data.layerId} 鼠标=[${data.mouseCoordinate
            .map((n: number) => n.toFixed(4))
            .join(",")}]`
        );
      });
      onZoomNoInLayers(() => {
        log.log("缩放后鼠标位置无绑定图层");
      });

      unBind = () => unBindMapEvent();

      createMinemapMap(host, token!)
        .then((m) => {
          if (disposed) {
            m.remove();
            return;
          }
          mapInitialize(m);
        })
        .catch((err) => {
          log.log("初始化失败：" + String(err?.message ?? err));
        });
    },
    render(h: any) {
      return h("div", { style: { display: "none" } });
    },
  };

  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = new Vue({ render: (h) => h(App) });
  app.$mount(carrier);

  addButton(bar, "解绑事件 unBindMapEvent", () => {
    unBind?.();
    log.log("unBindMapEvent 已执行：点击/移动/缩放监听已解绑");
  });
  addButton(bar, "清空日志", () => log.clear());

  return () => {
    disposed = true;
    app.$destroy(); // 触发 onUnmounted → 自动 unBindMapEvent
    if (app.$el?.parentNode) app.$el.parentNode.removeChild(app.$el);
    container.innerHTML = "";
  };
}
