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

## 代码风格与提交检查

本仓库统一使用 **oxlint + prettier + husky（lint-staged）** 做代码质量与格式管控，配置位于根目录：[.oxlintrc.json](.oxlintrc.json)、[.prettierrc.json](.prettierrc.json)、[.prettierignore](.prettierignore)、[.editorconfig](.editorconfig)。

### 代码风格

- 双引号、分号、2 空格缩进，单行宽度 100（由 prettier 强制，勿手动改回单引号）
- 格式化范围：`ts / tsx / js / mjs / vue / css / html / json / md`（构建产物目录已在 .prettierignore 中排除）

### 常用命令

```bash
pnpm lint          # oxlint 检查（correctness/suspicious 为 error，style 为 warn）
pnpm lint:fix      # oxlint 自动修复
pnpm format        # prettier 全仓格式化
pnpm format:check  # 仅校验格式，不写入
```

### 提交检查（pre-commit）

`pnpm install` 后 husky 自动生效（`git config core.hooksPath` → `.husky/_`），每次 `git commit` 会对**暂存文件**执行：

1. `oxlint --fix` —— 自动修复可修复问题；存在 **error 级**问题时提交被阻断
2. `prettier --write` —— 自动格式化并重新加入暂存区

要求：

- 提交前建议本地先跑 `pnpm lint && pnpm format:check`，避免被钩子拦截
- 若钩子自动修改了文件，重新 `git add` 后再次提交即可
- 如确需跳过钩子（仅限紧急情况），使用 `git commit --no-verify` 并在提交说明中注明原因

## v3 重点

- 核心按 `resources`、`layers`、`query`、`viewport`、`geometry`、`overlays`、`popup` 划分。
- minemap 不进入运行时依赖；CDN Script 用户通过 `@ym/map-tools/minemap` 显式启用补充类型。
- UMD 保持全局名 `FE_utils` 和路径 `dist/umd/index.umd.js`；类型入口为 `@ym/map-tools/umd`。
- Vue/React `useMap` 使用 `mapRef`、`setMap`、`on`、`off`、`unbindAll`。
- Popup API 返回 `{ element, dispose() }` 生命周期句柄。

详细使用方式见 [文档站源码](packages/docs-preview)。
