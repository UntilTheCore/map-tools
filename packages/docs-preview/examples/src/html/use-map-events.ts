/**
 * 示例：useMap 事件监听（HTML · FE_utils UMD 变体）
 *
 * HTML 变体无框架 hook 可用（useMap 仅存在于 @ym/map-tools/vue2|vue3|react），
 * 这里使用 minemap 原生事件 + queryRenderedFeatures 复刻 useMap 的
 * 事件分发行为（点击图层 / 点击空白 / 悬停图层 / 悬停空白 / 缩放命中图层），
 * 并调用 FE_utils.setSourceData 等核心 API 绘制演示图层。
 */
import {
  styleHost,
  createMapHost,
  createLogPanel,
  createControlBar,
  addButton,
  renderNoTokenPanel,
  type RenderOptions,
} from "../shared/demo";
import { createMinemapMap } from "../shared/loadMinemap";
import { districtA } from "../shared/data";

export default function render(
  container: HTMLElement,
  options: RenderOptions
): () => void {
  const { token } = options;
  styleHost(container);
  if (!token) {
    const clean = renderNoTokenPanel(container, "useMap 事件监听");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const log = createLogPanel(container, "事件日志（原生实现）");

  const sourceId = FE_utils.setSourceIdName("demo", "eventPolygon");
  const layerId = FE_utils.setLayerIdName("demo", "eventPolygon");

  let map: minemap.Map | null = null;
  let disposed = false;
  let mousePoint: { x: number; y: number } | null = null;
  const handlers: { type: string; fn: (e: any) => void }[] = [];

  /** 注册 minemap 事件并记录（供解绑用，复刻 useMap 的 unBindMapEvent） */
  function bind(mapInstance: minemap.Map) {
    const onClick = (e: any) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: [layerId],
      });
      if (features && features.length > 0) {
        const props = (features[0] as any)?.properties ?? {};
        log.log(`点击图层：layerId=${layerId} name=${props.name ?? "-"}`);
      } else {
        log.log(
          `点击空白：lng=${e?.lngLat?.lng?.toFixed?.(4) ?? "-"} lat=${
            e?.lngLat?.lat?.toFixed?.(4) ?? "-"
          }`
        );
      }
    };
    const onMouseMove = (e: any) => {
      mousePoint = e.point;
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: [layerId],
      });
      if (features && features.length > 0) {
        log.log(`悬停图层：layerId=${layerId}`);
      } else {
        log.log("悬停空白区域");
      }
    };
    const onZoomEnd = () => {
      const zoom = mapInstance.getZoom();
      if (mousePoint) {
        const features = mapInstance.queryRenderedFeatures(mousePoint, {
          layers: [layerId],
        });
        if (features && features.length > 0) {
          log.log(`缩放命中图层：zoom=${zoom} layerId=${layerId}`);
        } else {
          log.log("缩放后鼠标位置无绑定图层");
        }
      }
    };
    mapInstance.on("click", onClick);
    mapInstance.on("mousemove", onMouseMove);
    mapInstance.on("zoomend", onZoomEnd);
    handlers.push(
      { type: "click", fn: onClick },
      { type: "mousemove", fn: onMouseMove },
      { type: "zoomend", fn: onZoomEnd }
    );
  }

  /** 复刻 useMap 的 unBindMapEvent */
  function unbind() {
    if (!map) return;
    handlers.forEach(({ type, fn }) => map!.off(type, fn));
    handlers.length = 0;
    log.log("unBindMapEvent 已执行：点击/移动/缩放监听已解绑");
  }

  createMinemapMap(host, token!)
    .then((m) => {
      if (disposed) {
        m.remove();
        return;
      }
      map = m;
      FE_utils.setSourceData(
        m,
        sourceId,
        {
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: { "fill-color": "#4de08b", "fill-opacity": 0.3 },
        },
        districtA as any
      );
      bind(m);
      log.log(
        `地图已就绪，已绑定图层 ${layerId}（原生事件实现，等价于 useMap 的 bindClickLayers/bindMouseMoveLayers/bindZoomLayers）`
      );
    })
    .catch((err) => {
      log.log("初始化失败：" + String(err?.message ?? err));
    });

  addButton(bar, "解绑事件 unBindMapEvent", unbind);
  addButton(bar, "清空日志", () => log.clear());

  return () => {
    disposed = true;
    unbind();
    container.innerHTML = "";
  };
}
