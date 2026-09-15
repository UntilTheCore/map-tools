---
name: minemap-service
description: 天镜二三维地图平台 Web 服务 API（HTTP 接口，服务端）开发技能。覆盖三大类共 40 个接口：数据服务（矢量切片服务、地图服务、要素服务、OGC WMTS 服务、Cesium 3D 切片/3D 地形切片/3D 物体模型/栅格地形切片服务、地图样式方案服务）、位置服务（行政区划查询、逆行政区划查询、地理编码、逆地理编码、地点输入提示、地名综合查询、周边/多边形/沿线综合搜索、驾车/步行/骑行/公交路径规划）、功能服务（坐标转换、坐标投影、多边形面积和周长、线段长度、求距离、求多边形标注点、几何断言、缓冲区、闭包、几何分割、致密几何、几何差集、几何泛化、叠置计算、重塑几何、简化几何、裁切或延伸线、合并几何）。Use whenever the user works with 天镜 Web 服务 API、平台服务 API、tianjing-server、mapdata-api、lbs-api、function-api、GeometryServer、HTTP 接口调用、服务端接口、数据服务、位置服务、功能服务、切片服务、矢量切片、PBF、WMTS、3D Tiles、地形切片、要素编辑、地理编码、逆地理编码、POI 搜索、路径规划、行政区划、几何运算、缓冲区分析、坐标转换、坐标投影——即使没有明确提到 "Web 服务" 或 "HTTP"。
---

# 天镜 Web 服务 API（服务端 HTTP 接口）开发技能

本技能覆盖天镜二三维地图平台**服务端 HTTP 接口**：开发者通过 HTTP/HTTPS 发起请求，直接拿到 JSON / GeoJSON / PBF / 栅格图片等结果。它与前端 SDK（`minemap` / `minemaputil` / `minemap.edit`）以及前端 LBS 插件（`minemap.service` / `minemap.component`，见 `minemap-lbs` 技能）是**两条独立的调用路径**：本技能只讲服务端地址怎么拼、参数怎么传、返回怎么解析，不涉及地图实例与图层渲染。

## 1. 任务路由表

先判断要做哪类事，再读对应 reference 拿完整参数表。

### 数据服务（base：`/tianjing-server/mapdata-api/services/`）

| 任务                                                             | reference                                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 加载矢量切片底图、取切片元数据/默认样式/TilesJSON/字体/精灵图标  | [vector-tile-service.md](./references/vector-tile-service.md)                       |
| 栅格切片底图、图层列表、图层详情、要素查询、Identify/Find/Export | [map-service.md](./references/map-service.md)                                       |
| 要素查询与**编辑**（增/删/改/批量提交）、要素服务元数据          | [feature-service.md](./references/feature-service.md)                               |
| 对接 OGC 标准 WMTS（Capabilities / GetTile）                     | [ogc-wmts-service.md](./references/ogc-wmts-service.md)                             |
| 三维场景加载：3D Tiles 切片入口                                  | [cesium-3d-tiles-service.md](./references/cesium-3d-tiles-service.md)               |
| 三维地形：Cesium 地形切片                                        | [cesium-3d-terrain-tile-service.md](./references/cesium-3d-terrain-tile-service.md) |
| 三维物体模型（glb 等）加载                                       | [object-model-3d-service.md](./references/object-model-3d-service.md)               |
| 栅格地形切片（png）                                              | [raster-terrain-tile-service.md](./references/raster-terrain-tile-service.md)       |
| 取地图配图方案 styleJSON                                         | [map-style-service.md](./references/map-style-service.md)                           |

### 位置服务（base：`/tianjing-server/lbs-api/`）

| 任务                                           | reference                                                 |
| ---------------------------------------------- | --------------------------------------------------------- |
| 行政区划查询（省/市/区县/乡镇/村庄，可带边界） | [district.md](./references/district.md)                   |
| 坐标反查所在行政区                             | [reverse-district.md](./references/reverse-district.md)   |
| 结构化地址 → 经纬度（地理编码）                | [geocoding.md](./references/geocoding.md)                 |
| 经纬度 → 结构化地址 + 周边 POI/AOI/道路        | [reverse-geocoding.md](./references/reverse-geocoding.md) |
| 输入联想、地点输入提示                         | [suggestion.md](./references/suggestion.md)               |
| 关键字搜 POI（地名综合查询）                   | [keywords.md](./references/keywords.md)                   |
| 以某点为中心按半径搜 POI                       | [around.md](./references/around.md)                       |
| 在多边形范围内搜 POI                           | [polygon-search.md](./references/polygon-search.md)       |
| 沿一条线按距离范围搜 POI                       | [line-search.md](./references/line-search.md)             |
| 驾车路线规划（避让区域/途经点/算路策略）       | [driving-route.md](./references/driving-route.md)         |
| 步行路线规划                                   | [walking-route.md](./references/walking-route.md)         |
| 骑行路线规划                                   | [bicycling-route.md](./references/bicycling-route.md)     |
| 公交路线规划                                   | [transit-route.md](./references/transit-route.md)         |

### 功能服务（base：`/tianjing-server/function-api/services/geometryUtilities/GeometryServer/`）

| 任务                                | reference                                                         |
| ----------------------------------- | ----------------------------------------------------------------- |
| 坐标系之间转换                      | [coordinate-conversion.md](./references/coordinate-conversion.md) |
| 投影坐标 ↔ 地理坐标                 | [project.md](./references/project.md)                             |
| 计算多边形面积与周长                | [areas-and-lengths.md](./references/areas-and-lengths.md)         |
| 计算线段长度                        | [lengths.md](./references/lengths.md)                             |
| 计算两点距离                        | [distance.md](./references/distance.md)                           |
| 求多边形标注点（合适放标签的位置）  | [label-points.md](./references/label-points.md)                   |
| 判断几何空间关系（相交/包含等断言） | [relation.md](./references/relation.md)                           |
| 缓冲区分析                          | [buffer.md](./references/buffer.md)                               |
| 求几何凸包                          | [convex-hull.md](./references/convex-hull.md)                     |
| 用线切割面                          | [cut.md](./references/cut.md)                                     |
| 致密化（按最大段长插点）            | [densify.md](./references/densify.md)                             |
| 求几何差集                          | [difference.md](./references/difference.md)                       |
| 几何泛化（抽稀）                    | [generalize.md](./references/generalize.md)                       |
| 求几何交集（叠置计算）              | [intersect.md](./references/intersect.md)                         |
| 重塑几何                            | [reshape.md](./references/reshape.md)                             |
| 简化几何                            | [simplify.md](./references/simplify.md)                           |
| 裁切或延伸线几何                    | [trim-extend.md](./references/trim-extend.md)                     |
| 合并几何                            | [union.md](./references/union.md)                                 |

**无法一眼确定时**：拿切片/地图/要素数据 → 数据服务；按位置查地名地址、算路径 → 位置服务；纯几何计算与坐标换算 → 功能服务。

## 2. 调用约定

### 2.1 鉴权与 base 路径

- 所有接口都要带 `key`（开发者应用密钥），经平台注册账号并申请应用后获得；缺失或无效会被拒绝。
- 三类服务的 base 路径不同，不要混用：
  - 数据服务 `/tianjing-server/mapdata-api/services/`
  - 位置服务 `/tianjing-server/lbs-api/`
  - 功能服务 `/tianjing-server/function-api/services/geometryUtilities/GeometryServer/`
- 文档中 `ip:port` 为部署地址占位符，实际替换为私有部署域名（如 `gmap.cqphx.cn:4443`）。

### 2.2 请求方式

- 绝大多数接口同时支持 `GET` 与 `POST`（数据服务/位置服务），功能服务多为 `GET`。
- 参数可放 URL query 或表单体；`f` 控制返回格式（`json` / `geojson` / `pbf` / `html` 视接口而定），不传时各有默认值。

### 2.3 坐标与几何表达

位置服务用**字符串**表达坐标：

- 单点：`"经度,纬度"`（经度在前）
- 多点/多组：点内 `,`，点间 `;`，多区域或多组之间 `|`
- 多边形首尾坐标必须相同（2 点矩形例外）
- `polygon` / `line` 类参数额外支持 WKT 与 BBOX 格式

功能服务的几何参数用 **Esri 几何 JSON**（不是 GeoJSON）：

```json
{ "rings": [[[x, y], [x, y], ...]] }   // 面
{ "paths": [[[x, y], [x, y], ...]] }   // 线
{ "x": 1.2e7, "y": 3.2e6 }             // 点
```

`geometries` / `polygons` / `polylines` 为上述对象的**数组**；`sr` / `inSR` / `outSR` 指定坐标系（常用 `4326` WGS84、`3857` 墨卡托）。Esri 几何的坐标顺序与位置服务字符串一致，均为 `[x, y]`。

### 2.4 返回信封

两类信封不要混淆：

| 类别                 | 结构                                                              |
| -------------------- | ----------------------------------------------------------------- |
| 数据服务             | `{ "TianjingServerVersion": "3.0", ... }`（无 code/msg 信封）     |
| 位置服务             | `{ "code": 0, "msg": "ok", "result"/"districts"/"data"/... }`     |
| 功能服务（几何运算） | `{ "geometries"/"lengths"/..., "TiantuMapServerVersion": "3.0" }` |

- 位置服务 `code` 为整数编号，`0` 表示成功，非 0 表示失败（`msg` 给出原因）。
- 数据服务与功能服务的版本字段名不同（`TianjingServerVersion` vs `TiantuMapServerVersion`），都以 `3.0` 标识服务版本。
- 功能服务的业务字段名随接口而变（`lengths`、`areas`、`relations`、`labelPoints`、`geometry`、`distance` 等）。
- 路线几何（`routeLine`、`steps[].polyline`）与行政区边界（`polygon`）都是 **WKT 字符串**，需自行解析成坐标数组再交给地图渲染。

### 2.5 与前端 SDK 的配合

- 数据服务的矢量切片地址可直接作为 `minemap` 的 vector source 使用；`地图样式方案服务` 返回的 styleJSON 可直接作为地图 style。
- 位置服务的结果（POI、路线、行政区边界）拿到后自行构造 GeoJSON 交给 `minemap` 图层渲染；前端插件 `minemap.service` 是对同类 LBS 能力的**封装**，二选一即可，不要重复请求。
- 路径规划与 POI 搜索的分页参数（`page`/`pageSize`/`pageNum`）上限普遍为每页 20 条、最多 20 页。

## 3. 注意事项与已知文档问题

- **接口地址已做过规范化**：原文档的接口地址存在拼写与排版问题（`servicess`、多余的 `>`、占位符内空格如 `<serviceName >`、参数间空格如 `geo metry1` / `? target ={target}` / `/ style/`、粘连的路径段），各 reference 中的接口地址已按正确形式给出，并在「注意事项」里记录了原文写法，便于对照。**引用时以 reference 中给出的地址为准。**
- **参数表与示例不一致**：如「坐标转换服务」参数表把取值示例（wgs84 / 墨卡托投影）写进了“描述”列，实际示例传的是 `3857` / `4326`；「线段长度计算」的“默认值”列被误填成参数名本身。
- **服务描述被错误复制**：步行/骑行/公交路径规划、要素服务等页面的介绍文字是从其它页面复制而来，与接口实际功能不符，以接口地址与参数为准。
- **功能服务参数表的“是否必须”列**：部分页面（几何差集、几何泛化、叠置计算、合并几何）该列留空，按语义这些参数是必需的。
- **文档未覆盖的取值**：如缓冲区的 `unit` 单位、几何断言的 `relation` / `relationParam` 具体枚举，文档未列举，需按服务端实际支持传值。
- **返回字段拼写**：个别字段文档拼写有误（如 `provice_code`），对接时以服务端实际返回为准。
- **本技能内容边界**：只覆盖「数据服务 / 位置服务 / 功能服务」三大类；平台的「出行服务」「行业服务」以及 JS 引擎 API、示例中心不在本技能范围内，涉及前端 SDK 用法请转到 `minemap-2d-api` / `minemap-2d-util` / `minemap-edit` / `minemap-lbs` 子技能。
