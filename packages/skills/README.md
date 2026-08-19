# map-tools-skills

本子项目用于存放 Qoder 技能（Agent Skills），为 `@ym/map-tools` 地图工具库的 AI 辅助开发提供知识文档。纯文档包，零依赖、无构建脚本，不参与任何安装/发布流程。

## 目录约定

```
packages/skills/
├── package.json      # 仅用于标识子项目，private，无 scripts 无依赖
├── README.md         # 本文件
└── map-tools/
    └── SKILL.md      # map-tools 专用技能：安装、接入、API 速查、useMap、minemap 前置依赖与示例
```

- 每个技能一个子目录，目录名即技能名，技能文档固定命名为 `SKILL.md`。
- `SKILL.md` 顶部必须包含 YAML frontmatter（`---` 包裹），至少包含 `name` 与 `description` 字段。
- 文档中的 API 均以 `packages/map-tools/src/` 源码为准，新增/修改导出后应同步更新。
