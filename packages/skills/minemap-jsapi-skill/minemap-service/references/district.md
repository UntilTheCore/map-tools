# 行政区划查询（district）

## 接口介绍

| 项       | 值                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/lbs-api/place/v2/district                                                                               |
| 请求方式 | GET、POST                                                                                                                                 |
| 服务描述 | 根据输入的搜索条件，快速的查找特定的行政区域信息，包括省级（直辖市级）、地市级、区县级、乡镇\街道级、村庄\社区级等总共 5 级行政区划信息。 |

## 参数说明

| 参数         | 类型   | 位置           | 说明                                                                                                                                                                                                                                                                                 |
| ------------ | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| keywords     | string | URL 或表单参数 | 查询关键字，模糊匹配行政区划名称，可选                                                                                                                                                                                                                                               |
| subdistrict  | string | URL 或表单参数 | 设置显示下级行政区级数（行政区级别包括：国家、省/直辖市、市、区/县、乡镇/街道、社区多级数据）可选值：0、1、2、3 等数字，并以此类推。0：不返回下级行政区；1：返回下一级行政区；2：返回下两级行政区；3：返回下三级行政区；默认值：0。可选                                              |
| page         | int    | URL 或表单参数 | 页码，从 0 开始的页码，默认值 0，可选                                                                                                                                                                                                                                                |
| pageSize     | int    | URL 或表单参数 | 分页大小，最大 20，默认值 20，可选                                                                                                                                                                                                                                                   |
| extensions   | string | URL 或表单参数 | 此项控制行政区信息中返回行政区边界坐标点； 可选值：base、all; base:不返回行政区边界坐标点； all:只返回当前查询 district 的边界值，不返回子节点的边界值； 目前不能返回乡镇/街道级别的边界值。默认值 base。，可选                                                                      |
| filterAdcode | string | URL 或表单参数 | 按照指定行政区划进行过滤，填入后则只返回该省/直辖市信息 需填入 adcode，为了保证数据的正确，强烈建议填入此参数。行政区划代码采用国家标准编码：省级（直辖市）2 位，地市 4 位，区县 6 位。参见国家统计局《统计用区划代码和城乡划分代码》：http://www.stats.gov.cn/sj/tjbz/qhdm/。可选。 |
| key          | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                                                                                                                                 |

## 数据返回 JSON 报文格式

| 字段                             | 含义                               | 说明                                                                                                                       |
| -------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| code                             | 返回结果状态                       | 值为整数编号，0表示成功；其他表示失败                                                                                      |
| msg                              | 返回状态消息                       | 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。                                                                |
| districts                        | 行政区列表                         |                                                                                                                            |
| districts.district               | 行政区信息                         |                                                                                                                            |
| districts.district.provice_code  | 省份编码                           |                                                                                                                            |
| districts.district.city_code     | 地市编码                           |                                                                                                                            |
| districts.district.district_code | 区县编码                           |                                                                                                                            |
| districts.district.area_code     | 该级别的行政区划长编码（12位长度） |                                                                                                                            |
| districts.district.dialing_code  | 电话区号                           |                                                                                                                            |
| districts.district.zip_code      | 邮政编码                           |                                                                                                                            |
| districts.district.name          | 行政区名称                         |                                                                                                                            |
| districts.district.short_name    | 行政区短名称                       |                                                                                                                            |
| districts.district.alias         | 行政区别称                         | 多个别称以英文分号分隔                                                                                                     |
| districts.district.polygon       | 行政区边界几何                     | WKT格式的多边形图形                                                                                                        |
| districts.district.center        | 区域中心点                         | 格式：经度,纬度                                                                                                            |
| districts.district.level         | 行政区划级别                       | province:省份（直辖市会在province显示） city:市（直辖市会在province显示） district:区县 street:乡镇/街道 village:村庄/社区 |
| districts.district.children      | 下级行政区列表，包含district元素   |                                                                                                                            |

## 请求样例

http://ip:port/tianjing-server/lbs-api/place/v2/district?key=552280e3-8cbd-49a1-9d2a-9010045bc492&keywords=山东省&subdistrict=1&page=0&pageSize=20&extensions=base&filterAdcode=37

### 接口返回示例：

```json
{
    "msg": "ok",
    "code": 0,
    "districts": [
        {
            "province_code": "37",
            "city_code": "3700",
            "district_code": "370000",
            "area_code": "370000000000",
            "dialing_code": "",
            "zip_code": "0",
            "name": "山东省",
            "short_name": "山东",
            "alias": "山东",
            "center": "117.02035522460938,36.66852951049805",
            "level": "province",
            "children": [
                {
                    "province_code": "37",
                    "city_code": "3701",
                    "district_code": "370100",
                    "area_code": "370100000000",
                    "dialing_code": "0531",
                    "zip_code": "250000",
                    "name": "济南市",
                    "short_name": "济南",
                    "alias": "济南",
                    "center": "117.12000274658203,36.651214599609375",
                    "level": "city",
                    "children": []
                },
{
                    "province_code": "37",
                    "city_code": "3702",
                    "district_code": "370200",
                    "area_code": "370200000000",
                    "dialing_code": "0532",
                    "zip_code": "266000",
                    "name": "青岛市",
                    "short_name": "青岛",
                    "alias": "青岛",
                    "center": "120.38263702392578,36.067081451416016",
                    "level": "city",
                    "children": []
                },
```

> 示例响应共 246 行，此处省略其后 201 行示例数据；字段结构以本节说明为准。

## 注意事项与已知文档问题

- 返回字段拼写 `provice_code`（应为 `province_code`），以服务端实际返回为准
- `subdistrict` 类型文档标注为 string，实际按整数使用；且目前仅支持到区/县级。
- `extensions=all` 只返回当前查询区划的边界，不返回子节点边界。
