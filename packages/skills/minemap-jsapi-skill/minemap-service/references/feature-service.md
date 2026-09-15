# 要素服务（FeatureServer）

地图服务提供了访问地图数据内容的入口，在不同层级（服务级别、图层组级别、图层级别、要素级别）上提供了对应的资源访问和操作的能力。地图服务可用作栅格切片服务，为客户端提供快速的地图浏览支持。也支持其他数据访问功能，比如动态渲染（服务端渲 染）、要素识别、要素查询、数据查找等。 值得注意的是相对于要素服务类型(Feature Service)，地图服务不提供要素编辑的功能，它只提供对要素和属性数据内容的只读访问。

本页包含 11 个接口：

- 要素服务详情(Feature Service)
- 要素服务图层列表( Feature Service Layers)
- 要素图层详情(Feature Service Layer Detail)
- 要素图层查询(Feature Service Layer Query)
- 要素记录详情(Feature Record Detail)
- 添加要素记录(Add Feature Records)
- 删除要素记录(Delete Feature Records)
- 更新要素记录(Update Feature Records)
- 批量提交要素编辑记录(Apply Feature Edits)
- 要素服务缩略图(Feature Service Thumb)
- 要素服务列表(Feature Service List)

## 要素服务详情(Feature Service)

### 接口介绍

| 项       | 值                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/FeatureServer?key={key} |
| 请求方式 | GET                                                                                                       |
| 服务描述 | 该接口返回地图服务的名称、图层列表、坐标系、初始范围、全图范围、切片详细信息等内容。                      |

### 参数说明

| 参数        | 类型   | 位置           | 说明                                            |
| ----------- | ------ | -------------- | ----------------------------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选                              |
| serviceName | string | 路径参数       | 服务名称，必选                                  |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 要素服务图层列表( Feature Service Layers)

### 接口介绍

| 项       | 值                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/FeatureServer/layers           |
| 请求方式 | GET、POST                                                                                                        |
| 服务描述 | 返回该地图服务下的所有图层，包含图层的基本信息，如名称、类型、父图层、子图层列表、字段列表、地图数据范围等信息。 |

### 参数说明

| 参数        | 类型   | 位置           | 说明                      |
| ----------- | ------ | -------------- | ------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选        |
| serviceName | string | 路径参数       | 服务名称，必选            |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选      |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 json |

### 数据返回 JSON 报文格式

```json
{
    "TianjingServerVersion": "3.0",
    "layers": [
        {
            "id": 0,
            "title": "<title>",
            "name": "<name>",
            "type": "Feature Layer",
            "geometryType": null,
            "capabilities": "Query,Create,Update,Delete,Uploads,Editing",
            "supportedQueryFormats": "JSON,AMF",
            "allowGeometryUpdates": true,
            "defaultVisibility": true,
            "isDataVersioned": false,
            "currentVersion": 10.2,
            "maxRecordCount": -1,
            "objectIdField": "OBJECTID",
            "globalIdFieldName": "",
            "extent": {...
            },
            "fields": [
                {
                    "name": "resid",
                    "type": "string"
                },
                ...
            ],
            "drawingInfo": {...
            }
        },
        ...
    ],
    "tables": []
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/jiangbei/MapServer/layers?key={key}

### 服务样例

| 参数        | 值       | 备注 | 必填 |
| ----------- | -------- | ---- | ---- |
| folderName  | services |      |      |
| serviceName | jiangbei |      |      |
| key         |          |      |      |
| F           |          |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "layers": [
        {
            "id": 0,
            "title": "楼栋点",
            "name": "g_building_point",
    type": "Feature Layer","geometryType": null,
            "capabilities": "Query,Create,Update,Delete,Uploads,Editing",
            "supportedQueryFormats": "JSON,AMF",
            "allowGeometryUpdates": true,
            "defaultVisibility": true,
            "isDataVersioned": false,
            "currentVersion": 10.2,
            "maxRecordCount": -1,
            "objectIdField": "OBJECTID",
            "globalIdFieldName": "",
            "extent": {
                "xmin": 102.6,
                "xmax": 109.2,
                "ymin": 23.2,
                "ymax": 26.5,
                "spatialReference": {
                    "wkid": "4326"
                }
            },
            "fields": [
                {
                    "name": "resid",
                    "type": "string"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "taskid",
                    "type": "string"
                },
                {
                    "name": "province",
                    "type": "string"
                },
                {
                    "name": "city",
```

> 示例响应共 765 行，此处省略其后 720 行示例数据；字段结构以本节说明为准。

## 要素图层详情(Feature Service Layer Detail)

### 接口介绍

| 项       | 值                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>?key={key} |
| 请求方式 | GET                                                                                                                 |
| 服务描述 | 该接口返回指定图层的名称、几何类型、主键属性名称、数据范围、字段列表等。                                            |

### 参数说明

| 参数        | 类型   | 位置           | 说明                                            |
| ----------- | ------ | -------------- | ----------------------------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选                              |
| serviceName | string | 路径参数       | 服务名称，必选                                  |
| layerId     | int    | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID         |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/FeatureServer/0?key=552280e3-8cbd-49a1-9d2a-9010045bc492

接口返回示例：

```json
{
  "TianjingServerVersion": "3.0",
  "id": 0,
  "title": "POI",
  "name": "poi",
  "type": "Feature Layer",
  "geometryType": "esriGeometryPoint",
  "capabilities": "Query,Create,Update,Delete,Uploads,Editing",
  "supportedQueryFormats": "JSON,AMF",
  "allowGeometryUpdates": true,
  "defaultVisibility": true,
  "isDataVersioned": false,
  "currentVersion": 10.2,
  "maxRecordCount": -1,
  "objectIdField": "OBJECTID",
  "globalIdFieldName": "",
  "extent": {
    "xmin": -180.0,
    "xmax": 180.0,
    "ymin": -90.0,
    "ymax": 83.62359619140625,
    "spatialReference": {
      "wkid": "4326"
    }
  },
  "fields": [
    {
      "name": "the_geom",
      "type": "geometry"
    },
    {
      "name": "Id",
      "type": "integer"
    },
    {
      "name": "NAME",
      "type": "string"
    }
  ]
}
```

## 要素图层查询(Feature Service Layer Query)

### 接口介绍

| 项       | 值                                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>/query?key={key}              |
| 请求方式 | GET                                                                                                                                    |
| 服务描述 | 该接口支持对指定图层进行空间和属性条件的联合查询，返回矢量图层符合查询条件的要素记录集合。输出结果支持 restjson、geojson、pbf 等格式。 |

### 参数说明

| 参数                 | 类型    | 位置           | 说明                                                                                                                                                                                                                                                                                      |
| -------------------- | ------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| folderName           | string  | 路径参数       | 服务目录名称，可选                                                                                                                                                                                                                                                                        |
| serviceName          | string  | 路径参数       | 服务名称，必选                                                                                                                                                                                                                                                                            |
| layerId              | int     | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID                                                                                                                                                                                                                                                   |
| where                | string  | URL 或表单参数 | 查询条件，采用 ECQL 规范的查询条件。ECQL 是 GeoTools 开源的一种类 SQL 规范的查询条件语言。参考以下在线文档： ECQL 参考： https://www.osgeo.cn/geoserver-user-manual/filter/ecql_reference.html ECQL 开源规范： https://github.com/geotools/geotools/blob/main/modules/library/cql/ECQL.md |
| outFields            | string  | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| orderByFields        | string  | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| objectIds            | string  | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| geometry             | string  | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| geometryType         | string  | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| inSR                 | int     | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| spatialRel           | string  | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnGeometry       | boolean | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnIdsOnly        | boolean | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnCountOnly      | boolean | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnDistinctValues | boolean | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| key                  | string  | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                                                                                                                                      |
| f                    | string  | URL 或表单参数 | 返返回格式，可选，默认 json，枚举值：json/geojson/pbf                                                                                                                                                                                                                                     |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/FeatureServer/1/query?where=CNTRY_NAME='China'andADMIN_NAME='Hubei'&outFields=*&f=geojson&key=552280e3-8cbd-49a1-9d2a-9010045bc492

```json
{
  "TianjingServerVersion": "3.0",
  "spatialReference": {
    "wkid": 4326
  },
  "geometryType": "esriGeometryPoint",
  "features": [
    {
      "geometry": {
        "x": 114.27900363412093,
        "y": 30.57300007950235
      },
      "attributes": {
        "OBJECTID": "2159",
        "CITY_NAME": "Wuhan",
        "GMI_ADMIN": "CHN-HUB",
        "ADMIN_NAME": "Hubei",
        "FIPS_CNTRY": "CH",
        "CNTRY_NAME": "China",
        "STATUS": "Provincial capital",
        "POP_RANK": 2,
        "POP_CLASS": "1,000,000 to 5,000,000",
        "PORT_ID": 60060,
        "LABEL_FLAG": 0,
        "NEAR_FID": 2160,
        "NEAR_DIST": 2.49192612643
      }
    }
  ]
}
```

JSON 格式：

```json
{
  "TianjingServerVersion": "3.0",
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [114.27900363412093, 30.57300007950235]
      },
      "properties": {
        "CITY_NAME": "Wuhan",
        "GMI_ADMIN": "CHN-HUB",
        "ADMIN_NAME": "Hubei",
        "FIPS_CNTRY": "CH",
        "CNTRY_NAME": "China",
        "STATUS": "Provincial capital",
        "POP_RANK": 2,
        "POP_CLASS": "1,000,000 to 5,000,000",
        "PORT_ID": 60060,
        "LABEL_FLAG": 0,
        "NEAR_FID": 2160,
        "NEAR_DIST": 2.49192612643
      }
    }
  ]
}
```

GeoJSON 格式：

```json
{
  "TianjingServerVersion": "3.0",
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [114.27900363412093, 30.57300007950235]
      },
      "properties": {
        "CITY_NAME": "Wuhan",
        "GMI_ADMIN": "CHN-HUB",
        "ADMIN_NAME": "Hubei",
        "FIPS_CNTRY": "CH",
        "CNTRY_NAME": "China",
        "STATUS": "Provincial capital",
        "POP_RANK": 2,
        "POP_CLASS": "1,000,000 to 5,000,000",
        "PORT_ID": 60060,
        "LABEL_FLAG": 0,
        "NEAR_FID": 2160,
        "NEAR_DIST": 2.49192612643
      }
    }
  ]
}
```

## 要素记录详情(Feature Record Detail)

### 接口介绍

| 项       | 值                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>/<featureId>?key={key} |
| 请求方式 | GET                                                                                                                             |
| 服务描述 |                                                                                                                                 |

### 参数说明

| 参数                 | 类型    | 位置           | 说明                                                |
| -------------------- | ------- | -------------- | --------------------------------------------------- |
| folderName           | string  | 路径参数       | 服务目录名称，可选                                  |
| serviceName          | string  | 路径参数       | 服务名称，必选                                      |
| layerId              | int     | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID             |
| featureId            | string  | URL 或表单参数 |                                                     |
| outFields            | string  | URL 或表单参数 |                                                     |
| orderByFields        | string  | URL 或表单参数 |                                                     |
| objectIds            | string  | URL 或表单参数 |                                                     |
| geometry             | string  | URL 或表单参数 |                                                     |
| geometryType         | string  | URL 或表单参数 |                                                     |
| inSR                 | int     | URL 或表单参数 |                                                     |
| spatialRel           | string  | URL 或表单参数 |                                                     |
| returnGeometry       | boolean | URL 或表单参数 |                                                     |
| returnIdsOnly        | boolean | URL 或表单参数 |                                                     |
| returnCountOnly      | boolean | URL 或表单参数 |                                                     |
| returnDistinctValues | boolean | URL 或表单参数 |                                                     |
| key                  | string  | URL 或表单参数 | 开发者应用密钥，必选                                |
| f                    | string  | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson/pbf |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/FeatureServer/1/2160?f=json&key=552280e3-8cbd-49a1-9d2a-9010045bc492

### 服务样例

```json
{
  "TianjingServerVersion": "3.0",
  "geometryType": "esriGeometryPoint",
  "features": [
    {
      "geometry": {
        "x": 120.1650036396027,
        "y": 30.252996079204323
      },
      "attributes": {
        "OBJECTID": "2160",
        "CITY_NAME": "Hangzhou",
        "GMI_ADMIN": "CHN-ZHJ",
        "ADMIN_NAME": "Zhejiang",
        "FIPS_CNTRY": "CH",
        "CNTRY_NAME": "China",
        "STATUS": "Provincial capital",
        "POP_RANK": 2,
        "POP_CLASS": "1,000,000 to 5,000,000",
        "PORT_ID": 0,
        "LABEL_FLAG": 0,
        "NEAR_FID": 2157,
        "NEAR_DIST": 1.64343819995
      }
    }
  ]
}
```

## 添加要素记录(Add Feature Records)

### 接口介绍

| 项       | 值                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>/addFeatures?key={key} |
| 请求方式 | GET                                                                                                                             |
| 服务描述 |                                                                                                                                 |

### 参数说明

| 参数        | 类型   | 位置           | 说明                                    |
| ----------- | ------ | -------------- | --------------------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选                      |
| serviceName | string | 路径参数       | 服务名称，必选                          |
| layers      | string | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID |
| features    | string | URL 或表单参数 | 要素记录                                |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选                    |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 json               |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 删除要素记录(Delete Feature Records)

### 接口介绍

| 项       | 值                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>/deleteFeatures?key={key} |
| 请求方式 | GET                                                                                                                                |
| 服务描述 |                                                                                                                                    |

### 参数说明

| 参数         | 类型   | 位置           | 说明                                    |
| ------------ | ------ | -------------- | --------------------------------------- |
| folderName   | string | 路径参数       | 服务目录名称，可选                      |
| serviceName  | string | 路径参数       | 服务名称，必选                          |
| layerId      | int    | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID |
| objectIds    | string | URL 或表单参数 | 要素记录                                |
| geometry     |        |                |                                         |
| geometryType |        |                |                                         |
| inSR         |        |                |                                         |
| spatialRel   |        |                |                                         |
| where        |        |                |                                         |
| key          | string | URL 或表单参数 | 开发者应用密钥，必选                    |
| f            | string | URL 或表单参数 | 返回格式，可选，默认 json               |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 更新要素记录(Update Feature Records)

### 接口介绍

| 项       | 值                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>/updateFeatures?key={key} |
| 请求方式 | GET                                                                                                                                |
| 服务描述 |                                                                                                                                    |

### 参数说明

| 参数         | 类型   | 位置           | 说明                                    |
| ------------ | ------ | -------------- | --------------------------------------- |
| folderName   | string | 路径参数       | 服务目录名称，可选                      |
| serviceName  | string | 路径参数       | 服务名称，必选                          |
| layerId      | int    | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID |
| objectIds    | string | URL 或表单参数 | 要素记录                                |
| geometry     |        |                |                                         |
| geometryType |        |                |                                         |
| inSR         |        |                |                                         |
| spatialRel   |        |                |                                         |
| where        |        |                |                                         |
| key          | string | URL 或表单参数 | 开发者应用密钥，必选                    |
| f            | string | URL 或表单参数 | 返回格式，可选，默认 json               |

### 数据返回 JSON 报文格式

### 请求样例

## 批量提交要素编辑记录(Apply Feature Edits)

#####接口介绍

| 项       | 值                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/<layerId>/applyEdits?key={key} |
| 请求方式 | GET                                                                                                                            |
| 服务描述 |                                                                                                                                |

### 参数说明

| 参数         | 类型   | 位置           | 说明                                    |
| ------------ | ------ | -------------- | --------------------------------------- |
| folderName   | string | 路径参数       | 服务目录名称，可选                      |
| serviceName  | string | 路径参数       | 服务名称，必选                          |
| layerId      | int    | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID |
| objectIds    | string | URL 或表单参数 | 要素记录                                |
| geometry     |        |                |                                         |
| geometryType |        |                |                                         |
| inSR         |        |                |                                         |
| spatialRel   |        |                |                                         |
| where        |        |                |                                         |
| key          | string | URL 或表单参数 | 开发者应用密钥，必选                    |
| f            | string | URL 或表单参数 | 返回格式，可选，默认 json               |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 要素服务缩略图(Feature Service Thumb)

### 接口介绍

| 项       | 值                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/FeatureServer/thumb?key={key} |
| 请求方式 | GET                                                                                                             |
| 服务描述 |                                                                                                                 |

### 参数说明

| 参数         | 类型   | 位置           | 说明                                            |
| ------------ | ------ | -------------- | ----------------------------------------------- |
| folderName   | string | 路径参数       | 服务目录名称，可选                              |
| serviceName  | string | 路径参数       | 服务名称，必选                                  |
| layerId      | int    | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID         |
| objectIds    | string | URL 或表单参数 | 要素记录                                        |
| geometry     |        |                |                                                 |
| geometryType |        |                |                                                 |
| inSR         |        |                |                                                 |
| spatialRel   |        |                |                                                 |
| where        |        |                |                                                 |
| key          | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f            | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 要素服务列表(Feature Service List)

### 接口介绍

| 项       | 值                                                                              |
| -------- | ------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/FeatureServers?key={key} |
| 请求方式 | GET                                                                             |
| 服务描述 |                                                                                 |

### 参数说明

| 参数         | 类型   | 位置           | 说明                                            |
| ------------ | ------ | -------------- | ----------------------------------------------- |
| folderName   | string | 路径参数       | 服务目录名称，可选                              |
| serviceName  | string | 路径参数       | 服务名称，必选                                  |
| layerId      | int    | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID         |
| objectIds    | string | URL 或表单参数 | 要素记录                                        |
| geometry     |        |                |                                                 |
| geometryType |        |                |                                                 |
| inSR         |        |                |                                                 |
| spatialRel   |        |                |                                                 |
| where        |        |                |                                                 |
| key          | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f            | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 注意事项与已知文档问题

- 文档中有两处接口地址把 `>` 写重复了（原文 `<serviceName>>/FeatureServer/layers`、`<layerId>>/query`），此处已修正为单个 `>`。
- 「请求样例」里有一个 key 中间被插入空格（`...-9d2a- 9010045bc492`），此处已去掉。
- 增删改（addFeatures/deleteFeatures/updateFeatures/applyEdits）均为写操作，需服务端开放编辑权限；`features` 为要素数组的 JSON 字符串。
- 页面开头介绍文字被错误复制为「地图服务」的描述，实际本页讲的是支持要素编辑的 FeatureServer。
