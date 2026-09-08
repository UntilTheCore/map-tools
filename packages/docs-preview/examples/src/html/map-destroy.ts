/**
 * 地图销毁：原生 HTML（UMD 全局 FE_utils）调用 destroyMap 销毁并重建。
 * 关键点：destroyMap(map) + 清空容器；requestId 防止"销毁后旧异步创建"覆盖新地图。
 */
import { createMinemapMap } from "../shared/loadMinemap";
import { renderNoTokenPanel, styleHost, type RenderOptions } from "../shared/demo";

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图销毁");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;inset:0;";
  container.appendChild(host);
  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute;top:12px;left:12px;z-index:30;display:flex;gap:8px;";
  container.appendChild(bar);
  const status = document.createElement("div");
  status.className = "demo-status";
  status.style.cssText = "position:absolute;left:12px;bottom:12px;z-index:30;";
  status.textContent = "初始化中";
  container.appendChild(status);

  let map: minemap.Map | null = null;
  let disposed = false;
  let requestId = 0;

  const create = () => {
    const currentRequest = ++requestId;
    status.textContent = "地图创建中…";
    createMinemapMap(host, options.token as string)
      .then((nextMap) => {
        if (disposed || currentRequest !== requestId) {
          nextMap.remove(); // 迟到的创建结果：直接释放
          return;
        }
        map = nextMap;
        status.textContent = "地图已创建（点击「销毁地图」释放实例）";
      })
      .catch((error: unknown) => {
        if (!disposed) {
          status.textContent = `创建失败：${error instanceof Error ? error.message : String(error)}`;
        }
      });
  };

  const destroy = () => {
    if (!map) {
      status.textContent = "当前没有地图实例";
      return;
    }
    FE_utils.destroyMap(map);
    map = null;
    host.replaceChildren();
    status.textContent = "destroyMap 已执行，实例已释放";
  };

  const addButton = (label: string, onClick: () => void) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "demo-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    bar.appendChild(btn);
  };
  addButton("销毁地图", destroy);
  addButton("重新创建", create);
  create();

  return () => {
    disposed = true;
    if (map) FE_utils.destroyMap(map);
    container.innerHTML = "";
  };
}
