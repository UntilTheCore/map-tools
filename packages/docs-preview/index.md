---
layout: home

hero:
  name: "@ym/map-tools"
  text: minemap 地图开发工具库
  tagline: 基于元图科技 Minedata SDK 的通用工具集，四框架兼容、类型完备、UMD 可用
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 示例中心
      link: /examples-center/
    - theme: alt
      text: API 参考
      link: /api/overview

features:
  - icon: 🧩
    title: 四框架兼容
    details: 同一套核心 API，提供 Vue 2.7 / Vue 3 / React 框架适配（useMap、getPopupDom 组件挂载）与原生 HTML（UMD 全局 FE_utils）四种接入方式。
    link: /guide/core
    linkText: 查看接入方式
  - icon: 📐
    title: 类型完备
    details: 全量 TypeScript 编写并导出 d.ts，minemap 全局类型本地声明，函数签名、参数、返回值全部类型化，编辑器智能提示开箱即用。
    link: /api/overview
    linkText: 查看 API 文档
  - icon: 📦
    title: UMD 可用
    details: 提供 UMD 产物（全局名 FE_utils），原生 HTML 页面通过 &lt;script&gt; 标签即可使用全部核心能力，无需构建工具。
    link: /guide/html
    linkText: 查看 UMD 用法
  - icon: 🗺️
    title: 图层与要素
    details: setSourceData / setPbfSourceData 数据注入，showLayer / hideLayer / toggleLayer 显隐控制，getPbfFeatureListSync / Async 要素读取，checkSourceLoaded 就绪轮询。
    link: /api/sourceTools
    linkText: 查看 API
  - icon: 🎯
    title: 视野与几何
    details: moveAndZoom / setViewPort / setViewPortByPolygon 视野控制；方位角、交点、坐标校验、顶点提取等纯几何计算工具。
    link: /api/mapTool
    linkText: 查看 API
  - icon: 💬
    title: 弹窗与清理
    details: getPopupDom 支持字符串 / DOM / 框架组件挂载；removeMarkers / removeMarkersOrPopups 批量清理覆盖物，销毁地图一键 destroyMap。
    link: /api/popupTool
    linkText: 查看 API
---

## 快速链接

- [安装与私仓配置](/guide/getting-started) — `.npmrc` 指向私仓 `http://192.168.3.180:4873`
- [示例中心](/examples-center/) — 8 个示例 × 4 种框架变体，iframe 实时预览 + 源码查看
- [API 总览](/api/overview) — 全部导出函数清单与模块索引

## 安装

```bash
# 项目根 .npmrc 添加私仓 scope
echo "@ym:registry=http://192.168.3.180:4873/" >> .npmrc
# 或安装时指定
pnpm add @ym/map-tools --registry http://192.168.3.180:4873/

# 安装
pnpm add @ym/map-tools
```

## 一分钟上手（核心版）

```ts
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";

// minemap SDK 需通过 CDN 加载（无 npm 包），示例中心已内置加载器
const map = new minemap.Map({ container: "map", style: "https://service.minedata.cn/map/solu/style/11003" });

map.on("load", () => {
  const sourceId = setSourceIdName("demo", "district");
  const layerId = setLayerIdName("demo", "district");
  setSourceData(
    map,
    sourceId,
    {
      id: layerId,
      type: "fill",
      source: sourceId,
      paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
    },
    {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "核心区" },
          geometry: { type: "Polygon", coordinates: [[[116.35, 39.88], [116.42, 39.88], [116.42, 39.93], [116.35, 39.93], [116.35, 39.88]]] },
        },
      ],
    }
  );
});
```
