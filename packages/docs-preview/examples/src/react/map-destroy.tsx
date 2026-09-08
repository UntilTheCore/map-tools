/**
 * 地图销毁：React 中调用 destroyMap 销毁实例并重新创建。
 * 关键点：地图实例放 useRef（不触发渲染）；requestId 防止"销毁后旧异步创建"覆盖新地图。
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { destroyMap } from "@ym/map-tools";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<minemap.Map | null>(null);
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState("初始化中");

  const create = () => {
    if (!token) return;
    const currentRequest = ++requestIdRef.current;
    setStatus("地图创建中…");
    createMinemapMap(hostRef.current!, token)
      .then((nextMap) => {
        if (currentRequest !== requestIdRef.current) {
          nextMap.remove(); // 迟到的创建结果：直接释放
          return;
        }
        mapRef.current = nextMap;
        setStatus("地图已创建（点击「销毁地图」释放实例）");
      })
      .catch((error: unknown) =>
        setStatus(`创建失败：${error instanceof Error ? error.message : String(error)}`),
      );
  };

  const destroy = () => {
    if (!mapRef.current) {
      setStatus("当前没有地图实例");
      return;
    }
    destroyMap(mapRef.current);
    mapRef.current = null;
    hostRef.current?.replaceChildren();
    setStatus("destroyMap 已执行，实例已释放");
  };

  useEffect(() => {
    create();
    return () => {
      requestIdRef.current++; // 使尚未完成的创建结果失效
      if (mapRef.current) destroyMap(mapRef.current);
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 30, display: "flex", gap: 8 }}>
        <button type="button" className="demo-btn" onClick={destroy}>
          销毁地图
        </button>
        <button type="button" className="demo-btn" onClick={create}>
          重新创建
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
    const clean = renderNoTokenPanel(container, "地图销毁");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token} />);
  return () => root.unmount();
}
