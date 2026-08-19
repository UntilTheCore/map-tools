/**
 * 示例：视野与缩放控制（HTML · FE_utils UMD 变体）
 * 核心 API：FE_utils.moveAndZoom / moveMap / setZoom / setViewPort / setViewPortByPolygon
 */
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

  const sourceId = FE_utils.setSourceIdName("demo", "viewport");
  const layerId = FE_utils.setLayerIdName("demo", "viewport");

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      FE_utils.setSourceData(
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

  const withMap = (fn: (m: minemap.Map) => void, msg: string) => () => {
    if (!map) {
      status.error("地图尚未初始化完成");
      return;
    }
    fn(map);
    status.info(msg);
  };

  addButton(
    bar,
    "moveAndZoom → 天安门 z12",
    withMap(
      (m) => FE_utils.moveAndZoom(m, [116.3976, 39.9087], 12),
      "moveAndZoom(map, [116.3976, 39.9087], 12) → easeTo"
    )
  );
  addButton(
    bar,
    "moveMap → 中关村",
    withMap(
      (m) => FE_utils.moveMap(m, [116.3154, 39.9829]),
      "moveMap(map, [116.3154, 39.9829]) → panTo"
    )
  );
  addButton(
    bar,
    "setZoom → 14",
    withMap(
      (m) => FE_utils.setZoom(m, 14),
      "setZoom(map, 14) 已执行（注意：zoom ≤ 10 时函数不生效）"
    )
  );
  addButton(
    bar,
    "setViewPort 自适应",
    withMap(
      (m) =>
        FE_utils.setViewPort(m, viewportOverlays as any, {
          boundary: [60, 60, 60, 60],
        }),
      "setViewPort(map, overlays) → fitBounds 适配全部覆盖物"
    )
  );
  addButton(
    bar,
    "setViewPortByPolygon",
    withMap((m) => {
      const polygonFeature = viewportOverlays.find(
        (f) => f.geometry.type === "Polygon"
      ) as any;
      FE_utils.setViewPortByPolygon(m, polygonFeature, [80, 80, 80, 80]);
    }, "setViewPortByPolygon(map, polygonFeature, boundary) 已执行")
  );

  return () => {
    disposed = true;
    container.innerHTML = "";
  };
}
