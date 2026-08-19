/**
 * 示例注册表：id -> 元信息。
 * 四个框架的实现在 src/{vue3,vue2,react,html}/{id}.{ts,tsx}，
 * 统一导出 render(container, options) => 清理函数。
 */
export type ExampleMeta = {
  title: string;
  description: string;
  /** 涉及的 API 关键词，用于列表展示 */
  apis: string[];
};

export const registry: Record<string, ExampleMeta> = {
  init: {
    title: "底图初始化与销毁",
    description:
      "使用 minemap SDK 创建地图实例，演示 destroyMap 销毁地图与重新初始化。",
    apis: ["destroyMap"],
  },
  "layer-visibility": {
    title: "图层显隐控制",
    description:
      "通过 setSourceData 添加 GeoJSON 图层，使用 showLayer / hideLayer / showLayers / hideLayers / toggleLayer 控制显隐。",
    apis: [
      "setSourceData",
      "setMultipleLayerSourceData",
      "showLayer",
      "hideLayer",
      "showLayers",
      "hideLayers",
      "toggleLayer",
    ],
  },
  "pbf-layer": {
    title: "PBF 图层与要素读取",
    description:
      "使用 setPbfSourceData 添加矢量瓦片图层，配合 checkSourceLoaded / getPbfFeatureListSync / getPbfFeatureListAsync / setPbfLayerViewport 读取要素。",
    apis: [
      "setPbfSourceData",
      "checkSourceLoaded",
      "getPbfFeatureListSync",
      "getPbfFeatureListAsync",
      "setPbfLayerViewport",
    ],
  },
  "viewport-zoom": {
    title: "视野与缩放控制",
    description:
      "演示 moveAndZoom / moveMap / setZoom 平移缩放，以及 setViewPort / setViewPortByPolygon 根据覆盖物自适应视野。",
    apis: [
      "moveAndZoom",
      "moveMap",
      "setZoom",
      "setViewPort",
      "setViewPortByPolygon",
    ],
  },
  "marker-clean": {
    title: "Marker 清理管理",
    description:
      "批量创建 Marker 与 Popup，演示 removeMarkers / removeMarkersOrPopups 的批量清理能力。",
    apis: ["removeMarkers", "removeMarkersOrPopups"],
  },
  popup: {
    title: "Popup 弹窗",
    description:
      "使用 getPopupDom 创建弹窗内容容器（框架版支持组件挂载），结合 minemap.Popup 在地图上展示。",
    apis: ["getPopupDom"],
  },
  "use-map-events": {
    title: "useMap 事件监听",
    description:
      "通过 useMap 绑定图层点击 / 鼠标移动 / 缩放事件分发器，获取图层要素数据（HTML 版使用原生事件演示）。",
    apis: [
      "useMap",
      "mapInitialize",
      "onClickLayerEventDispatcher",
      "onClickNoInLayers",
      "onMouseMoveLayerEventDispatcher",
      "onMoveNoInLayers",
      "onZoomLayerEventDispatcher",
      "onZoomNoInLayers",
      "unBindMapEvent",
    ],
  },
  "geo-tools": {
    title: "坐标与几何工具",
    description:
      "纯几何计算工具集：方位角、多边形交点、坐标校验、要素类型过滤、顶点提取、source/layer id 命名。",
    apis: [
      "getBearing",
      "getRotation",
      "getRotationByCoordinate",
      "getCenterBetweenRightPointIntersection",
      "checkCoordinate",
      "pointListToCoordList",
      "getLineStringEndpoint",
      "getPolygonVertex",
      "getFeatureTypeList",
      "FeatureTypeEnum",
      "setSourceIdName",
      "setLayerIdName",
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
