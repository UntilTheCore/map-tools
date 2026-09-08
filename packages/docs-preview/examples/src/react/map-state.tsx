/**
 * 地图状态：React 监听 moveend/zoomend 实时读取状态，并演示 panTo/easeTo/setZoom。
 * 关键点：事件监听在 useEffect 中绑定并在 cleanup 中移除；状态经 useState 回显。
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { easeTo, panTo, setZoom } from "@ym/map-tools";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const DEMO_CENTER: [number, number] = [106.62, 29.48];

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const [status, setStatus] = useState("初始化中");

  useEffect(() => {
    if (!token) return; // 无 token 时渲染占位面板，不初始化地图
    let disposed = false;
    const readState = (map: minemap.Map) => {
      const center = map.getCenter();
      setStatus(
        `zoom=${map.getZoom().toFixed(2)} center=[${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]`,
      );
    };
    createMinemapMap(hostRef.current!, token)
      .then((map) => {
        if (disposed) {
          map.remove();
          return;
        }
        mapRef.current = map;
        const onMoveEnd = () => readState(map);
        const onZoomEnd = () => readState(map);
        map.on("moveend", onMoveEnd);
        map.on("zoomend", onZoomEnd);
        readState(map);
      })
      .catch((error: unknown) => {
        if (!disposed)
          setStatus(`初始化失败：${error instanceof Error ? error.message : String(error)}`);
      });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  const guard = () => {
    if (!mapRef.current) {
      setStatus("地图尚未就绪");
      return null;
    }
    return mapRef.current;
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 30,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="demo-btn"
          onClick={() => guard() && panTo(mapRef.current!, DEMO_CENTER)}
        >
          panTo 平移
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={() =>
            guard() && easeTo(mapRef.current!, { center: DEMO_CENTER, zoom: 13, duration: 800 })
          }
        >
          easeTo 缓动
        </button>
        <button
          type="button"
          className="demo-btn"
          onClick={() => guard() && setZoom(mapRef.current!, 12)}
        >
          setZoom 12
        </button>
      </div>
      <div
        className="demo-status"
        style={{ position: "absolute", left: 12, bottom: 12, zIndex: 30 }}
      >
        {status}
      </div>
    </div>
  );
}

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图状态");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token} />);
  return () => root.unmount();
}
