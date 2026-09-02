---
layout: home

hero:
  name: "@ym/map-tools"
  text: minemap 地图工具库
  tagline: v3 领域化核心、显式 SDK 类型入口、Vue 2/3、React 与 UMD Script 支持
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
  - icon: "R"
    title: 资源生命周期
    details: 使用 upsertGeoJSONSource、replaceVectorSource 和 removeResources 明确管理 source 与 layer。
    link: /api/resources
    linkText: 查看资源 API
  - icon: "T"
    title: 显式类型
    details: 模块类型从根入口导入；CDN minemap 与 UMD FE_utils 通过独立类型入口按需启用。
    link: /api/overview
    linkText: 查看类型入口
  - icon: "V"
    title: 统一视野与查询
    details: fitToFeatures、fitToGeometry、fitToRenderedLayer 和 queryRenderedFeatures 使用一致的返回与错误契约。
    link: /api/viewport
    linkText: 查看视野 API
  - icon: "P"
    title: 可释放 Popup
    details: createPopupDom 返回 element 与 dispose 句柄，Vue 与 React 组件挂载拥有明确清理时机。
    link: /api/popup
    linkText: 查看 Popup API
---

## 一分钟上手

```ts
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";

const sourceId = createSourceId("demo", "district");
const layerId = createLayerId("demo", "district");

upsertGeoJSONSource(map, { id: sourceId, data: geojson });
ensureLayers(map, [{ id: layerId, type: "fill", source: sourceId }]);
```

- [安装与 SDK 类型](/guide/getting-started)
- [v2 → v3 迁移表](/guide/migration)
- [8 个示例的四框架实现](/examples-center/)
