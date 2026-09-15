# 地点输入提示（suggestion）

## 接口介绍

| 项       | 值                                                                 |
| -------- | ------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/integrated/v2/suggestion |
| 请求方式 | GET、POST                                                          |
| 服务描述 | 根据用户输入的关键词查询返回建议列表。                             |

## 参数说明

| 参数        | 类型    | 位置           | 说明                                                                                                                                         |
| ----------- | ------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| keywords    | string  | URL 或表单参数 | 查询关键字，必填                                                                                                                             |
| types       | string  | URL 或表单参数 | 服务可支持传入多个分类，多个类型剑用“\|”或者空格分隔 可选值：POI 分类名称、分类代码 此处强烈建议使用分类代码，否则可能会得到不符合预期的结果 |
| region      | string  | URL 或表单参数 | 限制返回该行政区名称内的列表                                                                                                                 |
| limitRegion | boolean | URL 或表单参数 | 是否开启行政区划过滤，可选，默认 falase                                                                                                      |
| key         | string  | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                         |

## 数据返回 JSON 报文格式

| 字段                         | 含义            | 说明                                                        |
| ---------------------------- | --------------- | ----------------------------------------------------------- |
| code                         | 返回结果状态    | 值为整数编号，0表示成功；其他表示失败                       |
| msg                          | 返回状态消息    | 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。 |
| data                         | 建议记录列表    |                                                             |
| data.suggestion              | 建议记录信息    |                                                             |
| data.suggestion.uuid         | POI唯一编码     |                                                             |
| data.suggestion.name         | POI名称         |                                                             |
| data.suggestion.type         | POI类型         |                                                             |
| data.suggestion.address      | POI地址         |                                                             |
| data.suggestion.province     | POI所属省份     |                                                             |
| data.suggestion.city         | POI所属地市     |                                                             |
| data.suggestion.adminname    | POI所属区县     |                                                             |
| data.suggestion.admincode    | POI所属区县编码 |                                                             |
| data.suggestion.town         | POI所属镇级     |                                                             |
| data.suggestion.village      | POI所属村级     |                                                             |
| data.suggestion.similarity   | POI相似性       |                                                             |
| data.suggestion.feature_type | 要素类型        |                                                             |
| data.suggestion.geometry     | 几何数据        |                                                             |
| data.suggestion.level        | 兴趣点          |                                                             |
| data.suggestion.location     | 位置经纬度      |                                                             |
| data.suggestion.location.lng | 经度            |                                                             |
| data.suggestion.location.lat | 纬度            |                                                             |

## 请求样例

http://ip:port/tianjing-server/lbs-api/integrated/v2/suggestion?key=552280e3-8cbd-49a1-9d2a-9010045bc492&keywords=万达&types=&region=西安市&limitRegion=true

### 接口返回示例：

```json
{
    "msg": "ok",
    "code": 0,
    "data": [
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
            "location": {
                "lng": 108.89086217599811,
                "lat": 34.204445179122
            },
            "geometry": "POINT(108.890862175998 34.204445179122)"
        },
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
            "location": {
                "lng": 108.88870140229675,
                "lat": 34.20784982809763
            },
            "geometry": "POINT(108.888701402297 34.2078498280976)"
        },
        {
            "feature_type": "poi",
            "level": "兴趣点",
```

> 示例响应共 386 行，此处省略其后 341 行示例数据；字段结构以本节说明为准。

## 注意事项与已知文档问题

- `limitRegion` 默认值拼写为 `falase`（应为 `false`）
- 文字笔误「多个类型剑用」（应为「间用」）
- `types` 建议传分类代码而非分类名称，否则召回可能不符合预期。
