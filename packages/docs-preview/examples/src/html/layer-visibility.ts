/**
 * 示例：图层显隐控制（HTML · FE_utils UMD 变体）
 * 核心 API：FE_utils.setSourceData / setMultipleLayerSourceData /
 *           showLayer / hideLayer / showLayers / hideLayers / toggleLayer /
 *           setSourceIdName / setLayerIdName
 */
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

  const sourceIdA = FE_utils.setSourceIdName("demo", "districtA");
  const layerIdA = FE_utils.setLayerIdName("demo", "districtA");
  const sourceIdB = FE_utils.setSourceIdName("demo", "districtB");
  const layerIdB = FE_utils.setLayerIdName("demo", "districtB");
  const sourceIdPoints = FE_utils.setSourceIdName("demo", "points");
  const layerIdPoints = FE_utils.setLayerIdName("demo", "points");

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      FE_utils.setSourceData(
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
      FE_utils.setMultipleLayerSourceData(
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
      FE_utils.setSourceData(
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
      status.info(`已添加 3 个图层：${layerIdA} / ${layerIdB} / ${layerIdPoints}`);
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  const withMap = (fn: (m: minemap.Map) => void, msg: string) => () => {
    if (!map) {
      status.error("地图尚未初始化完成");
      return;
    }
    fn(map);
    status.info(msg);
  };

  addButton(
    bar,
    "隐藏 " + layerIdA,
    withMap((m) => FE_utils.hideLayer(m, layerIdA), `hideLayer("${layerIdA}") 已执行`)
  );
  addButton(
    bar,
    "显示 " + layerIdA,
    withMap((m) => FE_utils.showLayer(m, layerIdA), `showLayer("${layerIdA}") 已执行`)
  );
  addButton(
    bar,
    "隐藏全部",
    withMap(
      (m) => FE_utils.hideLayers(m, [layerIdA, layerIdB, layerIdPoints]),
      "hideLayers([…]) 已隐藏全部 3 个图层"
    )
  );
  addButton(
    bar,
    "显示全部",
    withMap(
      (m) => FE_utils.showLayers(m, [layerIdA, layerIdB, layerIdPoints]),
      "showLayers([…]) 已显示全部 3 个图层"
    )
  );
  addButton(
    bar,
    "切换 " + layerIdB,
    withMap(
      (m) => FE_utils.toggleLayer({ map: m, layerId: layerIdB }),
      `toggleLayer({ layerId: "${layerIdB}" }) 已执行（非受控模式）`
    )
  );

  return () => {
    disposed = true;
    container.innerHTML = "";
  };
}
