import type { Feature, FeatureCollection, LineString, Point, Polygon } from "geojson";
import type { Coordinate } from "@ym/map-tools";

/** 示例共享 GeoJSON 数据（北京城区周边），四框架变体复用。 */
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
            [116.355, 39.885],
            [116.415, 39.885],
            [116.415, 39.925],
            [116.355, 39.925],
            [116.355, 39.885],
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
            [116.43, 39.9],
            [116.475, 39.9],
            [116.475, 39.93],
            [116.43, 39.93],
            [116.43, 39.9],
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
      properties: { name: "北京站" },
      geometry: { type: "Point", coordinates: [116.4272, 39.9027] },
    },
    {
      type: "Feature",
      properties: { name: "天安门" },
      geometry: { type: "Point", coordinates: [116.3976, 39.9087] },
    },
    {
      type: "Feature",
      properties: { name: "三里屯" },
      geometry: { type: "Point", coordinates: [116.4555, 39.9372] },
    },
    {
      type: "Feature",
      properties: { name: "中关村" },
      geometry: { type: "Point", coordinates: [116.3154, 39.9829] },
    },
    {
      type: "Feature",
      properties: { name: "望京" },
      geometry: { type: "Point", coordinates: [116.4823, 39.9984] },
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
          [116.31, 39.95],
          [116.34, 39.96],
          [116.36, 39.945],
          [116.39, 39.95],
          [116.42, 39.935],
          [116.44, 39.92],
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
    geometry: { type: "Point", coordinates: [116.29, 39.88] },
  },
  {
    type: "Feature",
    properties: { name: "线路" },
    geometry: {
      type: "LineString",
      coordinates: [
        [116.3, 39.88],
        [116.38, 39.9],
        [116.42, 39.87],
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
          [116.45, 39.93],
          [116.5, 39.93],
          [116.5, 39.97],
          [116.45, 39.97],
          [116.45, 39.93],
        ],
      ],
    },
  },
];

/** 几何工具示例坐标 */
export const geoDemo = {
  /** 演示多边形（用于 bbox 与顶点提取） */
  polygonCoords: [
    [116.35, 39.89],
    [116.42, 39.9],
    [116.44, 39.95],
    [116.36, 39.96],
    [116.35, 39.89],
  ] as Coordinate[],
  /** 方位角演示：起点 -> 终点 */
  currentPoint: [116.4, 39.9] as Coordinate,
  nextPoint: [116.46, 39.94] as Coordinate,
  /** assertCoordinate 校验用例 */
  checkCases: [
    { label: "[116.4, 39.9]", value: [116.4, 39.9] },
    { label: "'116.4,39.9'（字符串）", value: "116.4,39.9" },
    { label: "[116.4, 39.9, 10]（三维）", value: [116.4, 39.9, 10] },
    { label: "null", value: null },
  ],
};
