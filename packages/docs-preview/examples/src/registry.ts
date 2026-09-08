/**
 * 示例注册表：id -> 元信息。
 * 四个框架的实现在 src/{vue3,vue2,react,html}/{id}.{ts,tsx}，
 * 统一导出 render(container, options) => 清理函数。
 */
export interface ExampleMeta {
  title: string;
  description: string;
  /** 涉及的 API 关键词，用于列表展示 */
  apis: string[];
}

export const registry: Record<string, ExampleMeta> = {
  "map-init": {
    title: "地图初始化",
    description:
      "加载 minemap SDK 并创建地图实例，展示各框架持有地图实例的生命周期写法（Vue onMounted / React useEffect / 原生脚本）。",
    apis: ["createMinemapMap", "onMounted", "useEffect"],
  },
  "map-destroy": {
    title: "地图销毁",
    description: "调用 destroyMap 销毁地图实例并释放容器，支持反复销毁与重新创建，含创建竞态防护。",
    apis: ["destroyMap"],
  },
  "map-state": {
    title: "地图状态",
    description:
      "监听 moveend / zoomend 实时读取 getZoom / getCenter，并演示 panTo / easeTo / setZoom 状态控制。",
    apis: ["getZoom", "getCenter", "panTo", "easeTo", "setZoom"],
  },
  init: {
    title: "底图初始化与销毁",
    description: "使用 minemap SDK 创建地图实例，演示 destroyMap 销毁与重新初始化。",
    apis: ["destroyMap"],
  },
  "layer-visibility": {
    title: "图层显隐控制",
    description:
      "通过 upsertGeoJSONSource + ensureLayers 管理 GeoJSON 图层，并使用 setLayerVisibility / setLayersVisibility 控制显隐。",
    apis: [
      "upsertGeoJSONSource",
      "ensureLayers",
      "setLayerVisibility",
      "setLayersVisibility",
      "getLayerVisibility",
    ],
  },
  "pbf-layer": {
    title: "PBF 图层与要素读取",
    description:
      "通过 replaceVectorSource 更新矢量瓦片源，配合 waitForSourceLoaded / queryRenderedFeatures / fitToRenderedLayer 读取与适配要素。",
    apis: [
      "replaceVectorSource",
      "waitForSourceLoaded",
      "queryRenderedFeatures",
      "fitToRenderedLayer",
    ],
  },
  "viewport-zoom": {
    title: "视野与缩放控制",
    description:
      "演示 easeTo / panTo / setZoom，以及 fitToFeatures / fitToGeometry 的显式视野控制。",
    apis: ["easeTo", "panTo", "setZoom", "fitToFeatures", "fitToGeometry"],
  },
  "marker-clean": {
    title: "Marker 清理管理",
    description: "批量创建 Marker 与 Popup，演示 removeOverlays 的统一生命周期清理。",
    apis: ["removeOverlays"],
  },
  popup: {
    title: "Popup 弹窗",
    description: "使用 createPopupDom 创建可释放的弹窗内容句柄，结合 minemap.Popup 展示并清理。",
    apis: ["createPopupDom", "PopupDomHandle"],
  },
  "use-map-events": {
    title: "useMap 事件监听",
    description:
      "通过 useMap 的 setMap / on / off / unbindAll 监听图层点击、移动与缩放事件；HTML 版使用原生事件。",
    apis: ["useMap", "setMap", "on", "off", "unbindAll"],
  },
  "geo-tools": {
    title: "坐标与几何工具",
    description:
      "纯几何计算工具集：坐标校验、方位角、要素类型过滤、端点与顶点提取，以及资源 id 生成。",
    apis: [
      "getBearing",
      "getRotation",
      "getRotationByCoordinate",
      "assertCoordinate",
      "getCoordinatesFromPoints",
      "getLineEndpoints",
      "getPolygonVertices",
      "filterFeaturesByGeometryType",
      "createSourceId",
      "createLayerId",
    ],
  },
};

/** 示例展示顺序 */
export const exampleOrder: string[] = [
  "init",
  "layer-visibility",
  "pbf-layer",
  "viewport-zoom",
  "marker-clean",
  "popup",
  "use-map-events",
  "geo-tools",
];

export const DEFAULT_EXAMPLE = "init";

export function getExampleMeta(id: string): ExampleMeta {
  return registry[id] ?? registry[DEFAULT_EXAMPLE];
}
