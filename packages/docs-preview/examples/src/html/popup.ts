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

export default function render(container: HTMLElement, options: RenderOptions): () => void {
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
  const sourceId = FE_utils.createSourceId("demo", "popupPoints");
  const layerId = FE_utils.createLayerId("demo", "popupPoints");
  const popups: minemap.Popup[] = [];
  const handles: ReturnType<typeof FE_utils.createPopupDom>[] = [];
  let map: minemap.Map | null = null;
  let disposed = false;

  createMinemapMap(host, options.token, {}, (currentMap) => {
    currentMap.on("click", (event) => {
      const handle = FE_utils.createPopupDom({
        kind: "text",
        value: `HTML Popup\n经度: ${event.lngLat.lng.toFixed(4)}\n纬度: ${event.lngLat.lat.toFixed(4)}`,
      });
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
      FE_utils.upsertGeoJSONSource(currentMap, { id: sourceId, data: markerPoints });
      FE_utils.ensureLayers(currentMap, [
        {
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
        },
      ]);
      status.info("点击地图创建 DOM Popup");
    })
    .catch((error: unknown) => {
      if (!disposed) status.error(errorMessage(error));
    });

  addButton(bar, "清理 Popup", () => {
    const count = FE_utils.removeOverlays(popups);
    popups.length = 0;
    handles.splice(0).forEach((handle) => handle.dispose());
    status.info(`已清理 ${count} 个 Popup`);
  });

  return () => {
    disposed = true;
    FE_utils.removeOverlays(popups);
    handles.splice(0).forEach((handle) => handle.dispose());
    map?.remove();
    container.innerHTML = "";
  };
}
