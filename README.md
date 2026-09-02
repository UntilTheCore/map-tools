# map-tools-monorepo

pnpm monorepo，核心包为 `@ym/map-tools` v3：基于 `@turf/turf` 与 CDN 注入的 minemap v3.0.0 SDK，提供框架无关地图工具、Vue 2/3 与 React 适配器，以及 UMD `FE_utils`。

## 常用命令

```bash
pnpm install
pnpm --filter @ym/map-tools typecheck
pnpm --filter @ym/map-tools typecheck:types
pnpm --filter @ym/map-tools build
pnpm --filter docs-preview build:demos
pnpm build:all
```

## v3 重点

- 核心按 `resources`、`layers`、`query`、`viewport`、`geometry`、`overlays`、`popup` 划分。
- minemap 不进入运行时依赖；CDN Script 用户通过 `@ym/map-tools/minemap` 显式启用补充类型。
- UMD 保持全局名 `FE_utils` 和路径 `dist/umd/index.umd.js`；类型入口为 `@ym/map-tools/umd`。
- Vue/React `useMap` 使用 `mapRef`、`setMap`、`on`、`off`、`unbindAll`。
- Popup API 返回 `{ element, dispose() }` 生命周期句柄。

详细使用方式见 [文档站源码](packages/docs-preview)。
