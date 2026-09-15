# 地图服务（MapServer）

地图服务提供了访问地图数据内容的入口，在不同层级（服务级别、图层组级别、图层级别、要素级别）上提供了对应的资源访问和操作的能力。地图服务可用作栅格切片服务，为客户端提供快速的地图浏览支持。也支持其他数据访问功能，比如动态渲染（服务端渲 染）、要素识别、要素查询、数据查找等。 值得注意的是相对于要素服务类型(Feature Service)，地图服务不提供要素编辑的功能，它只提供对要素和属性数据内容的只读访问。

本页包含 11 个接口：

- 地图服务( Map Service)
- 地图服务图层列表( Map Service Layers)
- 地图图层详情(Map Service Layer Detail)
- 地图图层查询(Map Service Layer Query)
- 要素记录详情(Feature Record Detail)
- 地图服务瓦片(Map Service Tile)
- 地图要素识别(Map Service Identify)
- 地图要素查找(Map Service Find)
- 地图动态渲染输出(Map Service Export)
- 地图服务缩略图(Map Service Thumb)
- 地图服务列表(Map Service List)

## 地图服务( Map Service)

### 接口介绍

| 项       | 值                                                                                          |
| -------- | ------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer |
| 请求方式 | GET、POST                                                                                   |
| 服务描述 | 该接口返回地图服务的名称、图层列表、坐标系、初始范围、全图范围、切片详细信息等内容。        |

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
    "name": "<name>",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {...
    },
    "fullExtent": {...
    },
    "units": "",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {...
        },
        "lods": [...
        ]
    }
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/jiangbei/MapServer?key={key}

### 服务样例

| 参数        | 值       | 备注 | 必填 |
| ----------- | -------- | ---- | ---- |
| folderName  | services |      |      |
| serviceName | jiangbei |      |      |
| key         |          |      |      |
| f           |          |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "name": "jiangbei",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {
        "xmin": 1.0892414393424233E7,
        "xmax": 1.0967113013024235E7,
        "ymin": 4808432.833891487,
        "ymax": 4873142.684591487,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "fullExtent": {
        "xmin": 1.0892372535220487E7,
        "xmax": 1.0967154871227982E7,
        "ymin": 4815688.777514234,
        "ymax": 4865771.080347896,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "units": "esriMeters",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {
            "x": -2.0037508342787E7,
            "y": 2.0037508342787E7
        },
        "lods": [
            {
                "level": 0,
                "resolution": 156543.03392800014,
                "scale": 5.91657527591555E8
```

> 示例响应共 144 行，此处省略其后 99 行示例数据；字段结构以本节说明为准。

## 地图服务图层列表( Map Service Layers)

### 接口介绍

| 项       | 值                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/layers               |
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
    "tables
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
```

> 示例响应共 766 行，此处省略其后 721 行示例数据；字段结构以本节说明为准。

## 地图图层详情(Map Service Layer Detail)

### 接口介绍

| 项       | 值                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/MapServer/<layerId>?key={key} |
| 请求方式 | GET                                                                                                             |
| 服务描述 | 该接口返回指定图层的名称、几何类型、主键属性名称、数据范围、字段列表等。                                        |

### 参数说明

| 参数        | 类型   | 位置           | 说明                                            |
| ----------- | ------ | -------------- | ----------------------------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选                              |
| serviceName | string | 路径参数       | 服务名称，必选                                  |
| layerId     | string | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID         |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/MapServer/0?key=552280e3-8cbd-49a1-9d2a-9010045bc492

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

## 地图图层查询(Map Service Layer Query)

### 接口介绍

| 项       | 值                                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/MapServer/<layerId>/query?key={key}                  |
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
| f                    | string  | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson                                                                                                                                                                                                                                           |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/MapServer/1/query?where=CNTRY_NAME='China'andADMIN_NAME='Hubei'&outFields=*&f=geojsonkey=552280e3-8cbd-49a1-9d2a-9010045bc492

接口返回示例：

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

| 项       | 值                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/MapServer/<layerId>/<featureId>?key={key} |
| 请求方式 | GET                                                                                                                         |
| 服务描述 |                                                                                                                             |

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

## 地图服务瓦片(Map Service Tile)

### 接口介绍

| 项       | 值                                                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/tile/{level}/{row}/{col} 或者 http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/tile?level={level}&row={row}&col={col} |
| 请求方式 | GET、POST                                                                                                                                                                                                                                                    |
| 服务描述 | 返回指定层级、列号、行号的瓦片。                                                                                                                                                                                                                             |

### 参数说明

| 参数        | 类型   | 位置           | 说明                 |
| ----------- | ------ | -------------- | -------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选   |
| serviceName | string | 路径参数       | 服务名称，必选       |
| level       | int    | 路径参数       | 瓦片级数             |
| row         | int    | 路径参数       | 瓦片行号             |
| col         | int    | 路径参数       | 瓦片列号             |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选 |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/jiayuguan3857/MapServer/tile/14/6214/12661?key={key} 或者 http://ip:port/tianjing-server/mapdata-api/services/jiayuguan3857/MapServer/tile?level=14&row=6214&col=12661?key={key}

### 服务样例

| 参数        | 值            | 备注 | 必填 |
| ----------- | ------------- | ---- | ---- |
| folderName  | services      |      |      |
| serviceName | jiayuguan3857 |      |      |
| level       | 14            |      |      |
| row         | 6214          |      |      |
| col         | 12661         |      |      |
| key         |               |      |      |

接口返回示例：

## 地图要素识别(Map Service Identify)

### 接口介绍

| 项       | 值                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/identify                                            |
| 请求方式 | GET、POST                                                                                                                                       |
| 服务描述 | 点击地图时识别点击位置处的要素记录，识别的结果包含了记录数组，每条记录包含名称、图层 ID、图层名称、几何、几何类型以及其他属性信息(attributes)。 |

### 参数说明

| 参数           | 类型   | 位置           | 说明                                               |
| -------------- | ------ | -------------- | -------------------------------------------------- |
| folderName     | string | 路径参数       | 服务目录名称，可选                                 |
| serviceName    | string | 路径参数       | 服务名称，必选                                     |
| geometry       | string | URL 或表单参数 | 几何                                               |
| geometryType   | string | URL 或表单参数 | 几何类型                                           |
| sr             | string | URL 或表单参数 | 几何坐标系                                         |
| layers         | string | URL 或表单参数 | 识别图层 ID，多个图层用逗号分隔                    |
| tolerance      | string | URL 或表单参数 | 容差                                               |
| mapExtent      | string | URL 或表单参数 | 地图范围                                           |
| imageDisplay   | string | URL 或表单参数 | 当前地图图像屏幕输出参数：<width>, <height>, <dpi> |
| returnGeometry | string | URL 或表单参数 | 返回结果是否包含几何数据                           |
| key            | string | URL 或表单参数 | 开发者应用密钥，必选                               |
| f              | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson    |

### 数据返回 JSON 报文格式

```json
{
    "TianjingServerVersion": "3.0",
    "name": "<name>",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {...
    },
    "fullExtent": {...
    },
    "units": "",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {...
        },
        "lods": [...
        ]
    }
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/jiangbei/MapServer/identify?key={key}

### 服务样例

| 参数           | 值  | 备注 | 必填 |
| -------------- | --- | ---- | ---- |
| folderName     |     |      |      |
| serviceName    |     |      |      |
| geometry       |     |      |      |
| geometryType   |     |      |      |
| sr             |     |      |      |
| layers         |     |      |      |
| tolerance      |     |      |      |
| mapExtent      |     |      |      |
| imageDisplay   |     |      |      |
| returnGeometry |     |      |      |
| key            |     |      |      |
| f              |     |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "name": "jiangbei",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {
        "xmin": 1.0892414393424233E7,
        "xmax": 1.0967113013024235E7,
        "ymin": 4808432.833891487,
        "ymax": 4873142.684591487,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "fullExtent": {
        "xmin": 1.0892372535220487E7,
        "xmax": 1.0967154871227982E7,
        "ymin": 4815688.777514234,
        "ymax": 4865771.080347896,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "units": "esriMeters",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {
            "x": -2.0037508342787E7,
            "y": 2.0037508342787E7
        },
        "lods": [
            {
                "level": 0,
                "resolution": 156543.03392800014,
                "scale": 5.91657527591555E8
```

> 示例响应共 144 行，此处省略其后 99 行示例数据；字段结构以本节说明为准。

## 地图要素查找(Map Service Find)

### 接口介绍

| 项       | 值                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/find                                                |
| 请求方式 | GET、POST                                                                                                                                       |
| 服务描述 | 点击地图时识别点击位置处的要素记录，识别的结果包含了记录数组，每条记录包含名称、图层 ID、图层名称、几何、几何类型以及其他属性信息(attributes)。 |

### 参数说明

| 参数           | 类型   | 位置           | 说明                                            |
| -------------- | ------ | -------------- | ----------------------------------------------- |
| folderName     | string | 路径参数       | 服务目录名称，可选                              |
| serviceName    | string | 路径参数       | 服务名称，必选                                  |
| searchText     | string | URL 或表单参数 | 查找关键字                                      |
| contains       | string | URL 或表单参数 | 是否模糊查询，true：模糊查询，false：值相等查询 |
| searchFields   | string | URL 或表单参数 | 查询字段名称                                    |
| sr             | string | URL 或表单参数 | 输出坐标系                                      |
| layerId        | string | URL 或表单参数 | 图层列表                                        |
| returnGeometry | string | URL 或表单参数 | 返回结果是否包含几何数据                        |
| key            | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f              | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

```json
{
    "TianjingServerVersion": "3.0",
    "name": "<name>",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {...
    },
    "fullExtent": {...
    },
    "units": "",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {...
        },
        "lods": [...
        ]
    }
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/jiangbei/MapServer/identify?key={key}

### 服务样例

| 参数           | 值  | 备注 | 必填 |
| -------------- | --- | ---- | ---- |
| folderName     |     |      |      |
| serviceName    |     |      |      |
| searchText     |     |      |      |
| contains       |     |      |      |
| searchFields   |     |      |      |
| sr             |     |      |      |
| layers         |     |      |      |
| returnGeometry |     |      |      |
| key            |     |      |      |
| f              |     |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "name": "jiangbei",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {
        "xmin": 1.0892414393424233E7,
        "xmax": 1.0967113013024235E7,
        "ymin": 4808432.833891487,
        "ymax": 4873142.684591487,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "fullExtent": {
        "xmin": 1.0892372535220487E7,
        "xmax": 1.0967154871227982E7,
        "ymin": 4815688.777514234,
        "ymax": 4865771.080347896,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "units": "esriMeters",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {
            "x": -2.0037508342787E7,
            "y": 2.0037508342787E7
        },
        "lods": [
            {
                "level": 0,
                "resolution": 156543.03392800014,
                "scale": 5.91657527591555E8
```

> 示例响应共 144 行，此处省略其后 99 行示例数据；字段结构以本节说明为准。

## 地图动态渲染输出(Map Service Export)

### 接口介绍

| 项       | 值                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/export                                              |
| 请求方式 | GET、POST                                                                                                                                       |
| 服务描述 | 点击地图时识别点击位置处的要素记录，识别的结果包含了记录数组，每条记录包含名称、图层 ID、图层名称、几何、几何类型以及其他属性信息(attributes)。 |

### 参数说明

| 参数                 | 类型   | 位置           | 说明                                            |
| -------------------- | ------ | -------------- | ----------------------------------------------- |
| folderName           | string | 路径参数       | 服务目录名称，可选                              |
| serviceName          | string | 路径参数       | 服务名称，必选                                  |
| searchText           | string | URL 或表单参数 | 查找关键字                                      |
| contains             | string | URL 或表单参数 | 是否模糊查询，true：模糊查询，false：值相等查询 |
| searchFields         | string | URL 或表单参数 | 查询字段名称                                    |
| sr                   | string | URL 或表单参数 | 输出坐标系                                      |
| layers               | string | URL 或表单参数 | 图层列表                                        |
| returnDistinctValues | string | URL 或表单参数 | 返回结果是否包含几何数据                        |
| key                  | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f                    | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

```json
{
    "TianjingServerVersion": "3.0",
    "name": "<name>",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {...
    },
    "fullExtent": {...
    },
    "units": "",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {...
        },
        "lods": [...
        ]
    }
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/jiangbei/MapServer/identify?key={key}

### 服务样例

| 参数           | 值       | 备注 | 必填 |
| -------------- | -------- | ---- | ---- |
| folderName     | services |      |      |
| serviceName    | jiangbei |      |      |
| searchText     |          |      |      |
| contains       |          |      |      |
| searchFields   |          |      |      |
| sr             |          |      |      |
| layers         |          |      |      |
| returnGeometry |          |      |      |
| key            |          |      |      |
| f              |          |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "name": "jiangbei",
    "maxInstances": 20,
    "maxResults": -1,
    "layers": [],
    "spatialReference": {
        "wkid": 3857
    },
    "initialExtent": {
        "xmin": 1.0892414393424233E7,
        "xmax": 1.0967113013024235E7,
        "ymin": 4808432.833891487,
        "ymax": 4873142.684591487,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "fullExtent": {
        "xmin": 1.0892372535220487E7,
        "xmax": 1.0967154871227982E7,
        "ymin": 4815688.777514234,
        "ymax": 4865771.080347896,
        "spatialReference": {
            "wkid": 3857
        }
    },
    "units": "esriMeters",
    "supportedImageFormatTypes": "png,jpg,bmp",
    "tileInfo": {
        "createSpread": 8,
        "dpi": 96,
        "compressionQuality": 0,
        "rows": 256,
        "cols": 256,
        "format": "png",
        "origin": {
            "x": -2.0037508342787E7,
            "y": 2.0037508342787E7
        },
        "lods": [
            {
                "level": 0,
                "resolution": 156543.03392800014,
                "scale": 5.91657527591555E8
```

> 示例响应共 144 行，此处省略其后 99 行示例数据；字段结构以本节说明为准。

## 地图服务缩略图(Map Service Thumb)

### 接口介绍

| 项       | 值                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/MapServer/thumb?key={key} |
| 请求方式 | GET                                                                                                         |
| 服务描述 |                                                                                                             |

### 参数说明

| 参数          | 类型   | 位置           | 说明                                            |
| ------------- | ------ | -------------- | ----------------------------------------------- |
| folderName    | string | 路径参数       | 服务目录名称，可选                              |
| serviceName   | string | 路径参数       | 服务名称，必选                                  |
| layerId       | string | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID         |
| outFields     | string | URL 或表单参数 | 要素记录                                        |
| orderByFields | string | URL 或表单参数 |                                                 |
| objectIds     | string | URL 或表单参数 |                                                 |
| geometry      | string | URL 或表单参数 |                                                 |
| inSR          | string |                |                                                 |
| spatialRel    | string |                |                                                 |
| key           | string | URL 或表单参数 | 开发者应用密钥，必选                            |
| f             | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

### 数据返回 JSON 报文格式

### 请求样例

### 服务样例

## 地图服务列表(Map Service List)

### 接口介绍

| 项       | 值                                                                          |
| -------- | --------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/MapServers?key={key} |
| 请求方式 | GET                                                                         |
| 服务描述 |                                                                             |

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

## 注意事项与已知文档问题

- 文档中「地图要素查找」的接口地址漏写了 `<serviceName>` 前的斜杠（原文 `<folderName><serviceName>`），此处已补为 `<folderName>/<serviceName>`。
- 「地图服务瓦片」给出两种等价写法（路径式 `tile/{level}/{row}/{col}` 与查询式 `tile?level=&row=&col=`），两者都可用；文档在其中一处把 `<serviceName>` 误写成 `<serviceName >`（含空格），此处已去掉。
- 写操作类接口（Identify/Find/Export）参数较多，`f` 决定返回格式（json/geojson/pbf）。
