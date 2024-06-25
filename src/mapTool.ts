import {
  bbox, bearing, centerOfMass, envelope,
  Feature, featureCollection,
  FeatureCollection, getCoord,
  getType, lineIntersect, lineString, LineString,
  MultiLineString,
  MultiPolygon, point,
  Point, polygon,
  Polygon,
  Properties
} from '@turf/turf'
import { pointListToCoordList } from '@/pointTool';
import { getLineStringEndpoint } from '@/lineTool'
import { getPolygonVertex } from '@/polygonTool'

// 销毁地图实例
export function destroyMap(map: minemap.Map) {
  if (!!map) {
    map.remove()
  }
}

export function clearAllSourceAndLayer(map: minemap.Map, constant: any) {
  for (const key in constant) {
    if (key.toLocaleLowerCase().includes('layer')) {
      if (map.getLayer(constant[key])) {
        map.removeLayer(constant[key])
      }
    }

    if (key.toLocaleLowerCase().includes('source')) {
      if (map.getSource(constant[key])) {
        map.removeSource(constant[key])
      }
    }
  }
}

function addLayer(map: minemap.Map, layer: MapLayer) {
  map.addLayer(layer)
}

/**
 * 设置图层和数据源，支持在数据源和图层设置完成后再执行一个回调函数
 * @param map
 * @param sourceId
 * @param layer
 * @param featureCollection
 * @param {object} option
 * @param {function} [option.afterSetData] - 在设置数据后调用此方法
 * @param {function} [option.afterSetLayer] - 在设置图层后调用此方法
 * @param {object} [option.sourceOption] - 设置数据源时的额外配置属性
 */
export function setSourceData(map: minemap.Map, sourceId: string, layer: MapLayer, featureCollection: FeatureCollection, option: any = {}) {
  try {
    const { afterSetData, afterSetLayer, sourceOption } = option
    const source = map.getSource(sourceId)
    if (source) {
      source.setData(featureCollection)
      afterSetData && afterSetData(map, layer.id)
      // afterSetData && afterSetData(map, layerText.id);
    } else {
      addSource(map, sourceId, featureCollection, sourceOption)
      addLayer(map, layer)
      afterSetLayer && afterSetLayer(map, layer.id)
      // afterSetData && afterSetData(map, layerText.id);
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * 若需要给多个图层设置同一个数据源时，可用此函数，不同多次调用 setSourceData
 * 其余功能保持和 setSourceData 一致，并支持对每个 layer 都调用一次 afterSetLayer 方法
 * @param map
 * @param sourceId
 * @param layers - 图层对象数组
 * @param featureCollection
 * @param {object} option
 * @param {function} [option.afterSetData] - 在设置数据后调用此方法
 * @param {function} [option.afterSetLayer] - 在设置图层后调用此方法
 * @param {function} [option.sourceOption] - 设置数据源时的额外配置属性
 */
export function setMultipleLayerSourceData(map: minemap.Map, sourceId: string, layers: MapLayer[], featureCollection: FeatureCollection, option: {
  afterSetData?: (map: minemap.Map, layerId: string) => void;
  afterSetLayer?: (map: minemap.Map, layerId: string) => void;
  sourceOption?: Omit<MapSource, 'type' | 'data'>;
} = {}) {
  try {
    const { afterSetData, afterSetLayer, sourceOption = {} } = option
    const source = map.getSource(sourceId)
    if (source) {
      source.setData(featureCollection)
      if (Array.isArray(layers)) {
        layers.forEach(layer => {
          afterSetData && afterSetData(map, layer.id)
        })
      }
    } else {
      addSource(map, sourceId, featureCollection, sourceOption)
      if (Array.isArray(layers)) {
        layers.forEach(layer => {
          addLayer(map, layer)
          afterSetLayer && afterSetLayer(map, layer.id)
        })
      }
    }
  } catch (e) { }
}

/**
 * 设置pbf数据源，重复设置数据源时，会自动删除之前(sourceId)数据源
 * @param map
 * @param sourceId
 * @param layer
 * @param tiles
 * @param {{useToken: boolean, token: string}} option
 * @param [option.useToken] - 是否使用token, 使用 token时，会自动为tiles数组内的所有链接末尾添加token值。
 * @param [option.token] - token值
 */
export function setPbfSourceData(map: minemap.Map, sourceId: string, layer: MapLayer, tiles: string[], option: {
  useToken?: boolean;
  token?: string;
} = {}) {

  function addPbfSource(tiles: string[]) {
    map.addSource(sourceId, {
      type: 'vector',
      tiles
    })
  }

  const { useToken = false, token } = option
  if (useToken) {
    tiles = tiles.map(tile => {
      return tile + token
    })
  }

  const source = map.getSource(sourceId)
  if (!source) {
    addPbfSource(tiles);
    addLayer(map, layer)
  } else {
    map.removeSource(sourceId);
    setTimeout(() => {
      addPbfSource(tiles)
    }, 50);
  }
}

/**
 * 添加数据源，此方法仅适用于设置 geojson 的数据。其他类型的需额外编写方法，参考 setStationPbfPublic 设置 pbf 数据图层
 * @param map - 地图实例
 * @param sourceId - 数据源 id
 * @param featureCollection - 数据集合
 * @param option - 可选参数。数据源的更多配置项，参考：https://dev.minedata.cn/minemapapi/v3.0.0/docs/source.html
 */
function addSource(map: minemap.Map, sourceId: string, featureCollection: FeatureCollection, option: Omit<MapSource, 'type' | 'data'> = {}) {
  map.addSource(sourceId, {
    'type': 'geojson',
    'data': featureCollection as GeoJSON.FeatureCollection,
    ...option
  })
}

export function moveAndZoom(map: minemap.Map, coordinate: number[], zoom = 12) {
  map.easeTo({
    center: coordinate,
    zoom
  })
}

export function moveMap(map: minemap.Map, coordinate: number[]) {
  map.panTo(coordinate)
}

// 注意：setZoom 和 moveMap一起使用时需要将 setZoom 延后(setTimeout)执行，如果是需要同时移动并改变 zoom 推荐使用地图的 easeTo 功能
export function setZoom(map: minemap.Map, zoom: number) {
  if (zoom > 10) {
    map.setZoom(zoom)
  }
}

export function removeMarkers(markers: minemap.Marker) {
  if (Array.isArray(markers)) {
    markers.forEach(marker => marker && marker.remove())
  } else {
    console.error('value markers is not array')
  }
}

// 可用于删除 Marker 或 Popup 列表
export function removeMarkersOrPopups(list: (minemap.Popup | minemap.Marker)[]) {
  if (Array.isArray(list)) {
    list.forEach(val => val.remove())
  } else {
    console.error('list is not array')
  }
}

export function getBearing(currentPoint: number[], nextPoint: number[]) {
  return bearing(point(currentPoint), point(nextPoint))
}

export function getRotation(bearing: number, compensation = 180) {
  return bearing - compensation
}

export function getRotationByCoordinate(currentPoint: number[], nextPoint: number[], compensation = 180) {
  return getRotation(getBearing(currentPoint, nextPoint), compensation)
}

/**
 * 获取多边形中点与靠右侧经度最大点之间线的交叉点
 * @param coordinates - 多边形坐标数据
 */
export function getCenterBetweenRightPointIntersection(coordinates: number[][]) {
  const max = Math.max(...coordinates.map(coord => coord[0]))
  const eastCoord = coordinates.find((item) => {
    return item[0] === max
  })

  if(eastCoord) {
    const eastCoord1 = [eastCoord[0], eastCoord[1] + 0.5]
    const eastCoord2 = [eastCoord[0], eastCoord[1] - 0.5]
    const _polygon = polygon([coordinates])

    const polygonCenterPoint = centerOfMass(_polygon)
    const polygonCenterPointCoord = getCoord(polygonCenterPoint)
    const polygonCenterPointCoord1 = [polygonCenterPointCoord[0] + 0.5, polygonCenterPointCoord[1]]
    const polygonCenterPointCoord2 = [polygonCenterPointCoord[0] - 0.5, polygonCenterPointCoord[1]]

    const line1 = lineString([eastCoord, eastCoord1, eastCoord2], { name: 'line 1' })
    const line2 = lineString([polygonCenterPointCoord, polygonCenterPointCoord1, polygonCenterPointCoord2], { name: 'line 2' })

    const intersects = lineIntersect(line1, line2)
    return getCoord(intersects.features[0])
  }

  return undefined;
}


/**
 * 检测坐标值是否符合 [xxx,xxx]格式
 */
export function checkCoordinate(coordinate: any) {
  const messageShouldArray = '坐标应该为一个只有两个元素的数组'
  const messageValueIsNotNumber = '坐标值应是 number'
  if (!Array.isArray(coordinate)) throw new Error(messageShouldArray)
  if (Array.isArray(coordinate) && coordinate.length > 2) throw new Error(messageShouldArray)
  if ((typeof coordinate[0] !== 'number') || (typeof coordinate[1] !== 'number')) throw new Error(messageValueIsNotNumber)
}

export function setViewPortByPolygon(map: minemap.Map, polygon: Feature<MultiPolygon | Polygon, Properties>, boundary: ViewPortOption['boundary']) {
  const box = bbox(polygon);
  if(boundary) {
    map.fitBounds(box, {
      padding: { top: boundary[0], bottom: boundary[1], left: boundary[2], right: boundary[3] }
    })
  }
}

enum FeatureTypeEnum {
  Point = 'Point',
  LineString = 'LineString',
  MultiLineString = 'MultiLineString',
  Polygon = 'Polygon',
  MultiPolygon = 'MultiPolygon'
}

export function getFeatureTypeList<T>(featureList: Feature<Point | LineString | MultiLineString | Polygon | MultiPolygon>[], featureType: FeatureTypeEnum): Feature<T>[] {
  return featureList.filter(feature => {
    return featureType === getType(feature)
  }) as Feature<T>[]
}

export type ViewPortOption = {
  boundary?: number[];
}

/**
 * 根据覆盖物计算并移动和缩放至最优层级
 * @param map
 * @param overlays - 覆盖物数据只支持点（point）、线（lineString,multiLineString)、多边形（polygon，multiPolygon)
 * @param option
 * @param [option.boundary] - 计算出的边界与整个浏览器视口的距离。数据逻辑为[上,右,下,左]
 */
export function setViewPort(
  map: minemap.Map,
  overlays: Feature<Point | LineString | MultiLineString | Polygon | MultiPolygon>[] = [],
  option: ViewPortOption = {}
) {
  if (!map) return
  const { boundary = [150, 250, 150, 250] } = option
  const pointList = getFeatureTypeList<Point>(overlays, FeatureTypeEnum.Point)
  const lineStringList = getFeatureTypeList<LineString>(overlays, FeatureTypeEnum.LineString)
  const multiLineStringList = getFeatureTypeList<MultiLineString>(overlays, FeatureTypeEnum.MultiLineString)
  const polygonList = getFeatureTypeList<Polygon>(overlays, FeatureTypeEnum.Polygon)
  const multipolygonList = getFeatureTypeList<MultiPolygon>(overlays, FeatureTypeEnum.MultiPolygon)
  const coords = pointListToCoordList(pointList)
  .concat(getLineStringEndpoint(featureCollection(lineStringList)))
  .concat(getLineStringEndpoint(featureCollection(multiLineStringList)))
  .concat(getPolygonVertex(featureCollection(polygonList)))
  .concat(getPolygonVertex(featureCollection(multipolygonList)))
  if (coords.length > 0) {
    const p = envelope(featureCollection(coords.map(coord => point(coord))))
    if (p.bbox) {
      map.fitBounds(p.bbox, {
        padding: { top: boundary[0], bottom: boundary[1], left: boundary[2], right: boundary[3] }
      })
    } else {
      setViewPortByPolygon(map, p, boundary)
    }
  }
}
