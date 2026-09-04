# minemap-lbs Service 完整参数参考

来源：`lbs-v2/docs/Service.html`（minemap-lbs v2.2.1）。所有方法均为静态方法，签名统一为 `(params) => Promise`，`params.serviceUrl`（请求服务的 baseUrl）为每个方法的必含参数。

目录：

- [adminByPointData](#adminbypointdata行政区域查询) · [autocompleteData](#autocompletedata输入提示) · [beautifyTrack](#beautifytrack轨迹美化) · [drivingData](#drivingdata驾车路径规划) · [geocodingData](#geocodingdata地理编码) · [kpilesKeywords](#kpileskeywords里程桩关键字查询) · [kpilesLocation](#kpileslocation坐标查里程桩) · [matchHistoricalTrack](#matchhistoricaltrack历史轨迹匹配纠偏) · [matchRealtimeTrack](#matchrealtimetrack实时轨迹匹配) · [placeSearchAroundData](#placesearcharounddata周边搜索) · [placeSearchByID](#placesearchbyidid详情) · [placeSearchByLineData](#placesearchbylinedata沿线搜索) · [placeSearchInBoundsData](#placesearchinboundsdata多边形区域搜索) · [placeSearchKeywordData](#placesearchkeyworddata关键字搜索) · [placeSearchRoadData](#placesearchroaddata道路搜索) · [reacharea](#reacharea到达圈) · [reverseDistrict](#reversedistrict坐标反查行政区) · [reverseGeocodingData](#reversegeocodingdata逆地理编码) · [similarityTrack](#similaritytrack轨迹重合度) · [staypointTrack](#staypointtrack停留点分析) · [truckDrivingData](#truckdrivingdata货车路径规划) · [walkingData](#walkingdata步行路径规划)

---

## adminByPointData（行政区域查询）

根据输入的搜索条件，快速查找特定的行政区域信息。

| 参数        | 类型   | 必填 | 默认   | 说明                                                                                                   |
| ----------- | ------ | ---- | ------ | ------------------------------------------------------------------------------------------------------ |
| serviceUrl  | string | 是   | —      | 请求服务的 baseUrl                                                                                     |
| keywords    | string | 是   | "中国" | 只支持单个关键词；支持行政区名称、adcode。例：subdistrict=2 时搜索"山东"可显示市（济南）、区（历下区） |
| subdistrict | number | 否   | 0      | 显示下级行政区级数：0 不返回；1/2/3 返回下 1/2/3 级；目前仅支持到区/县级                               |
| extensions  | string | 否   | "base" | 结果控制：`base` \| `aoi,poi,road,roadinter`（可多选、逗号分隔）\| `all`                               |

## autocompleteData（输入提示）

根据用户输入的关键词查询返回 POI 建议列表。

| 参数       | 类型   | 必填   | 默认   | 说明                                                                                        |
| ---------- | ------ | ------ | ------ | ------------------------------------------------------------------------------------------- |
| serviceUrl | string | 是     | —      | 请求服务的 baseUrl                                                                          |
| keywords   | string | 是     | —      | 搜索关键字，多关键字用 `\|` 分割                                                            |
| location   | string | 二选一 | —      | 指定位置，"经度,纬度"。city 不为空且 location 在 city 内时优先用 location，否则以 city 为主 |
| city       | string | 二选一 | —      | 行政区划名或 adcode 作为搜索范围，不支持区县级；可搭配 citylimit 严格限制                   |
| citylimit  | string | 否     | —      | 仅返回指定城市数据：true/false                                                              |
| extensions | string | 否     | "base" | base 基本信息；all 详细信息（道路等）                                                       |

## beautifyTrack（轨迹美化）

对轨迹做美化处理。

| 参数        | 类型   | 必填 | 默认 | 说明                                                                                                  |
| ----------- | ------ | ---- | ---- | ----------------------------------------------------------------------------------------------------- |
| serviceUrl  | string | 是   | —    | 请求服务的 baseUrl                                                                                    |
| cluster_dis | number | 否   | 10   | 聚合距离（米）；改善停留时轨迹点小范围跳动；0 表示不聚合                                              |
| radius      | number | 否   | 2    | 精度（米），轨迹点位置调整半径；0 时使用原始位置                                                      |
| point_list  | array  | 是   | —    | 轨迹点序列：≤1000 点、里程 ≤200km、≥2 点。每个 point 必含 `lat,lon,tm`，可选 `sp,dir`，其余字段被舍弃 |

point 字段：`tm` UNIX 时间戳（秒）；`sp` 速度（km/h）；`dir` 方向（正北为 0，顺时针 0~360°）。

## drivingData（驾车路径规划）

通过起终点及途经点、避让区域等信息，针对不同策略规划最优行驶路线。

| 参数          | 类型   | 必填 | 默认 | 说明                                                                                                                                               |
| ------------- | ------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| serviceUrl    | string | 是   | —    | 请求服务的 baseUrl                                                                                                                                 |
| origin        | string | 是   | —    | 起点，"经度,纬度"                                                                                                                                  |
| destination   | string | 是   | —    | 终点，"经度,纬度"                                                                                                                                  |
| heading       | number | 否   | —    | 起点车头方向，0-359                                                                                                                                |
| avoidpolygons | string | 否   | —    | 避让区域：≤32 个区域、每区域 ≤16 顶点；坐标点间 `;` 分隔、区域间 `\|` 分隔                                                                         |
| avoidpoints   | string | 否   | —    | 避让点：`lng,lat;radius`（半径/米），多点间 `\|` 分隔；≤32 个，半径最大 5km（原文档此处键名带笔误撇号 `avoidpoints'`）                             |
| waypoints     | string | 否   | —    | 途经点：坐标间 `;` 分隔，≤50 点，按输入顺序规划                                                                                                    |
| strategy      | number | 否   | 0    | 0 默认；1 最短距离(仅 1 条)；2 不走高速；3 高速优先；4 少收费；5 躲避拥堵；6 躲堵&高速优先；7 躲堵&不走高速；8 躲堵&少收费；9 躲堵&不走高速&少收费 |
| ferry         | number | 否   | 0    | 0 使用渡轮；1 不使用                                                                                                                               |
| alternatives  | number | 否   | 0    | 0 返回 1 条；1 返回 1-3 条备选路线                                                                                                                 |
| cartype       | number | 否   | 0    | 车辆类型（影响限行）：0 普通；1 新能源；2 插电混动                                                                                                 |
| plate_number  | string | 否   | —    | 车牌号（含省份、字母大写），用于限行判断；支持 6 位传统/7 位新能源                                                                                 |
| linkinfo      | number | 否   | 0    | 是否返回 link 详情（linkid、车速等）：0/1                                                                                                          |
| lang          | number | 否   | 0    | 0 中文；1 英文                                                                                                                                     |

## geocodingData（地理编码）

将结构化地址转换为经纬度坐标；支持地标性名胜景区、建筑名称解析。

| 参数       | 类型   | 必填 | 默认 | 说明                                                                                                             |
| ---------- | ------ | ---- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| serviceUrl | string | 是   | —    | 请求服务的 baseUrl                                                                                               |
| address    | string | 是   | —    | 待解析地址，≤84 字节。①标准结构化地址（越完整精度越高）；②"路和路交叉口"描述方式（仅当地址库存在该描述时有返回） |
| city       | string | 否   | —    | 指定地址所在城市，多城市同名时起过滤作用，但不限制坐标召回城市                                                   |

## kpilesKeywords（里程桩关键字查询）

通过里程桩桩号、偏移量、道路方向搜索里程桩的信息及位置。

| 参数        | 类型   | 必填 | 默认 | 说明                                                                                                                                                                             |
| ----------- | ------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| serviceUrl  | string | 是   | —    | 请求服务的 baseUrl                                                                                                                                                               |
| format_name | string | 否   | —    | 格式化里程桩名称，如 `G15+K140+130`，结构"道路编号+方向+桩号+偏移"；不为空时优先使用。道路编号：G 国道/S 省道/X 县道/Y 乡道/Z 专用公路；`+` 上行、`-` 下行；偏移只处理 1000 米内 |
| name        | string | 否   | —    | 道路 id 或道路名称（可模糊）                                                                                                                                                     |
| kpile       | string | 否   | —    | 里程桩号（名称/桩号/偏移/方向越详细越准确）                                                                                                                                      |
| offset      | string | 否   | —    | 偏移距离，<1000                                                                                                                                                                  |
| direction   | string | 否   | —    | 道路方向：1 上行（桩号由小到大）；2 下行                                                                                                                                         |

## kpilesLocation（坐标查里程桩）

通过坐标反查里程桩信息。

| 参数       | 类型   | 必填 | 默认 | 说明                                     |
| ---------- | ------ | ---- | ---- | ---------------------------------------- |
| serviceUrl | string | 是   | —    | 请求服务的 baseUrl                       |
| location   | string | 是   | —    | "经度,纬度"；多对坐标用 `;` 分隔，≤10 对 |
| direction  | string | 否   | —    | 道路方向：1 上行；2 下行                 |

## matchHistoricalTrack（历史轨迹匹配纠偏）

对历史 GPS 点进行匹配（纠偏）处理。

| 参数           | 类型   | 必填 | 默认                                                      | 说明                                                                                                                                                                                                                        |
| -------------- | ------ | ---- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| serviceUrl     | string | 是   | —                                                         | 请求服务的 baseUrl                                                                                                                                                                                                          |
| deviceid       | string | 是   | —                                                         | 设备 ID，作为轨迹段落区分用                                                                                                                                                                                                 |
| coordtype      | string | 是   | —                                                         | 坐标系：`02` 国测局；`84` GPS                                                                                                                                                                                               |
| rectify_option | string | 否   | `denoise_grade=1\|yaw_dis=200\|yaw_ang=120\|mode=driving` | 纠偏设置，多项用 `\|` 分隔。`denoise_grade` 去噪力度 [0,4]（0 不去噪；越大去除精度越低的点，4 仅保留 GPS 点）；`yaw_dis` 距离偏航容忍度 [20,400] 米；`yaw_ang` 角度偏航容忍度 [20,300] 度；`mode=driving`（walking 未开放） |
| fill_mode      | string | 否   | —                                                         | 中断（两点直线距离 >2km）补充：`no_fill` 不补、`straight` 直线、`driving` 最短驾车、`walking` 最短步行                                                                                                                      |
| extensions     | string | 否   | —                                                         | `base` 基础信息；`road_info` 增加道路等级 road_grade、限速 limit_speed、道路名 road_name                                                                                                                                    |
| point_list     | Array  | 是   | —                                                         | ≤1000 点、里程 ≤200km、≥2 点；每点必含 `lat,lon,tm`，可选 `sp,dir`（文档另提及 height,radius），其余舍弃                                                                                                                    |

## matchRealtimeTrack（实时轨迹匹配）

对实时 GPS 点进行匹配处理。

| 参数           | 类型   | 必填 | 默认     | 说明                                                                                 |
| -------------- | ------ | ---- | -------- | ------------------------------------------------------------------------------------ |
| serviceUrl     | string | 是   | —        | 请求服务的 baseUrl                                                                   |
| deviceid       | string | 是   | —        | 设备 ID                                                                              |
| coordtype      | string | 是   | —        | `02` 国测局；`84` GPS                                                                |
| rectify_option | string | 否   | 同上默认 | 同 matchHistoricalTrack 的 rectify_option                                            |
| extensions     | string | 否   | —        | `base` / `road_info`                                                                 |
| trackpoint     | object | 是   | —        | 当前点：必含 `lat,lon`，可选 `tm,sp,dir,height,radius`，其余舍弃                     |
| historypoints  | array  | 否   | —        | 历史点集合：≤5 个点、里程 ≤200km；每点必含 `lat,lon`，可选 `tm,sp,dir,height,radius` |

## placeSearchAroundData（周边搜索）

通过关键字、类型、周边范围等参数搜索 POI。

| 参数       | 类型   | 必填 | 默认   | 说明                                                    |
| ---------- | ------ | ---- | ------ | ------------------------------------------------------- |
| serviceUrl | string | 是   | —      | 请求服务的 baseUrl                                      |
| keywords   | string | 是   | —      | 搜索关键字，多关键字 `\|` 分割                          |
| type       | string | 是   | —      | 指定分类，多个用 `,` 分隔，如"公交站"、"大学,中学"      |
| location   | string | 是   | —      | 中心位置"经度,纬度"（与 city 必填 1 个，优先 location） |
| radius     | number | 否   | 1000   | 搜索半径（米），0-10000，超按 10000                     |
| citylimit  | string | 否   | —      | 仅返回指定城市数据：true/false                          |
| orderby    | string | 否   | —      | weight 综合排序；hit 热度排序                           |
| children   | number | 否   | 0      | 0 子 POI 都显示；1 子 POI 归类到父 POI                  |
| extensions | string | 否   | "base" | base/all                                                |
| page_size  | number | 否   | 10     | 单页数量，最大 20                                       |
| page_idx   | number | 否   | 1      | 页码，最大 20 页                                        |

## placeSearchByID（ID 详情）

通过 ID 查询某个要素详情，建议和联想提示接口配合使用。

| 参数       | 类型   | 必填 | 默认   | 说明                                                  |
| ---------- | ------ | ---- | ------ | ----------------------------------------------------- |
| serviceUrl | string | 是   | —      | 请求服务的 baseUrl                                    |
| id         | string | 是   | —      | 兴趣点/道路/要素面的唯一标识 ID                       |
| type       | number | 否   | 0      | 0 点；1 线；2 面——目前仅支持点要素，1 和 2 返回无结果 |
| children   | number | 否   | 0      | 子 POI 归类开关                                       |
| extensions | string | 否   | "base" | base/all                                              |

## placeSearchByLineData（沿线搜索）

通过关键字、线段范围等条件搜索沿线 POI。

| 参数       | 类型   | 必填 | 默认     | 说明                                  |
| ---------- | ------ | ---- | -------- | ------------------------------------- |
| serviceUrl | string | 是   | —        | 请求服务的 baseUrl                    |
| keywords   | string | 是   | —        | 搜索关键字，多关键字 `\|` 分割        |
| line       | string | 是   | —        | 搜索线路："经度,纬度"，点间 `;` 分隔  |
| range      | number | 否   | 3000     | 沿线外扩半径（米），0-5000，超按 5000 |
| type       | string | 否   | —        | 分类，多个 `,` 分隔                   |
| orderby    | string | 否   | "weight" | weight/hit                            |
| children   | number | 否   | 0        | 子 POI 归类开关                       |
| extensions | string | 否   | "base"   | base/all                              |
| page_size  | number | 否   | 10       | 最大 20                               |
| page_idx   | number | 否   | 1        | 最大 20 页                            |

## placeSearchInBoundsData（多边形区域搜索）

通过关键字、类型、多边形区域搜索 POI。

| 参数       | 类型   | 必填 | 默认     | 说明                                                                                      |
| ---------- | ------ | ---- | -------- | ----------------------------------------------------------------------------------------- |
| serviceUrl | string | 是   | —        | 请求服务的 baseUrl                                                                        |
| keywords   | string | 是   | —        | 多关键字 `\|` 分割                                                                        |
| type       | string | 否   | —        | 分类，`,` 分隔                                                                            |
| location   | string | 否   | —        | 与 city 必填 1 个（参照周边搜索规则）                                                     |
| polygon    | string | 是   | —        | "经度,纬度"；≥2 点；非自相交多边形；2 点直接为矩形左下/右上点；其他情况首尾坐标对必须相同 |
| citylimit  | string | 否   | false    | true/false                                                                                |
| orderby    | string | 否   | 'weight' | weight/hit                                                                                |
| children   | number | 否   | 0        | 子 POI 归类开关                                                                           |
| extensions | string | 否   | 'base'   | base/all                                                                                  |
| page_size  | number | 否   | 10       | 最大 20                                                                                   |
| page_idx   | number | 否   | 1        | 最大 20 页                                                                                |

## placeSearchKeywordData（关键字搜索）

通过 POI 关键字和类型等条件搜索 POI。

| 参数       | 类型   | 必填   | 默认     | 说明                              |
| ---------- | ------ | ------ | -------- | --------------------------------- |
| serviceUrl | string | 是     | —        | 请求服务的 baseUrl                |
| keywords   | string | 是     | —        | 多关键字 `\|` 分割                |
| type       | string | 否     | —        | 分类，`,` 分隔                    |
| location   | string | 二选一 | —        | "经度,纬度"（与 city 必填 1 个）  |
| city       | string | 二选一 | —        | 行政区划名或 adcode，不支持区县级 |
| citylimit  | string | 否     | false    | 仅返回指定城市数据                |
| orderby    | string | 否     | 'weight' | weight/hit                        |
| children   | number | 否     | 0        | 子 POI 归类开关                   |
| extensions | string | 否     | 'base'   | base/all                          |
| page_size  | number | 否     | 10       | 最大 20                           |
| page_idx   | number | 否     | 1        | 最大 20 页                        |

## placeSearchRoadData（道路搜索）

通过道路名称及范围搜索道路信息（道路名称、种别、形状等）。

| 参数       | 类型   | 必填   | 默认 | 说明                                      |
| ---------- | ------ | ------ | ---- | ----------------------------------------- |
| serviceUrl | string | 是     | —    | 请求服务的 baseUrl                        |
| keywords   | string | 是     | —    | 道路名称关键字                            |
| location   | string | 二选一 | —    | "经度,纬度"（与 city 必填 1 个）          |
| city       | string | 二选一 | —    | adcode/城市名称                           |
| citylimit  | string | 否     | —    | true/false，配合 city 约束仅召回指定 city |
| orderby    | string | 否     | —    | weight/hit                                |
| extensions | string | 否     | —    | base/all                                  |
| page_size  | number | 否     | 10   | 最大 20                                   |
| page_idx   | number | 否     | 1    | 最大 20 页                                |

## reacharea（到达圈）

从起点按时间/距离计算可达范围。

| 参数       | 类型   | 必填   | 默认 | 说明                                                                      |
| ---------- | ------ | ------ | ---- | ------------------------------------------------------------------------- |
| serviceUrl | string | 是     | —    | 请求服务的 baseUrl                                                        |
| origin     | string | 是     | —    | 起点"经度,纬度"，小数点后不超过 6 位                                      |
| time       | number | 二选一 | —    | 到达时间（分钟），如 50                                                   |
| distance   | number | 二选一 | —    | 到达距离（米）。与 time 必须存在一个，同时存在以 time 为主、忽略 distance |
| type       | number | 否     | 0    | 0 驾车；1 步行                                                            |
| smooth     | number | 否     | 1    | 0 不平滑；1 平滑                                                          |

## reverseDistrict（坐标反查行政区）

获取坐标点所在行政区信息，可获取特定级别行政区划的形状点。

| 参数       | 类型   | 必填 | 默认 | 说明                                                          |
| ---------- | ------ | ---- | ---- | ------------------------------------------------------------- |
| serviceUrl | string | 是   | —    | 请求服务的 baseUrl                                            |
| location   | string | 是   | —    | "经度,纬度"（02 或 GPS 坐标）                                 |
| coordtype  | string | 否   | —    | `02` 国测局；`84` GPS                                         |
| level      | string | 否   | —    | 获取行政区形状点级别：province/city/district/town/village     |
| extensions | string | 否   | —    | base 不返回边界坐标点；all 返回当前查询 district 的边界坐标点 |

## reverseGeocodingData（逆地理编码）

通过经纬度、POI 类型等返回结构化地址和 POI、AOI、Road 等数据。

| 参数       | 类型   | 必填 | 默认 | 说明                                                                                                                         |
| ---------- | ------ | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| serviceUrl | string | 是   | —    | 请求服务的 baseUrl                                                                                                           |
| location   | string | 是   | —    | "经度,纬度"；多对用 `;` 分隔，≤10 对                                                                                         |
| type       | string | 否   | —    | 指定返回附近 POI 类型，支持类型文字或种别代码（如 `type=公交站`、`type=大学,中学`、`type=110101`），多个 `,` 分隔            |
| typelimint | string | 否   | —    | 不返回指定的 POI 类型（extensions 含 poi 时相关），多个 `,` 分隔。原文档键名即 `typelimint`，疑为 typelimit 笔误，按文档使用 |
| coordtype  | number | 否   | —    | `02` 国测局；`84` GPS                                                                                                        |
| radius     | number | 否   | 500  | 搜索半径（米），0~3000（基站大偏差场景用 3000；精细化定位用 500）                                                            |
| extensions | string | 否   | base | `base` \| `aoi,poi,road,roadinter`（可多选逗号分隔）\| `all`；结构化地址始终返回                                             |
| orderby    | string | 否   | —    | 需 extensions 含 poi 才生效：weight 重要性优先；distance 直线距离近优先；hit 热度优先                                        |

## similarityTrack（轨迹重合度）

对轨迹与基准路径做重合度判断。

| 参数       | 类型   | 必填 | 默认 | 说明                                                                                 |
| ---------- | ------ | ---- | ---- | ------------------------------------------------------------------------------------ |
| serviceUrl | string | 是   | —    | 请求服务的 baseUrl                                                                   |
| yaw_dis    | number | 否   | 200  | 距离偏航容忍度 [20,400] 米                                                           |
| yaw_ang    | number | 否   | 120  | 角度偏航容忍度 [20,300] 度                                                           |
| basepath   | array  | 是   | —    | 基准路径，每点含 `lon,lat,tm,sp,dir`（tm UNIX 秒；sp km/h；dir 正北 0 顺时针 0~360） |
| point_list | array  | 是   | —    | 轨迹点序列：≤1000 点、里程 ≤200km、≥2 点；每点必含 `lat,lon,tm`，可选 `sp,dir`       |

## staypointTrack（停留点分析）

分析轨迹中的停留点。

| 参数        | 类型   | 必填 | 默认 | 说明                                                                              |
| ----------- | ------ | ---- | ---- | --------------------------------------------------------------------------------- |
| serviceUrl  | string | 是   | —    | 请求服务的 baseUrl                                                                |
| stay_time   | number | 否   | 600  | 停留时间（秒）：在 stay_radius 范围内停留超过该时间计为一次停留                   |
| stay_radius | number | 否   | 20   | 停留半径（米），[1,500]                                                           |
| point_list  | array  | 是   | —    | 同 similarityTrack：≤1000 点、≤200km、≥2 点；每点必含 `lat,lon,tm`，可选 `sp,dir` |

## truckDrivingData（货车路径规划）

针对不同货车类型规划最优货车行驶路线。包含 [drivingData](#drivingdata驾车路径规划) 的全部参数（origin/destination/heading/avoidpolygons/avoidpoints/waypoints/strategy/ferry/alternatives/cartype/plate_number/linkinfo/lang），并增加货车专属参数：

| 参数          | 类型   | 必填 | 默认 | 说明                                                                     |
| ------------- | ------ | ---- | ---- | ------------------------------------------------------------------------ |
| height        | number | 否   | 1.6  | 车高（米），[0,25.5]，严格按填写数字做限行规避                           |
| width         | number | 否   | 2.5  | 车宽（米），[0,25.5]                                                     |
| weight        | number | 否   | 10   | 车辆总重（吨），[0,100]；总重=核定载重+自重                              |
| length        | number | 否   | 4.2  | 车长（米），[0,20.0]                                                     |
| axle_weight   | number | 否   | 2    | 轴重（吨），[0,50]                                                       |
| axle_count    | number | 否   | 2    | 轴数（个），[0,255]                                                      |
| passport      | number | 否   | 0    | 是否有通行证：0 有（默认）；1 无                                         |
| emisson_limit | number | 否   | —    | 排放标准 1-6，对应国 I-国 VI                                             |
| load          | number | 否   | 0.9  | 核定载重（吨），[0,100)，可装载货物最大重量                              |
| is_trailer    | number | 否   | 0    | 是否挂车：0 否；1 是                                                     |
| size          | number | 是   | —    | 货车负载类型：1 微型(≤1.8t)；2 轻型(1.8-6t]；3 中型(6-14t]；4 重型(≥14t) |

> 原文档货车表中备选路线参数键名写作 `alternatives0`，疑为 `alternatives` 笔误。

## walkingData（步行路径规划）

通过起终点等信息规划最优人行路线。

| 参数         | 类型   | 必填 | 默认 | 说明                       |
| ------------ | ------ | ---- | ---- | -------------------------- |
| serviceUrl   | string | 是   | —    | 请求服务的 baseUrl         |
| origin       | string | 是   | —    | 起点"经度,纬度"            |
| destination  | string | 是   | —    | 终点"经度,纬度"            |
| alternatives | number | 否   | 0    | 0 返回 1 条；1 返回 1-3 条 |
| lang         | number | 否   | 0    | 0 中文；1 英文             |
