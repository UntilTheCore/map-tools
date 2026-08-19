/**
 * 示例：Marker 清理管理（Vue 3 变体）
 * 核心 API：removeMarkers / removeMarkersOrPopups
 */
import { createApp, h } from "vue";
import { removeMarkers, removeMarkersOrPopups } from "@ym/map-tools";
import {
  styleHost,
  createMapHost,
  createControlBar,
  addButton,
  createStatusBar,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
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

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "Marker 清理管理");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const status = createStatusBar(container);

  let map: minemap.Map | null = null;
  let disposed = false;
  const markers: minemap.Marker[] = [];
  const mixed: (minemap.Marker | minemap.Popup)[] = [];

  function addMarkers() {
    if (!map) {
      status.error("地图尚未初始化完成");
      return;
    }
    const m = map;
    const colors = ["#4de08b", "#4dc3e0", "#ff9d4d", "#ff6b8a", "#c99df0"];
    (markerPoints.features as any[]).forEach((f, i) => {
      const marker = new minemap.Marker(
        makeMarkerEl(f.properties.name, colors[i % colors.length]),
        { offset: [0, -8] }
      );
      marker.setLngLat(f.geometry.coordinates);
      marker.addTo(m);
      markers.push(marker);
    });
    status.info(`已创建 ${markers.length} 个 Marker（removeMarkers 可批量清理）`);
  }

  function cleanMarkers() {
    removeMarkers(markers);
    markers.length = 0;
    status.info("removeMarkers(markers) 已执行：全部 Marker 已移除");
  }

  function addMixed() {
    if (!map) {
      status.error("地图尚未初始化完成");
      return;
    }
    const m = map;
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

    mixed.push(marker, popup);
    status.info(
      "已添加 1 个 Marker + 1 个 Popup（removeMarkersOrPopups 可统一清理）"
    );
  }

  function getPopupContentEl(text: string): HTMLElement {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText =
      "padding:6px 10px;font-size:12px;color:#04120c;background:#fff;border-radius:6px;";
    return el;
  }

  function cleanMixed() {
    removeMarkersOrPopups(mixed);
    mixed.length = 0;
    status.info("removeMarkersOrPopups(mixed) 已执行：Marker + Popup 全部移除");
  }

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      addMarkers();
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  addButton(bar, "添加 Markers", addMarkers);
  addButton(bar, "removeMarkers 清理", cleanMarkers);
  addButton(bar, "添加 Marker + Popup", addMixed);
  addButton(bar, "removeMarkersOrPopups 清理", cleanMixed);

  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = createApp({ render: () => h("div") });
  app.mount(carrier);

  return () => {
    disposed = true;
    if (map) {
      removeMarkersOrPopups([...markers, ...mixed]);
    }
    app.unmount();
    container.innerHTML = "";
  };
}
