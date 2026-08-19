# v1 → v2 迁移指南

本文梳理 `@rainroad/map-tools`(v1)迁移到 `@ym/map-tools`(v2)的全部破坏性变更与对应新写法。

## 对照表

### import 路径

| 场景 | v1 写法 | v2 写法 |
| --- | --- | --- |
| 包名 | `@rainroad/map-tools` | `@ym/map-tools`(私仓 `http://192.168.3.180:4873`) |
| 核心函数(框架无关) | `import { setSourceData } from "@rainroad/map-tools"` | `import { setSourceData } from "@ym/map-tools"` |
| Vue 3 的 useMap / getPopupDom | `import { useMap } from "@rainroad/map-tools"` | `import { useMap, getPopupDom } from "@ym/map-tools/vue3"` |
| Vue 2(2.7+) | `import { useMap } from "@rainroad/map-tools"` | `import { useMap } from "@ym/map-tools/vue2"` |
| React(18+) | `import { useMap } from "@rainroad/map-tools"` | `import { useMap } from "@ym/map-tools/react"` |

**主入口不再导出 `useMap` / 框架版 `getPopupDom`**,框架 Hook 全部走子路径。

### CDN URL

| 来源 | v1 | v2 |
| --- | --- | --- |
| unpkg | v1 地址 | `https://unpkg.com/@ym/map-tools@2.0.1/dist/umd/index.umd.js` |
| jsdelivr | v1 地址 | `https://cdn.jsdelivr.net/npm/@ym/map-tools@2.0.1/dist/umd/index.umd.js` |
| 私仓 | — | 私仓无公网 CDN,需自托管 `dist/umd/index.umd.js`(见 [原生 HTML 接入](/guide/html)) |

### peer 依赖安装

v2 将 `vue` / `react` / `react-dom` 全部设为可选 peerDependencies,不装未用框架不报错。按所用框架安装:

```bash
# Vue 3 项目
pnpm add vue

# Vue 2 项目(2.7+)
pnpm add vue@2.7

# React 项目(18+)
pnpm add react react-dom
```

## getPopupDom 语义变化(重要警示)

::: warning 主入口 getPopupDom 语义已变化

- **v1**:主入口的 `getPopupDom` 是 **Vue 组件挂载版**(传组件渲染)。
- **v2**:主入口(`@ym/map-tools`)的 `getPopupDom` 是 **纯 DOM 版**:
  - `string` 内容按 HTML 解析(`innerHTML`),传入不可信内容前必须自行转义(存在 XSS 风险);
  - `HTMLElement` 直接 append 进容器;
  - 框架组件挂载版由各子路径导出(`@ym/map-tools/vue3` / `vue2` / `react` 的 `getPopupDom`)。

:::

## skipLibCheck 建议

`@turf/turf@6` 的类型与新版 TypeScript 解析存在兼容问题,消费者项目建议在 `tsconfig.json` 开启:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## 浏览器兼容声明

| 浏览器 | 最低版本 |
| --- | --- |
| Chrome / Edge | 107+ |
| Firefox | 104+ |
| Safari | 16+ |

- **不支持 IE**(及任何 IE 兼容模式)。
- 老打包器(不支持 package.json `exports` 字段)会自动回退到 CJS 入口(`dist/index.cjs`),无需额外配置。

## 其他破坏性变更

- `getLineEndpoint` 在 v2 已彻底移除,改用 `getLineStringEndpoint`。
- `hiddenLayer` / `hiddenLayers` 已弃用,改用 `hideLayer` / `hideLayers`。
- minemap SDK CDN 统一使用 **v3.0.0**:`https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js`(CSS 同目录 `minemap.css`)。
