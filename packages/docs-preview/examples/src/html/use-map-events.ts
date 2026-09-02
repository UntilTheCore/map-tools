import {
  addButton,
  createControlBar,
  createLogPanel,
  createMapHost,
  renderNoTokenPanel,
  styleHost,
  type RenderOptions,
} from "../shared/demo";
import { districtA } from "../shared/data";
import { createMinemapMap } from "../shared/loadMinemap";
import { errorMessage, featureName } from "../shared/v3";

export default function render(container: HTMLElement, options: RenderOptions): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "地图事件监听");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const log = createLogPanel(container, "原生地图事件日志");
  const sourceId = FE_utils.createSourceId("demo", "eventPolygon");
  const layerId = FE_utils.createLayerId("demo", "eventPolygon");
  let map: minemap.Map | null = null;
  let lastPoint: minemap.PointLike | undefined;
  let disposed = false;

  const onClick = (event: minemap.MapEventMap["click"]) => {
    if (!map) return;
    const features = FE_utils.queryRenderedFeatures(map, { point: event.point, layers: [layerId] });
    if (features.length > 0) log.log(`click:layer ${featureName(features[0])}`);
    else log.log(`click:empty ${event.lngLat.lng.toFixed(4)}, ${event.lngLat.lat.toFixed(4)}`);
  };
  const onMouseMove = (event: minemap.MapEventMap["mousemove"]) => {
    if (!map) return;
    lastPoint = event.point;
    const features = FE_utils.queryRenderedFeatures(map, { point: event.point, layers: [layerId] });
    log.log(
      features.length > 0 ? `mousemove:layer ${featureName(features[0])}` : "mousemove:empty",
    );
  };
  const onZoomEnd = () => {
    if (!map || !lastPoint) return;
    const features = FE_utils.queryRenderedFeatures(map, { point: lastPoint, layers: [layerId] });
    log.log(features.length > 0 ? `zoomend:layer ${featureName(features[0])}` : "zoomend:empty");
  };
  const bind = (currentMap: minemap.Map) => {
    currentMap.on("click", onClick);
    currentMap.on("mousemove", onMouseMove);
    currentMap.on("zoomend", onZoomEnd);
  };
  const unbind = () => {
    if (!map) return;
    map.off("click", onClick);
    map.off("mousemove", onMouseMove);
    map.off("zoomend", onZoomEnd);
    log.log("原生事件已解绑");
  };

  createMinemapMap(host, options.token, {}, bind)
    .then((currentMap) => {
      if (disposed) {
        currentMap.remove();
        return;
      }
      map = currentMap;
      FE_utils.upsertGeoJSONSource(currentMap, { id: sourceId, data: districtA });
      FE_utils.ensureLayers(currentMap, [
        {
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: { "fill-color": "#4de08b", "fill-opacity": 0.3 },
        },
      ]);
      log.log(`loaded: 已添加 ${layerId}`);
    })
    .catch((error: unknown) => log.log(`初始化失败: ${errorMessage(error)}`));

  addButton(bar, "解绑事件", unbind);
  addButton(bar, "清空日志", () => log.clear());
  return () => {
    disposed = true;
    unbind();
    map?.remove();
    container.innerHTML = "";
  };
}
