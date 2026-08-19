/**
 * 示例：图层显隐控制（Vue 2.7 变体）
 * 核心 API：setSourceData / setMultipleLayerSourceData / showLayer / hideLayer /
 *           showLayers / hideLayers / toggleLayer / setSourceIdName / setLayerIdName
 */
import Vue from "vue2";
import {
  setSourceData,
  setMultipleLayerSourceData,
  showLayer,
  hideLayer,
  showLayers,
  hideLayers,
  toggleLayer,
  setSourceIdName,
  setLayerIdName,
} from "@ym/map-tools";
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
import { districtA, districtB, markerPoints } from "../shared/data";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "图层显隐控制");
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

  const prefix = "demo";
  const sourceIdA = setSourceIdName(prefix, "districtA");
  const layerIdA = setLayerIdName(prefix, "districtA");
  const sourceIdB = setSourceIdName(prefix, "districtB");
  const layerIdB = setLayerIdName(prefix, "districtB");
  const sourceIdPoints = setSourceIdName(prefix, "points");
  const layerIdPoints = setLayerIdName(prefix, "points");

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;

      setSourceData(
        m,
        sourceIdA,
        {
          id: layerIdA,
          type: "fill",
          source: sourceIdA,
          paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
        },
        districtA as any
      );

      setMultipleLayerSourceData(
        m,
        sourceIdB,
        [
          {
            id: layerIdB,
            type: "fill",
            source: sourceIdB,
            paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.4 },
          },
        ],
        districtB as any
      );

      setSourceData(
        m,
        sourceIdPoints,
        {
          id: layerIdPoints,
          type: "circle",
          source: sourceIdPoints,
          paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
        },
        markerPoints as any
      );

      status.info(
        `已添加 3 个图层：${layerIdA} / ${layerIdB} / ${layerIdPoints}`
      );
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  const withMap = (fn: (m: minemap.Map) => void) => {
    if (map) fn(map);
    else status.error("地图尚未初始化完成");
  };

  addButton(bar, `隐藏 ${layerIdA}`, () =>
    withMap((m) => {
      hideLayer(m, layerIdA);
      status.info(`hideLayer("${layerIdA}") 已执行`);
    })
  );
  addButton(bar, `显示 ${layerIdA}`, () =>
    withMap((m) => {
      showLayer(m, layerIdA);
      status.info(`showLayer("${layerIdA}") 已执行`);
    })
  );
  addButton(bar, "隐藏全部", () =>
    withMap((m) => {
      hideLayers(m, [layerIdA, layerIdB, layerIdPoints]);
      status.info("hideLayers([…]) 已隐藏全部 3 个图层");
    })
  );
  addButton(bar, "显示全部", () =>
    withMap((m) => {
      showLayers(m, [layerIdA, layerIdB, layerIdPoints]);
      status.info("showLayers([…]) 已显示全部 3 个图层");
    })
  );
  addButton(bar, `切换 ${layerIdB}`, () =>
    withMap((m) => {
      toggleLayer({ map: m, layerId: layerIdB });
      status.info(`toggleLayer({ layerId: "${layerIdB}" }) 已执行（非受控模式）`);
    })
  );

  const carrier = document.createElement("div");
  carrier.style.display = "none";
  container.appendChild(carrier);
  const app = new Vue({ render: (h) => h("div") });
  app.$mount(carrier);

  return () => {
    disposed = true;
    app.$destroy();
    if (app.$el?.parentNode) app.$el.parentNode.removeChild(app.$el);
    container.innerHTML = "";
  };
}
