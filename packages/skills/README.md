# map-tools-skills

本子项目存放为 AI 辅助开发（Qoder Agent）提供的技能知识文档，覆盖两个知识域：**@ym/map-tools 工具库**（封装层）与 **MineMap JS SDK 全家桶**（底层引擎、工具库、编辑/标绘插件、LBS 服务插件、服务端 Web 服务 API）。纯文档包，零依赖、无构建脚本，不参与任何安装/发布流程。

## 技能清单

| 技能            | 目录                                   | frontmatter name           | 覆盖范围                                                                                                                                                         |
| --------------- | -------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| map-tools       | `map-tools/`                           | `map-tools`                | @ym/map-tools 安装、接入、API 速查、useMap、弹窗适配、minemap 前置依赖与示例                                                                                     |
| 最佳实践        | `map-tools-best-practices/`            | `map-tools-best-practices` | @ym/map-tools 中大型地图页面架构：三层结构（layer/data/controller）、scene 工厂、LayerGroup 登记表、覆盖物销毁协议、Code Review 清单（完整示例在 `references/`） |
| MineMap 总入口  | `minemap-jsapi-skill/`                 | `minemap`                  | 任务路由：判断开发任务类型后引导到 5 个子技能，并收拢依赖顺序、命名空间、坐标格式、初始化时机等通用约定                                                          |
| ├ 核心库        | `minemap-jsapi-skill/minemap-2d-api/`  | `minemap-2d-api`           | `minemap` 命名空间：地图初始化、图层/数据源、Marker/Popup、控件、事件、要素查询、相机动画、自定义渲染（细节在 `references/`）                                    |
| ├ 2D 工具库     | `minemap-jsapi-skill/minemap-2d-util/` | `minemap-2d-util`          | `minemaputil` 命名空间：RangingTool 测距测面积、fitBounds 视口适配、SpaceUtil 空间计算                                                                           |
| ├ 编辑/标绘插件 | `minemap-jsapi-skill/minemap-edit/`    | `minemap-edit`             | `minemap.edit` 命名空间：30+ 绘制模式、二次编辑、样式自定义、吸附/锁定、undo/redo                                                                                |
| ├ LBS 服务插件  | `minemap-jsapi-skill/minemap-lbs/`     | `minemap-lbs`              | `minemap.service` / `minemap.component` / `minemap.lbsUtil`：路径规划、POI 搜索、地理编码、行政区域、轨迹处理、到达圈（参数表在 `references/`）                  |
| └ Web 服务 API  | `minemap-jsapi-skill/minemap-service/` | `minemap-service`          | 服务端 HTTP 接口：数据服务（切片/地图/要素/WMTS/3D/样式方案）、位置服务（行政区划/地理编码/POI 搜索/路径规划）、功能服务（几何运算/坐标转换）共 40 个接口        |

## 目录结构

```
packages/skills/
├── package.json                     # 仅用于标识子项目，private，无 scripts 无依赖
├── README.md                        # 本文件
├── map-tools/
│   └── SKILL.md                     # 单技能：@ym/map-tools
├── map-tools-best-practices/        # 单技能：地图页面架构最佳实践
│   ├── SKILL.md                     # 规则与判断 + Code Review 清单
│   └── references/                  # 完整示例（按主题拆分，渐进加载）
│       ├── data-adapter.md          #   类型化 FeatureCollection + 入口适配器
│       ├── layer-group.md           #   LayerGroup 登记表与装配
│       ├── scene-factory.md         #   scene 工厂 + SceneStore + deps 注入完整示例
│       ├── overlays.md              #   Marker/Popup 登记与销毁协议
│       └── page-assembly.md         #   页面装配与 useMap 事件接线
└── minemap-jsapi-skill/             # 技能族：MineMap JSAPI 全家桶
    ├── SKILL.md                     # 总入口（name: minemap）：任务路由表 + 通用约定
    ├── minemap-2d-api/
    │   ├── SKILL.md                 # 子技能内再含任务路由表
    │   └── references/              # 按主题拆分的细节文档（渐进加载）
    │       ├── map-core.md          #   地图/相机/交互
    │       ├── sources.md           #   数据源与图层
    │       ├── marker.md / popup.md #   覆盖物
    │       ├── controls.md          #   UI 控件
    │       ├── events-handlers.md   #   事件与 Handler
    │       ├── geometry.md          #   LngLat/LngLatBounds 几何
    │       └── custom-render.md     #   自定义图层/图标
    ├── minemap-2d-util/
    │   └── SKILL.md
    ├── minemap-edit/
    │   └── SKILL.md
    ├── minemap-lbs/
    │   ├── SKILL.md
    │   └── references/
    │       └── service-api.md       #   Service 22 个接口参数表
    └── minemap-service/             # Web 服务 API（服务端 HTTP 接口）
        ├── SKILL.md                 #   调用约定 + 任务路由表（40 个接口）
        └── references/              #   一页一接口，共 40 个
            ├── vector-tile-service.md / map-service.md / feature-service.md
            ├── ogc-wmts-service.md / cesium-3d-*-service.md
            ├── object-model-3d-service.md / raster-terrain-tile-service.md
            ├── map-style-service.md
            ├── district.md / reverse-district.md / geocoding.md
            ├── reverse-geocoding.md / suggestion.md / keywords.md
            ├── around.md / polygon-search.md / line-search.md
            ├── driving-route.md / walking-route.md / bicycling-route.md
            ├── transit-route.md
            └── coordinate-conversion.md / project.md / buffer.md / ...
```

## 目录约定

支持两种组织形态：

1. **单技能**：一个子目录即一个技能，目录名即技能名，技能文档固定命名为 `SKILL.md`（如 `map-tools/`）。
2. **技能族**：父目录的 `SKILL.md` 作为**总入口**，只负责「任务判断 + 路由 + 通用约定」，不重复 API 细节；能力域拆为子目录，各自持有 `SKILL.md`（如 `minemap-jsapi-skill/`）。内容量大时在子技能下再建 `references/*.md`，按主题拆分供**渐进加载**——先读 `SKILL.md`，需要细节再读对应 reference。

通用规则：

- 每个 `SKILL.md` 顶部必须包含 YAML frontmatter（`---` 包裹），至少包含 `name` 与 `description` 字段。
- `description` 是代理触发匹配的依据，须覆盖该技能的关键命名空间（如 `minemap` / `minemaputil` / `minemap.edit` / `minemap.service`）与中英文场景关键词，即使用户未明说技术名也能命中。
- frontmatter `name` 是技能注册名，可与目录名不同（如目录 `minemap-jsapi-skill` 注册为 `minemap`）。
- 技能族内各 `SKILL.md` 之间靠路由表互相引用，路径一律使用相对本文件的相对路径。

## 内容来源与一致性

- `map-tools/` 的 API 以 `packages/map-tools/src/` 源码为准，新增/修改导出后应同步更新。
- `minemap-jsapi-skill/` 以 MineMap 官方文档与实测为准，资源地址统一指向私有部署 CDN `gmap.cqphx.cn:4443`（核心库 v2.1.x）；
- `minemap-service/` 内容取自天镜平台「开发者中心 → Web 服务 API 文档」的「数据服务 / 位置服务 / 功能服务」三大类，逐页整理为独立 reference；平台的「出行服务」「行业服务」不在覆盖范围内。接口地址按**正确形式**给出（原文档存在 `servicess`、多余 `>`、占位符内空格、路径粘连等笔误），原文写法与被错误复制的服务描述、参数默认值拼写等问题在各 reference 的「注意事项与已知文档问题」中逐条记录。
- 两者冲突时以源码/官方文档为权威，README 与本表仅做导航，不承载 API 细节。
