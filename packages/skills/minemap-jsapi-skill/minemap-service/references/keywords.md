# 地名综合查询（keywords）

## 接口介绍

| 项       | 值                                                               |
| -------- | ---------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/integrated/v2/keywords |
| 请求方式 | GET、POST                                                        |
| 服务描述 | 通过用POI的关键字和类型等条件搜索满足对应条件的POI。             |

## 参数说明

| 参数        | 类型    | 位置           | 说明                                                                                                                                         |
| ----------- | ------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| keywords    | string  | URL 或表单参数 | 查询关键字，关键字或类型必填一项                                                                                                             |
| types       | string  | URL 或表单参数 | 服务可支持传入多个分类，多个类型剑用“\|”或者空格分隔 可选值：POI 分类名称、分类代码 此处强烈建议使用分类代码，否则可能会得到不符合预期的结果 |
| location    | string  | URL 或表单参数 | 位置经纬度，格式：经度,纬度                                                                                                                  |
| region      | string  | URL 或表单参数 | 限制返回该行政区名称内的列表                                                                                                                 |
| limitRegion | boolean | URL 或表单参数 | 是否开启行政区划过滤，可选，默认 falase                                                                                                      |
| pageSize    | int     | URL 或表单参数 | 分页查询，分页大小，默认 20                                                                                                                  |
| pageNum     | int     | URL 或表单参数 | 分页查询页码，默认 0                                                                                                                         |
| key         | string  | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                         |

## 数据返回 JSON 报文格式

| 字段                      | 含义            | 说明                                                        |
| ------------------------- | --------------- | ----------------------------------------------------------- |
| code                      | 返回结果状态    | 值为整数编号，0表示成功；其他表示失败                       |
| msg                       | 返回状态消息    | 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。 |
| hits                      | 总记录数        |                                                             |
| features                  | POI列表         |                                                             |
| features.poi              | POI信息         |                                                             |
| features.poi.uuid         | POI唯一编码     |                                                             |
| features.poi.name         | POI名称         |                                                             |
| features.poi.type         | POI类型         |                                                             |
| features.poi.address      | POI地址         |                                                             |
| features.poi.province     | POI所属省份     |                                                             |
| features.poi.city         | POI所属地市     |                                                             |
| features.poi.adminname    | POI所属区县     |                                                             |
| features.poi.admincode    | POI所属区县编码 |                                                             |
| features.poi.town         | POI所属镇级     |                                                             |
| features.poi.village      | POI所属村级     |                                                             |
| features.poi.similarity   | POI相似性       |                                                             |
| features.poi.feature_type | 要素类型        |                                                             |
| features.poi.geometry     | 几何数据        |                                                             |
| features.poi.level        | 兴趣点          |                                                             |
| features.poi.location     | 位置经纬度      |                                                             |
| features.poi.location.lng | 经度            |                                                             |
| features.poi.location.lat | 纬度            |                                                             |

## 请求样例

http://ip:port/tianjing-server/lbs-api/integrated/v2/keywords?key=552280e3-8cbd-49a1-9d2a-9010045bc492&keywords=万达&types=&region=西安市&limitRegion=true&pageSize=10&pageNum=0

### 接口返回示例：

```json
{
    "msg": "ok",
    "hits": 1333,
    "features": [
        {
            "feature_type": "poi",
            "level": "兴趣点",
            "type": "住、宿;居民住宿;小区",
            "uuid": "7eff6222-da8c-492f-a42a-903cebd17908",
            "name": "万达·天玺",
            "province": "陕西省",
            "city": "西安市",
            "admincode": "610113",
            "adminname": "雁塔区",
            "town": "",
            "village": "",
            "address": "高新路1010号5-10116东南方向50米",
            "similarity": 0.5,
            "location": {
                "lng": 108.88870140229675,
                "lat": 34.20784982809763
            },
            "geometry": "POINT(108.888701402297 34.2078498280976)"
        },
        {
            "feature_type": "poi",
            "level": "兴趣点",
            "type": "住、宿;居民住宿;小区",
            "uuid": "9b2a8091-9c47-447b-b24b-75c6842240b2",
            "name": "万达·天越",
            "province": "陕西省",
            "city": "西安市",
            "admincode": "610113",
            "adminname": "雁塔区",
            "town": "",
            "village": "",
            "address": "高新路万达天樾小区3幢正东方向80米",
            "similarity": 0.5,
            "location": {
                "lng": 108.89086217599811,
                "lat": 34.204445179122
            },
            "geometry": "POINT(108.890862175998 34.204445179122)"
        },
        {
```

> 示例响应共 207 行，此处省略其后 162 行示例数据；字段结构以本节说明为准。

## 注意事项与已知文档问题

- `limitRegion` 默认值拼写为 `falase`（应为 `false`）
- 文字笔误「多个类型剑用」（应为「间用」）
- `keywords` 与 `types` 至少填一项。
- **返回是混合类型**：`features[].feature_type` 实测有 `road` / `road-new`（道路）、`poi` / `poi-new`（兴趣点）、`aoi-new`（区域）。**按路名查道路时须筛 `feature_type.startsWith("road")`**；同名道路会返回多条（分段），画完整道路需合并几何。道路的 `geometry` 是 WKT `LINESTRING`，POI 是 `POINT`，同一字段两种几何类型。
- **`region` 决定检索范围**。私有部署实测：同一 `keywords=万达`，`region=重庆市` 返回 `hits:9986`，`region=北京市` / `浙江省` 返回 `hits:0`，不传时结果也集中在重庆——当前部署的检索数据限定在重庆。
- **搜完整路名才稳定命中道路**。实测 `中山三路` / `长江一路` / `解放路` / `龙溪路` 返回 `road*`；泛词（如 `路`）返回的几乎全是 POI / AOI。
- **中文参数必须 UTF-8 编码**。用 GBK 编码请求会静默返回 `hits:0`（无报错），排查时优先确认编码。
- 返回字段比文档表格更丰富：实测还有 `features[].uuid`、`.weight`、`.level`、`.similarity`、`.type`（道路等级，如 `城市二级道路` / `省道`）。
