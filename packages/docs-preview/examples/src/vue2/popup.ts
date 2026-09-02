import Vue from "vue2";
import { createPopupDom } from "@ym/map-tools/vue2";
import {
  createLayerId,
  createSourceId,
  ensureLayers,
  removeOverlays,
  upsertGeoJSONSource,
} from "@ym/map-tools";
import {
  addButton,
  createControlBar,
  createMapHost,
  createStatusBar,
  renderNoTokenPanel,
  styleHost,
  type RenderOptions,
} from "../shared/demo";
import { markerPoints } from "../shared/data";
import { createMinemapMap } from "../shared/loadMinemap";
import { errorMessage } from "../shared/v3";

const PopupContent = Vue.extend({
  props: {
    lngLat: { type: Object, required: true },
  },
  render(h) {
    const lngLat = this.lngLat as { lng: number; lat: number };
    return h("div", {
      style: {
        padding: "8px 12px",
        minWidth: "180px",
        background: "#0d1a15",
        border: "1px solid rgba(77,224,139,.5)",
        borderRadius: "8px",
        color: "#eafff5",
        fontSize: "12px",
      },
    }, [
      h("strong", { style: { color: "#4de08b" } }, "Vue 2 Popup"),
      h("div", { style: { marginTop: "4px" } }, `经度: ${lngLat.lng.toFixed(4)}`),
      h("div", { style: { marginTop: "2px" } }, `纬度: ${lngLat.lat.toFixed(4)}`),
    ]);
  },
});

export default function render(
  container: HTMLElement,
  options: RenderOptions,
): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "Popup 弹窗");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const status = createStatusBar(container);
  const sourceId = createSourceId("demo", "popupPoints");
  const layerId = createLayerId("demo", "popupPoints");
  const popups: minemap.Popup[] = [];
  const handles: Array<ReturnType<typeof createPopupDom>> = [];
  let map: minemap.Map | null = null;
  let disposed = false;

  createMinemapMap(host, options.token, {}, (currentMap) => {
    currentMap.on("click", (event) => {
      const handle = createPopupDom(PopupContent, { lngLat: event.lngLat });
      const popup = new minemap.Popup({ closeOnClick: false, closeButton: true })
        .setLngLat([event.lngLat.lng, event.lngLat.lat])
        .setDOMContent(handle.element)
        .addTo(currentMap);
      handles.push(handle);
      popups.push(popup);
      status.info(`已创建 ${popups.length} 个 Popup`);
    });
  })
    .then((currentMap) => {
      if (disposed) {
        currentMap.remove();
        return;
      }
      map = currentMap;
      upsertGeoJSONSource(currentMap, { id: sourceId, data: markerPoints });
      ensureLayers(currentMap, [{
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
      }]);
      status.info("点击地图创建 Vue 2 Popup");
    })
    .catch((error: unknown) => {
      if (!disposed) status.error(errorMessage(error));
    });

  addButton(bar, "清理 Popup", () => {
    const count = removeOverlays(popups);
    popups.length = 0;
    handles.splice(0).forEach((handle) => handle.dispose());
    status.info(`已清理 ${count} 个 Popup`);
  });

  return () => {
    disposed = true;
    removeOverlays(popups);
    handles.splice(0).forEach((handle) => handle.dispose());
    map?.remove();
    container.innerHTML = "";
  };
}
