/**
 * 地图初始化：原生 HTML（UMD 全局 FE_utils）脚本创建地图。
 * 关键点：地图实例由局部变量持有，容器被移除时同步 remove() 释放。
 */
import { createMinemapMap } from "../shared/loadMinemap";
import { styleHost, type RenderOptions } from "../shared/demo";

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;inset:0;";
  container.appendChild(host);
  const status = document.createElement("div");
  status.className = "demo-status";
  status.style.cssText = "position:absolute;left:12px;bottom:12px;z-index:30;";
  status.textContent = "SDK 加载中，创建 minemap.Map…";
  container.appendChild(status);

  let map: minemap.Map | null = null;
  let disposed = false;

  createMinemapMap(host, options.key)
    .then((created) => {
      if (disposed) {
        created.remove(); // 容器已释放，直接销毁
        return;
      }
      map = created;
      const center = created.getCenter();
      status.textContent = `地图已就绪 zoom=${created.getZoom()} center=[${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}]`;
    })
    .catch((error: unknown) => {
      if (!disposed) {
        status.textContent = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
      }
    });

  return () => {
    disposed = true;
    map?.remove();
    container.innerHTML = "";
  };
}
