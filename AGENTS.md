# AGENTS.md

> 本文件面向在此仓库工作的 AI 编程代理。开始任何修改前请先通读全文，所有命令与约定均以仓库实际文件为准。

## 1. 项目概述

pnpm monorepo，核心产物为 **@ym/map-tools**——基于 `@turf/turf` 与 minemap（元图科技 Minedata）JS SDK 的地图工具库，支持 Vue 2/3、React、原生 HTML（UMD）多框架接入，配套 VitePress 文档站与示例中心，以及 Qoder Agent 技能包。

```
map-tools/                            # map-tools-monorepo（private，packageManager: pnpm@11.15.1）
├── pnpm-workspace.yaml               # packages: ['packages/*']；allowBuilds: esbuild / vue-demi
├── .npmrc                            # @ym:registry=http://192.168.3.180:4873/
├── package.json                      # 根脚本：build / build:all / dev:docs / typecheck
├── tsconfig.base.json
└── packages/
    ├── map-tools/                    # @ym/map-tools v2.0.1，插件工具库（Vite 库模式）
    ├── skills/                       # map-tools-skills（Qoder 技能包，private）
    └── docs-preview/                 # VitePress 1.x 文档站 + 四框架示例中心（private）
```

> 注：根级 `src/`、`lib/` 为历史同步产物，已删除（不再存在）；源码只认 `packages/` 下的文件。

| 子项目 | 包名 | 版本 | 职责 |
| --- | --- | --- | --- |
| packages/map-tools | @ym/map-tools | 2.0.1 | 核心地图工具库，作者 ly，发布至 Verdaccio 私仓 |
| packages/skills | map-tools-skills | 0.1.0 | Qoder 技能包，`packages/skills/map-tools/SKILL.md`（frontmatter name: map-tools） |
| packages/docs-preview | docs-preview | 1.0.0 | VitePress 文档站 + 示例中心（vue3/vue2/react/html 四框架 Tab、iframe 预览、源码面板） |

## 2. 环境要求

- **Node.js 24+**（Vite 8 构建链）
- **pnpm 11**（根 package.json `packageManager: pnpm@11.15.1`，启用 corepack 时自动对齐；不启用时请手动安装 pnpm 11.x）
- **私仓**：Verdaccio `http://192.168.3.180:4873`（根 .npmrc 已把 `@ym` scope 指向该地址）
- **Windows 注意事项**：
  - 默认 shell 为 cmd，命令书写避免 POSIX 专属语法；`&&` 可用，不要依赖 `;`、反引号等
  - 路径分隔符差异：跨目录复制、路径拼接一律使用 Node 脚本 + `node:path`（参照 [copy-umd.mjs](packages/docs-preview/scripts/copy-umd.mjs)），禁止写死反斜杠
  - 根级 `src/`、`lib/` 已删除（历史产物）；`packages/*/dist`、`public/demos` 等为构建产物，修改源码请只进入 `packages/` 对应子项目

## 3. 常用命令

以下命令均在**仓库根目录**执行（`pnpm --filter` 免去 cd 切换）：

**安装**
```bash
pnpm install
```

**构建**
```bash
pnpm build                              # 仅构建 @ym/map-tools（= pnpm --filter @ym/map-tools build）
pnpm --filter @ym/map-tools build       # 产出 dist/（es+cjs 四入口）+ dist/umd/index.umd.js + dist/types
pnpm --filter docs-preview build:demos  # 复制 UMD 并构建四框架 demos → public/demos/
pnpm build:all                          # map-tools build + docs-preview build（发布前全量校验）
```

**类型检查**
```bash
pnpm typecheck                          # 递归执行 pnpm -r typecheck
pnpm --filter @ym/map-tools typecheck   # 单包 tsc --noEmit
```

**文档开发**
```bash
pnpm dev:docs                           # = pnpm --filter docs-preview dev，端口 5173（含 demos 预构建）
pnpm --filter docs-preview build        # demos + vitepress build
pnpm --filter docs-preview preview      # vitepress preview
```

> **首次运行 `pnpm dev:docs` 前需先 `pnpm build`**（或至少构建 `@ym/map-tools`）：docs-preview 的 `copy-umd` 脚本依赖 `@ym/map-tools` 的 `dist/umd` 产物，未构建时 demos 预构建会失败。

**发布**
```bash
# 首次发布前登录私仓：
npm login --registry http://192.168.3.180:4873

# 在 packages/map-tools 目录内发布：
pnpm publish:pkg    # = pnpm publish --registry http://192.168.3.180:4873 --no-git-checks
                    # prepublishOnly 自动触发 pnpm build
```

## 4. 架构与技术约定

### 4.1 工具包目录结构（packages/map-tools）

```
src/
├── index.ts              # 主入口 → export * from "./core"（框架无关）
├── core/                 # 框架无关核心，禁止引入任何框架依赖
│   ├── mapTool.ts        # 地图实例/视野/事件派发
│   ├── layerTool.ts      # 图层增删/显隐（hiddenLayer/hiddenLayers 已 @deprecated）
│   ├── sourceTools.ts    # GeoJSON/PBF 数据源
│   ├── pointTool.ts / lineTool.ts / polygonTool.ts
│   ├── popupTool.ts      # 弹窗核心（挂载注入模式，见 4.4）
│   └── types.ts
├── vue/                  # vue-demi 实现（vue2 与 vue3 共用）：useMap.ts + popup.ts
├── vue2/index.ts         # 薄壳入口：export * from "../vue"
├── vue3/index.ts         # 薄壳入口：export * from "../vue"
├── react/                # useMap.ts（React Hook）+ popup.ts（createRoot 挂载）
└── types/minemap.d.ts    # minemap SDK 本地类型声明（全局）
```

### 4.2 四入口与 exports 子路径

| 导入路径 | 说明 |
| --- | --- |
| `@ym/map-tools` | 框架无关核心（全部 core API） |
| `@ym/map-tools/vue2` | Vue 2（2.7+）适配，导出 `getPopupDom`、`useMap` |
| `@ym/map-tools/vue3` | Vue 3 适配，与 vue2 共用同一套 vue-demi 实现 |
| `@ym/map-tools/react` | React 18+ 适配，导出 `getPopupDom`、`useMap` |
| `@ym/map-tools/umd` | UMD 产物 `dist/umd/index.umd.js`，全局名 `FE_utils` |

- `exports` 各子路径（`.` / `vue2` / `vue3` / `react`）均声明 `types` / `import` / `require` 三条件分支；`./umd` 为单字符串，直连 `dist/umd/index.umd.js`
- `main`/`module`/`unpkg`/`jsdelivr` 字段已配置，`files` 仅发布 `dist`

### 4.3 vue-demi 机制

- `src/vue2/index.ts` 与 `src/vue3/index.ts` 是内容相同的薄壳，均 `export * from "../vue"`
- 实际行为差异完全由 **vue-demi** 决定：消费者安装 vue2（>=2.7）时 vue-demi 切至 v2.7 实现，安装 vue3 时切至 v3 实现
- vue-demi 是 `dependencies` 且在构建中**必须 external**（消费者侧自动切换）
- 兼容范围：Vue 2.7+；React 18+；`peerDependencies`（vue / react / react-dom）**全部 optional**，不装未用框架不报错

### 4.4 popup 挂载注入模式

- [core/popupTool.ts](packages/map-tools/src/core/popupTool.ts) 提供框架无关的 `getPopupDom(element, opts, renderer)`，接收注入的渲染回调
- 框架适配层传入 renderer：
  - vue 版：经 vue-demi 渲染组件至容器
  - react 版：`createRoot(container).render(el)`（见 [react/popup.ts](packages/map-tools/src/react/popup.ts)）
- 新增框架适配时复用该注入模式，不要在 core 中引入框架代码

### 4.5 UMD 构建

- 独立配置 [vite.umd.config.ts](packages/map-tools/vite.umd.config.ts)：entry `src/index.ts`、全局名 `FE_utils`、`formats: ['umd']`、自包含（`external: []`）、`minify: true`（esbuild 压缩）
- 输出 `dist/umd/index.umd.js`（约 58KB，gzip 后约 15KB），同时由 `umdCommonjsFlag` 插件产出 `dist/umd/package.json`（`{"type":"commonjs"}`），保证 `require` 走 CommonJS 分支

### 4.6 类型生成

- 主构建 [vite.config.ts](packages/map-tools/vite.config.ts)：四入口（index/vue2/vue3/react），es + cjs 输出至 `dist/`
- `external`：`vue`、`vue-demi`、`react`、`react-dom`（含子路径）；`@turf/turf` 保持**内联**，不得加入 external
- `vite-plugin-dts` 产出类型至 `dist/types`；构建后处理 `prependMinemapReference` 会向 index/core/vue/vue2/vue3/react 各 d.ts 顶部补 `/// <reference path=".../minemap.d.ts" />`（ts-morph 打印时不保留三斜线 reference，须事后补齐）
- 消费者无需安装任何 minemap 类型包

### 4.7 minemap 外部依赖约定

- minemap（Minedata）SDK **无 npm 包**，运行时经 CDN 动态加载：
  - JS 主 CDN（实测 200）：`https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js`
  - JS 备 CDN（实测 200，内容相同）：`https://minedata.cn/minemapapi/v3.0.0/minemap.js`
  - CSS：`https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.css`
- 类型由本地声明 [src/types/minemap.d.ts](packages/map-tools/src/types/minemap.d.ts) 提供：`declare namespace minemap`（Map/Popup/Marker/Template 等）+ 全局 `declare type`（MapSource / MapLayer / LayerType）
- docs-preview 示例中心使用 [examples/src/shared/loadMinemap.ts](packages/docs-preview/examples/src/shared/loadMinemap.ts) 动态加载器（主/备 CDN 自动切换、promise 化；token 获取顺序：URL `?token=` → localStorage `MINEMAP_TOKEN`）

### 4.8 docs-preview 示例中心

- VitePress 1.x；四框架 Tab（vue3/vue2/react/html）+ iframe 预览 + 源码面板
- `examples/` 使用**双 Vite 配置**构建：
  - [vite.demos.config.ts](packages/docs-preview/examples/vite.demos.config.ts)：三入口 vue3.html / react.html / plain.html → `../public/demos`（`base: './'`，`emptyOutDir: true`，publicDir 为 examples/public）
  - [vite.demos.vue2.config.ts](packages/docs-preview/examples/vite.demos.vue2.config.ts)：仅 vue2.html（`emptyOutDir: false` 避免覆盖主构建产物）；alias `vue → vue2`（`npm:vue@2.7.16` 别名包）、`vue-demi → vue-demi/lib/v2.7/index.mjs`
- 示例注册表 [examples/src/registry.ts](packages/docs-preview/examples/src/registry.ts)：`registry`（id → ExampleMeta{title, description, apis}）+ `exampleOrder` + `getExampleMeta`
- 四框架实现放 `examples/src/{vue3,vue2,react,html}/{id}.ts`，统一导出 `render(container, options) => 清理函数`；四个入口文件位于 `examples/src/entries/`
- [scripts/copy-umd.mjs](packages/docs-preview/scripts/copy-umd.mjs)：将 UMD 产物复制为 `examples/public/vendor/fe-utils.umd.js`，供 plain.html 通过 `<script>` 加载全局 `FE_utils`

## 5. 开发流程（改一处，同步多处）

修改 core 后按以下链路逐层同步：

1. **改 core**：功能只在 `src/core/` 实现，保持框架无关；禁止引入 vue/react 依赖
2. **更新适配器**：涉及 DOM/组件挂载/事件/生命周期时，同步 `src/vue/` 与 `src/react/`
3. **补 docs-preview 示例**：每个新能力至少提供四框架变体（`examples/src/{vue3,vue2,react,html}/{id}.ts`），并在 `examples/src/registry.ts` 注册（补充 `apis` 关键词，同时更新 `exampleOrder` 如有展示顺序要求）
4. **同步 skills 与文档**：更新 `packages/skills/map-tools/SKILL.md` 及 docs-preview 的 guide/api 文档
5. **构建校验**（顺序执行）：
   ```bash
   pnpm --filter @ym/map-tools typecheck
   pnpm --filter @ym/map-tools build
   pnpm --filter docs-preview build:demos    # 确认 UMD 复制与四框架构建通过
   pnpm build:all                            # 发布前全量校验
   ```
6. **发布**：见第 6 节

## 6. 发布流程

1. 确认改动已通过第 5 节全部构建校验
2. 首次发布前登录私仓：`npm login --registry http://192.168.3.180:4873`
3. 更新 `packages/map-tools/package.json` 的 `version`
4. 在 `packages/map-tools` 目录执行 `pnpm publish:pkg`（`prepublishOnly` 自动执行 `pnpm build`，`--no-git-checks` 允许工作区未提交状态发布）
5. 版本策略：
   - 破坏性变更（移除/修改 API 签名，如已移除的 `getLineEndpoint`）→ 升级 **major**
   - 新增能力 → **minor**；修复/文档 → **patch**
   - 弃用 API 先标 `@deprecated` 保留一版再移除（参考 `hiddenLayer`/`hiddenLayers` → `hideLayer`/`hideLayers`）

## 7. 注意事项与禁忌

- **禁改 UMD 全局名 `FE_utils`**（[vite.umd.config.ts](packages/map-tools/vite.umd.config.ts) 中 `lib.name`）；docs-preview、技能文档与下游用户均依赖该全局名
- **禁止在库源码（packages/map-tools/src）使用 .vue SFC**：一律使用渲染函数（vue-demi）/ createElement
- **minemap 类型必须保持全局声明**（`declare namespace minemap` + 全局 `declare type`），勿改为模块导出，否则消费者类型解析失效
- **双构建配置勿合并**：vue2 demos 需要独立 alias（vue → vue2、vue-demi → v2.7 实现），合并单配置会导致 vue-demi 版本冲突
- **勿删 `pnpm-workspace.yaml` 的 `allowBuilds`**（esbuild、vue-demi 依赖构建脚本权限）
- **external 边界**：`@turf/turf` 必须内联；`vue`/`vue-demi`/`react`/`react-dom` 必须 external（vue-demi external 是 vue2/vue3 自动切换的前提）
- **vue2/vue3 子路径入口保持薄壳**（仅 `export * from "../vue"`），勿写入差异化逻辑
- **Windows 下跨目录复制一律用 Node 脚本**（`node:path`），参照 copy-umd.mjs；勿用 shell 的 `cp`/`copy` 硬编码路径
- **勿删/勿改根 .npmrc 的 `@ym` scope 指向**（私仓 `http://192.168.3.180:4873/`）
- **peerDependencies（vue/react/react-dom）保持 optional**，避免强制消费者安装未用框架
- 根目录 `src/`、`lib/` 为历史同步产物，源码修改只认 `packages/` 下的文件
- 发布使用 `publish:pkg`（含 `--no-git-checks`），不要绕开 `prepublishOnly` 的自动构建
