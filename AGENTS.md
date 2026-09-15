# AGENTS.md

> 本文件面向在此仓库工作的 AI 编程代理。开始任何修改前请先通读全文，所有命令与约定均以仓库实际文件为准。

## 1. 项目概述

pnpm monorepo，核心产物为 **@ym/map-tools**——基于 `@turf/turf` 与 JS SDK 的地图工具库，支持 Vue 2/3、React、原生 HTML（UMD）多框架接入，配套 VitePress 文档站与示例实验室，以及技能包。

```
map-tools/                            # map-tools-monorepo（private，packageManager: pnpm@11.15.1）
├── pnpm-workspace.yaml               # packages: ['packages/*']；allowBuilds: esbuild
├── .npmrc                            # @ym:registry=http://192.168.3.180:4873/
├── package.json                      # 根脚本：build / build:all / dev:docs / typecheck
├── docs/adr/                         # 架构决策记录（0001：minemap 类型独立成包）
├── tsconfig.base.json
└── packages/
    ├── map-tools/                    # @ym/map-tools v3.2.0，插件工具库（Vite 库模式）
    ├── minemap-types/                # @ym/minemap-types v0.1.0，minemap SDK 全局类型 + Web 服务 API 类型（纯 .d.ts，无构建）
    ├── skills/                       # 技能包（含 minemap-jsapi-skill 技能族：2d-api / 2d-util / edit / lbs / service）
    └── docs-preview/                 # VitePress 1.x 文档站 + 示例实验室（private）
```

> 注：根级 `src/`、`lib/` 为历史同步产物，已删除（不再存在）；源码只认 `packages/` 下的文件。

| 子项目                 | 包名              | 版本  | 职责                                                                                                          |
| ---------------------- | ----------------- | ----- | ------------------------------------------------------------------------------------------------------------- |
| packages/map-tools     | @ym/map-tools     | 3.2.0 | 核心地图工具库，作者 ly，发布至 Verdaccio 私仓                                                                |
| packages/minemap-types | @ym/minemap-types | 0.1.0 | minemap SDK / minemaputil / minemap.edit 全局类型声明 + Web 服务 API 类型（`/service` 子路径）（见 ADR 0001） |
| packages/skills        | map-tools-skills  | 0.1.0 | `packages/skills/map-tools/SKILL.md`（frontmatter name: map-tools）                                           |
| packages/docs-preview  | docs-preview      | 1.0.0 | VitePress 文档站 + 示例实验室（naive-ui 布局、CodeMirror 可编辑源码、runner iframe 即时运行）                 |

## 2. 环境要求

- **Node.js 24+**（Vite 8 构建链）
- **pnpm 11**（根 package.json `packageManager: pnpm@11.15.1`，启用 corepack 时自动对齐；不启用时请手动安装 pnpm 11.x）
- **私仓**：Verdaccio `http://192.168.3.180:4873`（根 .npmrc 已把 `@ym` scope 指向该地址）
- **Windows 注意事项**：
  - 默认 shell 为 cmd，命令书写避免 POSIX 专属语法；`&&` 可用，不要依赖 `;`、反引号等
  - 路径分隔符差异：跨目录复制、路径拼接一律使用 Node 脚本 + `node:path`，禁止写死反斜杠
  - 根级 `src/`、`lib/` 已删除（历史产物）；`packages/*/dist`、`public/demos`、`public/runner/vendor` 等为构建产物，修改源码请只进入 `packages/` 对应子项目

## 3. 常用命令

以下命令均在**仓库根目录**执行（`pnpm --filter` 免去 cd 切换）：

**安装**

```bash
pnpm install
```

**构建**

```bash
pnpm build                              # 仅构建 @ym/map-tools（= pnpm --filter @ym/map-tools build）
pnpm --filter @ym/map-tools build       # 产出 dist/（es+cjs 多入口）+ dist/umd/index.umd.js + dist/types
pnpm --filter docs-preview build:runner-vendor  # esbuild 预打包运行时 vendor → public/runner/vendor/
pnpm build:all                          # map-tools build + docs-preview build（发布前全量校验）
```

**类型检查**

```bash
pnpm typecheck                          # 递归执行 pnpm -r typecheck（含 map-tools 与 minemap-types）
pnpm --filter @ym/map-tools typecheck   # 单包 tsc --noEmit
pnpm --filter @ym/minemap-types typecheck  # 类型包自身 + test/consumer 冒烟（tsc --noEmit）
pnpm --filter @ym/map-tools typecheck:types  # build 后跑 type-tests 四组（含直接消费 @ym/minemap-types、no-global 回归）
```

**Lint 与格式化**

```bash
pnpm lint                               # oxlint（correctness+suspicious=error，style=warn）
pnpm lint:fix                           # oxlint 自动修复
pnpm format                             # prettier 全仓格式化（含 ts/tsx/vue/md/json/css/html）
pnpm format:check                       # 仅校验格式，不写入
```

- 配置文件：[.oxlintrc.json](.oxlintrc.json)、[.prettierrc.json](.prettierrc.json)、[.prettierignore](.prettierignore)、[.editorconfig](.editorconfig)
- 代码风格统一为**双引号 + 分号 + 2 空格缩进，printWidth 100**（与 prettier 配置一致，勿手动改回单引号）
- pre-commit 钩子（husky + lint-staged）：提交时自动对**暂存文件**执行 `oxlint --fix` + `prettier --write`，oxlint error 未清零会阻断提交；钩子由根 package.json 的 `prepare: husky` 在 `pnpm install` 后自动启用（`git config core.hooksPath` → `.husky/_`）
- 提交信息规范（commit-msg 钩子 + commitlint）：遵循 [Vue COMMIT_CONVENTION](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md)——格式 `<type>(<scope>?): <subject>`，type 限 `feat/fix/polish/docs/style/refactor/perf/test/workflow/ci/chore/types`，header ≤ 50 字符，subject 祈使句、首字母小写、无句号结尾，回滚用 `revert: <原标题>` 前缀；不合规提交会被拒绝，详见 README「提交信息规范」
- 提交前建议本地先跑 `pnpm lint && pnpm format:check`，避免钩子拦截

**文档开发**

```bash
pnpm dev:docs                           # = pnpm --filter docs-preview dev，端口 5173（含 runner vendor 预构建）
pnpm --filter docs-preview build        # runner vendor + vitepress build
pnpm --filter docs-preview preview      # vitepress preview
```

> 示例实验室运行时（runner vendor）与 `@ym/map-tools` 库源码相互独立：vendor 由 esbuild 打包 docs-preview 自身依赖（vue/react 等）生成，不再依赖 map-tools 的 UMD 产物。

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
├── vue/                  # Vue 共用实现（直接依赖 vue，Vue3 语义）：useMap.ts + popup.ts（Vue3 弹窗）+ track.ts（useTrackPlayer）
├── vue2/                 # Vue 2.7 入口：useMap/useTrackPlayer 复用 ../vue + 本目录 popup.ts（new Vue 挂载）
├── vue3/                 # Vue 3 入口：export * from "../vue"（useMap + Vue3 popup + useTrackPlayer）
├── react/                # useMap.ts / track.ts（React Hook）+ popup.ts（createRoot 挂载）
└── types/minemap.d.ts    # 薄入口：import type {} from "@ym/minemap-types"（SDK 声明已迁至独立包）
```

### 4.2 多入口与 exports 子路径

| 导入路径                | 说明                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ym/map-tools`         | 框架无关核心（全部 core API，含 Track 轨迹回放）                                                                                                |
| `@ym/map-tools/vue2`    | Vue 2.7+ 适配，导出 `createPopupDom`、`useMap`、`useTrackPlayer`（弹窗走 new Vue 挂载）                                                         |
| `@ym/map-tools/vue3`    | Vue 3 适配，导出 `createPopupDom`、`useMap`、`useTrackPlayer`（弹窗走原生 createApp）                                                           |
| `@ym/map-tools/react`   | React 18+ 适配，导出 `getPopupDom`、`useMap`、`useTrackPlayer`                                                                                  |
| `@ym/map-tools/track`   | 轨迹回放子路径（`createTrackPlayer`/`createPlaybackClock`/`createTrackFleet`）；chunk 图 **turf-free 且无框架依赖**，runner vendor 单独打包消费 |
| `@ym/map-tools/minemap` | 薄入口子路径，激活 `@ym/minemap-types` 的 SDK 全局声明（types-only，无运行时）                                                                  |
| `@ym/map-tools/umd`     | UMD 产物 `dist/umd/index.umd.js`，全局名 `FE_utils`                                                                                             |

- `exports` 各子路径（`.` / `vue2` / `vue3` / `react` / `track` 及资源域子路径）均声明 `types` / `import` / `require` 三条件分支；`./umd` 为单字符串，直连 `dist/umd/index.umd.js`
- `main`/`module`/`unpkg`/`jsdelivr` 字段已配置，`files` 仅发布 `dist`

### 4.3 Vue 2/3 适配机制

- 已移除 vue-demi（官方不再维护）。Vue 适配层**直接依赖消费者提供的 `vue`**，最低 Vue 2.7（原生组合式 API）
- `src/vue/useMap.ts` 用 Vue 2.7 与 Vue 3 签名一致的组合式 API（`shallowRef`/`markRaw`/`onUnmounted`/`Ref`），vue2、vue3 入口**共用**同一份实现
- 唯一差异点在弹窗挂载：`createApp` 是 Vue 3 专属，Vue 2.7 无原生 `createApp`，故
  - `src/vue/popup.ts`：Vue 3 版 `createPopupDom`，`createApp({ render }).mount()`
  - `src/vue2/popup.ts`：Vue 2.7 版 `createPopupDom`，`new Vue({ render }).$mount()` 后 `appendChild` 进容器（Vue2 `$mount` 替换而非写入容器，弹窗约定内容须放进返回的 `element`）
- `src/vue3/index.ts` 是 `export * from "../vue"` 薄壳；`src/vue2/index.ts` 复用 `../vue/useMap` + 本目录 `popup`，非纯薄壳
- 兼容范围：Vue 2.7+；React 18+；`peerDependencies`（vue / react / react-dom）**全部 optional**，不装未用框架不报错

### 4.4 popup 挂载注入模式

- [core/popup/dom.ts](packages/map-tools/src/core/popup/dom.ts) 提供框架无关的 `createPopupDom(content, mount)`，接收注入的挂载回调 `mount(container, content) => cleanup`
- 框架适配层传入 mount 回调：
  - vue3 版：`createApp(...).mount()`（见 [vue/popup.ts](packages/map-tools/src/vue/popup.ts)）
  - vue2 版：`new Vue({ render }).$mount()` 后 appendChild 进容器（见 [vue2/popup.ts](packages/map-tools/src/vue2/popup.ts)）
  - react 版：`createRoot(container).render(el)`（见 [react/popup.ts](packages/map-tools/src/react/popup.ts)）
- 新增框架适配时复用该注入模式，不要在 core 中引入框架代码

### 4.5 UMD 构建

- 独立配置 [vite.umd.config.ts](packages/map-tools/vite.umd.config.ts)：entry `src/index.ts`、全局名 `FE_utils`、`formats: ['umd']`、自包含（`external: []`）、`minify: true`（esbuild 压缩）
- 输出 `dist/umd/index.umd.js`（约 13KB，gzip 后约 4.3KB），同时由 `umdCommonjsFlag` 插件产出 `dist/umd/package.json`（`{"type":"commonjs"}`），保证 `require` 走 CommonJS 分支

### 4.6 类型生成

- 主构建 [vite.config.ts](packages/map-tools/vite.config.ts)：四入口（index/vue2/vue3/react），es + cjs 输出至 `dist/`
- `external`：`vue`、`react`、`react-dom`（含子路径）；`@turf/turf` 保持**内联**，不得加入 external
- `vite-plugin-dts` 产出类型至 `dist/types`（`copyDtsFiles: true` 原样拷贝 `src/types/*.d.ts`，含薄入口）；构建后 `writePublicTypeEntry` 生成 `dist/types/minemap.d.ts`、`dist/types/umd.d.ts` 两个 `/// <reference path>` 跳板（对应 `exports["./minemap"]`、`exports["./umd"]` 的 types 入口），`rewriteDeclarationSpecifiersForNodeNext` 把相对 specifier 补 `.js` 后缀以兼容 NodeNext 消费者；裸包名 specifier（如 `@ym/minemap-types`）不改写
- minemap SDK 全局类型由独立包 `@ym/minemap-types` 提供并经 map-tools `dependencies` 自动传递，消费者无需手动安装（但需显式激活，见 4.7）

### 4.7 minemap 外部依赖约定

- minemap SDK **无 npm 包**，运行时经 CDN 动态加载（私有部署单源）：
  - JS 主 CDN（实测 200）：`https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js`
  - CSS：`https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css`
- SDK 类型由独立包 **@ym/minemap-types** 提供（`packages/minemap-types/index.d.ts`，自包含单文件，禁止反向引用 `@ym/map-tools`）：`namespace minemap`（Map/Popup/Marker/LngLat/控件/事件等）+ `minemaputil` + `minemap.edit` + `minemap.lbsUtil`；map-tools 的 `src/types/minemap.d.ts` 仅为薄入口（`import type {} from "@ym/minemap-types"`），`@ym/map-tools/minemap` 子路径与 `/// <reference types="@ym/map-tools/minemap" />` 均经此链激活（实测：reference types 指令支持带 scope 的包解析，非仅限 `node_modules/@types/`）
- 同包另提供 **`service.d.ts`**（天镜平台 Web 服务 API 类型，经 `exports["./service"]` 子路径导出）：与 `index.d.ts` 相反，它是**普通 ES 模块**（`export interface/type`），不做全局声明、不产生副作用，消费者按需 `import type { DrivingRequest } from "@ym/minemap-types/service"`。覆盖数据服务/位置服务/功能服务三大类共 40 个 HTTP 接口；`@ym/map-tools` **不**转发该子路径（需要时直接从类型包引入）。冒烟测试在 `test/service-consumer.ts`，随 `pnpm --filter @ym/minemap-types typecheck` 一起跑
- docs-preview 示例实验室使用 [examples/src/shared/loadMinemap.ts](packages/docs-preview/examples/src/shared/loadMinemap.ts) 动态加载器（私有部署单源加载、promise 化；**key 由系统统一提供**：`SYSTEM_MINEMAP_KEY` 常量占位于该文件顶部，为空时 `createMinemapMap` 快速失败）。示例默认参数：solution `222609`、center `[106.55, 29.56]`（重庆）、私有 MapStyleServer styleJSON（key 内嵌于 URL）。逐图层样式错误（白名单 `TOLERATED_STYLE_ERRORS`，当前含 `gis_geo_motorway` 缺失）不判为初始化失败——SDK 仅跳过坏图层、不中断渲染；属服务端 styleJSON 与矢量数据不同步的临时容忍，修复后可移除

### 4.8 docs-preview 示例实验室（playground）

- VitePress 1.x；页面 `/examples-center/playground`（`layout: page` + `pageClass: playground-page`），naive-ui 布局：左侧 `NLayoutSider` 分类菜单（可收起）+ 右侧「描述区 + `NSplit`（地图 iframe | 代码编辑器）」
- 核心组件 [.vitepress/theme/components/Playground.vue](packages/docs-preview/.vitepress/theme/components/Playground.vue)：CodeMirror 6 编辑器（`basicSetup` + `@codemirror/lang-javascript`，TS/JSX）、Sucrase 编译（TS/TSX→ESM，相对导入 `../shared/*` 改写为 `@shared/*`）、**仅手动运行**（「运行」按钮 / Ctrl+Enter；语言切换与「还原」会重置源码并运行一次）
- 运行容器 [public/runner.html](packages/docs-preview/public/runner.html) + [public/runner/runner.js](packages/docs-preview/public/runner/runner.js)：免构建静态文件，内嵌 import map，父页 postMessage 发编译产物（`{type:"run", id, code}`），runner Blob URL `import()` 后调用 `default render(host, {})`，错误渲染浮层
- 运行时 vendor：[scripts/build-runner-vendor.mjs](packages/docs-preview/scripts/build-runner-vendor.mjs) 用 **esbuild** 预打包 `public/runner/vendor/`（vue3/vue2/react/maptools-vue3/maptools-track/maptools-react/shared 七个 ESM 单文件；`maptools-vue3.esm.js` 为 `@ym/map-tools/vue3` 子路径入口、`external: ["vue"]` 保持裸名，供 SFC 示例直接 `import { useMap } from "@ym/map-tools/vue3"`；`maptools-track.esm.js` 为 `@ym/map-tools/track` 子路径（turf-free、无框架依赖，可整体内联），`maptools-react.esm.js` 为 `@ym/map-tools/react` 子路径（external react 三件套，运行时解析到 react.esm.js 共用实例）。runner 解析链三处需同步：runner.html import map、runner.js `vendorUrlMap()`、runner.js `rewriteVendor + rewrite` 分支。**react/react-dom/client/react/jsx-runtime 合并进同一个 react.esm.js**（CJS 内部 require 无法跨 bundle external，拆分会产生浏览器不可用的 `__require`；合并后 import map 三个名指向同一文件，react 实例唯一，hooks 正常）。产物为构建产物，已 git 忽略
- **vue3 示例为 .vue SFC 形态**（`examples/src/vue3/map-init.vue`，`<script setup>` + `useMap`，真实项目写法）：父页编译链对 SFC 先走 `vue/compiler-sfc`（`parse` + `compileScript({ inlineTemplate: true })` 动态 import 按需加载，编译为单模块 ESM 后追加 `export default __sfc__`），再照旧 Sucrase 剥 TS；`<style>` 块不被编译链支持，示例不写样式块。其余三语言仍为 `{id}.{ts,tsx}` 纯 TS
- 示例注册表 [examples/src/registry.ts](packages/docs-preview/examples/src/registry.ts) + 分类树 [examples/src/categories.ts](packages/docs-preview/examples/src/categories.ts)：现有 `map-init`（地图初始化）、`track-playback`（轨迹回放，四变体齐）、`track-fleet`（多车同步，vue3 + html）；vue3 为 SFC，vue2/react/html 为 `{id}.{ts,tsx}`，统一导出 `render(container, options) => 清理函数`；轨迹示例依赖 `examples/src/shared/trackData.ts`（内嵌静态轨迹数据，经 shared vendor 以 `@shared/trackData` 暴露）

### 4.9 docs-preview 文档内容分区

- 导航（[.vitepress/config.ts](packages/docs-preview/.vitepress/config.ts) 的 `nav`）分四区：**指南** `/guide/`、**案例参考** `/cases/`、**API 参考** `/api/`、**示例实验室** `/examples-center/`；`sidebar` 按路径前缀分键，新增页面须同时挂入对应 `items`
- **指南**（`guide/`）：讲能力怎么用（快速开始、最佳实践、核心 API、各框架接入、迁移）
- **案例参考**（`cases/`）：讲**具体业务场景端到端怎么做**，每个案例含可复制调用代码、返回数据关键字段解析、配套 skill 使用方式与提示词范例。现有 `track-playback`（轨迹回放，从 `guide/` 迁入）、`geocoding`（地址解析 + 逆地址解析）、`road-search`（道路搜索，`lbs-api/integrated/v2/keywords`，限定 `region=重庆市`）、`transit-route`（公交路径规划）；后三者为天镜 Web 服务 API（服务端 HTTP），接口地址以私有部署 `https://gmap.cqphx.cn:4443` 为实际调用地址
- 页面约定：无 frontmatter、以 `# 标题` 开头；跨页链接用根绝对路径（如 `/cases/geocoding`）。**迁移页面时须同步全仓入链**（如 `api/track.md` 指向 `/cases/track-playback`）
- 案例页中的接口实测结论应在页内「注意事项」如实标注，并说明是否已实测；实测发现同时回写到对应的 `packages/skills/minemap-jsapi-skill/minemap-service/references/*.md`，保持文档站与技能口径一致

## 5. 开发流程（改一处，同步多处）

修改 core 后按以下链路逐层同步：

1. **改 core**：功能只在 `src/core/` 实现，保持框架无关；禁止引入 vue/react 依赖
2. **更新适配器**：涉及 DOM/组件挂载/事件/生命周期时，同步 `src/vue/` 与 `src/react/`
3. **补 docs-preview 示例**：新能力在四语言源码中各加示例变体（`examples/src/{vue3,vue2,react,html}/{id}.{ts,tsx}`），在 `examples/src/registry.ts` 注册 meta 并挂入 `examples/src/categories.ts` 分类树
4. **同步 skills 与文档**：更新 `packages/skills/map-tools/SKILL.md` 及 docs-preview 的 guide/api 文档
5. **构建校验**（顺序执行）：
   ```bash
   pnpm --filter @ym/map-tools typecheck
   pnpm --filter @ym/map-tools build
   pnpm --filter docs-preview build:runner-vendor  # 确认 runner vendor 预打包通过
   pnpm build:all                                  # 发布前全量校验
   ```
6. **发布**：见第 6 节

> 改动 `packages/minemap-types` 时另走一条链路：改 `index.d.ts`（全局 SDK 声明）或 `service.d.ts`（Web 服务 API 类型）→ 在 `test/consumer.ts` / `test/service-consumer.ts` 补冒烟用例 → `pnpm --filter @ym/minemap-types typecheck` → 若影响接口文档，同步 `packages/skills/minemap-jsapi-skill/minemap-service/references/` 对应页面。

## 6. 发布流程

1. 确认改动已通过第 5 节全部构建校验
2. 首次发布前登录私仓：`npm login --registry http://192.168.3.180:4873`
3. **发布顺序硬约束：先发类型包，再发 map-tools**（map-tools 的 d.ts 引用 `@ym/minemap-types`，前者未发布则消费者类型解析失败）：
   - `pnpm --filter @ym/minemap-types publish --registry http://192.168.3.180:4873/ --no-git-checks`（纯声明包，无 prepublishOnly 构建；发布前跑 `pnpm --filter @ym/minemap-types typecheck`）
   - 更新 `packages/map-tools/package.json` 的 `version`，在 `packages/map-tools` 目录执行 `pnpm publish:pkg`（`prepublishOnly` 自动执行 `pnpm build`，`--no-git-checks` 允许工作区未提交状态发布）
4. 版本策略：
   - 破坏性变更（移除/修改 API 签名，如已移除的 `getLineEndpoint`）→ 升级 **major**
   - 新增能力 → **minor**；修复/文档 → **patch**
   - 弃用 API 先标 `@deprecated` 保留一版再移除（参考 `hiddenLayer`/`hiddenLayers` → `hideLayer`/`hideLayers`）
   - `@ym/minemap-types` 独立 semver（不与 map-tools 联动）；`0.x` 表示未经 SDK 运行时逐项验证，验证充分后升 `1.0.0`

## 7. 注意事项与禁忌

- **禁改 UMD 全局名 `FE_utils`**（[vite.umd.config.ts](packages/map-tools/vite.umd.config.ts) 中 `lib.name`）；docs-preview、技能文档与下游用户均依赖该全局名
- **禁止在库源码（packages/map-tools/src）使用 .vue SFC**：一律使用渲染函数（h / render）/ createElement
- **minemap 全局类型必须保持全局命名空间声明形态**（`namespace minemap` + `declare global`，位于 `packages/minemap-types/index.d.ts`），勿改为模块导出，否则消费者类型解析失效；类型包**禁止反向依赖** `@ym/map-tools`（依赖方向单向，见 ADR 0001）；修改 SDK 全局类型只改 `packages/minemap-types/index.d.ts`，勿在 map-tools 源码树内加声明
- **`index.d.ts` 与 `service.d.ts` 形态不可互换**：前者是全局 ambient 声明（`declare global` + `export {}`），后者是普通 ES 模块（`export interface/type`，末尾同样 `export {}` 仅为保持模块语义）。服务端 HTTP 接口类型一律进 `service.d.ts` 并经 `exports["./service"]` 暴露，**不要**塞进全局 `minemap` 命名空间（会与前端 LBS 插件的 `minemap.service` 语义撞车）；新增接口时同步更新 `packages/skills/minemap-jsapi-skill/minemap-service/` 对应 reference 与 `test/service-consumer.ts`
- **双构建配置勿合并**：vue2 demos 需要独立 alias（`vue` → Vue 2.7 运行时绝对路径），主 demos 走 Vue 3；合并单配置会让 `vue` 无法同时解析到两个版本
- **勿删 `pnpm-workspace.yaml` 的 `allowBuilds`**（esbuild 依赖构建脚本权限）
- **external 边界**：`@turf/turf` 必须内联；`vue`/`react`/`react-dom` 必须 external（Vue 适配层直接依赖消费者提供的 `vue`，vue2 走 2.7、vue3 走 3）
- **vue3 入口保持薄壳**（仅 `export * from "../vue"`）；**vue2 入口**复用 `../vue/useMap` 但自带 `popup.ts`（Vue 2.7 `new Vue` 挂载，因无原生 `createApp`），此差异不可再合并
- **Windows 下跨目录复制一律用 Node 脚本**（`node:path`），勿用 shell 的 `cp`/`copy` 硬编码路径
- **勿删/勿改根 .npmrc 的 `@ym` scope 指向**（私仓 `http://192.168.3.180:4873/`）
- **peerDependencies（vue/react/react-dom）保持 optional**，避免强制消费者安装未用框架
- 根目录 `src/`、`lib/` 为历史同步产物，源码修改只认 `packages/` 下的文件
- 发布使用 `publish:pkg`（含 `--no-git-checks`），不要绕开 `prepublishOnly` 的自动构建
