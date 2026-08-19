/**
 * 示例：视野与缩放控制（React 变体）
 * 核心 API：moveAndZoom / moveMap / setZoom / setViewPort / setViewPortByPolygon
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
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
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { viewportOverlays } from "../shared/data";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const [status, setStatus] = useState("初始化中…");

  const sourceId = setSourceIdName("demo", "viewport");
  const layerId = setLayerIdName("demo", "viewport");

  useEffect(() => {
    let disposed = false;
    createMinemapMap(hostRef.current!, token)
      .then((m) => {
        if (disposed) {
          m.remove();
          return;
        }
        mapRef.current = m;
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
        setStatus("覆盖物已绘制：点 / 线 / 多边形各 1 个");
      })
      .catch((err) => setStatus(String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = (fn: (m: minemap.Map) => void, msg: string) => () => {
    const m = mapRef.current;
    if (!m) {
      setStatus("地图尚未初始化完成");
      return;
    }
    fn(m);
    setStatus(msg);
  };

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
          top: 12,
          left: 12,
          zIndex: 30,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <button
          type="button"
          className="demo-btn"
          onClick={act(
            (m) => moveAndZoom(m, [116.3976, 39.9087], 12),
            "moveAndZoom(map, [116.3976, 39.9087], 12) → easeTo"
          )}
        >
          moveAndZoom → 天安门 z12
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={act(
            (m) => moveMap(m, [116.3154, 39.9829]),
            "moveMap(map, [116.3154, 39.9829]) → panTo"
          )}
        >
          moveMap → 中关村
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={act(
            (m) => setZoom(m, 14),
            "setZoom(map, 14) 已执行（注意：zoom ≤ 10 时函数不生效）"
          )}
        >
          setZoom → 14
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={act(
            (m) => setViewPort(m, viewportOverlays as any, { boundary: [60, 60, 60, 60] }),
            "setViewPort(map, overlays) → fitBounds 适配全部覆盖物"
          )}
        >
          setViewPort 自适应
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={act((m) => {
            const polygonFeature = viewportOverlays.find(
              (f) => f.geometry.type === "Polygon"
            ) as any;
            setViewPortByPolygon(m, polygonFeature, [80, 80, 80, 80]);
          }, "setViewPortByPolygon(map, polygonFeature, boundary) 已执行")}
        >
          setViewPortByPolygon
        </button>
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
    const clean = renderNoTokenPanel(container, "视野与缩放控制");
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
