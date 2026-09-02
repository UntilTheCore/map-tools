import type { Feature, Geometry, Point } from "geojson";
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

const sourceId = (name: string) => FE_utils.createSourceId("demo", name);
const layerId = (name: string) => FE_utils.createLayerId("demo", name);

function fillLayer(id: string, source: string, color: string): minemap.MapLayer {
  return { id, type: "fill", source, paint: { "fill-color": color, "fill-opacity": 0.35 } };
}

function createHtmlMap(
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
  let map: minemap.Map | null = null;
  let disposed = false;
  createMinemapMap(host, options.token)
    .then((currentMap) => {
      if (disposed) {
        currentMap.remove();
        return;
      }
      map = currentMap;
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
      FE_utils.destroyMap(map);
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
    FE_utils.destroyMap(map);
    map = null;
    host.replaceChildren();
    status.info("FE_utils.destroyMap 已执行");
  });
  addButton(bar, "重新初始化", initialize);
  initialize();

  return () => {
    disposed = true;
    if (map) FE_utils.destroyMap(map);
    container.innerHTML = "";
  };
};

export const renderLayerVisibility: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  return createHtmlMap(container, options, "图层显隐控制", (map, status) => {
    const sourceA = sourceId("districtA");
    const layerA = layerId("districtA");
    const sourceB = sourceId("districtB");
    const layerB = layerId("districtB");
    const pointsSource = sourceId("points");
    const pointsLayer = layerId("points");
    FE_utils.upsertGeoJSONSource(map, { id: sourceA, data: districtA });
    FE_utils.ensureLayers(map, [fillLayer(layerA, sourceA, "#4de08b")]);
    FE_utils.upsertGeoJSONSource(map, { id: sourceB, data: districtB });
    FE_utils.ensureLayers(map, [fillLayer(layerB, sourceB, "#ff9d4d")]);
    FE_utils.upsertGeoJSONSource(map, { id: pointsSource, data: markerPoints });
    FE_utils.ensureLayers(map, [
      {
        id: pointsLayer,
        type: "circle",
        source: pointsSource,
        paint: { "circle-radius": 7, "circle-color": "#4dc3e0" },
      },
    ]);
    status.info("已添加 3 个图层");
    addButton(bar, "隐藏 A", () => FE_utils.setLayerVisibility(map, layerA, false));
    addButton(bar, "显示 A", () => FE_utils.setLayerVisibility(map, layerA, true));
    addButton(bar, "隐藏全部", () =>
      FE_utils.setLayersVisibility(map, [layerA, layerB, pointsLayer], false),
    );
    addButton(bar, "显示全部", () =>
      FE_utils.setLayersVisibility(map, [layerA, layerB, pointsLayer], true),
    );
    addButton(bar, "切换 B", () => {
      const visible = FE_utils.getLayerVisibility(map, layerB) !== "visible";
      FE_utils.setLayerVisibility(map, layerB, visible);
      status.info(`${layerB}: ${visible ? "visible" : "none"}`);
    });
  });
};

export const renderPbfLayer: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  const log = createLogPanel(container, "PBF 日志");
  if (!options.token) {
    const clean = renderNoTokenPanel(container, "PBF 图层与要素读取");
    return () => {
      clean();
      container.innerHTML = "";
    };
  }
  const source = sourceId("pbfLanduse");
  const layer = layerId("pbfLanduse");
  const tiles = [
    `https://sd-data.minedata.cn/data/Landuse/{z}/{x}/{y}?token=${options.token}&solu=11003`,
  ];
  let map: minemap.Map | null = null;
  let disposed = false;
  const host = createMapHost(container);
  const status = createStatusBar(container);
  const vectorLayer: minemap.MapLayer = {
    id: layer,
    type: "fill",
    source,
    "source-layer": "Landuse",
    paint: { "fill-color": "#ff9d4d", "fill-opacity": 0.35 },
  };
  const addVector = () => {
    if (!map) return;
    FE_utils.replaceVectorSource(map, { sourceId: source, tiles, layers: [vectorLayer] });
    status.info("vector source 已替换");
  };
  const read = () => {
    if (!map) return;
    const features = FE_utils.queryRenderedFeatures(map, { layers: [layer] });
    log.log(`queryRenderedFeatures -> ${features.length}`);
    if (features[0]) log.log(featureName(features[0]));
  };
  const waitAndRead = async () => {
    if (!map) return;
    if (await FE_utils.waitForSourceLoaded(map, source, { timeoutMs: 15_000 })) read();
    else status.error("source 加载超时");
  };
  const fit = async () => {
    if (!map) return;
    const result = await FE_utils.fitToRenderedLayer(map, {
      layerId: layer,
      sourceId: source,
      wait: { timeoutMs: 15_000 },
      beforeQuery: () => FE_utils.setZoom(map!, 11),
    });
    status.info(result ? "已适配渲染图层" : "当前视口没有要素");
  };
  createMinemapMap(host, options.token)
    .then((currentMap) => {
      if (disposed) currentMap.remove();
      else {
        map = currentMap;
        addVector();
      }
    })
    .catch((error: unknown) => {
      if (!disposed) status.error(errorMessage(error));
    });
  addButton(bar, "重新加载 vector 源", addVector);
  addButton(bar, "查询渲染要素", read);
  addButton(bar, "等待 source 加载", () => void waitAndRead());
  addButton(bar, "适配渲染图层", () => void fit());
  return () => {
    disposed = true;
    map?.remove();
    container.innerHTML = "";
  };
};

export const renderViewport: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  return createHtmlMap(container, options, "视野与缩放控制", (map, status) => {
    const source = sourceId("viewport");
    const layer = layerId("viewport");
    FE_utils.upsertGeoJSONSource(map, { id: source, data: asFeatureCollection(viewportOverlays) });
    FE_utils.ensureLayers(map, [
      fillLayer(`${layer}-fill`, source, "#ff9d4d"),
      {
        id: `${layer}-line`,
        type: "line",
        source,
        paint: { "line-color": "#4dc3e0", "line-width": 3 },
      },
      {
        id: layer,
        type: "circle",
        source,
        paint: { "circle-radius": 6, "circle-color": "#4de08b" },
      },
    ]);
    status.info("点、线、面覆盖物已绘制");
    addButton(bar, "easeTo 天安门", () =>
      FE_utils.easeTo(map, { center: [116.3976, 39.9087], zoom: 12 }),
    );
    addButton(bar, "panTo 中关村", () => FE_utils.panTo(map, [116.3154, 39.9829]));
    addButton(bar, "setZoom 14", () => FE_utils.setZoom(map, 14));
    addButton(bar, "fitToFeatures", () =>
      FE_utils.fitToFeatures(map, viewportOverlays, {
        padding: { top: 60, right: 60, bottom: 60, left: 60 },
      }),
    );
    addButton(bar, "fitToGeometry", () =>
      FE_utils.fitToGeometry(
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
};

export const renderMarkerCleanup: ExampleRender = (container, options) => {
  const bar = createControlBar(container);
  return createHtmlMap(container, options, "Marker 清理管理", (map, status) => {
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
      const count = FE_utils.removeOverlays(markers);
      markers.length = 0;
      status.info(`已移除 ${count} 个 Marker`);
    };
    const addMixed = () => {
      const marker = new minemap.Marker().setLngLat([116.37, 39.95]).addTo(map);
      const popupContent = document.createElement("div");
      popupContent.textContent = "混合 Popup";
      const popup = new minemap.Popup({ closeOnClick: false })
        .setLngLat([116.43, 39.95])
        .setDOMContent(popupContent)
        .addTo(map);
      mixed.push(marker, popup);
      status.info("已添加 Marker + Popup");
    };
    const cleanMixed = () => {
      const count = FE_utils.removeOverlays(mixed);
      mixed.length = 0;
      status.info(`已移除 ${count} 个覆盖物`);
    };
    addButton(bar, "添加 Markers", addMarkers);
    addButton(bar, "清理 Markers", cleanMarkers);
    addButton(bar, "添加混合覆盖物", addMixed);
    addButton(bar, "清理混合覆盖物", cleanMixed);
    addMarkers();
  });
};

export const renderGeometry: ExampleRender = (container, options) => {
  const log = createLogPanel(container, "几何计算结果");
  const clean = createHtmlMap(container, options, "坐标与几何工具", (map, status) => {
    const source = sourceId("geometry");
    const layer = layerId("geometry");
    FE_utils.upsertGeoJSONSource(map, { id: source, data: routeLine });
    FE_utils.ensureLayers(map, [
      { id: layer, type: "line", source, paint: { "line-color": "#4de08b", "line-width": 3 } },
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
  const points = FE_utils.filterFeaturesByGeometryType(mixedFeatures, "Point");
  const lines = FE_utils.filterFeaturesByGeometryType(mixedFeatures, "LineString");
  const polygons = FE_utils.filterFeaturesByGeometryType(mixedFeatures, "Polygon");
  log.log(`bearing = ${FE_utils.getBearing(geoDemo.currentPoint, geoDemo.nextPoint).toFixed(4)}`);
  log.log(`rotation = ${FE_utils.getRotation(90).toFixed(4)}`);
  log.log(
    `rotationByCoordinate = ${FE_utils.getRotationByCoordinate(geoDemo.currentPoint, geoDemo.nextPoint).toFixed(4)}`,
  );
  log.log(`point=${points.length}, line=${lines.length}, polygon=${polygons.length}`);
  try {
    FE_utils.assertCoordinate([116.4, 39.9]);
    log.log("assertCoordinate -> valid");
  } catch (error) {
    log.log(errorMessage(error));
  }
  return clean;
};
