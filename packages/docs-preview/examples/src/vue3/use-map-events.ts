import { createApp, defineComponent, h, onMounted } from "vue";
import { useMap } from "@ym/map-tools/vue3";
import {
  createLayerId,
  createSourceId,
  ensureLayers,
  upsertGeoJSONSource,
} from "@ym/map-tools";
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

export default function render(
  container: HTMLElement,
  options: RenderOptions,
): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "useMap 事件监听");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const log = createLogPanel(container, "useMap 事件日志");
  const sourceId = createSourceId("demo", "eventPolygon");
  const layerId = createLayerId("demo", "eventPolygon");
  let disposed = false;

  const App = defineComponent({
    setup() {
      const { mapRef, setMap, on, unbindAll } = useMap({
        layers: {
          click: [layerId],
          mousemove: [layerId],
          zoomend: [layerId],
        },
        zoomQueryBy: "mouse",
        mapLifecycle: "owned",
      });

      on("loaded", ({ map }) => {
        upsertGeoJSONSource(map, { id: sourceId, data: districtA });
        ensureLayers(map, [{
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: { "fill-color": "#4de08b", "fill-opacity": 0.3 },
        }]);
        log.log(`loaded: 已添加 ${layerId}`);
      });
      on("click:layer", ({ features, layerIds }) => {
        log.log(`click:layer ${layerIds.join(", ")} ${featureName(features[0])}`);
      });
      on("click:empty", ({ mouseCoordinate }) => {
        log.log(`click:empty ${mouseCoordinate?.map((value) => value.toFixed(4)).join(", ") ?? "-"}`);
      });
      on("mousemove:layer", ({ features }) => {
        log.log(`mousemove:layer ${featureName(features[0])}`);
      });
      on("mousemove:empty", () => log.log("mousemove:empty"));
      on("zoomend:layer", ({ features, mapCenterCoordinate }) => {
        log.log(`zoomend:layer ${featureName(features[0])} center=${mapCenterCoordinate?.join(",") ?? "-"}`);
      });
      on("zoomend:empty", () => log.log("zoomend:empty"));

      onMounted(() => {
        createMinemapMap(host, options.token!, {}, setMap)
          .then(() => {
            if (disposed) return;
            log.log("setMap: 地图已交给 useMap 管理");
          })
          .catch((error: unknown) => {
            if (!disposed) log.log(`初始化失败: ${errorMessage(error)}`);
          });
      });

      addButton(bar, "解绑所有监听", () => {
        unbindAll();
        log.log("unbindAll: 本 Hook 注册的监听已解绑");
      });
      addButton(bar, "查看 mapRef", () => {
        log.log(`mapRef.value: ${mapRef.value ? "已绑定" : "null"}`);
      });
      addButton(bar, "清空日志", () => log.clear());

      return () => h("div", { style: { display: "none" } });
    },
  });

  const carrier = document.createElement("div");
  container.appendChild(carrier);
  const app = createApp(App);
  app.mount(carrier);

  return () => {
    disposed = true;
    app.unmount();
    container.innerHTML = "";
  };
}
