import {
  FeatureCollection,
  MultiPolygon,
  Polygon,
  explode,
  featureEach,
  geomEach,
  getCoord,
} from '@turf/turf'

/**
 * 获取多边形顶点
 */
export function getPolygonVertex(polygonFeatureCollection: FeatureCollection<Polygon | MultiPolygon>) {
  if (!polygonFeatureCollection) return []
  const vertexPoints: any[] = []
  geomEach(polygonFeatureCollection, (currentGeometry) => {
    const polygonFC = explode(currentGeometry)
    featureEach(polygonFC, (currentFeature) => {
      const coord = getCoord(currentFeature)
      vertexPoints.push(coord)
    })
  })
  return vertexPoints
}
