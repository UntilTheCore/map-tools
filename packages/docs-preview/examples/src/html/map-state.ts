/**
 * 地图状态：原生 HTML（UMD 全局 FE_utils）监听 moveend/zoomend 读取状态，
 * 并演示 panTo/easeTo/setZoom。
 * 关键点：事件回调里同步读 getZoom/getCenter；容器释放时先 off 再销毁地图。
 */
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

const DEMO_CENTER: [number, number] = [106.62, 29.48];

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图状态");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;inset:0;";
  container.appendChild(host);
  const bar = document.createElement("div");
  bar.style.cssText =
    "position:absolute;top:12px;left:12px;z-index:30;display:flex;gap:8px;flex-wrap:wrap;";
  container.appendChild(bar);
  const status = document.createElement("div");
  status.className = "demo-status";
  status.style.cssText = "position:absolute;left:12px;bottom:12px;z-index:30;";
  status.textContent = "初始化中";
  container.appendChild(status);

  let map: minemap.Map | null = null;
  let disposed = false;

  const readState = () => {
    if (!map) return;
    const center = map.getCenter();
    status.textContent = `zoom=${map.getZoom().toFixed(2)} center=[${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}]`;
  };
  const onMoveEnd = () => readState();
  const onZoomEnd = () => readState();

  createMinemapMap(host, options.token)
    .then((created) => {
      if (disposed) {
        created.remove();
        return;
      }
      map = created;
      created.on("moveend", onMoveEnd);
      created.on("zoomend", onZoomEnd);
      readState();
    })
    .catch((error: unknown) => {
      if (!disposed) {
        status.textContent = `初始化失败：${error instanceof Error ? error.message : String(error)}`;
      }
    });

  const guard = (): minemap.Map | null => {
    if (!map) {
      status.textContent = "地图尚未就绪";
      return null;
    }
    return map;
  };

  const addButton = (label: string, onClick: () => void) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "demo-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    bar.appendChild(btn);
  };
  addButton("panTo 平移", () => {
    const target = guard();
    if (target) FE_utils.panTo(target, DEMO_CENTER);
  });
  addButton("easeTo 缓动", () => {
    const target = guard();
    if (target) FE_utils.easeTo(target, { center: DEMO_CENTER, zoom: 13, duration: 800 });
  });
  addButton("setZoom 12", () => {
    const target = guard();
    if (target) FE_utils.setZoom(target, 12);
  });

  return () => {
    disposed = true;
    map?.off("moveend", onMoveEnd);
    map?.off("zoomend", onZoomEnd);
    map?.remove();
    container.innerHTML = "";
  };
}
