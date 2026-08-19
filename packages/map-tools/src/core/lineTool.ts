import {
  FeatureCollection,
  LineString,
  MultiLineString,
  geomEach,
  getCoords,
  getType,
} from '@turf/turf'
import { FeatureTypeEnum } from './types'

/**
 * 获取单个线端点
 */
export function getLineStringEndpoint(lineFeatureCollection: FeatureCollection<LineString | MultiLineString>) {
  if (!lineFeatureCollection) return []
  const endPoints: any[] = []
  geomEach(lineFeatureCollection, (currentGeometry) => {
    const type = getType(currentGeometry);
    const coords = getCoords(currentGeometry)
    if(type === FeatureTypeEnum.LineString) {
      endPoints.push(coords[0])
      endPoints.push(coords[coords.length - 1])
    } else if(type === FeatureTypeEnum.MultiLineString) {
      coords.forEach(coordItem => {
        endPoints.push(coordItem[0])
        endPoints.push(coordItem[coordItem.length - 1])
      })
    }
  })
  return endPoints
}
