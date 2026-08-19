/**
 * 示例：PBF 图层与要素读取（HTML · FE_utils UMD 变体）
 * 核心 API：FE_utils.setPbfSourceData / checkSourceLoaded /
 *           getPbfFeatureListSync / getPbfFeatureListAsync / setPbfLayerViewport
 */
import {
  styleHost,
  createMapHost,
  createControlBar,
  addButton,
  createStatusBar,
  createLogPanel,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "PBF 图层与要素读取");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const status = createStatusBar(container);
  const log = createLogPanel(container, "要素读取日志");

  let map: minemap.Map | null = null;
  let disposed = false;

  const sourceId = FE_utils.setSourceIdName("demo", "pbfLanduse");
  const layerId = FE_utils.setLayerIdName("demo", "pbfLanduse");
  const tiles = [
    `https://sd-data.minedata.cn/data/Landuse/{z}/{x}/{y}?token=${token}&solu=11003`,
  ];

  const addPbf = () => {
    if (!map) {
      status.error("地图尚未初始化完成");
      return;
    }
    log.log(`setPbfSourceData(map, "${sourceId}", layer, tiles) → 添加 vector 源`);
    FE_utils.setPbfSourceData(map, sourceId, {
      id: layerId,
      type: "fill",
      source: sourceId,
      "source-layer": "Landuse",
      paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.35 },
    } as any, tiles);
    status.info(`PBF 图层 ${layerId} 已提交（等待数据源加载）`);
  };

  const readSync = () => {
    if (!map) return;
    const features = FE_utils.getPbfFeatureListSync(map, layerId);
    log.log(
      `getPbfFeatureListSync → ${features.length} 个要素` +
        (features.length
          ? `（首要素: ${JSON.stringify((features[0] as any)?.properties ?? {})}）`
          : "（当前视口无数据，可缩放或等待加载）")
    );
  };

  const readAsync = () => {
    if (!map) return;
    log.log(`checkSourceLoaded({ sourceId: "${sourceId}" }) 轮询中…`);
    FE_utils.checkSourceLoaded({ map, sourceId, limit: 15 })
      .then((loaded) => {
        if (!loaded) {
          log.log("数据源加载超时（token 可能无 Landuse 数据权限）");
          status.info("checkSourceLoaded 超时：请确认 token 具备对应数据权限");
          return;
        }
        log.log("数据源已加载，getPbfFeatureListAsync 读取要素…");
        return FE_utils
          .getPbfFeatureListAsync(map!, layerId, sourceId, { limit: 15 })
          .then((features) => {
            log.log(`getPbfFeatureListAsync → ${features.length} 个要素`);
            status.info(`PBF 要素读取完成：${features.length} 个`);
          });
      })
      .catch((err) => {
        log.log("读取失败：" + String(err?.message ?? err));
        status.error(String(err?.message ?? err));
      });
  };

  const fitViewport = () => {
    if (!map) return;
    log.log("setPbfLayerViewport → 自动缩放以抓取 PBF 数据");
    FE_utils.setPbfLayerViewport({ map, layerId, sourceId, limit: 15, zoom: 11 });
    status.info("setPbfLayerViewport 已执行（缩放至 zoom 11 后按覆盖物适配视野）");
  };

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      log.log("地图已初始化");
      addPbf();
    })
    .catch((err) => {
      if (!disposed) status.error(String(err?.message ?? err));
    });

  addButton(bar, "添加 PBF 图层", addPbf);
  addButton(bar, "同步读取要素", readSync);
  addButton(bar, "异步读取要素", readAsync);
  addButton(bar, "PBF 视野适配", fitViewport);
  addButton(bar, "清空日志", () => log.clear());

  return () => {
    disposed = true;
    container.innerHTML = "";
  };
}
