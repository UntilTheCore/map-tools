/**
 * 示例：坐标与几何工具（Vue 3 变体）
 * 核心 API：getBearing / getRotation / getRotationByCoordinate /
 *           getCenterBetweenRightPointIntersection / checkCoordinate /
 *           pointListToCoordList / getLineStringEndpoint / getPolygonVertex /
 *           getFeatureTypeList / FeatureTypeEnum / setSourceIdName / setLayerIdName
 */
import { createApp, h } from "vue";
import {
  getBearing,
  getRotation,
  getRotationByCoordinate,
  getCenterBetweenRightPointIntersection,
  checkCoordinate,
  pointListToCoordList,
  getLineStringEndpoint,
  getPolygonVertex,
  getFeatureTypeList,
  FeatureTypeEnum,
  setSourceIdName,
  setLayerIdName,
  setSourceData,
} from "@ym/map-tools";
import {
  styleHost,
  createMapHost,
  createStatusBar,
  createLogPanel,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { geoDemo, routeLine } from "../shared/data";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "坐标与几何工具");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const status = createStatusBar(container);
  const log = createLogPanel(container, "几何计算结果");
  log.el.style.width = "320px";

  let map: minemap.Map | null = null;
  let disposed = false;

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      const sourceId = setSourceIdName("demo", "geo");
      const layerId = setLayerIdName("demo", "geo");
      setSourceData(
        m,
        sourceId,
        {
          id: layerId,
          type: "line",
          source: sourceId,
          paint: { "line-color": "#4de08b", "line-width": 3 },
        },
        routeLine as any
      );
      status.info("几何工具计算完成，结果见右侧面板");
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  // 1. 方位角与旋转角
  const bearing = getBearing(geoDemo.currentPoint, geoDemo.nextPoint);
  const rotation = getRotation(bearing);
  const rotation2 = getRotationByCoordinate(
    geoDemo.currentPoint,
    geoDemo.nextPoint
  );
  log.log(
    `getBearing(${geoDemo.currentPoint} → ${geoDemo.nextPoint}) = ${bearing.toFixed(
      4
    )}°`
  );
  log.log(`getRotation(${bearing.toFixed(4)}) = ${rotation.toFixed(4)}°（补偿 180）`);
  log.log(
    `getRotationByCoordinate(current, next) = ${rotation2.toFixed(4)}°`
  );

  // 2. 多边形中点与右侧最东点连线的交点
  const intersection = getCenterBetweenRightPointIntersection(
    geoDemo.polygonCoords
  );
  log.log(
    `getCenterBetweenRightPointIntersection(polygon) = [${
      intersection ? intersection.map((n) => n.toFixed(4)).join(", ") : "undefined"
    }]`
  );

  // 3. checkCoordinate 校验
  for (const c of geoDemo.checkCases) {
    try {
      checkCoordinate(c.value);
      log.log(`checkCoordinate(${c.label}) → ✅ 通过`);
    } catch (err) {
      log.log(`checkCoordinate(${c.label}) → ❌ ${(err as Error).message}`);
    }
  }

  // 4. 顶点/端点提取
  const pointFeatures = (routeLine.features[0] as any).geometry.coordinates.map(
    (coord: number[], i: number) => ({
      type: "Feature",
      properties: { idx: i },
      geometry: { type: "Point", coordinates: coord },
    })
  );
  const coords = pointListToCoordList(pointFeatures);
  log.log(
    `pointListToCoordList(points) → ${coords
      .map((c) => `[${c[0].toFixed(3)},${c[1].toFixed(3)}]`)
      .join(" ")}`
  );

  const endpoints = getLineStringEndpoint(routeLine as any);
  log.log(
    `getLineStringEndpoint(line) → 端点 ${endpoints
      .map((c: number[]) => `[${c[0].toFixed(3)},${c[1].toFixed(3)}]`)
      .join(" ")}`
  );

  const polygonFC = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [geoDemo.polygonCoords] },
      },
    ],
  } as any;
  const vertices = getPolygonVertex(polygonFC);
  log.log(`getPolygonVertex(polygon) → ${vertices.length} 个顶点`);

  // 5. 要素类型过滤
  const mixedFeatures = [
    ...pointFeatures,
    routeLine.features[0],
    polygonFC.features[0],
  ] as any[];
  const points = getFeatureTypeList(mixedFeatures, FeatureTypeEnum.Point);
  const lines = getFeatureTypeList(mixedFeatures, FeatureTypeEnum.LineString);
  const polygons = getFeatureTypeList(mixedFeatures, FeatureTypeEnum.Polygon);
  log.log(
    `getFeatureTypeList → Point:${points.length} LineString:${lines.length} Polygon:${polygons.length}`
  );

  // 6. id 命名
  log.log(
    `setSourceIdName("demo","geo") = "${setSourceIdName(
      "demo",
      "geo"
    )}" / setLayerIdName = "${setLayerIdName("demo", "geo")}"`
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
