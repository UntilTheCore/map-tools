/**
 * 示例：视野与缩放控制（Vue 3 变体）
 * 核心 API：moveAndZoom / moveMap / setZoom / setViewPort / setViewPortByPolygon
 */
import { createApp, h } from "vue";
import {
  moveAndZoom,
  moveMap,
  setZoom,
  setViewPort,
  setViewPortByPolygon,
  setSourceData,
  setSourceIdName,
  setLayerIdName,
} from "@ym/map-tools";
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
import { viewportOverlays } from "../shared/data";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "视野与缩放控制");
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

  const sourceId = setSourceIdName("demo", "viewport");
  const layerId = setLayerIdName("demo", "viewport");

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      // 把覆盖物画到地图上
      setSourceData(
        m,
        sourceId,
        {
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: { "circle-radius": 6, "circle-color": "#4de08b" },
        },
        { type: "FeatureCollection", features: viewportOverlays } as any
      );
      status.info("覆盖物已绘制：点 / 线 / 多边形各 1 个");
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  const withMap = (fn: (m: minemap.Map) => void) => {
    if (map) fn(map);
    else status.error("地图尚未初始化完成");
  };

  addButton(bar, "moveAndZoom → 天安门 z12", () =>
    withMap((m) => {
      moveAndZoom(m, [116.3976, 39.9087], 12);
      status.info("moveAndZoom(map, [116.3976, 39.9087], 12) → easeTo");
    })
  );

  addButton(bar, "moveMap → 中关村", () =>
    withMap((m) => {
      moveMap(m, [116.3154, 39.9829]);
      status.info("moveMap(map, [116.3154, 39.9829]) → panTo");
    })
  );

  addButton(bar, "setZoom → 14", () =>
    withMap((m) => {
      setZoom(m, 14);
      status.info("setZoom(map, 14) 已执行（注意：zoom ≤ 10 时函数不生效）");
    })
  );

  addButton(bar, "setViewPort 自适应", () =>
    withMap((m) => {
      setViewPort(m, viewportOverlays as any, { boundary: [60, 60, 60, 60] });
      status.info("setViewPort(map, overlays) → fitBounds 适配全部覆盖物");
    })
  );

  addButton(bar, "setViewPortByPolygon", () =>
    withMap((m) => {
      const polygonFeature = viewportOverlays.find(
        (f) => f.geometry.type === "Polygon"
      ) as any;
      setViewPortByPolygon(m, polygonFeature, [80, 80, 80, 80]);
      status.info("setViewPortByPolygon(map, polygonFeature, boundary) 已执行");
    })
  );

  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = createApp({ render: () => h("div") });
  app.mount(carrier);

  return () => {
    disposed = true;
    app.unmount();
    container.innerHTML = "";
  };
}
