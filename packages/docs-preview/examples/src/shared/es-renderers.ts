import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import {
  assertCoordinate,
  createLayerId,
  createSourceId,
  destroyMap,
  easeTo,
  ensureLayers,
  filterFeaturesByGeometryType,
  fitToFeatures,
  fitToGeometry,
  getBearing,
  getCoordinatesFromPoints,
  getLineEndpoints,
  getPolygonVertices,
  getRotation,
  getRotationByCoordinate,
  getLayerVisibility,
  panTo,
  queryRenderedFeatures,
  removeOverlays,
  replaceVectorSource,
  setLayerVisibility,
  setLayersVisibility,
  setZoom,
  upsertGeoJSONSource,
  waitForSourceLoaded,
  fitToRenderedLayer,
} from "@ym/map-tools";
import { getPolygonRightIntersection } from "@ym/map-tools/geometry";
import type { MapLayer, MapLike } from "@ym/map-tools";
import {
  addButton,
  createControlBar,
  createLogPanel,
  createMapHost,
  createStatusBar,
  renderNoTokenPanel,
  styleHost,
  type ExampleRender,
} from "./demo";
import { createMinemapMap } from "./loadMinemap";
import { districtA, districtB, geoDemo, markerPoints, routeLine, viewportOverlays } from "./data";
import { asCoordinate, asFeatureCollection, errorMessage, featureName } from "./v3";

function readyMapMessage(status: ReturnType<typeof createStatusBar>): void {
  status.info("地图已初始化");
}

function renderWithMap(
  container: HTMLElement,
  options: { token?: string },
  title: string,
  callback: (map: minemap.Map, status: ReturnType<typeof createStatusBar>) => void,
): () => void {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, title);
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const status = createStatusBar(container);
  let disposed = false;
  let map: minemap.Map | null = null;

  createMinemapMap(host, options.token)
    .then((currentMap) => {
      if (disposed) {
        currentMap.remove();
        return;
      }
      map = currentMap;
      readyMapMessage(status);
      callback(currentMap, status);
    })
    .catch((error: unknown) => {
      if (!disposed) status.error(errorMessage(error));
    });

  return () => {
    disposed = true;
    map?.remove();
    container.innerHTML = "";
  };
}

function featureCollection(features: readonly Feature[]): FeatureCollection {
  return asFeatureCollection(features);
}

export const renderInit: ExampleRender = (container, options) => {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "底图初始化与销毁");
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
  let requestId = 0;

  const initialize = () => {
    const currentRequest = ++requestId;
    if (map) {
      destroyMap(map);
      map = null;
      host.replaceChildren();
    }
    status.info("地图初始化中");
    createMinemapMap(host, options.token!)
      .then((nextMap) => {
        if (disposed || currentRequest !== requestId) {
          nextMap.remove();
          return;
        }
        map = nextMap;
        status.info("地图已初始化");
      })
      .catch((error: unknown) => {
        if (!disposed) status.error(errorMessage(error));
      });
  };

  addButton(bar, "销毁地图", () => {
    if (!map) {
      status.info("当前没有地图实例");
      return;
    }
    destroyMap(map);
    map = null;
    host.replaceChildren();
    status.info("destroyMap 已执行");
  });
  addButton(bar, "重新初始化", initialize);
  initialize();

  return () => {
    disposed = true;
    if (map) destroyMap(map);
    container.innerHTML = "";
  };
};

const districtALayer = (sourceId: string, layerId: string): MapLayer => ({
  id: layerId,
  type: "fill",
  source: sourceId,
  paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
});

const districtBLayer = (sourceId: string, layerId: string): MapLayer => ({
  id: layerId,
  type: "fill",
  source: sourceId,
  paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.4 },
});

const pointLayer = (sourceId: string, layerId: string): MapLayer => ({
  id: layerId,
  type: "circle",
  source: sourceId,
  paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
});

export const renderLayerVisibility: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  const title = "图层显隐控制";
  const clean = renderWithMap(container, options, title, (map, status) => {
    const sourceIdA = createSourceId("demo", "districtA");
    const layerIdA = createLayerId("demo", "districtA");
    const sourceIdB = createSourceId("demo", "districtB");
    const layerIdB = createLayerId("demo", "districtB");
    const sourceIdPoints = createSourceId("demo", "points");
    const layerIdPoints = createLayerId("demo", "points");

    upsertGeoJSONSource(map, { id: sourceIdA, data: districtA });
    ensureLayers(map, [districtALayer(sourceIdA, layerIdA)]);
    upsertGeoJSONSource(map, { id: sourceIdB, data: districtB });
    ensureLayers(map, [districtBLayer(sourceIdB, layerIdB)]);
    upsertGeoJSONSource(map, { id: sourceIdPoints, data: markerPoints });
    ensureLayers(map, [pointLayer(sourceIdPoints, layerIdPoints)]);

    status.info(`已添加 ${layerIdA}、${layerIdB}、${layerIdPoints}`);
    addButton(bar, "隐藏 A", () => setLayerVisibility(map, layerIdA, false));
    addButton(bar, "显示 A", () => setLayerVisibility(map, layerIdA, true));
    addButton(bar, "隐藏全部", () =>
      setLayersVisibility(map, [layerIdA, layerIdB, layerIdPoints], false),
    );
    addButton(bar, "显示全部", () =>
      setLayersVisibility(map, [layerIdA, layerIdB, layerIdPoints], true),
    );
    addButton(bar, "切换 B", () => {
      const next = getLayerVisibility(map, layerIdB) !== "visible";
      setLayerVisibility(map, layerIdB, next);
      status.info(`${layerIdB}: ${next ? "visible" : "none"}`);
    });
  });
  return clean;
};

export const renderPbfLayer: ExampleRender = (container, options) => {
  styleHost(container);
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "PBF 图层与要素读取");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }

  const host = createMapHost(container);
  const bar = createControlBar(container);
  const status = createStatusBar(container);
  const log = createLogPanel(container, "PBF 日志");
  const sourceId = createSourceId("demo", "pbfLanduse");
  const layerId = createLayerId("demo", "pbfLanduse");
  const tiles = [
    `https://sd-data.minedata.cn/data/Landuse/{z}/{x}/{y}?token=${options.token}&solu=11003`,
  ];
  let map: minemap.Map | null = null;
  let disposed = false;

  const layer: MapLayer = {
    id: layerId,
    type: "fill",
    source: sourceId,
    "source-layer": "Landuse",
    paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.35 },
  };

  const addPbf = () => {
    if (!map) {
      status.error("地图尚未初始化完成");
      return;
    }
    replaceVectorSource(map, { id: sourceId, tiles, layers: [layer] });
    status.info(`已提交 ${layerId}`);
  };
  const readFeatures = () => {
    if (!map) return;
    const features = queryRenderedFeatures(map, { layers: [layerId] });
    log.log(`queryRenderedFeatures -> ${features.length} 个渲染要素`);
    if (features[0]) log.log(`首个要素: ${featureName(features[0])}`);
  };
  const readAfterLoad = async () => {
    if (!map) return;
    const loaded = await waitForSourceLoaded(map, sourceId, { timeoutMs: 15_000 });
    if (!loaded) {
      status.error("数据源等待超时");
      return;
    }
    readFeatures();
    status.info("数据源已加载");
  };
  const fitLayer = async () => {
    if (!map) return;
    const fitted = await fitToRenderedLayer(map, {
      layerId,
      sourceId,
      wait: { timeoutMs: 15_000 },
      beforeQuery: () => setZoom(map as MapLike, 11),
    });
    status.info(fitted ? "已按渲染要素适配视野" : "当前视口没有可适配要素");
  };

  createMinemapMap(host, options.token)
    .then((currentMap) => {
      if (disposed) {
        currentMap.remove();
        return;
      }
      map = currentMap;
      addPbf();
    })
    .catch((error: unknown) => {
      if (!disposed) status.error(errorMessage(error));
    });

  addButton(bar, "重新加载 vector 源", addPbf);
  addButton(bar, "查询渲染要素", readFeatures);
  addButton(bar, "等待 source 加载", () => void readAfterLoad());
  addButton(bar, "适配渲染图层", () => void fitLayer());
  return () => {
    disposed = true;
    map?.remove();
    container.innerHTML = "";
  };
};

export const renderViewport: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  const clean = renderWithMap(container, options, "视野与缩放控制", (map, status) => {
    const sourceId = createSourceId("demo", "viewport");
    const layerId = createLayerId("demo", "viewport");
    upsertGeoJSONSource(map, { id: sourceId, data: featureCollection(viewportOverlays) });
    ensureLayers(map, [
      {
        id: `${layerId}-fill`,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.25 },
      },
      {
        id: `${layerId}-line`,
        type: "line",
        source: sourceId,
        paint: { "line-color": "#4dc3e0", "line-width": 3 },
      },
      pointLayer(sourceId, layerId),
    ]);
    status.info("点、线、面覆盖物已绘制");
    addButton(bar, "easeTo 天安门", () =>
      easeTo(map, {
        center: [116.3976, 39.9087],
        zoom: 12,
      }),
    );
    addButton(bar, "panTo 中关村", () => panTo(map, [116.3154, 39.9829]));
    addButton(bar, "setZoom 14", () => setZoom(map, 14));
    addButton(bar, "fitToFeatures", () =>
      fitToFeatures(map, viewportOverlays, {
        padding: { top: 60, right: 60, bottom: 60, left: 60 },
      }),
    );
    addButton(bar, "fitToGeometry", () =>
      fitToGeometry(
        map,
        {
          type: "Polygon",
          coordinates: [
            [
              [116.35, 39.88],
              [116.5, 39.88],
              [116.5, 39.98],
              [116.35, 39.88],
            ],
          ],
        },
        { padding: { top: 80, right: 80, bottom: 80, left: 80 } },
      ),
    );
  });
  return clean;
};

export const renderMarkerCleanup: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  const clean = renderWithMap(container, options, "Marker 清理管理", (map, status) => {
    const markers: minemap.Marker[] = [];
    const mixed: (minemap.Marker | minemap.Popup)[] = [];
    const addMarkers = () => {
      markerPoints.features.forEach((feature, index) => {
        const marker = new minemap.Marker(undefined, {
          color: ["#4de08b", "#4dc3e0", "#ff9d4d", "#ff6b8a", "#c99df0"][index % 5],
        });
        marker.setLngLat(asCoordinate(feature.geometry.coordinates)).addTo(map);
        markers.push(marker);
      });
      status.info(`已创建 ${markers.length} 个 Marker`);
    };
    const cleanMarkers = () => {
      const count = removeOverlays(markers);
      markers.length = 0;
      status.info(`已移除 ${count} 个 Marker`);
    };
    const addMixed = () => {
      const marker = new minemap.Marker().setLngLat([116.37, 39.95]).addTo(map);
      const popup = new minemap.Popup({ closeOnClick: false })
        .setLngLat([116.43, 39.95])
        .setDOMContent(
          Object.assign(document.createElement("div"), {
            textContent: "混合 Popup",
          }),
        )
        .addTo(map);
      mixed.push(marker, popup);
      status.info("已添加 Marker + Popup");
    };
    const cleanMixed = () => {
      const count = removeOverlays(mixed);
      mixed.length = 0;
      status.info(`已移除 ${count} 个覆盖物`);
    };
    addButton(bar, "添加 Markers", addMarkers);
    addButton(bar, "清理 Markers", cleanMarkers);
    addButton(bar, "添加混合覆盖物", addMixed);
    addButton(bar, "清理混合覆盖物", cleanMixed);
    addMarkers();
  });
  return clean;
};

export const renderGeometry: ExampleRender = (container, options) => {
  const log = createLogPanel(container, "几何计算结果");
  const clean = renderWithMap(container, options, "坐标与几何工具", (map, status) => {
    const sourceId = createSourceId("demo", "geometry");
    const layerId = createLayerId("demo", "geometry");
    upsertGeoJSONSource(map, { id: sourceId, data: routeLine });
    ensureLayers(map, [
      {
        id: layerId,
        type: "line",
        source: sourceId,
        paint: { "line-color": "#4de08b", "line-width": 3 },
      },
    ]);
    status.info("几何工具计算完成");
  });

  const pointFeatures: Feature<Point>[] = routeLine.features[0].geometry.coordinates.map(
    (position, index) => ({
      type: "Feature",
      properties: { index },
      geometry: { type: "Point", coordinates: position },
    }),
  );
  const mixedFeatures: Feature<Geometry>[] = [
    ...pointFeatures,
    routeLine.features[0],
    viewportOverlays[2],
  ];
  const coordinates = getCoordinatesFromPoints(pointFeatures);
  const endpoints = getLineEndpoints(routeLine);
  const polygonCoordinates = geoDemo.polygonCoords.map(
    (coordinate) => [coordinate[0], coordinate[1]] as [number, number],
  );
  const polygonFeature: Feature<import("geojson").Polygon> = {
    type: "Feature",
    properties: null,
    geometry: { type: "Polygon", coordinates: [polygonCoordinates] },
  };
  const polygonCollection: FeatureCollection<import("geojson").Polygon> = {
    type: "FeatureCollection",
    features: [polygonFeature],
  };
  const vertices = getPolygonVertices(polygonCollection);
  const points = filterFeaturesByGeometryType(mixedFeatures, "Point");
  const lines = filterFeaturesByGeometryType(mixedFeatures, "LineString");
  const polygons = filterFeaturesByGeometryType(mixedFeatures, "Polygon");
  log.log(`bearing = ${getBearing(geoDemo.currentPoint, geoDemo.nextPoint).toFixed(4)}`);
  log.log(`rotation = ${getRotation(90).toFixed(4)}`);
  log.log(
    `rotationByCoordinate = ${getRotationByCoordinate(geoDemo.currentPoint, geoDemo.nextPoint).toFixed(4)}`,
  );
  log.log(
    `rightIntersection = ${JSON.stringify(getPolygonRightIntersection(geoDemo.polygonCoords))}`,
  );
  log.log(
    `coordinates=${coordinates.length}, endpoints=${endpoints.length}, vertices=${vertices.length}`,
  );
  log.log(
    `filtered Point=${points.length}, LineString=${lines.length}, Polygon=${polygons.length}`,
  );
  try {
    assertCoordinate([116.4, 39.9]);
    log.log("assertCoordinate -> valid");
  } catch (error) {
    log.log(errorMessage(error));
  }
  return clean;
};
