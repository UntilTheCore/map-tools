# 逆地理编码服务（reverse geocoding）

## 接口介绍

| 项       | 值                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/geocoding/regeo                                       |
| 请求方式 | GET、POST                                                                                       |
| 服务描述 | 通过经纬度、POI 类型、道路等级等参数信息返回结构化地址和 POI、AOI、道路、道路交叉口等数据信息。 |

## 参数说明

| 参数       | 类型   | 位置           | 说明                                                                                                                                                                                                                                                            |
| ---------- | ------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| locations  | string | URL 或表单参数 | 位置经纬度坐标：经度和纬度用' , '分隔，最大支持 10 组坐标，每组坐标用' ; '分隔。必填。                                                                                                                                                                          |
| poitypes   | string | URL 或表单参数 | 返回附近的 POI 类型。                                                                                                                                                                                                                                           |
| extensions | string | URL 或表单参数 | 返回结果控制：extensions 参数必须返回结构化地址信息；可选择返回一个或多个附近 POI 内容、道路信息、道路交叉口信息以及商圈等 AOI。extensions=base\|aoi,poi,road,roadinter\|all，其中 aoi,poi,road,roadinter 可以一个或者多个，不同参数以,分割，默认值为 base      |
| radius     | double | URL 或表单参数 | 周边距离： 默认 1000 米，取值区间： 0-3000 米                                                                                                                                                                                                                   |
| roadlevel  | int    | URL 或表单参数 | 可选值：0，1 当 roadlevel=0 时，返回所有道路当 roadlevel=1 时，过滤非主干道路，仅输出主干道路数据 。默认为 1。非必选                                                                                                                                            |
| orderby    | string | URL 或表单参数 | orderby 参数的设置可以影响召回 poi 内容的排序策略，目前提供三个可选参数：orderby=weight：将重要性更高的对 poi 内容优先返回，即优化返回结果中 pois 字段的 poi 顺序。orderby=distance：将直线距离更近的 poi 内容优先返回，即优化返回结果中 pois 字段的 poi 顺序。 |
| key        | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                                                                                                            |

## 数据返回 JSON 报文格式

| 字段                                      | 含义                         | 说明                                                        |
| ----------------------------------------- | ---------------------------- | ----------------------------------------------------------- |
| code                                      | 返回结果状态                 | 值为整数编号，0表示成功；其他表示失败                       |
| msg                                       | 返回状态消息                 | 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。 |
| msg.regeocodes                            | 逆地理编码结果               |                                                             |
| msg.regeocodes.Formatted_addres           | 结构化地址信息               |                                                             |
| msg.regeocodes.address_component          | 地址等级拆分                 |                                                             |
| msg.regeocodes.address_component.country  | 国家                         |                                                             |
| msg.regeocodes.address_component.province | 省份                         |                                                             |
| msg.regeocodes.address_component.city     | 地市                         |                                                             |
| msg.regeocodes.address_component.citycode | 地市编码                     |                                                             |
| msg.regeocodes.address_component.district | 区县                         |                                                             |
| msg.regeocodes.address_component.adcode   | 区县编码                     |                                                             |
| msg.regeocodes.address_component.street   | 街道                         |                                                             |
| msg.regeocodes.address_component.town     | 乡镇                         |                                                             |
| msg.regeocodes.address_component.village  | 乡村/社区                    | 乡村、社区、城市住宅区、商圈等                              |
| msg.regeocodes.address_component.road     | 道路                         |                                                             |
| msg.regeocodes.address_component.number   | 道路号                       |                                                             |
| msg.regeocodes.address_component.building | 建筑物                       | 建筑物或者未成功拆分的最末地址串                            |
| msg.regeocodes.address_component.location | 位置坐标                     | 格式：经度,纬度                                             |
| msg.regeocodes.pois                       | POI列表                      |                                                             |
| msg.regeocodes.pois.id                    | POI唯一编号                  |                                                             |
| msg.regeocodes.pois.name                  | POI名称                      |                                                             |
| msg.regeocodes.pois.type                  | POI类型                      |                                                             |
| msg.regeocodes.pois.tel                   | POI电话                      |                                                             |
| msg.regeocodes.pois.direction             | 相对查询位置的方位           |                                                             |
| msg.regeocodes.pois.distance              | 相对查询位置的距离，单位：米 |                                                             |
| msg.regeocodes.pois.address               | POI地址                      |                                                             |
| msg.regeocodes.pois.location              | POI位置坐标                  | 格式：经度,纬度                                             |
| msg.regeocodes.aois                       | AOI列表                      |                                                             |
| msg.regeocodes.aois.id                    | AOI唯一编号                  |                                                             |
| msg.regeocodes.aois.name                  | AOI名称                      |                                                             |
| msg.regeocodes.aois.type                  | AOI类型                      |                                                             |
| msg.regeocodes.aois.direction             | 相对查询位置的方位           |                                                             |
| msg.regeocodes.aois.distance              | 相对查询位置的距离，单位：米 |                                                             |
| msg.regeocodes.aois.location              | AOI中心坐标                  | 格式：经度,纬度                                             |
| msg.regeocodes.roads                      | 道路列表                     |                                                             |
| msg.regeocodes.roads.id                   | 道路唯一编号                 |                                                             |
| msg.regeocodes.roads.name                 | 道路名称                     |                                                             |
| msg.regeocodes.roads.direction            | 相对查询位置的方位           |                                                             |
| msg.regeocodes.roads.distance             | 相对查询位置的距离，单位：米 |                                                             |
| msg.regeocodes.roads.location             | 道路位置坐标                 | 格式：经度,纬度                                             |
| msg.regeocodes.roadinters                 | 道路交叉口列表               |                                                             |
| msg.regeocodes.roadinters.id              | 道路交叉口唯一编号           |                                                             |
| msg.regeocodes.roadinters.first_name      | 交叉口道路1名称              |                                                             |
| msg.regeocodes.roadinters.second_name     | 交叉口道路2名称              |                                                             |
| msg.regeocodes.roadinters.direction       | 相对查询位置的方位           |                                                             |
| msg.regeocodes.roadinters.distance        | 相对查询位置的距离，单位：米 |                                                             |
| msg.regeocodes.roadinters.location        | 道路位置坐标                 | 格式：经度,纬度                                             |

## 请求样例

http://ip:port/tianjing-server/lbs-api/geocoding/regeo?key=552280e3-8cbd-49a1-9d2a-9010045bc492&locations=86.918519,40.9231385&extensions=all&radius=1000&roadlevel=0

### 接口返回示例：

```json
{
    "msg": "ok",
    "code": 0,
    "regeocodes": [
        {
            "formatted_address": "新疆维吾尔自治区巴音郭楞蒙古自治州尉犁县英库勒站",
            "addressComponent": {
                "location": "86.918519,40.9231385",
                "country": "中国",
                "adcode": "652823",
                "province": "新疆维吾尔自治区",
                "city": "巴音郭楞蒙古自治州",
                "district": "尉犁县",
                "street": "",
                "town": "",
                "village": "",
                "road": "英库勒站",
                "number": "",
                "building": ""
            },
            "pois": [
                {
                    "id": "226c6ff6-8cd1-43c5-a76e-e8671cf89f73",
                    "name": "英库勒站",
                    "type": "交通运输、仓储;客货运输;客运火车站",
                    "tel": "",
                    "direction": "北",
                    "distance": 0,
                    "address": "",
                    "location": "86.918519,40.9231385"
                },
                {
                    "id": "a3b31dc9-3951-4c04-a4c3-72d3b9b38385",
                    "name": "英库勒站-进站口",
                    "type": "交通运输、仓储;客货运输;火车站出发到达",
                    "tel": "",
                    "direction": "东南",
                    "distance": 0.45618364142399276,
                    "address": "",
                    "location": "86.9185232,40.9231359"
                },
                {
                    "id": "5ca40789-1e2e-4d09-8b19-657209e15421",
                    "name": "英库勒站-售票处",
                    "type": "居民服务;票、费服务;票务中心/订票处",
```

> 示例响应共 90 行，此处省略其后 45 行示例数据；字段结构以本节说明为准。

## 注意事项与已知文档问题

- `locations` 分隔符文档写作 `' , '`（含空格），实际为 `,`
- 多组坐标间用 `;` 分隔，最多 10 组。
- `extensions` 必须包含结构化地址信息，可再叠加 `aoi,poi,road,roadinter`（逗号分隔）或 `all`。
