# map-tools-monorepo

地图工具函数 monorepo(pnpm workspace)。

## 环境要求

- **Node.js 24+**（Vite 8 构建链）
- **pnpm 11**（根 package.json `packageManager: pnpm@11.15.1`，启用 corepack 时自动对齐；不启用时请手动安装 pnpm 11.x）
- 私仓：Verdaccio `http://192.168.3.180:4873`（根 .npmrc 已把 `@ym` scope 指向该地址）

## 包

- `packages/map-tools`(@ym/map-tools):基于 @turf/turf 的地图工具库,提供 minemap(Minedata)SDK 的通用操作函数,支持 Vue 2/3 与 React 适配器。

## 常用命令

```bash
pnpm install          # 安装全部依赖
pnpm build            # 构建 @ym/map-tools
pnpm build:all        # 构建全部包(含 docs-preview)
pnpm dev:docs         # 启动文档站点(首次运行前需先 pnpm build)
pnpm typecheck        # 全包类型检查
```

## v1 → v2 迁移要点

v2 相对 v1(@rainroad/map-tools)有以下破坏性变更:

| 项 | v1 | v2 |
| --- | --- | --- |
| 包名 | `@rainroad/map-tools` | `@ym/map-tools`(私仓 `http://192.168.3.180:4873`) |
| useMap / getPopupDom(框架版) | 主入口直接导出 | 改为子路径 `@ym/map-tools/vue3`、`@ym/map-tools/vue2`、`@ym/map-tools/react` |
| 主入口 `getPopupDom` 语义 | Vue 组件挂载版 | 纯 DOM 版(string 走 innerHTML / HTMLElement 直接 append);框架挂载版由各子路径导出 |
| CDN URL | v1 地址 | `https://unpkg.com/@ym/map-tools@2.0.1/dist/umd/index.umd.js`(或 jsdelivr:`https://cdn.jsdelivr.net/npm/@ym/map-tools@2.0.1/dist/umd/index.umd.js`);私仓环境需自托管 `dist/umd/index.umd.js` |

浏览器最低版本声明:

- Chrome / Edge 107+
- Firefox 104+
- Safari 16+
- **不支持 IE**

老打包器(不支持 package.json `exports` 字段)会自动回退到 CJS 入口(`main`: `dist/index.cjs`),无需额外配置。

更多迁移细节见文档站 [v1 → v2 迁移指南](packages/docs-preview/guide/migration.md)。
