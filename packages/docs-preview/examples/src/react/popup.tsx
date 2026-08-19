/**
 * 示例：Popup 弹窗（React 变体）
 * 核心 API：getPopupDom（@ym/map-tools/react 框架版，支持 React 元素挂载）
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { getPopupDom } from "@ym/map-tools/react";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { markerPoints } from "../shared/data";

/** React 元素：作为 popup 内容（由 getPopupDom 挂载到独立 root） */
function PopupContent({ title, lngLat }: { title: string; lngLat: any }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        minWidth: 180,
        background: "#0d1a15",
        border: "1px solid rgba(77,224,139,.5)",
        borderRadius: 8,
        color: "#eafff5",
        fontSize: 12,
        fontFamily: "ui-monospace, Consolas, monospace",
      }}
    >
      <div style={{ fontWeight: 700, color: "#4de08b" }}>{title}</div>
      <div style={{ marginTop: 4, color: "#b9f6d5" }}>
        经度: {lngLat?.lng ?? "-"}  纬度: {lngLat?.lat ?? "-"}
      </div>
      <div style={{ marginTop: 4, color: "#5e8c77" }}>
        内容由 React 元素挂载（getPopupDom）
      </div>
    </div>
  );
}

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const [status, setStatus] = useState("初始化中…");
  const [count, setCount] = useState(0);
  const clickHandlerRef = useRef<((e: any) => void) | null>(null);
  const popupsRef = useRef<minemap.Popup[]>([]);

  const sourceId = setSourceIdName("demo", "popupPoints");
  const layerId = setLayerIdName("demo", "popupPoints");

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
            paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
          },
          markerPoints as any
        );

        clickHandlerRef.current = (e: any) => {
          const dom = getPopupDom(
            <PopupContent title="Popup 弹窗" lngLat={e.lngLat} />
          );
          const popup = new minemap.Popup({
            closeOnClick: false,
            closeButton: true,
            offset: [0, -10],
          });
          popup
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .setDOMContent(dom)
            .addTo(m);
          popupsRef.current.push(popup);
          setCount(popupsRef.current.length);
          setStatus(
            `getPopupDom(<ReactElement/>) → minemap.Popup 已打开（当前 ${popupsRef.current.length} 个）`
          );
        };
        m.on("click", clickHandlerRef.current);
        setStatus("点击地图任意位置弹出 Popup（内容为 React 元素）");
      })
      .catch((err) => setStatus(String(err?.message ?? err)));
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    popupsRef.current.forEach((p) => p.remove());
    popupsRef.current = [];
    setCount(0);
    setStatus("已关闭全部 Popup");
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
        <button type="button" className="demo-btn" onClick={clear}>
          清理全部 Popup（当前 {count} 个）
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
    const clean = renderNoTokenPanel(container, "Popup 弹窗");
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
