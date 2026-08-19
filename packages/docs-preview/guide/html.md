# 接入方式 · 原生 HTML（UMD）

无构建工具的传统页面可通过 UMD 产物使用全部核心 API，全局变量名 `FE_utils`。

## 产物位置

- 本地路径：`packages/map-tools/dist/umd/index.umd.js`
- 本文档站示例中心副本：`/demos/vendor/fe-utils.umd.js`（由 `scripts/copy-umd.mjs` 从 map-tools 产物复制）
- 公网 CDN（若包同步至公网 npm）：
  - unpkg：`https://unpkg.com/@ym/map-tools@2.0.1/dist/umd/index.umd.js`
  - jsdelivr：`https://cdn.jsdelivr.net/npm/@ym/map-tools@2.0.1/dist/umd/index.umd.js`
- **私仓环境没有公网 CDN**，请从私仓静态资源地址或本地 `dist/umd/index.umd.js` 自托管该文件。

## 引入

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>map-tools UMD 示例</title>
  <!-- 1. minemap SDK（无 npm 包，CDN 加载） -->
  <link rel="stylesheet" href="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.css" />
  <script src="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js"></script>
  <!-- 2. map-tools UMD：全局 FE_utils -->
  <script src="./vendor/fe-utils.umd.js"></script>
</head>
<body>
  <div id="map" style="width: 100%; height: 600px"></div>
  <script>
    const { setSourceData, setSourceIdName, setLayerIdName, destroyMap } = FE_utils;

    const sourceId = setSourceIdName("demo", "district"); // "demo-district-source"
    const layerId = setLayerIdName("demo", "district");   // "demo-district-layer"

    minemap.domainUrl = "https://minemap.minedata.cn";
    minemap.key = "你的 minemap token";

    const map = new minemap.Map({
      container: "map",
      style: "https://service.minedata.cn/map/solu/style/11003",
      center: [116.4026, 39.9494],
      zoom: 10,
    });

    map.on("load", () => {
      setSourceData(
        map,
        sourceId,
        {
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
        },
        {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "核心区" },
              geometry: {
                type: "Polygon",
                coordinates: [[[116.35, 39.88], [116.42, 39.88], [116.42, 39.93], [116.35, 39.93], [116.35, 39.88]]],
              },
            },
          ],
        }
      );
    });

    // 销毁地图
    // destroyMap(map);
  </script>
</body>
</html>
```

## 全局可用 API

UMD 暴露核心入口的全部导出，例如：

```js
const {
  destroyMap, clearAllSourceAndLayer,
  setSourceData, setMultipleLayerSourceData, setPbfSourceData,
  moveAndZoom, moveMap, setZoom,
  removeMarkers, removeMarkersOrPopups,
  getBearing, getRotation, getRotationByCoordinate,
  getCenterBetweenRightPointIntersection, checkCoordinate,
  setViewPortByPolygon, setViewPort, setPbfLayerViewport,
  getFeatureTypeList, FeatureTypeEnum,
  setSourceIdName, setLayerIdName,
  showLayer, hideLayer, hideLayers, showLayers, toggleLayer,
  getPbfFeatureListSync, getPbfFeatureListAsync, checkSourceLoaded,
  pointListToCoordList, getLineStringEndpoint, getPolygonVertex,
  getPopupDom,
} = FE_utils;
```

## 说明

- UMD 只包含核心 API（`@ym/map-tools` 根入口），**不含** `useMap`（框架 Hook，仅 `vue2` / `vue3` / `react` 子路径提供）。
- HTML 场景需要事件监听时，使用 minemap 原生事件（`map.on("click", ...)` + `queryRenderedFeatures`），示例中心「useMap 事件监听」示例的 HTML 变体即为此模式。
- 无 token 时示例中心会自动渲染占位面板，不会抛出未捕获异常。

更多完整示例见 [示例中心](/examples-center/)（原生 HTML 变体）。
