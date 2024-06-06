import {
  FeatureCollection,
  LineString,
  MultiLineString,
  featureCollection,
  geomEach,
  getCoords,
  lineString
} from '@turf/turf'

/**
 * 获取线的端点,支持 lineString 和 multiLineString
 */
export function getLineEndpoint() {
  const center = {
    lng: 116.46,
    lat: 39.92
  }

  const lineStringFC = featureCollection([
    lineString(
      [[center.lng - 0.005, center.lat + 0.005], [center.lng - 0.005, center.lat - 0.005]]
    ),
    lineString(
      [[center.lng - 0.005, center.lat], [center.lng, center.lat], [center.lng + 0.009, center.lat]]
    )
  ])

  const lineStringEndpoint = getLineStringEndpoint(lineStringFC)

  console.log('lineStringEndpoint', lineStringEndpoint)
}

/**
 * 获取单个线端点
 */
export function getLineStringEndpoint(lineFeatureCollection: FeatureCollection<LineString | MultiLineString>) {
  if (!lineFeatureCollection) return []
  const endPoints: any[] = []
  geomEach(lineFeatureCollection, (currentGeometry) => {
    const coords = getCoords(currentGeometry)
    endPoints.push(coords[0])
    endPoints.push(coords[coords.length - 1])
  })
  return endPoints
}
