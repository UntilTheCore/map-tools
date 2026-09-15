# 沿线综合搜索（line）

## 接口介绍

| 项       | 值                                                                         |
| -------- | -------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/integrated/v2/line               |
| 请求方式 | GET、POST                                                                  |
| 服务描述 | 通过用POI的关键字和类型、线图形、沿线距离范围等条件搜索满足对应条件的POI。 |

## 参数说明

| 参数     | 类型   | 位置           | 说明                                                                                                                                         |
| -------- | ------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| keywords | string | URL 或表单参数 | 查询关键字，关键字或类型必填一项                                                                                                             |
| types    | string | URL 或表单参数 | 服务可支持传入多个分类，多个类型剑用“\|”或者空格分隔 可选值：POI 分类名称、分类代码 此处强烈建议使用分类代码，否则可能会得到不符合预期的结果 |
| line     | string | URL 或表单参数 | 线图形，支持 WKT 格式（POLYLINE、MULTIPOLYLINE）和坐标串格式。坐标串格式以“;”分隔坐标点，坐标点经度和纬度以“,”分隔，首尾坐标必须相同。必填。 |
| distance | double | URL 或表单参数 | 沿线搜索范围，单位：米。默认 1000                                                                                                            |
| pageSize | int    | URL 或表单参数 | 分页查询，分页大小，默认 20                                                                                                                  |
| pageNum  | int    | URL 或表单参数 | 分页查询页码，默认 0                                                                                                                         |
| key      | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                         |

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

http://ip:port/tianjing-server/lbs-api/integrated/v2/line?key=552280e3-8cbd-49a1-9d2a-9010045bc492&keywords=药店&types=&pageSize=10&pageNum=0&line=108.95930185556097,%2034.22444146371109;108.94194716860551,%2034.224391638828365;108.9420074279343,%2034.21048934547993;108.9565299263943,%2034.2106388447056;108.95634914840548,%2034.21332978541275;108.96454441724563,%2034.213130459418295&distance=1000

### 接口返回示例：

```json
{
  "msg": "ok",
  "hits": 2,
  "features": [
    {
      "feature_type": "poi",
      "level": "兴趣点",
      "type": "批发、零售;医药及医疗器材零售;药品零售",
      "uuid": "7dd49cdf-b969-4270-ad1e-634328ca98b9",
      "name": "易圣堂药店",
      "province": "陕西省",
      "city": "西安市",
      "admincode": "610113",
      "adminname": "雁塔区",
      "town": "",
      "village": "",
      "address": "小寨西路99B",
      "similarity": 0.125,
      "location": {
        "lng": 108.9339684567922,
        "lat": 34.224494209068574
      },
      "geometry": "POINT(108.933968456792 34.2244942090686)"
    },
    {
      "feature_type": "poi",
      "level": "兴趣点",
      "type": "批发、零售;医药及医疗器材零售;药品零售",
      "uuid": "c30be870-3a56-4ca2-aeec-74c47ddd5845",
      "name": "雁塔区神农堂中药店",
      "province": "陕西省",
      "city": "西安市",
      "admincode": "610113",
      "adminname": "雁塔区",
      "town": "",
      "village": "",
      "address": "红专南路33",
      "similarity": 0.0833333358168602,
      "location": {
        "lng": 108.95031400431468,
        "lat": 34.216928049554376
      },
      "geometry": "POINT(108.950314004315 34.2169280495544)"
    }
  ],
  "code": 0
}
```

## 注意事项与已知文档问题

- 文字笔误「多个类型剑用」（应为「间用」）
- `line` 支持 WKT 与坐标串两种格式；坐标串首尾坐标必须相同。
