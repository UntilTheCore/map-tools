/**
 * 示例：Marker 清理管理（React 变体）
 * 核心 API：removeMarkers / removeMarkersOrPopups
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { removeMarkers, removeMarkersOrPopups } from "@ym/map-tools";
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { markerPoints } from "../shared/data";

function makeMarkerEl(label: string, color = "#4de08b"): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = label;
  el.style.cssText = [
    "display:inline-block;padding:2px 8px;border-radius:999px;",
    `background:${color};color:#04120c;font-size:11px;font-weight:700;`,
    "font-family:ui-monospace,Consolas,monospace;white-space:nowrap;",
    "transform:translate(-50%,-100%);",
  ].join("");
  return el;
}

function getPopupContentEl(text: string): HTMLElement {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText =
    "padding:6px 10px;font-size:12px;color:#04120c;background:#fff;border-radius:6px;";
  return el;
}

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const markersRef = useRef<minemap.Marker[]>([]);
  const mixedRef = useRef<(minemap.Marker | minemap.Popup)[]>([]);
  const [status, setStatus] = useState("初始化中…");

  useEffect(() => {
    let disposed = false;
    createMinemapMap(hostRef.current!, token)
      .then((m) => {
        if (disposed) {
          m.remove();
          return;
        }
        mapRef.current = m;
        setStatus("地图已初始化，可添加 Marker / Popup 后批量清理");
      })
      .catch((err) => setStatus(String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = (fn: () => void, msg: string) => () => {
    if (!mapRef.current) {
      setStatus("地图尚未初始化完成");
      return;
    }
    fn();
    setStatus(msg);
  };

  const addMarkers = act(() => {
    const m = mapRef.current!;
    const colors = ["#4de08b", "#4dc3e0", "#ff9d4d", "#ff6b8a", "#c99df0"];
    (markerPoints.features as any[]).forEach((f, i) => {
      const marker = new minemap.Marker(
        makeMarkerEl(f.properties.name, colors[i % colors.length]),
        { offset: [0, -8] }
      );
      marker.setLngLat(f.geometry.coordinates);
      marker.addTo(m);
      markersRef.current.push(marker);
    });
  }, `已创建 ${markerPoints.features.length} 个 Marker（removeMarkers 可批量清理）`);

  const cleanMarkers = act(() => {
    removeMarkers(markersRef.current as any);
    markersRef.current = [];
  }, "removeMarkers(markers) 已执行：全部 Marker 已移除");

  const addMixed = act(() => {
    const m = mapRef.current!;
    const center: [number, number] = [116.4026, 39.9494];
    const marker = new minemap.Marker(makeMarkerEl("混合-标记", "#ff9d4d"), {
      offset: [0, -8],
    });
    marker.setLngLat([center[0] - 0.03, center[1]]);
    marker.addTo(m);

    const popup = new minemap.Popup({
      closeOnClick: false,
      closeButton: true,
      offset: [0, -10],
    });
    popup
      .setLngLat([center[0] + 0.03, center[1]])
      .setDOMContent(getPopupContentEl("混合-Popup"))
      .addTo(m);

    mixedRef.current.push(marker, popup);
  }, "已添加 1 个 Marker + 1 个 Popup（removeMarkersOrPopups 可统一清理）");

  const cleanMixed = act(() => {
    removeMarkersOrPopups(mixedRef.current);
    mixedRef.current = [];
  }, "removeMarkersOrPopups(mixed) 已执行：Marker + Popup 全部移除");

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
        <button type="button" className="demo-btn" style={btnStyle} onClick={addMarkers}>
          添加 Markers
        </button>
        <button type="button" className="demo-btn" style={btnStyle} onClick={cleanMarkers}>
          removeMarkers 清理
        </button>
        <button type="button" className="demo-btn" style={btnStyle} onClick={addMixed}>
          添加 Marker + Popup
        </button>
        <button type="button" className="demo-btn" onClick={cleanMixed}>
          removeMarkersOrPopups 清理
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
    const clean = renderNoTokenPanel(container, "Marker 清理管理");
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
