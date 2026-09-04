# 将 minemap SDK 全局类型拆分为独立私仓包 @ym/minemap-types

minemap SDK 经 CDN script 注入，无官方 npm 类型包，原先由 `@ym/map-tools` 内置一份 869 行 `minemap.d.ts` 提供全局声明。这使"只用 SDK、不用 map-tools"的 TypeScript 项目无法获得类型，且类型维护被迫绑定在封装库的发版节奏上。我们决定将其拆分为独立包 `@ym/minemap-types`（本 monorepo `packages/minemap-types`，发布至 Verdaccio 私仓 `http://192.168.3.180:4873/`），`@ym/map-tools` 通过 `dependencies` 依赖它，自身 `src/types/minemap.d.ts` 退化为薄入口（`import type {} from "@ym/minemap-types"`），保持既有 `@ym/map-tools/minemap` 子路径契约不变。

## Considered Options

- **包名 `@types/minemap`**：被否决。公共 npm 上该名字是 DefinitelyTyped 的 0.0.1 占位 stub；且若把 `@types` scope 整体路由到私仓会影响所有类型包的解析，保留名语义也不诚实（非官方维护）。
- **peerDependencies**：被否决（曾在讨论中选过，后被"装即用"诉求推翻）。peer 要求消费者手动额外安装，破坏 `pnpm add @ym/map-tools` 开箱拿类型的体验；`dependencies` 下类型包随 map-tools 自动传递。
- **map-tools 与类型包共享形状类型定义（类型包 import map-tools 的形状）**：被否决，造成循环依赖。最终边界：类型包**自包含**（自带 SDK 形状的宽松声明），`@ym/map-tools` 的 `src/types/{geometry,source,layer,map}.ts` 维持既有框架形状**不动**；两份形状各自独立、结构兼容（鸭子类型），由消费测试守门。
- **版本号跟随 SDK 主版本（3.0.0）**：被否决。类型包与 map-tools 是两个发布节奏（map-tools 是更高层封装框架），采用独立 semver，首版 `0.1.0`——如实反映"声明依据 2.x 文档推导、未经 v3.0.0 运行时逐项验证"的置信度。

## 关键技术事实（实测）

- `/// <reference types="@ym/map-tools/minemap" />` 与 `/// <reference types="@ym/minemap-types" />` 两种激活方式在真实 node_modules 布局下**均实测可用**（TS 对带 scope 的 reference types 走包解析而非仅 `node_modules/@types/`）；`import type {} from ...` 与 tsconfig `"types": [...]` 亦可。skill 文档教的指令写法无需改动。
- pnpm 严格布局下，map-tools dist 薄入口里的裸 import `@ym/minemap-types` 沿 map-tools 自身 node_modules 解析（虚拟 store 等价布局），已在 bundler 与 NodeNext 双模式下经 type-tests 四组配置验证。
- 薄入口必须保持**模块形态**（含 import 语句），一旦退化为空文件会被 `rewriteDeclarationSpecifiersForNodeNext`/打包器视无物，`/// <reference path>` 跳板链会断。

## Consequences

- 三层消费门禁进入 `typecheck:types`：类型包直装（`minemap-types-direct.ts`）、经 map-tools 子路径（`minemap-global-consumer.ts`）、主入口防全局泄漏（`no-global-consumer.ts` 的 `@ts-expect-error` 继续成立，因 map-tools 主入口引用链不含薄入口）。
- 发布顺序成为硬约束：**先发 `@ym/minemap-types`，再发 `@ym/map-tools`**（后者的 d.ts 引用前者，未发布则消费者解析失败）。
- `minemap` 全局命名的唯一权威定义自本提交起在 `packages/minemap-types/index.d.ts`；修改 SDK 类型不再触碰 map-tools 源码树，反之亦然。
- AGENTS.md 中"消费者无需安装任何 minemap 类型包"的承诺由 dependencies 机制继续成立（自动传递，而非内联）。
