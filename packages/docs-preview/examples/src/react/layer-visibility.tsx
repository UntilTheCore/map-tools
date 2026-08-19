/**
 * 示例：图层显隐控制（React 变体）
 * 核心 API：setSourceData / setMultipleLayerSourceData / showLayer / hideLayer /
 *           showLayers / hideLayers / toggleLayer / setSourceIdName / setLayerIdName
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import {
  setSourceData,
  setMultipleLayerSourceData,
  showLayer,
  hideLayer,
  showLayers,
  hideLayers,
  toggleLayer,
  setSourceIdName,
  setLayerIdName,
} from "@ym/map-tools";
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { districtA, districtB, markerPoints } from "../shared/data";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const [status, setStatus] = useState("初始化中…");

  const sourceIdA = setSourceIdName("demo", "districtA");
  const layerIdA = setLayerIdName("demo", "districtA");
  const sourceIdB = setSourceIdName("demo", "districtB");
  const layerIdB = setLayerIdName("demo", "districtB");
  const sourceIdPoints = setSourceIdName("demo", "points");
  const layerIdPoints = setLayerIdName("demo", "points");

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
          sourceIdA,
          {
            id: layerIdA,
            type: "fill",
            source: sourceIdA,
            paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
          },
          districtA as any
        );
        setMultipleLayerSourceData(
          m,
          sourceIdB,
          [
            {
              id: layerIdB,
              type: "fill",
              source: sourceIdB,
              paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.4 },
            },
          ],
          districtB as any
        );
        setSourceData(
          m,
          sourceIdPoints,
          {
            id: layerIdPoints,
            type: "circle",
            source: sourceIdPoints,
            paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
          },
          markerPoints as any
        );
        setStatus(
          `已添加 3 个图层：${layerIdA} / ${layerIdB} / ${layerIdPoints}`
        );
      })
      .catch((err) => setStatus(String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withMap = (fn: (m: minemap.Map) => void) => {
    if (mapRef.current) fn(mapRef.current);
    else setStatus("地图尚未初始化完成");
  };

  const act = (fn: (m: minemap.Map) => void, msg: string) => () => {
    withMap((m) => {
      fn(m);
      setStatus(msg);
    });
  };

  const btnStyle = { marginRight: 8 } as const;

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
          style={btnStyle}
          onClick={act((m) => hideLayer(m, layerIdA), `hideLayer("${layerIdA}") 已执行`)}
        >
          隐藏 {layerIdA}
        </button>
        <button
          type="button"
          className="demo-btn"
          style={btnStyle}
          onClick={act((m) => showLayer(m, layerIdA), `showLayer("${layerIdA}") 已执行`)}
        >
          显示 {layerIdA}
        </button>
        <button
          type="button"
          className="demo-btn"
          style={btnStyle}
          onClick={act(
            (m) => hideLayers(m, [layerIdA, layerIdB, layerIdPoints]),
            "hideLayers([…]) 已隐藏全部 3 个图层"
          )}
        >
          隐藏全部
        </button>
        <button
          type="button"
          className="demo-btn"
          style={btnStyle}
          onClick={act(
            (m) => showLayers(m, [layerIdA, layerIdB, layerIdPoints]),
            "showLayers([…]) 已显示全部 3 个图层"
          )}
        >
          显示全部
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={act(
            (m) => toggleLayer({ map: m, layerId: layerIdB }),
            `toggleLayer({ layerId: "${layerIdB}" }) 已执行（非受控模式）`
          )}
        >
          切换 {layerIdB}
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
    const clean = renderNoTokenPanel(container, "图层显隐控制");
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
