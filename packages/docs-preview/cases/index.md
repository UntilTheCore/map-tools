# 案例参考

指南回答「这个能力怎么用」，案例参考回答「一个具体业务场景端到端怎么做」。每个案例都包含可复制的调用代码、返回数据的关键字段解析，以及配套的 skill 使用方式与提示词范例。

## 已有案例

| 案例                                     | 场景                                                     | 涉及能力                                                                       |
| ---------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [轨迹回放](/cases/track-playback)        | GPS 采点 → 车辆沿轨迹连续运动，支持多车共享时间轴        | `@ym/map-tools` 的 `createTrackPlayer` / `createTrackFleet` / `useTrackPlayer` |
| [地址解析与逆地址解析](/cases/geocoding) | 结构化地址 ↔ 经纬度互转，并取回地址周边的 POI / 道路信息 | 天镜 Web 服务 API · 位置服务（`lbs-api/geocoding/*`）                          |
| [道路搜索](/cases/road-search)           | 按路名查重庆市道路，取回道路等级与线几何                 | 天镜 Web 服务 API · 位置服务（`lbs-api/integrated/v2/keywords`）               |
| [公交路径规划](/cases/transit-route)     | 输入起终点，取回公交线路方案与分段引导                   | 天镜 Web 服务 API · 位置服务（`lbs-api/route/v2/special/transit`）             |

## 案例的组织方式

后两个案例属于**服务端 HTTP 接口**（直接对 `https://gmap.cqphx.cn:4443` 发起请求），与地图 SDK 的调用路径不同：

- 地图 SDK（`minemap` / `minemaputil` / `minemap.edit`）在浏览器里渲染与交互，见 [指南](/guide/getting-started) 与 [API 参考](/api/overview)。
- Web 服务 API 只负责取数据（JSON / GeoJSON / PBF / 栅格图片），拿到后由你自己构造图层交给地图渲染。

这两条路径的完整接口清单见仓库技能包 `packages/skills/minemap-jsapi-skill/minemap-service/`（共 40 个接口）。案例页会说明如何用该 skill 辅助开发。

> 接口地址中的 `key` 为开发者应用密钥，需在平台注册账号并申请应用后获得；示例中出现的 key 仅用于演示。
