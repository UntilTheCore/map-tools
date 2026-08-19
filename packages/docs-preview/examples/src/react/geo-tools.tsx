/**
 * 示例：坐标与几何工具（React 变体）
 * 核心 API：getBearing / getRotation / getRotationByCoordinate /
 *           getCenterBetweenRightPointIntersection / checkCoordinate /
 *           pointListToCoordList / getLineStringEndpoint / getPolygonVertex /
 *           getFeatureTypeList / FeatureTypeEnum / setSourceIdName / setLayerIdName
 */
import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { geoDemo, routeLine } from "../shared/data";

/** 纯几何计算（不依赖地图，先计算好） */
function computeLogs(): string[] {
  const logs: string[] = [];

  const bearing = getBearing(geoDemo.currentPoint, geoDemo.nextPoint);
  const rotation = getRotation(bearing);
  const rotation2 = getRotationByCoordinate(
    geoDemo.currentPoint,
    geoDemo.nextPoint
  );
  logs.push(
    `getBearing(${geoDemo.currentPoint} → ${geoDemo.nextPoint}) = ${bearing.toFixed(4)}°`
  );
  logs.push(`getRotation(${bearing.toFixed(4)}) = ${rotation.toFixed(4)}°（补偿 180）`);
  logs.push(`getRotationByCoordinate(current, next) = ${rotation2.toFixed(4)}°`);

  const intersection = getCenterBetweenRightPointIntersection(
    geoDemo.polygonCoords
  );
  logs.push(
    `getCenterBetweenRightPointIntersection(polygon) = [${
      intersection ? intersection.map((n) => n.toFixed(4)).join(", ") : "undefined"
    }]`
  );

  for (const c of geoDemo.checkCases) {
    try {
      checkCoordinate(c.value);
      logs.push(`checkCoordinate(${c.label}) → ✅ 通过`);
    } catch (err) {
      logs.push(`checkCoordinate(${c.label}) → ❌ ${(err as Error).message}`);
    }
  }

  const pointFeatures = (routeLine.features[0] as any).geometry.coordinates.map(
    (coord: number[], i: number) => ({
      type: "Feature",
      properties: { idx: i },
      geometry: { type: "Point", coordinates: coord },
    })
  );
  const coords = pointListToCoordList(pointFeatures);
  logs.push(
    `pointListToCoordList(points) → ${coords
      .map((c) => `[${c[0].toFixed(3)},${c[1].toFixed(3)}]`)
      .join(" ")}`
  );

  const endpoints = getLineStringEndpoint(routeLine as any);
  logs.push(
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
  logs.push(`getPolygonVertex(polygon) → ${vertices.length} 个顶点`);

  const mixedFeatures = [
    ...pointFeatures,
    routeLine.features[0],
    polygonFC.features[0],
  ] as any[];
  const points = getFeatureTypeList(mixedFeatures, FeatureTypeEnum.Point);
  const lines = getFeatureTypeList(mixedFeatures, FeatureTypeEnum.LineString);
  const polygons = getFeatureTypeList(mixedFeatures, FeatureTypeEnum.Polygon);
  logs.push(
    `getFeatureTypeList → Point:${points.length} LineString:${lines.length} Polygon:${polygons.length}`
  );

  logs.push(
    `setSourceIdName("demo","geo") = "${setSourceIdName(
      "demo",
      "geo"
    )}" / setLayerIdName = "${setLayerIdName("demo", "geo")}"`
  );
  return logs;
}

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("初始化中…");
  const logs = useMemo(computeLogs, []);

  useEffect(() => {
    let disposed = false;
    createMinemapMap(hostRef.current!, token)
      .then((m) => {
        if (disposed) {
          m.remove();
          return;
        }
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
        setStatus("几何工具计算完成，结果见右侧面板");
      })
      .catch((err) => setStatus(String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={hostRef}
        style={{ position: "absolute", inset: 0 }}
        className="demo-map-host"
      />
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          bottom: 12,
          zIndex: 30,
          width: 320,
          display: "flex",
          flexDirection: "column",
          borderRadius: 8,
          overflow: "hidden",
          background: "rgba(8,14,12,.9)",
          border: "1px solid rgba(77,224,139,.3)",
          fontFamily: "ui-monospace, Consolas, monospace",
          fontSize: 12,
          color: "#cdeee0",
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderBottom: "1px solid rgba(77,224,139,.25)",
            color: "#4de08b",
            fontWeight: 600,
          }}
        >
          几何计算结果
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 10px", lineHeight: 1.6 }}>
          {logs.map((l, i) => (
            <div key={i}>
              #{i + 1} {l}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          zIndex: 30,
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 12,
          background: "rgba(8,14,12,.86)",
          color: "#b9f6d5",
          border: "1px solid rgba(77,224,139,.35)",
          fontFamily: "ui-monospace, Consolas, monospace",
        }}
      >
        {status}
      </div>
    </div>
  );
}

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "坐标与几何工具");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token!} />);
  return () => {
    root.unmount();
    container.innerHTML = "";
  };
}
