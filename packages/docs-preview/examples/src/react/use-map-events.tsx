/**
 * 示例：useMap 事件监听（React 变体）
 * 核心 API：useMap（@ym/map-tools/react）
 *   mapInitialize / onMapLoaded / onClickLayerEventDispatcher / onClickNoInLayers /
 *   onMouseMoveLayerEventDispatcher / onMoveNoInLayers /
 *   onZoomLayerEventDispatcher / onZoomNoInLayers / unBindMapEvent
 *
 * 注意：react 版 mapInstance 为 MutableRefObject（通过 .current 访问），
 * 组件卸载时自动解绑事件；默认不销毁地图（如需销毁，useMap 传入 destroyOnUnmount: true）。
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { useMap } from "@ym/map-tools/react";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { districtA } from "../shared/data";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<string[]>([]);

  const log = (msg: string) => {
    logRef.current = [...logRef.current, msg];
    setLogs(logRef.current);
  };

  const sourceId = setSourceIdName("demo", "eventPolygon");
  const layerId = setLayerIdName("demo", "eventPolygon");

  const {
    mapInstance,
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

  useEffect(() => {
    let disposed = false;
    createMinemapMap(hostRef.current!, token)
      .then((m) => {
        if (disposed) {
          m.remove();
          return;
        }
        // 地图实例经 mapInitialize 注入 useMap（自动绑定事件）
        mapInitialize(m);
      })
      .catch((err) => log("初始化失败：" + String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  onMapLoaded((map) => {
    log("onMapLoaded → 地图已就绪，添加演示图层");
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
    log(`已绑定图层 ${layerId}，可点击 / 移动 / 缩放触发事件`);
  });

  onClickLayerEventDispatcher((data) => {
    const props = (data.feature as any)?.properties ?? {};
    log(`点击图层：layerId=${data.layerId} name=${props.name ?? "-"}`);
  });
  onClickNoInLayers((e) => {
    log(
      `点击空白：lng=${e?.lngLat?.lng?.toFixed?.(4) ?? "-"} lat=${
        e?.lngLat?.lat?.toFixed?.(4) ?? "-"
      }`
    );
  });
  onMouseMoveLayerEventDispatcher((data) => {
    log(`悬停图层：layerId=${data.layerId}`);
  });
  onMoveNoInLayers(() => {
    log("悬停空白区域");
  });
  onZoomLayerEventDispatcher((data) => {
    log(
      `缩放命中图层：zoom=${data.zoom} layerId=${data.layerId} 鼠标=[${data.mouseCoordinate
        .map((n: number) => n.toFixed(4))
        .join(",")}]`
    );
  });
  onZoomNoInLayers(() => {
    log("缩放后鼠标位置无绑定图层");
  });

  const unbind = () => {
    unBindMapEvent();
    log("unBindMapEvent 已执行：点击/移动/缩放监听已解绑");
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
        <button type="button" className="demo-btn" onClick={unbind}>
          解绑事件 unBindMapEvent
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
        <button
          type="button"
          className="demo-btn"
          onClick={() =>
            log(`mapInstance.current → ${mapInstance.current ? "存在" : "null"}`)
          }
        >
          查看 mapInstance
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
          useMap 事件日志
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 10px", lineHeight: 1.6 }}>
          {logs.map((l, i) => (
            <div key={i}>
              #{i + 1} {l}
            </div>
          ))}
        </div>
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
    const clean = renderNoTokenPanel(container, "useMap 事件监听");
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
