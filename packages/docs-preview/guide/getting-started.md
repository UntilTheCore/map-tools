# 快速开始

## 安装与私仓配置

`@ym/map-tools` 发布在公司 Verdaccio 私仓 `http://192.168.3.180:4873`，安装前需要让包管理器知道 `@ym` scope 指向私仓。

### 方式一：项目 .npmrc 配置（推荐）

在项目根目录创建或追加 `.npmrc`：

```ini
@ym:registry=http://192.168.3.180:4873/
```

然后正常安装：

```bash
pnpm add @ym/map-tools
```

### 方式二：命令行指定 registry

```bash
pnpm add @ym/map-tools --registry http://192.168.3.180:4873/
```

### 说明

- 本 monorepo 内（`packages/*`）通过 `workspace:*` 引用 `@ym/map-tools`，走本地链接、不访问私仓。
- 若私仓不可达，安装会失败；请确认网络可达 `192.168.3.180:4873`（可先用浏览器打开 `http://192.168.3.180:4873` 验证）。

### 浏览器最低版本

- Chrome / Edge 107+
- Firefox 104+
- Safari 16+
- **不支持 IE**（及任何 IE 兼容模式）；老打包器（不支持 package.json `exports` 字段）会自动回退到 CJS 入口 `dist/index.cjs`。

### skipLibCheck 提示

`@turf/turf@6` 的类型与新版 TypeScript 解析存在兼容问题，建议在 `tsconfig.json` 开启 `skipLibCheck: true`，规避第三方类型解析报错。

## 前置依赖：minemap SDK

元图科技（Minedata）的 minemap SDK 没有 npm 包，页面中需通过 CDN 动态加载：

```html
<link rel="stylesheet" href="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.css" />
<script src="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js"></script>
```

加载完成后全局可用 `minemap` 对象。更推荐使用示例中心内置的 `loadMinemap` 加载器（支持主/备 CDN 自动切换、promise 化、失败提示）。

## 四种接入方式

| 接入方式 | 入口 | 适用场景 |
| --- | --- | --- |
| [核心（core）](/guide/core) | `import { ... } from "@ym/map-tools"` | 任意框架 / 无框架环境，纯函数调用 |
| [Vue 3](/guide/vue3) | `import { useMap, getPopupDom } from "@ym/map-tools/vue3"` | Vue 3 项目（组件挂载、响应式） |
| [Vue 2](/guide/vue2) | `import { useMap, getPopupDom } from "@ym/map-tools/vue2"` | Vue 2.7 项目（基于 vue-demi） |
| [React](/guide/react) | `import { useMap, getPopupDom } from "@ym/map-tools/react"` | React 项目（Hook、React 元素挂载） |
| [原生 HTML](/guide/html) | `<script src=".../fe-utils.umd.js">` + 全局 `FE_utils` | 无构建工具的传统页面 |

## 快速示例

```ts
import { destroyMap, setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";

const sourceId = setSourceIdName("demo", "district"); // "demo-district-source"
const layerId = setLayerIdName("demo", "district");   // "demo-district-layer"

map.on("load", () => {
  setSourceData(map, sourceId, {
    id: layerId,
    type: "fill",
    source: sourceId,
    paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
  }, geojson);
});

// 销毁
destroyMap(map);
```

更多交互式演示请访问 [示例中心](/examples-center/)。
