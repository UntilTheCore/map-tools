# 3D 地形切片服务（Cesium 3D Terrain Tile Service）

## 接口介绍

| 项       | 值                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/CesiumTerrainTileServer/tile/{z}/{x}/{y}.terrain |
| 请求方式 | GET                                                                                                                                |
| 服务描述 | 该接口返回三角地形切片服务                                                                                                         |

## 参数说明

| 参数        | 类型   | 位置           | 说明                 |
| ----------- | ------ | -------------- | -------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选   |
| serviceName | string | 路径参数       | 服务名称，必选       |
| z           | int    | 路径参数       |                      |
| x           | int    | 路径参数       |                      |
| y           | int    | 路径参数       |                      |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选 |

## 注意事项与已知文档问题

- 该接口只返回地形切片服务地址，渲染由 Cesium 侧完成。
