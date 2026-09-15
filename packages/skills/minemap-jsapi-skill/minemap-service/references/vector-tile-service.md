# 矢量切片服务

矢量切片服务结合矢量切片配图方案，可以制作各种风格的电子地图；也可以支持开发者自主发布自有数据为矢量切片服务，采用天镜前端 SDK 进行自定义样式加载呈现。数据源支持切片数据(pbf 格式)，也支持矢量数据库、Shapefile 数据等。

本页包含 13 个接口：

- 矢量切片服务（Vector Tile Service）
- 矢量切片输出(Vector Tile Output)）
- 矢量切片默认样式（Vector Tile Default Style）
- 矢量切片 TilesJSON(Vector Tile TilesJSON)
- 矢量字体 ( Vector Tile Font)
- 精灵图标( Vector Tile Sprite)
- 地图服务图层列表(Vector Tile Service Layers)
- 地图图层详情(Vector Tile Service Layer Detail)
- 地图图层查询(Vector Tile Service Layer Query)
- 地图图层查询矢量切片(Vector Tile Service Layer Query Tile)
- 要素记录详情(Feature Record Detail)
- 矢量切片服务列表(Vector Tile Services)
- 矢量切片服务缩略图(Vector Tile Thumb)

## 矢量切片服务（Vector Tile Service）

### 接口介绍

| 项       | 值                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer                     |
| 请求方式 | GET、POST                                                                                                              |
| 服务描述 | 该地址表示发布的一个矢量切片服务，地址返回切片的元数据信息，例如切片服务的名称、坐标系、初始位置范围、最大位置范围等。 |

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
 "TianjingServerVersion": "<currentVersion>",
 "name": "<name>",
 "capabilities": "TilesOnly",
 "tileMap": "tilemap",
 "defaultStyles": "resources/styles",
 "exportTilesAllowed": <true|false>,
 "maxExportTilesCount": <export tiles limit>,
 "tiles": [
 "tile/{z}/{y}/{x}.pbf"
 ],
 "spatialReference": {<spatialReference>},
 "initialExtent": <envelope>,
 "fullExtent": <envelope>
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer?key={key}

### 服务样例

| 参数        | 值               | 备注 | 必填 |
| ----------- | ---------------- | ---- | ---- |
| folderName  | vct-shanxi       |      | 否   |
| serviceName | VectorTileServer |      | 是   |
| key         |                  |      | 是   |
| f           |                  |      | 否   |

接口返回示例：

```json
{
  "TianjingServerVersion": "3.0",
  "name": "陕西基础地图",
  "capabilities": "TilesOnly",
  "tileMap": "tilemap",
  "defaultStyles": "resources/styles",
  "exportTilesAllowed": true,
  "maxExportTilesCount": 10000,
  "tiles": [
    "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/tile/{z}/{y}/{x}.pbf"
  ],
  "spatialReference": {
    "wkid": 4326
  },
  "initialExtent": {
    "xmin": 102.6,
    "xmax": 109.2,
    "ymin": 23.2,
    "ymax": 26.5,
    "spatialReference": {
      "wkid": 4326
    }
  },
  "fullExtent": {
    "xmin": 102.6,
    "xmax": 109.2,
    "ymin": 23.2,
    "ymax": 26.5,
    "spatialReference": {
      "wkid": 4326
    }
  }
}
```

## 矢量切片输出(Vector Tile Output)）

### 接口介绍

| 项       | 值                                                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/tile/{z}/{y}/{x}.pbf 或者 http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/tile?z={z}&y={y}&x={x} |
| 请求方式 | GET                                                                                                                                                                                                                                                    |
| 服务描述 | 该地址输出指定层级(z)、行(y)和列(x)瓦片范围的二进制矢量数据（pbf 格式）。                                                                                                                                                                              |

### 参数说明

| 参数        | 类型   | 位置           | 说明                     |
| ----------- | ------ | -------------- | ------------------------ |
| folderName  | string | 路径参数       | 服务目录名称，可选       |
| serviceName | string | 路径参数       | 服务名称，必选           |
| z           | string | 路径参数       | 瓦片级数                 |
| y           | string | 路径参数       | 瓦片行号                 |
| x           | string | 路径参数       | 瓦片列号                 |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选     |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 pbf |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/tile/15/13059/26298.pbf?key={key}

接口返回示例：

## 矢量切片默认样式（Vector Tile Default Style）

### 接口介绍

| 项       | 值                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/resources/styles?key={key}                |
| 请求方式 | GET、POST                                                                                                                                    |
| 服务描述 | 该地址返回符合 MapBox Style Specification 的样式 JSON 报文。返回的样式报文包含了精灵图标和矢量字体资源的引用，也包含了数据源和图层列表信息。 |

### 参数说明

| 参数        | 类型           | 位置                      | 说明 |
| ----------- | -------------- | ------------------------- | ---- |
| folderName  | 路径参数       | 服务目录名称，可选        |      |
| serviceName | 路径参数       | 服务名称，必选            |      |
| key         | URL 或表单参数 | 开发者应用密钥，必选      |      |
| f           | URL 或表单参数 | 返回格式，可选，默认 json |      |

### 数据返回 JSON 报文格式

```json
{
   "version": <version>,
   "name": "<name>",
   "id": "<id>",
   "sprite": "../sprites/sprite",
   "glyphs": "../fonts/{fontstack}/{range}.pbf",
   "sources": {...},
   "layers": [...]
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/resources/styles?key={key}

### 服务样例

| 参数        | 值               | 备注 | 必填 |
| ----------- | ---------------- | ---- | ---- |
| folderName  | vct-shanxi       |      |      |
| serviceName | VectorTileServer |      |      |
| key         |                  |      |      |
| f           |                  |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "version": 10,
    "name": "陕西基础地图",
    "id": "陕西基础地图",
    "sprite": "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/resources/sprites",
    "glyphs": "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf",
    "sources": {
        "陕西基础地图": {
            "type": "vector",
            "url": "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/tiles.json"
        }
    },
    "layers": [
        {
            "id": "gis_geo_aoi",
            "source": "陕西基础地图",
            "source-layer": "gis_geo_aoi",
            "type": "fill",
            "minzoom": 10,
            "maxzoom": 24,
            "layout": {},
            "paint": {
                "fill-color": "#f7f6d5"
            }
        },
        {
            "id": "gis_geo_buildings",
            "source": "陕西基础地图",
            "source-layer": "gis_geo_buildings",
            "type": "fill",
            "minzoom": 16,
            "maxzoom": 24,
            "layout": {},
            "paint": {
                "fill-color": "#f7f6d5"
            }
        },
        {
            "id": "gis_geo_place",
            "source": "陕西基础地图",
            "source-layer": "gis_geo_place",
            "type": "symbol",
            "minzoom": 0,
            "maxzoom": 20,
```

> 示例响应共 220 行，此处省略其后 175 行示例数据；字段结构以本节说明为准。

## 矢量切片 TilesJSON(Vector Tile TilesJSON)

### 接口介绍

| 项       | 值                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/tiles.json     |
| 请求方式 | GET、POST                                                                                                         |
| 服务描述 | 该地址返回符合配图系统所需要的数据源服务类型（TilesJSON），可使用该服务地址在配图方案内加载其包含的矢量数据图层。 |

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
    "id": "陕西基础地图",
    "name": "陕西基础地图",
    "bounds": [ minx, miny, maxx, maxy],
    "center": [ 0.0, 0.0, 1.0 ],
    "format": "pbf",
    "maxzoom": 22,
    "minzoom": 0,
    "version": "3.14.0",
    "tilejson": "2.1.0",
    "generator": "",
    "planettime": "",
    "attribution": "",
    "description": "",
    "pixel_scale": 256,
    "crs": "EPSG:4326",
    "crs_wkt": "",
    "tiles": [
      "http://ip:port/tianjing-server/mapdataapi/services/vctshanxi/VectorTileServer/tile/{z}/{y}/{x}.pbf?key={key}"
    ],
    "vector_layers": [...],
    "tilestats": {
        "layers": [...],
        "layerCount": 14
    }
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/tiles.json?key={key}

### 服务样例

| 参数        | 值               | 备注 | 必填 |
| ----------- | ---------------- | ---- | ---- |
| folderName  | vct-shanxi       |      | 是   |
| serviceName | VectorTileServer |      | 是   |
| key         |                  |      | 是   |
| f           |                  |      | 否   |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "id": "陕西基础地图",
    "name": "陕西基础地图",
    "bounds": [
        -180.0,
        -85.0511,
        180.0,
        85.0511
    ],
    "center": [
        0.0,
        0.0,
        1.0
    ],
    "format": "pbf",
    "maxzoom": 22,
    "minzoom": 0,
    "version": "3.14.0",
    "tilejson": "2.1.0",
    "generator": "StarTel Inc.",
    "planettime": "",
    "attribution": "All Rights Reserved © StarTel Inc.",
    "description": "",
    "pixel_scale": 256,
    "crs": "EPSG:4326",
    "crs_wkt": "",
    "tiles": [
        "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/tile/{z}/{y}/{x}.pbf?key={key}"
    ],
    "vector_layers": [
        {
            "id": "gis_geo_aoi",
            "minzoom": 10,
            "maxzoom": 24,
            "description": null,
            "fields": {
                "name": "String",
                "cityname": "String",
                "type": "String",
                "type1": "String"
            }
        },
        {
            "id": "gis_geo_buildings",
```

> 示例响应共 616 行，此处省略其后 571 行示例数据；字段结构以本节说明为准。

## 矢量字体 ( Vector Tile Font)

### 接口介绍

| 项       | 值                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf 或者 http(s)://ip:port/tianjing-server/resources-api/glyphs/fonts/{fontstack}/{range}.pbf |
| 请求方式 | GET                                                                                                                                                                                                                                  |
| 服务描述 | 该地址返回 pbf 格式的矢量字体文件。                                                                                                                                                                                                  |

### 参数说明

| 参数        | 类型   | 位置           | 说明                                   |
| ----------- | ------ | -------------- | -------------------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选                     |
| serviceName | string | 路径参数       | 服务名称，必选                         |
| fontstack   | string | 路径参数       | 字体名称，多个字体名称用逗号分隔，必选 |
| range       | string | 路径参数       | 字符范围，必选                         |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选                   |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 pbf               |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/resources/fonts/Roboto%20Regular/0-255.pbf?key={key} 或者 http://ip:port/tianjing-server/resources-api/glyphs/fonts/Roboto%20Regular/0-255.pbf?key={key}

接口返回示例：

## 精灵图标( Vector Tile Sprite)

### 接口介绍

| 项       | 值                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/resources/sprites/sprite.json 或者 http(s)://ip:port/tianjing-server/resources-api/icons/{iconSet}/sprites.json |
| 请求方式 | GET                                                                                                                                                                                                                |
| 服务描述 | 该地址返回矢量切片服务引用的精灵图标集合。                                                                                                                                                                         |

### 参数说明

| 参数        | 类型   | 位置           | 说明                           |
| ----------- | ------ | -------------- | ------------------------------ |
| folderName  | string | 路径参数       | 服务目录名称，可选             |
| serviceName | string | 路径参数       | 服务名称，必选                 |
| iconSet     | string | 路径参数       | 图标集名称，默认 default，必选 |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选           |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 pbf       |

### 数据返回 JSON 报文格式

```json
{
    "iconName": {
        "x": <x>,
        "y": <y>,
        "width": <width>,
        "height": <height>,
        "pixelRatio": <pixelRatio>,
        "sdf": <true>|<false>
    },
    ...
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/resources/sprites?key={key} 或者 http://ip:port/tianjing-server/resources-api/icons/default/sprites.json?key={key}

### 服务样例

| 参数        | 值               | 备注 | 必填 |
| ----------- | ---------------- | ---- | ---- |
| folderName  | vct-shanxi       |      | 是   |
| serviceName | VectorTileServer |      | 是   |
| iconSet     | default          |      | 是   |
| key         |                  |      |      |
| f           |                  |      |      |

接口返回示例：

```json
{
  "POI_code_1002301": {
    "x": 0,
    "y": 0,
    "width": 84,
    "height": 84,
    "pixelRatio": 1,
    "sdf": false
  },
  "POI_code_1002212": {
    "x": 84,
    "y": 0,
    "width": 66,
    "height": 61,
    "pixelRatio": 1,
    "sdf": false
  },
  "POI_code_1002125": {
    "x": 150,
    "y": 0,
    "width": 66,
    "height": 61,
    "pixelRatio": 1,
    "sdf": false
  }
}
```

## 地图服务图层列表(Vector Tile Service Layers)

### 接口介绍

| 项       | 值                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/layers        |
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
            "type": "Vector Tile Layer",
            "geometryType": null,
            "capabilities": "Query",
            "supportedQueryFormats": "JSON,AMF",
            "allowGeometryUpdates": true,
            "defaultVisibility": true,
            "isDataVersioned": false,
            "currentVersion": 10.2,
            "maxRecordCount": -1,
            "objectIdField": "OBJECTID",
            "globalIdFieldName": "",
            "extent": {...},
            "fields": [
                {
                    "name": "resid",
                    "type": "string"
                },
                ...
            ],
            "drawingInfo": {...}
        },
    ...
    ],
    "tables": []
}
```

### 请求样例

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

## 地图图层详情(Vector Tile Service Layer Detail)

### 接口介绍

| 项       | 值                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/VectorTileServer/<layerId>?key={key} |
| 请求方式 | GET                                                                                                                    |
| 服务描述 | 该接口返回指定图层的名称、几何类型、主键属性名称、数据范围、字段列表等。                                               |

### 参数说明

| 参数        | 类型   | 位置           | 说明                                    |
| ----------- | ------ | -------------- | --------------------------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选                      |
| serviceName | string | 路径参数       | 服务名称，必选                          |
| layerId     | string | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选                    |
| f           | string | URL 或表单参数 | 返回格式，可选，默认 json               |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/VectorTileServer/0?key=552280e3-8cbd-49a1-9d2a-9010045bc492

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

## 地图图层查询(Vector Tile Service Layer Query)

### 接口介绍

| 项       | 值                                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/VectorTileServer/<layerId>/query?key={key}           |
| 请求方式 | GET                                                                                                                                    |
| 服务描述 | 该接口支持对指定图层进行空间和属性条件的联合查询，返回矢量图层符合查询条件的要素记录集合。输出结果支持 restjson、geojson、pbf 等格式。 |

### 参数说明

| 参数                 | 类型   | 位置           | 说明                                                                                                                                                                                                                                                                                      |
| -------------------- | ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| folderName           | string | 路径参数       | 服务目录名称，可选                                                                                                                                                                                                                                                                        |
| serviceName          | string | 路径参数       | 服务名称，必选                                                                                                                                                                                                                                                                            |
| layerId              | string | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID                                                                                                                                                                                                                                                   |
| where                | string | URL 或表单参数 | 查询条件，采用 ECQL 规范的查询条件。ECQL 是 GeoTools 开源的一种类 SQL 规范的查询条件语言。参考以下在线文档： ECQL 参考： https://www.osgeo.cn/geoserver-user-manual/filter/ecql_reference.html ECQL 开源规范： https://github.com/geotools/geotools/blob/main/modules/library/cql/ECQL.md |
| outFields            | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| orderByFields        | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| objectIds            | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| geometry             | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| geometryType         | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| inSR                 | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| spatialRel           | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnGeometry       | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnIdsOnly        | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnCountOnly      | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| returnDistinctValues | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| key                  | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                                                                                                                                      |
| f                    | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson                                                                                                                                                                                                                                           |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/VectorTileServer/1/query?where=CNTRY_NAME='China'andADMIN_NAME='Hubei'&outFields=*&f=geojson&key=552280e3-8cbd-49a1-9d2a-9010045bc492

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
    JSON 格式：
    {
    "TianjingServerVersion": "3.0",
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    114.27900363412093,
                    30.57300007950235
                ]
            },
            "properties": {
```

> 示例响应共 92 行，此处省略其后 47 行示例数据；字段结构以本节说明为准。

## 地图图层查询矢量切片(Vector Tile Service Layer Query Tile)

### 接口介绍

| 项       | 值                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/VectorTileServer/<layerId>/tile/<z>/<y>/<x>?key={key} |
| 请求方式 | GET                                                                                                                                     |
| 服务描述 | 该接口支持对指定图层进行空间和属性条件的联合查询，返回矢量图层符合查询条件的要素记录集合。输出结果支持 restjson、geojson、pbf 等格式。  |

### 参数说明

| 参数          | 类型   | 位置           | 说明                                                                                                                                                                                                                                                                                      |
| ------------- | ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| folderName    | string | 路径参数       | 服务目录名称，可选                                                                                                                                                                                                                                                                        |
| serviceName   | string | 路径参数       | 服务名称，必选                                                                                                                                                                                                                                                                            |
| layerId       | string | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID                                                                                                                                                                                                                                                   |
| where         | string | URL 或表单参数 | 查询条件，采用 ECQL 规范的查询条件。ECQL 是 GeoTools 开源的一种类 SQL 规范的查询条件语言。参考以下在线文档： ECQL 参考： https://www.osgeo.cn/geoserver-user-manual/filter/ecql_reference.html ECQL 开源规范： https://github.com/geotools/geotools/blob/main/modules/library/cql/ECQL.md |
| outFields     | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| orderByFields | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| objectIds     | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| geometry      | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| inSR          | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| spatialRel    | string | URL 或表单参数 |                                                                                                                                                                                                                                                                                           |
| key           | string | URL 或表单参数 | 开发者应用密钥，必选                                                                                                                                                                                                                                                                      |
| f             | string | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson                                                                                                                                                                                                                                           |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/world/VectorTileServer/1/query?where=CNTRY_NAME='China'andADMIN_NAME='Hubei'&outFields=*&f=geojson&key=552280e3-8cbd-49a1-9d2a-9010045bc492

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

| 项       | 值                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/VectorTileServer/<layerId>/<featureId>?key={key} |
| 请求方式 | GET                                                                                                                                |
| 服务描述 |                                                                                                                                    |

### 参数说明

| 参数                 | 类型    | 位置           | 说明                                            |
| -------------------- | ------- | -------------- | ----------------------------------------------- |
| folderName           | string  | 路径参数       | 服务目录名称，可选                              |
| serviceName          | string  | 路径参数       | 服务名称，必选                                  |
| layerId              | int     | 路径参数       | 图层 ID，必选，整数，从 0 起编的图层 ID         |
| where                | string  | URL 或表单参数 |                                                 |
| outFields            | string  | URL 或表单参数 |                                                 |
| orderByFields        | string  | URL 或表单参数 |                                                 |
| objectIds            | string  | URL 或表单参数 |                                                 |
| geometry             | string  | URL 或表单参数 |                                                 |
| geometryType         | string  | URL 或表单参数 |                                                 |
| inSR                 | int     | URL 或表单参数 |                                                 |
| spatialRel           | boolean | URL 或表单参数 |                                                 |
| returnGeometry       | boolean | URL 或表单参数 |                                                 |
| returnIdsOnly        | boolean | URL 或表单参数 |                                                 |
| returnCountOnly      | boolean | URL 或表单参数 |                                                 |
| returnDistinctValues | boolean | URL 或表单参数 |                                                 |
| key                  | string  | URL 或表单参数 | 开发者应用密钥，必选                            |
| f                    | string  | URL 或表单参数 | 返回格式，可选，默认 json，枚举值：json/geojson |

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

## 矢量切片服务列表(Vector Tile Services)

### 接口介绍

| 项       | 值                                                                                 |
| -------- | ---------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/VectorTileServers?key={key} |
| 请求方式 | GET、POST                                                                          |
| 服务描述 | 获取可用的切片服务列表。                                                           |

### 参数说明

| 参数 | 类型   | 位置           | 说明                      |
| ---- | ------ | -------------- | ------------------------- |
| key  | string | URL 或表单参数 | 开发者应用密钥，必选      |
| f    | string | URL 或表单参数 | 返回格式，可选，默认 json |

### 数据返回 JSON 报文格式

```json
{
    "TianjingServerVersion": "3.0",
    "services": [
        {
            "name": "<name>",
            "chname": "<chname>",
            "catagory": "<catagory>",
            "description": "<description>",
            "type": "VectorTileServer",
            "url": "<resource uri>",
            "fullUrl": "<full http url>",
            "thumb": "<thumb image url>",
            "useTile": false
        },
    ...
    ]
}
```

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/VectorTileServers?key={key}

### 服务样例

| 参数 | 值  | 备注 | 必填 |
| ---- | --- | ---- | ---- |
| key  |     |      |      |
| f    |     |      |      |

接口返回示例：

```json
{
    "TianjingServerVersion": "3.0",
    "services": [
        {
            "name": "vct-world",
            "chname": "世界矢量切片",
            "catagory": "数据服务",
            "description": "world vector tiles",
            "type": "VectorTileServer",
            "url": "vct-world",
            "fullUrl": "http://ip:port/tianjing-server/mapdata-api/services/vct-world/VectorTileServer?key={key}",
            "thumb": "http://ip:port/tianjing-server/mapdata-api/services/vct-world/VectorTileServer/thumb?key={key}",
            "useTile": false
        },
        {
            "name": "vct-shanxi",
            "chname": "陕西省电子地图矢量切片",
            "catagory": "数据服务",
            "description": "anshun basemap vector tiles",
            "type": "VectorTileServer",
            "url": "vct-shanxi",
            "fullUrl": "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer?key={key}",
            "thumb": "http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/thumb?key={key}",
            "useTile": false
        },
        {
            "name": "vct-chongqing-test",
            "chname": "重庆市电子地图矢量切片",
            "catagory": "数据服务",
            "description": "chognqing basemap vector tiles",
            "type": "VectorTileServer",
            "url": "vct-chongqing-test",
            "fullUrl": "http://ip:port/tianjing-server/mapdata-api/services/vct-chongqing-test/VectorTileServer?key={key}",
            "thumb": "http://ip:port/tianjing-server/mapdata-api/services/vct-chongqing-test/VectorTileServer/thumb?key={key}",
            "useTile": false
        },
        {
            "name": "vct-stdaddr",
            "chname": "标准地址矢量切片",
            "catagory": "数据服务",
            "description": "stdaddr vector tiles",
            "type": "VectorTileServer",
            "url": "stdaddr",
            "fullUrl": "http://ip:port/tianjing-server/mapdata-api/services/stdaddr/VectorTileServer?key={key}",
            "thumb": "http://ip:port/tianjing-server/mapdata-api/services/stdaddr/VectorTileServer/thumb?key={key}",
```

> 示例响应共 106 行，此处省略其后 61 行示例数据；字段结构以本节说明为准。

## 矢量切片服务缩略图(Vector Tile Thumb)

### 接口介绍

| 项       | 值                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/VectorTileServer/thumb?key={key} |
| 请求方式 | GET                                                                                                                |
| 服务描述 | 该地址返回矢量切片服务的缩略图片。                                                                                 |

### 参数说明

| 参数        | 类型   | 位置           | 说明                 |
| ----------- | ------ | -------------- | -------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选   |
| serviceName | string | 路径参数       | 服务名称，必选       |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选 |

### 数据返回 JSON 报文格式

### 请求样例

http://ip:port/tianjing-server/mapdata-api/services/vct-shanxi/VectorTileServer/thumb?key={key}

## 注意事项与已知文档问题

- 文档中「矢量切片服务」「矢量切片默认样式」两处接口地址把 `services` 误拼为 `servicess`、并多写了一个 `>`（原文 `servicess/<folderName>>/<serviceName>`），此处已修正。
- 「地图图层查询矢量切片」的接口地址多写了一个 `>`（原文 `<x>>?key=`），此处已修正。
- 「矢量切片 TilesJSON」的接口地址在 `<folderName>` 与 `<serviceName>` 之间多了一条斜杠（原文 `<folderName>//<serviceName>`），此处已修正。
- 「要素记录详情」小节没有「接口介绍」表；文档给出的接口地址串错了路径段（原文 `{folderName}//MapServer/<layerId>//<featureId>`），此处按同级小节的形式补为 `{folderName}/{serviceName}/VectorTileServer/<layerId>/<featureId>`。
- 「矢量字体」的返回示例中 `sprite` 字段的地址粘连了路径（原文 `VectorTileServerresources/sprites`），应为 `VectorTileServer/resources/sprites`。
- `folderName` 为可选、`serviceName` 为必选。
