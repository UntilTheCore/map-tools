/**
 * 地图初始化：React 中用 useEffect 持有地图实例。
 * 关键点：useEffect 内异步创建，cleanup 中销毁；disposed 标志防止卸载后 setState / 写 ref。
 */
import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

function Demo({ token }: { token: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("等待挂载（useEffect 中创建地图）");

  useEffect(() => {
    if (!token) return; // 无 token 时渲染占位面板，不初始化地图
    let disposed = false;
    setStatus("SDK 加载中，创建 minemap.Map…");
    createMinemapMap(hostRef.current!, token)
      .then((map) => {
        if (disposed) {
          map.remove(); // 组件已卸载，直接释放
          return;
        }
        const center = map.getCenter();
        setStatus(
          `地图已就绪 zoom=${map.getZoom()} center=[${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}]`,
        );
      })
      .catch((error: unknown) => {
        if (!disposed)
          setStatus(`初始化失败：${error instanceof Error ? error.message : String(error)}`);
      });
    return () => {
      disposed = true;
      // 真实项目中地图实例经 ref 持有并在 cleanup 中 remove()；
      // 本示例 createMinemapMap 内部持有实例，这里通过重渲染容器兜底释放。
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, [token]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
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
    const clean = renderNoTokenPanel(container, "地图初始化");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const root = createRoot(container);
  root.render(<Demo token={options.token} />);
  return () => root.unmount();
}
