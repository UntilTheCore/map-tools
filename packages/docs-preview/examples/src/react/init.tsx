/**
 * 示例：底图初始化与销毁（React 变体）
 * 核心 API：destroyMap
 */
import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { destroyMap } from "@ym/map-tools";
import { styleHost, renderNoTokenPanel, type RenderOptions } from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const seqRef = useRef(0);
  const [status, setStatus] = useState("地图初始化中…");

  const initMap = useCallback(() => {
    const seq = ++seqRef.current;
    setStatus("地图初始化中…（createMinemapMap → minemap.Map）");
    createMinemapMap(hostRef.current!, token)
      .then((m) => {
        if (seq !== seqRef.current) {
          m.remove();
          return;
        }
        mapRef.current = m;
        setStatus("地图已初始化。点击「销毁地图」将调用 destroyMap(map)");
      })
      .catch((err) => {
        setStatus("初始化失败：" + String(err?.message ?? err));
      });
  }, [token]);

  useEffect(() => {
    initMap();
    return () => {
      seqRef.current++;
      if (mapRef.current) destroyMap(mapRef.current);
    };
  }, [initMap]);

  const destroy = () => {
    if (mapRef.current) {
      destroyMap(mapRef.current);
      mapRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
      setStatus("destroyMap 已执行：地图实例已销毁（map.remove()）");
    } else {
      setStatus("当前没有地图实例");
    }
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
          gap: 8,
        }}
      >
        <button type="button" className="demo-btn" onClick={destroy}>
          销毁地图 destroyMap
        </button>
        <button type="button" className="demo-btn" onClick={initMap}>
          重新初始化
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
    const clean = renderNoTokenPanel(container, "底图初始化与销毁");
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
