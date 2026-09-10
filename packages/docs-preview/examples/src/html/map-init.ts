/**
 * 地图初始化：原生 HTML（UMD 全局 FE_utils）脚本创建地图。
 * 关键点：地图实例由局部变量持有，容器被移除时同步 remove() 释放。
 */
import { createMinemapMapHandle } from "../shared/loadMinemap";
import { styleHost, type ExampleRenderResult, type RenderOptions } from "../shared/demo";

export default function render(
  container: HTMLElement,
  options: RenderOptions,
): ExampleRenderResult {
  styleHost(container);
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;inset:0;";
  container.appendChild(host);
  const status = document.createElement("div");
  status.className = "demo-status";
  status.style.cssText = "position:absolute;left:12px;bottom:12px;z-index:30;";
  status.textContent = "SDK 加载中，创建 minemap.Map…";
  container.appendChild(status);

  const handle = createMinemapMapHandle(host, options.key);
  handle.ready
    .then((created) => {
      const center = created.getCenter();
      status.textContent = `地图已就绪 zoom=${created.getZoom()} center=[${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}]`;
    })
    .catch((error: unknown) => {
      status.textContent = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
    });

  return {
    ready: handle.ready.then(() => undefined),
    dispose: () => {
      handle.dispose();
      container.innerHTML = "";
    },
  };
}
