import type { Feature, Point } from '@turf/turf'
import { getCoord } from '@turf/turf'

export function pointListToCoordList(list: Feature<Point>[]) {
  return list.map(point => getCoord(point));
}
