import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { useMap } from "@ym/map-tools/react";
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";
import { districtA } from "../shared/data";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";
import { errorMessage, featureName } from "../shared/v3";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const sourceId = createSourceId("demo", "eventPolygon");
  const layerId = createLayerId("demo", "eventPolygon");
  const { mapRef, setMap, on, unbindAll } = useMap({
    layers: {
      click: [layerId],
      mousemove: [layerId],
      zoomend: [layerId],
    },
    zoomQueryBy: "mouse",
    mapLifecycle: "owned",
  });

  const appendLog = (message: string) => {
    logRef.current = [...logRef.current, message];
    setLogs(logRef.current);
  };

  useEffect(() => {
    const subscriptions = [
      on("loaded", ({ map }) => {
        upsertGeoJSONSource(map, { id: sourceId, data: districtA });
        ensureLayers(map, [
          {
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: { "fill-color": "#4de08b", "fill-opacity": 0.3 },
          },
        ]);
        appendLog(`loaded: 已添加 ${layerId}`);
      }),
      on("click:layer", ({ features, layerIds }) =>
        appendLog(`click:layer ${layerIds.join(", ")} ${featureName(features[0])}`),
      ),
      on("click:empty", ({ mouseCoordinate }) =>
        appendLog(
          `click:empty ${mouseCoordinate?.map((value) => value.toFixed(4)).join(", ") ?? "-"}`,
        ),
      ),
      on("mousemove:layer", ({ features }) =>
        appendLog(`mousemove:layer ${featureName(features[0])}`),
      ),
      on("mousemove:empty", () => appendLog("mousemove:empty")),
      on("zoomend:layer", ({ features }) => appendLog(`zoomend:layer ${featureName(features[0])}`)),
      on("zoomend:empty", () => appendLog("zoomend:empty")),
    ];
    let disposed = false;
    createMinemapMap(hostRef.current!, token, {}, setMap)
      .then(() => {
        if (!disposed) appendLog("setMap: 地图已交给 useMap 管理");
      })
      .catch((error: unknown) => {
        if (!disposed) appendLog(`初始化失败: ${errorMessage(error)}`);
      });
    return () => {
      disposed = true;
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [layerId, on, setMap, sourceId, token]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} className="demo-map-host" style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 30, display: "flex", gap: 8 }}>
        <button
          type="button"
          className="demo-btn"
          onClick={() => {
            unbindAll();
            appendLog("unbindAll: 本 Hook 注册的监听已解绑");
          }}
        >
          解绑所有监听
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={() => appendLog(`mapRef.current: ${mapRef.current ? "已绑定" : "null"}`)}
        >
          查看 mapRef
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={() => {
            logRef.current = [];
            setLogs([]);
          }}
        >
          清空日志
        </button>
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          bottom: 12,
          zIndex: 30,
          width: 280,
          overflow: "auto",
          padding: 10,
          background: "rgba(8,14,12,.9)",
          border: "1px solid rgba(77,224,139,.3)",
          color: "#cdeee0",
          fontSize: 12,
        }}
      >
        {logs.map((line, index) => (
          <div key={`${index}-${line}`}>
            #{index + 1} {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "useMap 事件监听");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token} />);
  return () => root.unmount();
}
