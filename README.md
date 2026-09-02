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

提交的代码必须满足以下格式要求（由 prettier 与 oxlint 自动强制，配置见 [.prettierrc.json](.prettierrc.json) / [.oxlintrc.json](.oxlintrc.json)）：

| 项目     | 要求                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| 引号     | 字符串一律使用**双引号**，勿手动改回单引号                                                           |
| 分号     | 语句结尾必须有分号                                                                                   |
| 缩进     | 2 空格，不使用 Tab                                                                                   |
| 单行宽度 | 100 字符，超出部分由 prettier 自动折行                                                               |
| 末尾逗号 | 多行对象/数组/参数一律带尾逗号（`trailingComma: "all"`）                                             |
| 换行符   | 仓库统一 LF（.editorconfig）；工作区由 git autocrlf 处理，prettier 不强制改写（`endOfLine: "auto"`） |
| 编码     | UTF-8，文件末尾保留一个空行                                                                          |
| Markdown | 仅整理列表/表格/代码块结构，正文不强制换行重排（`proseWrap` 默认 preserve）                          |

格式化范围：`ts / tsx / js / mjs / vue / css / html / json / md`（构建产物目录已在 .prettierignore 中排除）。

Lint 分级要求：

- `correctness` 与 `suspicious` 类规则为 **error**：提交时必须清零（如未使用变量/导入、`addEventListener` 优先于 `on*` 赋值等），否则 pre-commit 钩子会阻断提交
- `style` 类规则当前为 **warn**：不阻断提交，但新代码建议顺手满足（如 `prefer-const`、`no-var`，多数可由 `pnpm lint:fix` 自动修复）

不需要手工对齐格式——书写时只需保持上述大方向，其余交给钩子里的 `prettier --write` 自动处理。

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

### 提交信息规范（commit-msg）

提交信息遵循 [vuejs/vue 的 COMMIT_CONVENTION](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md)，由 commitlint 在 commit-msg 阶段自动校验（配置见 [commitlint.config.mjs](commitlint.config.mjs)），不合规的提交会被**直接拒绝**。

**格式**

```
<type>(<scope>?): <subject>
<空行>
<body>
<空行>
<footer>
```

**允许的 type（12 个）**

| type     | 用途                     | type       | 用途                     |
| -------- | ------------------------ | ---------- | ------------------------ |
| `feat`   | 新功能（进 changelog）   | `refactor` | 重构（不改行为）         |
| `fix`    | 缺陷修复（进 changelog） | `perf`     | 性能优化（进 changelog） |
| `polish` | 打磨/小改进              | `test`     | 测试相关                 |
| `docs`   | 文档                     | `workflow` | 工作流                   |
| `style`  | 代码格式调整             | `ci`       | CI 配置                  |
| `chore`  | 杂务/工具链              | `types`    | 类型声明                 |

**subject 三原则**：祈使句现在时（"add" 而非 "added"）、首字母小写、结尾不加句号。header 整行不超过 **50** 字符；scope 可选，描述改动位置（如 `map`、`popup`、`docs`）。

**revert 与破坏性变更**

- 回滚提交：标题写 `revert: <被回滚提交的标题>`，正文写 `This reverts commit <hash>.`
- 破坏性变更：footer 以 `BREAKING CHANGE:` 开头（加空格或空行）说明影响

**示例**

```bash
feat(map): add fitBounds padding option     # 合规
fix(popup): handle events on blur           # 合规
docs(readme): commit convention             # 合规

随便写一条不合规的消息                       # ✗ 缺少 type
build: use webpack                           # ✗ build 不在允许的 12 个 type 内
feat: This ends with a period.               # ✗ 大写开头 + 结尾句号
feat: this subject is far too long to pass   # ✗ header 超 50 字符
```

手动校验：`pnpm commit:lint`（从 stdin 读入 message）。

## v3 重点

- 核心按 `resources`、`layers`、`query`、`viewport`、`geometry`、`overlays`、`popup` 划分。
- minemap 不进入运行时依赖；CDN Script 用户通过 `@ym/map-tools/minemap` 显式启用补充类型。
- UMD 保持全局名 `FE_utils` 和路径 `dist/umd/index.umd.js`；类型入口为 `@ym/map-tools/umd`。
- Vue/React `useMap` 使用 `mapRef`、`setMap`、`on`、`off`、`unbindAll`。
- Popup API 返回 `{ element, dispose() }` 生命周期句柄。

详细使用方式见 [文档站源码](packages/docs-preview)。
