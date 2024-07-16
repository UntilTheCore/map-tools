/// <reference types="@types/geojson" />

type LayerType = "fill" | "line" | "symbol" | "circle" | "heatmap" | "extrusion" | "raster" | "airline" | "dynamicLine" | "sprite" | "histogram" | "tracking" | "symtracking" | "background"

declare type MapSource = {
  type: "geojson" | "vector";
  data?: GeoJSON.FeatureCollection | GeoJSON.Feature;
  url?: string;
  tiles?: string[];
  [key: string]: any;
}

declare type MapLayer = {
  id: string;
  type: LayerType,
  source: string | {
    type: string;
    url: string;
  },
  layout?: any;
  paint?: any;
  'source-layer'?: string,
  minzoom?: number;
  maxzoom?: number;
  [key: string]: any;
}

declare namespace minemap {
  let domainUrl: string;
  let dataDomainUrl: string;
  let serverDomainUrl: string;
  let spriteUrl: string;
  let serviceUrl: string;
  let key: string;
  let solution: number;
  class Popup {
    constructor(option: {
      closeOnClick?: boolean,
      closeButton?: boolean,
      offset?: number[],
      minWidth?: string,
      maxWidth?: string,
    })
    setLngLat(data:any): Popup;
    setDOMContent(el:any): Popup;
    addTo(map: Map): Popup;
    remove(): void;
    addClassName(className: string): void;
  }

  class Marker {
    constructor(el: HTMLDivElement, option: {
      offset?: number[],
      color?: string,
    })
    setLngLat(data:any): void;
    addTo(map: Map): void;
    isDraggable(): boolean;
    setPopup(): Marker;
    togglePopup(): void;
    remove(): void;
  }

  class Map {
    constructor(option: {
      container: string,
      preserveDrawingBuffer: boolean,
      style: string,
      center: [number, number],
      zoom: number,
      pitch: number,
      maxZoom: number,
      minZoom: number,
      projection: string;
      logoControl: boolean;
      doubleClickZoom: boolean;
    });


    on(eventName: string, callback: (e: any) => void): void;
    off(eventName: string, callback: (e: any) => void): void;
    remove(): void;

    // 图层相关
    addSource(id: string, option: MapSource): void;
    getSource(id: string): any;
    removeSource(id: string): void;
    addLayer(option: MapLayer): void;
    getLayer(id: string): any;
    removeLayer(id: string): void;

    /**
     * 将 downLayerId 图层移动到 upLayerId 下面, 如果不传 upLayerId, 那么 downLayerId 将被放到图层数组的末尾，即最高。
     * @param downLayerId
     * @param upLayerId
     */
    moveLayer(downLayerId: string, upLayerId?: string): void;
    /**
     * 获取地图层级
      */
    getZoom(): number;
    setZoom(zoom: number): void;
    zoomTo(zoom: number, options?: { duration: number; easing: () => number; offset: number[], animate: boolean }, eventData?: any): void;
    getCenter(): { lng: number, lat: number };
    setFilter(layerId: string, condition: (string | number)[] | null): void;
    setLayoutProperty(layerId: string, name: string, value: any, options?: any): void;
    getLayoutProperty(layerId: string, name: string): any;

    // 工具相关
    panTo(coordinate: number[]): void;

    queryRenderedFeatures(point?: number[], options?: {
      layers?: string[],
      filter?: any[],
      validate?: boolean,
    }): GeoJSON.Feature[];

    queryRenderedFeatures(options?: {
      layers?: string[],
      filter?: any[],
      validate?: boolean,
    }): GeoJSON.Feature[];

    // 资源相关
    loadImage(url: string, cb: (error: any, image: any) => void): void;
    getCanvas(): any;
    hasImage(url:any): boolean;
    addImage(name: string, image: any, option?: any): void;

    triggerRepaint(): void;

    fitBounds(bound: any, option: any): void;

    easeTo(param: { center: number[]; zoom: number }): void;
  }


  class Template {

    static create(option1: { type: string; map: any }): any;
  }

}
