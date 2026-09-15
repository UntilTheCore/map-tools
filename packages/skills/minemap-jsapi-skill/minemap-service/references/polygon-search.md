# 多边形区域综合搜索（polygon）

## 接口介绍

| 项       | 值                                                                  |
| -------- | ------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/integrated/v2/polygon     |
| 请求方式 | GET、POST                                                           |
| 服务描述 | 通过用 POI 的关键字和类型、多边形范围等条件搜索满足对应条件的 POI。 |

## 参数说明

| 参数     | 类型   | 位置           | 说明                                                                                                                                                                                                                      |
| -------- | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| keywords | string | URL 或表单参数 | 查询关键字，关键字或类型必填一项                                                                                                                                                                                          |
| types    | string | URL 或表单参数 | 服务可支持传入多个分类，多个类型剑用“\|”或者空格分隔 可选值：POI 分类名称、分类代码 此处强烈建议使用分类代码，否则可能会得到不符合预期的结果                                                                              |
| polygon  | string | URL 或表单参数 | 多边形图形，支持 WKT 格式（POLYGON、MULTIPOLYGON）、坐标串格式、BBOX 格式。坐标串格式以“;”分隔坐标点，坐标点经度和纬度以“,”分隔，首尾坐标必须相同。BBOX 格式代表一个矩形范围，格式如下：BBOX[xmin,ymin,xmax,ymax]。必填。 |
| pageSize | int    | URL 或表单参数 | 分页查询，分页大小，默认 20                                                                                                                                                                                               |
| pageNum  | int    | URL 或表单参数 | 分页查询页码，默认 0                                                                                                                                                                                                      |
| key      | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                                                                      |

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

http://ip:port/tianjing-server/lbs-api/integrated/v2/polygon?key=552280e3-8cbd-49a1-9d2a-9010045bc492&keywords=药店&types=&pageSize=10&pageNum=0&polygon=POLYGON%20((108.91983171748143%2034.25252226941019,%20108.9199560878962%2034.242241618556506,%20108.94159654018824%2034.24219021214721,%20108.94128561414925%2034.25231666870094,%20108.94022846561762%2034.2525736695093,%20108.91983171748143%2034.25252226941019))

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
      "uuid": "0242a4db-f4e1-4db5-83db-2117d267955c",
      "name": "永安药店",
      "province": "陕西省",
      "city": "西安市",
      "admincode": "610103",
      "adminname": "碑林区",
      "town": "",
      "village": "",
      "address": "大学南路付6号",
      "similarity": 0.1428571492433548,
      "location": {
        "lng": 108.92531501465884,
        "lat": 34.24757641239538
      },
      "geometry": "POINT(108.925315014659 34.2475764123954)"
    },
    {
      "feature_type": "poi",
      "level": "兴趣点",
      "type": "批发、零售;医药及医疗器材零售;药品零售",
      "uuid": "c5217c70-a306-4f25-92f4-43bd80cab088",
      "name": "同一医药新特药店",
      "province": "陕西省",
      "city": "西安市",
      "admincode": "610103",
      "adminname": "碑林区",
      "town": "",
      "village": "",
      "address": "友谊西路243号",
      "similarity": 0.09090909361839294,
      "location": {
        "lng": 108.92579447664565,
        "lat": 34.24287769378261
      },
      "geometry": "POINT(108.925794476646 34.2428776937826)"
    }
  ],
  "code": 0
}
```

## 注意事项与已知文档问题

- 文字笔误「多个类型剑用」（应为「间用」）
- `polygon` 支持 WKT、坐标串、BBOX 三种格式；坐标串首尾坐标必须相同。
