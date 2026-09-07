import type { Feature, FeatureCollection, LineString, Point, Polygon } from "geojson";
import type { Coordinate } from "@ym/map-tools";

/** 示例共享 GeoJSON 数据（重庆城区周边），四框架变体复用。 */
export const districtA: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "核心区 A", level: 1 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.505, 29.545],
            [106.565, 29.545],
            [106.565, 29.585],
            [106.505, 29.585],
            [106.505, 29.545],
          ],
        ],
      },
    },
  ],
};

export const districtB: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "核心区 B", level: 2 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.58, 29.56],
            [106.625, 29.56],
            [106.625, 29.59],
            [106.58, 29.59],
            [106.58, 29.56],
          ],
        ],
      },
    },
  ],
};

export const markerPoints: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "渝中" },
      geometry: { type: "Point", coordinates: [106.5772, 29.5627] },
    },
    {
      type: "Feature",
      properties: { name: "解放碑" },
      geometry: { type: "Point", coordinates: [106.5476, 29.5687] },
    },
    {
      type: "Feature",
      properties: { name: "南岸" },
      geometry: { type: "Point", coordinates: [106.6055, 29.5972] },
    },
    {
      type: "Feature",
      properties: { name: "沙坪坝" },
      geometry: { type: "Point", coordinates: [106.4654, 29.6429] },
    },
    {
      type: "Feature",
      properties: { name: "渝北" },
      geometry: { type: "Point", coordinates: [106.6323, 29.6584] },
    },
  ],
};

export const routeLine: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "演示线路" },
      geometry: {
        type: "LineString",
        coordinates: [
          [106.46, 29.61],
          [106.49, 29.62],
          [106.51, 29.605],
          [106.54, 29.61],
          [106.57, 29.595],
          [106.59, 29.58],
        ],
      },
    },
  ],
};

/** 视野示例覆盖物（点 + 线 + 多边形混合） */
export const viewportOverlays: Feature[] = [
  {
    type: "Feature",
    properties: { name: "起点" },
    geometry: { type: "Point", coordinates: [106.44, 29.54] },
  },
  {
    type: "Feature",
    properties: { name: "线路" },
    geometry: {
      type: "LineString",
      coordinates: [
        [106.45, 29.54],
        [106.53, 29.56],
        [106.57, 29.53],
      ],
    },
  },
  {
    type: "Feature",
    properties: { name: "范围" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [106.6, 29.59],
          [106.65, 29.59],
          [106.65, 29.63],
          [106.6, 29.63],
          [106.6, 29.59],
        ],
      ],
    },
  },
];

/** 几何工具示例坐标 */
export const geoDemo = {
  /** 演示多边形（用于 bbox 与顶点提取） */
  polygonCoords: [
    [106.5, 29.55],
    [106.57, 29.56],
    [106.59, 29.61],
    [106.51, 29.62],
    [106.5, 29.55],
  ] as Coordinate[],
  /** 方位角演示：起点 -> 终点 */
  currentPoint: [106.55, 29.56] as Coordinate,
  nextPoint: [106.61, 29.6] as Coordinate,
  /** assertCoordinate 校验用例 */
  checkCases: [
    { label: "[106.55, 29.56]", value: [106.55, 29.56] },
    { label: "'106.55,29.56'（字符串）", value: "106.55,29.56" },
    { label: "[106.55, 29.56, 10]（三维）", value: [106.55, 29.56, 10] },
    { label: "null", value: null },
  ],
};
