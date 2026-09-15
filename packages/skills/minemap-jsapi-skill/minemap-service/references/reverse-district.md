# 逆行政区划查询（reverse district）

## 接口介绍

| 项       | 值                                                                  |
| -------- | ------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/place/v2/reverse/district |
| 请求方式 | GET、POST                                                           |
| 服务描述 | 获取坐标点所在的行政区的相关信息                                    |

## 参数说明

| 参数       | 类型   | 位置           | 说明                                                                                                                                                                         |
| ---------- | ------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| location   | string | URL 或表单参数 | 查询的位置坐标，格式：经度,纬度。必填。                                                                                                                                      |
| coordtype  | string | URL 或表单参数 | 坐标类型，可选值：02、84。 02： GCJ02 坐标； 84： WGS84 坐标，即 GPS 坐标。 可选。默认值 84。                                                                                |
| extensions | string | URL 或表单参数 | 此项控制行政区信息中返回行政区边界坐标点； 可选值：base、all; base:不返回行政区边界坐标点； all:只返回当前查询 district 的边界值，不返回子节点的边界值； 默认值 base。，可选 |
| district   | string | URL 或表单参数 | 控制返回边界图形的行政区划级别，可选值：province、city、district。 province: 返回省区划边界图形； city: 返回地市区划边界图形； district: 返回区县区划边界图形。              |
| key        | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                         |

## 数据返回 JSON 报文格式

| 字段                       | 含义           | 说明                                                        |
| -------------------------- | -------------- | ----------------------------------------------------------- |
| code                       | 返回结果状态   | 值为整数编号，0表示成功；其他表示失败                       |
| msg                        | 返回状态消息   | 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。 |
| msg.district               | 行政区信息     |                                                             |
| msg.district.provice_code  | 省份编码       |                                                             |
| msg.district.city_code     | 城市编码       |                                                             |
| msg.district.district_code | 区县编码       |                                                             |
| msg.district.province      | 省区划名称     |                                                             |
| msg.district.city          | 地市区划名称   |                                                             |
| msg.district.county        | 区县区划名称   |                                                             |
| msg.district.polygon       | 行政区边界几何 | WKT格式的多边形图形，extensions参数为all时返回。            |

## 请求样例

http://ip:port/tianjing-server/lbs-api/place/v2/reverse/district?key=552280e3-8cbd-49a1-9d2a-9010045bc492&location=102.85368892,22.76618607&extensions=all&district=district

### 接口返回示例：

```json
{
  "msg": "ok",
  "code": 0,
  "district": {
    "province": "云南省",
    "province_code": "53",
    "city": "红河哈尼族彝族自治州",
    "city_code": "5325",
    "district": "金平苗族瑶族傣族自治县",
    "district_code": "532530",
    "polygon": "POLYGON((103.24430168 23.06862609,103.24207965 23.06890756,103.23944052 23.06991241,…103.24430168 23.06862609))"
  }
}
```

## 注意事项与已知文档问题

- 返回字段拼写 `provice_code`（应为 `province_code`），以服务端实际返回为准
- `extensions=all` 只返回当前坐标所在区划的边界，不返回子节点边界；`district` 参数控制返回哪一级边界。
