import {onUnmounted, ref, reactive} from "vue";
import type { Feature, FeatureCollection } from '@turf/turf'

export type EventDispatcherData = {
  layerId: string;
  feature: Feature | FeatureCollection;
  mapEvent: any;
}

export type ZoomLayerEventData = {
  zoom: number,
  mouseCoordinate: number[],
  mapCenterCoordinate: number[],
} & EventDispatcherData;

type BindFn = {
  onMapLoaded?: (map: minemap.Map) => void;
  clickLayerEventDispatcher?: (data: EventDispatcherData) => void;
  clickNoInLayer?: (e: any) => void;
  mouseMoveLayerEventDispatcher?: (data: EventDispatcherData) => void;
  moveNoInLayer?: (e: any) => void;
  zoomLayerEventDispatcher?: (data: ZoomLayerEventData) => void;
  zoomNoInLayer?: (e: any) => void;
}

export type MapHookOption = {
  map?: minemap.Map;
  bindClickLayers?: string[],
  bindMouseMoveLayers?: string[],
  bindZoomLayers?: string[],
  // onMapZoom 以哪个坐标为基准进行图层查询
  zoomQueryBy?: 'map' | 'mouse',
}

/**
 * map hooks. 对各种类型的地图事件进行监听需要在对应的数组内进行绑定，同理，需要监听不在图层内的监听，则需要使用如 "noInLayer"的方法
 * @param option
 * @param [option.map] - 如果未在调用时提供了map实例，则需要通过此方法(mapInitialize)绑定地图实例，否则功能将无法正常执行
 * @param [option.bindClickLayers] - 绑定地图内监听点击事件监听的图层。绑定后，会在 clickLayerEventDispatcher 的回调参数中获取到点击的图层相关数据
 * @param [option.bindMouseMoveLayers] - 绑定地图内监听鼠标移动事件监听的图层。绑定后，会在 onMouseMoveLayerEventDispatcher 的回调参数中获取到点击的图层相关数据
 * @param [option.bindZoomLayers] - 绑定地图内监听缩放事件监听的图层。绑定后，会在 onZoomLayerEventDispatcher 的回调参数中获取到点击的图层相关数据
 * @param [option.zoomQueryBy] - onMapZoom 以哪个坐标为基准进行图层查询
 * @returns 
 */
export function useMap(option: MapHookOption) {
  const {
    map = null,
    bindClickLayers = [],
    bindMouseMoveLayers = [],
    bindZoomLayers = [],
    zoomQueryBy = 'mouse',
  } = option;
  const mapInstance = ref<minemap.Map | null | undefined>(map);
  const mouseInfo = reactive({
    lng: 0,
    lat: 0,
    x: 0,
    y: 0,
  })

  if(mapInstance.value) {
    bindMapEvent();
  }

  const bindFnList = reactive<BindFn>({
    onMapLoaded: undefined,
    clickLayerEventDispatcher: undefined,
    clickNoInLayer: undefined,
    mouseMoveLayerEventDispatcher: undefined,
    moveNoInLayer: undefined,
    zoomLayerEventDispatcher: undefined,
    zoomNoInLayer: undefined,
  })

  /**
   * 当地图的初始化是通过组件的事件返回时，可以通过绑定此函数执行初始化操作。
   * 注意：当 useMap 默认设置了 map 实例后，为了防止重复绑定，此方法的执行将被忽略
   * @param map
   */
  function mapInitialize(map: minemap.Map) {
    if(!mapInstance.value) {
      mapInstance.value = map;
      bindFnList.onMapLoaded && bindFnList.onMapLoaded(map);
      mapInstance.value.on("click", onMapClick);
      mapInstance.value.on("mousemove", onMapMouseMove);
      mapInstance.value.on("zoomend", onMapZoomEnd);
    }
  }

  function bindMapEvent() {
    if(mapInstance.value) {
      mapInstance.value.on("click", onMapClick);
      mapInstance.value.on("mousemove", onMapMouseMove);
      mapInstance.value.on("zoomend", onMapZoomEnd);
    }
  }

  function unBindMapEvent() {
    if(mapInstance.value) {
      mapInstance.value.off("click", onMapClick);
      mapInstance.value.off("mousemove", onMapMouseMove);
      mapInstance.value.off("zoomend", onMapZoomEnd);
    }
  }

  function onMapZoomEnd(e: any) {
    const zoom = mapInstance?.value!.getZoom();
    const mapCenter = mapInstance?.value!.getCenter();
    let queryPoint;
    if(zoomQueryBy === 'mouse') {
      queryPoint = [mouseInfo.x, mouseInfo.y];
    } else if(zoomQueryBy === 'map') {
      // 使用坐标查询会有偏移，慎重使用
      queryPoint = [mapCenter.lng, mapCenter.lat];
    }

    if(!!queryPoint) {
      const features = mapInstance?.value?.queryRenderedFeatures(queryPoint, {
        layers: bindZoomLayers,
      });

      if (Array.isArray(features) && features.length > 0) {
        const feature = features[0];
        const zoomLayerId = feature.layer.id;
        if (!!feature && bindZoomLayers.includes(zoomLayerId)) {
          bindFnList.zoomLayerEventDispatcher && bindFnList.zoomLayerEventDispatcher({
            zoom,
            layerId: zoomLayerId,
            feature,
            mapEvent: e,
            mouseCoordinate: [mouseInfo.lng, mouseInfo.lat],
            mapCenterCoordinate: [mapCenter.lng, mapCenter.lat],
          });
        }
      } else {
        bindFnList.zoomNoInLayer && bindFnList.zoomNoInLayer(e);
      }

    }
  }

  function setMouseInfo(e: any) {
    const { lng, lat } = e.lngLat;
    const {x, y} = e.point;
    mouseInfo.lng = lng;
    mouseInfo.lat = lat;
    mouseInfo.x = x;
    mouseInfo.y = y;
  }

  function onMapMouseMove(e: any) {
    setMouseInfo(e);

    const features = mapInstance?.value?.queryRenderedFeatures(e.point, {
      layers: bindMouseMoveLayers,
    });

    if (Array.isArray(features) && features.length > 0) {
      const feature = features[0];
      const moveLayerId = feature.layer.id;
      if (!!feature && bindMouseMoveLayers.includes(moveLayerId)) {
        bindFnList.mouseMoveLayerEventDispatcher && bindFnList.mouseMoveLayerEventDispatcher({
          layerId: moveLayerId,
          feature,
          mapEvent: e,
        });
      }
    } else {
      // 点击了非图层区域
      bindFnList.moveNoInLayer && bindFnList.moveNoInLayer(e);
    }
  }

  function onMapClick(e: any) {
    const features = mapInstance?.value?.queryRenderedFeatures(e.point, {
      layers: bindClickLayers || [],
    });

    if (Array.isArray(features) && features.length > 0) {
      const feature = features[0];
      const clickLayerId = feature.layer.id
      if (!!feature && bindClickLayers.includes(clickLayerId)) {
        bindFnList.clickLayerEventDispatcher && bindFnList.clickLayerEventDispatcher({
          layerId: clickLayerId,
          feature,
          mapEvent: e,
        });
      }
    } else {
      // 点击了非图层区域
      bindFnList.clickNoInLayer && bindFnList.clickNoInLayer(e);
    }
  }

  function onMapLoaded(fn: BindFn["onMapLoaded"]) {
    bindFnList.onMapLoaded = fn;
  }

  /**
   * 被点击图层事件分发器
   */
  function onClickLayerEventDispatcher(fn: BindFn['clickLayerEventDispatcher']) {
    bindFnList.clickLayerEventDispatcher = fn;
  }

  // 点击了非绑定图层区域
  function onClickNoInLayers(fn: BindFn['clickNoInLayer']) {
    bindFnList.clickNoInLayer = fn;
  }

  /**
   * 鼠标移动图层事件分发器
   */
  function onMouseMoveLayerEventDispatcher(fn: BindFn['mouseMoveLayerEventDispatcher']) {
    bindFnList.mouseMoveLayerEventDispatcher = fn;
  }

  /**
   * 移动到了非绑定图层区域
   */
  function onMoveNoInLayers(fn: BindFn['moveNoInLayer']) {
    bindFnList.moveNoInLayer = fn;
  }

  /**
   * 鼠标移动图层事件分发器
   */
  function onZoomLayerEventDispatcher(fn: BindFn['zoomLayerEventDispatcher']) {
    bindFnList.zoomLayerEventDispatcher = fn;
  }

  /**
   * 移动到了非绑定图层区域
   */
  function onZoomNoInLayers(fn: BindFn['zoomNoInLayer']) {
    bindFnList.zoomNoInLayer = fn;
  }

  onUnmounted(() => {
    unBindMapEvent();
  })

  return {
    mapInitialize,
    onMapLoaded,
    onClickLayerEventDispatcher,
    onClickNoInLayers,
    onMouseMoveLayerEventDispatcher,
    onMoveNoInLayers,
    onZoomLayerEventDispatcher,
    onZoomNoInLayers,
    unBindMapEvent,
  }
}
