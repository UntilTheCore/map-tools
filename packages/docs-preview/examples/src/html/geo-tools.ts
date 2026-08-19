/**
 * 示例：坐标与几何工具（HTML · FE_utils UMD 变体）
 * 核心 API：FE_utils.getBearing / getRotation / getRotationByCoordinate /
 *           getCenterBetweenRightPointIntersection / checkCoordinate /
 *           pointListToCoordList / getLineStringEndpoint / getPolygonVertex /
 *           getFeatureTypeList / FeatureTypeEnum / setSourceIdName / setLayerIdName
 */
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
      const sourceId = FE_utils.setSourceIdName("demo", "geo");
      const layerId = FE_utils.setLayerIdName("demo", "geo");
      FE_utils.setSourceData(
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
  const bearing = FE_utils.getBearing(geoDemo.currentPoint, geoDemo.nextPoint);
  const rotation = FE_utils.getRotation(bearing);
  const rotation2 = FE_utils.getRotationByCoordinate(
    geoDemo.currentPoint,
    geoDemo.nextPoint
  );
  log.log(
    `getBearing(${geoDemo.currentPoint} → ${geoDemo.nextPoint}) = ${bearing.toFixed(4)}°`
  );
  log.log(`getRotation(${bearing.toFixed(4)}) = ${rotation.toFixed(4)}°（补偿 180）`);
  log.log(`getRotationByCoordinate(current, next) = ${rotation2.toFixed(4)}°`);

  // 2. 多边形中点与右侧最东点连线的交点
  const intersection = FE_utils.getCenterBetweenRightPointIntersection(
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
      FE_utils.checkCoordinate(c.value);
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
  const coords = FE_utils.pointListToCoordList(pointFeatures);
  log.log(
    `pointListToCoordList(points) → ${coords
      .map((c) => `[${c[0].toFixed(3)},${c[1].toFixed(3)}]`)
      .join(" ")}`
  );

  const endpoints = FE_utils.getLineStringEndpoint(routeLine as any);
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
  const vertices = FE_utils.getPolygonVertex(polygonFC);
  log.log(`getPolygonVertex(polygon) → ${vertices.length} 个顶点`);

  // 5. 要素类型过滤
  const mixedFeatures = [
    ...pointFeatures,
    routeLine.features[0],
    polygonFC.features[0],
  ] as any[];
  const points = FE_utils.getFeatureTypeList(mixedFeatures, FE_utils.FeatureTypeEnum.Point);
  const lines = FE_utils.getFeatureTypeList(mixedFeatures, FE_utils.FeatureTypeEnum.LineString);
  const polygons = FE_utils.getFeatureTypeList(mixedFeatures, FE_utils.FeatureTypeEnum.Polygon);
  log.log(
    `getFeatureTypeList → Point:${points.length} LineString:${lines.length} Polygon:${polygons.length}`
  );

  // 6. id 命名
  log.log(
    `setSourceIdName("demo","geo") = "${FE_utils.setSourceIdName(
      "demo",
      "geo"
    )}" / setLayerIdName = "${FE_utils.setLayerIdName("demo", "geo")}"`
  );

  return () => {
    disposed = true;
    container.innerHTML = "";
  };
}
