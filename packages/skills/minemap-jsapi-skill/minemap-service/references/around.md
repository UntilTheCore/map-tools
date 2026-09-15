# 周边综合搜索（around）

## 接口介绍

| 项       | 值                                                                       |
| -------- | ------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/integrated/v2/around           |
| 请求方式 | GET、POST                                                                |
| 服务描述 | 通过用POI的关键字和类型、中心位置、查找半径等条件搜索满足对应条件的POI。 |

## 参数说明

| 参数        | 类型    | 位置           | 说明                                                                                                                                         |
| ----------- | ------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| keywords    | string  | URL 或表单参数 | 查询关键字，关键字或类型必填一项                                                                                                             |
| types       | string  | URL 或表单参数 | 服务可支持传入多个分类，多个类型剑用“\|”或者空格分隔 可选值：POI 分类名称、分类代码 此处强烈建议使用分类代码，否则可能会得到不符合预期的结果 |
| location    | string  | URL 或表单参数 | 位置经纬度，格式：经度,纬度。必填。                                                                                                          |
| radius      | double  | URL 或表单参数 | 查询周边距离，单位米。默认 1000,                                                                                                             |
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
| features.poi.distance     | 距离            |                                                             |
| features.poi.location     | 位置经纬度      |                                                             |
| features.poi.location.lng | 经度            |                                                             |
| features.poi.location.lat | 纬度            |                                                             |

## 请求样例

http://ip:port/tianjing-server/lbs-api/integrated/v2/around?key=552280e3-8cbd-49a1-9d2a-9010045bc492&keywords=药房&types=&region=&limitRegion=false&pageSize=10&pageNum=-1&location=108.95944442156124,34.207131059437764&radius=1000

### 接口返回示例：

```json
{
    "msg": "ok",
    "hits": 9,
    "features": [
        {
            "feature_type": "poi",
            "level": "兴趣点",
            "type": "批发、零售;医药及医疗器材零售;药品零售",
            "uuid": "babbe144-025a-4059-ac50-ed8140cbc5cd",
            "name": "堂古大药房",
            "province": "陕西省",
            "city": "西安市",
            "admincode": "610113",
            "adminname": "雁塔区",
            "town": "",
            "village": "",
            "address": "雁南三路138西北方向30米",
            "similarity": 0.125,
            "location": {
                "lng": 108.9552471406763,
                "lat": 34.20547835498918
            },
            "geometry": "POINT(108.955247140676 34.2054783549892)",
            "distance": 427.49944044304704
        },
        {
            "feature_type": "poi",
            "level": "兴趣点",
            "type": "批发、零售;医药及医疗器材零售;药品零售",
            "uuid": "07ddd05b-a3c3-4b98-9cb1-33d3e6d53f13",
            "name": "万百泉大药房翠华路分公司",
            "province": "陕西省",
            "city": "西安市",
            "admincode": "610113",
            "adminname": "雁塔区",
            "town": "",
            "village": "",
            "address": "翠华南路19-2",
            "similarity": 0.0,
            "location": {
                "lng": 108.95184962298306,
                "lat": 34.21092692038451
            },
            "geometry": "POINT(108.951849622983 34.2109269203845)",
            "distance": 816.0346287615225
```

> 示例响应共 196 行，此处省略其后 151 行示例数据；字段结构以本节说明为准。

## 注意事项与已知文档问题

- `limitRegion` 默认值拼写为 `falase`（应为 `false`）
- 文字笔误「多个类型剑用」（应为「间用」）
- `radius` 默认 1000 米，文档描述末尾带多余逗号。
